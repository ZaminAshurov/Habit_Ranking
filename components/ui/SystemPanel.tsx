'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { ReactNode } from 'react'

interface SystemPanelProps {
  children: ReactNode
  title?: string
  subtitle?: string
  className?: string
  chamfer?: boolean
  glow?: boolean
  decorator?: boolean
}

export default function SystemPanel({
  children,
  title,
  subtitle,
  className,
  chamfer = true,
  glow = false,
  decorator = true,
}: SystemPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={cn(
        'system-panel p-6',
        chamfer && 'chamfer',
        glow && 'system-panel-glow',
        className
      )}
    >
      {/* Header Bar */}
      {(title || decorator) && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--glass-border)]">
          <div className="flex flex-col">
            {title && (
              <h2 className="font-display text-lg tracking-wider uppercase text-[var(--text-primary)]">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {decorator && (
            <span className="font-display text-[10px] tracking-[0.2em] text-[var(--text-muted)] opacity-60">
              // SYSTEM
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>
    </motion.div>
  )
}

// Compact stat card variant
interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  accentColor?: string
  className?: string
}

export function StatCard({ label, value, icon, accentColor, className }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={cn(
        'system-panel p-4 chamfer',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-[var(--text-muted)] mb-1">
            {label}
          </p>
          <p
            className="text-2xl font-bold font-display"
            style={{ color: accentColor || 'var(--text-primary)' }}
          >
            {value}
          </p>
        </div>
        {icon && (
          <div
            className="text-2xl opacity-80"
            style={{ color: accentColor || 'var(--system-blue)' }}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  )
}
