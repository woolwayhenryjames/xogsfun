export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从数据库查询用户任务记录
    const userTasks: any[] = await prisma.$queryRaw`
      SELECT 
        ut.id,
        ut.task_id,
        ut.user_id,
        ut.status,
        ut.completed_at,
        ut.claimed_at,
        ut.reward,
        ut.metadata,
        ut.created_at,
        t.id as task_id,
        t.type as task_type,
        t.title as task_title,
        t.description as task_description,
        t.reward as task_reward,
        t.icon as task_icon,
        t.difficulty as task_difficulty,
        t.category as task_category,
        t.requirements as task_requirements,
        t.is_repeatable as task_is_repeatable,
        t.cooldown_hours as task_cooldown_hours
      FROM user_tasks ut
      LEFT JOIN tasks t ON ut.task_id = t.id
      WHERE ut.user_id = ${session.user.id}
      ORDER BY ut.created_at DESC
    `;
    
    const formattedTasks = userTasks.map((ut: any) => ({
      id: ut.id,
      taskId: ut.task_id,
      userId: ut.user_id,
      status: ut.status,
      completedAt: ut.completed_at,
      claimedAt: ut.claimed_at,
      reward: ut.reward,
      task: {
        id: ut.task_id,
        type: ut.task_type,
        title: ut.task_title,
        description: ut.task_description,
        reward: ut.task_reward,
        icon: ut.task_icon,
        difficulty: ut.task_difficulty,
        category: ut.task_category,
        requirements: ut.task_requirements,
        isRepeatable: ut.task_is_repeatable,
        cooldownHours: ut.task_cooldown_hours,
      }
    }));
    
    return NextResponse.json(formattedTasks);
  } catch (error) {
    console.error('Error fetching user tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 