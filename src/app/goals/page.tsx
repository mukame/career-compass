'use client';

import React, { useState, useEffect } from 'react';
import { Target, Plus, Filter, TrendingUp, Calendar, CheckCircle2, Circle, Clock, MoreHorizontal, Trash2, Edit, Play, Pause, Sparkles, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Goal, Task } from '@/types/database';
import GoalForm from '../../components/goals/GoalForm';
import TaskManager from '../../components/goals/TaskManager';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed' | 'paused'>('all');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [hasOnboardingGoals, setHasOnboardingGoals] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // ユーザー情報取得
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/auth/login';
        return;
      }
      setUser(user);

      // プロフィール情報も取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);

      // 目標とタスクを並行取得
      const [goalsResponse, tasksResponse] = await Promise.all([
        supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (goalsResponse.data) {
        setGoals(goalsResponse.data);
        // オンボーディング由来の目標があるかチェック
        const onboardingGoals = goalsResponse.data.filter(goal => 
          goal.source === 'onboarding' || 
          // オンボーディングで設定されやすい目標をヒューリスティックで判定
          isLikelyOnboardingGoal(goal)
        );
        setHasOnboardingGoals(onboardingGoals.length > 0);
      }
      if (tasksResponse.data) setTasks(tasksResponse.data);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // オンボーディング由来と思われる目標の判定
  const isLikelyOnboardingGoal = (goal: Goal): boolean => {
    const commonOnboardingGoals = [
      '新しいスキルを習得する',
      '昇進・昇格を目指す', 
      '転職を成功させる',
      'ネットワークを拡大する',
      'ワークライフバランス改善',
      '副業・起業の準備'
    ];
    
    return commonOnboardingGoals.some(commonGoal => 
      goal.title.includes(commonGoal) || commonGoal.includes(goal.title)
    );
  };

  const filteredGoals = goals.filter(goal => 
    filterStatus === 'all' || goal.status === filterStatus
  );

  const getGoalStats = () => {
    const active = goals.filter(g => g.status === 'active').length;
    const completed = goals.filter(g => g.status === 'completed').length;
    const paused = goals.filter(g => g.status === 'paused').length;
    const total = goals.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { active, completed, paused, total, completionRate };
  };

  const handleGoalAction = async (goalId: string, action: 'complete' | 'pause' | 'resume' | 'delete') => {
    if (!user) return;

    try {
      if (action === 'delete') {
        await supabase.from('goals').delete().eq('id', goalId).eq('user_id', user.id);
        setGoals(prev => prev.filter(g => g.id !== goalId));
        setTasks(prev => prev.filter(t => t.goal_id !== goalId));
      } else {
        const newStatus = action === 'complete' ? 'completed' : 
                         action === 'pause' ? 'paused' : 'active';
        
        const { data } = await supabase
          .from('goals')
          .update({ 
            status: newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', goalId)
          .eq('user_id', user.id)
          .select()
          .single();

        if (data) {
          setGoals(prev => prev.map(g => g.id === goalId ? data : g));
        }
      }
    } catch (error) {
      console.error('目標操作エラー:', error);
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'from-red-500 to-pink-500';
      case 2: return 'from-yellow-500 to-orange-500';
      case 3: return 'from-blue-500 to-indigo-500';
      case 4: return 'from-green-500 to-emerald-500';
      case 5: return 'from-gray-500 to-gray-600';
      default: return 'from-blue-500 to-indigo-500';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return '最高';
      case 2: return '高';
      case 3: return '中';
      case 4: return '低';
      case 5: return '最低';
      default: return '中';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'paused': return <Pause className="h-5 w-5 text-orange-500" />;
      default: return <Circle className="h-5 w-5 text-blue-500" />;
    }
  };

  const getPersonalizedWelcomeMessage = () => {
    const userName = profile?.last_name && profile?.first_name 
      ? `${profile.last_name} ${profile.first_name}`
      : profile?.full_name 
        ? profile.full_name
        : 'あなた';
    
    return `${userName}さんの目標`;
  };

  const stats = getGoalStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600">目標データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 shadow-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{getPersonalizedWelcomeMessage()}</h1>
                <p className="text-indigo-100 mt-1">キャリア目標を管理し、着実に成長していきましょう</p>
              </div>
            </div>
            <button
              onClick={() => setShowGoalForm(true)}
              className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>新しい目標</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* オンボーディング完了メッセージ */}
        {hasOnboardingGoals && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 mb-8 opacity-0 animate-fadeIn">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 p-2 bg-green-100 rounded-xl">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  🎉 オンボーディングで設定した目標が追加されました！
                </h3>
                <p className="text-green-700 mb-4">
                  Career Compassへようこそ！設定された目標を確認して、さらに詳細な計画を立てましょう。
                  タスクを追加したり、期限を設定することで、より効果的に目標を達成できます。
                </p>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => setShowGoalForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    追加の目標を設定
                  </button>
                  <a 
                    href="/ai-analysis" 
                    className="inline-flex items-center px-4 py-2 bg-white text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition-colors text-sm font-medium"
                  >
                    AI分析で詳しく診断
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">総目標数</p>
                <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                <Target className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.total === 0 ? 'まずは目標を設定しましょう' : 'よいペースで進んでいます！'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fadeIn animation-delay-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">進行中</p>
                <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-400 to-blue-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.active === 0 ? '新しい目標を始めましょう' : 'アクティブに取り組み中'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fadeIn animation-delay-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">完了済み</p>
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-400 to-green-500 rounded-xl">
                <CheckCircle2 className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                {stats.completed === 0 ? '初回完了を目指しましょう' : '素晴らしい成果です！'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 opacity-0 animate-fadeIn animation-delay-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">達成率</p>
                <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-400 to-purple-500 rounded-xl">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex items-center space-x-4 mb-6">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { key: 'all', label: '全て', count: stats.total },
              { key: 'active', label: '進行中', count: stats.active },
              { key: 'completed', label: '完了', count: stats.completed },
              { key: 'paused', label: '一時停止', count: stats.paused }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key as any)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2 whitespace-nowrap ${
                  filterStatus === filter.key
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-white text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 shadow-sm'
                }`}
              >
                <span>{filter.label}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filterStatus === filter.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {filter.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 目標一覧 */}
        <div className="space-y-6">
          {filteredGoals.length === 0 ? (
            <div className="text-center py-12 opacity-0 animate-fadeIn">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {filterStatus === 'all' ? '目標がまだありません' : `${filterStatus === 'active' ? '進行中の' : filterStatus === 'completed' ? '完了した' : '一時停止中の'}目標がありません`}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                {filterStatus === 'all' 
                  ? profile?.onboarding_completed 
                    ? 'オンボーディングは完了済みです。新しい目標を追加して、さらなるキャリアアップを目指しましょう！'
                    : 'オンボーディングで設定した目標がここに表示されます。まずはオンボーディングを完了しましょう。'
                  : `${filterStatus === 'active' ? '進行中の' : filterStatus === 'completed' ? '完了した' : '一時停止中の'}目標がありません。`
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>目標を作成</span>
                </button>
                {!profile?.onboarding_completed && (
                  <a
                    href="/onboarding"
                    className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold border border-indigo-200 hover:bg-indigo-50 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Sparkles className="h-5 w-5" />
                    <span>オンボーディングを完了</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            filteredGoals.map((goal, index) => {
              const goalTasks = tasks.filter(t => t.goal_id === goal.id);
              const completedTasks = goalTasks.filter(t => t.completed);
              const progress = goalTasks.length > 0 ? (completedTasks.length / goalTasks.length) * 100 : 0;
              const isOnboardingGoal = goal.source === 'onboarding' || isLikelyOnboardingGoal(goal);

              return (
                <div
                  key={goal.id}
                  className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 opacity-0 animate-fadeIn relative overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* オンボーディング由来の目標を示すバッジ */}
                  {isOnboardingGoal && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-400 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
                        <Sparkles className="h-3 w-3" />
                        <span>オンボーディング</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4 flex-1 pr-20">
                      <div className="mt-1">
                        {getStatusIcon(goal.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-800">{goal.title}</h3>
                          <div className={`px-2 py-1 bg-gradient-to-r ${getPriorityColor(goal.priority)} text-white text-xs rounded-full font-medium`}>
                            優先度: {getPriorityLabel(goal.priority)}
                          </div>
                          <div className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                            {goal.category}
                          </div>
                        </div>
                        {goal.description && (
                          <p className="text-gray-600 mb-3">{goal.description}</p>
                        )}
                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          {goal.target_date && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>期限: {new Date(goal.target_date).toLocaleDateString('ja-JP')}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>作成: {new Date(goal.created_at).toLocaleDateString('ja-JP')}</span>
                          </div>
                        </div>
                        
                        {/* 進捗バー */}
                        {goalTasks.length > 0 && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                タスク進捗: {completedTasks.length}/{goalTasks.length}
                              </span>
                              <span className="text-sm font-medium text-indigo-600">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedGoal(goal)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        タスク管理
                      </button>
                      <div className="relative group">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </button>
                        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[160px]">
                          <button
                            onClick={() => setEditingGoal(goal)}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 first:rounded-t-lg"
                          >
                            <Edit className="h-4 w-4" />
                            <span>編集</span>
                          </button>
                          {goal.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleGoalAction(goal.id, 'complete')}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                                <span>完了にする</span>
                              </button>
                              <button
                                onClick={() => handleGoalAction(goal.id, 'pause')}
                                className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-orange-600"
                              >
                                <Pause className="h-4 w-4" />
                                <span>一時停止</span>
                              </button>
                            </>
                          )}
                          {goal.status === 'paused' && (
                            <button
                              onClick={() => handleGoalAction(goal.id, 'resume')}
                              className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-gray-50 text-blue-600"
                            >
                              <Play className="h-4 w-4" />
                              <span>再開</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (window.confirm('この目標を削除しますか？関連するタスクも全て削除されます。')) {
                                handleGoalAction(goal.id, 'delete');
                              }
                            }}
                            className="flex items-center space-x-2 w-full px-4 py-2 text-left hover:bg-red-50 text-red-600 last:rounded-b-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span>削除</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 目標作成・編集モーダル */}
      {(showGoalForm || editingGoal) && (
        <GoalForm
          goal={editingGoal}
          onClose={() => {
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
          onSave={(goal: Goal) => {
            if (editingGoal) {
              setGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
            } else {
              setGoals(prev => [goal, ...prev]);
            }
            setShowGoalForm(false);
            setEditingGoal(null);
          }}
        />
      )}

      {/* タスク管理モーダル */}
      {selectedGoal && (
        <TaskManager
          goal={selectedGoal}
          tasks={tasks.filter(t => t.goal_id === selectedGoal.id)}
          onClose={() => setSelectedGoal(null)}
          onTaskUpdate={(updatedTasks: Task[]) => {
            setTasks(prev => {
              const otherTasks = prev.filter(t => t.goal_id !== selectedGoal.id);
              return [...otherTasks, ...updatedTasks];
            });
          }}
        />
      )}
    </div>
  );
}
