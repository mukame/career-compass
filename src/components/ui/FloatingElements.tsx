'use client'

import React from 'react'

export const FloatingElements: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* 浮遊する幾何学形状 */}
      <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400 rounded-full animate-bounce opacity-60" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-40 left-1/4 w-8 h-8 bg-pink-400 rounded-full animate-bounce opacity-50" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-bounce opacity-70" style={{ animationDelay: '0.5s', animationDuration: '3.5s' }}></div>
      
      {/* 回転する円 */}
      <div className="absolute top-1/4 left-1/2 w-20 h-20 border-2 border-blue-200 rounded-full animate-spin opacity-20" style={{ animationDuration: '20s' }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-16 h-16 border-2 border-purple-200 rounded-full animate-spin opacity-30" style={{ animationDuration: '15s', animationDirection: 'reverse' }}></div>
    </div>
  )
}
