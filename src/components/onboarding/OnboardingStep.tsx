'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react';

interface OnboardingStepProps {
  step: number;
  title: string;
  description: string;
  isActive: boolean;
  isCompleted: boolean;
  isLast?: boolean;
}

export default function OnboardingStep({
  step,
  title,
  description,
  isActive,
  isCompleted,
  isLast = false
}: OnboardingStepProps) {
  return (
    <div className="flex items-center">
      <div className="flex items-center space-x-4">
        <motion.div
          initial={false}
          animate={{
            scale: isActive ? 1.1 : 1,
            backgroundColor: isCompleted 
              ? 'rgb(34, 197, 94)' 
              : isActive 
                ? 'rgb(99, 102, 241)' 
                : 'rgb(156, 163, 175)'
          }}
          className="relative flex items-center justify-center w-10 h-10 rounded-full"
        >
          {isCompleted ? (
            <CheckCircle2 className="w-6 h-6 text-white" />
          ) : (
            <span className="text-sm font-semibold text-white">{step}</span>
          )}
          
          {isActive && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -inset-2 bg-indigo-200 rounded-full opacity-30"
            />
          )}
        </motion.div>

        <div className="flex-1">
          <h3 className={`text-sm font-medium ${
            isActive ? 'text-indigo-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
          }`}>
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{description}</p>
        </div>
      </div>

      {!isLast && (
        <ChevronRight className={`w-4 h-4 ml-4 ${
          isCompleted ? 'text-green-400' : 'text-gray-300'
        }`} />
      )}
    </div>
  );
}
