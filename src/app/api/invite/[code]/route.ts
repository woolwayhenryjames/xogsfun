import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const platformIdStr = params.code;

    if (!platformIdStr) {
      return NextResponse.json({ error: 'Platform ID is required' }, { status: 400 });
    }

    // 将字符串转换为数字
    const platformId = parseInt(platformIdStr, 10);
    
    if (isNaN(platformId)) {
      return NextResponse.json({ error: 'Invalid invitation code format' }, { status: 400 });
    }

    // 查找拥有此 platformId 的用户
    const inviter = await prisma.user.findUnique({
      where: { platformId },
      select: {
        id: true,
        name: true,
        username: true,
        twitterUsername: true,
        image: true,
        profileImageUrl: true,
      }
    });

    if (!inviter) {
      return NextResponse.json({ error: 'Invitation code does not exist or has expired' }, { status: 404 });
    }

    // 优先使用 twitterUsername，如果没有则使用 username
    const displayUsername = inviter.twitterUsername || inviter.username || '';
    // 确保用户名格式正确（不重复添加@符号）
    const formattedUsername = displayUsername.startsWith('@') 
      ? displayUsername.slice(1) 
      : displayUsername;

    // 优先使用 profileImageUrl，如果没有则使用 image
    const avatarUrl = inviter.profileImageUrl || inviter.image;

    return NextResponse.json({
      inviter: {
        name: inviter.name || 'Unknown User',
        twitterUsername: formattedUsername,
        image: avatarUrl,
      }
    });

  } catch (error) {
    console.error('Error fetching inviter info:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 