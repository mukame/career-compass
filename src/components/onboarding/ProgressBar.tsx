'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
  steps: Array<{ id: string; title: string }>;
  className?: string;
}

export default function ProgressBar({ current, total, steps, className = '' }: ProgressBarProps) {
  const progress = (current / total) * 100;

  return (
    <div className={`w-full ${className}`}>
      {/* ステップドット */}
      <div className="flex items-center justify-between mb-4 px-2">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="flex flex-col items-center relative"
          >
            <motion.div
              animate={{
                backgroundColor: index < current 
                  ? "rgb(139, 92, 246)" 
                  : index === current - 1 
                    ? "rgb(147, 51, 234)" 
                    : "rgba(255, 255, 255, 0.2)",
                scale: index === current - 1 ? 1.2 : 1
              }}
              transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white/30 backdrop-blur-sm"
            >
              {index < current ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Check className="w-4 h-4 text-white" />
                </motion.div>
              ) : (
                <span className="text-xs font-bold text-white">
                  {index + 1}
                </span>
              )}
            </motion.div>
            
            {/* ステップタイトル（スマホでは省略） */}
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="text-xs text-white/70 mt-2 font-medium hidden sm:block"
            >
              {step.title}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* プログレスバー */}
      <div className="relative">
        <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-500 rounded-full relative overflow-hidden"
          >
            <motion.div
              animate={{ x: ['0%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>
      
      {/* 進捗テキスト */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-between items-center mt-3"
      >
        <span className="text-sm font-medium text-white/80">
          {current}/{total} 完了
        </span>
        <span className="text-xs text-white/60">
          あと{total - current}ステップ
        </span>
      </motion.div>
    </div>
  );
}
