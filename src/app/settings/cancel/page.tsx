'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SubscriptionManager } from '@/lib/subscription'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft,
  AlertTriangle,
  Heart,
  TrendingDown,
  DollarSign,
  Clock,
  Users,
  MessageSquare,
  Gift,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Calendar
} from 'lucide-react'

interface CancelReason {
  id: string
  label: string
  icon: any
  description: string
}

interface RetentionOffer {
  id: string
  type: 'discount' | 'pause' | 'downgrade'
  title: string
  description: string
  value: string
  cta: string
  highlight: boolean
}

const cancelReasons: CancelReason[] = [
  {
    id: 'too_expensive',
    label: '料金が高すぎる',
    icon: DollarSign,
    description: '現在の料金プランが予算に合わない'
  },
  {
    id: 'not_using',
    label: 'あまり使っていない',
    icon: Clock,
    description: 'サービスを十分に活用できていない'
  },
  {
    id: 'missing_features',
    label: '必要な機能がない',
    icon: TrendingDown,
    description: '期待していた機能が不足している'
  },
  {
    id: 'found_alternative',
    label: '他のサービスに移行',
    icon: Users,
    description: 'より適したサービスを見つけた'
  },
  {
    id: 'technical_issues',
    label: '技術的な問題',
    icon: AlertTriangle,
    description: 'バグや不具合が多い'
  },
  {
    id: 'other',
    label: 'その他',
    icon: MessageSquare,
    description: 'その他の理由'
  }
]

const retentionOffers: RetentionOffer[] = [
  {
    id: 'discount_50',
    type: 'discount',
    title: '50%割引で継続',
    description: '次回更新時に50%割引を適用します',
    value: '3ヶ月間',
    cta: '割引を適用',
    highlight: true
  },
  {
    id: 'pause_subscription',
    type: 'pause',
    title: 'サブスクを一時停止',
    description: '最大3ヶ月間サブスクリプションを停止できます',
    value: '1-3ヶ月',
    cta: '一時停止する',
    highlight: false
  },
  {
    id: 'downgrade_free',
    type: 'downgrade',
    title: 'フリープランに変更',
    description: '基本機能は引き続きご利用いただけます',
    value: '無料',
    cta: 'フリープランへ',
    highlight: false
  }
]

