'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  CheckCircle, 
  Coins,
  ArrowRight,
  Gift,
  Clock
} from 'lucide-react'

export default function PurchaseSuccessPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 購入完了処理
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">購入処理を完了しています...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-8 text-center">
            {/* 成功アイコン */}
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>

            {/* メッセージ */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              購入が完了しました！
            </h1>
            <p className="text-gray-600 mb-8">
              チケットが正常に追加されました。<br />
              さっそく分析を始めましょう！
            </p>

            {/* アクションボタン */}
            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                onClick={() => window.location.href = '/dashboard'}
              >
                <ArrowRight className="w-5 h-5 mr-2" />
                ダッシュボードへ
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => window.location.href = '/tickets'}
              >
                <Coins className="w-5 h-5 mr-2" />
                チケット残高を確認
              </Button>
            </div>

            {/* 注意事項 */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-left">
                  <p className="text-sm font-medium text-yellow-800 mb-1">
                    チケットの有効期限について
                  </p>
                  <p className="text-xs text-yellow-700">
                    購入いただいたチケットは1ヶ月間有効です。期限内にご利用ください。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
