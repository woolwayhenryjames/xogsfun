interface ScoreBreakdown {
  score: number;
  details: string;
}

interface ScoreCalculation {
  registrationAge: number;
  followersScore: number;
  followingRatio: number;
  tweetsScore: number;
  verificationScore: number;
  totalScore: number;
  breakdown: {
    registrationAge: ScoreBreakdown;
    followers: ScoreBreakdown;
    followingRatio: ScoreBreakdown;
    tweets: ScoreBreakdown;
    verification: ScoreBreakdown;
  };
}

interface UserData {
  followersCount: number | null;
  friendsCount: number | null;
  statusesCount: number | null;
  verified: boolean | null;
  twitterCreatedAt: Date | null;
}

// Calculate registration age score (max 15 points)
function calculateRegistrationAgeScore(twitterCreatedAt: Date | null): ScoreBreakdown {
  if (!twitterCreatedAt) {
    return { score: 0, details: 'No registration time information' };
  }

  const currentYear = new Date().getFullYear();
  const registrationYear = twitterCreatedAt.getFullYear();
  const yearsDiff = currentYear - registrationYear;

  const score = Math.min(yearsDiff * 1.5, 15);

  return {
    score: Math.round(score * 10) / 10,
    details: `Registered ${yearsDiff} years, score ${score.toFixed(1)}/15`
  };
}

// Calculate follower count score (max 40 points)
function calculateFollowersScore(followersCount: number | null): ScoreBreakdown {
  if (!followersCount || followersCount < 0) {
    return { score: 0, details: 'No follower data' };
  }

  let score = 0;
  let details = '';

  if (followersCount < 10000) {
    // Less than 10K: follower count / 10K × 10 points
    score = (followersCount / 10000) * 10;
    details = `${followersCount.toLocaleString()} followers, under 10K tier`;
  } else if (followersCount <= 100000) {
    // 10K~100K: 10 + (follower count - 10K) / 90K × 15 points
    score = 10 + ((followersCount - 10000) / 90000) * 15;
    details = `${followersCount.toLocaleString()} followers, 10K-100K tier`;
  } else if (followersCount <= 1000000) {
    // 100K~1M: 25 + (follower count - 100K) / 900K × 10 points
    score = 25 + ((followersCount - 100000) / 900000) * 10;
    details = `${followersCount.toLocaleString()} followers, 100K-1M tier`;
  } else {
    // Over 1M: 35 + ((follower count - 1M) / 1M × 5), max 40 points
    score = Math.min(35 + ((followersCount - 1000000) / 1000000) * 5, 40);
    details = `${followersCount.toLocaleString()} followers, over 1M tier`;
  }

  return {
    score: Math.round(score * 10) / 10,
    details: `${details}, score ${score.toFixed(1)}/40`
  };
}

// Calculate following/follower ratio score (max 5 points)
function calculateFollowingRatioScore(
  followersCount: number | null,
  friendsCount: number | null
): ScoreBreakdown {
  if (!followersCount || !friendsCount || followersCount === 0) {
    return { score: 0, details: 'Unable to calculate following ratio' };
  }

  const ratio = friendsCount / followersCount;
  let score = 5;

  if (ratio >= 0.1 && ratio <= 2) {
    // Ratio between 0.1~2 gets full score
    score = 5;
  } else {
    // Score deduction based on log10 distance outside range
    let distance = 0;
    if (ratio < 0.1) {
      distance = Math.log10(0.1 / ratio);
    } else if (ratio > 2) {
      distance = Math.log10(ratio / 2);
    }

    score = Math.max(0, 5 - distance * 2);
  }

  return {
    score: Math.round(score * 10) / 10,
    details: `Following ${friendsCount.toLocaleString()}/Followers ${followersCount.toLocaleString()}, ratio ${ratio.toFixed(3)}, score ${score.toFixed(1)}/5`
  };
}

