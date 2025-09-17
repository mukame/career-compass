'use client'

import React from 'react'
import { cn } from '@/utils/cn'

interface StepIndicatorProps {
  steps: Array<{ id: number; title: string; description: string }>
  currentStep: number
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentStep }) => {
  return (
    <div className="relative">
      {/* 背景ライン */}
      <div className="absolute top-8 left-0 right-0 h-1 bg-white/20 rounded-full">
        <div 
          className="h-full bg-gradient-to-r from-blue-400 to-purple-500 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
      </div>

      {/* ステップ */}
      <div className="relative flex justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep
          const isCurrent = index === currentStep
          const isUpcoming = index > currentStep

          return (
            <div key={step.id} className="flex flex-col items-center relative">
              {/* ステップ円 */}
              <div
                className={cn(
                  'w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 relative z-10',
                  isCompleted && 'bg-gradient-to-br from-green-400 to-blue-500 text-white scale-110 shadow-2xl',
                  isCurrent && 'bg-gradient-to-br from-blue-500 to-purple-600 text-white scale-125 shadow-2xl animate-pulse',
                  isUpcoming && 'bg-white/20 text-white/60 backdrop-blur-sm'
                )}
              >
                {isCompleted ? (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
                
                {/* 輝きエフェクト */}
                {isCurrent && (
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 animate-ping opacity-75"></div>
                )}
              </div>

              {/* ステップタイトル */}
              <div className="mt-4 text-center max-w-24">
                <p className={cn(
                  'text-sm font-semibold transition-colors duration-300',
                  (isCompleted || isCurrent) && 'text-white',
                  isUpcoming && 'text-white/60'
                )}>
                  {step.title}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
