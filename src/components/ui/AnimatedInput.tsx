'use client'

import React, { useState } from 'react'
import { cn } from '@/utils/cn'

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({
  label,
  error,
  icon,
  className,
  ...props
}) => {
  const [focused, setFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0)
    if (props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}
        <input
          {...props}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={cn(
            'w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl',
            'text-gray-800 placeholder-transparent transition-all duration-300',
            'focus:outline-none focus:border-blue-400 focus:bg-white/20',
            icon && 'pl-12',
            error && 'border-red-400 focus:border-red-400',
            className
          )}
          placeholder=""
        />
        <label
          className={cn(
            'absolute left-4 transition-all duration-300 pointer-events-none',
            'text-gray-600 font-medium',
            icon && 'left-12',
            (focused || hasValue || props.value) 
              ? 'top-2 text-xs text-blue-600 font-semibold' 
              : 'top-1/2 transform -translate-y-1/2 text-base'
          )}
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-400 font-medium animate-shake">
          {error}
        </p>
      )}
    </div>
  )
}
