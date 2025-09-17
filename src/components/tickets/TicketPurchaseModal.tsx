'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  X, 
  CreditCard, 
  Shield, 
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { TicketCard } from './TicketCard'
import type { TicketProduct } from '@/types/tickets'

interface TicketPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onPurchaseComplete?: () => void
  requiredTicketType?: 'analysis_normal' | 'analysis_persona'
  analysisType?: string
}

export const TicketPurchaseModal: React.FC<TicketPurchaseModalProps> = ({
  isOpen,
  onClose,
  onPurchaseComplete,
  requiredTicketType,
  analysisType
}) => {
  const [products, setProducts] = useState<TicketProduct[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchProducts()
    }
  }, [isOpen])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/tickets/products')
      const data = await response.json()
      
      if (data.success) {
        setProducts(data.data)
        // デフォルト数量を設定
        const defaultQuantities: Record<string, number> = {}
        data.data.forEach((product: TicketProduct) => {
          defaultQuantities[product.type] = 1
        })
        setQuantities(defaultQuantities)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async (product: TicketProduct, quantity: number) => {
    try {
      setPurchaseLoading(product.type)
      
      // PaymentIntent作成
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_type: product.type,
          quantity
        })
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }

      // Stripe決済処理
      const { loadStripe } = await import('@stripe/stripe-js')
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      
      if (!stripe) {
        throw new Error('Stripe初期化に失敗しました')
      }

      const { error } = await stripe.confirmPayment({
        clientSecret: data.data.client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/tickets/purchase/success`
        }
      })

      if (error) {
        throw error
      }

    } catch (error) {
      console.error('Purchase error:', error)
      alert(error instanceof Error ? error.message : '購入に失敗しました')
    } finally {
      setPurchaseLoading(null)
    }
  }

  const handleQuantityChange = (productType: string, quantity: number) => {
    setQuantities(prev => ({
      ...prev,
      [productType]: quantity
    }))
  }

  if (!isOpen) return null

  const analysisTypeNames = {
    clarity: 'モヤモヤ分析',
    strengths: '強み分析',
    career: 'キャリアパス分析',
    values: '価値観分析',
    persona: '人物像分析'
  }

  const filteredProducts = requiredTicketType 
    ? products.filter(p => p.type === requiredTicketType)
    : products

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">分析チケット購入</h2>
              {requiredTicketType && analysisType && (
                <p className="text-sm text-gray-600 mt-1">
                  {analysisTypeNames[analysisType as keyof typeof analysisTypeNames]}を実行するには
                  {requiredTicketType === 'analysis_persona' ? '人物像分析' : '通常分析'}
                  チケットが必要です
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        {requiredTicketType && (
          <div className="mx-6 mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">分析制限に達しています</h4>
                <p className="text-sm text-blue-700 mt-1">
                  月間の分析制限に達したため、追加の分析にはチケットが必要です。
                  チケットを購入して分析を続行してください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredProducts.map((product) => (
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
          )}

          {/* 安全性について */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              安全な決済
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>SSL暗号化通信</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Stripe決済システム</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>クレジットカード情報非保存</span>
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl">
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              チケットの有効期限は購入日から1ヶ月間です
            </p>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              キャンセル
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