export default function CancelSubscriptionPage() {
  const [step, setStep] = useState<'reason' | 'retention' | 'confirmation' | 'processing' | 'completed'>('reason')
  const [selectedReason, setSelectedReason] = useState<string>('')
  const [customReason, setCustomReason] = useState<string>('')
  const [selectedOffer, setSelectedOffer] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [finalConfirmation, setFinalConfirmation] = useState<string>('')
  
  const router = useRouter()
  const supabase = createClient()
  const subscriptionManager = new SubscriptionManager()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) setUserProfile(profile)

      const { subscription, plan } = await subscriptionManager.getCurrentSubscription(user.id)
      setSubscription({ ...subscription, plan })

    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const handleReasonNext = () => {
    if (!selectedReason) return
    
    // 料金が理由の場合は必ず割引オファーを表示
    if (selectedReason === 'too_expensive') {
      setStep('retention')
    } else {
      // その他の理由でも引き止めオファーを表示
      setStep('retention')
    }
  }

  const handleOfferAction = async (offerId: string) => {
    setLoading(true)
    
    try {
      const offer = retentionOffers.find(o => o.id === offerId)
      if (!offer) return

      if (offer.type === 'discount') {
        // 割引適用API呼び出し
        await applyDiscount(offerId)
        router.push('/settings?success=discount_applied')
      } else if (offer.type === 'pause') {
        // 一時停止API呼び出し
        await pauseSubscription()
        router.push('/settings?success=subscription_paused')
      } else if (offer.type === 'downgrade') {
        // フリープランへのダウングレード
        await downgradeToFree()
        router.push('/settings?success=downgraded_to_free')
      }
    } catch (error) {
      console.error('Error applying offer:', error)
      alert('処理中にエラーが発生しました。もう一度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToCancel = () => {
    setStep('confirmation')
  }

  const handleFinalCancel = async () => {
    if (finalConfirmation !== '解約') {
      alert('「解約」と入力してください')
      return
    }

    setStep('processing')
    
    try {
      // 解約理由をデータベースに保存
      await saveCancelReason()
      
      // サブスクリプション解約
      await cancelSubscription()
      
      // 解約完了メール送信
      await sendCancelConfirmationEmail()
      
      setStep('completed')
    } catch (error) {
      console.error('Error canceling subscription:', error)
      alert('解約処理中にエラーが発生しました。サポートまでお問い合わせください。')
      setStep('confirmation')
    }
  }

  const saveCancelReason = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const reasonText = selectedReason === 'other' ? customReason : 
        cancelReasons.find(r => r.id === selectedReason)?.label || ''

      await supabase
        .from('subscription_cancellations')
        .insert({
          user_id: user.id,
          reason_code: selectedReason,
          reason_text: reasonText,
          subscription_id: subscription?.id,
          canceled_at: new Date().toISOString()
        })
    } catch (error) {
      console.error('Error saving cancel reason:', error)
    }
  }

  const cancelSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: subscription?.id,
          reason: selectedReason,
          customReason: customReason
        })
      })

      if (!response.ok) {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      throw error
    }
  }

  const applyDiscount = async (offerId: string) => {
    const response = await fetch('/api/subscription/discount', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerId, subscriptionId: subscription?.id })
    })

    if (!response.ok) {
      throw new Error('Failed to apply discount')
    }
  }

  const pauseSubscription = async () => {
    const response = await fetch('/api/subscription/pause', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: subscription?.id })
    })

    if (!response.ok) {
      throw new Error('Failed to pause subscription')
    }
  }

  const downgradeToFree = async () => {
    const response = await fetch('/api/subscription/downgrade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: subscription?.id })
    })

    if (!response.ok) {
      throw new Error('Failed to downgrade subscription')
    }
  }

  const sendCancelConfirmationEmail = async () => {
    try {
      await fetch('/api/subscription/cancel-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userProfile?.id })
      })
    } catch (error) {
      console.error('Error sending confirmation email:', error)
    }
  }

  const getStepProgress = () => {
    switch (step) {
      case 'reason': return 25
      case 'retention': return 50
      case 'confirmation': return 75
      case 'processing': return 90
      case 'completed': return 100
      default: return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            設定に戻る
          </Button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              サブスクリプション解約
            </h1>
            <p className="text-gray-600">
              解約前に、より良い選択肢をご提案させてください
            </p>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>進捗状況</span>
            <span>{getStepProgress()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${getStepProgress()}%` }}
            />
          </div>
        </div>

        {/* Step 1: 理由選択 */}
        {step === 'reason' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  解約理由をお聞かせください
                </h2>
                <p className="text-gray-600">
                  サービス改善のため、解約理由を教えてください
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {cancelReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReason(reason.id)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedReason === reason.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${
                      selectedReason === reason.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      <reason.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{reason.label}</h3>
                      <p className="text-sm text-gray-600 mt-1">{reason.description}</p>
                    </div>
                  </div>
                </button>
              ))}

              {selectedReason === 'other' && (
                <div className="mt-4">
                  <textarea
                    placeholder="具体的な理由をお聞かせください..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                </div>
              )}

              <Button
                onClick={handleReasonNext}
                disabled={!selectedReason || (selectedReason === 'other' && !customReason.trim())}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                次へ進む
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: 引き止めオファー */}
        {step === 'retention' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4">
                  <Gift className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  特別なご提案があります
                </h2>
                <p className="text-gray-600">
                  解約前に、こちらの選択肢もご検討ください
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {retentionOffers.map((offer) => (
                <div
                  key={offer.id}
                  className={`p-4 rounded-lg border-2 ${
                    offer.highlight
                      ? 'border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center">
                        {offer.title}
                        {offer.highlight && (
                          <Badge className="ml-2 bg-yellow-500 text-white">
                            おすすめ
                          </Badge>
                        )}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">{offer.description}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-gray-900">{offer.value}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleOfferAction(offer.id)}
                    disabled={loading}
                    className={`w-full ${
                      offer.highlight
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700'
                    }`}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    {offer.cta}
                  </Button>
                </div>
              ))}

              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleProceedToCancel}
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  それでも解約手続きを続ける
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: 最終確認 */}
        {step === 'confirmation' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  本当に解約しますか？
                </h2>
                <p className="text-gray-600">
                  解約すると以下の影響があります
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 解約の影響 */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-bold text-red-900 mb-3">解約後の変更点</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2 text-sm text-red-800">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>プレミアム機能の利用不可</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm text-red-800">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>分析結果の保存不可</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm text-red-800">
                    <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>比較機能の利用不可</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm text-red-800">
                    <Calendar className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span>保存データは3ヶ月後に削除されます</span>
                  </li>
                </ul>
              </div>

              {/* 継続利用可能な機能 */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-3">フリープランで継続利用可能</h3>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2 text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>基本的なAI分析機能</span>
                  </li>
                  <li className="flex items-start space-x-2 text-sm text-green-800">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>目標設定（3個まで）</span>
                  </li>
                </ul>
              </div>

              {/* 再開案内 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-bold text-blue-900 mb-2">いつでも再開可能</h3>
                <p className="text-sm text-blue-800">
                  アカウントは残るため、いつでもプレミアムプランに再登録できます。
                  データも3ヶ月間は保持されます。
                </p>
              </div>

              {/* 最終確認入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  解約を確定するには「解約」と入力してください
                </label>
                <input
                  type="text"
                  value={finalConfirmation}
                  onChange={(e) => setFinalConfirmation(e.target.value)}
                  placeholder="解約"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('retention')}
                  className="flex-1"
                >
                  戻る
                </Button>
                <Button
                  onClick={handleFinalCancel}
                  disabled={finalConfirmation !== '解約'}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                >
                  解約を実行
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: 処理中 */}
        {step === 'processing' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  解約処理中...
                </h2>
                <p className="text-gray-600">
                  しばらくお待ちください
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: 完了 */}
        {step === 'completed' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  解約が完了しました
                </h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  サブスクリプションの解約が正常に処理されました。
                  確認メールをお送りしましたのでご確認ください。
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-left">
                      <h3 className="font-medium text-blue-900">ご利用ありがとうございました</h3>
                      <p className="text-sm text-blue-800 mt-1">
                        Career Compassは今後もサービス改善に努めてまいります。
                        またのご利用をお待ちしております。
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                  <Button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    ダッシュボードに戻る
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/contact')}
                  >
                    フィードバックを送る
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
