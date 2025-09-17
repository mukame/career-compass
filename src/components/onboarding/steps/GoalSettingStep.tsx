'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Star, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface Goal {
  id: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
}

interface GoalSettingStepProps {
  onNext: (goals: Goal[]) => void;
  onBack: () => void;
  userName: string;
}

export default function GoalSettingStep({ onNext, onBack, userName }: GoalSettingStepProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'medium' as const
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const suggestedGoals = [
    {
      title: '新しいスキルを習得する',
      description: '専門性を高めるための技術的スキルや資格取得',
      priority: 'high' as const
    },
    {
      title: '昇進・昇格を目指す',
      description: '現在の職場でのキャリアアップ',
      priority: 'high' as const
    },
    {
      title: '転職を成功させる',
      description: 'より良い条件・環境での転職実現',
      priority: 'high' as const
    },
    {
      title: 'ネットワークを拡大する',
      description: '業界内での人脈構築と関係性強化',
      priority: 'medium' as const
    },
    {
      title: 'ワークライフバランス改善',
      description: '仕事と私生活の両立を図る',
      priority: 'medium' as const
    },
    {
      title: '副業・起業の準備',
      description: '新しい収入源の確立や独立準備',
      priority: 'low' as const
    }
  ];

  const addSuggestedGoal = (suggested: any) => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: suggested.title,
      description: suggested.description,
      deadline: '',
      priority: suggested.priority
    };
    setGoals(prev => [...prev, goal]);
  };

  const addCustomGoal = () => {
    if (!newGoal.title.trim()) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      deadline: newGoal.deadline,
      priority: newGoal.priority
    };

    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      deadline: '',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const removeGoal = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const updateGoalDeadline = (id: string, deadline: string) => {
    setGoals(prev => prev.map(g => 
      g.id === id ? { ...g, deadline } : g
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400/20 text-red-300 border-red-400/30';
      case 'medium': return 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30';
      case 'low': return 'bg-green-400/20 text-green-300 border-green-400/30';
      default: return 'bg-white/20 text-white/70 border-white/30';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '中';
    }
  };

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
          <Target className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {userName}さんの目標を設定しましょう
        </h2>
        <p className="text-white/80 text-lg">
          具体的な目標があることで、AIがより効果的なサポートを提供できます
        </p>
      </div>

      {/* 設定済みの目標 */}
      {goals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white">
            設定した目標（{goals.length}個）
          </h3>
          <div className="space-y-4">
            {goals.map((goal, index) => (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-white">
                        {goal.title}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(goal.priority)}`}>
                        優先度: {getPriorityLabel(goal.priority)}
                      </span>
                    </div>
                    
                    <p className="text-white/80 mb-4">
                      {goal.description}
                    </p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-purple-300" />
                        <span className="text-sm text-white/70">期限:</span>
                        <input
                          type="date"
                          value={goal.deadline}
                          onChange={(e) => updateGoalDeadline(goal.id, e.target.value)}
                          className="text-sm bg-white/10 backdrop-blur-xl border border-white/30 rounded-lg px-2 py-1 text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => removeGoal(goal.id)}
                    className="p-2 text-white/60 hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* カスタム目標追加フォーム */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-white/20"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            カスタム目標を追加
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                目標タイトル <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={newGoal.title}
                onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                placeholder="例：Python プログラミングスキルを習得する"
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                詳細説明
              </label>
              <textarea
                value={newGoal.description}
                onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                placeholder="目標の詳細や背景を教えてください"
                rows={3}
                className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
              />
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  期限
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  優先度
                </label>
                <select
                  value={newGoal.priority}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                >
                  <option value="high" className="bg-slate-800">高</option>
                  <option value="medium" className="bg-slate-800">中</option>
                  <option value="low" className="bg-slate-800">低</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-colors"
            >
              キャンセル
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={addCustomGoal}
              disabled={!newGoal.title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              追加
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* 提案目標 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          よく設定される目標から選ぶ
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          {suggestedGoals
            .filter(suggested => !goals.some(goal => goal.title === suggested.title))
            .map((suggested, index) => (
            <motion.div
              key={suggested.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 hover:border-purple-300 hover:bg-white/15 transition-all cursor-pointer shadow-lg"
              onClick={() => addSuggestedGoal(suggested)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-white mb-1">
                    {suggested.title}
                  </h4>
                  <p className="text-sm text-white/80 mb-2">
                    {suggested.description}
                  </p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(suggested.priority)}`}>
                    優先度: {getPriorityLabel(suggested.priority)}
                  </span>
                </div>
                <Plus className="w-5 h-5 text-purple-400 flex-shrink-0 ml-2" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* カスタム目標追加ボタン */}
      {!showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-6 py-3 border-2 border-dashed border-purple-300/50 text-purple-200 font-medium rounded-xl hover:bg-white/10 hover:border-purple-300 transition-all"
          >
            <Plus className="w-5 h-5 mr-2" />
            カスタム目標を追加
          </button>
        </motion.div>
      )}

      {/* スキップオプション */}
      {goals.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl p-6 text-center border border-white/10"
        >
          <Star className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-white/80 text-sm">
            目標設定は後からでも追加できます。<br />
            まずは使い始めて、必要に応じて設定することも可能です。
          </p>
        </motion.div>
      )}

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

        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onNext(goals)}
          className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          {goals.length > 0 ? '目標を設定して完了' : '後で設定して完了'}
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </motion.div>
  );
}
