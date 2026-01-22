-- 🐦 Follow Twitter Task - Neon Database Configuration
-- Please execute the following SQL statements in Neon Console

-- 1. Create or update the Follow Twitter task (English version with dynamic reward)
INSERT INTO tasks (id, type, title, description, reward, icon, difficulty, category, requirements, is_repeatable, cooldown_hours) 
VALUES (
    'follow-twitter', 
    'follow_twitter', 
    'Follow Official Twitter', 
    'Follow @xogsfun official Twitter account and get 2x your AI Score in $XOGS rewards! [Beta: Platform ID 10000, 10001 only]', 
    0, 
    'twitter', 
    'easy', 
    'social', 
    '{"twitterHandle": "xogsfun", "restrictedAccess": true, "allowedPlatformIds": [10000, 10001]}', 
    false, 
    0
) ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    reward = EXCLUDED.reward,
    icon = EXCLUDED.icon,
    difficulty = EXCLUDED.difficulty,
    category = EXCLUDED.category,
    requirements = EXCLUDED.requirements,
    is_repeatable = EXCLUDED.is_repeatable,
    cooldown_hours = EXCLUDED.cooldown_hours;

-- 2. Create unique index to ensure each user can only complete the Twitter follow task once
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_twitter_task_unique 
ON user_tasks (user_id, task_id) 
WHERE task_id = 'follow-twitter';

-- 3. Verify the task was created successfully
SELECT 
    id,
    type,
    title,
    description,
    reward,
    category,
    is_repeatable,
    cooldown_hours
FROM tasks 
WHERE id = 'follow-twitter';

-- 4. Check if there are any existing task records
SELECT COUNT(*) as existing_records
FROM user_tasks 
WHERE task_id = 'follow-twitter';

-- After execution, please confirm:
-- ✅ Task created successfully
-- ✅ Unique index created
-- ✅ Database connection is working
-- ✅ No syntax errors
-- ✅ Reward is set to 0 (dynamic calculation based on 2x AI Score)

-- Important Notes:
-- - Task reward is set to 0 because it's calculated dynamically (2x AI Score)
-- - Users must complete their AI Score assessment first
-- - Each user can only complete this task once
-- - The actual reward will be calculated when the task is completed 