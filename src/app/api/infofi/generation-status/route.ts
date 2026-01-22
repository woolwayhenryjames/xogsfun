import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查每日生成次数和月度发布次数使用情况（UTC时间）
    const today = new Date();
    const startOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const endOfDay = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    // 统计今日生成次数
    const todayGenerations = await prisma.tweet.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    });

    // 统计本月发布次数
    const monthlyPublications = await prisma.tweet.count({
      where: {
        userId: session.user.id,
        status: 'published',
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      }
    });

    const DAILY_GENERATION_LIMIT = 3;
    const MONTHLY_PUBLICATION_LIMIT = 1;
    
    // 计算下次重置时间
    const nextMidnight = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    const hoursUntilReset = Math.ceil((nextMidnight.getTime() - today.getTime()) / (1000 * 60 * 60));
    const nextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const daysUntilReset = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      // 生成状态 - 每日限制3次
      usedGenerations: todayGenerations,
      maxGenerations: DAILY_GENERATION_LIMIT,
      remainingGenerations: Math.max(0, DAILY_GENERATION_LIMIT - todayGenerations),
      canGenerate: todayGenerations < DAILY_GENERATION_LIMIT,
      
      // 发布状态 - 每月限制1次
      usedPublications: monthlyPublications,
      maxPublications: MONTHLY_PUBLICATION_LIMIT,
      remainingPublications: Math.max(0, MONTHLY_PUBLICATION_LIMIT - monthlyPublications),
      canPublish: monthlyPublications < MONTHLY_PUBLICATION_LIMIT,
      
      // 重置信息
      hoursUntilReset,
      daysUntilReset,
      resetTime: nextMidnight.toISOString(),
      monthlyResetTime: nextMonth.toISOString(),
      resetType: 'daily_generation_monthly_publication',
      
      // 今日/本月统计
      todayStats: {
        generated: todayGenerations,
        maxGenerations: DAILY_GENERATION_LIMIT
      },
      monthlyStats: {
        published: monthlyPublications,
        maxPublications: MONTHLY_PUBLICATION_LIMIT
      },
      
      // Elite功能说明
      eliteFeatures: {
        dailyGeneration: 3,
        monthlyPublication: 1,
        enhancedRewards: true,
        rewardMultiplier: 5
      }
    });

  } catch (error) {
    console.error('Error getting generation status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 