import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的 platformId
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { platformId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 使用 platformId 作为邀请码
    const inviteCode = user.platformId.toString();
    
    // 随机选择域名
    const domains = [
      'https://x.hmvy.com',
      'https://x.ptvu.com', 
      'https://x.mdvu.com'
    ];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const inviteLink = `${randomDomain}/invite/${inviteCode}`;

    return NextResponse.json({
      inviteCode,
      inviteLink,
      message: 'Invite code generated successfully'
    });

  } catch (error) {
    console.error('Error generating invite code:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 