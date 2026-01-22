export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, action } = await request.json();

    if (!taskId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['complete', 'claim'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (action === 'complete') {
      // 完成任务
      const response = await handleCompleteTask(taskId, session.user.id);
      return NextResponse.json(response);
    } else if (action === 'claim') {
      // 领取奖励
      const response = await handleClaimReward(taskId, session.user.id);
      return NextResponse.json(response);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error processing task action:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCompleteTask(taskId: string, userId: string) {
  // 检查任务是否存在
  const task: any[] = await prisma.$queryRaw`
    SELECT * FROM tasks WHERE id = ${taskId} AND is_active = true
  `;
  
  if (!task || task.length === 0) {
    throw new Error('Task not found');
  }

  const taskData = task[0];

  // 特殊权限检查：follow-twitter任务只允许平台ID 10000和10001访问
  if (taskId === 'follow-twitter') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { platformId: true }
    });

    const allowedPlatformIds = [10000, 10001];
    if (!user || !allowedPlatformIds.includes(user.platformId)) {
      throw new Error('Access denied. This task is currently in beta testing phase and only available to specific users.');
    }
  }

  // 检查用户是否已经完成过此任务
  const existingUserTask: any[] = await prisma.$queryRaw`
    SELECT * FROM user_tasks 
    WHERE user_id = ${userId} 
    AND task_id = ${taskId}
    AND status IN ('completed', 'claimed')
  `;

  // 如果任务不可重复且已完成，抛出错误
  if (!taskData.is_repeatable && existingUserTask.length > 0) {
    throw new Error('Task already completed');
  }

  // 如果任务可重复，检查冷却时间
  if (taskData.is_repeatable && existingUserTask.length > 0) {
    const lastCompleted = existingUserTask[0].completed_at;
    const cooldownMs = taskData.cooldown_hours * 60 * 60 * 1000;
    const now = new Date();
    const lastCompletedDate = new Date(lastCompleted);
    
    if (now.getTime() - lastCompletedDate.getTime() < cooldownMs) {
      throw new Error('Task is on cooldown');
    }
  }

  // 根据任务类型执行特定逻辑
  const taskResult = await executeTaskLogic(taskId, userId, taskData);

  // 对于每日签到和关注推特，使用动态计算的奖励；其他任务使用固定奖励
  const actualReward = (['daily-checkin', 'follow-twitter'].includes(taskId) && taskResult && 'reward' in taskResult) ? taskResult.reward : taskData.reward;

  // 对于每日签到，直接完成并发放奖励；其他任务只标记为完成
  const shouldAutoClaimReward = taskId === 'daily-checkin';
  const taskStatus = shouldAutoClaimReward ? 'claimed' : 'completed';

  // 创建或更新用户任务记录
  if (shouldAutoClaimReward) {
    // 每日签到：直接完成并发放奖励
    await prisma.$queryRaw`
      INSERT INTO user_tasks (user_id, task_id, status, completed_at, claimed_at, reward)
      VALUES (${userId}, ${taskId}, ${taskStatus}, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ${actualReward})
    `;
  } else {
    // 其他任务：只标记为完成，claimed_at 为 NULL
    await prisma.$queryRaw`
      INSERT INTO user_tasks (user_id, task_id, status, completed_at, claimed_at, reward)
      VALUES (${userId}, ${taskId}, ${taskStatus}, CURRENT_TIMESTAMP, NULL, ${actualReward})
    `;
  }

  // 如果是自动发放奖励的任务，直接更新用户余额
  if (shouldAutoClaimReward) {
  await prisma.$queryRaw`
      UPDATE "User" 
      SET "xogsBalance" = "xogsBalance" + ${actualReward}
      WHERE id = ${userId}
  `;
  }

  // 更新用户统计
  await updateUserStats(userId, actualReward);

  return {
    success: true,
    message: shouldAutoClaimReward ? 'Task completed and reward claimed!' : 'Task completed successfully',
    canClaim: !shouldAutoClaimReward,
    reward: shouldAutoClaimReward ? actualReward : undefined,
    taskResult: taskResult
  };
}

