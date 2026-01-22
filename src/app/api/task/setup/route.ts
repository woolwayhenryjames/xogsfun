import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// 任务系统数据库表结构 SQL 语句
const TASK_TABLES_SQL = `
-- 任务定义表
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(255) PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    reward INTEGER NOT NULL DEFAULT 0,
    icon VARCHAR(50),
    difficulty VARCHAR(20) DEFAULT 'easy',
    category VARCHAR(50) DEFAULT 'daily',
    requirements JSONB DEFAULT '{}',
    is_repeatable BOOLEAN DEFAULT false,
    cooldown_hours INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 用户任务记录表
CREATE TABLE IF NOT EXISTS user_tasks (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    task_id VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP NULL,
    claimed_at TIMESTAMP NULL,
    reward INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- 每日签到记录表
CREATE TABLE IF NOT EXISTS daily_checkins (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    checkin_date DATE NOT NULL,
    streak_count INTEGER DEFAULT 1,
    reward INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE(user_id, checkin_date)
);

-- 任务统计表
CREATE TABLE IF NOT EXISTS task_stats (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_rewards INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "User"(id) ON DELETE CASCADE,
    UNIQUE(user_id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_id ON user_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_task_id ON user_tasks(task_id);
CREATE INDEX IF NOT EXISTS idx_user_tasks_status ON user_tasks(status);
CREATE INDEX IF NOT EXISTS idx_user_tasks_completed_at ON user_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_id ON daily_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_date ON daily_checkins(checkin_date);
CREATE INDEX IF NOT EXISTS idx_task_stats_user_id ON task_stats(user_id);

-- 插入默认任务数据
INSERT INTO tasks (id, type, title, description, reward, icon, difficulty, category, requirements, is_repeatable, cooldown_hours) VALUES
('daily-checkin', 'daily_checkin', '每日签到', '每天签到获得 $XOGS 奖励，连续签到获得额外奖励！', 10, 'calendar', 'easy', 'daily', '{}', true, 24),
('follow-twitter', 'follow_twitter', 'Follow Official Twitter', 'Follow @xogsfun official Twitter account and get 2x your AI Score in $XOGS rewards! [Beta: Platform ID 10000, 10001 only]', 0, 'twitter', 'easy', 'social', '{"twitterHandle": "xogsfun", "restrictedAccess": true, "allowedPlatformIds": [10000, 10001]}', false, 0),
('join-telegram', 'join_telegram', '加入 Telegram 群', '加入官方 Telegram 群组，与社区成员互动交流！', 30, 'message', 'easy', 'social', '{"telegramGroup": "https://t.me/xogsfun"}', false, 0),
('invite-friends', 'invite_friends', '邀请好友', '邀请好友加入 XOGS，成功邀请可获得丰厚奖励！', 100, 'users', 'medium', 'social', '{"minInvites": 1}', true, 0),
('complete-ai-score', 'ai_score', '完成AI评分', '完成你的推特AI评分测试，了解你的影响力！', 25, 'bot', 'medium', 'engagement', '{}', false, 0),
('share-score', 'share_score', '分享AI评分', '在推特上分享你的AI评分结果，让更多人了解 XOGS！', 40, 'send', 'medium', 'engagement', '{}', false, 0),
('weekly-challenge', 'weekly_challenge', '每周挑战', '完成本周特殊挑战任务，获得额外奖励！', 200, 'trophy', 'hard', 'special', '{}', true, 168),
('profile-complete', 'profile_complete', '完善个人资料', '完善你的个人资料，让其他用户更好地了解你！', 20, 'star', 'easy', 'engagement', '{}', false, 0)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward = EXCLUDED.reward,
    icon = EXCLUDED.icon,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    requirements = EXCLUDED.requirements,
    is_repeatable = EXCLUDED.is_repeatable,
    cooldown_hours = EXCLUDED.cooldown_hours,
    updated_at = CURRENT_TIMESTAMP;

-- 更新触发器：自动更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER IF NOT EXISTS update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_user_tasks_updated_at BEFORE UPDATE ON user_tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER IF NOT EXISTS update_task_stats_updated_at BEFORE UPDATE ON task_stats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 只返回SQL语句，不实际执行
    return NextResponse.json({
      message: 'Task system database setup SQL',
      sql: TASK_TABLES_SQL,
      instructions: [
        '1. 请在你的数据库中执行以上SQL语句',
        '2. 这将创建任务系统所需的所有表结构',
        '3. 包括：tasks（任务定义）、user_tasks（用户任务记录）、daily_checkins（签到记录）、task_stats（任务统计）',
        '4. 同时会插入默认的任务数据',
        '5. 创建必要的索引以提高查询性能'
      ]
    });
  } catch (error) {
    console.error('Error generating task setup SQL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 