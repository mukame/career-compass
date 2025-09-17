'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Lock, 
  Zap, 
  Crown,
  ArrowRight,
  Gift
} from 'lucide-react'
import { SubscriptionManager, type UsageLimits } from '@/lib/subscription'

interface UsageGateProps {
  userId: string
  analysisType: string
  onUpgrade?: () => void
  onPurchaseTicket?: (ticketType: string) => void
  children: React.ReactNode
}

export function UsageGate({ 
  userId, 
  analysisType, 
  onUpgrade, 
  onPurchaseTicket,
  children 
}: UsageGateProps) {
  const [usageInfo, setUsageInfo] = useState<{
    canUse: boolean
    used: number
    limit: number
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const subscriptionManager = new SubscriptionManager()

  useEffect(() => {
    checkUsage()
  }, [userId, analysisType])

  const checkUsage = async () => {
    try {
      const usage = await subscriptionManager.checkUsageLimit(userId, analysisType)
      setUsageInfo(usage)
    } catch (error) {
      console.error('Error checking usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAnalysisTypeName = (type: string) => {
    const names = {
      'analysis_clarity': 'モヤモヤ分析',
      'analysis_strengths': '強み分析', 
      'analysis_career': 'キャリアパス分析',
      'analysis_values': '価値観分析',
      'analysis_persona': '人物像分析'
    }
    return names[type as keyof typeof names] || type
  }

  const getTicketPrice = (type: string) => {
    return type === 'analysis_persona' ? 500 : 200
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!usageInfo) {
    return <div className="text-center py-8 text-red-600">使用量の確認に失敗しました</div>
  }

  // 使用可能な場合は子コンポーネントを表示
  if (usageInfo.canUse) {
    return <>{children}</>
  }

  // 制限に達している場合はアップグレード促進画面
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {getAnalysisTypeName(analysisType)}の制限に達しました
          </h2>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-orange-700">今月の利用状況</span>
              <span className="font-medium text-orange-900">
                {usageInfo.used} / {usageInfo.limit === -1 ? '無制限' : usageInfo.limit}
              </span>
            </div>
            <Progress 
              value={(usageInfo.used / (usageInfo.limit === -1 ? usageInfo.used : usageInfo.limit)) * 100} 
              className="h-2"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center mb-6">
            続けて利用するには、プランをアップグレードするか追加チケットを購入してください。
          </p>

          {/* アップグレードオプション */}
          <div className="space-y-3">
            <Button
              onClick={() => onUpgrade?.()}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Zap className="w-4 h-4 mr-2" />
              スタンダードプランにアップグレード
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <Button
              onClick={() => onUpgrade?.()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              プレミアムプランにアップグレード
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          {/* 従量課金オプション */}
          <Card className="border border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Gift className="w-4 h-4 mr-2 text-orange-600" />
                追加チケットを購入
              </h3>
              <p className="text-sm text-gray-600 mb-3">
                1回分の{getAnalysisTypeName(analysisType)}をすぐに利用可能
              </p>
              <Button
                onClick={() => onPurchaseTicket?.(analysisType)}
                variant="outline"
                className="w-full border-orange-300 hover:bg-orange-100"
              >
                ¥{getTicketPrice(analysisType)} で1回分購入
              </Button>
            </CardContent>
          </Card>

          {/* キャンセル */}
          <Button
            variant="outline" 
            className="w-full"
            onClick={() => window.history.back()}
          >
            戻る
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
