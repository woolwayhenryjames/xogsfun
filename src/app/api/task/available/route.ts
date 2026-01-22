export const runtime = 'edge'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 任务定义
const AVAILABLE_TASKS = [
  {
    id: 'daily-checkin',
    type: 'daily_checkin',
    title: '每日签到',
    description: '每天签到获得 $XOGS 奖励，获得0.2x-1x倍数 × 你的AI评分！',
    reward: 10,
    icon: 'calendar',
    difficulty: 'easy' as const,
    category: 'daily' as const,
    requirements: {},
    isRepeatable: true,
    cooldownHours: 24,
  },
  {
    id: 'follow-twitter',
    type: 'follow_twitter',
    title: 'Follow Official Twitter',
    description: 'Follow @xogsfun official Twitter account and get 2x your AI Score in $XOGS rewards! [Beta: Platform ID 10000, 10001 only]',
    reward: 0,
    icon: 'twitter',
    difficulty: 'easy' as const,
    category: 'social' as const,
    requirements: {
      twitterHandle: 'xogsfun',
      restrictedAccess: true,
      allowedPlatformIds: [10000, 10001]
    },
    isRepeatable: false,
    cooldownHours: 0,
  },
  {
    id: 'join-telegram',
    type: 'join_telegram',
    title: '加入 Telegram 群',
    description: '加入官方 Telegram 群组，与社区成员互动交流！',
    reward: 30,
    icon: 'message',
    difficulty: 'easy' as const,
    category: 'social' as const,
    requirements: {
      telegramGroup: 'https://t.me/xogsfun'
    },
    isRepeatable: false,
    cooldownHours: 0,
  },
  {
    id: 'invite-friends',
    type: 'invite_friends',
    title: '邀请好友',
    description: '邀请好友加入 XOGS，成功邀请可获得丰厚奖励！',
    reward: 100,
    icon: 'users',
    difficulty: 'medium' as const,
    category: 'social' as const,
    requirements: {
      minInvites: 1
    },
    isRepeatable: true,
    cooldownHours: 0,
  },
  {
    id: 'complete-ai-score',
    type: 'ai_score',
    title: '完成AI评分',
    description: '完成你的推特AI评分测试，了解你的影响力！',
    reward: 25,
    icon: 'bot',
    difficulty: 'medium' as const,
    category: 'engagement' as const,
    requirements: {},
    isRepeatable: false,
    cooldownHours: 0,
  },
  {
    id: 'share-score',
    type: 'share_score',
    title: '分享AI评分',
    description: '在推特上分享你的AI评分结果，让更多人了解 XOGS！',
    reward: 40,
    icon: 'send',
    difficulty: 'medium' as const,
    category: 'engagement' as const,
    requirements: {},
    isRepeatable: false,
    cooldownHours: 0,
  },
  {
    id: 'weekly-challenge',
    type: 'weekly_challenge',
    title: '每周挑战',
    description: '完成本周特殊挑战任务，获得额外奖励！',
    reward: 200,
    icon: 'trophy',
    difficulty: 'hard' as const,
    category: 'special' as const,
    requirements: {},
    isRepeatable: true,
    cooldownHours: 168, // 7 days
  },
  {
    id: 'profile-complete',
    type: 'profile_complete',
    title: '完善个人资料',
    description: '完善你的个人资料，让其他用户更好地了解你！',
    reward: 20,
    icon: 'star',
    difficulty: 'easy' as const,
    category: 'engagement' as const,
    requirements: {},
    isRepeatable: false,
    cooldownHours: 0,
  },
];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取用户的平台ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { platformId: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 从数据库查询可用任务
    const tasks = await prisma.$queryRaw`
      SELECT 
        id,
        type,
        title,
        description,
        reward,
        icon,
        difficulty,
        category,
        requirements,
        is_repeatable as "isRepeatable",
        cooldown_hours as "cooldownHours"
      FROM tasks 
      WHERE is_active = true
      ORDER BY 
        CASE 
          WHEN category = 'daily' THEN 1
          WHEN category = 'social' THEN 2
          WHEN category = 'engagement' THEN 3
          WHEN category = 'special' THEN 4
          ELSE 5
        END,
        reward DESC
    `;

    // 检查用户是否有权限访问follow-twitter任务
    const allowedPlatformIds = [10000, 10001];
    const hasFollowTwitterAccess = allowedPlatformIds.includes(user.platformId);

    // 过滤任务：如果用户没有权限，移除follow-twitter任务
    const filteredTasks = (tasks as any[]).filter(task => {
      if (task.id === 'follow-twitter' && !hasFollowTwitterAccess) {
        return false; // 隐藏关注推特任务
      }
      return true;
    });

    return NextResponse.json(filteredTasks);
  } catch (error) {
    console.error('Error fetching available tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 