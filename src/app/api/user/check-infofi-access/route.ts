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

    // 获取当前用户信息，包括平台ID
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        aiScore: true,
        platformId: true,
        name: true,
        twitterUsername: true
      }
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 计算用户在AI评分排行榜中的排名
    const higherScoreCount = await prisma.user.count({
      where: {
        aiScore: {
          gt: currentUser.aiScore || 0
        }
      }
    });
    
    const userRank = higherScoreCount + 1;
    
    // 只有前1000名用户才能访问InfoFi
    const TOP_USERS_LIMIT = 1000;
    const hasAccess = userRank <= TOP_USERS_LIMIT;
    
    let message = '';
    if (hasAccess) {
      message = `🎉 Congratulations! You are ranked #${userRank} and have access to InfoFi Elite!`;
    } else {
      message = `You are currently ranked #${userRank}. InfoFi Elite is only available to top ${TOP_USERS_LIMIT} users. Keep improving your AI score!`;
    }

    return NextResponse.json({
      hasAccess,
      userRank,
      currentScore: currentUser.aiScore || 0,
      platformId: currentUser.platformId,
      topUsersLimit: TOP_USERS_LIMIT,
      requirement: `Must be in top ${TOP_USERS_LIMIT} users by AI Score`,
      message
    });

  } catch (error) {
    console.error('Error checking InfoFi access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 