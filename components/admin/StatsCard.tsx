'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  color?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export default function StatsCard({ title, value, icon: Icon, color = 'var(--system-cyan)', trend }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="system-panel rounded-xl p-6"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-muted)] text-sm font-display uppercase tracking-wider mb-2">
            {title}
          </p>
          <p className="text-3xl font-display font-bold" style={{ color }}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 font-body ${trend.isPositive ? 'text-green-400' : 'text-[var(--penalty-red)]'}`}>
              {trend.isPositive ? '+' : ''}{trend.value}% from last week
            </p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  )
}
