'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { TicketCard } from '@/components/tickets/TicketCard'
import { TicketUsageIndicator } from '@/components/tickets/TicketUsageIndicator'
import { 
  Coins, 
  ShoppingCart, 
  Clock,
  Info,
  CheckCircle,
  ArrowRight,
  Brain,
  Crown,
  Zap
} from 'lucide-react'
import { useProfile } from '@/hooks/useProfile'
import type { TicketProduct, TicketUsage } from '@/types/tickets'

export default function TicketsPage() {
  const { profile } = useProfile()
  const [products, setProducts] = useState<TicketProduct[]>([])
  const [usage, setUsage] = useState<TicketUsage[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([fetchProducts(), fetchUsage()])
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/tickets/products')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        const defaultQuantities: Record<string, number> = {}
        data.data.forEach((product: TicketProduct) => {
          defaultQuantities[product.type] = 1
        })
        setQuantities(defaultQuantities)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      
      if (data.success) {
        setUsage(data.data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  // 【修正】新しいCheckout Session方式に変更
  const handlePurchase = async (product: TicketProduct, quantity: number) => {
    try {
      setPurchaseLoading(product.type)
      
      // 新しいCheckout Session APIを呼び出し
      const response = await fetch('/api/tickets/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type: product.type,
          quantity
        })
      })
      
      const data = await response.json()
      
      if (!data.url) {
        throw new Error(data.error || 'チェックアウトセッションの作成に失敗しました')
      }

      // Stripeチェックアウトページにリダイレクト
      window.location.href = data.url

    } catch (error) {
      console.error('Purchase error:', error)
      alert(error instanceof Error ? error.message : '購入に失敗しました')
      setPurchaseLoading(null) // エラー時のみリセット
    }
    // 成功時はリダイレクトするためリセット不要
  }

  const handleQuantityChange = (productType: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productType]: quantity
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Coins className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            分析チケット購入
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            月間制限を超えて分析を実行したい場合に、追加チケットをご購入いただけます
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 左側: 現在の保有チケット */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    現在の保有チケット
                  </h2>
                  <TicketUsageIndicator usage={usage} />
                </div>

                {/* 利用の流れ */}
                <Card className="bg-gradient-to-br from-gray-50 to-white border-gray-200">
                  <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-blue-600" />
                      チケットの使い方
                    </h3>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">1</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          チケットを購入する
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">2</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          月間制限に達した分析を実行
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-blue-600">3</span>
                        </div>
                        <div className="text-sm text-gray-700">
                          自動的にチケットが消費される
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>チケットの有効期限は1ヶ月間です</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 右側: チケット商品 */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                チケット商品
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {products.map((product) => (
                  <TicketCard
                    key={product.type}
                    product={product}
                    quantity={quantities[product.type] || 1}
                    onQuantityChange={(quantity) => handleQuantityChange(product.type, quantity)}
                    onPurchase={handlePurchase}
                    loading={purchaseLoading === product.type}
                  />
                ))}
              </div>

              {/* よくある質問 */}
              <Card className="mb-8">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">よくある質問</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">チケットはいつ使用されますか？</span>
                      <div className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </summary>
                    <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                      月間の分析制限に達した後、分析を実行した際に自動的に消費されます。制限内の場合はチケットは消費されません。
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">通常分析チケットで人物像分析はできますか？</span>
                      <div className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </summary>
                    <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                      いいえ。人物像分析には専用の「人物像分析チケット」が必要です。通常分析チケットはモヤモヤ・強み・キャリアパス・価値観分析に使用できます。
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">チケットの有効期限はありますか？</span>
                      <div className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </summary>
                    <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                      はい。購入から1ヶ月間が有効期限です。期限切れのチケットは自動的に削除されますので、お早めにご利用ください。
                    </div>
                  </details>

                  <details className="group">
                    <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                      <span className="font-medium text-gray-900">返金は可能ですか？</span>
                      <div className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </summary>
                    <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                      デジタル商品の性質上、購入後の返金は原則として承っておりません。購入前に内容をよくご確認ください。
                    </div>
                  </details>
                </CardContent>
              </Card>

              {/* 分析との比較 */}
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">各分析の特徴</h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Brain className="w-5 h-5 text-blue-600" />
                        <h4 className="font-medium text-gray-900">通常分析</h4>
                        <span className="text-sm text-blue-600 bg-blue-100 px-2 py-0.5 rounded">¥200</span>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• モヤモヤ分析</li>
                        <li>• 強み分析</li>
                        <li>• キャリアパス分析</li>
                        <li>• 価値観分析</li>
                      </ul>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Crown className="w-5 h-5 text-purple-600" />
                        <h4 className="font-medium text-gray-900">人物像分析</h4>
                        <span className="text-sm text-purple-600 bg-purple-100 px-2 py-0.5 rounded">¥500</span>
                      </div>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• 高精度人物像分析</li>
                        <li>• セルフブランディング</li>
                        <li>• 多角的人格分析</li>
                        <li>• キャリア戦略提案</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* プラン提案 */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <Zap className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                もっとお得に分析を楽しみたい方へ
              </h3>
              <p className="text-gray-700 mb-6">
                頻繁に分析をご利用される場合は、有料プランがお得です。
                月15回〜無制限の分析が可能で、追加機能も使い放題！
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
                onClick={() => window.location.href = '/pricing'}
              >
                プラン詳細を見る
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
