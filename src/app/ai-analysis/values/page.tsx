'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import SaveAnalysisButton from '@/components/analysis/SaveAnalysisButton'
import { Card } from '@/components/ui/Card'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { AnalysisGuard } from '@/components/analysis/AnalysisGuard'
import { SaveNotification } from '@/components/analysis/SaveNotification'
import { AnalysisRepository } from '@/lib/analysis-repository'
import type { AnalysisResult } from '@/types/analysis'
import { 
  Heart, 
  Scale, 
  Compass, 
  ArrowRight,
  Clock,
  Award,
  Users,
  TrendingUp,
  Shield,
  Zap,
  Target,
  CheckCircle,
  Sparkles,
  Save,
  History,
  BarChart3,
  Home
} from 'lucide-react'

export default function ValuesAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [responses, setResponses] = useState({
    motivating_factors: '',
    demotivating_factors: '',
    ideal_workplace: '',
    decision_criteria: '',
    life_priorities: '',
    satisfaction_factors: ''
  })
  const [user, setUser] = useState<any>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisResult[]>([])
  const [mounted, setMounted] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const analysisRepo = new AnalysisRepository()

  // オンボーディングからの遷移かチェック
  const isFromOnboarding = mounted && searchParams.get('onboarding') === 'true'

  // ★ 関数定義を useEffect より前に移動
  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/auth/login')
      return
    }
    setUser(user)
    
    // プロファイル情報取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    setUserProfile(profile)
    
    // 過去の分析結果を取得
    await loadPastAnalyses(user.id)
    
    // 最新の分析結果があるかチェック
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('analysis_type', 'values')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (existingAnalysis && existingAnalysis.length > 0) {
      setAnalysisResult(existingAnalysis[0])
      setIsSubmitted(true)
    }
  }

  const loadPastAnalyses = async (userId: string) => {
    try {
      const analyses = await analysisRepo.getAnalysesByType(userId, 'values')
      // 保存された分析のみフィルタ
      const savedAnalyses = analyses.filter(a => a.result && Object.keys(a.result).length > 0)
      setPastAnalyses(savedAnalyses)
    } catch (error) {
      console.error('Error loading past analyses:', error)
    }
  }

  // ★ オンボーディング状態更新関数を修正（エラーハンドリング強化）
  const updateTrialAnalysisCompleted = async () => {
    if (!user?.id) return;

    try {
      console.log('🔄 体験分析完了の状態更新を開始...');

      // trial_analysisステップを作成または更新
      const { data: existingStep, error: checkError } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', user.id)
        .eq('step', 'trial_analysis')
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('❌ ステップ確認エラー:', checkError);
        return;
      }

      if (existingStep) {
        // 既存のtrial_analysisステップを完了状態に更新
        const { error: updateError } = await supabase
          .from('user_onboarding')
          .update({
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingStep.id);

        if (updateError) {
          console.error('❌ ステップ更新エラー:', updateError);
          return;
        }
      } else {
        // 新しいtrial_analysisステップを作成
        const { error: insertError } = await supabase
          .from('user_onboarding')
          .insert({
            user_id: user.id,
            step: 'trial_analysis',
            completed_at: new Date().toISOString(),
            data: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) {
          console.error('❌ ステップ作成エラー:', insertError);
          return;
        }
      }

      console.log('✅ 体験分析完了の状態更新が完了しました');

    } catch (error) {
      console.error('❌ updateTrialAnalysisCompleted エラー:', error);
    }
  };


  // ★ useEffect を分離して整理
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) {
      checkAuth()
    }
  }, [mounted])

  useEffect(() => {
    // オンボーディングから来て、既に結果がある場合も状態更新
    if (mounted && isFromOnboarding && analysisResult && user) {
      console.log('Detected onboarding flow with existing result, updating state...')
      updateTrialAnalysisCompleted()
    }
  }, [mounted, isFromOnboarding, analysisResult, user])

  // マウント前は何も表示しない
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-400 to-rose-400 flex items-center justify-center">
        <div className="text-white">読み込み中...</div>
      </div>
    )
  }

  const handleInputChange = (field: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const runAnalysis = async () => {
    if (!user) return
    
    setIsAnalyzing(true)
    
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_type: 'values',
          input_data: responses,
          user_id: user.id
        }),
      })

      if (!response.ok) {
        throw new Error('分析に失敗しました')
      }

      const result = await response.json()
      setAnalysisResult(result)
      setIsSubmitted(true)
      
      // ★ オンボーディング中の場合は必ず体験分析完了フラグを設定
      if (isFromOnboarding) {
        console.log('Analysis completed from onboarding, updating state...')
        await updateTrialAnalysisCompleted()
      }
      
      // 有料プランの場合は保存通知を表示
      if (userProfile?.subscription_status !== 'free') {
        setShowSaveNotification(true)
      }
      
    } catch (error) {
      console.error('Analysis error:', error)
      alert('分析中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setIsSubmitted(false)
    setShowSaveNotification(false)
    setResponses({
      motivating_factors: '',
      demotivating_factors: '',
      ideal_workplace: '',
      decision_criteria: '',
      life_priorities: '',
      satisfaction_factors: ''
    })
  }

  // ★ オンボーディングに戻る処理を修正（エラーハンドリング追加）
  const returnToOnboarding = async () => {
    try {
      console.log('Returning to onboarding...')
      await updateTrialAnalysisCompleted()
      console.log('State updated, redirecting...')
      router.push('/onboarding?step=plan_selection')
    } catch (error) {
      console.error('Error in returnToOnboarding:', error)
      // エラーが出てもリダイレクトは実行
      router.push('/onboarding?step=plan_selection')
    }
  }

  const handleProceed = () => {
    // AnalysisGuardから呼ばれる実行処理
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handlePurchaseTicket = () => {
    router.push('/pricing?tab=tickets')
  }

  const handleSaved = async (analysis: any) => {
    // 保存完了後の処理
    await loadPastAnalyses(user.id)
  }

  const getValueIcon = (valueName: string) => {
    const iconMap: { [key: string]: any } = {
      '成長': TrendingUp,
      '安定': Shield,
      '自由': Zap,
      '貢献': Users,
      '達成': Target,
      '認定': Award,
      'バランス': Scale,
      'default': Heart
    }
    
    const IconComponent = iconMap[valueName] || iconMap['default']
    return <IconComponent className="h-5 w-5" />
  }

  if (isSubmitted && analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-400 to-rose-400 py-12 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/30">
                <Sparkles className="h-4 w-4" />
                <span>価値観分析完了</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                あなたの価値観分析結果
              </h1>
              <p className="text-white/90">
                AIがあなたの価値観を分析し、キャリア指針を明確にしました
              </p>
            </div>
          </AnimatedSection>

          {/* 🔧 追加: 保存ボタン（全プランで表示、フリープランはアップグレード促進） */}
          <AnimatedSection delay={0.05}>
            <div className="text-center mb-6">
              {userProfile?.subscription_status !== 'free' ? (
                // 有料プランの場合：通常の保存ボタン
                <SaveAnalysisButton
                  analysisType="values"
                  inputData={responses}
                  resultData={analysisResult.result}
                  defaultTitle={`価値観分析結果 - ${new Date().toLocaleDateString('ja-JP')}`}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                />
              ) : (
                // フリープランの場合：アップグレード促進ボタン
                <button
                  onClick={() => router.push('/pricing')}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-medium rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>結果を保存する</span>
                  <div className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-semibold">
                    プレミアム
                  </div>
                </button>
              )}
            </div>
          </AnimatedSection>

          {/* 保存通知 */}
          {showSaveNotification && (
            <AnimatedSection delay={0.1}>
              <div className="mb-6">
                <SaveNotification
                  userId={user.id}
                  analysisType="values"
                  inputData={responses}
                  result={analysisResult.result}
                  title={`価値観分析 - ${new Date().toLocaleDateString('ja-JP')}`}
                  onSaved={handleSaved}
                />
              </div>
            </AnimatedSection>
          )}

          {/* 履歴・比較アクション（有料プランのみ） */}
          {userProfile?.subscription_status !== 'free' && (
            <AnimatedSection delay={0.15}>
              <div className="flex flex-wrap gap-3 justify-center mb-8">
                <Button
                  onClick={() => router.push('/analysis-history?type=values')}
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                >
                  <History className="mr-2 h-4 w-4" />
                  分析履歴を見る
                </Button>
                
                {pastAnalyses.length >= 2 && (
                  <Button
                    onClick={() => router.push(`/analysis-history/compare?type=values&id=${analysisResult.id}`)}
                    className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    過去の分析と比較
                  </Button>
                )}
              </div>
            </AnimatedSection>
          )}

          <div className="space-y-8">
            {/* 価値観一致度スコア */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl text-white text-2xl font-bold mb-4 shadow-xl">
                    {(analysisResult.result as any)?.alignment_score || 0}%
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    価値観一致度スコア
                  </h3>
                  <p className="text-white/80">
                    現在の環境とあなたの価値観の整合性です
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* コア価値観 */}
            <AnimatedSection delay={0.3}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-pink-400/30 rounded-xl">
                    <Heart className="h-6 w-6 text-pink-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">あなたのコア価値観</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {((analysisResult.result as any)?.core_values || []).map((value: any, index: number) => (
                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="p-1 bg-pink-400/30 rounded-full text-pink-100">
                            {getValueIcon(value.name)}
                          </div>
                          <h4 className="font-semibold text-white">{value.name}</h4>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-16 h-2 bg-white/20 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-300"
                              style={{ width: `${value.strength}%` }}
                            />
                          </div>
                          <span className="text-xs text-white/70">{value.strength}%</span>
                        </div>
                      </div>
                      <p className="text-white/90 text-sm mb-3">{value.description}</p>
                      <div className="text-xs text-purple-100 bg-purple-400/20 rounded-full px-2 py-1">
                        キャリア影響: {value.career_impact}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 価値観の衝突 */}
            {((analysisResult.result as any)?.value_conflicts || []).length > 0 && (
              <AnimatedSection delay={0.4}>
                <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-orange-400/30 rounded-xl">
                      <Scale className="h-6 w-6 text-orange-100" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">注意すべき価値観の衝突</h3>
                  </div>
                  <div className="space-y-3">
                    {((analysisResult.result as any)?.value_conflicts || []).map((conflict: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                        <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 flex-shrink-0" />
                        <p className="text-white/90">{conflict}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </AnimatedSection>
            )}

            {/* 理想的な職場環境 */}
            <AnimatedSection delay={0.5}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-400/30 rounded-xl">
                    <Users className="h-6 w-6 text-blue-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">あなたに最適な職場環境</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.ideal_work_environment || []).map((env: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <CheckCircle className="h-5 w-5 text-blue-300 mt-0.5 flex-shrink-0" />
                      <p className="text-white/90">{env}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* おすすめアクション */}
            <AnimatedSection delay={0.6}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-400/30 rounded-xl">
                    <Target className="h-6 w-6 text-green-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">価値観に基づくおすすめアクション</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.recommendations || []).map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="bg-green-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <p className="text-white/90">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* キャリア決定指針 */}
            <AnimatedSection delay={0.7}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-400/30 rounded-xl">
                    <Compass className="h-6 w-6 text-indigo-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">キャリア決定の指針</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.career_decisions || []).map((decision: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{decision}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* アクションボタン - オンボーディング対応 */}
            <AnimatedSection delay={0.8}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isFromOnboarding ? (
                  // オンボーディング中の場合
                  <>
                    <Button 
                      type="button"
                      onClick={returnToOnboarding}
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-0 transition-all duration-300"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      オンボーディングを続ける
                    </Button>
                    <Button 
                      type="button"
                      onClick={resetAnalysis}
                      className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30"
                    >
                      もう一度分析する
                    </Button>
                  </>
                ) : (
                  // 通常の場合
                  <>
                    <Button 
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 transition-all duration-300"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      ダッシュボードで確認
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => router.push('/goals')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                    >
                      目標設定に進む
                      <Target className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={resetAnalysis}
                      className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30"
                    >
                      もう一度分析する
                    </Button>
                  </>
                )}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-400 to-rose-400 py-12 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AnalysisGuard */}
        {user && (
          <AnalysisGuard
            userId={user.id}
            analysisType="values"
            onProceed={handleProceed}
            onUpgrade={handleUpgrade}
            onPurchaseTicket={handlePurchaseTicket}
          />
        )}

        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl text-white mb-4 border border-white/30">
              <Heart className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              価値観分析 💎
            </h1>
            <p className="text-white/90 text-lg">
              自らの価値観を深く理解し、キャリア選択の指針を一緒に見つけましょう
            </p>
          </div>
        </AnimatedSection>

        <form className="space-y-6">
          {/* やりがいを感じる要因 */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                仕事でやりがいやモチベーションを感じるのはどのような時ですか？ 🌟
              </label>
              <textarea
                value={responses.motivating_factors}
                onChange={(e) => handleInputChange('motivating_factors', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：チームで目標を達成した時、新しいことを学んでいる時、お客様に感謝された時、創造的な仕事をしている時..."
              />
            </div>
          </AnimatedSection>

          {/* ストレスを感じる要因 */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                ストレスや不満を感じるのはどのような状況ですか？ 😔
              </label>
              <textarea
                value={responses.demotivating_factors}
                onChange={(e) => handleInputChange('demotivating_factors', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：意味のない会議が多い時、創造性を発揮できない時、評価が不公平な時、時間に追われすぎる時..."
              />
            </div>
          </AnimatedSection>

          {/* 理想の職場環境 */}
          <AnimatedSection delay={0.4}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                あなたにとって理想的な職場環境とはどのようなものですか？ 🏢
              </label>
              <textarea
                value={responses.ideal_workplace}
                onChange={(e) => handleInputChange('ideal_workplace', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：オープンなコミュニケーション、成長を支援してくれる、フレックス制度がある、多様性を尊重する..."
              />
            </div>
          </AnimatedSection>

          {/* 意思決定の基準 */}
          <AnimatedSection delay={0.5}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                キャリアを決定する時、最も重視する基準は何ですか？ ⚖️
              </label>
              <textarea
                value={responses.decision_criteria}
                onChange={(e) => handleInputChange('decision_criteria', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：長期的な成長性、安定性、やりがい、収入、ワークライフバランス、社会的意義..."
              />
            </div>
          </AnimatedSection>

          {/* 人生の優先順位 */}
          <AnimatedSection delay={0.6}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                現在の人生において、最も大切にしたい価値観や優先順位は？ 🎯
              </label>
              <textarea
                value={responses.life_priorities}
                onChange={(e) => handleInputChange('life_priorities', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：家族との時間、自己成長、社会貢献、経済的安定、健康、友人関係..."
              />
            </div>
          </AnimatedSection>

          {/* 満足度の要因 */}
          <AnimatedSection delay={0.7}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                仕事に満足するために絶対に必要な要素は何ですか？ ✨
              </label>
              <textarea
                value={responses.satisfaction_factors}
                onChange={(e) => handleInputChange('satisfaction_factors', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：成果が正当に評価される、裁量を持って働ける、学習機会がある、チームワークが良い..."
              />
            </div>
          </AnimatedSection>

          {/* 分析実行ボタン */}
          <AnimatedSection delay={0.8}>
            <div className="text-center pt-4">
              <Button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing || !responses.motivating_factors || !responses.demotivating_factors}
                className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Heart className="mr-2 h-5 w-5" />
                    分析開始 💎
                  </>
                )}
              </Button>
              <p className="text-white/70 text-sm mt-4">
                分析には約1-2分かかります
              </p>
            </div>
          </AnimatedSection>
        </form>
      </div>
    </div>
  )
}
