export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 检查用户是否有管理权限
async function checkAdminPermission(session: any) {
  if (!session?.user?.id) {
    return false;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { platformId: true }
  });

  return user?.platformId === 10000 || user?.platformId === 10001;
}

// GET - 获取合作伙伴使用统计
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!await checkAdminPermission(session)) {
      return NextResponse.json(
        { error: 'Access denied. Admin permission required.' },
        { status: 403 }
      );
    }

    const partnerId = params.id;

    // 验证合作伙伴是否存在
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true }
    });

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      );
    }

    // 获取统计数据
    const [
      totalGenerations,
      totalPublications,
      activeUsersResult,
      lastUsedResult
    ] = await Promise.all([
      // 总生成次数
      prisma.tweet.count({
        where: {
          sponsor: partner.name
        }
      }),
      
      // 总发布次数
      prisma.tweet.count({
        where: {
          sponsor: partner.name,
          status: 'published'
        }
      }),
      
      // 活跃用户数 (最近30天有生成内容的用户)
      prisma.tweet.findMany({
        where: {
          sponsor: partner.name,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30天前
          }
        },
        select: {
          userId: true
        },
        distinct: ['userId']
      }),
      
      // 最后使用时间
      prisma.tweet.findFirst({
        where: {
          sponsor: partner.name
        },
        select: {
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    const activeUsers = activeUsersResult.length;
    const lastUsed = lastUsedResult?.createdAt?.toISOString() || null;

    return NextResponse.json({
      totalGenerations,
      totalPublications,
      activeUsers,
      lastUsed
    });

  } catch (error) {
    console.error('Error fetching partner stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch partner statistics' },
      { status: 500 }
    );
  }
}
