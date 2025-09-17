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
import { AnalysisErrorDialog } from '@/components/ui/AnalysisErrorDialog'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Save,
  History,
  BarChart3,
  Home
} from 'lucide-react'

// 【修正】AnalysisErrorDialog用の型を使用
  interface AnalysisError {
    error: string // 必須
    code?: string
    title?: string
    message: string
    details?: {
      analysisType?: string
      currentUsage?: number
      limit?: number
      ticketPrice?: number
      resetDate?: string
      resetTime?: string
      usageInfo?: any
    }
    actions?: Array<{
      type: 'upgrade' | 'purchase' | 'wait' | 'contact'
      label: string
      url?: string
      description?: string
      primary?: boolean
    }>
    // 既存のレスポンス形式との互換性
    ticket_price?: number
    usage_info?: any
    requires_ticket?: boolean
  }


export default function ClarityAnalysisPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [responses, setResponses] = useState({
    current_situation: '',
    main_concerns: '',
    ideal_future: '',
    obstacles: '',
    values_priority: ''
  })
  const [user, setUser] = useState<any>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  const [pastAnalyses, setPastAnalyses] = useState<AnalysisResult[]>([])
  const [mounted, setMounted] = useState(false)
  const [analysisError, setAnalysisError] = useState<AnalysisError | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  
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

  // 体験分析完了状態を更新する関数
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
    
    // 【修正】最新の分析結果チェック（clarityに統一）
    const { data: existingAnalysis } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', user.id)
      .eq('analysis_type', 'clarity')
      .order('created_at', { ascending: false })
      .limit(1)
    
    if (existingAnalysis && existingAnalysis.length > 0) {
      setAnalysisResult(existingAnalysis[0])
      setIsSubmitted(true)
      
      if (isFromOnboarding && mounted) {
        await updateTrialAnalysisCompleted()
      }
    }
  }

  const loadPastAnalyses = async (userId: string) => {
    try {
      // 【修正】まず直接データベースから取得を試行
      const { data: analyses, error } = await supabase
        .from('ai_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_type', 'clarity')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading past analyses:', error)
        setPastAnalyses([])
        return
      }

      // 保存された分析のみフィルタ
      const savedAnalyses = (analyses || []).filter(a => a.result && Object.keys(a.result).length > 0)
      setPastAnalyses(savedAnalyses)
    } catch (error) {
      console.error('Error loading past analyses:', error)
      setPastAnalyses([])
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setResponses(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // runAnalysis関数内のエラーハンドリング部分を修正
  const runAnalysis = async () => {
    if (!user) return
    
    setIsAnalyzing(true)
    setAnalysisError(null)
    
    try {
      const response = await fetch('/api/openai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_type: 'clarity',
          input_data: responses,
          user_id: user.id
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Analysis API error:', errorData)
        
        // 【修正】errorフィールドを確実にstringにする
        const formattedError: AnalysisError = {
          error: errorData.error || errorData.code || 'UNKNOWN_ERROR', // 必ずstring
          code: errorData.code,
          title: errorData.title,
          message: errorData.message || '分析中にエラーが発生しました。',
          details: {
            analysisType: 'モヤモヤ分析',
            currentUsage: errorData.details?.currentUsage,
            limit: errorData.details?.limit,
            ticketPrice: errorData.details?.ticketPrice || errorData.ticket_price,
            resetDate: errorData.details?.resetDate,
            resetTime: errorData.details?.resetTime,
            usageInfo: errorData.usage_info
          },
          actions: errorData.actions,
          // 既存形式との互換性
          requires_ticket: errorData.requires_ticket,
          ticket_price: errorData.ticket_price,
          usage_info: errorData.usage_info
        }
        
        setAnalysisError(formattedError)
        setShowErrorDialog(true)
        return
      }

      const result = await response.json()
      setAnalysisResult(result)
      setIsSubmitted(true)
      
      if (isFromOnboarding) {
        await updateTrialAnalysisCompleted()
      }
      
      if (userProfile?.subscription_status !== 'free') {
        setShowSaveNotification(true)
      }
      
    } catch (error) {
      console.error('Network error:', error)
      // 【修正】ネットワークエラーも必須errorフィールドを確実に設定
      setAnalysisError({
        error: 'NETWORK_ERROR', // 確実にstring
        code: 'NETWORK_ERROR',
        title: 'ネットワークエラー',
        message: 'ネットワーク接続を確認してください。',
        actions: [{
          type: 'contact',
          label: 'サポートに問い合わせ',
          url: '/contact',
          primary: true
        }]
      })
      setShowErrorDialog(true)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetAnalysis = () => {
    setAnalysisResult(null)
    setIsSubmitted(false)
    setShowSaveNotification(false)
    setResponses({
      current_situation: '',
      main_concerns: '',
      ideal_future: '',
      obstacles: '',
      values_priority: ''
    })
  }

  // オンボーディングに戻る処理
  const returnToOnboarding = async () => {
    if (isFromOnboarding) {
      await updateTrialAnalysisCompleted()
    }
    router.push('/onboarding?step=plan_selection')
  }

  const handleProceed = () => {
    // AnalysisGuardから呼ばれる実行処理
    // 既に認証とプロファイル取得は完了しているので何もしない
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/20">
                <Sparkles className="h-4 w-4" />
                <span>モヤモヤ分析完了</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                あなたの現状分析結果
              </h1>
              <p className="text-white/80">
                AIがあなたの回答を分析し、キャリアの方向性を明確にしました
              </p>
            </div>
          </AnimatedSection>

          {/* 保存ボタン（全プランで表示、フリープランはアップグレード促進） */}
          <AnimatedSection delay={0.05}>
            <div className="text-center mb-6">
              {userProfile?.subscription_status !== 'free' ? (
                <SaveAnalysisButton
                  analysisType="clarity"
                  inputData={responses}
                  resultData={analysisResult.result}
                  defaultTitle={`モヤモヤ分析結果 - ${new Date().toLocaleDateString('ja-JP')}`}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30"
                />
              ) : (
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
                  analysisType="clarity"
                  inputData={responses}
                  result={analysisResult.result}
                  title={`モヤモヤ分析 - ${new Date().toLocaleDateString('ja-JP')}`}
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
                  onClick={() => router.push('/analysis-history?type=clarity')}
                  className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white border border-white/20"
                >
                  <History className="mr-2 h-4 w-4" />
                  分析履歴を見る
                </Button>
                
                {pastAnalyses.length >= 2 && (
                  <Button
                    onClick={() => router.push(`/analysis-history/compare?type=clarity&id=${analysisResult.id}`)}
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
            {/* 明確度スコア */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl text-white text-2xl font-bold mb-4 shadow-xl">
                    {(analysisResult.result as any)?.clarity_score || 0}%
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    キャリア明確度スコア
                  </h3>
                  <p className="text-white/70">
                    現在のキャリアに対する明確性の度合いです
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* 主な関心事 */}
            <AnimatedSection delay={0.3}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-orange-500/20 rounded-xl">
                    <AlertCircle className="h-6 w-6 text-orange-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">主な関心事・悩み</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.main_concerns || []).map((concern: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{concern}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 洞察 */}
            <AnimatedSection delay={0.4}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-xl">
                    <Lightbulb className="h-6 w-6 text-yellow-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">AI洞察</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.insights || []).map((insight: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* おすすめアクション */}
            <AnimatedSection delay={0.5}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-xl">
                    <Target className="h-6 w-6 text-green-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">おすすめアクション</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.recommendations || []).map((rec: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <CheckCircle className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <p className="text-white/90">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* 次のステップ */}
            <AnimatedSection delay={0.6}>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-xl">
                    <ArrowRight className="h-6 w-6 text-blue-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">次のステップ</h3>
                </div>
                <div className="space-y-3">
                  {((analysisResult.result as any)?.next_steps || []).map((step: string, index: number) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center mt-0.5 flex-shrink-0 font-medium">
                        {index + 1}
                      </div>
                      <p className="text-white/90">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* アクションボタン - オンボーディング対応 */}
            <AnimatedSection delay={0.7}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isFromOnboarding ? (
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
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
                    >
                      もう一度分析する
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      type="button"
                      onClick={() => router.push('/ai-analysis/strengths')}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 transition-all duration-300"
                    >
                      次は強み分析を行う
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button 
                      type="button"
                      onClick={resetAnalysis}
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
                    >
                      もう一度分析する
                    </Button>
                    <Button 
                      type="button"
                      onClick={() => router.push('/dashboard')}
                      className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 py-12 lg:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AnalysisGuard */}
        {user && (
          <AnalysisGuard
            userId={user.id}
            analysisType="clarity"
            onProceed={handleProceed}
            onUpgrade={handleUpgrade}
            onPurchaseTicket={handlePurchaseTicket}
          />
        )}

        <AnimatedSection>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl text-white mb-4 border border-white/20">
              <Brain className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              モヤモヤ分析 🤔
            </h1>
            <p className="text-white/80 text-lg">
              現在の悩みや課題をAIと一緒に整理してみましょう
            </p>
          </div>
        </AnimatedSection>

        <form className="space-y-6">
          {/* 現在の状況 */}
          <AnimatedSection delay={0.2}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                あなたのキャリア状況について詳しく教えてください 💭
              </label>
              <textarea
                value={responses.current_situation}
                onChange={(e) => handleInputChange('current_situation', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：今の仕事にやりがいを感じず、毎日が単調に感じています。将来のキャリアについても明確なビジョンが描けず、このままでいいのか不安…"
              />
            </div>
          </AnimatedSection>

          {/* 主な悩み */}
          <AnimatedSection delay={0.3}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                現在特に気になることは何ですか？😟
              </label>
              <textarea
                value={responses.main_concerns}
                onChange={(e) => handleInputChange('main_concerns', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：同僚と比較して成長が遅いと感じる、上司との関係がうまくいかない、新しいスキルを身につける時間がない..."
              />
            </div>
          </AnimatedSection>

          {/* 理想の未来 */}
          <AnimatedSection delay={0.4}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                あなたの思う理想の将来像はどのようなものですか？ ✨
              </label>
              <textarea
                value={responses.ideal_future}
                onChange={(e) => handleInputChange('ideal_future', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：もっとやりがいのある仕事がしたい、チームをリードする立場になりたい、ワークライフバランスを改善したい..."
              />
            </div>
          </AnimatedSection>

          {/* 障害・課題 */}
          <AnimatedSection delay={0.5}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                理想に向かう上での障害や課題はどのようなものですか？ 🚧
              </label>
              <textarea
                value={responses.obstacles}
                onChange={(e) => handleInputChange('obstacles', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：スキル不足、時間がない、何から始めればいいか分からない、環境を変える勇気がない..."
              />
            </div>
          </AnimatedSection>

          {/* 価値観の優先順位 */}
          <AnimatedSection delay={0.6}>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-xl">
              <label className="block text-lg font-medium text-white mb-4">
                仕事において最も大切にしたいことや、価値観は何ですか？ 💎
              </label>
              <textarea
                value={responses.values_priority}
                onChange={(e) => handleInputChange('values_priority', e.target.value)}
                className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none backdrop-blur-sm"
                rows={4}
                placeholder="例：成長できる環境、安定した収入、やりがいのある仕事、自由度の高い働き方、良好な人間関係..."
              />
            </div>
          </AnimatedSection>

          {/* 分析実行ボタン */}
          <AnimatedSection delay={0.7}>
            <div className="text-center pt-4">
              <Button
                type="button"
                onClick={runAnalysis}
                disabled={isAnalyzing || !responses.current_situation || !responses.main_concerns}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 px-8 py-4 text-lg font-semibold transition-all duration-300 shadow-xl"
              >
                {isAnalyzing ? (
                  <>
                    <Clock className="animate-spin mr-2 h-5 w-5" />
                    AI分析中...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-5 w-5" />
                    分析開始 🧠
                  </>
                )}
              </Button>
              <p className="text-white/60 text-sm mt-4">
                分析には約1-2分かかります
              </p>
            </div>
          </AnimatedSection>
        </form>
      </div>
      {/* エラーダイアログ */}
      <AnalysisErrorDialog
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        error={analysisError}
      />
    </div>
  )
}
