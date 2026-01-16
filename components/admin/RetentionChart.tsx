'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface RetentionData {
  cohort: string
  week: number
  users: number
}

interface RetentionChartProps {
  data: RetentionData[]
  loading?: boolean
}

export default function RetentionChart({ data, loading }: RetentionChartProps) {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[var(--monarch-purple)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Group by week and sum users
  const weeklyData = data.reduce((acc, item) => {
    const week = `Week ${item.week}`
    if (!acc[week]) {
      acc[week] = { week, users: 0 }
    }
    acc[week].users += item.users
    return acc
  }, {} as Record<string, { week: string; users: number }>)

  const chartData = Object.values(weeklyData).sort((a, b) => {
    const weekA = parseInt(a.week.replace('Week ', ''))
    const weekB = parseInt(b.week.replace('Week ', ''))
    return weekA - weekB
  })

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="text-[var(--text-muted)] font-display">No retention data yet</p>
      </div>
    )
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--monarch-purple)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--monarch-purple)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(164, 128, 242, 0.1)" />
          <XAxis
            dataKey="week"
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--glass-border)' }}
          />
          <YAxis
            stroke="var(--text-muted)"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--glass-border)' }}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--glass-dark)',
              border: '1px solid var(--glass-border)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
            }}
            labelStyle={{ color: 'var(--text-secondary)' }}
          />
          <Area
            type="monotone"
            dataKey="users"
            stroke="var(--monarch-purple)"
            strokeWidth={3}
            fill="url(#purpleGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