async function handleClaimReward(taskId: string, userId: string) {
  // 查找已完成但未领取的任务
  const userTask: any[] = await prisma.$queryRaw`
    SELECT * FROM user_tasks 
    WHERE user_id = ${userId} 
    AND task_id = ${taskId}
    AND status = 'completed'
    ORDER BY completed_at DESC
    LIMIT 1
  `;

  if (!userTask || userTask.length === 0) {
    throw new Error('No completed task found to claim');
  }

  const taskRecord = userTask[0];
  const reward = taskRecord.reward;

  // 更新任务状态为已领取
  await prisma.$queryRaw`
    UPDATE user_tasks 
    SET status = 'claimed', claimed_at = CURRENT_TIMESTAMP
    WHERE id = ${taskRecord.id}
  `;

  // 更新用户的 xogsBalance
  await prisma.$queryRaw`
    UPDATE "User" 
    SET "xogsBalance" = "xogsBalance" + ${reward}
    WHERE id = ${userId}
  `;

  // 更新任务统计
  await updateTaskStats(userId, reward);

  return {
    success: true,
    message: 'Reward claimed successfully',
    reward: reward,
    taskId: taskId
  };
}

// 辅助函数

async function executeTaskLogic(taskId: string, userId: string, taskData: any) {
  // 根据任务类型执行特定逻辑
  switch (taskId) {
    case 'daily-checkin':
      return await handleDailyCheckin(userId);
    case 'follow-twitter':
      return await handleFollowTwitter(userId);
    case 'join-telegram':
      return await handleJoinTelegram(userId);
    case 'invite-friends':
      return await handleInviteFriends(userId);
    case 'complete-ai-score':
      return await handleCompleteAIScore(userId);
    case 'share-score':
      return await handleShareScore(userId);
    case 'weekly-challenge':
      return await handleWeeklyChallenge(userId);
    case 'profile-complete':
      return await handleProfileComplete(userId);
    default:
      return { success: true };
  }
}

async function updateUserStats(userId: string, reward: number) {
  // 更新用户统计
  await prisma.$queryRaw`
    UPDATE task_stats 
    SET 
      completed_tasks = completed_tasks + 1,
      total_rewards = total_rewards + ${reward},
      last_activity = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
  `;
}

async function updateTaskStats(userId: string, reward: number) {
  // 更新任务统计中的奖励总数
  await prisma.$queryRaw`
    UPDATE task_stats 
    SET 
      total_rewards = total_rewards + ${reward},
      last_activity = CURRENT_TIMESTAMP
    WHERE user_id = ${userId}
  `;
}

// 各种任务的具体处理逻辑

async function handleDailyCheckin(userId: string) {
  // 每日签到逻辑
  const today = new Date().toISOString().split('T')[0];
  
  // 检查今日是否已签到
  const todayCheckin: any[] = await prisma.$queryRaw`
    SELECT * FROM daily_checkins 
    WHERE user_id = ${userId} AND checkin_date = CAST(${today} AS DATE)
  `;
  
  if (todayCheckin.length > 0) {
    throw new Error('Already checked in today');
  }

  // 获取用户AI评分
  const userScore: any[] = await prisma.$queryRaw`
    SELECT "aiScore" FROM "User" WHERE id = ${userId}
  `;
  
  if (!userScore || userScore.length === 0 || !userScore[0].aiScore || userScore[0].aiScore === 0) {
    throw new Error('Please complete AI score assessment first');
  }

  // 确保AI评分是数字类型
  const aiScore = Number(userScore[0].aiScore);
  
  if (isNaN(aiScore) || aiScore <= 0) {
    throw new Error('Invalid AI score, please complete AI score assessment again');
  }
  
  // 生成0.2-1之间的随机倍数（保留2位小数）
  const randomMultiplier = Math.round((0.2 + Math.random() * 0.8) * 100) / 100;
  
  // 计算奖励（四舍五入取整，最小值为1）
  const calculatedReward = Math.round(aiScore * randomMultiplier);
  const reward = Math.max(1, calculatedReward); // 确保最小奖励为1
  
  // 计算连续签到天数（保留原有逻辑用于统计）
  const recentCheckins: any[] = await prisma.$queryRaw`
    SELECT checkin_date, streak_count FROM daily_checkins 
    WHERE user_id = ${userId} 
    ORDER BY checkin_date DESC 
    LIMIT 1
  `;
  
  let streakCount = 1;
  if (recentCheckins.length > 0) {
    const lastCheckin = recentCheckins[0];
    const lastDate = new Date(lastCheckin.checkin_date);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // 连续签到
      streakCount = lastCheckin.streak_count + 1;
    } else if (diffDays > 1) {
      // 中断了，重新开始
      streakCount = 1;
    }
  }
  
  // 创建签到记录，包含随机倍数信息
  await prisma.$queryRaw`
    INSERT INTO daily_checkins (user_id, checkin_date, streak_count, reward, ai_score, multiplier, description)
    VALUES (${userId}, CAST(${today} AS DATE), ${streakCount}, ${reward}, ${aiScore}, ${randomMultiplier}, ${`Daily Check-in: ${randomMultiplier}x multiplier × ${aiScore} AI Score = ${reward} $XOGS`})
  `;

  // 注意：不在这里直接更新用户余额，统一通过任务系统的 handleClaimReward 来处理
  
  // 更新用户统计中的连续签到天数
  await prisma.$queryRaw`
    UPDATE task_stats 
    SET current_streak = ${streakCount}, max_streak = GREATEST(max_streak, ${streakCount})
    WHERE user_id = ${userId}
  `;

  return {
    success: true,
    message: 'Daily check-in completed',
    canClaim: true,
    streakCount: streakCount,
    reward: reward,
    aiScore: aiScore,
    multiplier: randomMultiplier,
    calculation: `${aiScore} × ${randomMultiplier} = ${reward}`
  };
}

