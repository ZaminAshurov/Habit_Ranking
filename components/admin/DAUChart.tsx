'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

interface DAUStat {
  date: string
  users: number
}

interface DAUChartProps {
  data: DAUStat[]
  loading?: boolean
}

export default function DAUChart({ data, loading }: DAUChartProps) {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-[var(--system-cyan)] border-t-transparent rounded-full"
        />
      </div>
    )
  }

  // Format data for display
  const formattedData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  }))

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={formattedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(53, 126, 199, 0.1)" />
          <XAxis
            dataKey="date"
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
          <Line
            type="monotone"
            dataKey="users"
            stroke="var(--mana-cyan)"
            strokeWidth={3}
            dot={{ fill: 'var(--mana-cyan)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: 'var(--mana-cyan)', stroke: 'white', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
