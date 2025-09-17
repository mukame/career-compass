'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Check, 
  X, 
  Zap, 
  Crown,
  Gift,
  Sparkles,
  Brain,
  Target,
  Calendar,
  Award,
  Shield,
  CreditCard,
  AlertCircle,
  Clock,
  RefreshCw,
  Lock,
  TrendingUp,
  BarChart3,
  Users,
  MessageCircle,
  FileText,
  Coins,
  Star,
  Eye,
  Save,
  History,
  Briefcase,
  PieChart
} from 'lucide-react'
import { SubscriptionManager, type SubscriptionPlan } from '@/lib/subscription'

interface PricingPlansProps {
  currentUserId?: string
  showTrialInfo?: boolean
}

export function PricingPlans({ currentUserId, showTrialInfo = false }: PricingPlansProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState('')
  const [referralDiscount, setReferralDiscount] = useState(0)
  const [showTicketPricing, setShowTicketPricing] = useState(false)
  
  const subscriptionManager = new SubscriptionManager()

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      // 新しい戦略的プランニングに基づくプラン設計
      const mockPlans: SubscriptionPlan[] = [
        {
          id: 'free',
          name: 'free',
          display_name: 'フリープラン',
          price_monthly: 0,
          price_yearly: 0,
          features: {
            // AI分析機能（各月1回まで、制限強化）
            analysis_clarity: 1,
            analysis_strengths: 1,
            analysis_career: 1,
            analysis_values: 1,
            analysis_persona: 0, // 利用不可
            
            // 保存機能（一切保存不可に変更）
            save_results: false,
            history_months: 0, // リアルタイム表示のみ
            
            // その他制限（強化）
            goals_limit: 1,
            tasks_limit: 5,
            export_data: false,
            comparison: false
          }
        },
        {
          id: 'standard',
          name: 'standard', 
          display_name: 'スタンダードプラン',
          price_monthly: 1480,
          price_yearly: 14208, // 20%OFF (月換算1,184円)
          features: {
            // AI分析機能（シンプル化：全分析月15回）
            analysis_clarity: 15,
            analysis_strengths: 15,
            analysis_career: 15,
            analysis_values: 15,
            analysis_persona: 2, // 微減で希少性確保
            
            // 保存・履歴
            save_results: true,
            history_months: 3, // 過去3ヶ月分
            comparison: true, // 最大3件まで同時比較
            
            // 追加価値
            weekly_reminder: true,
            trend_display: true,
            goal_tracking: true,
            
            goals_limit: -1,
            tasks_limit: -1,
            export_data: true
          }
        },
        {
          id: 'premium',
          name: 'premium',
          display_name: 'プレミアムプラン',
          price_monthly: 2980,
          price_yearly: 28608, // 20%OFF (月換算2,384円)
          features: {
            // AI分析機能（完全無制限）
            analysis_clarity: -1,
            analysis_strengths: -1,
            analysis_career: -1,
            analysis_values: -1,
            analysis_persona: -1,
            
            // 独占機能
            advanced_persona: true, // 高度な人物像分析
            industry_analysis: true, // 業界特化分析
            future_prediction: true, // 将来予測分析
            ai_coaching: true, // AIキャリアコーチ
            personal_report: true, // パーソナル分析レポート
            auto_goal_generation: true, // 目標自動生成
            market_analysis: true, // 市場価値分析
            
            // 保存・履歴（無制限）
            save_results: true,
            history_months: -1,
            comparison: true,
            
            // 追加価値
            weekly_reminder: true,
            trend_display: true,
            goal_tracking: true,
            
            goals_limit: -1,
            tasks_limit: -1,
            export_data: true
          }
        }
      ]
      
      setPlans(mockPlans)
    } catch (error) {
      console.error('Error fetching plans:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReferralCodeApply = async () => {
    if (!currentUserId || !referralCode.trim()) return
    
    try {
      const success = await subscriptionManager.applyReferralCode(currentUserId, referralCode.trim())
      if (success) {
        setReferralDiscount(500)
        alert('紹介コードが適用されました！500円の割引が適用されます。')
      } else {
        alert('無効な紹介コードです。コードを確認してください。')
      }
    } catch (error) {
      console.error('Error applying referral code:', error)
      alert('紹介コードの適用に失敗しました。もう一度お試しください。')
    }
  }

  const handlePlanSelect = async (planId: string) => {
    if (!currentUserId) {
      window.location.href = '/auth/login'
      return
    }

    if (planId === 'free') {
      window.location.href = '/dashboard'
      return
    }

    setCheckoutLoading(planId)

    try {
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          billingCycle,
          referralDiscount,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      const stripe = await stripePromise
      if (!stripe) {
        throw new Error('Stripe failed to load')
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      alert('決済画面の作成に失敗しました。もう一度お試しください。')
    } finally {
      setCheckoutLoading(null)
    }
  }

  const getPrice = (plan: SubscriptionPlan) => {
    const basePrice = billingCycle === 'yearly' ? plan.price_yearly : plan.price_monthly
    const discountedPrice = Math.max(0, basePrice - referralDiscount)
    
    if (billingCycle === 'yearly') {
      return {
        price: discountedPrice,
        monthlyEquivalent: Math.round(discountedPrice / 12),
        savings: plan.price_monthly * 12 - plan.price_yearly
      }
    }
    
    return {
      price: discountedPrice,
      monthlyEquivalent: discountedPrice,
      savings: 0
    }
  }

  const formatLimit = (limit: number) => {
    return limit === -1 ? '無制限' : `${limit}回/月`
  }

  const planIcons = {
    free: Gift,
    standard: Zap,
    premium: Crown
  }

  const planColors = {
    free: 'from-gray-500 to-slate-600',
    standard: 'from-blue-500 to-purple-600', 
    premium: 'from-purple-500 to-pink-600'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          あなたに最適なプランを選択
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          AIがあなたのキャリアアップを徹底サポート
        </p>
        
        {/* 支払いサイクル選択 */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-3 rounded-lg transition-all ${
              billingCycle === 'monthly'
                ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            月額払い
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-3 rounded-lg transition-all flex items-center space-x-2 ${
              billingCycle === 'yearly'
                ? 'bg-green-100 text-green-700 border-2 border-green-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>年額払い</span>
            <Badge className="bg-green-500 text-white border-0 text-xs">20% OFF</Badge>
          </button>
        </div>
      </div>

      {/* 紹介コード入力 */}
      {currentUserId && (
        <div className="max-w-md mx-auto mb-8 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-medium text-gray-900 mb-2 flex items-center">
            <Gift className="w-4 h-4 mr-2 text-blue-600" />
            紹介コードをお持ちの方
          </h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value)}
              placeholder="紹介コードを入力"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button 
              size="sm" 
              onClick={handleReferralCodeApply}
              disabled={!referralCode.trim()}
            >
              適用
            </Button>
          </div>
          {referralDiscount > 0 && (
            <p className="text-sm text-green-600 mt-2 flex items-center">
              <Gift className="w-4 h-4 mr-1" />
              {referralDiscount}円の割引が適用されました！
            </p>
          )}
        </div>
      )}

      {/* プランカード */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
        {plans.map((plan) => {
          const IconComponent = planIcons[plan.name as keyof typeof planIcons]
          const pricing = getPrice(plan)
          const isPopular = plan.name === 'standard'
          const isLoading = checkoutLoading === plan.id
          
          return (
            <Card 
              key={plan.id}
              className={`relative shadow-xl border-0 bg-white/90 backdrop-blur-sm transition-all duration-300 hover:shadow-2xl ${
                isPopular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-6 py-2">
                    <Sparkles className="w-4 h-4 mr-1" />
                    人気 No.1
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r ${planColors[plan.name as keyof typeof planColors]} flex items-center justify-center shadow-lg`}>
                  <IconComponent className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900">{plan.display_name}</h3>
                
                <div className="mt-4">
                  {plan.price_monthly === 0 ? (
                    <div className="text-4xl font-bold text-gray-900">無料</div>
                  ) : (
                    <div>
                      <div className="text-4xl font-bold text-gray-900">
                        ¥{pricing.monthlyEquivalent.toLocaleString()}
                        <span className="text-lg text-gray-600 font-normal">/月</span>
                      </div>
                      {billingCycle === 'yearly' && pricing.savings > 0 && (
                        <div className="text-sm text-green-600 mt-1 font-medium">
                          年間 ¥{pricing.savings.toLocaleString()} お得
                        </div>
                      )}
                      {referralDiscount > 0 && plan.price_monthly > 0 && (
                        <div className="text-sm text-red-500 mt-1">
                          紹介割引: -¥{referralDiscount}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* AI分析機能 */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-blue-500" />
                    AI分析機能
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">モヤモヤ分析</span>
                      <span className="font-medium text-gray-900">
                        {formatLimit(plan.features.analysis_clarity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">強み分析</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.analysis_strengths > 0 ? formatLimit(plan.features.analysis_strengths) : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">キャリアパス分析</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.analysis_career > 0 ? formatLimit(plan.features.analysis_career) : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">価値観分析</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.analysis_values > 0 ? formatLimit(plan.features.analysis_values) : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">人物像分析</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.analysis_persona > 0 ? formatLimit(plan.features.analysis_persona) : '❌'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 保存・履歴機能 */}
                <div className="space-y-3 border-t pt-4">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Save className="w-4 h-4 mr-2 text-green-500" />
                    データ保存・履歴
                  </h4>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">結果保存</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.save_results ? '✅' : '❌'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">履歴期間</span>
                      <span className="font-medium text-gray-900">
                        {plan.features.history_months === 0 ? 'リアルタイムのみ' : 
                         plan.features.history_months === -1 ? '無制限' : 
                         `${plan.features.history_months}ヶ月`}
                      </span>
                    </div>
                    {plan.features.comparison && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-700">比較機能</span>
                        <span className="font-medium text-gray-900">最大3件</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* プレミアム独占機能 */}
                {plan.name === 'premium' && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Crown className="w-4 h-4 mr-2 text-purple-500" />
                      プレミアム限定機能
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700">AIキャリアコーチ</span>
                      </div>
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700">業界特化分析</span>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700">将来予測分析</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700">月次レポート</span>
                      </div>
                      <div className="flex items-center">
                        <PieChart className="w-4 h-4 mr-2 text-purple-500" />
                        <span className="text-gray-700">市場価値分析</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* スタンダード追加価値 */}
                {(plan.name === 'standard' || plan.name === 'premium') && (
                  <div className="space-y-3 border-t pt-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      追加機能
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                        <span className="text-gray-700">週次リマインダー</span>
                      </div>
                      <div className="flex items-center">
                        <BarChart3 className="w-4 h-4 mr-2 text-green-500" />
                        <span className="text-gray-700">トレンド表示</span>
                      </div>
                      <div className="flex items-center">
                        <Target className="w-4 h-4 mr-2 text-red-500" />
                        <span className="text-gray-700">目標達成率</span>
                      </div>
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2 text-indigo-500" />
                        <span className="text-gray-700">PDFエクスポート</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-6">
                  <Button
                    onClick={() => handlePlanSelect(plan.id)}
                    disabled={isLoading || (plan.name === 'free')}
                    className={`w-full h-12 text-base font-semibold ${
                      plan.name === 'free' 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : plan.name === 'standard'
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                        : 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                        処理中...
                      </div>
                    ) : plan.name === 'free' ? (
                      '現在のプラン' 
                    ) : (
                      <>
                        <Lock className="w-5 h-5 mr-2" />
                        {plan.name === 'standard' ? 'スタンダードを始める' : 'プレミアムを始める'}
                      </>
                    )}
                  </Button>
                  
                  {plan.name !== 'free' && (
                    <p className="text-xs text-gray-500 text-center mt-3">
                      いつでもキャンセル可能・自動更新
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 従量課金セクション */}
      <div className="mb-12 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-200">
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center">
            <Coins className="w-6 h-6 mr-2 text-orange-500" />
            追加分析チケット
          </h3>
          <p className="text-gray-600">制限を超えて分析したい時に便利な従量課金システム</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Brain className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h4 className="font-semibold text-gray-900 mb-1">追加分析</h4>
            <div className="text-2xl font-bold text-orange-600 mb-1">¥200</div>
            <p className="text-sm text-gray-600">1回の分析</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Crown className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h4 className="font-semibold text-gray-900 mb-1">人物像分析</h4>
            <div className="text-2xl font-bold text-orange-600 mb-1">¥500</div>
            <p className="text-sm text-gray-600">1回の分析</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-red-500" />
            <h4 className="font-semibold text-gray-900 mb-1">緊急分析</h4>
            <div className="text-2xl font-bold text-orange-600 mb-1">¥300</div>
            <p className="text-sm text-gray-600">24時間以内</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <Button 
            variant="outline" 
            onClick={() => setShowTicketPricing(!showTicketPricing)}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            {showTicketPricing ? '詳細を隠す' : 'チケット詳細を見る'}
          </Button>
        </div>
      </div>

      {/* 機能詳細比較セクション */}
      <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <h3 className="text-2xl font-bold text-white text-center mb-2">機能詳細比較</h3>
          <p className="text-blue-100 text-center">プランごとの機能を詳しく比較できます</p>
        </div>
        
        {/* デスクトップ表示 */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left p-6 font-semibold text-gray-900 w-1/3">機能・分析</th>
                <th className="text-center p-6 font-semibold text-gray-600">フリープラン</th>
                <th className="text-center p-6 font-semibold text-blue-600">スタンダード</th>
                <th className="text-center p-6 font-semibold text-purple-600">プレミアム</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Brain className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">モヤモヤ分析</div>
                      <div className="text-sm text-gray-600">心の奥のモヤモヤを言語化</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">月1回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">月15回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-yellow-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">強み分析</div>
                      <div className="text-sm text-gray-600">客観的な強みの発見と活用法</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">月1回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">月15回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Target className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">キャリアパス分析</div>
                      <div className="text-sm text-gray-600">理想のキャリア設計と具体的ステップ</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">月1回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">月15回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Award className="w-5 h-5 text-purple-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">価値観分析</div>
                      <div className="text-sm text-gray-600">価値観の深掘りと人生の方向性</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">月1回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">月15回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Crown className="w-5 h-5 text-pink-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">人物像分析</div>
                      <div className="text-sm text-gray-600">多角的人物像とセルフブランディング</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">月2回</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <Save className="w-5 h-5 text-blue-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">結果保存</div>
                      <div className="text-sm text-gray-600">分析結果の永続保存</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </td>
                <td className="text-center p-6">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center p-6">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
              <tr className="border-b border-gray-100 hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <History className="w-5 h-5 text-indigo-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">履歴期間</div>
                      <div className="text-sm text-gray-600">過去データの参照期間</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <span className="text-red-600 font-medium">リアルタイムのみ</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-yellow-600 font-medium">3ヶ月</span>
                </td>
                <td className="text-center p-6">
                  <span className="text-green-600 font-medium">無制限</span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50">
                <td className="p-6">
                  <div className="flex items-center">
                    <CreditCard className="w-5 h-5 text-indigo-500 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">PDFエクスポート</div>
                      <div className="text-sm text-gray-600">分析結果のPDF出力</div>
                    </div>
                  </div>
                </td>
                <td className="text-center p-6">
                  <X className="w-5 h-5 text-gray-300 mx-auto" />
                </td>
                <td className="text-center p-6">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
                <td className="text-center p-6">
                  <Check className="w-5 h-5 text-green-500 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* モバイル表示 */}
        <div className="md:hidden p-6 space-y-6">
          {[
            {
              name: 'モヤモヤ分析',
              description: '心の奥のモヤモヤを言語化',
              icon: Brain,
              free: '月1回',
              standard: '月15回',
              premium: '無制限'
            },
            {
              name: '強み分析',
              description: '客観的な強みの発見と活用法',
              icon: Zap,
              free: '月1回',
              standard: '月15回',
              premium: '無制限'
            },
            {
              name: 'キャリアパス分析',
              description: '理想のキャリア設計と具体的ステップ',
              icon: Target,
              free: '月1回',
              standard: '月15回',
              premium: '無制限'
            },
            {
              name: '価値観分析',
              description: '価値観の深掘りと人生の方向性',
              icon: Award,
              free: '月1回',
              standard: '月15回',
              premium: '無制限'
            },
            {
              name: '人物像分析',
              description: '多角的人物像とセルフブランディング',
              icon: Crown,
              free: '❌',
              standard: '月2回',
              premium: '無制限'
            },
            {
              name: '結果保存',
              description: '分析結果の永続保存',
              icon: Save,
              free: '❌',
              standard: '○',
              premium: '○'
            },
            {
              name: '履歴期間',
              description: '過去データの参照期間',
              icon: History,
              free: 'リアルタイムのみ',
              standard: '3ヶ月',
              premium: '無制限'
            },
            {
              name: 'PDFエクスポート',
              description: '分析結果のPDF出力',
              icon: CreditCard,
              free: '❌',
              standard: '○',
              premium: '○'
            }
          ].map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex items-center mb-3">
                  <IconComponent className="w-5 h-5 text-blue-500 mr-3" />
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.name}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">フリー</div>
                    <div className={feature.free === '❌' ? 'text-gray-400' : feature.free.includes('リアルタイム') ? 'text-red-600 font-medium' : 'text-yellow-600 font-medium'}>
                      {feature.free}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-blue-600 mb-1">スタンダード</div>
                    <div className={feature.standard === '❌' ? 'text-gray-400' : feature.standard.includes('ヶ月') ? 'text-yellow-600 font-medium' : 'text-green-600 font-medium'}>
                      {feature.standard}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-purple-600 mb-1">プレミアム</div>
                    <div className="text-green-600 font-medium">{feature.premium}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* よくある質問セクション */}
      <div className="mt-16 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8">
          <h3 className="text-2xl font-bold text-white text-center mb-2">よくある質問</h3>
          <p className="text-purple-100 text-center">Career Compassについてのよくある質問</p>
        </div>
        
        <div className="p-6 space-y-4">
          {[
            {
              question: 'フリープランの制限が厳しくなった理由は？',
              answer: '価値ある体験を提供するため、各分析の品質向上に集中投資しています。月1回でも深い気づきを得られるよう、AI分析の精度を大幅に向上させました。'
            },
            {
              question: 'スタンダードプランで月15回は十分ですか？',
              answer: 'はい、ほとんどのユーザー様には十分です。週に3-4回の分析で継続的な自己理解を深められます。足りない場合は追加チケットもご利用いただけます。'
            },
            {
              question: '年間プランの20%割引について詳しく教えてください',
              answer: 'スタンダード年間プランは14,208円（月換算1,184円）、プレミアム年間プランは28,608円（月換算2,384円）となり、月額払いと比較して大変お得です。'
            },
            {
              question: '追加分析チケットはどのように購入しますか？',
              answer: 'ダッシュボードから簡単に購入できます。通常分析200円、人物像分析500円、即座にご利用いただけます。'
            },
            {
              question: 'プレミアムプランの独占機能について教えてください',
              answer: 'AIキャリアコーチによるチャット相談、業界特化分析、将来予測分析、月次パーソナルレポート、市場価値分析など、キャリアのプロフェッショナル向けの高度な機能をご提供します。'
            },
            {
              question: 'データの保存期間制限について',
              answer: 'フリープランはリアルタイム表示のみ、スタンダードプランは3ヶ月、プレミアムプランは無制限です。重要な分析結果はPDFエクスポートで永続保存をおすすめします。'
            }
          ].map((faq, index) => (
            <details key={index} className="group border border-gray-200 rounded-lg">
              <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                <div className="flex-shrink-0">
                  <div className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </summary>
              <div className="px-4 pb-4">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </details>
          ))}
        </div>
        
        {/* サポート連絡先 */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <h4 className="font-semibold text-gray-900 mb-2">その他のご質問がありますか？</h4>
            <p className="text-gray-600 text-sm mb-4">お気軽にサポートチームまでお問い合わせください</p>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-white hover:bg-gray-50"
              onClick={() => window.open('mailto:support@career-compass.com', '_blank')}
            >
              <Shield className="w-4 h-4 mr-2" />
              サポートに連絡
            </Button>
          </div>
        </div>
      </div>

      {/* 信頼性セクション */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
          <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">安全・安心</h4>
          <p className="text-gray-600 text-sm">
            業界標準の暗号化技術でデータを保護し、プライバシーを最優先に考えています
          </p>
        </div>
        <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
          <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-8 h-8 text-blue-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">高精度AI分析</h4>
          <p className="text-gray-600 text-sm">
            最新のAI技術による精度の高い分析で、あなたのキャリアを深く理解します
          </p>
        </div>
        <div className="text-center p-6 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100">
          <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Award className="w-8 h-8 text-purple-600" />
          </div>
          <h4 className="font-semibold text-gray-900 mb-2">専門サポート</h4>
          <p className="text-gray-600 text-sm">
            キャリアの専門家による丁寧なサポートで、あなたの成長をバックアップします
          </p>
        </div>
      </div>

    </div>
  )
}
