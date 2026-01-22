export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { getTwitterUserInfo } from '@/lib/twitter-api'

export async function GET() {
  try {
    // Check if user is logged in
    const session = await getServerSession(authOptions)
    if (!session?.user?.twitterId) {
      return NextResponse.json({
        success: false,
        error: 'Not logged in or missing Twitter ID',
        details: {
          hasSession: !!session,
          hasUser: !!session?.user,
          hasTwitterId: !!session?.user?.twitterId,
        }
      }, { status: 401 })
    }

    // Get user information
    const user = await prisma.user.findUnique({
      where: { twitterId: session.user.twitterId },
      select: {
        id: true,
        platformId: true,
        twitterId: true,
        username: true,
        name: true,
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
        createdAt: true,
        updatedAt: true,
      }
    })

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User record not found',
        twitterId: session.user.twitterId,
      }, { status: 404 })
    }

    // Test access token
    let twitterApiTest = null
    if (user.accessToken) {
      twitterApiTest = await getTwitterUserInfo(user.accessToken)
    }

    // Return diagnostic information
    return NextResponse.json({
      success: true,
      message: 'Authorization status check completed',
      data: {
        user: {
          platformId: user.platformId,
          twitterId: user.twitterId,
          username: user.username,
          displayName: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        tokens: {
          hasAccessToken: !!user.accessToken,
          hasRefreshToken: !!user.refreshToken,
          tokenExpiresAt: user.tokenExpiresAt,
        },
        twitterApi: {
          accessTokenValid: !!twitterApiTest,
          userInfo: twitterApiTest ? {
            id: twitterApiTest.id,
            username: twitterApiTest.username,
            name: twitterApiTest.name,
            verified: twitterApiTest.verified,
            verified_type: twitterApiTest.verified_type,
            public_metrics: twitterApiTest.public_metrics,
          } : null,
        },
        environment: {
          hasClientId: !!process.env.TWITTER_CLIENT_ID,
          hasClientSecret: !!process.env.TWITTER_CLIENT_SECRET,
          nodeEnv: process.env.NODE_ENV,
        }
      }
    })

  } catch (error) {
    console.error('Twitter authorization test failed:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 