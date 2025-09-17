'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Copy, 
  Share2, 
  Gift, 
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Coins
} from 'lucide-react'
import type { ReferralCode } from '@/types/referrals'

interface ReferralCodeGeneratorProps {
  onCodeGenerated?: (code: ReferralCode) => void
}

export const ReferralCodeGenerator: React.FC<ReferralCodeGeneratorProps> = ({
  onCodeGenerated
}) => {
  const [code, setCode] = useState<ReferralCode | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState<string>('')

  useEffect(() => {
    if (code) {
      const timer = setInterval(() => {
        const now = new Date()
        const expiry = new Date(code.expires_at)
        const diff = expiry.getTime() - now.getTime()
        
        if (diff <= 0) {
          setTimeLeft('期限切れ')
        } else {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
          
          if (days > 0) {
            setTimeLeft(`${days}日${hours}時間`)
          } else if (hours > 0) {
            setTimeLeft(`${hours}時間${minutes}分`)
          } else {
            setTimeLeft(`${minutes}分`)
          }
        }
      }, 1000)
      
      return () => clearInterval(timer)
    }
  }, [code])

  const generateCode = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/referrals', {
        method: 'POST'
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }
      
      setCode(data.data)
      onCodeGenerated?.(data.data)
    } catch (error) {
      console.error('Error generating code:', error)
      alert(error instanceof Error ? error.message : '紹介コードの生成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async () => {
    if (!code) return
    
    try {
      await navigator.clipboard.writeText(code.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      // フォールバック
      const textArea = document.createElement('textarea')
      textArea.value = code.code
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const shareCode = async () => {
    if (!code) return
    
    const shareData = {
      title: 'Career Compass 紹介コード',
      text: `Career Compassの紹介コードをお送りします！新規登録時にこのコードを入力すると、お得な特典がもらえます: ${code.code}`,
      url: `${window.location.origin}?ref=${code.code}`
    }
    
    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Share cancelled')
      }
    } else {
      // フォールバック: クリップボードにコピー
      await copyToClipboard()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Gift className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">友達紹介コード</h3>
              <p className="text-sm text-gray-600">友達を招待してお得な特典をゲット</p>
            </div>
          </div>
          {code && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              有効
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 報酬情報 */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">あなたの報酬</span>
            </div>
            <div className="text-lg font-bold text-blue-600">通常分析チケット3枚</div>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex items-center space-x-2 mb-1">
              <Coins className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">友達の報酬</span>
            </div>
            <div className="text-lg font-bold text-green-600">通常分析チケット5枚</div>
          </div>
        </div>

        {code ? (
          <div className="space-y-3">
            {/* 生成されたコード */}
            <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">紹介コード</p>
                <div className="text-2xl font-mono font-bold text-gray-900 mb-3 tracking-wider">
                  {code.code}
                </div>
                <div className="flex justify-center space-x-2">
                  <Button
                    onClick={copyToClipboard}
                    size="sm"
                    variant="outline"
                    className="flex items-center space-x-1"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>コピー済み</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>コピー</span>
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={shareCode}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>シェア</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* 有効期限 */}
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">有効期限</span>
              </div>
              <span className="text-sm font-bold text-yellow-900">
                残り{timeLeft}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div className="p-6">
              <Gift className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-600 mb-4">
                紹介コードを生成して友達を招待しましょう
              </p>
              <div className="text-sm text-gray-500 space-y-1">
                <p>• コードの有効期限は1週間です</p>
                <p>• 友達が新規登録すると両方に特典付与</p>
                <p>• 有料プラン加入と初回分析完了が必要です</p>
              </div>
            </div>
            
            <Button
              onClick={generateCode}
              loading={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
            >
              紹介コードを生成する
            </Button>
          </div>
        )}

        {/* 注意事項 */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">紹介の条件</p>
              <ul className="space-y-0.5 list-disc list-inside">
                <li>紹介者は有料プラン加入済みであること</li>
                <li>紹介者は初回分析を完了していること</li>
                <li>被紹介者は新規登録のユーザーであること</li>
                <li>紹介コードは1週間以内に使用すること</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
