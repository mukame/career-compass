'use client'

import React from 'react'
import { AlertCircle, CreditCard, Zap, Clock, HelpCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

// エラーレスポンスの型定義
interface ErrorAction {
  type: 'upgrade' | 'purchase' | 'wait' | 'contact'
  label: string
  url?: string
  description?: string
  primary?: boolean
}

interface ErrorDetails {
  analysisType?: string
  currentUsage?: number
  limit?: number
  ticketPrice?: number
  resetDate?: string
  resetTime?: string
  usageInfo?: any
}

interface AnalysisError {
  error: string
  code?: string
  title?: string
  message: string
  details?: ErrorDetails
  actions?: ErrorAction[]
  // 既存のレスポンス形式との互換性
  ticket_price?: number
  usage_info?: any
  requires_ticket?: boolean
}

interface AnalysisErrorDialogProps {
  isOpen: boolean
  onClose: () => void
  error: AnalysisError | null
}

export function AnalysisErrorDialog({ isOpen, onClose, error }: AnalysisErrorDialogProps) {
  if (!isOpen || !error) return null

  // 既存のレスポンス形式を新形式に変換
  const normalizedError = normalizeErrorResponse(error)

  const getIcon = () => {
    switch (normalizedError.code) {
      case 'SUBSCRIPTION_LIMIT':
        return <Zap className="w-12 h-12 text-amber-500" />
      case 'TICKET_REQUIRED':
        return <CreditCard className="w-12 h-12 text-blue-500" />
      case 'DAILY_LIMIT':
        return <Clock className="w-12 h-12 text-orange-500" />
      default:
        return <AlertCircle className="w-12 h-12 text-red-500" />
    }
  }

  const getBadge = () => {
    switch (normalizedError.code) {
      case 'SUBSCRIPTION_LIMIT':
        return <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-300">月間上限</Badge>
      case 'TICKET_REQUIRED':
        return <Badge variant="info" className="border-blue-500 text-blue-700 bg-blue-50">チケット必要</Badge>
      case 'DAILY_LIMIT':
        return <Badge variant="warning" className="bg-orange-100 text-orange-800 border-orange-300">日次上限</Badge>
      case 'OPENAI_ERROR':
        return <Badge variant="error">システムエラー</Badge>
      default:
        return <Badge variant="error">エラー</Badge>
    }
  }

  const handleActionClick = (action: ErrorAction) => {
    if (action.url) {
      if (action.url.startsWith('/')) {
        // 内部リンクの場合
        window.location.href = action.url
      } else {
        // 外部リンクの場合
        window.open(action.url, '_blank')
      }
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative animate-in fade-in-0 zoom-in-95 duration-300 shadow-2xl">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {getBadge()}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-1 h-8 w-8 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* アイコンとメッセージ */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {normalizedError.title || '分析を実行できませんでした'}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {normalizedError.message}
          </p>
        </div>

        {/* 詳細情報 */}
        {normalizedError.details && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border">
            <h4 className="font-medium text-gray-900 mb-3">詳細情報</h4>
            <div className="space-y-2 text-sm">
              {normalizedError.details.analysisType && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">分析タイプ:</span>
                  <span className="font-medium">{normalizedError.details.analysisType}</span>
                </div>
              )}
              
              {normalizedError.details.limit !== undefined && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">使用状況:</span>
                  <span className="font-medium">
                    {normalizedError.details.currentUsage || 0} / {normalizedError.details.limit} 回
                  </span>
                </div>
              )}

              {normalizedError.details.ticketPrice && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">チケット価格:</span>
                  <span className="font-medium">{normalizedError.details.ticketPrice}円</span>
                </div>
              )}

              {normalizedError.details.resetDate && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">リセット日:</span>
                  <span className="font-medium">{normalizedError.details.resetDate}</span>
                </div>
              )}

              {normalizedError.details.resetTime && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">次回利用可能:</span>
                  <span className="font-medium">{normalizedError.details.resetTime}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {normalizedError.actions && normalizedError.actions.length > 0 ? (
          <div className="space-y-3">
            {normalizedError.actions.map((action, index) => (
              <div key={index}>
                <Button
                  onClick={() => handleActionClick(action)}
                  variant={action.primary ? "primary" : "outline"}
                  className="w-full"
                  size="lg"
                >
                  {action.type === 'upgrade' && <Zap className="w-4 h-4 mr-2" />}
                  {action.type === 'purchase' && <CreditCard className="w-4 h-4 mr-2" />}
                  {action.type === 'wait' && <Clock className="w-4 h-4 mr-2" />}
                  {action.type === 'contact' && <HelpCircle className="w-4 h-4 mr-2" />}
                  {action.label}
                </Button>
                {action.description && (
                  <p className="text-sm text-gray-500 mt-1 text-center">
                    {action.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          // デフォルトアクションボタン
          <div className="space-y-3">
            {normalizedError.code === 'TICKET_REQUIRED' && (
              <Button 
                onClick={() => handleActionClick({ type: 'purchase', label: 'チケットを購入', url: '/tickets' })}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                チケットを購入
              </Button>
            )}
            <Button 
              onClick={() => handleActionClick({ type: 'upgrade', label: 'プランをアップグレード', url: '/pricing' })}
              variant="outline"
              className="w-full"
              size="lg"
            >
              <Zap className="w-4 h-4 mr-2" />
              プランをアップグレード
            </Button>
          </div>
        )}

        {/* 閉じるボタン */}
        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="w-full mt-4 text-gray-500 hover:text-gray-700"
        >
          閉じる
        </Button>
      </div>
    </div>
  )
}

// 既存のエラーレスポンスを新形式に変換する関数
function normalizeErrorResponse(error: AnalysisError): AnalysisError & { code: string; title: string } {
  // 既存の形式の場合
  if (error.error === 'analysis_limit_exceeded' && error.requires_ticket) {
    return {
      ...error,
      code: 'TICKET_REQUIRED',
      title: 'チケットが必要です',
      message: error.message || 'この分析にはチケットが必要です。',
      details: {
        ticketPrice: error.ticket_price,
        usageInfo: error.usage_info,
        ...error.details
      },
      actions: [
        {
          type: 'purchase',
          label: 'チケットを購入',
          url: '/tickets',
          primary: true
        },
        {
          type: 'upgrade',
          label: 'プランをアップグレード',
          url: '/pricing'
        }
      ]
    }
  }

  // OpenAI API関連エラー
  if (error.error?.includes('openai_')) {
    return {
      ...error,
      code: 'OPENAI_ERROR',
      title: 'システムエラー',
      message: error.message || 'システム内部エラーが発生しました。',
      actions: [
        {
          type: 'contact',
          label: 'サポートに問い合わせ',
          url: '/contact',
          primary: true
        }
      ]
    }
  }

  // その他のエラー
  return {
    ...error,
    code: error.code || 'UNKNOWN_ERROR',
    title: error.title || 'エラーが発生しました',
    message: error.message || '予期しないエラーが発生しました。',
    actions: error.actions || [
      {
        type: 'contact',
        label: 'サポートに問い合わせ',
        url: '/contact',
        primary: true
      }
    ]
  }
}
