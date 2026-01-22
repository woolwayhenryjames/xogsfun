export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

interface Transaction {
  id: string;
  type: 'invite_reward' | 'base_score' | 'task_reward' | 'system_adjustment';
  amount: number;
  description: string;
  relatedUser?: string;
  createdAt: Date;
  status: 'completed' | 'pending';
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Get current user information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        aiScore: true,
        xogsBalance: true,
        createdAt: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const transactions: Transaction[] = [];

    // 1. Get invitation rewards (as inviter)
    const sentInvites = await prisma.invite.findMany({
      where: { inviterId: session.user.id },
      include: {
        invitee: {
          select: {
            name: true,
            username: true,
            twitterUsername: true,
            aiScore: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    for (const invite of sentInvites) {
      const reward = invite.invitee.aiScore * 2;
      transactions.push({
        id: `invite_sent_${invite.id}`,
        type: 'invite_reward',
        amount: reward,
        description: `Invite Reward: Successfully invited ${invite.invitee.name || invite.invitee.username || invite.invitee.twitterUsername || 'user'}`,
        relatedUser: invite.invitee.name || invite.invitee.username || invite.invitee.twitterUsername || undefined,
        createdAt: invite.createdAt,
        status: 'completed'
      });
    }

    // 2. Get invitation rewards (as invitee)
    const receivedInvites = await prisma.invite.findMany({
      where: { inviteeId: session.user.id },
      include: {
        inviter: {
          select: {
            name: true,
            username: true,
            twitterUsername: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    for (const invite of receivedInvites) {
      const reward = user.aiScore * 1;
      transactions.push({
        id: `invite_received_${invite.id}`,
        type: 'invite_reward',
        amount: reward,
        description: `Invited Reward: Invited by ${invite.inviter.name || invite.inviter.username || invite.inviter.twitterUsername || 'user'}`,
        relatedUser: invite.inviter.name || invite.inviter.username || invite.inviter.twitterUsername || undefined,
        createdAt: invite.createdAt,
        status: 'completed'
      });
    }

    // 3. Get task rewards (if user_tasks table exists)
    // 过滤掉每日签到记录，避免与 daily_checkins 重复
    try {
      const taskRewards: any[] = await prisma.$queryRaw`
        SELECT 
          ut.id,
          ut.reward,
          ut.completed_at,
          ut.status,
          ut.task_id,
          t.title as task_title
        FROM user_tasks ut
        LEFT JOIN tasks t ON ut.task_id = t.id
        WHERE ut.user_id = ${session.user.id}
        AND ut.status IN ('completed', 'claimed')
        AND ut.reward > 0
        AND ut.task_id != 'daily-checkin'
        ORDER BY ut.completed_at DESC
      `;

      for (const task of taskRewards) {
        if (task.completed_at) {
          transactions.push({
            id: `task_${task.id}`,
            type: 'task_reward',
            amount: task.reward,
            description: `Task Reward: ${task.task_title || 'Complete Task'}`,
            createdAt: task.completed_at,
            status: 'completed'
          });
        }
      }
    } catch (error) {
      // If user_tasks table doesn't exist, skip task rewards
      console.log('Task rewards table not found, skipping...');
    }

    // 4. Get daily check-in rewards
    try {
      const checkinRewards: any[] = await prisma.$queryRaw`
        SELECT 
          checkin_date,
          reward,
          ai_score,
          multiplier,
          description,
          streak_count
        FROM daily_checkins
        WHERE user_id = ${session.user.id}
        AND reward > 0
        ORDER BY checkin_date DESC
      `;

      for (const checkin of checkinRewards) {
        transactions.push({
          id: `checkin_${checkin.checkin_date}`,
          type: 'task_reward',
          amount: checkin.reward,
          description: checkin.description || `Daily Check-in: ${checkin.multiplier}x × ${checkin.ai_score} AI Score = ${checkin.reward} $XOGS`,
          createdAt: new Date(checkin.checkin_date),
          status: 'completed'
        });
      }
    } catch (error) {
      console.log('Daily check-in rewards table not found or error:', error);
    }

    // 5. Add base score rewards (AI Score × 10)
    if (user.aiScore > 0) {
      const baseReward = user.aiScore * 10;
      transactions.push({
        id: `base_score_${user.id}`,
        type: 'base_score',
        amount: baseReward,
        description: `Base Reward: AI Score ${user.aiScore} × 10`,
        createdAt: user.createdAt,
        status: 'completed'
      });
    }

    // 6. Sort by time and paginate
    transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    const totalTransactions = transactions.length;
    const paginatedTransactions = transactions.slice(offset, offset + limit);

    // 7. Calculate statistics
    const totalEarned = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);

    const inviteEarnings = transactions
      .filter(t => t.type === 'invite_reward')
      .reduce((sum, t) => sum + t.amount, 0);

    const taskEarnings = transactions
      .filter(t => t.type === 'task_reward')
      .reduce((sum, t) => sum + t.amount, 0);

    const baseEarnings = transactions
      .filter(t => t.type === 'base_score')
      .reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      success: true,
      data: {
        currentBalance: user.xogsBalance,
        transactions: paginatedTransactions,
        pagination: {
          page,
          limit,
          total: totalTransactions,
          totalPages: Math.ceil(totalTransactions / limit)
        },
        statistics: {
          totalEarned,
          inviteEarnings,
          taskEarnings,
          baseEarnings,
          transactionCount: totalTransactions
        }
      }
    });

  } catch (error) {
    console.error('Error fetching XOGS transactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 