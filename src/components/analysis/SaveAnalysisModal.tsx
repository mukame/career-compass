'use client'

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { Badge } from '@/components/ui/Badge'

interface SaveAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  analysisType: string
}

export const SaveAnalysisModal: React.FC<SaveAnalysisModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  analysisType
}) => {
  if (!isOpen) return null

  const getAnalysisIcon = () => {
    switch (analysisType) {
      case 'confusion': return '🤔'
      case 'strength': return '💪'
      case 'career_path': return '🗺️'
      case 'values': return '💖'
      default: return '🧠'
    }
  }

  const getAnalysisTitle = () => {
    switch (analysisType) {
      case 'confusion': return 'モヤモヤ分析'
      case 'strength': return '強み分析'
      case 'career_path': return 'キャリアパス分析'
      case 'values': return '価値観分析'
      default: return 'AI分析'
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full">
        <AnimatedSection animation="scaleIn">
          <GlassCard className="p-8">
            {/* ヘッダー */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                {getAnalysisIcon()}
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                {getAnalysisTitle()}結果を保存しますか？
              </h2>
              <p className="text-blue-100">
                分析結果の保存はプレミアムプラン限定機能です
              </p>
            </div>

            {/* 保存のメリット */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">保存すると得られるメリット</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">いつでも振り返り可能</h4>
                    <p className="text-blue-200 text-sm">過去の分析結果をいつでも確認できます</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">成長の記録</h4>
                    <p className="text-blue-200 text-sm">時系列で自分の変化を追跡できます</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 bg-white/5 rounded-xl p-4">
                  <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">レポート出力</h4>
                    <p className="text-blue-200 text-sm">履歴書や面接での自己PR材料として活用</p>
                  </div>
                </div>
              </div>
            </div>

            {/* プレミアム特典 */}
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-6 border border-yellow-400/30 mb-8">
              <h3 className="text-lg font-bold text-white mb-4 text-center">🎁 プレミアムプラン特典</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-100">無制限AI分析</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-100">全結果を保存</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-100">履歴書エクスポート</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span className="text-yellow-100">優先サポート</span>
                </div>
              </div>
              <div className="text-center mt-4">
                <Badge variant="warning" size="md">今なら初月50%OFF - ¥490/月</Badge>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                今回はスキップ
              </button>
              <button
                onClick={onUpgrade}
                className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-2xl hover:from-yellow-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-yellow-300/50 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                プレミアムにアップグレード
              </button>
            </div>

            {/* 安心情報 */}
            <div className="text-center mt-6">
              <p className="text-blue-200 text-sm">
                💳 安全なStripe決済 | 🔄 いつでもキャンセル可能 | 💰 30日間返金保証
              </p>
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    </div>
  )
}
