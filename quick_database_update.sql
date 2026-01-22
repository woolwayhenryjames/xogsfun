-- 🎲 随机倍数签到功能 - 快速数据库更新
-- 请在您的数据库中执行以下SQL语句

-- 1. 升级 daily_checkins 表（添加倍数和AI评分字段）
ALTER TABLE daily_checkins 
ADD COLUMN IF NOT EXISTS ai_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS multiplier DECIMAL(3,2) DEFAULT 1.00,
ADD COLUMN IF NOT EXISTS description TEXT;

-- 2. 更新签到任务定义（关键更改）
UPDATE tasks 
SET 
    title = 'Daily Check-in',
    description = 'Check in daily to earn $XOGS rewards! Get 0.2x-1x multiplier × your AI Score',
    reward = 0
WHERE id = 'daily-checkin';

-- 3. 如果任务不存在，则插入
INSERT INTO tasks (id, type, title, description, reward, icon, difficulty, category, requirements, is_repeatable, cooldown_hours) 
VALUES ('daily-checkin', 'daily_checkin', 'Daily Check-in', 'Check in daily to earn $XOGS rewards! Get 0.2x-1x multiplier × your AI Score', 0, 'calendar', 'easy', 'daily', '{}', true, 24)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward = EXCLUDED.reward;

-- 4. 验证更新（可选）
SELECT id, title, description, reward FROM tasks WHERE id = 'daily-checkin';

-- 5. 检查表结构（可选）
\d daily_checkins; 

-- 🐦 关注官方推特任务配置 - 新增部分
-- 6. 更新/插入关注推特任务
INSERT INTO tasks (id, type, title, description, reward, icon, difficulty, category, requirements, is_repeatable, cooldown_hours) 
VALUES ('follow-twitter', 'follow_twitter', '关注官方推特', '关注 @xogsfun 官方推特账号，获取最新消息和奖励！', 50, 'twitter', 'easy', 'social', '{"twitterHandle": "xogsfun"}', false, 0)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward = EXCLUDED.reward,
    requirements = EXCLUDED.requirements,
    updated_at = CURRENT_TIMESTAMP;

-- 7. 验证关注推特任务
SELECT id, title, description, reward FROM tasks WHERE id = 'follow-twitter';

-- 🔧 数据库升级完成
-- 现在用户签到时将获得：
-- - 随机倍数：0.2x 到 1x（降低奖励力度）
-- - 奖励计算：倍数 × AI评分，四舍五入取整，最小值为1
-- - 示例：AI评分50，倍数0.8，奖励 = round(50 × 0.8) = 40 $XOGS
-- 
-- 更新影响：
-- ✅ 降低了签到奖励力度，避免通胀
-- ✅ 保留了随机性和趣味性
-- ✅ 确保最小奖励为1，避免0奖励情况 