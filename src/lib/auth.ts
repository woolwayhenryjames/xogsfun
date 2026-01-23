import { NextAuthOptions } from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import { prisma, getNextPlatformId, checkDatabaseConnection } from "@/lib/database"
import { getTwitterUserInfo, normalizeTwitterUserData } from "@/lib/twitter-api"
import { autoUpdateUserAIScore } from "@/lib/aiScore"

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || "placeholder_client_id",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "placeholder_client_secret",
      version: "2.0",
      authorization: {
        url: "https://twitter.com/i/oauth2/authorize",
        params: {
          scope: "tweet.read tweet.write users.read follows.read offline.access",
        },
      },
      userinfo: {
        url: "https://api.twitter.com/2/users/me",
        params: {
          "user.fields": "created_at,description,location,url,verified,verified_type,public_metrics,profile_image_url",
        },
      },

    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      // SignIn callback processing

      if (account?.provider !== "twitter") {
        console.error("Invalid provider")
        return false
      }

      try {
        // Check database connection
        const isDbConnected = await checkDatabaseConnection()
        if (!isDbConnected) {
          console.warn("Database connection failed, but login allowed")
          return true
        }

        const twitterId = (profile as any)?.id || user.id
        const username = (profile as any)?.username || user.name
        const displayName = (profile as any)?.name || user.name
        const avatarUrl = (profile as any)?.profile_image_url || user.image

        // Try to get detailed Twitter information
        let detailedData = null
        if (account.access_token) {
          detailedData = await getTwitterUserInfo(account.access_token)
        }

        // Find existing user
        const existingUser = await prisma.user.findUnique({
          where: { twitterId }
        })

        const userData = {
          username: detailedData?.username || username,
          name: detailedData?.name || displayName,
          profileImageUrl: detailedData?.profile_image_url || avatarUrl,
          followersCount: detailedData?.public_metrics?.followers_count || 0,
          friendsCount: detailedData?.public_metrics?.following_count || 0,
          statusesCount: detailedData?.public_metrics?.tweet_count || 0,
          verified: detailedData?.verified || detailedData?.verified_type === 'blue' || false,
          description: detailedData?.description,
          location: detailedData?.location,
          url: detailedData?.url,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          tokenExpiresAt: account.expires_at ? new Date(account.expires_at * 1000) : null,
          updatedAt: new Date(),
        }

        if (existingUser) {
          // Update existing user information
          await prisma.user.update({
            where: { twitterId },
            data: userData
          })
          // User information updated

          // Auto-update AI score
          try {
            const aiScore = await autoUpdateUserAIScore(existingUser.id, {
              followersCount: userData.followersCount,
              friendsCount: userData.friendsCount,
              statusesCount: userData.statusesCount,
              verified: userData.verified,
              twitterCreatedAt: detailedData?.created_at ? new Date(detailedData.created_at) : existingUser.twitterCreatedAt,
            });
            // AI score auto-updated
          } catch (error) {
            console.error('Auto-update AI score failed during login:', error);
          }
        } else {
          // Create new user
          const platformId = await getNextPlatformId()

          const newUser = await prisma.user.create({
            data: {
              id: user.id,
              platformId,
              twitterId,
              twitterCreatedAt: detailedData?.created_at ? new Date(detailedData.created_at) : null,
              ...userData
            }
          })
          // New user created

          // Auto-calculate AI score for new users
          try {
            const aiScore = await autoUpdateUserAIScore(newUser.id, {
              followersCount: userData.followersCount,
              friendsCount: userData.friendsCount,
              statusesCount: userData.statusesCount,
              verified: userData.verified,
              twitterCreatedAt: detailedData?.created_at ? new Date(detailedData.created_at) : null,
            });
            // New user AI score auto-calculated
          } catch (error) {
            console.error('New user AI score calculation failed:', error);
          }
        }

        return true
      } catch (error) {
        console.error("SignIn callback processing failed:", error)
        return true
      }
    },

    async jwt({ token, user, account, profile }) {
      // Save user info to token on first login
      if (user) {
        token.id = user.id
        token.twitterId = (profile as any)?.id || user.id
        token.username = (profile as any)?.username || user.name
        token.name = user.name
        token.image = user.image
      }

      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.image = token.image as string

        // Get complete user information from database
        try {
          const isDbConnected = await checkDatabaseConnection()
          if (isDbConnected && token.twitterId) {
            const dbUser = await prisma.user.findUnique({
              where: { twitterId: token.twitterId as string }
            })

            if (dbUser) {
              session.user = {
                ...session.user,
                platformId: dbUser.platformId,
                twitterId: dbUser.twitterId,
                username: dbUser.username || '',
                displayName: dbUser.name || '',
                avatarUrl: dbUser.profileImageUrl,
                followerCount: dbUser.followersCount || 0,
                followingCount: dbUser.friendsCount || 0,
                tweetCount: dbUser.statusesCount || 0,
                isVerified: dbUser.verified || false,
                twitterCreatedAt: dbUser.twitterCreatedAt,
                bio: dbUser.description,
                location: dbUser.location,
                website: dbUser.url,
                accessToken: dbUser.accessToken,
                refreshToken: dbUser.refreshToken,
                tokenExpiresAt: dbUser.tokenExpiresAt,
              }
            }
          }
        } catch (error) {
          console.error("Failed to get database user information:", error)
        }
      }

      return session
    },
  },

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  debug: false,

  logger: {
    error(code, metadata) {
      console.error("NextAuth Error:", code, metadata)
    },
    warn(code) {
      console.warn("NextAuth Warning:", code)
    },
    debug(code, metadata) {
      // Debug disabled for production
    },
  },
} 