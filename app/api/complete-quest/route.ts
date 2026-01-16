import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { calculateLevel, calculateHunterRank, calculateStreak } from '@/lib/xp'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { quest_id } = body

    if (!quest_id) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    // Get the quest to verify ownership and get XP reward
    const { data: quest, error: questError } = await supabase
      .from('quests')
      .select('*')
      .eq('id', quest_id)
      .eq('user_id', user.id)
      .single()

    if (questError || !quest) {
      return NextResponse.json({ error: 'Quest not found' }, { status: 404 })
    }

    // Check if already completed today (for daily quests)
    const today = new Date().toISOString().split('T')[0]
    const { data: existingCompletion } = await supabase
      .from('completions')
      .select('id')
      .eq('quest_id', quest_id)
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)
      .single()

    if (existingCompletion) {
      return NextResponse.json({ error: 'Quest already completed today' }, { status: 400 })
    }

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Calculate new XP and level
    const xpEarned = quest.xp_reward
    const newXp = profile.xp + xpEarned
    const newLevel = calculateLevel(newXp)
    const newRank = calculateHunterRank(newLevel)
    const leveledUp = newLevel > profile.level

    // Calculate streak
    const { newStreak } = calculateStreak(profile.last_active_date, profile.streak_count)

    // Record the completion
    const { error: completionError } = await supabase
      .from('completions')
      .insert({
        user_id: user.id,
        quest_id: quest_id,
        xp_earned: xpEarned,
      })

    if (completionError) {
      return NextResponse.json({ error: completionError.message }, { status: 500 })
    }

    // Update profile with new XP, level, rank, and streak
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({
        xp: newXp,
        level: newLevel,
        hunter_rank: newRank,
        streak_count: newStreak,
        last_active_date: today,
        total_quests_completed: profile.total_quests_completed + 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity for analytics
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        event_type: 'quest_completed',
        metadata: {
          quest_id: quest_id,
          quest_title: quest.title,
          xp_earned: xpEarned,
          leveled_up: leveledUp,
        },
      })

    return NextResponse.json({
      success: true,
      xp_earned: xpEarned,
      new_xp: newXp,
      new_level: newLevel,
      new_rank: newRank,
      leveled_up: leveledUp,
      new_streak: newStreak,
      profile: updatedProfile,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
