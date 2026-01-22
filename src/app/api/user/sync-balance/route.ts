import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取当前用户的详细信息，包括邀请关系
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        aiScore: true,
        xogsBalance: true,
        name: true,
        invitesSent: {
          select: {
            invitee: {
              select: {
                aiScore: true,
              }
            }
          },
        },
        invitesReceived: {
          select: {
            inviter: {
              select: {
                aiScore: true,
              }
            }
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 1. 基础Xogs余额 = AI评分 × 10
    const baseXogs = user.aiScore * 10;

    // 2. 作为邀请者的奖励 = 每个被邀请者的AI评分 × 2
    const inviterRewards = (user.invitesSent || []).reduce((sum: number, invite: any) => {
      return sum + (invite.invitee.aiScore * 2);
    }, 0);

    // 3. 作为被邀请者的奖励 = 自己的AI评分 × 1 (只能被邀请一次)
    const inviteeRewards = user.invitesReceived ? (user.aiScore * 1) : 0;

    const totalInviteRewards = inviterRewards + inviteeRewards;

    // 4. 获取每日签到奖励
    const checkinRewards: any[] = await prisma.$queryRaw`
      SELECT COALESCE(SUM(reward), 0) as total_checkin_rewards
      FROM daily_checkins
      WHERE user_id = ${session.user.id}
    `;
    const totalCheckinRewards = parseInt(checkinRewards[0]?.total_checkin_rewards) || 0;

    // 5. 获取任务奖励 (只计算已领取的任务)
    const taskRewards: any[] = await prisma.$queryRaw`
      SELECT COALESCE(SUM(reward), 0) as total_task_rewards
      FROM user_tasks
      WHERE user_id = ${session.user.id} AND status = 'claimed'
    `;
    const totalTaskRewards = parseInt(taskRewards[0]?.total_task_rewards) || 0;

    // 6. 获取InfoFi奖励 (只计算已发布的推文)
    const infofiRewards: any[] = await prisma.$queryRaw`
      SELECT COALESCE(SUM("rewardAmount"), 0) as total_infofi_rewards
      FROM "Tweet"
      WHERE "userId" = ${session.user.id} AND status = 'published' AND "rewardAmount" > 0
    `;
    const totalInfofiRewards = parseInt(infofiRewards[0]?.total_infofi_rewards) || 0;

    // 7. 计算正确的总余额
    const correctXogsBalance = baseXogs + totalInviteRewards + totalCheckinRewards + totalTaskRewards + totalInfofiRewards;

    // 如果需要同步，更新数据库
    if (user.xogsBalance !== correctXogsBalance) {
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id },
        data: {
          xogsBalance: correctXogsBalance,
        },
        select: {
          xogsBalance: true,
          aiScore: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: '余额同步成功！',
        oldBalance: user.xogsBalance,
        newBalance: updatedUser.xogsBalance,
        calculation: {
          baseXogs,
          inviterRewards,
          inviteeRewards,
          totalInviteRewards,
          totalCheckinRewards,
          totalTaskRewards,
          totalInfofiRewards,
        },
        breakdown: `基础(${user.aiScore} × 10) + 邀请奖励(${totalInviteRewards}) + 签到奖励(${totalCheckinRewards}) + 任务奖励(${totalTaskRewards}) + InfoFi奖励(${totalInfofiRewards}) = ${correctXogsBalance}`,
      });
    } else {
      return NextResponse.json({
        success: true,
        message: '余额已是最新的！',
        balance: user.xogsBalance,
        calculation: {
          baseXogs,
          inviterRewards,
          inviteeRewards,
          totalInviteRewards,
          totalCheckinRewards,
          totalTaskRewards,
          totalInfofiRewards,
        },
        breakdown: `基础(${user.aiScore} × 10) + 邀请奖励(${totalInviteRewards}) + 签到奖励(${totalCheckinRewards}) + 任务奖励(${totalTaskRewards}) + InfoFi奖励(${totalInfofiRewards}) = ${correctXogsBalance}`,
      });
    }

  } catch (error) {
    console.error('Error syncing user balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 