async function handleFollowTwitter(userId: string) {
  try {
    // 获取用户的 Twitter 访问令牌
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        accessToken: true,
        twitterId: true,
        username: true
      }
    });

    if (!user || !user.accessToken) {
      throw new Error('Twitter account not connected. Please reconnect your Twitter account.');
    }

    // 检查令牌是否过期
    const tokenCheck = await prisma.user.findUnique({
      where: { id: userId },
      select: { tokenExpiresAt: true }
    });

    if (tokenCheck?.tokenExpiresAt && new Date() > tokenCheck.tokenExpiresAt) {
      throw new Error('Twitter access token expired. Please reconnect your account.');
    }

    const OFFICIAL_TWITTER_USERNAME = 'xogsfun'; // 官方推特用户名

    try {
      // 1. 首先获取官方账号的 Twitter ID
      const controller1 = new AbortController();
      const timeoutId1 = setTimeout(() => controller1.abort(), 10000);
      
      const officialUserResponse = await fetch(
        `https://api.twitter.com/2/users/by/username/${OFFICIAL_TWITTER_USERNAME}`,
        {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller1.signal
        }
      );
      
      clearTimeout(timeoutId1);

      if (!officialUserResponse.ok) {
        throw new Error(`Failed to get official account info: ${officialUserResponse.status}`);
      }

      const officialUserData = await officialUserResponse.json();
      const officialTwitterId = officialUserData?.data?.id;

      if (!officialTwitterId) {
        throw new Error('Official Twitter account not found');
      }

      // 2. 检查用户是否关注了官方账号
      const controller2 = new AbortController();
      const timeoutId2 = setTimeout(() => controller2.abort(), 15000);
      
      const followingResponse = await fetch(
        `https://api.twitter.com/2/users/${user.twitterId}/following?max_results=1000`,
        {
          headers: {
            'Authorization': `Bearer ${user.accessToken}`,
            'Content-Type': 'application/json',
          },
          signal: controller2.signal
        }
      );
      
      clearTimeout(timeoutId2);

      if (!followingResponse.ok) {
        if (followingResponse.status === 429) {
          throw new Error('Twitter API rate limit reached. Please try again later.');
        }
        if (followingResponse.status === 401) {
          throw new Error('Twitter authorization expired. Please reconnect your account.');
        }
        if (followingResponse.status === 403) {
          throw new Error('Twitter permissions insufficient. Please reconnect your Twitter account to grant additional permissions for reading your following list.');
        }
        throw new Error(`Failed to check following status: ${followingResponse.status}`);
      }

      const followingData = await followingResponse.json();
      const followingList = followingData?.data || [];

      // 检查是否在关注列表中
      const isFollowing = followingList.some((followedUser: any) => 
        followedUser.id === officialTwitterId
      );

      if (!isFollowing) {
        throw new Error(`Please follow @${OFFICIAL_TWITTER_USERNAME} on Twitter first, then try again.`);
      }

      // 获取用户AI评分来计算奖励
      const userScore: any[] = await prisma.$queryRaw`
        SELECT "aiScore" FROM "User" WHERE id = ${userId}
      `;
      
      if (!userScore || userScore.length === 0 || !userScore[0].aiScore || userScore[0].aiScore === 0) {
        throw new Error('Please complete AI score assessment first to calculate your reward.');
      }

      // 确保AI评分是数字类型
      const aiScore = Number(userScore[0].aiScore);
      
      if (isNaN(aiScore) || aiScore <= 0) {
        throw new Error('Invalid AI score, please complete AI score assessment again.');
      }

      // 计算2倍AI评分奖励（最小值为1）
      const calculatedReward = Math.round(aiScore * 2);
      const reward = Math.max(1, calculatedReward);

      // 验证成功
  return {
    success: true,
        message: `Successfully verified Twitter follow for @${OFFICIAL_TWITTER_USERNAME}! You will receive ${reward} $XOGS (2x your AI Score).`,
        canClaim: true,
        reward: reward,
        officialAccount: OFFICIAL_TWITTER_USERNAME,
        aiScore: aiScore,
        calculation: `${aiScore} × 2 = ${reward}`,
        verificationDetails: {
          userTwitterId: user.twitterId,
          officialTwitterId: officialTwitterId,
          followingCount: followingList.length,
          verifiedAt: new Date().toISOString()
        }
      };

    } catch (apiError: any) {
      console.error('Twitter API error in follow verification:', {
        error: apiError.message,
        userId: userId,
        twitterId: user.twitterId
      });

      // 处理特定的 API 错误
      if (apiError.message.includes('rate limit')) {
        throw new Error('Twitter API rate limit reached. Please wait 15 minutes and try again.');
      }
      
      if (apiError.message.includes('authorization')) {
        throw new Error('Twitter account connection expired. Please sign out and sign in again.');
      }

      if (apiError.message.includes('Please follow')) {
        throw apiError; // 重新抛出，保持原始消息
      }

      if (apiError.message.includes('AI score')) {
        throw apiError; // 重新抛出AI评分相关错误
      }

      if (apiError.message.includes('permissions insufficient')) {
        throw apiError; // 重新抛出权限不足错误，提示用户重连
      }

      throw new Error('Unable to verify Twitter follow status automatically. Please ensure you have followed @xogsfun and try reconnecting your Twitter account if the problem persists.');
    }

  } catch (error: any) {
    console.error('Error in handleFollowTwitter:', error);
    throw error;
  }
}

