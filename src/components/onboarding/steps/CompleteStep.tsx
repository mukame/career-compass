'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CheckCircle2, 
  Sparkles, 
  Target, 
  Heart, 
  TrendingUp,
  ArrowRight,
  Gift,
  Star
} from 'lucide-react';
import Link from 'next/link';

interface CompleteStepProps {
  userName: string;
  selectedPlan: string;
  onComplete: () => void;
}

export default function CompleteStep({ userName, selectedPlan, onComplete }: CompleteStepProps) {
  const planNames = {
    free: 'フリープラン',
    standard: 'スタンダードプラン', 
    premium: 'プレミアムプラン'
  };

  const nextActions = [
    {
      title: 'AI分析を試す',
      description: '4つの分析機能で自己理解を深めましょう',
      icon: Sparkles,
      href: '/ai-analysis',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'ダッシュボードを確認',
      description: 'あなたの進捗や分析結果を一覧できます',
      icon: TrendingUp,
      href: '/dashboard',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: '目標を管理',
      description: 'キャリア目標の進捗を追跡しましょう',
      icon: Target,
      href: '/goals',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const benefits = [
    '🎯 パーソナライズされたAI分析',
    '📈 継続的な成長追跡',
    '💼 キャリア目標の管理',
    '🔍 詳細な分析レポート',
    '💬 専門的なアドバイス',
    '🎁 限定コンテンツへのアクセス'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="max-w-4xl mx-auto text-center"
    >
      {/* 成功アニメーション */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-2xl border-4 border-white/50">
          <CheckCircle2 className="w-16 h-16 text-white drop-shadow-lg" />
        </div>
        
        {/* 祝福エフェクト */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute -inset-8"
        >
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: 360,
                x: Math.cos(i * 45 * Math.PI / 180) * 100,
                y: Math.sin(i * 45 * Math.PI / 180) * 100
              }}
              transition={{ 
                delay: 0.8 + i * 0.1,
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
              className="absolute top-1/2 left-1/2 w-4 h-4 bg-yellow-300 rounded-full shadow-lg border-2 border-white"
            />
          ))}
        </motion.div>
      </motion.div>

      {/* メインメッセージ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-xl">
          🎉 {userName}さん、おめでとうございます！
        </h1>
        <p className="text-2xl text-white/95 mb-2 drop-shadow-lg font-semibold">
          Career Compassのセットアップが完了しました
        </p>
        <p className="text-lg text-white/90 drop-shadow-md font-medium">
          {planNames[selectedPlan as keyof typeof planNames]}でキャリアの新しい章を始めましょう
        </p>
      </motion.div>

      {/* プラン特典表示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl p-8 mb-8 shadow-2xl"
      >
        <div className="flex items-center justify-center mb-4">
          <Gift className="w-8 h-8 text-indigo-600 mr-2" />
          <h2 className="text-2xl font-bold text-gray-900">
            ご利用いただける機能
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center justify-center space-x-2 text-gray-800 font-medium bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/30"
            >
              <span>{benefit}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 次のアクション */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="mb-8"
      >
        <h3 className="text-xl font-bold text-white mb-6 drop-shadow-lg">
          さあ、始めましょう！
        </h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          {nextActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
            >
              <Link
                href={action.href}
                className="block bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/100 transform transition-all duration-200"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl mb-4 shadow-lg`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {action.title}
                </h4>
                <p className="text-gray-700 text-sm font-medium">
                  {action.description}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* メインCTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-4"
      >
        <Link
          href="/dashboard"
          onClick={onComplete}
          className="inline-flex items-center justify-center px-12 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-white/30"
        >
          ダッシュボードを見る
          <ArrowRight className="w-6 h-6 ml-3" />
        </Link>
        
        <p className="text-sm text-white/90 drop-shadow-md font-medium">
          ✨ あなたのキャリア成長の旅がここから始まります
        </p>
      </motion.div>

      {/* サポート情報 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="mt-12 p-6 bg-white/90 backdrop-blur-xl border border-white/40 rounded-xl shadow-xl"
      >
        <div className="flex items-center justify-center mb-2">
          <Heart className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-gray-900 font-bold">サポートをお探しですか？</span>
        </div>
        <p className="text-sm text-gray-800 font-medium">
          ご質問やサポートが必要な場合は、
          <Link href="/support" className="text-indigo-600 hover:underline ml-1 font-bold">
            サポートセンター
          </Link>
          をご利用ください。成功への道のりを全力でサポートいたします。
        </p>
      </motion.div>
    </motion.div>
  );
}
