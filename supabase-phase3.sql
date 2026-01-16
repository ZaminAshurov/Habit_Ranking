-- =============================================
-- PHASE 3: ANALYTICS & RETENTION ENGINE
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Step 1: Create Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Enable RLS on activity_logs
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Step 3: RLS Policies for activity_logs
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can view own activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.activity_logs;

CREATE POLICY "Users can insert own activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own activity logs"
    ON public.activity_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Step 4: Add is_admin column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Step 5: Admin policy for viewing all activity logs
CREATE POLICY "Admins can view all activity logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Step 6: RPC Function - get_user_streak (Gaps and Islands Algorithm)
CREATE OR REPLACE FUNCTION get_user_streak(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER;
BEGIN
    WITH daily_activity AS (
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM public.activity_logs
        WHERE user_id = target_user_id
    ),
    islands AS (
        SELECT
            activity_date,
            activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INTEGER as island
        FROM daily_activity
    ),
    streaks AS (
        SELECT
            island,
            COUNT(*) as streak_length,
            MAX(activity_date) as last_date
        FROM islands
        GROUP BY island
    )
    SELECT COALESCE(
        (SELECT streak_length
         FROM streaks
         WHERE last_date >= CURRENT_DATE - 1
         ORDER BY last_date DESC
         LIMIT 1),
        0
    ) INTO streak;

    RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: RPC Function - get_weekly_retention (Cohort Analysis)
CREATE OR REPLACE FUNCTION get_weekly_retention()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    WITH cohorts AS (
        SELECT
            id as user_id,
            DATE_TRUNC('week', created_at)::DATE as cohort_week
        FROM public.profiles
    ),
    activity_weeks AS (
        SELECT
            user_id,
            DATE_TRUNC('week', created_at)::DATE as activity_week
        FROM public.activity_logs
    ),
    retention AS (
        SELECT
            c.cohort_week,
            EXTRACT(WEEK FROM a.activity_week) - EXTRACT(WEEK FROM c.cohort_week) as week_number,
            COUNT(DISTINCT c.user_id) as users
        FROM cohorts c
        LEFT JOIN activity_weeks a ON c.user_id = a.user_id
        WHERE a.activity_week >= c.cohort_week
        GROUP BY c.cohort_week, week_number
    )
    SELECT json_agg(
        json_build_object(
            'cohort', cohort_week,
            'week', week_number,
            'users', users
        )
    ) INTO result
    FROM retention
    WHERE week_number <= 4;

    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: RPC Function - get_dau_stats (Daily Active Users)
CREATE OR REPLACE FUNCTION get_dau_stats(days_back INTEGER DEFAULT 7)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'date', day,
            'users', user_count
        ) ORDER BY day
    ) INTO result
    FROM (
        SELECT
            DATE(created_at) as day,
            COUNT(DISTINCT user_id) as user_count
        FROM public.activity_logs
        WHERE created_at >= CURRENT_DATE - days_back
        GROUP BY DATE(created_at)
    ) daily_stats;

    RETURN COALESCE(result, '[]'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: RPC Function - get_total_stats (For Admin Dashboard)
CREATE OR REPLACE FUNCTION get_total_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM public.profiles),
        'total_quests', (SELECT COUNT(*) FROM public.quests),
        'total_completions', (SELECT COUNT(*) FROM public.completions),
        'total_xp_awarded', (SELECT COALESCE(SUM(xp_earned), 0) FROM public.completions),
        'active_today', (SELECT COUNT(DISTINCT user_id) FROM public.activity_logs WHERE DATE(created_at) = CURRENT_DATE),
        'feedback_pending', (SELECT COUNT(*) FROM public.feedback WHERE status = 'pending')
    ) INTO result;

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 10: Admin policy for viewing all feedback
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;
CREATE POLICY "Admins can view all feedback"
    ON public.feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Verify tables and functions exist
SELECT 'activity_logs' as table_name, COUNT(*) as row_count FROM public.activity_logs
UNION ALL
SELECT 'profiles (is_admin)', COUNT(*) FROM public.profiles WHERE is_admin = true;
