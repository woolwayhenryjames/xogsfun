export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { calculateAIScore as calculateAIScoreLib } from '@/lib/aiScore';

// 使用工具库中的类型和函数

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取用户数据
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        twitterCreatedAt: true,
        aiScore: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 计算AI评分
    const scoreCalculation = calculateAIScoreLib({
      followersCount: user.followersCount,
      friendsCount: user.friendsCount,
      statusesCount: user.statusesCount,
      verified: user.verified,
      twitterCreatedAt: user.twitterCreatedAt,
    });

    // 更新数据库中的AI评分
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { aiScore: Math.round(scoreCalculation.totalScore) },
      select: {
        id: true,
        aiScore: true,
      }
    });

    return NextResponse.json({
      success: true,
      oldScore: user.aiScore,
      newScore: updatedUser.aiScore,
      calculation: scoreCalculation,
      message: `AI评分已更新：${user.aiScore} → ${updatedUser.aiScore}`
    });

  } catch (error) {
    console.error('计算AI评分失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// GET方法用于查看当前评分计算（不更新数据库）
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登录' }, { status: 401 });
    }

    // 获取用户数据
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        twitterCreatedAt: true,
        aiScore: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 计算AI评分（不更新数据库）
    const scoreCalculation = calculateAIScoreLib({
      followersCount: user.followersCount,
      friendsCount: user.friendsCount,
      statusesCount: user.statusesCount,
      verified: user.verified,
      twitterCreatedAt: user.twitterCreatedAt,
    });

    return NextResponse.json({
      currentScore: user.aiScore,
      calculatedScore: Math.round(scoreCalculation.totalScore),
      calculation: scoreCalculation,
      needsUpdate: user.aiScore !== Math.round(scoreCalculation.totalScore)
    });

  } catch (error) {
    console.error('获取AI评分计算失败:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
} 