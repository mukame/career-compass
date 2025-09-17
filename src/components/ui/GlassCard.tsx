import React from 'react'
import { cn } from '@/utils/cn'

interface GlassCardProps {
  children: React.ReactNode
  className?: string
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'bg-white/20 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl',
        className
      )}
    >
      {children}
    </div>
  )
}
