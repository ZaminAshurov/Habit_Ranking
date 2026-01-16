-- =============================================
-- COMPLETE DATABASE SETUP FOR SHADOWRANK
-- Run this entire script in Supabase SQL Editor
-- =============================================

-- Step 1: Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
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

-- Step 2: Create quests table
CREATE TABLE IF NOT EXISTS public.quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 1 AND xp_reward <= 100),
    difficulty TEXT DEFAULT 'E' CHECK (difficulty IN ('E', 'D', 'C', 'B', 'A', 'S')),
    category TEXT DEFAULT 'general' CHECK (category IN ('study', 'fitness', 'coding', 'health', 'general')),
    is_daily BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Create completions table
CREATE TABLE IF NOT EXISTS public.completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES public.quests(id) ON DELETE CASCADE NOT NULL,
    xp_earned INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Create feedback table
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'other')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

-- Step 6: RLS Policies for profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for service role" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for service role"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

-- Step 7: RLS Policies for quests
DROP POLICY IF EXISTS "Users can view own quests" ON public.quests;
DROP POLICY IF EXISTS "Users can create own quests" ON public.quests;
DROP POLICY IF EXISTS "Users can update own quests" ON public.quests;
DROP POLICY IF EXISTS "Users can delete own quests" ON public.quests;

CREATE POLICY "Users can view own quests"
    ON public.quests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
    ON public.quests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
    ON public.quests FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
    ON public.quests FOR DELETE USING (auth.uid() = user_id);

-- Step 8: RLS Policies for completions
DROP POLICY IF EXISTS "Users can view own completions" ON public.completions;
DROP POLICY IF EXISTS "Users can log own completions" ON public.completions;

CREATE POLICY "Users can view own completions"
    ON public.completions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can log own completions"
    ON public.completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Step 9: RLS Policies for feedback
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;

CREATE POLICY "Users can submit feedback"
    ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
    ON public.feedback FOR SELECT USING (auth.uid() = user_id);

-- Step 10: Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Step 11: Create trigger function
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
    new_username := COALESCE(
        NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''),
        'Hunter_' || LEFT(NEW.id::TEXT, 8)
    );

    IF EXISTS (SELECT 1 FROM public.profiles WHERE username = new_username) THEN
        final_username := new_username || '_' || LEFT(md5(random()::TEXT), 4);
    ELSE
        final_username := new_username;
    END IF;

    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        final_username,
        COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), ''), final_username)
    );

    RETURN NEW;
EXCEPTION
    WHEN unique_violation THEN
        INSERT INTO public.profiles (id, username, display_name)
        VALUES (NEW.id, 'Hunter_' || replace(NEW.id::TEXT, '-', ''), 'New Hunter');
        RETURN NEW;
    WHEN OTHERS THEN
        RAISE WARNING 'handle_new_user error: %', SQLERRM;
        RETURN NEW;
END;
$$;

-- Step 12: Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Step 13: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.quests TO authenticated;
GRANT ALL ON public.completions TO authenticated;
GRANT INSERT, SELECT ON public.feedback TO authenticated;

-- Verify tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
