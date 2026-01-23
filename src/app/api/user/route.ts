// Removed for Prisma compatibility
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

    // 直接获取用户数据
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户当前数据，不进行任何修改
    const user = await prisma.user.findUnique({
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

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 