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

    const userId = session.user.id;
    const today = new Date().toISOString().split('T')[0];

    // 获取或创建用户统计记录
    let userStats: any[] = await prisma.$queryRaw`
      SELECT * FROM task_stats WHERE user_id = ${userId}
    `;

    if (!userStats || userStats.length === 0) {
      // 创建初始统计记录
      await prisma.$queryRaw`
        INSERT INTO task_stats (user_id, total_tasks, completed_tasks, total_rewards, current_streak, max_streak)
        VALUES (${userId}, 0, 0, 0, 0, 0)
      `;
      userStats = [{
        total_tasks: 0,
        completed_tasks: 0,
        total_rewards: 0,
        current_streak: 0,
        max_streak: 0
      }];
    }

    const userStatRecord = userStats[0];

    // 获取今日任务数量
    const todayTasksResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM tasks WHERE is_active = true
    `;
    const todayTasks = parseInt(todayTasksResult[0].count);

    // 获取今日完成任务数量
    const todayCompletedResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM user_tasks 
      WHERE user_id = ${userId} 
      AND DATE(completed_at) = CAST(${today} AS DATE)
      AND status IN ('completed', 'claimed')
    `;
    const todayCompleted = parseInt(todayCompletedResult[0].count) || 0;

    // 计算连续签到天数
    const streakResult: any[] = await prisma.$queryRaw`
      SELECT COUNT(*) as streak FROM (
        SELECT checkin_date FROM daily_checkins 
        WHERE user_id = ${userId} 
        AND checkin_date >= CURRENT_DATE - INTERVAL '30 days'
        ORDER BY checkin_date DESC
      ) AS recent_checkins
    `;
    const streakDays = parseInt(streakResult[0]?.streak) || 0;

    const stats = {
      totalTasks: todayTasks,
      completedTasks: parseInt(userStatRecord.completed_tasks) || 0,
      totalRewards: parseInt(userStatRecord.total_rewards) || 0,
      streakDays: streakDays,
      todayTasks: todayTasks,
      todayCompleted: todayCompleted
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 