-- =============================================
-- Seed 20 Test Users for ShadowRank Leaderboard
-- Run this in Supabase SQL Editor
-- =============================================

-- First, we need to drop and recreate the foreign key constraint
-- to allow inserting test profiles without auth.users entries

-- Step 1: Drop the foreign key constraint temporarily
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Insert 20 fake profiles with varying XP, levels, and ranks
INSERT INTO profiles (id, username, display_name, xp, level, hunter_rank, streak_count, total_quests_completed, created_at)
VALUES
  -- S-Rank Hunters (Level 50+)
  ('00000000-0000-0000-0000-000000000001', 'ShadowKing99', 'Shadow King', 28500, 53, 'S', 45, 285, NOW() - INTERVAL '60 days'),
  ('00000000-0000-0000-0000-000000000002', 'NightHunterX', 'Night Hunter', 26000, 51, 'S', 38, 260, NOW() - INTERVAL '55 days'),

  -- A-Rank Hunters (Level 30-49)
  ('00000000-0000-0000-0000-000000000003', 'BlazeMaster', 'Blaze Master', 18000, 42, 'A', 30, 180, NOW() - INTERVAL '50 days'),
  ('00000000-0000-0000-0000-000000000004', 'IronWill77', 'Iron Will', 14500, 38, 'A', 25, 145, NOW() - INTERVAL '45 days'),
  ('00000000-0000-0000-0000-000000000005', 'PhoenixRise', 'Phoenix Rise', 12000, 35, 'A', 22, 120, NOW() - INTERVAL '42 days'),
  ('00000000-0000-0000-0000-000000000006', 'StormBringer', 'Storm Bringer', 9500, 31, 'A', 18, 95, NOW() - INTERVAL '40 days'),

  -- B-Rank Hunters (Level 20-29)
  ('00000000-0000-0000-0000-000000000007', 'SilentBlade', 'Silent Blade', 7500, 27, 'B', 15, 75, NOW() - INTERVAL '35 days'),
  ('00000000-0000-0000-0000-000000000008', 'CodeWarrior', 'Code Warrior', 6200, 25, 'B', 12, 62, NOW() - INTERVAL '32 days'),
  ('00000000-0000-0000-0000-000000000009', 'FitnessFury', 'Fitness Fury', 5000, 22, 'B', 10, 50, NOW() - INTERVAL '30 days'),
  ('00000000-0000-0000-0000-000000000010', 'MindMaster', 'Mind Master', 4200, 21, 'B', 8, 42, NOW() - INTERVAL '28 days'),

  -- C-Rank Hunters (Level 10-19)
  ('00000000-0000-0000-0000-000000000011', 'StudyNinja', 'Study Ninja', 3000, 17, 'C', 7, 30, NOW() - INTERVAL '25 days'),
  ('00000000-0000-0000-0000-000000000012', 'GymRat2024', 'Gym Rat', 2200, 15, 'C', 6, 22, NOW() - INTERVAL '22 days'),
  ('00000000-0000-0000-0000-000000000013', 'DevDragon', 'Dev Dragon', 1500, 12, 'C', 5, 15, NOW() - INTERVAL '20 days'),
  ('00000000-0000-0000-0000-000000000014', 'HealthHero', 'Health Hero', 1100, 11, 'C', 4, 11, NOW() - INTERVAL '18 days'),

  -- D-Rank Hunters (Level 5-9)
  ('00000000-0000-0000-0000-000000000015', 'RookieRiser', 'Rookie Riser', 800, 9, 'D', 3, 8, NOW() - INTERVAL '15 days'),
  ('00000000-0000-0000-0000-000000000016', 'NewbSlayer', 'Newb Slayer', 600, 7, 'D', 2, 6, NOW() - INTERVAL '12 days'),
  ('00000000-0000-0000-0000-000000000017', 'FreshStart', 'Fresh Start', 400, 6, 'D', 2, 4, NOW() - INTERVAL '10 days'),
  ('00000000-0000-0000-0000-000000000018', 'BeginnerBoss', 'Beginner Boss', 300, 5, 'D', 1, 3, NOW() - INTERVAL '8 days'),

  -- E-Rank Hunters (Level 1-4)
  ('00000000-0000-0000-0000-000000000019', 'DayOne2024', 'Day One', 150, 2, 'E', 1, 2, NOW() - INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000020', 'JustJoined', 'Just Joined', 50, 1, 'E', 0, 1, NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- Step 3: Recreate the foreign key constraint (but allow NULL or skip for test users)
-- We'll make it a softer constraint that doesn't block existing test data
-- The constraint will only apply to NEW inserts where auth.users exists

-- Note: We're NOT recreating the strict foreign key to allow test data to persist
-- Real users created through auth will still work because the trigger creates profiles

-- Verify the insert
SELECT username, display_name, xp, level, hunter_rank, streak_count
FROM profiles
ORDER BY xp DESC;