// Calculate tweet count score (max 5 points)
function calculateTweetsScore(
  statusesCount: number | null,
  twitterCreatedAt: Date | null
): ScoreBreakdown {
  if (!statusesCount || !twitterCreatedAt) {
    return { score: 0, details: 'No tweet data' };
  }

  const currentDate = new Date();
  const registrationDate = twitterCreatedAt;
  const yearsDiff = (currentDate.getTime() - registrationDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

  if (yearsDiff <= 0) {
    return { score: 0, details: 'Registration time abnormal' };
  }

  const tweetsPerYear = statusesCount / yearsDiff;
  let score = 0;

  if (tweetsPerYear >= 50 && tweetsPerYear <= 365) {
    // 50~365 tweets per year gets full score
    score = 5;
  } else if (tweetsPerYear < 50) {
    // Less than 50 gets proportional score
    score = (tweetsPerYear / 50) * 5;
  } else {
    // More than 365, deduct 5 points for every 1000 extra
    const excess = tweetsPerYear - 365;
    const penalty = Math.floor(excess / 1000) * 5;
    score = Math.max(0, 5 - penalty);
  }

  return {
    score: Math.round(score * 10) / 10,
    details: `${statusesCount.toLocaleString()} tweets, ${tweetsPerYear.toFixed(0)} per year average, score ${score.toFixed(1)}/5`
  };
}

// Calculate verification score (max 5 points)
function calculateVerificationScore(verified: boolean | null): ScoreBreakdown {
  const score = verified ? 5 : 0;
  return {
    score,
    details: verified ? 'Verified, 5 points' : 'Not verified, 0 points'
  };
}

// Main calculation function
export function calculateAIScore(userData: UserData): ScoreCalculation {
  const registrationAge = calculateRegistrationAgeScore(userData.twitterCreatedAt);
  const followers = calculateFollowersScore(userData.followersCount);
  const followingRatio = calculateFollowingRatioScore(userData.followersCount, userData.friendsCount);
  const tweets = calculateTweetsScore(userData.statusesCount, userData.twitterCreatedAt);
  const verification = calculateVerificationScore(userData.verified);

  const totalScore = registrationAge.score + followers.score + followingRatio.score + tweets.score + verification.score;

  return {
    registrationAge: registrationAge.score,
    followersScore: followers.score,
    followingRatio: followingRatio.score,
    tweetsScore: tweets.score,
    verificationScore: verification.score,
    totalScore: Math.round(totalScore * 10) / 10,
    breakdown: {
      registrationAge,
      followers,
      followingRatio,
      tweets,
      verification
    }
  };
}

// Calculate complete XOGS balance including all rewards
async function calculateCompleteXogsBalance(userId: string, newAiScore: number, prisma: any): Promise<number> {
  // 1. Base XOGS = AI Score × 10
  const baseXogs = newAiScore * 10;

  // 2. Get invite rewards
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
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

  let totalInviteRewards = 0;
  if (user) {
    // Inviter rewards = each invitee's AI score × 2
    const inviterRewards = (user.invitesSent || []).reduce((sum: number, invite: any) => {
      return sum + (invite.invitee.aiScore * 2);
    }, 0);

    // Invitee rewards = own AI score × 1 (only invited once)
    const inviteeRewards = user.invitesReceived ? (newAiScore * 1) : 0;

    totalInviteRewards = inviterRewards + inviteeRewards;
  }

  // 3. Get daily checkin rewards
  const checkinRewards: any[] = await prisma.$queryRaw`
    SELECT COALESCE(SUM(reward), 0) as total_checkin_rewards
    FROM daily_checkins
    WHERE user_id = ${userId}
  `;
  const totalCheckinRewards = parseInt(checkinRewards[0]?.total_checkin_rewards) || 0;

  // 4. Get task rewards (claimed tasks only)
  const taskRewards: any[] = await prisma.$queryRaw`
    SELECT COALESCE(SUM(reward), 0) as total_task_rewards
    FROM user_tasks
    WHERE user_id = ${userId} AND status = 'claimed'
  `;
  const totalTaskRewards = parseInt(taskRewards[0]?.total_task_rewards) || 0;

  // 5. Get InfoFi rewards (published tweets only)
  const infofiRewards: any[] = await prisma.$queryRaw`
    SELECT COALESCE(SUM("rewardAmount"), 0) as total_infofi_rewards
    FROM "Tweet"
    WHERE "userId" = ${userId} AND status = 'published' AND "rewardAmount" > 0
  `;
  const totalInfofiRewards = parseInt(infofiRewards[0]?.total_infofi_rewards) || 0;

  // 6. Calculate total correct balance
  const correctXogsBalance = baseXogs + totalInviteRewards + totalCheckinRewards + totalTaskRewards + totalInfofiRewards;

  console.log(`Balance calculation for user ${userId}:
    - Base XOGS (AI Score × 10): ${baseXogs}
    - Invite rewards: ${totalInviteRewards}
    - Daily checkin rewards: ${totalCheckinRewards}
    - Task rewards: ${totalTaskRewards}
    - InfoFi rewards: ${totalInfofiRewards}
    - Total: ${correctXogsBalance}`);

  return correctXogsBalance;
}

// Automatically update user AI score and xogs balance
export async function autoUpdateUserAIScore(userId: string, userData: UserData): Promise<number> {
  const { prisma } = await import('@/lib/database');

  try {
    const scoreCalculation = calculateAIScore(userData);
    const newScore = Math.round(scoreCalculation.totalScore);

    // Calculate correct xogs balance using the complete calculation
    const correctXogsBalance = await calculateCompleteXogsBalance(userId, newScore, prisma);

    // Update AI score and xogs balance in database
    await prisma.user.update({
      where: { id: userId },
      data: {
        aiScore: newScore,
        xogsBalance: correctXogsBalance,
      },
    });

    console.log(`User ${userId} AI score auto-updated to: ${newScore}, xogs balance: ${correctXogsBalance}`);
    return newScore;
  } catch (error) {
    console.error('Auto-update AI score and xogs balance failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Batch update all users' AI scores
export async function batchUpdateAllUsersAIScore(): Promise<{ updated: number; failed: number }> {
  const { prisma } = await import('@/lib/database');

  let updated = 0;
  let failed = 0;

  try {
    // Get all users with Twitter data
    const users = await prisma.user.findMany({
      where: {
        twitterCreatedAt: { not: null },
        followersCount: { not: null }
      },
      select: {
        id: true,
        followersCount: true,
        friendsCount: true,
        statusesCount: true,
        verified: true,
        twitterCreatedAt: true,
        aiScore: true,
      }
    });

    console.log(`Starting batch update of AI scores for ${users.length} users...`);

    for (const user of users) {
      try {
        const scoreCalculation = calculateAIScore({
          followersCount: user.followersCount,
          friendsCount: user.friendsCount,
          statusesCount: user.statusesCount,
          verified: user.verified,
          twitterCreatedAt: user.twitterCreatedAt,
        });

        const newScore = Math.round(scoreCalculation.totalScore);

        // Only update when score changes
        if (user.aiScore !== newScore) {
          // Calculate correct xogs balance using the complete calculation
          const correctXogsBalance = await calculateCompleteXogsBalance(user.id, newScore, prisma);

          await prisma.user.update({
            where: { id: user.id },
            data: {
              aiScore: newScore,
              xogsBalance: correctXogsBalance,
            },
          });

          console.log(`User ${user.id} AI score updated: ${user.aiScore} → ${newScore}, xogs balance: ${correctXogsBalance}`);
        }

        updated++;
      } catch (error) {
        console.error(`Failed to update AI score for user ${user.id}:`, error);
        failed++;
      }
    }

    return { updated, failed };
  } catch (error) {
    console.error('Batch update AI scores failed:', error);
    throw error;
  }
} 