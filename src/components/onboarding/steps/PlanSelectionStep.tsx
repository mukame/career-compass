'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Crown, 
  Star, 
  Heart, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Target,
  Clock,
  Users
} from 'lucide-react';

interface PlanSelectionStepProps {
  onNext: (planId: string) => void;
  onBack: () => void;
  userName: string;
  trialCompleted: boolean;
}

export default function PlanSelectionStep({ 
  onNext, 
  onBack, 
  userName, 
  trialCompleted 
}: PlanSelectionStepProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'free',
      name: 'フリープラン',
      price: 0,
      priceAnnual: 0,
      description: 'まずは試してみたい方に',
      icon: Heart,
      color: 'from-gray-400 to-gray-500',
      popular: false,
      features: [
        'AI分析体験（各1回まで）',
        '基本的なアドバイス',
        'コミュニティへの参加',
        'メール通知'
      ],
      limitations: [
        '分析結果の保存なし',
        '履歴機能なし',
        '比較機能なし'
      ]
    },
    {
      id: 'standard',
      name: 'スタンダード',
      price: 1480,
      priceAnnual: 1184, // 20%オフ
      description: '本格的にキャリアアップしたい方に',
      icon: Star,
      color: 'from-indigo-500 to-purple-600',
      popular: true,
      features: [
        '豊富なAI分析回数（合計月15回）',
        '分析結果の保存（3ヶ月）',
        '履歴・比較機能',
        'パーソナライズされた提案',
      ],
      limitations: []
    },
    {
      id: 'premium',
      name: 'プレミアム',
      price: 2980,
      priceAnnual: 2384, // 20%オフ  
      description: 'プロフェッショナルな成長を求める方に',
      icon: Crown,
      color: 'from-amber-500 to-orange-600',
      popular: false,
      features: [
        'AI分析完全無制限',
        '分析結果の永久保存',
        '高度な比較・分析機能',
        'キャリアコーチング面談の割引',
        '詳細レポート機能',
      ],
      limitations: []
    }
  ];

  const getDiscountAmount = (originalPrice: number, discountedPrice: number) => {
    return originalPrice - discountedPrice;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto"
    >
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-lg border border-white/30 rounded-full mb-4 shadow-xl"
        >
          <Sparkles className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-3xl font-bold text-white mb-3 drop-shadow-lg">
          {trialCompleted ? `${userName}さん、いかがでしたか？` : `${userName}さんに最適なプラン`}
        </h2>
        <p className="text-xl text-white/90 drop-shadow-md font-medium">
          {trialCompleted 
            ? 'この精度のAI分析を継続して、キャリアを加速させませんか？'
            : 'あなたの目標に合わせて最適なプランを選択してください'
          }
        </p>
      </div>

      {/* 体験完了の価値確認 */}
      {trialCompleted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-2xl p-6 mb-8 shadow-xl"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-400/90 backdrop-blur-sm rounded-full mb-4 shadow-lg">
              <Check className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">
              体験分析完了！価値を実感いただけましたか？
            </h3>
            <p className="text-white/90 font-medium">
              この分析精度で、継続的にキャリアをサポートさせていただけます。
            </p>
          </div>
        </motion.div>
      )}

      {/* 年払い割引切り替え */}
      <div className="flex justify-center mb-8">
        <div className="bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2 rounded-lg font-bold transition-all ${
              billingCycle === 'monthly'
                ? 'bg-white/90 text-purple-700 shadow-lg backdrop-blur-sm'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
          >
            月払い
          </button>
          <button
            onClick={() => setBillingCycle('annual')}
            className={`px-6 py-2 rounded-lg font-bold transition-all relative ${
              billingCycle === 'annual'
                ? 'bg-white/90 text-purple-700 shadow-lg backdrop-blur-sm'
                : 'text-white/90 hover:text-white hover:bg-white/10'
            }`}
          >
            年払い
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
              20%オフ
            </span>
          </button>
        </div>
      </div>

      {/* プラン一覧 */}
      <div className="grid lg:grid-cols-3 gap-8 mb-8">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setSelectedPlan(plan.id)}
            className={`relative bg-white/95 backdrop-blur-xl rounded-2xl p-8 border-3 cursor-pointer transition-all hover:shadow-2xl hover:bg-white/100 ${
              selectedPlan === plan.id
                ? 'border-yellow-400 shadow-2xl ring-4 ring-yellow-400/30 bg-white/100'
                : 'border-white/40 hover:border-white/60 shadow-xl'
            } ${plan.popular ? 'ring-4 ring-blue-400/30' : ''}`}
          >
            {/* 人気ラベル */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-white/50">
                  👑 最人気
                </div>
              </div>
            )}

            {/* プランアイコン */}
            <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${plan.color} rounded-2xl mb-6 shadow-lg`}>
              <plan.icon className="w-8 h-8 text-white" />
            </div>

            {/* プラン情報 */}
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {plan.name}
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              {plan.description}
            </p>

            {/* 価格 */}
            <div className="mb-6">
              {plan.price === 0 ? (
                <div className="text-3xl font-bold text-gray-900">
                  無料
                </div>
              ) : (
                <div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      ¥{(billingCycle === 'annual' ? plan.priceAnnual : plan.price).toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-2 font-semibold">
                      /月
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.price > 0 && (
                    <div className="text-sm text-green-700 mt-1 font-bold">
                      年払いで¥{getDiscountAmount(plan.price, plan.priceAnnual).toLocaleString()}お得！
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 機能一覧 */}
            <div className="space-y-3 mb-6">
              {plan.features.map((feature, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-800 font-medium">{feature}</span>
                </div>
              ))}
              {plan.limitations.map((limitation, idx) => (
                <div key={idx} className="flex items-center space-x-3 opacity-70">
                  <div className="w-5 h-5 border-2 border-gray-400 rounded flex-shrink-0" />
                  <span className="text-gray-600 line-through">{limitation}</span>
                </div>
              ))}
            </div>

            {/* 選択インジケーター */}
            {selectedPlan === plan.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
              >
                <Check className="w-5 h-5 text-white font-bold" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* 選択プランの特典 */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-xl border border-white/40 rounded-2xl p-6 shadow-xl mb-8"
        >
          <h4 className="text-lg font-bold text-gray-900 mb-4">
            {plans.find(p => p.id === selectedPlan)?.name}の特典：
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-800 font-medium">今すぐ利用開始</span>
            </div>
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-800 font-medium">専用サポート</span>
            </div>
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-indigo-600" />
              <span className="text-gray-800 font-medium">いつでもプラン変更可</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ナビゲーション */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-xl border border-white/40 text-white font-bold rounded-xl hover:bg-white/30 hover:border-white/60 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </button>

        {selectedPlan ? (
          <button
            onClick={() => onNext(selectedPlan)}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-200 border-2 border-white/30"
          >
            {selectedPlan === 'free' ? '無料で始める' : 'プランを選択'}
            <ArrowRight className="w-5 h-5 ml-2" />
          </button>
        ) : (
          <div className="inline-flex items-center px-8 py-3 bg-white/20 backdrop-blur-xl text-white/70 font-bold rounded-xl cursor-not-allowed border border-white/30">
            プランを選択してください
          </div>
        )}
      </div>
    </motion.div>
  );
}
