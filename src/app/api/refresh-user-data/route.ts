export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import axios from 'axios';
import { autoUpdateUserAIScore } from '@/lib/aiScore';

// 获取完整Twitter用户信息的函数
async function fetchTwitterUserDetails(twitterId: string, accessToken: string) {
  try {
    const response = await axios.get(
      `https://api.twitter.com/2/users/${twitterId}?user.fields=description,url,location,verified,created_at,lang,public_metrics,profile_image_url`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 15000,
      }
    );
    
    return response.data?.data || {};
  } catch (err: any) {
    console.error('Failed to fetch detailed Twitter user info:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      message: err.message,
      twitterId: twitterId,
    });
    
    throw err;
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户当前数据
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twitterId: true,
        username: true,
        name: true,
      },
    });

    if (!user || !user.twitterId) {
      return NextResponse.json({ error: 'User not found or missing Twitter ID' }, { status: 404 });
    }

    // 由于NextAuth的限制，我们无法直接获取用户的访问令牌来调用Twitter API
    // 因此这个功能暂时只能返回当前数据库中的数据，不进行实际的API调用
    // 如果需要真实的Twitter数据更新，需要重新设计认证流程以保存访问令牌
    
    // 获取用户当前完整数据
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        twitterId: true,
        name: true,
        username: true,
        twitterUsername: true,
        email: true,
        image: true,
        profileImageUrl: true,
        description: true,
        url: true,
        location: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        twitterCreatedAt: true,
        lang: true,
        xogsBalance: true,
        aiScore: true,
        platformId: true,
        inviterId: true,
        inviteCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 自动更新AI评分
    let newAIScore = currentUser.aiScore;
    try {
      newAIScore = await autoUpdateUserAIScore(session.user.id, {
        followersCount: currentUser.followersCount,
        friendsCount: currentUser.friendsCount,
        statusesCount: currentUser.statusesCount,
        verified: currentUser.verified,
        twitterCreatedAt: currentUser.twitterCreatedAt,
      });
      console.log(`用户 ${session.user.id} AI评分自动更新: ${currentUser.aiScore} → ${newAIScore}`);
    } catch (error) {
      console.error('自动更新AI评分失败:', error);
      // 即使AI评分更新失败，也不影响整个刷新流程
    }

    // 更新updatedAt时间戳，表示数据已刷新
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        updatedAt: new Date(),
      },
      select: {
        id: true,
        twitterId: true,
        name: true,
        username: true,
        twitterUsername: true,
        email: true,
        image: true,
        profileImageUrl: true,
        description: true,
        url: true,
        location: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        twitterCreatedAt: true,
        lang: true,
        xogsBalance: true,
        aiScore: true,
        platformId: true,
        inviterId: true,
        inviteCode: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Data refresh completed, AI score automatically updated to ${updatedUser.aiScore} points`,
      user: updatedUser,
      aiScoreUpdated: newAIScore !== currentUser.aiScore,
      oldAIScore: currentUser.aiScore,
      newAIScore: updatedUser.aiScore,
      note: 'Due to technical limitations, real-time data from Twitter cannot be fetched currently. The displayed data is authentic information obtained during login.'
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: 'Failed to refresh user data'
    }, { status: 500 });
  }
} 