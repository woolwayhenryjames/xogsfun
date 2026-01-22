import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';
import axios from 'axios';

const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15分钟窗口
const MAX_CALLS_PER_WINDOW = 5; // 每15分钟最多5次调用

// 用户API调用计数
const userApiCalls = new Map<string, { count: number; windowStart: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userCalls = userApiCalls.get(userId);
  
  if (!userCalls) {
    userApiCalls.set(userId, { count: 1, windowStart: now });
    return true;
  }
  
  // 检查是否在同一个时间窗口内
  if (now - userCalls.windowStart > RATE_LIMIT_WINDOW) {
    // 新的时间窗口，重置计数
    userApiCalls.set(userId, { count: 1, windowStart: now });
    return true;
  }
  
  // 在同一窗口内，检查调用次数
  if (userCalls.count >= MAX_CALLS_PER_WINDOW) {
    return false;
  }
  
  userCalls.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查用户级别的速率限制
    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json({
        error: 'Rate limit exceeded. You can only update followers count 5 times per 15 minutes.',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000 / 60) // 分钟
      }, { status: 429 });
    }

    // 获取用户的 Twitter 账号信息
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: 'twitter'
      }
    });

    if (!account?.access_token) {
      return NextResponse.json({ error: 'Twitter account not connected' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user?.twitterUsername) {
      return NextResponse.json({ error: 'Twitter username not found' }, { status: 400 });
    }

    try {
      // 添加延迟避免频繁请求
      await new Promise(resolve => setTimeout(resolve, 500));

    // 获取 Twitter 用户 ID
    const twitterProfile = await axios.get(
      `https://api.twitter.com/2/users/by/username/${user.twitterUsername}`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
          timeout: 10000, // 10秒超时
      }
    );

    const twitterId = twitterProfile.data?.data?.id;
    if (!twitterId) {
      return NextResponse.json({ error: 'Twitter user ID not found' }, { status: 400 });
    }

      // 再次添加延迟
      await new Promise(resolve => setTimeout(resolve, 500));

    // 获取粉丝数
    const userResp = await axios.get(
      `https://api.twitter.com/2/users/${twitterId}?user.fields=public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${account.access_token}`,
        },
          timeout: 10000,
      }
    );

    const followersCount = userResp.data?.data?.public_metrics?.followers_count || 0;

    // 更新数据库
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { followersCount },
      select: {
        id: true,
        name: true,
        twitterUsername: true,
        followersCount: true,
      }
    });

      return NextResponse.json({
        success: true,
        user: updatedUser,
        message: `Followers count updated to ${followersCount}`
      });

    } catch (apiError: any) {
      console.error('Twitter API error:', {
        status: apiError.response?.status,
        message: apiError.message,
        rateLimitRemaining: apiError.response?.headers?.['x-rate-limit-remaining'],
        rateLimitReset: apiError.response?.headers?.['x-rate-limit-reset'],
      });

      if (apiError.response?.status === 429) {
        const resetTime = apiError.response?.headers?.['x-rate-limit-reset'];
        const retryAfter = resetTime ? 
          Math.max(0, parseInt(resetTime) - Math.floor(Date.now() / 1000)) : 900; // 默认15分钟

        return NextResponse.json({
          error: 'Twitter API rate limit reached. Please try again later.',
          retryAfter: Math.ceil(retryAfter / 60), // 转换为分钟
          twitterRateLimit: true
        }, { status: 429 });
      }

      if (apiError.response?.status === 401) {
        return NextResponse.json({
          error: 'Twitter authorization expired. Please sign out and sign in again.',
          needsReauth: true
        }, { status: 401 });
      }

      throw apiError; // 重新抛出其他错误
    }

  } catch (error: any) {
    console.error('Error updating followers count:', error);

    return NextResponse.json({
      error: 'Failed to update followers count',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    }, { status: 500 });
  }
} 