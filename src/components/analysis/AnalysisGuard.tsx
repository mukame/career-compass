'use client'

import { useState, useEffect } from 'react'
import { AnalysisRepository } from '@/lib/analysis-repository'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { TicketPurchaseModal } from '@/components/tickets/TicketPurchaseModal'
import { 
  AlertTriangle, 
  CreditCard, 
  Crown, 
  Zap,
  Lock,
  Coins,
  CheckCircle,
  XCircle,
  Ticket
} from 'lucide-react'

interface AnalysisGuardProps {
  userId: string
  analysisType: string
  onProceed: () => void
  onUpgrade: () => void
  onPurchaseTicket: () => void
}

export function AnalysisGuard({ 
  userId, 
  analysisType, 
  onProceed, 
  onUpgrade, 
  onPurchaseTicket 
}: AnalysisGuardProps) {
  const [eligibility, setEligibility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [ticketBalance, setTicketBalance] = useState<any[]>([])
  
  const analysisRepo = new AnalysisRepository()

  const analysisNames = {
    clarity: 'モヤモヤ分析',
    strengths: '強み分析',
    career: 'キャリアパス分析',
    values: '価値観分析',
    persona: '人物像分析'
  }

  useEffect(() => {
    Promise.all([checkEligibility(), fetchTicketBalance()])
  }, [userId, analysisType])

  const checkEligibility = async () => {
    try {
      const result = await analysisRepo.checkAnalysisEligibility(userId, analysisType)
      setEligibility(result)
    } catch (error) {
      console.error('Error checking eligibility:', error)
      setEligibility({ canAnalyze: false, reason: 'plan_required' })
    } finally {
      setLoading(false)
    }
  }

  const fetchTicketBalance = async () => {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      
      if (data.success) {
        setTicketBalance(data.data)
      }
    } catch (error) {
      console.error('Error fetching ticket balance:', error)
    }
  }

  const getAvailableTickets = () => {
    const requiredTicketType = analysisType === 'persona' ? 'analysis_persona' : 'analysis_normal'
    const ticketInfo = ticketBalance.find(t => t.ticket_type === requiredTicketType)
    return ticketInfo ? ticketInfo.available : 0
  }

  const handleUseTicket = async () => {
    try {
      const requiredTicketType = analysisType === 'persona' ? 'analysis_persona' : 'analysis_normal'
      
      const response = await fetch('/api/tickets/use', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type: requiredTicketType,
          analysis_type: analysisType
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // チケット使用成功 - 分析を実行
        onProceed()
        // 残高を更新
        fetchTicketBalance()
      } else {
        throw new Error(data.error || 'チケットの使用に失敗しました')
      }
    } catch (error) {
      console.error('Error using ticket:', error)
      alert(error instanceof Error ? error.message : 'チケットの使用に失敗しました')
    }
  }

  const handleTicketPurchase = () => {
    setShowTicketModal(true)
  }

  const handleTicketPurchaseComplete = () => {
    setShowTicketModal(false)
    fetchTicketBalance()
    checkEligibility()
  }

  if (loading) {
    return (
      <Card className="mb-6">
        <CardContent className="py-6 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    )
  }

  if (eligibility?.canAnalyze) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">
                  {analysisNames[analysisType as keyof typeof analysisNames]}の実行が可能です
                </p>
                {eligibility.usageInfo && eligibility.usageInfo.limit !== -1 && (
                  <p className="text-sm text-green-700">
                    今月の使用状況: {eligibility.usageInfo.used}/{eligibility.usageInfo.limit}回
                  </p>
                )}
              </div>
            </div>
            <Button onClick={onProceed} className="bg-green-600 hover:bg-green-700">
              分析を開始
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // 制限に引っかかった場合の表示
  return (
    <>
      <Card className="mb-6 border-orange-200 bg-orange-50">
        <CardHeader>
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-orange-600 mr-3" />
            <h3 className="text-lg font-semibold text-orange-900">分析制限に達しています</h3>
          </div>
        </CardHeader>
        <CardContent>
          {eligibility.reason === 'ticket_required' && (
            <div className="space-y-4">
              <p className="text-orange-800">
                今月の{analysisNames[analysisType as keyof typeof analysisNames]}制限（{eligibility.usageInfo?.limit}回）に達しました。
              </p>

              {/* チケット残高表示 */}
              {getAvailableTickets() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Ticket className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        利用可能チケット: {getAvailableTickets()}枚
                      </span>
                    </div>
                    <Button 
                      onClick={handleUseTicket}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      チケットで実行
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleTicketPurchase}
                  className="bg-orange-600 hover:bg-orange-700 flex items-center"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  追加チケット購入 (¥{eligibility.ticketPrice})
                </Button>
                <Button 
                  variant="outline" 
                  onClick={onUpgrade}
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  プランアップグレード
                </Button>
              </div>
            </div>
          )}

          {eligibility.reason === 'limit_exceeded' && (
            <div className="space-y-4">
              <p className="text-orange-800">
                フリープランの月間制限に達しました。継続してご利用いただくには有料プランへのアップグレードが必要です。
              </p>
              
              <Button 
                onClick={onUpgrade}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <Zap className="w-4 h-4 mr-2" />
                スタンダードプランにアップグレード
              </Button>
            </div>
          )}

          {eligibility.reason === 'plan_required' && (
            <div className="space-y-4">
              <p className="text-orange-800">
                この機能をご利用いただくには、有料プランへの登録が必要です。
              </p>
              
              <Button 
                onClick={onUpgrade}
                className="bg-blue-600 hover:bg-blue-700 flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                プランを選択
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* チケット購入モーダル */}
      <TicketPurchaseModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        requiredTicketType={analysisType === 'persona' ? 'analysis_persona' : 'analysis_normal'}
        analysisType={analysisType}
        onPurchaseComplete={handleTicketPurchaseComplete}
      />
    </>
  )
}
