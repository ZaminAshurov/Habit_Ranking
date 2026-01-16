-- =============================================
-- ShadowRank Database Schema
-- Run this in Supabase SQL Editor
-- =============================================

-- PROFILES TABLE (User Stats & Ranking)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
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

-- QUESTS TABLE (User-defined Habits/Tasks)
CREATE TABLE quests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 10 CHECK (xp_reward >= 1 AND xp_reward <= 100),
    difficulty TEXT DEFAULT 'E' CHECK (difficulty IN ('E', 'D', 'C', 'B', 'A', 'S')),
    category TEXT DEFAULT 'general' CHECK (category IN ('study', 'fitness', 'coding', 'health', 'general')),
    is_daily BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- COMPLETIONS TABLE (Quest Completion Logs)
CREATE TABLE completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
    xp_earned INTEGER NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- FEEDBACK TABLE (Bug Reports & Suggestions)
CREATE TABLE feedback (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'other')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- PROFILES: Users can read all profiles (for leaderboard) but only update their own
CREATE POLICY "Public profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- QUESTS: Users can only CRUD their own quests
CREATE POLICY "Users can view own quests"
    ON quests FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own quests"
    ON quests FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quests"
    ON quests FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own quests"
    ON quests FOR DELETE
    USING (auth.uid() = user_id);

-- COMPLETIONS: Users can only view/create their own completions
CREATE POLICY "Users can view own completions"
    ON completions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can log own completions"
    ON completions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- FEEDBACK: Users can create feedback and view their own
CREATE POLICY "Users can submit feedback"
    ON feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own feedback"
    ON feedback FOR SELECT
    USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function to calculate level from XP
CREATE OR REPLACE FUNCTION calculate_level(xp_amount INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN FLOOR(SQRT(xp_amount / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate hunter rank from level
CREATE OR REPLACE FUNCTION calculate_hunter_rank(level_num INTEGER)
RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN level_num >= 50 THEN 'S'
        WHEN level_num >= 30 THEN 'A'
        WHEN level_num >= 20 THEN 'B'
        WHEN level_num >= 10 THEN 'C'
        WHEN level_num >= 5 THEN 'D'
        ELSE 'E'
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', 'Hunter_' || LEFT(NEW.id::TEXT, 8)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Hunter')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
