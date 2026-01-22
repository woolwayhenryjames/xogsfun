import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // 获取所有用户及其邀请关系详细信息
    const users = await prisma.user.findMany({
      select: {
        id: true,
        aiScore: true,
        xogsBalance: true,
        name: true,
        twitterUsername: true,
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

    console.log(`找到 ${users.length} 个用户，开始重新计算Xogs余额...`);

    let updatedCount = 0;
    const updateResults = [];

    for (const user of users) {
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
        WHERE user_id = ${user.id}
      `;
      const totalCheckinRewards = parseInt(checkinRewards[0]?.total_checkin_rewards) || 0;

      // 5. 获取任务奖励 (只计算已领取的任务)
      const taskRewards: any[] = await prisma.$queryRaw`
        SELECT COALESCE(SUM(reward), 0) as total_task_rewards
        FROM user_tasks
        WHERE user_id = ${user.id} AND status = 'claimed'
      `;
      const totalTaskRewards = parseInt(taskRewards[0]?.total_task_rewards) || 0;

      // 6. 获取InfoFi奖励 (只计算已发布的推文)
      const infofiRewards: any[] = await prisma.$queryRaw`
        SELECT COALESCE(SUM("rewardAmount"), 0) as total_infofi_rewards
        FROM "Tweet"
        WHERE "userId" = ${user.id} AND status = 'published' AND "rewardAmount" > 0
      `;
      const totalInfofiRewards = parseInt(infofiRewards[0]?.total_infofi_rewards) || 0;

      // 7. 正确的总余额 = 基础Xogs + 邀请奖励 + 签到奖励 + 任务奖励 + InfoFi奖励
      const correctXogsBalance = baseXogs + totalInviteRewards + totalCheckinRewards + totalTaskRewards + totalInfofiRewards;

      // 5. 如果当前余额不等于正确余额，更新它
      if (user.xogsBalance !== correctXogsBalance) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            xogsBalance: correctXogsBalance,
          },
        });

        updateResults.push({
          user: user.name || user.twitterUsername || user.id,
          aiScore: user.aiScore,
          oldBalance: user.xogsBalance,
          newBalance: correctXogsBalance,
          breakdown: {
            baseXogs: baseXogs,
            inviteRewards: totalInviteRewards,
            inviterRewards: inviterRewards,
            inviteeRewards: inviteeRewards,
            checkinRewards: totalCheckinRewards,
            taskRewards: totalTaskRewards,
            infofiRewards: totalInfofiRewards,
            invitesSentCount: (user.invitesSent || []).length,
            invitesReceivedCount: user.invitesReceived ? 1 : 0,
          },
          formula: `基础(${user.aiScore} × 10) + 邀请奖励(${totalInviteRewards}) + 签到奖励(${totalCheckinRewards}) + 任务奖励(${totalTaskRewards}) + InfoFi奖励(${totalInfofiRewards}) = ${correctXogsBalance}`,
          details: {
            inviterCalculation: (user.invitesSent || []).map(invite => `被邀请者AI评分${invite.invitee.aiScore} × 2 = ${invite.invitee.aiScore * 2}`),
            inviteeCalculation: user.invitesReceived ? [`自己AI评分${user.aiScore} × 1 = ${user.aiScore * 1}`] : [],
          }
        });

        updatedCount++;
        console.log(`用户 ${user.name || user.id} 余额更新: ${user.xogsBalance} → ${correctXogsBalance}`);
        console.log(`  - 基础Xogs: ${baseXogs} (AI评分 ${user.aiScore} × 10)`);
        console.log(`  - 邀请者奖励: ${inviterRewards} (邀请了${(user.invitesSent || []).length}人)`);
        console.log(`  - 被邀请者奖励: ${inviteeRewards} (${user.invitesReceived ? '被邀请了1次' : '未被邀请'})`);
        console.log(`  - 签到奖励: ${totalCheckinRewards}`);
        console.log(`  - 任务奖励: ${totalTaskRewards}`);
        console.log(`  - InfoFi奖励: ${totalInfofiRewards}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `重新计算完成！共更新了 ${updatedCount} 个用户的余额`,
      totalUsers: users.length,
      updatedUsers: updatedCount,
      updateDetails: updateResults,
      newRules: {
        base: "基础余额 = AI评分 × 10",
        inviterReward: "邀请者奖励 = 被邀请者AI评分 × 2",
        inviteeReward: "被邀请者奖励 = 自己AI评分 × 1",
        checkinReward: "签到奖励 = 每日签到奖励累计",
        taskReward: "任务奖励 = 已领取任务奖励累计",
        infofiReward: "InfoFi奖励 = 已发布推文奖励累计"
      }
    });

  } catch (error) {
    console.error('Error recalculating xogs balances:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 