import axios from 'axios'
import { TwitterUserData } from '@/types/next-auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Get detailed Twitter user information using Bearer Token
 * @param accessToken Twitter access token
 * @returns Promise<TwitterUserData | null> Twitter user data
 */
export async function getTwitterUserInfo(accessToken: string, userId?: string, refreshToken?: string): Promise<TwitterUserData | null> {
  try {
    const response = await axios.get('https://api.twitter.com/2/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        'user.fields': 'created_at,description,location,url,verified,verified_type,public_metrics,profile_image_url'
      }
    });

    if (response.data && response.data.data) {
      return response.data.data;
    }
    
    return null;
  } catch (error: any) {
    // 如果是 401 错误且有 refreshToken，尝试刷新 token
    if (error.response?.status === 401 && refreshToken && userId) {
      try {
        const newTokens = await refreshTwitterToken(refreshToken);
        if (newTokens) {
          // 更新数据库中的 token
          await prisma.user.update({
            where: { id: userId },
            data: {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              tokenExpiresAt: newTokens.expiresAt
            }
          });
          
          // 用新 token 重试
          return getTwitterUserInfo(newTokens.accessToken);
        }
      } catch (refreshError) {
        console.error('Failed to refresh Twitter token:', refreshError);
      }
    }
    
    console.error('Failed to get Twitter user info:', error);
    return null;
  }
}

/**
 * Get Twitter user information by username (for supplementary retrieval)
 * @param username Twitter username
 * @param bearerToken Application-level Bearer Token
 * @returns Promise<TwitterUserData | null> Twitter user data
 */
export async function getTwitterUserByUsername(
  username: string, 
  bearerToken: string
): Promise<TwitterUserData | null> {
  try {
    const response = await axios.get(`https://api.twitter.com/2/users/by/username/${username}`, {
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
      params: {
        'user.fields': 'created_at,description,location,url,verified,verified_type,public_metrics,profile_image_url'
      }
    })

    if (response.data && response.data.data) {
      return response.data.data
    }
    
    return null
  } catch (error) {
    console.error('Failed to get Twitter user info by username:', error)
    return null
  }
}

/**
 * Normalize Twitter user data
 * @param twitterData Raw data returned by Twitter API
 * @param accessToken Access token
 * @param refreshToken Refresh token
 * @returns Normalized user data
 */
export function normalizeTwitterUserData(
  twitterData: TwitterUserData,
  accessToken?: string,
  refreshToken?: string,
  tokenExpiresAt?: Date
) {
  // Handle Twitter API v2 authentication status
  const isVerified = twitterData.verified === true || 
                    twitterData.verified_type === 'blue' || 
                    twitterData.verified_type === 'business' ||
                    twitterData.verified_type === 'government'

  return {
    twitterId: twitterData.id,
    username: twitterData.username,
    displayName: twitterData.name,
    avatarUrl: twitterData.profile_image_url || null,
    followerCount: twitterData.public_metrics?.followers_count || 0,
    followingCount: twitterData.public_metrics?.following_count || 0,
    tweetCount: twitterData.public_metrics?.tweet_count || 0,
    isVerified,
    twitterCreatedAt: twitterData.created_at ? new Date(twitterData.created_at) : null,
    bio: twitterData.description || null,
    location: twitterData.location || null,
    website: twitterData.url || null,
    accessToken: accessToken || null,
    refreshToken: refreshToken || null,
    tokenExpiresAt: tokenExpiresAt || null,
    // NextAuth compatible fields
    name: twitterData.name,
    email: null, // Twitter API v2 doesn't return email
    image: twitterData.profile_image_url || null,
  }
}

/**
 * Refresh Twitter access token
 * @param refreshToken Refresh token
 * @returns Promise<{accessToken: string, refreshToken: string, expiresAt: Date} | null>
 */
export async function refreshTwitterToken(refreshToken: string): Promise<{
  accessToken: string
  refreshToken: string
  expiresAt: Date
} | null> {
  try {
    const response = await axios.post('https://api.twitter.com/2/oauth2/token', 
      new URLSearchParams({
        'grant_type': 'refresh_token',
        'refresh_token': refreshToken,
        'client_id': process.env.TWITTER_CLIENT_ID!,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(
            `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
          ).toString('base64')}`,
        },
      }
    )

    if (response.data.access_token) {
      return {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + (response.data.expires_in * 1000))
      }
    }

    return null
  } catch (error) {
    console.error('Failed to refresh Twitter token:', error)
    return null
  }
} 