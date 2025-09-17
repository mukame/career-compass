'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Brain, 
  Clock, 
  Coins,
  Crown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import type { TicketProduct } from '@/types/tickets'

interface TicketCardProps {
  product: TicketProduct
  onPurchase?: (product: TicketProduct, quantity: number) => void
  loading?: boolean
  quantity?: number
  onQuantityChange?: (quantity: number) => void
}

export const TicketCard: React.FC<TicketCardProps> = ({
  product,
  onPurchase,
  loading = false,
  quantity = 1,
  onQuantityChange
}) => {
  const handleQuantityChange = (delta: number) => {
    const newQuantity = Math.max(1, Math.min(10, quantity + delta))
    onQuantityChange?.(newQuantity)
  }

  const totalPrice = product.price * quantity

  const iconMap = {
    '🧠': Brain,
    '👤': Crown
  }

  const IconComponent = iconMap[product.icon as keyof typeof iconMap] || Brain

  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 border-gray-100 hover:border-blue-200">
      {product.type === 'analysis_persona' && (
        <div className="absolute top-0 right-0">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 rounded-tl-none rounded-br-none">
            プレミアム
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center shadow-lg ${
          product.type === 'analysis_persona' 
            ? 'bg-gradient-to-r from-purple-500 to-pink-600' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-600'
        }`}>
          <IconComponent className="w-8 h-8 text-white" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-4">{product.description}</p>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            ¥{product.price.toLocaleString()}
            <span className="text-base text-gray-600 font-normal">/回</span>
          </div>
          
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Clock className="w-4 h-4 mr-1" />
            <span>1ヶ月有効</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 機能一覧 */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 text-sm">利用可能な分析</h4>
          <ul className="space-y-1 text-sm">
            {product.features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-700">
                <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 数量選択 */}
        {onQuantityChange && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 text-sm">購入枚数</h4>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
              <button
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || loading}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                -
              </button>
              
              <div className="text-center">
                <div className="text-lg font-semibold text-gray-900">{quantity}枚</div>
                <div className="text-xs text-gray-500">最大10枚まで</div>
              </div>
              
              <button
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 10 || loading}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                +
              </button>
            </div>
          </div>
        )}

        {/* 合計金額 */}
        {quantity > 1 && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">合計金額</span>
              <span className="text-xl font-bold text-blue-900">
                ¥{totalPrice.toLocaleString()}
              </span>
            </div>
            {quantity >= 5 && (
              <div className="flex items-center mt-1">
                <Coins className="w-4 h-4 mr-1 text-yellow-600" />
                <span className="text-xs text-yellow-700">
                  まとめ買いでお得！
                </span>
              </div>
            )}
          </div>
        )}

        {/* 購入ボタン */}
        {onPurchase && (
          <button
            onClick={() => onPurchase(product, quantity)}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all duration-200 ${
              product.type === 'analysis_persona'
                ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                処理中...
              </div>
            ) : (
              `¥${totalPrice.toLocaleString()}で購入する`
            )}
          </button>
        )}
      </CardContent>
    </Card>
  )
}
