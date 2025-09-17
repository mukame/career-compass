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
  Compass, 
  MapPin, 
  Route, 
  ArrowRight,
  Clock,
  TrendingUp,
  Target,
  Building,
  Users,
  Briefcase,
  Calendar,
  Sparkles,
  Save,
  History,
  BarChart3,
  Home
} from 'lucide-react'

export default function CareerPathAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [responses, setResponses] = useState({
    current_role: '',
    career_goals: '',
    preferred_industries: '',
    work_style: '',
    timeline_expectations: '',
    skill_interests: ''
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
  const isFromOnboarding = searchParams.get('onboarding') === 'true'

  useEffect(() => {
    setMounted(true)
    checkAuth()
  }, [])

  // 🔧 追加: 体験分析完了状態を更新する関数
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
      .eq('analysis_type', 'career')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (existingAnalysis && existingAnalysis.length > 0) {
      setAnalysisResult(existingAnalysis[0])
      setIsSubmitted(true)
      
      // 🔧 追加: 既存の結果がある場合もオンボーディング状態を更新
      if (isFromOnboarding && mounted) {
        await updateTrialAnalysisCompleted()
      }
    }
  }

  const loadPastAnalyses = async (userId: string) => {
    try {
      const analyses = await analysisRepo.getAnalysesByType(userId, 'career')
      // 保存された分析のみフィルタ
      const savedAnalyses = analyses.filter(a => a.result && Object.keys(a.result).length > 0)
      setPastAnalyses(savedAnalyses)
    } catch (error) {
      console.error('Error loading past analyses:', error)
    }
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
          analysis_type: 'career',
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
      
      // 🔧 追加: オンボーディングからの場合、体験分析完了状態を更新
      if (isFromOnboarding) {
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
      current_role: '',
      career_goals: '',
      preferred_industries: '',
      work_style: '',
      timeline_expectations: '',
      skill_interests: ''
    })
  }

  // オンボーディングに戻る処理
  const returnToOnboarding = async () => {
    // 🔧 追加: オンボーディングに戻る際も状態更新
    if (isFromOnboarding) {
      await updateTrialAnalysisCompleted()
    }
    router.push('/onboarding?step=plan_selection')
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

  if (isSubmitted && analysisResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-400 to-teal-400 py-12 lg:py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/30">
                <Sparkles className="h-4 w-4" />
                <span>キャリアパス分析完了</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                あなたのキャリアパス提案
              </h1>
              <p className="text-white/90">
                AIがあなたに最適なキャリアの道筋を分析しました
              </p>
            </div>
          </AnimatedSection>

          {/* 🔧 追加: 保存ボタン（全プランで表示、フリープランはアップグレード促進） */}
          <AnimatedSection delay={0.05}>
            <div className="text-center mb-6">
              {userProfile?.subscription_status !== 'free' ? (
                // 有料プランの場合：通常の保存ボタン
                <SaveAnalysisButton
                  analysisType="career"
                  inputData={responses}
                  resultData={analysisResult.result}
                  defaultTitle={`キャリアパス分析結果 - ${new Date().toLocaleDateString('ja-JP')}`}
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
                  analysisType="career"
                  inputData={responses}
                  result={analysisResult.result}
                  title={`キャリアパス分析 - ${new Date().toLocaleDateString('ja-JP')}`}
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
                  onClick={() => router.push('/analysis-history?type=career')}
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                >
                  <History className="mr-2 h-4 w-4" />
                  分析履歴を見る
                </Button>
                
                {pastAnalyses.length >= 2 && (
                  <Button
                    onClick={() => router.push(`/analysis-history/compare?type=career&id=${analysisResult.id}`)}
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
            {/* 適合度スコア */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl text-white text-2xl font-bold mb-4 shadow-xl">
                    {(analysisResult.result as any)?.compatibility_score || 0}%
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    キャリア適合度スコア
                  </h3>
                  <p className="text-white/80">
                    現在の方向性と目標の整合性を示しています
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* おすすめキャリアパス */}
            <AnimatedSection delay={0.3}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-green-400/30 rounded-xl">
                    <Route className="h-6 w-6 text-green-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">おすすめキャリアパス</h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {((analysisResult.result as any)?.recommended_paths || []).map((path: any, index: number) => (
                    <div key={index} className="bg-white/10 border border-white/20 rounded-xl p-5">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-white text-lg">{path.title}</h4>
                        <div className="flex items-center space-x-1 bg-green-500/80 text-white px-2 py-1 rounded-full text-xs">
                          <TrendingUp className="h-3 w-3" />
                          <span>{path.growth_potential}%</span>
                        </div>
                      </div>
                      <p className="text-white/90 mb-3 text-sm leading-relaxed">{path.description}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <Calendar className="h-4 w-4 text-green-200" />
                        <span className="text-sm text-white/80">{path.timeline}</span>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-white/70 uppercase tracking-wide">必要スキル</p>
                        <div className="flex flex-wrap gap-1">
                          {(path.required_skills || []).map((skill: string, skillIndex: number) => (
                            <span key={skillIndex} className="text-xs border border-green-300/50 text-green-100 bg-green-500/20 px-2 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* スキルギャップ */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-400/30 rounded-xl">
                    <Target className="h-6 w-6 text-orange-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">スキルギャップ分析</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {((analysisResult.result as any)?.skill_gaps || []).map((gap: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-orange-300 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-white/90 text-sm">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 次のマイルストーン */}
            <AnimatedSection delay={0.5}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-400/30 rounded-xl">
                    <MapPin className="h-6 w-6 text-blue-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">次の重要マイルストーン</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.next_milestones || []).map((milestone: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="bg-blue-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/90 font-medium">{milestone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 業界洞察 */}
            <AnimatedSection delay={0.6}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-400/30 rounded-xl">
                    <Building className="h-6 w-6 text-purple-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">業界トレンド・洞察</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.industry_insights || []).map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* アクションボタン - オンボーディング対応 */}
            <AnimatedSection delay={0.7}>
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
                      onClick={() => router.push('/ai-analysis/values')}
                      className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 transition-all duration-300"
                    >
                      価値観分析を行う
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => router.push('/goals')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                    >
                      目標設定に進む
                      <Briefcase className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={resetAnalysis}
                      className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30"
                    >
                      もう一度分析する
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/30"
                    >
                      <Home className="mr-2 h-4 w-4" />
                      ダッシュボードに戻る
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
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-emerald-400 to-teal-400 py-12 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AnalysisGuard */}
        {user && (
          <AnalysisGuard
            userId={user.id}
            analysisType="career"
            onProceed={handleProceed}
            onUpgrade={handleUpgrade}
            onPurchaseTicket={handlePurchaseTicket}
          />
        )}

        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl text-white mb-4 border border-white/30">
              <Compass className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              キャリアパス分析 🗺️
            </h1>
            <p className="text-white/90 text-lg">
              あなたの目標と現状をもとに、最短ルートを提案します
            </p>
          </div>
        </AnimatedSection>

        <form className="space-y-6">
          {/* 現在の役割・ポジション */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                現在の役割・ポジションと主な業務内容を教えてください 🕴️
              </label>
              <textarea
                value={responses.current_role}
                onChange={(e) => handleInputChange('current_role', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：ソフトウェアエンジニア、チーム内でのシステム開発、コードレビュー、要件定義を担当しています..."
              />
            </div>
          </AnimatedSection>

          {/* キャリア目標 */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                3-5年後に目指したいキャリア目標はどのようなものですか？ 🎯
              </label>
              <textarea
                value={responses.career_goals}
                onChange={(e) => handleInputChange('career_goals', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：技術リーダーになりたい、マネージャーを目指したい、独立してフリーランスになりたい..."
              />
            </div>
          </AnimatedSection>

          {/* 興味のある業界・分野 */}
          <AnimatedSection delay={0.4}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                興味のある業界・分野や、働いてみたい企業はどのようなタイプですか？ 🏢
              </label>
              <textarea
                value={responses.preferred_industries}
                onChange={(e) => handleInputChange('preferred_industries', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：IT・テック業界、スタートアップ、大手企業、コンサルティング、教育業界..."
              />
            </div>
          </AnimatedSection>

          {/* 理想の働き方 */}
          <AnimatedSection delay={0.5}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                理想的な働き方やワークスタイルを教えてください 🌟
              </label>
              <textarea
                value={responses.work_style}
                onChange={(e) => handleInputChange('work_style', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：チームでの協働、個人の裁量が大きい、リモートワーク中心、グローバル環境、クリエイティブな仕事..."
              />
            </div>
          </AnimatedSection>

          {/* タイムライン */}
          <AnimatedSection delay={0.6}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                キャリアチェンジやキャリアアップはどの程度の期間で実現したいですか？⏰
              </label>
              <textarea
                value={responses.timeline_expectations}
                onChange={(e) => handleInputChange('timeline_expectations', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：1年以内に転職したい、2-3年でマネージャーになりたい、じっくり準備してから挑戦したい..."
              />
            </div>
          </AnimatedSection>

          {/* 学びたいスキル */}
          <AnimatedSection delay={0.7}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                新たに身につけたいスキルや知識分野はありますか？ 📚
              </label>
              <textarea
                value={responses.skill_interests}
                onChange={(e) => handleInputChange('skill_interests', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-green-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：AI・機械学習、マネジメントスキル、デザイン、マーケティング、データ分析..."
              />
            </div>
          </AnimatedSection>

          {/* 分析実行ボタン */}
          <AnimatedSection delay={0.8}>
            <div className="text-center pt-4">
              <Button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing || !responses.current_role || !responses.career_goals}
                className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Compass className="mr-2 h-5 w-5" />
                    分析開始 🗺️
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
