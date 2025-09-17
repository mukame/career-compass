'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Sparkles, Target, TrendingUp, ArrowRight, Stars } from 'lucide-react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const benefits = [
    {
      icon: Sparkles,
      title: 'AI分析で自己理解',
      description: '最新のAI技術で、あなたの強みや価値観を深く分析',
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      icon: Target,
      title: 'パーソナライズされた提案',
      description: 'あなたに最適化されたキャリアパスを具体的に提案',
      gradient: 'from-blue-400 to-purple-400'
    },
    {
      icon: TrendingUp,
      title: '継続的な成長サポート',
      description: '目標達成まで伴走し、着実な成長をサポート',
      gradient: 'from-green-400 to-blue-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6 }}
      className="text-center space-y-8"
    >
      {/* ヒーローセクション */}
      <div className="space-y-6">
        {/* ロゴアニメーション */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            delay: 0.2, 
            type: 'spring', 
            stiffness: 200, 
            damping: 15 
          }}
          className="relative inline-flex items-center justify-center"
        >
          <motion.div
            animate={{ 
              boxShadow: [
                "0 0 0 0 rgba(139, 92, 246, 0.5)",
                "0 0 0 20px rgba(139, 92, 246, 0)",
                "0 0 0 0 rgba(139, 92, 246, 0)"
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-br from-purple-400 via-pink-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl"
          >
            <Compass className="w-10 h-10 text-white" />
          </motion.div>
          
          {/* 浮遊する星 */}
          <motion.div
            animate={{ 
              y: [-10, 10, -10],
              rotate: [0, 180, 360]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-2 -right-2"
          >
            <Stars className="w-6 h-6 text-yellow-400" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
            <motion.span
              animate={{ 
                backgroundImage: [
                  "linear-gradient(45deg, #a855f7, #ec4899)",
                  "linear-gradient(45deg, #3b82f6, #a855f7)",
                  "linear-gradient(45deg, #10b981, #3b82f6)",
                  "linear-gradient(45deg, #a855f7, #ec4899)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
            >
              Career Compass
            </motion.span>
            <br />
            <span className="text-white">へようこそ</span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-white/80 leading-relaxed px-4"
          >
            AIの力であなたのキャリアを次のレベルへ
            <br />
            <span className="text-purple-300 font-semibold">3分でスタート</span>して、人生を変える一歩を
          </motion.p>
        </motion.div>
      </div>

      {/* 特徴カード */}
      <div className="space-y-4">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 + index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-xl"
          >
            <div className="flex items-start space-x-4">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${benefit.gradient} rounded-xl flex items-center justify-center shadow-lg`}
              >
                <benefit.icon className="w-6 h-6 text-white" />
              </motion.div>
              <div className="text-left flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-6 pt-4"
      >
        <motion.button
          onClick={onNext}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl relative overflow-hidden group"
        >
          <motion.div
            animate={{ x: ['0%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          />
          <span className="relative flex items-center justify-center text-lg">
            今すぐ始める
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </span>
        </motion.button>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex items-center justify-center space-x-6 text-sm text-white/60"
        >
          <span className="flex items-center">
            📱 <span className="ml-1">3分で完了</span>
          </span>
          <span className="flex items-center">
            🆓 <span className="ml-1">無料体験</span>
          </span>
          <span className="flex items-center">
            🔒 <span className="ml-1">安全保護</span>
          </span>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
