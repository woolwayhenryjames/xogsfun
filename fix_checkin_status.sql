-- Fix Daily Check-in Status Display Issue
-- This script cleans up any inconsistent check-in records

-- Replace 'YOUR_USER_ID' with your actual user ID
SET @user_id = 'YOUR_USER_ID';  -- Replace with your actual user ID

-- Step 1: Check if there are any user_tasks records for today without corresponding daily_checkins
-- (This could cause the "Claimed" status to show incorrectly)

-- First, let's see what we have
SELECT 
    'Before Cleanup - User Tasks Today' as status,
    COUNT(*) as count
FROM user_tasks 
WHERE user_id = @user_id 
AND task_id = 'daily-checkin'
AND DATE(completed_at) = CURRENT_DATE;

SELECT 
    'Before Cleanup - Daily Checkins Today' as status,
    COUNT(*) as count
FROM daily_checkins 
WHERE user_id = @user_id 
AND checkin_date = CURRENT_DATE;

-- Step 2: Remove any orphaned user_tasks records for today's daily-checkin
-- (Records that exist in user_tasks but not in daily_checkins)
DELETE ut FROM user_tasks ut
LEFT JOIN daily_checkins dc ON ut.user_id = dc.user_id 
    AND DATE(ut.completed_at) = dc.checkin_date
WHERE ut.user_id = @user_id 
AND ut.task_id = 'daily-checkin'
AND DATE(ut.completed_at) = CURRENT_DATE
AND dc.checkin_date IS NULL;

-- Step 3: Verify cleanup
SELECT 
    'After Cleanup - User Tasks Today' as status,
    COUNT(*) as count
FROM user_tasks 
WHERE user_id = @user_id 
AND task_id = 'daily-checkin'
AND DATE(completed_at) = CURRENT_DATE;

SELECT 
    'After Cleanup - Daily Checkins Today' as status,
    COUNT(*) as count
FROM daily_checkins 
WHERE user_id = @user_id 
AND checkin_date = CURRENT_DATE;

-- Step 4: Clear any potential browser cache by updating task description timestamp
-- (This will trigger frontend to refetch task data)
UPDATE tasks 
SET updated_at = CURRENT_TIMESTAMP 
WHERE id = 'daily-checkin';

-- Step 5: Verification query - should show 0 records for today if user hasn't checked in
SELECT 
    'Final Verification' as status,
    CASE 
        WHEN COUNT(*) = 0 THEN 'SUCCESS: No check-in records for today - status should show Available'
        ELSE CONCAT('WARNING: ', COUNT(*), ' records found for today - status may still show Claimed')
    END as result
FROM user_tasks 
WHERE user_id = @user_id 
AND task_id = 'daily-checkin'
AND DATE(completed_at) = CURRENT_DATE;

-- Show current UTC time for reference
SELECT 
    'Current UTC Time' as info,
    CURRENT_DATE as utc_date,
    CURRENT_TIMESTAMP as utc_timestamp; 