'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  CheckCircle, 
  ArrowRight, 
  Gift,
  Calendar,
  CreditCard,
  Download,
  Sparkles
} from 'lucide-react'

export default function SubscriptionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [sessionData, setSessionData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      fetchSessionData()
    }
  }, [sessionId])

  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/stripe/session/${sessionId}`)
      const data = await response.json()
      setSessionData(data)
    } catch (error) {
      console.error('Error fetching session data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* 成功メッセージ */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm mb-6">
          <CardHeader className="text-center pb-4">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🎉 お申し込み完了！
            </h1>
            <p className="text-lg text-gray-600">
              Career Compassプレミアム機能をお楽しみください
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* プラン情報 */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                ご契約プラン
              </h3>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">スタンダードプラン</p>
                  <p className="text-sm text-gray-600">月額 ¥1,480</p>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Calendar className="w-3 h-3 mr-1" />
                  14日間無料お試し中
                </Badge>
              </div>
            </div>

            {/* 次のステップ */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">次にやること</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">ダッシュボードで現状確認</p>
                    <p className="text-sm text-gray-600">あなたの成長状況を確認しましょう</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">AI分析を実行</p>
                    <p className="text-sm text-gray-600">すべての分析機能が利用可能になりました</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">目標を設定</p>
                    <p className="text-sm text-gray-600">分析結果をもとに具体的な目標を立てましょう</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 重要な情報 */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
                <Gift className="w-4 h-4 mr-2" />
                お試し期間について
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                14日間の無料お試し期間中は、いつでもキャンセル可能です。
                お試し期間終了の24時間前に自動的にメールでお知らせします。
              </p>
              <Button 
                variant="outline" 
                size="sm"
                className="border-yellow-300 text-yellow-800 hover:bg-yellow-100"
              >
                <Calendar className="w-4 h-4 mr-2" />
                解約方法を確認
              </Button>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                <ArrowRight className="w-4 h-4 mr-2" />
                ダッシュボードを見る
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/ai-analysis/clarity')}
                className="flex-1"
              >
                AI分析を始める
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* サポート情報 */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h3 className="font-medium text-gray-900 mb-2">
              ご不明な点がございましたら
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              お気軽にサポートチームまでお問い合わせください
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" size="sm">
                FAQ を見る
              </Button>
              <Button variant="outline" size="sm">
                お問い合わせ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
