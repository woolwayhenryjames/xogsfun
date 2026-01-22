-- Debug Daily Check-in Status Issue
-- Run this query to diagnose why check-in shows as "Claimed" when user hasn't checked in today

-- 1. Check if there are any daily_checkins records for today
-- Replace 'YOUR_USER_ID' with your actual user ID
SET @user_id = 'YOUR_USER_ID';  -- Replace with your actual user ID

-- Check today's check-in records (using UTC date)
SELECT 
    'Daily Checkins for Today (UTC)' as check_type,
    checkin_date,
    reward,
    ai_score,
    multiplier,
    description,
    created_at
FROM daily_checkins 
WHERE user_id = @user_id 
AND checkin_date = CURRENT_DATE
ORDER BY created_at DESC;

-- 2. Check user_tasks records for daily-checkin today
SELECT 
    'User Tasks for Today (daily-checkin)' as check_type,
    task_id,
    status,
    completed_at,
    claimed_at,
    reward,
    created_at
FROM user_tasks 
WHERE user_id = @user_id 
AND task_id = 'daily-checkin'
AND DATE(completed_at) = CURRENT_DATE
ORDER BY completed_at DESC;

-- 3. Check all recent daily-checkin user_tasks (last 3 days)
SELECT 
    'Recent Daily Checkin Tasks (Last 3 Days)' as check_type,
    task_id,
    status,
    DATE(completed_at) as completion_date,
    DATE(claimed_at) as claim_date,
    completed_at,
    claimed_at,
    reward,
    created_at
FROM user_tasks 
WHERE user_id = @user_id 
AND task_id = 'daily-checkin'
AND completed_at >= CURRENT_DATE - INTERVAL '3 days'
ORDER BY completed_at DESC;

-- 4. Check if there are any orphaned user_tasks records (without corresponding daily_checkins)
SELECT 
    'Potential Orphaned Records' as check_type,
    ut.task_id,
    ut.status,
    ut.completed_at,
    ut.claimed_at,
    ut.reward,
    dc.checkin_date,
    dc.reward as dc_reward
FROM user_tasks ut
LEFT JOIN daily_checkins dc ON ut.user_id = dc.user_id 
    AND DATE(ut.completed_at) = dc.checkin_date
WHERE ut.user_id = @user_id 
AND ut.task_id = 'daily-checkin'
AND ut.completed_at >= CURRENT_DATE - INTERVAL '3 days'
AND dc.checkin_date IS NULL  -- No corresponding daily_checkins record
ORDER BY ut.completed_at DESC;

-- 5. Show current UTC date and time for reference
SELECT 
    'Current Time Reference' as check_type,
    CURRENT_DATE as current_utc_date,
    CURRENT_TIMESTAMP as current_utc_timestamp,
    NOW() as local_timestamp;

-- 6. Show task definition for daily-checkin
SELECT 
    'Task Definition' as check_type,
    id,
    title,
    description,
    reward,
    is_repeatable,
    cooldown_hours,
    is_active
FROM tasks 
WHERE id = 'daily-checkin'; 