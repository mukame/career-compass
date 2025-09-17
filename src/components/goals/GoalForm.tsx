'use client';

import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, Save, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Goal } from '@/types/database';

interface GoalFormProps {
  goal?: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}

export default function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'skill' as 'skill' | 'experience' | 'networking' | 'other',
    priority: 2,
    target_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        category: goal.category,
        priority: goal.priority,
        target_date: goal.target_date || ''
      });
    }
  }, [goal]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'タイトルは必須です';
    } else if (formData.title.length > 100) {
      newErrors.title = 'タイトルは100文字以内で入力してください';
    }

    if (formData.description.length > 500) {
      newErrors.description = '説明は500文字以内で入力してください';
    }

    if (formData.target_date && formData.target_date.trim() !== '') {
        const targetDate = new Date(formData.target_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (isNaN(targetDate.getTime())) {
        newErrors.target_date = '有効な日付を入力してください';
        } else if (targetDate < today) {
        newErrors.target_date = '期限は今日以降の日付を設定してください';
        }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('ユーザー認証が必要です');

        // target_dateの処理を修正
        const goalData = {
        title: formData.title,
        description: formData.description || null,
        category: formData.category,
        priority: formData.priority,
        target_date: formData.target_date || null, // 空文字列の場合はnullに変換
        user_id: user.id,
        updated_at: new Date().toISOString()
        };

        if (goal) {
        // 既存目標の更新
        const { data, error } = await supabase
            .from('goals')
            .update(goalData)
            .eq('id', goal.id)
            .eq('user_id', user.id)
            .select()
            .single();

        if (error) throw error;
        onSave(data);
        } else {
        // 新規目標の作成
        const { data, error } = await supabase
            .from('goals')
            .insert({
            ...goalData,
            status: 'active',
            created_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;
        onSave(data);
        }
    } catch (error: any) {
        console.error('目標保存エラー:', error);
        setErrors({ submit: error.message || '保存中にエラーが発生しました' });
    } finally {
        setLoading(false);
    }
    };


  const categoryOptions = [
    { value: 'skill', label: 'スキル習得', icon: '🎯', description: '新しい技術や知識の習得' },
    { value: 'experience', label: '経験積み', icon: '📈', description: 'プロジェクト参加や業務経験' },
    { value: 'networking', label: 'ネットワーキング', icon: '🤝', description: '人脈構築や関係性強化' },
    { value: 'other', label: 'その他', icon: '✨', description: 'その他のキャリア目標' }
  ];

  const priorityOptions = [
    { value: 1, label: '高', color: 'from-red-500 to-pink-500', description: '最優先で取り組む' },
    { value: 2, label: '中', color: 'from-yellow-500 to-orange-500', description: '定期的に取り組む' },
    { value: 3, label: '低', color: 'from-blue-500 to-indigo-500', description: '余裕がある時に取り組む' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {goal ? '目標を編集' : '新しい目標を作成'}
                </h2>
                <p className="text-indigo-100 mt-1">
                  あなたのキャリア目標を設定しましょう
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              目標タイトル *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
              }`}
              placeholder="例：Next.jsを習得して転職活動を成功させる"
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.title}</span>
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">{formData.title.length}/100文字</p>
          </div>

          {/* 説明 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              詳細説明
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none ${
                errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
              }`}
              placeholder="目標の詳細や達成したい理由を記入してください..."
              maxLength={500}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.description}</span>
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">{formData.description.length}/500文字</p>
          </div>

          {/* カテゴリー */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              カテゴリー
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {categoryOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: option.value as any }))}
                  className={`p-4 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-md ${
                    formData.category === option.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{option.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">{option.label}</h4>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 優先度 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              優先度
            </label>
            <div className="grid grid-cols-3 gap-3">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                  className={`p-4 border-2 rounded-xl text-center transition-all duration-300 ${
                    formData.priority === option.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  <div className={`w-8 h-8 bg-gradient-to-r ${option.color} rounded-full mx-auto mb-2`} />
                  <h4 className="font-semibold text-gray-800">{option.label}</h4>
                  <p className="text-xs text-gray-600 mt-1">{option.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 期限 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              目標期限（任意）
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  errors.target_date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                }`}
              />
              <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.target_date && (
              <p className="text-red-500 text-sm mt-1 flex items-center space-x-1">
                <span>⚠️</span>
                <span>{errors.target_date}</span>
              </p>
            )}
            <p className="text-gray-500 text-sm mt-1">期限を設定すると進捗管理がより効果的になります</p>
          </div>

          {/* エラーメッセージ */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm flex items-center space-x-2">
                <span>⚠️</span>
                <span>{errors.submit}</span>
              </p>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{goal ? '更新する' : '作成する'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
