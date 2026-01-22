export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PublicKey } from '@solana/web3.js';

export async function POST(request: NextRequest) {
  try {
    const { solanaAddress, userId } = await request.json();

    console.log('Direct bind request:', { solanaAddress, userId });

    // 验证必需参数
    if (!solanaAddress || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 验证 Solana 地址格式
    try {
      new PublicKey(solanaAddress);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid Solana address format' },
        { status: 400 }
      );
    }

    // 验证用户ID格式（转换为字符串）
    const userIdStr = userId.toString();
    if (!userIdStr) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id: userIdStr }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // 检查地址是否已被其他用户绑定
    const existingBinding = await prisma.user.findFirst({
      where: {
        solanaAddress: solanaAddress,
        id: { not: userIdStr }
      }
    });

    if (existingBinding) {
      return NextResponse.json(
        { error: 'This Solana address is already bound to another account' },
        { status: 409 }
      );
    }

    // 更新用户的 Solana 地址
    const updatedUser = await prisma.user.update({
      where: { id: userIdStr },
      data: { solanaAddress: solanaAddress }
    });

    console.log('Solana address bound successfully:', {
      userId: userIdStr,
      solanaAddress,
      username: updatedUser.username
    });

    return NextResponse.json({
      success: true,
      message: 'Solana address bound successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        solanaAddress: updatedUser.solanaAddress
      }
    });

  } catch (error) {
    console.error('Error binding Solana address:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}