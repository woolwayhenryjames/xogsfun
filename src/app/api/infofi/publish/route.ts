export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { refreshTwitterToken } from '@/lib/twitter-api';

export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, sponsor } = await request.json();
    
    if (!content || !sponsor) {
      return NextResponse.json({ error: 'Content and sponsor are required' }, { status: 400 });
    }

    const contentToPublish = content.trim();

    if (contentToPublish.length > 260) {
      return NextResponse.json({ error: 'Tweet content exceeds 260 characters limit' }, { status: 400 });
    }

    // Check monthly usage limit (UTC time)
    const today = new Date();
    const startOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1));
    const endOfMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));

    // 每月发布限制1次
    const MONTHLY_PUBLICATION_LIMIT = 1;
    const monthlyPublications = await prisma.tweet.count({
      where: {
        userId: session.user.id,
        status: 'published',
        createdAt: {
          gte: startOfMonth,
          lt: endOfMonth
        }
      }
    });

    if (monthlyPublications >= MONTHLY_PUBLICATION_LIMIT) {
      const nextMonth = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 1));
      const daysUntilReset = Math.ceil((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      return NextResponse.json({ 
        error: `Monthly publication limit reached (${MONTHLY_PUBLICATION_LIMIT}/month). You can publish again in ${daysUntilReset} days.`,
        monthlyLimitReached: true,
        daysUntilReset
      }, { status: 429 });
    }

    // 获取用户的Twitter token和AI评分
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        accessToken: true,
        refreshToken: true,
        tokenExpiresAt: true,
        twitterId: true,
        twitterUsername: true,
        aiScore: true
      }
    });

    if (!user?.accessToken) {
      return NextResponse.json({ error: 'Twitter access token not found. Please reconnect your Twitter account.' }, { status: 400 });
    }

    let accessToken = user.accessToken;

    // 检查token是否过期
    if (user.tokenExpiresAt && new Date() > user.tokenExpiresAt) {
      // 如果有 refresh token，尝试刷新
      if (user.refreshToken) {
        const newTokens = await refreshTwitterToken(user.refreshToken);
        if (newTokens) {
          // 更新数据库中的 token
          await prisma.user.update({
            where: { id: session.user.id },
            data: {
              accessToken: newTokens.accessToken,
              refreshToken: newTokens.refreshToken,
              tokenExpiresAt: newTokens.expiresAt
            }
          });
          accessToken = newTokens.accessToken;
        } else {
          return NextResponse.json({ error: 'Failed to refresh Twitter token. Please reconnect your Twitter account.' }, { status: 400 });
        }
      } else {
      return NextResponse.json({ error: 'Twitter access token expired. Please reconnect your Twitter account.' }, { status: 400 });
    }
    }

    // 查找或创建推文记录
    let tweetRecord = await prisma.tweet.findFirst({
      where: {
        userId: session.user.id,
        content: contentToPublish,
        sponsor,
        status: 'generated'
      }
    });

    // 如果没有找到生成记录，创建一个新的（兼容旧的直接发布方式）
    if (!tweetRecord) {
      tweetRecord = await prisma.tweet.create({
        data: {
          userId: session.user.id,
          content: contentToPublish,
          sponsor,
        status: 'pending',
          aiPrompt: `Generated for ${sponsor}`,
        }
      });
    } else {
      // 更新状态为pending，准备发布
      tweetRecord = await prisma.tweet.update({
        where: { id: tweetRecord.id },
        data: { status: 'pending' }
    });
    }

    try {
      // 发布推文到Twitter
      const twitterResponse = await fetch('https://api.twitter.com/2/tweets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // 使用可能刷新过的 token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: contentToPublish
        }),
      });

      const twitterData = await twitterResponse.json();

      if (twitterResponse.ok && twitterData.data?.id) {
        // 构建推文URL
        const tweetUrl = `https://twitter.com/${user.twitterUsername}/status/${twitterData.data.id}`;
        
        // 计算奖励 (AI评分 × 5，InfoFi Elite专属奖励)
        const rewardAmount = (user.aiScore || 0) * 5;
        
        // 使用数据库事务确保一致性
        await prisma.$transaction(async (tx) => {
          // 更新推文记录为成功发布并添加奖励信息
          await tx.tweet.update({
          where: { id: tweetRecord.id },
          data: {
            status: 'published',
            tweetId: twitterData.data.id,
            tweetUrl: tweetUrl,
            publishedAt: new Date(),
              rewardAmount: rewardAmount,
              rewardType: 'infofi_elite_monthly'
            }
          });

          // 发放奖励到用户余额
          if (rewardAmount > 0) {
            await tx.user.update({
              where: { id: session.user.id },
              data: {
                xogsBalance: {
                  increment: rewardAmount
                }
              }
            });
          }
        });

        return NextResponse.json({
          success: true,
          tweetId: twitterData.data.id,
          tweetUrl: tweetUrl,
          message: 'Tweet published successfully',
          reward: {
            amount: rewardAmount,
            calculation: `${user.aiScore || 0} AI Score × 5 = ${rewardAmount} $XOGS`,
            description: 'InfoFi Elite Monthly Reward'
          }
        });
      } else {
        // Twitter API错误
        const errorMessage = twitterData.detail || twitterData.error?.message || 'Failed to publish tweet';
        
        // 更新记录为失败
        await prisma.tweet.update({
          where: { id: tweetRecord.id },
          data: {
            status: 'failed',
            errorMessage: errorMessage,
          }
        });

        return NextResponse.json({ error: errorMessage }, { status: 400 });
      }

    } catch (publishError) {
      console.error('Error publishing tweet:', publishError);
      
      // 更新记录为失败
      await prisma.tweet.update({
        where: { id: tweetRecord.id },
        data: {
          status: 'failed',
          errorMessage: 'Network error while publishing tweet',
        }
      });

      return NextResponse.json({ error: 'Failed to publish tweet' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in publish route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 