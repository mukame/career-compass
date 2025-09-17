import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-07-30.basil',
})

export const STRIPE_PRICE_IDS = {
  standard_monthly: process.env.STRIPE_STANDARD_MONTHLY_PRICE_ID!,
  standard_yearly: process.env.STRIPE_STANDARD_YEARLY_PRICE_ID!,
  premium_monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!,
  premium_yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!,
} as const

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || ''

// 製品情報の定義
export const PRODUCT_CONFIG = {
  standard: {
    name: 'スタンダードプラン',
    description: 'AIキャリア分析で成長を加速',
    features: [
      '月15回のAI分析',
      '人物像分析 2回/月',
      '分析結果の保存・比較',
      '3ヶ月間の履歴保存',
      'PDF エクスポート'
    ]
  },
  premium: {
    name: 'プレミアムプラン', 
    description: 'プロレベルのキャリア戦略',
    features: [
      '無制限のAI分析',
      '高度な人物像分析',
      '全期間の履歴保存',
      'AI推奨アクション',
      '詳細レポート生成'
    ]
  }
} as const
