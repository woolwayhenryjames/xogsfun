// Removed for Prisma compatibility
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // 获取所有用户
    const users = await prisma.user.findMany({
      select: {
        id: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        aiScore: true
      }
    });

    // 为每个用户计算AI分数
    const updatePromises = users.map(async (user) => {
      // 如果已经有AI分数，跳过
      if (user.aiScore && user.aiScore > 0) {
        return;
      }

      // 基于用户数据计算AI分数
      let score = 30; // 基础分数

      // 关注者数量影响 (最多+40分)
      if (user.followersCount) {
        score += Math.min(Math.floor(user.followersCount / 100), 40);
      }

      // 推文数量影响 (最多+15分)
      if (user.statusesCount) {
        score += Math.min(Math.floor(user.statusesCount / 100), 15);
      }

      // 关注数量影响 (适中的关注数量更好，最多+10分)
      if (user.friendsCount) {
        if (user.friendsCount > 50 && user.friendsCount < 2000) {
          score += Math.min(Math.floor(user.friendsCount / 200), 10);
        }
      }

      // 认证用户额外加分
      if (user.verified) {
        score += 20;
      }

      // 添加一些随机性 (-5到+5)
      score += Math.floor(Math.random() * 11) - 5;

      // 确保分数在合理范围内
      score = Math.max(10, Math.min(100, score));

      return prisma.user.update({
        where: { id: user.id },
        data: { aiScore: score }
      });
    });

    await Promise.all(updatePromises.filter(Boolean));

    return NextResponse.json({
      message: '成功生成AI分数',
      updated: users.length
    });

  } catch (error) {
    console.error('生成AI分数失败:', error);
    return NextResponse.json(
      { error: '生成AI分数失败' },
      { status: 500 }
    );
  }
} 