async function handleJoinTelegram(userId: string) {
  // 加入 Telegram 群逻辑 - 简化版本
  return {
    success: true,
    message: 'Telegram join task completed',
    canClaim: true,
    telegramLink: 'https://t.me/xogsfun'
  };
}

async function handleInviteFriends(userId: string) {
  // 邀请好友逻辑 - 检查邀请记录
  const inviteCount: any[] = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM "Invite" WHERE "inviterId" = ${userId}
  `;
  
  const count = parseInt(inviteCount[0].count) || 0;
  
  if (count === 0) {
    throw new Error('No successful invitations found');
  }

  return {
    success: true,
    message: 'Friend invitation task completed',
    canClaim: true,
    inviteCount: count
  };
}

async function handleCompleteAIScore(userId: string) {
  // 完成AI评分逻辑 - 检查用户是否有AI评分
  const userScore: any[] = await prisma.$queryRaw`
    SELECT "aiScore" FROM "User" WHERE id = ${userId}
  `;
  
  if (!userScore || userScore.length === 0 || userScore[0].aiScore === 0) {
    throw new Error('AI score not completed yet');
  }

  return {
    success: true,
    message: 'AI score task completed',
    canClaim: true,
    aiScore: userScore[0].aiScore
  };
}

async function handleShareScore(userId: string) {
  // 分享评分逻辑 - 简化版本
  return {
    success: true,
    message: 'Score sharing task completed',
    canClaim: true
  };
}

async function handleWeeklyChallenge(userId: string) {
  // 每周挑战逻辑 - 简化版本
  return {
    success: true,
    message: 'Weekly challenge task completed',
    canClaim: true
  };
}

async function handleProfileComplete(userId: string) {
  // 完善资料逻辑 - 检查用户资料完整度
  const userProfile: any[] = await prisma.$queryRaw`
    SELECT "name", "description", "profileImageUrl" FROM "User" WHERE id = ${userId}
  `;
  
  if (!userProfile || userProfile.length === 0) {
    throw new Error('User profile not found');
  }
  
  const profile = userProfile[0];
  const completionFields = [profile.name, profile.description, profile.profileImageUrl];
  const completedFields = completionFields.filter(field => field && field.trim() !== '').length;
  
  if (completedFields < 2) {
    throw new Error('Profile not complete enough (need at least 2 fields filled)');
  }

  return {
    success: true,
    message: 'Profile completion task completed',
    canClaim: true,
    completionRate: Math.round((completedFields / completionFields.length) * 100)
  };
} 