-- 🎯 签到奖励调整 - 从 1-3倍 降低到 0.2-1倍
-- 执行日期：需要时立即执行
-- 执行影响：降低签到奖励力度，避免代币通胀

-- 1. 更新签到任务描述（中文）
UPDATE tasks 
SET 
    description = '每天签到获得 $XOGS 奖励，获得0.2x-1x倍数 × 你的AI评分！',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'daily-checkin';

-- 2. 验证更新结果
SELECT 
    id, 
    title, 
    description, 
    reward,
    updated_at
FROM tasks 
WHERE id = 'daily-checkin';

-- 3. 检查最近的签到记录（了解当前奖励水平）
SELECT 
    DATE(checkin_date) as date,
    COUNT(*) as checkin_count,
    ROUND(AVG(ai_score), 2) as avg_ai_score,
    ROUND(AVG(multiplier), 2) as avg_multiplier,
    ROUND(AVG(reward), 2) as avg_reward,
    MAX(reward) as max_reward,
    MIN(reward) as min_reward
FROM daily_checkins 
WHERE checkin_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(checkin_date)
ORDER BY date DESC;

-- 4. 预测新奖励水平影响
-- 当前：1-3倍 × AI评分
-- 新的：0.2-1倍 × AI评分
-- 减少幅度：约60-80%

-- 预计影响示例：
-- AI评分 = 50
-- 旧奖励范围：50-150 $XOGS
-- 新奖励范围：10-50 $XOGS

-- AI评分 = 100  
-- 旧奖励范围：100-300 $XOGS
-- 新奖励范围：20-100 $XOGS

-- 🎯 调整完成！
-- 新的签到奖励将在下次用户签到时生效
-- 此调整有助于：
-- ✅ 控制代币供应量
-- ✅ 延长项目生命周期
-- ✅ 保持奖励机制的可持续性 