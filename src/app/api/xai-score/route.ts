export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface TwitterUser {
  twitterCreatedAt: Date | null;
  verified: boolean | null;
  followersCount: number | null;
  friendsCount: number | null;
  statusesCount: number | null;
  description: string | null;
  profileImageUrl: string | null;
  location: string | null;
  lang: string | null;
}

function calcScore(user: TwitterUser): number {
  let score = 0;
  const now = new Date();
  const createdAt = user.twitterCreatedAt || now;
  const years = (now.getTime() - createdAt.getTime()) / (365 * 24 * 3600 * 1000);

  // Account age
  if (years < 1) score += 2;
  else if (years < 2) score += 5;
  else if (years < 3) score += 8;
  else if (years < 5) score += 12;
  else if (years < 8) score += 16;
  else score += 20;

  // Verification
  if (user.verified) score += 10;

  // Followers
  const followers = user.followersCount || 0;
  if (followers >= 50000) score += 25;
  else if (followers >= 10000) score += 20;
  else if (followers >= 5000) score += 15;
  else if (followers >= 1000) score += 10;
  else if (followers >= 500) score += 5;
  else if (followers >= 100) score += 2;

  // Following
  const friends = user.friendsCount || 0;
  if (friends >= 5000) score += 5;
  else if (friends >= 1000) score += 3;
  else if (friends >= 500) score += 2;
  else if (friends >= 100) score += 1;

  // Tweet count
  const statuses = user.statusesCount || 0;
  if (statuses >= 10000) score += 10;
  else if (statuses >= 5000) score += 8;
  else if (statuses >= 1000) score += 6;
  else if (statuses >= 500) score += 4;
  else if (statuses >= 100) score += 2;

  // Profile completeness
  if (user.description) score += 3;
  if (user.profileImageUrl) score += 3;
  if (user.location) score += 2;
  if (user.lang) score += 2;

  // Random variation (-3 to +3)
  score += Math.floor(Math.random() * 7) - 3;

  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(score)));
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        aiScore: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ score: user.aiScore });
  } catch (error) {
    console.error('Error fetching XAI score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        aiScore: Math.floor(Math.random() * 100), // 模拟新的分数计算
      },
      select: {
        aiScore: true,
      },
    });

    return NextResponse.json({ score: user.aiScore });
  } catch (error) {
    console.error('Error updating XAI score:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 