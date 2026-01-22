import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // 查找用户信息
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        profileImageUrl: true,
        solanaAddress: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 优先使用 profileImageUrl，如果没有则使用 image
    const avatarUrl = user.profileImageUrl || user.image;

    return NextResponse.json({
      id: user.id,
      username: user.username,
      name: user.name,
      image: avatarUrl,
      solanaAddress: user.solanaAddress
    });

  } catch (error) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}