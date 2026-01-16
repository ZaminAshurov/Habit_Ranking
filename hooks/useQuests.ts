'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Quest, QuestCategory, QuestDifficulty } from '@/types/database'

interface QuestsData {
  quests: Quest[]
  completedToday: string[]
}

export function useQuests() {
  const [quests, setQuests] = useState<Quest[]>([])
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchQuests = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/quests')
      if (!response.ok) {
        throw new Error('Failed to fetch quests')
      }

      const data: QuestsData = await response.json()
      setQuests(data.quests || [])
      setCompletedToday(new Set(data.completedToday || []))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quests')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  const addQuest = useCallback(async (questData: {
    title: string
    description: string
    category: QuestCategory
    difficulty: QuestDifficulty
    is_daily: boolean
  }) => {
    const response = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questData),
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to create quest')
    }

    const newQuest = await response.json()
    setQuests(prev => [newQuest, ...prev])
    return newQuest
  }, [])

  const deleteQuest = useCallback(async (questId: string) => {
    const response = await fetch(`/api/quests?id=${questId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Failed to delete quest')
    }

    setQuests(prev => prev.filter(q => q.id !== questId))
  }, [])

  const markCompleted = useCallback((questId: string) => {
    setCompletedToday(prev => new Set([...prev, questId]))
  }, [])

  const refreshQuests = useCallback(() => {
    fetchQuests()
  }, [fetchQuests])

  return {
    quests,
    completedToday,
    loading,
    error,
    addQuest,
    deleteQuest,
    markCompleted,
    refreshQuests,
  }
}
