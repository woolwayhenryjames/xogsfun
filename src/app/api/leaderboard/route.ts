export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sortType = searchParams.get('type') || 'xogs'; // 默认按XOGS排序
    
    // 根据排序类型设置不同的查询条件和排序方式
    let whereCondition = {};
    let orderByCondition = {};
    let selectFields = {
      id: true,
      name: true,
      username: true,
      twitterUsername: true,
      image: true,
      profileImageUrl: true,
      aiScore: true,
      xogsBalance: true,
      followersCount: true,
      verified: true,
      twitterCreatedAt: true, // 添加Twitter注册时间字段
    };

    switch (sortType) {
      case 'twitter_age':
        // 按Twitter注册时间排序（最早的在前）
        whereCondition = {
          twitterCreatedAt: {
            not: null // 只显示有Twitter注册时间的用户
          }
        };
        orderByCondition = {
          twitterCreatedAt: 'asc' // 最早注册的在前
        };
        break;
      
      case 'followers':
        // 按粉丝数排序（从高到低）
        whereCondition = {
          followersCount: {
            not: null,
            gt: 0 // 只显示有粉丝的用户
          }
        };
        orderByCondition = {
          followersCount: 'desc' // 粉丝数降序
        };
        break;
      
      default:
        // 默认按XOGS余额排序
        whereCondition = {
          xogsBalance: {
            gt: 0 // 只显示有XOGS余额的用户
          }
        };
        orderByCondition = {
          xogsBalance: 'desc' // 按XOGS余额降序排列
        };
        break;
    }
    
    // 获取排行榜数据（前50名）
    const users = await prisma.user.findMany({
      where: whereCondition,
      select: selectFields,
      orderBy: orderByCondition,
      take: 50
    });

    // 添加排名并格式化数据
    const usersWithRank = users.map((user, index) => ({
      ...user,
      rank: index + 1,
      // 确保有正确的用户名和头像
      username: user.username || user.twitterUsername || 'unknown',
      image: user.image || user.profileImageUrl || '',
    }));

    // 如果用户已登录，获取当前用户的排名
    let currentUserRank = null;
    if (session?.user?.id) {
      const currentUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { 
          xogsBalance: true, 
          followersCount: true, 
          twitterCreatedAt: true 
        }
      });

      if (currentUser) {
        // 根据排序类型计算当前用户的排名
        let higherRankCount = 0;
        
        switch (sortType) {
          case 'twitter_age':
            if (currentUser.twitterCreatedAt) {
              higherRankCount = await prisma.user.count({
                where: {
                  twitterCreatedAt: {
                    not: null,
                    lt: currentUser.twitterCreatedAt // 注册更早的用户
                  }
                }
              });
            }
            break;
          
          case 'followers':
            if (currentUser.followersCount) {
              higherRankCount = await prisma.user.count({
                where: {
                  followersCount: {
                    not: null,
                    gt: currentUser.followersCount // 粉丝数更多的用户
                  }
                }
              });
            }
            break;
          
          default:
            if (currentUser.xogsBalance) {
              higherRankCount = await prisma.user.count({
                where: {
                  xogsBalance: {
                    gt: currentUser.xogsBalance // XOGS余额更多的用户
                  }
                }
              });
            }
            break;
        }
        
        currentUserRank = higherRankCount + 1;
      }
    }

    return NextResponse.json({
      users: usersWithRank,
      currentUserRank,
      total: users.length,
      sortType // 返回当前排序类型
    });

  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      { error: '获取排行榜失败' },
      { status: 500 }
    );
  }
} 