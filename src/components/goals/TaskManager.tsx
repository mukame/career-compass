'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, CheckSquare, Square, Calendar, Clock, Edit2, Trash2, Target, MoreHorizontal, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Goal, Task } from '@/types/database';

interface TaskManagerProps {
  goal: Goal;
  tasks: Task[];
  onClose: () => void;
  onTaskUpdate: (tasks: Task[]) => void;
}

interface TaskForm {
  title: string;
  description: string;
  due_date: string;
  estimated_hours: number | null;
}

export default function TaskManager({ goal, tasks, onClose, onTaskUpdate }: TaskManagerProps) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [taskForm, setTaskForm] = useState<TaskForm>({
    title: '',
    description: '',
    due_date: '',
    estimated_hours: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const resetForm = () => {
    setTaskForm({
      title: '',
      description: '',
      due_date: '',
      estimated_hours: null
    });
    setErrors({});
    setEditingTask(null);
  };

  const validateTaskForm = () => {
    const newErrors: Record<string, string> = {};

    if (!taskForm.title.trim()) {
      newErrors.title = 'タスク名は必須です';
    } else if (taskForm.title.length > 100) {
      newErrors.title = 'タスク名は100文字以内で入力してください';
    }

    if (taskForm.description.length > 300) {
      newErrors.description = '説明は300文字以内で入力してください';
    }

    if (taskForm.due_date) {
      const dueDate = new Date(taskForm.due_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate < today) {
        newErrors.due_date = '期限は今日以降の日付を設定してください';
      }

      if (goal.target_date) {
        const goalDate = new Date(goal.target_date);
        if (dueDate > goalDate) {
          newErrors.due_date = '目標期限を超えて設定することはできません';
        }
      }
    }

    if (taskForm.estimated_hours !== null && (taskForm.estimated_hours < 0.5 || taskForm.estimated_hours > 100)) {
      newErrors.estimated_hours = '見積時間は0.5〜100時間の範囲で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateTaskForm()) return;

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザー認証が必要です');

      const taskData = {
        ...taskForm,
        user_id: user.id,
        goal_id: goal.id,
        status: 'pending' as const,
        completed: false,
        completed_at: null,
        actual_hours: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select()
        .single();

      if (error) throw error;

      const newTasks = [data, ...localTasks];
      setLocalTasks(newTasks);
      onTaskUpdate(newTasks);
      
      resetForm();
      setShowTaskForm(false);
    } catch (error: any) {
      console.error('タスク作成エラー:', error);
      setErrors({ submit: error.message || 'タスク作成中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTask || !validateTaskForm()) return;

    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('ユーザー認証が必要です');

      const { data, error } = await supabase
        .from('tasks')
        .update({
          ...taskForm,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingTask.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTasks = localTasks.map(t => t.id === editingTask.id ? data : t);
      setLocalTasks(updatedTasks);
      onTaskUpdate(updatedTasks);
      
      resetForm();
      setShowTaskForm(false);
    } catch (error: any) {
      console.error('タスク更新エラー:', error);
      setErrors({ submit: error.message || 'タスク更新中にエラーが発生しました' });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const newCompleted = !task.completed;
      const updateData = {
        completed: newCompleted,
        status: newCompleted ? 'completed' : 'pending' as const,
        completed_at: newCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(updateData)
        .eq('id', task.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      const updatedTasks = localTasks.map(t => t.id === task.id ? data : t);
      setLocalTasks(updatedTasks);
      onTaskUpdate(updatedTasks);
    } catch (error) {
      console.error('タスクステータス更新エラー:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('このタスクを削除しますか？')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      const updatedTasks = localTasks.filter(t => t.id !== taskId);
      setLocalTasks(updatedTasks);
      onTaskUpdate(updatedTasks);
    } catch (error) {
      console.error('タスク削除エラー:', error);
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours
    });
    setShowTaskForm(true);
  };

  const completedTasks = localTasks.filter(t => t.completed);
  const pendingTasks = localTasks.filter(t => !t.completed);
  const progress = localTasks.length > 0 ? (completedTasks.length / localTasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Target className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">タスク管理</h2>
                <p className="text-indigo-100 mt-1 truncate max-w-md">{goal.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* 進捗表示 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-indigo-100">
                進捗: {completedTasks.length}/{localTasks.length} タスク完了
              </span>
              <span className="text-sm font-medium text-white">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="flex-1 overflow-y-auto">
          {/* 新規タスク作成ボタン */}
          <div className="p-6 border-b border-gray-200">
            <button
              onClick={() => {
                resetForm();
                setShowTaskForm(true);
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>新しいタスクを追加</span>
            </button>
          </div>

          {/* タスクフォーム */}
          {showTaskForm && (
            <div className="border-b border-gray-200 bg-gray-50">
              <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask} className="p-6 space-y-4">
                <div>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="タスク名を入力..."
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                    }`}
                    maxLength={100}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="タスクの詳細（任意）"
                    rows={2}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                      errors.description ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                    }`}
                    maxLength={300}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={taskForm.due_date}
                      onChange={(e) => setTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                      max={goal.target_date || undefined}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.due_date ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                      }`}
                    />
                    {errors.due_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      value={taskForm.estimated_hours || ''}
                      onChange={(e) => setTaskForm(prev => ({ 
                        ...prev, 
                        estimated_hours: e.target.value ? parseFloat(e.target.value) : null 
                      }))}
                      placeholder="見積時間（h）"
                      min="0.5"
                      max="100"
                      step="0.5"
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        errors.estimated_hours ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-indigo-400'
                      }`}
                    />
                    {errors.estimated_hours && (
                      <p className="text-red-500 text-sm mt-1">{errors.estimated_hours}</p>
                    )}
                  </div>
                </div>

                {errors.submit && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                    <p className="text-red-700 text-sm">{errors.submit}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      resetForm();
                      setShowTaskForm(false);
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>保存中...</span>
                      </>
                    ) : (
                      <span>{editingTask ? '更新' : '作成'}</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* タスク一覧 */}
          <div className="p-6">
            {localTasks.length === 0 ? (
              <div className="text-center py-12">
                <CheckSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">タスクがまだありません</h3>
                <p className="text-gray-500">最初のタスクを作成して目標達成への第一歩を踏み出しましょう！</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* 未完了タスク */}
                {pendingTasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span>進行中のタスク ({pendingTasks.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {pendingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-300"
                        >
                          <div className="flex items-start space-x-4">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className="mt-1 text-gray-400 hover:text-indigo-600 transition-colors"
                            >
                              <Square className="h-5 w-5" />
                            </button>
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-800">{task.title}</h4>
                              {task.description && (
                                <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {task.due_date && (
                                  <div className="flex items-center space-x-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{new Date(task.due_date).toLocaleDateString('ja-JP')}</span>
                                  </div>
                                )}
                                {task.estimated_hours && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-4 w-4" />
                                    <span>{task.estimated_hours}時間</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="relative group">
                              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
                                <button
                                  onClick={() => handleEditTask(task)}
                                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-700 first:rounded-t-lg"
                                >
                                  <Edit2 className="h-4 w-4" />
                                  <span>編集</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 last:rounded-b-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span>削除</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 完了済みタスク */}
                {completedTasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                      <CheckSquare className="h-5 w-5 text-green-500" />
                      <span>完了済みタスク ({completedTasks.length})</span>
                    </h3>
                    <div className="space-y-3">
                      {completedTasks.map((task) => (
                        <div
                          key={task.id}
                          className="bg-green-50 border border-green-200 rounded-xl p-4 opacity-75"
                        >
                          <div className="flex items-start space-x-4">
                            <button
                              onClick={() => handleToggleComplete(task)}
                              className="mt-1 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckSquare className="h-5 w-5" />
                            </button>
                            
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-700 line-through">{task.title}</h4>
                              {task.description && (
                                <p className="text-gray-600 text-sm mt-1 line-through">{task.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                                {task.completed_at && (
                                  <div className="flex items-center space-x-1">
                                    <CheckSquare className="h-4 w-4 text-green-600" />
                                    <span>完了: {new Date(task.completed_at).toLocaleDateString('ja-JP')}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
