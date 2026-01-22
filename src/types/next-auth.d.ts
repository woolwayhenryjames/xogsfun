import { DefaultSession, DefaultUser } from "next-auth"
import { JWT, DefaultJWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string
      platformId: number
      twitterId: string
      username: string
      displayName: string
      avatarUrl?: string | null
      followerCount: number
      followingCount: number
      tweetCount: number
      isVerified: boolean
      twitterCreatedAt?: Date | null
      bio?: string | null
      location?: string | null
      website?: string | null
      accessToken?: string | null
      refreshToken?: string | null
      tokenExpiresAt?: Date | null
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    platformId: number
    twitterId: string
    username: string
    displayName: string
    avatarUrl?: string | null
    followerCount: number
    followingCount: number
    tweetCount: number
    isVerified: boolean
    twitterCreatedAt?: Date | null
    bio?: string | null
    location?: string | null
    website?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string
    platformId: number
    twitterId: string
    username: string
    displayName: string
    avatarUrl?: string | null
    followerCount: number
    followingCount: number
    tweetCount: number
    isVerified: boolean
    twitterCreatedAt?: Date | null
    bio?: string | null
    location?: string | null
    website?: string | null
    accessToken?: string | null
    refreshToken?: string | null
    tokenExpiresAt?: Date | null
  }
}

export interface TwitterUserData {
  id: string
  username: string
  name: string
  profile_image_url?: string
  description?: string
  location?: string
  url?: string
  verified?: boolean
  verified_type?: string
  created_at?: string
  public_metrics?: {
    followers_count: number
    following_count: number
    tweet_count: number
    listed_count: number
  }
} 