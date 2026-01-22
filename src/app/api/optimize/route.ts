export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 直接获取合并数据
    const [userData, leaderboardData] = await Promise.all([
      // 获取用户数据
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          id: true,
          name: true,
          username: true,
          twitterUsername: true,
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
      }),
      // 获取排行榜数据（前10名）
      prisma.user.findMany({
        take: 10,
        orderBy: [
          { aiScore: 'desc' },
          { xogsBalance: 'desc' }
        ],
        select: {
          id: true,
          name: true,
          twitterUsername: true,
          image: true,
          profileImageUrl: true,
          aiScore: true,
          xogsBalance: true,
          verified: true,
        },
      })
    ]);

    const data = {
      user: userData,
      leaderboard: leaderboardData
    };

    if (!data.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching combined data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 