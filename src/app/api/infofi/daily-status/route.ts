export const dynamic = 'force-dynamic'
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

    // Get user's AI score
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiScore: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has used InfoFi this month (UTC)
    const today = new Date();
    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    const monthlyTweet = await prisma.tweet.findFirst({
      where: {
        userId: session.user.id,
        status: 'published',
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      },
      select: {
        id: true,
        createdAt: true,
        rewardAmount: true,
        tweetUrl: true
      }
    });

    const hasUsedThisMonth = !!monthlyTweet;
    const expectedReward = user.aiScore * 5; // InfoFi Elite 5x multiplier
    
    // Calculate time until reset (next month)
    const nextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
    const daysUntilReset = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return NextResponse.json({
      hasUsedThisMonth,
      canUseThisMonth: !hasUsedThisMonth,
      expectedReward,
      daysUntilReset,
      monthlyTweet: monthlyTweet ? {
        id: monthlyTweet.id,
        publishedAt: monthlyTweet.createdAt,
        rewardEarned: monthlyTweet.rewardAmount || 0,
        tweetUrl: monthlyTweet.tweetUrl
      } : null,
      userAiScore: user.aiScore,
      resetTime: nextMonth.toISOString(),
      resetType: 'monthly',
      eliteMultiplier: 5
    });

  } catch (error) {
    console.error('Error checking daily status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 