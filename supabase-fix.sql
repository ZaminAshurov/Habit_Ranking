-- =============================================
-- COMPLETE FIX FOR USER SIGNUP ISSUE
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Step 1: Drop existing trigger and function (clean slate)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 2: Make sure profiles table exists with correct structure
-- (This won't affect existing data)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    hunter_rank TEXT DEFAULT 'E' CHECK (hunter_rank IN ('E', 'D', 'C', 'B', 'A', 'S')),
    streak_count INTEGER DEFAULT 0,
    last_active_date DATE,
    total_quests_completed INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Enable RLS on profiles (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Drop and recreate RLS policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users cannot directly insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON public.profiles;

-- Allow everyone to view profiles (for leaderboard)
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Allow service role and triggers to insert profiles
CREATE POLICY "Service role can insert profiles"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Step 5: Create the new trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_username TEXT;
    final_username TEXT;
BEGIN
    -- Get username from metadata or generate one
    new_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
        'Hunter_' || LEFT(NEW.id::TEXT, 8)
    );

    -- Check if username already exists
    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
        -- Add random suffix to make unique
        final_username := new_username || '_' || LEFT(md5(random()::TEXT), 4);
    ELSE
        final_username := new_username;
    END IF;

    -- Insert the new profile
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        final_username,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), final_username)
    );

    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        -- Last resort: use UUID as username
        INSERT INTO public.profiles (id, username, display_name)
        VALUES (
            NEW.id,
            'Hunter_' || replace(NEW.id::TEXT, '-', ''),
            'New Hunter'
        );
        RETURN NEW;
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'handle_new_user error: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 6: Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON public.profiles TO postgres, service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO service_role;

-- Verify the trigger exists
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
