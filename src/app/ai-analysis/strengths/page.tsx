'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import SaveAnalysisButton from '@/components/analysis/SaveAnalysisButton';
import { Card } from '@/components/ui/Card'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { AnalysisGuard } from '@/components/analysis/AnalysisGuard'
import { SaveNotification } from '@/components/analysis/SaveNotification'
import { AnalysisRepository } from '@/lib/analysis-repository'
import type { AnalysisResult } from '@/types/analysis'
import { 
  Zap, 
  Star, 
  TrendingUp, 
  ArrowRight,
  Clock,
  Award,
  Target,
  Lightbulb,
  CheckCircle,
  Sparkles,
  Save,
  History,
  BarChart3,
  Home
} from 'lucide-react'

export default function StrengthsAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [responses, setResponses] = useState({
    achievements: '',
    skills_confidence: '',
    feedback_received: '',
    natural_talents: '',
    energy_sources: '',
    problem_solving: ''
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
      .eq('analysis_type', 'strengths')
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
      const analyses = await analysisRepo.getAnalysesByType(userId, 'strengths')
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
          analysis_type: 'strengths',
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
      achievements: '',
      skills_confidence: '',
      feedback_received: '',
      natural_talents: '',
      energy_sources: '',
      problem_solving: ''
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
      <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-400 to-pink-500 py-12 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/30">
                <Sparkles className="h-4 w-4" />
                <span>強み分析完了</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                あなたの強み分析結果
              </h1>
              <p className="text-white/90">
                AIがあなたの強みを多角的に分析し、キャリア活用法を提案しました
              </p>
            </div>
          </AnimatedSection>

          {/* 🔧 追加: 保存ボタン（全プランで表示、フリープランはアップグレード促進） */}
          <AnimatedSection delay={0.05}>
            <div className="text-center mb-6">
              {userProfile?.subscription_status !== 'free' ? (
                // 有料プランの場合：通常の保存ボタン
                <SaveAnalysisButton
                  analysisType="strengths"
                  inputData={responses}
                  resultData={analysisResult.result}
                  defaultTitle={`強み分析結果 - ${new Date().toLocaleDateString('ja-JP')}`}
                  className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40"
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
                  analysisType="strengths"
                  inputData={responses}
                  result={analysisResult.result}
                  title={`強み分析 - ${new Date().toLocaleDateString('ja-JP')}`}
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
                  onClick={() => router.push('/analysis-history?type=strengths')}
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                >
                  <History className="mr-2 h-4 w-4" />
                  分析履歴を見る
                </Button>
                
                {pastAnalyses.length >= 2 && (
                  <Button
                    onClick={() => router.push(`/analysis-history/compare?type=strengths&id=${analysisResult.id}`)}
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
            {/* 強みスコア */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-8 border border-white/30 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl text-white text-2xl font-bold mb-4 shadow-xl">
                    {(analysisResult.result as any)?.strength_score || 0}%
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    強み活用度スコア
                  </h3>
                  <p className="text-white/80">
                    現在の強みの認識と活用レベルです
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* コア強み */}
            <AnimatedSection delay={0.3}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-2 bg-yellow-400/30 rounded-xl">
                    <Star className="h-6 w-6 text-yellow-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">あなたのコア強み</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {((analysisResult.result as any)?.core_strengths || []).map((strength: string, index: number) => (
                    <div key={index} className="flex items-center space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <Award className="h-5 w-5 text-yellow-300 flex-shrink-0" />
                      <span className="text-white font-medium">{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 隠れた強み */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-400/30 rounded-xl">
                    <Zap className="h-6 w-6 text-purple-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">発見された隠れた強み</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.hidden_strengths || []).map((strength: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-purple-300 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{strength}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* キャリア活用法 */}
            <AnimatedSection delay={0.5}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-400/30 rounded-xl">
                    <TrendingUp className="h-6 w-6 text-green-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">キャリアでの活用法</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.strength_applications || []).map((application: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <CheckCircle className="h-5 w-5 text-green-300 mt-0.5 flex-shrink-0" />
                      <p className="text-white/90">{application}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* キャリア上の優位性 */}
            <AnimatedSection delay={0.6}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-400/30 rounded-xl">
                    <Target className="h-6 w-6 text-blue-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">あなたのキャリア優位性</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.career_advantages || []).map((advantage: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="bg-blue-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <p className="text-white/90">{advantage}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 成長領域 */}
            <AnimatedSection delay={0.7}>
              <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-400/30 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-indigo-100" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">さらなる成長領域</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.development_areas || []).map((area: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/10 rounded-xl border border-white/20">
                      <div className="w-2 h-2 bg-indigo-300 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{area}</p>
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
                      onClick={() => router.push('/ai-analysis/career-path')}
                      className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 transition-all duration-300"
                    >
                      キャリアパス分析を行う
                      <ArrowRight className="ml-2 h-4 w-4" />
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
    <div className="min-h-screen bg-gradient-to-br from-orange-600 via-red-400 to-pink-500 py-12 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AnalysisGuard */}
        {user && (
          <AnalysisGuard
            userId={user.id}
            analysisType="strengths"
            onProceed={handleProceed}
            onUpgrade={handleUpgrade}
            onPurchaseTicket={handlePurchaseTicket}
          />
        )}

        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/15 backdrop-blur-sm rounded-2xl text-white mb-4 border border-white/30">
              <Star className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              強み分析 ⭐
            </h1>
            <p className="text-white/90 text-lg">
              あなたの強みを発見し、キャリアで活かす方法を見つけましょう
            </p>
          </div>
        </AnimatedSection>

        <form className="space-y-6">
          {/* 過去の成果・実績 */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                これまでの仕事や活動で、最も誇れる成果や実績を教えてください 🏆
              </label>
              <textarea
                value={responses.achievements}
                onChange={(e) => handleInputChange('achievements', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：チームの売上を前年比150%達成、新システム導入でコスト30%削減、部署の業務効率を大幅に改善..."
              />
            </div>
          </AnimatedSection>

          {/* 自信のあるスキル */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                人よりも得意だと自信を持って言えるスキルや能力は何ですか？ 💪
              </label>
              <textarea
                value={responses.skills_confidence}
                onChange={(e) => handleInputChange('skills_confidence', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：データ分析、プレゼンテーション、チームマネジメント、問題解決、コミュニケーション..."
              />
            </div>
          </AnimatedSection>

          {/* 他者からの評価 */}
          <AnimatedSection delay={0.4}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                同僚や上司から褒められることが多い点はありますか？ 👏
              </label>
              <textarea
                value={responses.feedback_received}
                onChange={(e) => handleInputChange('feedback_received', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：いつも冷静で判断力がある、アイデアが豊富、人をまとめるのが上手、細かい作業が得意..."
              />
            </div>
          </AnimatedSection>

          {/* 自然にできること */}
          <AnimatedSection delay={0.5}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                特に努力をしなくても自然にできてしまうことはありますか？ ✨
              </label>
              <textarea
                value={responses.natural_talents}
                onChange={(e) => handleInputChange('natural_talents', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：人の話を聞くのが得意、細かい作業に集中できる、新しいことを覚えるのが早い、人との関係構築..."
              />
            </div>
          </AnimatedSection>

          {/* エネルギーの源泉 */}
          <AnimatedSection delay={0.6}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                どんな時に最もエネルギーが湧き、活き活きと働けますか？ ⚡
              </label>
              <textarea
                value={responses.energy_sources}
                onChange={(e) => handleInputChange('energy_sources', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：チームで協力している時、新しい挑戦をしている時、成果が見えた時、人に教えている時..."
              />
            </div>
          </AnimatedSection>

          {/* 問題解決アプローチ */}
          <AnimatedSection delay={0.7}>
            <div className="bg-white/15 backdrop-blur-lg rounded-2xl p-6 border border-white/30 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                困難な問題に直面した時、あなたはどのようにアプローチしますか？ 🧩
              </label>
              <textarea
                value={responses.problem_solving}
                onChange={(e) => handleInputChange('problem_solving', e.target.value)}
                className="w-full p-4 bg-white/10 border border-white/30 rounded-xl text-white placeholder-white/60 focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：データを集めて分析する、関係者と相談する、創造的なアイデアを考える、段階的に解決する..."
              />
            </div>
          </AnimatedSection>

          {/* 分析実行ボタン */}
          <AnimatedSection delay={0.8}>
            <div className="text-center pt-4">
              <Button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing || !responses.achievements || !responses.skills_confidence}
                className="bg-white/25 backdrop-blur-sm hover:bg-white/35 text-white border border-white/40 px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Star className="mr-2 h-5 w-5" />
                    分析開始 ⭐
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
