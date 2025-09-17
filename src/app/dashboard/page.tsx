'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { UsageMonitor } from '@/components/dashboard/UsageMonitor'
import { 
  Brain,
  Star,
  Route,
  Heart,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  BarChart3,
  Sparkles,
  ArrowRight,
  Plus,
  Calendar,
  Award,
  Zap,
  Users,
  BookOpen,
  Crown,
  AlertCircle,
  Compass,
  Lightbulb,
  Shield,
  MapPin,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff
} from 'lucide-react'
import PersonaInsights from '@/components/features/PersonaInsights'

interface Profile {
  id: string
  full_name?: string
  subscription_status: string
  onboarding_completed: boolean
}

interface AnalysisResult {
  id: string
  analysis_type: string
  result: any
  created_at: string
}

interface Goal {
  id: string
  title: string
  description?: string
  category: string
  status: string
  priority: number
  target_date?: string
  created_at: string
}

interface Task {
  id: string
  title: string
  completed: boolean
  due_date?: string
  goal_id?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  
  // モバイル最適化のための状態管理
  const [showAllStats, setShowAllStats] = useState(false)
  const [showPersonaInsights, setShowPersonaInsights] = useState(false)
  const [showAllAnalyses, setShowAllAnalyses] = useState(false)
  const [showAllRecentResults, setShowAllRecentResults] = useState(false)
  const [activeTab, setActiveTab] = useState('overview') // overview, analysis, actions, usage
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    initializeData()
  }, [])

  const initializeData = async () => {
    try {
      // ユーザー認証チェック
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }
      setUser(user)

      // プロフィール取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)

      // 分析結果取得
      const { data: analysisData } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setAnalyses(analysisData || [])

      // 目標取得
      const { data: goalData } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setGoals(goalData || [])

      // タスク取得
      const { data: taskData } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setTasks(taskData || [])

    } catch (error) {
      console.error('Data loading error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAnalysisIcon = (type: string) => {
    const iconMap = {
      'clarity': Brain,
      'strengths': Star,
      'career': Route,
      'values': Heart,
      'persona': Users
    }
    return iconMap[type as keyof typeof iconMap] || Brain
  }

  const getAnalysisColor = (type: string) => {
    const colorMap = {
      'clarity': 'from-indigo-500 to-purple-600',
      'strengths': 'from-orange-500 to-red-500',
     'career': 'from-green-500 to-teal-500',
      'values': 'from-purple-500 to-pink-500',
      'persona': 'from-blue-500 to-cyan-500'
    }
    return colorMap[type as keyof typeof colorMap] || 'from-gray-500 to-gray-600'
  }

  const getAnalysisName = (type: string) => {
    const nameMap = {
      'clarity': 'モヤモヤ分析',
      'strengths': '強み分析',
      'career': 'キャリアパス分析',
      'values': '価値観分析',
      'persona': '人物像分析'
    }
    return nameMap[type as keyof typeof nameMap] || '分析'
  }

  const getAnalysisDescription = (type: string) => {
    const descMap = {
      'clarity': 'キャリアの悩みを整理',
      'strengths': 'あなたの強みを発見',
      'career': '最適な道筋を提案',
      'values': '価値観を明確化',
      'persona': '性格と行動パターン'
    }
    return descMap[type as keyof typeof descMap] || '分析'
  }

  const completedTasks = tasks.filter(task => task.completed).length
  const totalTasks = tasks.length
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const activeGoals = goals.filter(goal => goal.status === 'active').length
  const completedGoals = goals.filter(goal => goal.status === 'completed').length

  // AI分析の進捗計算
  const totalAnalysisTypes = 5 // clarity, strengths, career-path, values, persona
  const completedAnalysisCount = analyses.length > totalAnalysisTypes ? totalAnalysisTypes : analyses.length
  const analysisCompletionRate = Math.round((completedAnalysisCount / totalAnalysisTypes) * 100)

  // 全体的な成長スコア計算
  const goalCompletionRate = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0
  const overallGrowthScore = Math.round((
    (analysisCompletionRate * 0.4) + 
    (taskCompletionRate * 0.3) + 
    (goalCompletionRate * 0.3)
  ))

  const isPremium = profile?.subscription_status === 'premium' || profile?.subscription_status === 'standard'

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 lg:py-8 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 lg:py-8">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 lg:py-8">
        
        {/* ヘッダーセクション - デスクトップ版は元のデザインを維持 */}
        <AnimatedSection>
          <div className="mb-6 lg:mb-8 relative">
            {/* 背景装飾 */}
            <div className="absolute -top-2 -right-2 w-20 h-20 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full blur-3xl opacity-30"></div>
            <div className="absolute -bottom-2 -left-2 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-pink-100 to-yellow-100 rounded-full blur-2xl opacity-30"></div>
            
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
              <div className="flex flex-col space-y-4 sm:space-y-6 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    おかえりなさい、{profile?.full_name || 'ユーザー'}さん 👋
                  </h1>
                  <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
                    キャリアアップに向けて一歩前進しましょう
                  </p>
                </div>
                {!isPremium && (
                  <div className="lg:mt-0">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl lg:rounded-2xl blur opacity-75"></div>
                      <Button
                        onClick={() => router.push('/pricing')}
                        className="relative bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white shadow-xl px-4 py-2 lg:px-6 lg:py-3 text-sm w-full lg:w-auto"
                      >
                        <Crown className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                        プレミアムにアップグレード
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* モバイル用タブナビゲーション - 4タブに拡張 */}
        <div className="block lg:hidden mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-1 shadow-lg border border-white/50">
            <div className="grid grid-cols-4 gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                概要
              </button>
              <button
                onClick={() => setActiveTab('usage')}
                className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeTab === 'usage'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                使用状況
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeTab === 'analysis'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                分析
              </button>
              <button
                onClick={() => setActiveTab('actions')}
                className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all duration-300 ${
                  activeTab === 'actions'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                アクション
              </button>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        {(activeTab === 'overview' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <div className="mb-6 lg:mb-8">
            {/* モバイル版: 2x2グリッド + 折りたたみ */}
            <div className="block lg:hidden">
              {/* メイン統計カード（常に表示） */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
                <AnimatedSection delay={0.1}>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative bg-white rounded-xl p-3 sm:p-4 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">完了タスク</p>
                          <div className="flex items-baseline">
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedTasks}</p>
                            <p className="ml-1 text-sm text-gray-500">/{totalTasks}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                    <div className="relative bg-white rounded-xl p-3 sm:p-4 shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-300">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">成長スコア</p>
                          <div className="flex items-baseline">
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">{overallGrowthScore}%</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              </div>

              {/* 追加統計カード（折りたたみ可能） */}
              <button
                onClick={() => setShowAllStats(!showAllStats)}
                className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center justify-center"
              >
                {showAllStats ? (
                  <>
                    詳細を非表示 <ChevronUp className="ml-1 h-4 w-4" />
                  </>
                ) : (
                  <>
                    詳細を表示 <ChevronDown className="ml-1 h-4 w-4" />
                  </>
                )}
              </button>

              {showAllStats && (
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                  <AnimatedSection delay={0.3}>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <div className="relative bg-white rounded-xl p-3 sm:p-4 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">進行中目標</p>
                            <div className="flex items-baseline">
                              <p className="text-xl sm:text-2xl font-bold text-gray-900">{activeGoals}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>

                  <AnimatedSection delay={0.4}>
                    <div className="relative group">
                      <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-75 transition duration-1000"></div>
                      <div className="relative bg-white rounded-xl p-3 sm:p-4 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                          </div>
                          <div className="ml-3 flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">AI分析完了</p>
                            <div className="flex items-baseline">
                              <p className="text-xl sm:text-2xl font-bold text-gray-900">{completedAnalysisCount}</p>
                              <p className="ml-1 text-sm text-gray-500">/{totalAnalysisTypes}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </AnimatedSection>
                </div>
              )}
            </div>

            {/* デスクトップ版: 元の4グリッドレイアウト */}
            <div className="hidden lg:grid lg:grid-cols-4 gap-6">
              {/* 完了したタスク */}
              <AnimatedSection delay={0.1}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-green-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <CheckCircle className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">完了したタスク</p>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
                          <p className="ml-2 text-lg text-gray-500">/ {totalTasks}</p>
                        </div>
                        <div className="flex items-center mt-2">
                          <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full">
                            +{taskCompletionRate}% 今月
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
              
              {/* 進行中の目標 */}
              <AnimatedSection delay={0.2}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-blue-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-blue-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Target className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">進行中の目標</p>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold text-gray-900">{activeGoals}</p>
                          <p className="ml-2 text-lg text-gray-500">設定待ち</p>
                        </div>
                        {activeGoals === 0 ? (
                          <span className="text-sm text-orange-600 font-semibold bg-orange-100 px-2 py-1 rounded-full mt-2 inline-block">
                            目標を設定しましょう
                          </span>
                        ) : (
                          <span className="text-sm text-blue-600 font-semibold bg-blue-100 px-2 py-1 rounded-full mt-2 inline-block">
                            順調に進行中
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* AI分析完了数 */}
              <AnimatedSection delay={0.3}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-purple-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <Brain className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">AI分析完了</p>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold text-gray-900">{completedAnalysisCount}</p>
                          <p className="ml-2 text-lg text-gray-500">/ {totalAnalysisTypes}</p>
                        </div>
                        {analyses.length < 5 ? (
                          <span className="text-sm text-purple-600 font-semibold bg-purple-100 px-2 py-1 rounded-full mt-2 inline-block">
                            分析を完了させましょう
                          </span>
                        ) : (
                          <span className="text-sm text-green-600 font-semibold bg-green-100 px-2 py-1 rounded-full mt-2 inline-block">
                            すべて完了！
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* 成長スコア */}
              <AnimatedSection delay={0.4}>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative bg-white rounded-2xl p-6 shadow-xl border border-yellow-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <TrendingUp className="h-7 w-7 text-white" />
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">成長スコア</p>
                        <div className="flex items-baseline">
                          <p className="text-3xl font-bold text-gray-900">{overallGrowthScore}%</p>
                        </div>
                        <span className="text-sm text-yellow-600 font-semibold bg-yellow-100 px-2 py-1 rounded-full mt-2 inline-block">
                          {overallGrowthScore >= 90 ? '素晴らしい！' : 
                           overallGrowthScore >= 70 ? '順調です' : 
                           overallGrowthScore >= 50 ? '良いペース' : '頑張りましょう'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        )}

        {/* 使用状況モニター - 新しいタブとして追加 */}
        {(activeTab === 'usage' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <div className="mb-6 lg:mb-8">
            <AnimatedSection delay={0.35}>
              <UsageMonitor 
                userId={user?.id || ''} 
                subscriptionStatus={profile?.subscription_status || 'free'} 
              />
            </AnimatedSection>
          </div>
        )}

        {/* AI人物像分析セクション */}
        {(activeTab === 'overview' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
          <div className="mb-6 lg:mb-8">
            <div className="block lg:hidden">
              <button
                onClick={() => setShowPersonaInsights(!showPersonaInsights)}
                className="w-full bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">AI人物像分析</h3>
                      <p className="text-sm text-gray-600">あなたの行動パターンを分析</p>
                    </div>
                  </div>
                  {showPersonaInsights ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </button>

              {showPersonaInsights && (
                <div className="mt-4">
                  <PersonaInsights />
                </div>
              )}
            </div>

            <div className="hidden lg:block">
              <AnimatedSection delay={0.45}>
                <PersonaInsights />
              </AnimatedSection>
            </div>
          </div>
        )}

        {/* 以下は既存のコンテンツを維持 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            
            {/* AI分析ステーション */}
            {(activeTab === 'analysis' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
              <AnimatedSection delay={0.5}>
                <div className="relative">
                  <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 rounded-2xl lg:rounded-3xl blur-2xl opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/50">
                    <div className="flex items-center justify-between mb-6 lg:mb-8">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                          <Sparkles className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                        AI分析ステーション
                      </h2>
                      <Link href="/analysis">
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg text-sm px-4 py-2 lg:px-4 lg:py-2">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">すべて見る</span>
                          <span className="sm:hidden">全て</span>
                        </Button>
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                      {['clarity', 'strengths','career', 'values'].map((analysisType, index) => {
                        const IconComponent = getAnalysisIcon(analysisType)
                        const completed = analyses.some(a => a.analysis_type === analysisType)
                        const isAccessible = analysisType === 'clarity' || isPremium
                        
                        return (
                          <div key={analysisType} className="relative group">
                            <div className={`absolute -inset-1 bg-gradient-to-r ${getAnalysisColor(analysisType)} rounded-xl lg:rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-500`}></div>
                            <div
                              className={`relative p-3 sm:p-4 lg:p-6 rounded-xl lg:rounded-2xl border transition-all duration-300 hover:-translate-y-1 lg:hover:-translate-y-2 ${
                                completed 
                                  ? `bg-gradient-to-br ${getAnalysisColor(analysisType)} text-white border-transparent shadow-xl`
                                  : isAccessible
                                    ? 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-gray-300 hover:shadow-xl'
                                    : 'bg-white/60 backdrop-blur-sm border-gray-200 opacity-75'
                              }`}
                            >
                              {/* プレミアムバッジ */}
                              {!isAccessible && (
                                <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1 lg:p-2 shadow-lg">
                                  <Crown className="h-2 w-2 lg:h-3 lg:w-3 text-white" />
                                </div>
                              )}
                              
                              {/* 完了バッジ */}
                              {completed && (
                                <div className="absolute -top-1 -right-1 lg:-top-2 lg:-right-2 bg-white rounded-full p-1 lg:p-2 shadow-lg">
                                  <CheckCircle className="h-3 w-3 lg:h-4 lg:w-4 text-green-500" />
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between mb-3 lg:mb-4">
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg ${
                                  completed 
                                    ? 'bg-white/20 backdrop-blur-sm' 
                                    : isAccessible 
                                      ? `bg-gradient-to-br ${getAnalysisColor(analysisType)}`
                                      : 'bg-gray-200'
                                }`}>
                                  <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 ${completed ? 'text-white' : isAccessible ? 'text-white' : 'text-gray-400'}`} />
                                </div>
                              </div>
                              
                              <h3 className={`font-bold text-sm sm:text-base lg:text-lg mb-2 ${completed ? 'text-white' : 'text-gray-900'} truncate`}>
                                {getAnalysisName(analysisType)}
                              </h3>
                              
                              <p className={`text-xs sm:text-sm mb-3 lg:mb-4 ${completed ? 'text-white/80' : 'text-gray-600'}`}>
                                {getAnalysisDescription(analysisType)}
                              </p>

                              <div className={`text-xs font-medium mb-3 lg:mb-4 ${completed ? 'text-white/90' : 'text-gray-500'}`}>
                                {completed ? (
                                  <div className="flex items-center">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    分析完了
                                  </div>
                                ) : isAccessible ? (
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    分析可能
                                  </div>
                                ) : (
                                  <div className="flex items-center">
                                    <Crown className="h-3 w-3 mr-1" />
                                    プレミアム
                                  </div>
                                )}
                              </div>

                              <Link href={isAccessible ? `/ai-analysis/${analysisType}` : '#'}>
                                <Button
                                  size="sm"
                                  disabled={!isAccessible}
                                  className={`w-full font-semibold transition-all duration-300 text-xs sm:text-sm ${
                                    completed 
                                      ? 'bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm'
                                      : isAccessible
                                        ? `bg-gradient-to-r ${getAnalysisColor(analysisType)} hover:shadow-lg text-white`
                                        : 'opacity-50 cursor-not-allowed bg-gray-300'
                                  }`}
                                >
                                  {completed ? (
                                    <>
                                      結果を見る
                                      <ArrowRight className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    </>
                                  ) : isAccessible ? (
                                    <>
                                      分析開始
                                      <Sparkles className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    </>
                                  ) : (
                                    <>
                                      要プレミアム
                                      <Crown className="ml-1 lg:ml-2 h-3 w-3 lg:h-4 lg:w-4" />
                                    </>
                                  )}
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* 最近の分析結果 */}
            {analyses.length > 0 && (activeTab === 'analysis' || typeof window !== 'undefined' && window.innerWidth >= 1024) && (
              <AnimatedSection delay={0.6}>
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-green-200 to-teal-200 rounded-2xl lg:rounded-3xl blur-xl opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/50">
                    <div className="flex items-center justify-between mb-4 lg:mb-6">
                      <h2 className="text-xl lg:text-2xl font-bold text-gray-900 flex items-center">
                        <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
                          <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
                        </div>
                        最新の分析結果
                      </h2>
                      
                      <div className="block lg:hidden">
                        <button
                          onClick={() => setShowAllRecentResults(!showAllRecentResults)}
                          className="text-sm text-gray-600 hover:text-gray-900 transition-colors duration-300 flex items-center"
                        >
                          {showAllRecentResults ? (
                            <>
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 lg:space-y-4">
                      {analyses.slice(0, showAllRecentResults || typeof window !== 'undefined' && window.innerWidth >= 1024 ? 3 : 1).map((analysis, index) => {
                        const IconComponent = getAnalysisIcon(analysis.analysis_type)
                        return (
                          <div key={analysis.id} className="group">
                            <div className={`relative p-3 sm:p-4 lg:p-6 bg-gradient-to-r ${getAnalysisColor(analysis.analysis_type)} rounded-xl lg:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                              <div className="flex items-start space-x-3 lg:space-x-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-white/20 backdrop-blur-sm rounded-xl lg:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                                  <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="font-bold text-white text-sm sm:text-base lg:text-lg mb-1 truncate">{getAnalysisName(analysis.analysis_type)}</h3>
                                  <p className="text-white/80 text-xs sm:text-sm mb-3">
                                    {new Date(analysis.created_at).toLocaleDateString('ja-JP', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })} に完了
                                  </p>
                                  <Link href={`/ai-analysis/${analysis.analysis_type}`}>
                                    <Button 
                                      size="sm"
                                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm font-semibold text-xs sm:text-sm w-full sm:w-auto"
                                    >
                                      詳細を見る
                                      <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )}

          </div>

          {/* サイドバー - デスクトップのみ */}
          <div className="hidden lg:block space-y-6">
            
            {/* 進捗概要 */}
            <AnimatedSection delay={0.7}>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-indigo-200 to-purple-200 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="mr-3 h-6 w-6 text-indigo-500" />
                    今週の進捗
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600 font-medium">タスク達成率</span>
                        <span className="font-bold text-gray-900">{taskCompletionRate}%</span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${taskCompletionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-gray-600 font-medium">分析完了率</span>
                        <span className="font-bold text-gray-900">{Math.round((analyses.length / 5) * 100)}%</span>
                      </div>
                      <div className="relative">
                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${(analyses.length / 5) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* おすすめアクション */}
            <AnimatedSection delay={0.8}>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Zap className="mr-3 h-6 w-6 text-yellow-500" />
                    おすすめアクション
                  </h3>
                  
                  <div className="space-y-4">
                    {analyses.length === 0 && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Brain className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-900">初回分析を始めよう</p>
                          <p className="text-sm text-blue-700">モヤモヤ分析で現状を整理しましょう</p>
                        </div>
                      </div>
                    )}
                    
                    {analyses.length > 0 && analyses.length < 5 && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Star className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-purple-900">分析を完了させよう</p>
                          <p className="text-sm text-purple-700">残り{5 - analyses.length}つの分析で全体像把握</p>
                        </div>
                      </div>
                    )}
                    
                    {goals.length === 0 && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-green-900">目標を設定しよう</p>
                          <p className="text-sm text-green-700">分析結果を活かして具体的な目標を</p>
                        </div>
                      </div>
                    )}

                    {!isPremium && (
                      <div className="flex items-start space-x-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300">
                        <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                          <Crown className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-yellow-900">プレミアムで加速</p>
                          <p className="text-sm text-yellow-700">全機能でキャリアアップを最大化</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* クイックアクション */}
            <AnimatedSection delay={0.9}>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-gray-200 to-slate-200 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Plus className="mr-3 h-6 w-6 text-gray-500" />
                    クイックアクション
                  </h3>
                  
                  <div className="space-y-3">
                    <Link href="/goals">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg font-semibold">
                        <Target className="mr-3 h-5 w-5" />
                        新しい目標を作成
                      </Button>
                    </Link>
                    
                    <Link href="/ai-analysis/clarity">
                      <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg font-semibold">
                        <Brain className="mr-3 h-5 w-5" />
                        モヤモヤ分析を開始
                      </Button>
                    </Link>
                    
                    <Link href="/profile">
                      <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg font-semibold">
                        <Users className="mr-3 h-5 w-5" />
                        プロフィール更新
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>

        {/* モバイル用アクションタブ */}
        {activeTab === 'actions' && (
          <div className="block lg:hidden">
            <AnimatedSection delay={0.9}>
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-gray-200 to-slate-200 rounded-2xl blur-xl opacity-30"></div>
                <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-4 sm:p-6 shadow-xl border border-white/50">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Plus className="mr-3 h-6 w-6 text-gray-500" />
                    クイックアクション
                  </h3>
                  
                  <div className="space-y-3">
                    <Link href="/goals">
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg font-semibold">
                        <Target className="mr-3 h-5 w-5" />
                        新しい目標を作成
                      </Button>
                    </Link>
                    
                    <Link href="/ai-analysis/clarity">
                      <Button className="w-full justify-start bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-lg font-semibold">
                        <Brain className="mr-3 h-5 w-5" />
                        モヤモヤ分析を開始
                      </Button>
                    </Link>
                    
                    <Link href="/profile">
                      <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white shadow-lg font-semibold">
                        <Users className="mr-3 h-5 w-5" />
                        プロフィール更新
                      </Button>
                    </Link>
                  </div>

                  {/* おすすめアクション - モバイル版 */}
                  <div className="mt-8">
                    <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center">
                      <Zap className="mr-2 h-5 w-5 text-yellow-500" />
                      おすすめアクション
                    </h4>
                    
                    <div className="space-y-3">
                      {analyses.length === 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Brain className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-blue-900 text-sm">初回分析を始めよう</p>
                            <p className="text-xs text-blue-700">モヤモヤ分析で現状を整理しましょう</p>
                          </div>
                        </div>
                      )}
                      
                      {analyses.length > 0 && analyses.length < 5 && (
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-purple-900 text-sm">分析を完了させよう</p>
                            <p className="text-xs text-purple-700">残り{5 - analyses.length}つの分析で全体像把握</p>
                          </div>
                        </div>
                      )}
                      
                      {goals.length === 0 && (
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Target className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-green-900 text-sm">目標を設定しよう</p>
                            <p className="text-xs text-green-700">分析結果を活かして具体的な目標を</p>
                          </div>
                        </div>
                      )}

                      {!isPremium && (
                        <div className="flex items-start space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Crown className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-yellow-900 text-sm">プレミアムで加速</p>
                            <p className="text-xs text-yellow-700">全機能でキャリアアップを最大化</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        )}

      </div>
    </div>
  )
}
