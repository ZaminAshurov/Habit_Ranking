# AI-Assisted Development Workflow

This document describes how AI (Claude) was used to assist in developing ShadowRank.

## Overview

This project was developed using AI-assisted prompt engineering with Claude (Anthropic). The development workflow involved structured prompts for architecture design, code generation, debugging, and documentation.

## Development Phases

### Phase 1: Architecture Design

AI was used to define the tech stack, database schema, and security model. Key prompts focused on:

- Selecting appropriate technologies (Next.js, Supabase, Tailwind CSS)
- Designing the PostgreSQL schema with proper relationships
- Implementing Row Level Security (RLS) policies
- Creating the user authentication flow

### Phase 2: Code Generation

Features were broken into atomic commits with clear specifications for each component. The AI helped generate:

- React components with TypeScript types
- API routes with proper error handling
- Custom hooks for data fetching
- Tailwind CSS styling with the "Solo Leveling" aesthetic

### Phase 3: Advanced SQL - The "Gaps and Islands" Algorithm

One of the most technically interesting parts of this project was implementing streak calculation using the **"Gaps and Islands"** SQL technique.

#### The Problem

We needed to calculate a user's current streak of consecutive days with activity. Simply counting rows wouldn't work because users might skip days.

#### The Solution

The "Gaps and Islands" algorithm works by:

1. Getting all unique dates with activity
2. Subtracting a row number from each date to create "islands"
3. Dates in the same streak will have the same island value
4. Group by island to find streak lengths

```sql
CREATE OR REPLACE FUNCTION get_user_streak(target_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER;
BEGIN
    WITH daily_activity AS (
        -- Step 1: Get unique activity dates
        SELECT DISTINCT DATE(created_at) as activity_date
        FROM public.activity_logs
        WHERE user_id = target_user_id
    ),
    islands AS (
        -- Step 2: Create islands using row_number trick
        -- Consecutive dates will have same island value
        SELECT
            activity_date,
            activity_date - (ROW_NUMBER() OVER (ORDER BY activity_date))::INTEGER as island
        FROM daily_activity
    ),
    streaks AS (
        -- Step 3: Group by island to find streak lengths
        SELECT
            island,
            COUNT(*) as streak_length,
            MAX(activity_date) as last_date
        FROM islands
        GROUP BY island
    )
    -- Step 4: Get current streak (must include today or yesterday)
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
```

#### How It Works (Example)

For a user with activity on: Jan 1, Jan 2, Jan 3, Jan 5, Jan 6

| Date | Row Number | Date - Row = Island |
|------|------------|---------------------|
| Jan 1 | 1 | Dec 31 |
| Jan 2 | 2 | Dec 31 |
| Jan 3 | 3 | Dec 31 |
| Jan 5 | 4 | Jan 1 |
| Jan 6 | 5 | Jan 1 |

This creates two islands:
- Island "Dec 31": 3-day streak (Jan 1-3)
- Island "Jan 1": 2-day streak (Jan 5-6)

### Phase 4: Cohort Retention Analysis

The AI helped design a weekly retention query that tracks how many users from each signup cohort remain active in subsequent weeks:

```sql
CREATE OR REPLACE FUNCTION get_weekly_retention()
RETURNS JSON AS $$
...
    WITH cohorts AS (
        SELECT id as user_id, DATE_TRUNC('week', created_at)::DATE as cohort_week
        FROM public.profiles
    ),
    activity_weeks AS (
        SELECT user_id, DATE_TRUNC('week', created_at)::DATE as activity_week
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
...
$$;
```

## Prompt Engineering Techniques Used

### 1. Specificity
Prompts included exact technology versions, color hex codes, and component specifications.

### 2. Context-Provision
Each prompt included relevant code snippets and error messages to help the AI understand the current state.

### 3. Iterative Refinement
Initial outputs were refined through follow-up prompts that addressed edge cases and improved styling.

### 4. Structured Output
Prompts requested specific formats (TypeScript interfaces, SQL functions) to ensure consistency.

## Key Learnings

1. **Break complex features into steps** - The streak calculation was easier to implement by first understanding the algorithm conceptually, then translating to SQL.

2. **Use SQL for heavy lifting** - Server-side RPC functions are more efficient than client-side calculations for analytics.

3. **Security first** - Row Level Security policies were designed before writing application code to prevent security holes.

4. **Test incrementally** - Each feature was tested in isolation before integration.

## Tools Used

- **Claude (Anthropic)** - Primary AI assistant for code generation and architecture
- **Supabase SQL Editor** - Testing SQL functions
- **Vercel** - Deployment and testing
- **Chrome DevTools** - Debugging and performance testing

## Conclusion

AI-assisted development significantly accelerated the development process while maintaining code quality. The key was providing clear, specific prompts and iteratively refining the output to meet project requirements.

All AI-generated code was reviewed, tested, and modified to fit project requirements before deployment.
