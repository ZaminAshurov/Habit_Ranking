import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { DIFFICULTY_XP } from '@/types/database'
import type { QuestDifficulty } from '@/types/database'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's quests
    const { data: quests, error: questsError } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (questsError) {
      return NextResponse.json({ error: questsError.message }, { status: 500 })
    }

    // Get today's completions
    const today = new Date().toISOString().split('T')[0]
    const { data: completions, error: completionsError } = await supabase
      .from('completions')
      .select('quest_id')
      .eq('user_id', user.id)
      .gte('completed_at', `${today}T00:00:00`)
      .lte('completed_at', `${today}T23:59:59`)

    if (completionsError) {
      return NextResponse.json({ error: completionsError.message }, { status: 500 })
    }

    const completedQuestIds = new Set(completions?.map(c => c.quest_id) || [])

    return NextResponse.json({
      quests,
      completedToday: Array.from(completedQuestIds)
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, category, difficulty, is_daily } = body

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    // Calculate XP reward based on difficulty
    const xp_reward = DIFFICULTY_XP[difficulty as QuestDifficulty] || 10

    const { data: quest, error: insertError } = await supabase
      .from('quests')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        category: category || 'general',
        difficulty: difficulty || 'E',
        xp_reward,
        is_daily: is_daily !== false,
        is_active: true,
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    return NextResponse.json(quest, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const questId = searchParams.get('id')

    if (!questId) {
      return NextResponse.json({ error: 'Quest ID is required' }, { status: 400 })
    }

    // Soft delete - just mark as inactive
    const { error: deleteError } = await supabase
      .from('quests')
      .update({ is_active: false })
      .eq('id', questId)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
