'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        return
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) {
        // If profile doesn't exist, it might not have been created yet
        if (fetchError.code === 'PGRST116') {
          setError('Profile not found. Please try logging in again.')
        } else {
          throw fetchError
        }
      }

      setProfile(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch profile')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchProfile()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchProfile, supabase.auth])

  const refreshProfile = useCallback(() => {
    fetchProfile()
  }, [fetchProfile])

  return { profile, loading, error, refreshProfile }
}
