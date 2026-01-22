export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { refreshTwitterToken } from '@/lib/twitter-api';

// 与update-followers.ts中相同的变量（在实际应用中应该使用Redis等共享存储）
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15分钟窗口
const MAX_CALLS_PER_WINDOW = 5; // 每15分钟最多5次调用

// 模拟的用户API调用计数（在实际应用中应该使用数据库或Redis）
const userApiCalls = new Map<string, { count: number; windowStart: number }>();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的Twitter token信息
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
        twitterId: true,
        twitterUsername: true
      }
    });

    // 检查token状态
    const hasAccessToken = !!user?.accessToken;
    const tokenExpired = user?.tokenExpiresAt ? new Date() > user.tokenExpiresAt : false;
    let canTweet = hasAccessToken;
    let needsReconnect = false;

    // 如果 token 过期且有 refresh token，尝试刷新
    if (tokenExpired && user?.refreshToken) {
      try {
        const newTokens = await refreshTwitterToken(user.refreshToken);
        if (newTokens) {
          // 更新数据库中的 token
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              tokenExpiresAt: newTokens.expiresAt
            }
          });
          canTweet = true;
          needsReconnect = false;
        } else {
          canTweet = false;
          needsReconnect = true;
        }
      } catch (error) {
        console.error('Failed to refresh Twitter token:', error);
        canTweet = false;
        needsReconnect = true;
      }
    } else if (tokenExpired) {
      canTweet = false;
      needsReconnect = true;
    }

    // 计算速率限制状态
    const now = Date.now();
    const userCalls = userApiCalls.get(session.user.id);
    
    let callsRemaining = MAX_CALLS_PER_WINDOW;
    let windowResetTime = now + RATE_LIMIT_WINDOW;
    let canUpdate = true;

    if (userCalls) {
      if (now - userCalls.windowStart <= RATE_LIMIT_WINDOW) {
        // 在当前窗口内
        callsRemaining = Math.max(0, MAX_CALLS_PER_WINDOW - userCalls.count);
        windowResetTime = userCalls.windowStart + RATE_LIMIT_WINDOW;
        canUpdate = callsRemaining > 0;
      } else {
        // 新窗口，重置计数
        callsRemaining = MAX_CALLS_PER_WINDOW;
        windowResetTime = now + RATE_LIMIT_WINDOW;
        canUpdate = true;
      }
    }

    const timeUntilReset = Math.max(0, windowResetTime - now);

    return NextResponse.json({
      // Twitter token状态
      twitterToken: {
        hasAccessToken,
        tokenExpired,
        canTweet,
        tokenExpiresAt: user?.tokenExpiresAt,
        needsReconnect
      },
      // 速率限制状态
      rateLimit: {
        canUpdate,
        callsRemaining,
        maxCallsPerWindow: MAX_CALLS_PER_WINDOW,
        windowDurationMinutes: RATE_LIMIT_WINDOW / 1000 / 60,
        timeUntilResetMinutes: Math.ceil(timeUntilReset / 1000 / 60),
        timeUntilResetSeconds: Math.ceil(timeUntilReset / 1000),
      }
    });

  } catch (error) {
    console.error('Error checking Twitter status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 