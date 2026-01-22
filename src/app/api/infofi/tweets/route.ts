export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的推文历史
    const tweets = await prisma.tweet.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50, // 限制返回最近50条
      select: {
        id: true,
        content: true,
        tweetId: true,
        tweetUrl: true,
        sponsor: true,
        status: true,
        createdAt: true,
        publishedAt: true,
        errorMessage: true,
      }
    });

    return NextResponse.json(tweets);

  } catch (error) {
    console.error('Error fetching tweets:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 