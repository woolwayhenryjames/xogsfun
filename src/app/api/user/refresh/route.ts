export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, checkDatabaseConnection } from '@/lib/database'
import { getTwitterUserInfo, normalizeTwitterUserData } from '@/lib/twitter-api'

export async function POST() {
  try {
    // 检查用户是否已登录
    const session = await getServerSession(authOptions)
    if (!session?.user?.twitterId) {
      return NextResponse.json(
        { error: '未登录或缺少Twitter ID' },
        { status: 401 }
      )
    }

    // 检查数据库连接
    const isDbConnected = await checkDatabaseConnection()
    if (!isDbConnected) {
      return NextResponse.json(
        { error: '数据库连接失败' },
        { status: 500 }
      )
    }

    // 获取用户的访问令牌
    const user = await prisma.user.findUnique({
      where: { twitterId: session.user.twitterId }
    })

    if (!user || !user.accessToken) {
      return NextResponse.json(
        { error: '找不到用户或访问令牌' },
        { status: 404 }
      )
    }

    // 调用Twitter API获取最新信息
    const twitterData = await getTwitterUserInfo(user.accessToken)
    if (!twitterData) {
      return NextResponse.json(
        { error: '获取Twitter用户信息失败' },
        { status: 500 }
      )
    }

    // 更新数据库中的用户信息
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        username: twitterData.username,
        name: twitterData.name,
        profileImageUrl: twitterData.profile_image_url,
        followersCount: twitterData.public_metrics?.followers_count,
        friendsCount: twitterData.public_metrics?.following_count,
        statusesCount: twitterData.public_metrics?.tweet_count,
        verified: twitterData.verified || twitterData.verified_type === 'blue',
        description: twitterData.description,
        location: twitterData.location,
        url: twitterData.url,
        image: twitterData.profile_image_url,
        updatedAt: new Date(),
      }
    })

    return NextResponse.json({
      success: true,
      message: '用户信息已更新',
      user: {
        platformId: updatedUser.platformId,
        twitterId: updatedUser.twitterId,
        username: updatedUser.username,
        displayName: updatedUser.name,
        avatarUrl: updatedUser.profileImageUrl,
        followerCount: updatedUser.followersCount,
        followingCount: updatedUser.friendsCount,
        tweetCount: updatedUser.statusesCount,
        isVerified: updatedUser.verified,
        bio: updatedUser.description,
        location: updatedUser.location,
        website: updatedUser.url,
        updatedAt: updatedUser.updatedAt,
      }
    })

  } catch (error) {
    console.error('刷新用户信息失败:', error)
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    )
  }
} 