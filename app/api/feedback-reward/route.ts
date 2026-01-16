import { createServerSupabaseClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient()

    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { xp_amount = 50 } = body

    // Get current profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update XP
    const newXp = profile.xp + xp_amount

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: newXp, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Log activity
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user.id,
        event_type: 'feedback_submitted',
        metadata: { xp_awarded: xp_amount },
      })

    return NextResponse.json({
      success: true,
      xp_awarded: xp_amount,
      new_xp: newXp,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
