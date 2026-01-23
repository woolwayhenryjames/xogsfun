export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { batchUpdateAllUsersAIScore } from '@/lib/aiScore';
import { adminMiddleware } from '@/lib/admin';

export async function POST(request: NextRequest) {
  try {
    // 验证管理员权限
    const { authorized, error, userId } = await adminMiddleware();

    if (!authorized) {
      return NextResponse.json({ error }, { status: error === '未登录' ? 401 : 403 });
    }

    console.log(`管理员 ${userId} (平台ID: 10000) 请求批量更新AI评分`);

    // 执行批量更新
    const result = await batchUpdateAllUsersAIScore();

    return NextResponse.json({
      success: true,
      message: `批量更新完成：成功更新 ${result.updated} 个用户，失败 ${result.failed} 个`,
      updated: result.updated,
      failed: result.failed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('批量更新AI评分失败:', error);
    return NextResponse.json({
      error: '服务器错误',
      message: '批量更新AI评分失败'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // 验证管理员权限
    const { authorized, error, userId } = await adminMiddleware();

    if (!authorized) {
      return NextResponse.json({ error }, { status: error === '未登录' ? 401 : 403 });
    }

    // 获取统计信息
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const totalUsers = await prisma.user.count();
      const usersWithTwitterData = await prisma.user.count({
        where: {
          twitterCreatedAt: { not: null },
          followersCount: { not: null }
        }
      });
      const usersWithAIScore = await prisma.user.count({
        where: {
          aiScore: { gt: 0 }
        }
      });

      return NextResponse.json({
        totalUsers,
        usersWithTwitterData,
        usersWithAIScore,
        needsUpdate: usersWithTwitterData - usersWithAIScore,
        lastUpdated: new Date().toISOString()
      });
    } finally {
      await prisma.$disconnect();
    }

  } catch (error) {
    console.error('获取AI评分统计失败:', error);
    return NextResponse.json({
      error: '服务器错误',
      message: '获取统计信息失败'
    }, { status: 500 });
  }
} 