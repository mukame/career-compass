'use client'

import React from 'react'
import { cn } from '@/utils/cn'

interface ValueSelectorProps {
  label: string
  description: string
  value: number
  onChange: (value: number) => void
}

export const ValueSelector: React.FC<ValueSelectorProps> = ({
  label,
  description,
  value,
  onChange
}) => {
  const ratings = [
    { value: 1, label: '1', color: 'from-red-400 to-red-500', emoji: '😐' },
    { value: 2, label: '2', color: 'from-orange-400 to-orange-500', emoji: '🙂' },
    { value: 3, label: '3', color: 'from-yellow-400 to-yellow-500', emoji: '😊' },
    { value: 4, label: '4', color: 'from-green-400 to-green-500', emoji: '😍' },
    { value: 5, label: '5', color: 'from-purple-400 to-purple-500', emoji: '🤩' }
  ]

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">{label}</h3>
          <p className="text-blue-100">{description}</p>
        </div>
        <div className="ml-4 text-3xl">
          {value > 0 ? ratings[value - 1].emoji : '🤔'}
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            onClick={() => onChange(rating.value)}
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-300 relative overflow-hidden group',
              value === rating.value
                ? `bg-gradient-to-br ${rating.color} text-white scale-110 shadow-2xl ring-4 ring-white/30`
                : 'bg-white/20 text-white/70 hover:bg-white/30 hover:scale-105'
            )}
          >
            <span className="relative z-10">{rating.label}</span>
            {value === rating.value && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/20 rounded-2xl"></div>
              </>
            )}
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-sm text-blue-200">
        <span>重要でない</span>
        <span>非常に重要</span>
      </div>
      
      {/* プログレスバー */}
      <div className="mt-4 w-full bg-white/20 rounded-full h-2">
        <div 
          className={cn(
            'h-2 rounded-full transition-all duration-500',
            value > 0 ? `bg-gradient-to-r ${ratings[value - 1].color}` : 'bg-transparent'
          )}
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  )
}
