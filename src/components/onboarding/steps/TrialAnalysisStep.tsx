'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Brain, Target, Heart, ArrowRight, ArrowLeft, Play } from 'lucide-react';
import Link from 'next/link';

interface TrialAnalysisStepProps {
  onNext: () => void;
  onBack: () => void;
  userName: string;
}

export default function TrialAnalysisStep({ onNext, onBack, userName }: TrialAnalysisStepProps) {
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>('');

  const analyses = [
    {
      id: 'clarity',
      title: 'モヤモヤ分析',
      description: '今抱えている悩みや不安を整理し、解決の糸口を見つけます',
      icon: Brain,
      color: 'from-blue-400 to-cyan-400',
      duration: '約3分',
      benefits: ['悩みの根本原因を特定', '具体的な解決策を提案', '心の整理ができる']
    },
    {
      id: 'strengths', 
      title: '強み分析',
      description: 'あなたの隠れた才能や強みを発見し、活かし方を提案します',
      icon: Sparkles,
      color: 'from-purple-400 to-pink-400',
      duration: '約3分',
      benefits: ['隠れた才能を発見', '強みの活かし方を学習', '自信が持てる']
    },
    {
      id:'career',
      title: 'キャリアパス分析', 
      description: 'あなたに最適なキャリアの道筋を具体的に描きます',
      icon: Target,
      color: 'from-green-400 to-emerald-400',
      duration: '約3分',
      benefits: ['最適なキャリアパスを提示', '具体的なステップを提案', '将来像が明確になる']
    },
    {
      id: 'values',
      title: '価値観分析',
      description: 'あなたの核となる価値観を明確にし、人生の指針を見つけます',
      icon: Heart,
      color: 'from-orange-400 to-red-400', 
      duration: '約3分',
      benefits: ['価値観の明確化', '人生の軸を発見', '意思決定がスムーズに']
    }
  ];

  const selectedAnalysisData = analyses.find(a => a.id === selectedAnalysis);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      {/* ヘッダー */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 shadow-2xl"
        >
          <Play className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {userName}さん、まずは無料体験！
        </h2>
        <p className="text-white/80 text-lg">
          AIの分析力を体感してください
        </p>
      </div>

      {/* 分析選択 */}
      <div className="grid sm:grid-cols-2 gap-4">
        {analyses.map((analysis, index) => (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            onClick={() => setSelectedAnalysis(analysis.id)}
            className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all hover:scale-105 shadow-xl backdrop-blur-xl ${
              selectedAnalysis === analysis.id
                ? 'border-purple-400 bg-purple-400/20'
                : 'border-white/30 bg-white/10 hover:border-purple-300 hover:bg-white/15'
            }`}
          >
            <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r ${analysis.color} rounded-xl mb-4 shadow-lg`}>
              <analysis.icon className="w-6 h-6 text-white" />
            </div>
            
            <h3 className="text-xl font-semibold text-white mb-2">
              {analysis.title}
            </h3>
            
            <p className="text-white/80 mb-4 text-sm">
              {analysis.description}
            </p>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-purple-200 font-medium">
                {analysis.duration}
              </span>
              <span className="px-3 py-1 bg-green-400/20 text-green-300 rounded-full font-medium border border-green-400/30">
                無料体験
              </span>
            </div>

            {selectedAnalysis === analysis.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 border-2 border-purple-400 rounded-3xl bg-purple-400/10 pointer-events-none"
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* 選択した分析の詳細 */}
      {selectedAnalysisData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl border border-white/20"
        >
          <h4 className="text-lg font-semibold text-white mb-4">
            {selectedAnalysisData.title}で得られること：
          </h4>
          <div className="grid sm:grid-cols-3 gap-4">
            {selectedAnalysisData.benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 bg-purple-400 rounded-full mt-2" />
                <span className="text-white/90 text-sm">{benefit}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* 体験の価値提案 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl rounded-3xl p-6 border border-purple-400/30"
      >
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-2">
            🎯 なぜ無料体験から始めるの？
          </h3>
          <p className="text-white/80 mb-4">
            AIの分析精度を実際に体感していただき、あなたのキャリアアップに本当に役立つかを確認してください。
          </p>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-white/90">完全無料</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-white/90">即座に結果</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-400">✓</span>
              <span className="text-white/90">価値を実感</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ナビゲーション */}
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white font-medium rounded-2xl hover:bg-white/20 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </motion.button>

        {selectedAnalysis ? (
          <Link
            href={`/ai-analysis/${selectedAnalysis}?onboarding=true`}
            className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
          >
            {selectedAnalysisData?.title}を体験する
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        ) : (
          <div className="inline-flex items-center px-8 py-3 bg-white/10 text-white/50 font-semibold rounded-2xl cursor-not-allowed border border-white/20">
            分析を選択してください
          </div>
        )}
      </div>

      {/* バリデーションメッセージ */}
      {!selectedAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-pink-300 text-sm bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 inline-block border border-pink-300/30">
            上記から1つ選択してください
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
