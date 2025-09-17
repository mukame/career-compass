'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  User, 
  TrendingUp, 
  Clock, 
  Target, 
  Lightbulb,
  RefreshCw,
  Sparkles
} from 'lucide-react'

// 既存のテーブル構造に合わせたインターフェース
interface PersonaAnalysis {
  id: string
  personality_traits: Record<string, any>
  behavioral_patterns: Record<string, any>
  career_insights: Record<string, any>
  recommendations: Record<string, any>
  confidence_score: number  // confidence_levelではない
  analysis_version: string
  created_at: string
}

interface PersonaInsightsProps {
  className?: string
}

// スケルトンコンポーネントを内部で定義
function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-md bg-gray-200 ${className}`} />
  )
}

export default function PersonaInsights({ className }: PersonaInsightsProps) {
  const [analysis, setAnalysis] = useState<PersonaAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPersonaAnalysis = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/persona/analyze', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('分析の取得に失敗しました')
      }

      const data = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : '不明なエラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPersonaAnalysis()
  }, [])

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">AI人物像分析</h3>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold">AI人物像分析</h3>
            </div>
            <Button
              onClick={fetchPersonaAnalysis}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再分析
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={fetchPersonaAnalysis} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              もう一度試す
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">AI人物像分析</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">
              アプリの使用データが蓄積されると、AIがあなたの人物像を分析します
            </p>
            <Button onClick={fetchPersonaAnalysis}>
              <Lightbulb className="h-4 w-4 mr-2" />
              分析を開始
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // データの安全な取得関数
  const getArrayFromData = (data: any, fallback: string[] = []): string[] => {
    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.items)) return data.items
    if (data && typeof data === 'object' && data.list) return data.list
    return fallback
  }

  const getStringFromData = (data: any, fallback: string = '分析結果がありません'): string => {
    if (typeof data === 'string') return data
    if (data && data.summary) return data.summary
    if (data && data.description) return data.description
    return fallback
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold">AI人物像分析</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-purple-100 text-purple-700">
              信頼度 {analysis.confidence_score}%
            </Badge>
            <Button
              onClick={fetchPersonaAnalysis}
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再分析
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 分析サマリー */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg">
          <h4 className="font-medium text-purple-900 mb-2 flex items-center">
            <User className="h-4 w-4 mr-2" />
            人物像サマリー
          </h4>
          <p className="text-sm text-purple-800">
            {getStringFromData(analysis.personality_traits?.summary || analysis.career_insights?.summary)}
          </p>
        </div>

        {/* 性格特性 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <TrendingUp className="h-4 w-4 mr-2 text-blue-600" />
            性格特性
          </h4>
          <div className="flex flex-wrap gap-2">
            {getArrayFromData(analysis.personality_traits?.traits).map((trait, index) => (
              <Badge 
                key={index} 
                className="bg-blue-50 text-blue-700 border border-blue-200"
              >
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        {/* 行動パターン */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Clock className="h-4 w-4 mr-2 text-green-600" />
            行動パターン
          </h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {getArrayFromData(analysis.behavioral_patterns?.patterns).map((pattern, index) => (
              <div 
                key={index}
                className="flex items-start space-x-2 bg-green-50 p-3 rounded-md"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm text-green-800">{pattern}</span>
              </div>
            ))}
          </div>
        </div>

        {/* キャリア洞察 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Target className="h-4 w-4 mr-2 text-orange-600" />
            キャリア洞察
          </h4>
          <div className="space-y-2">
            {getArrayFromData(analysis.career_insights?.insights).map((insight, index) => (
              <div 
                key={index}
                className="text-sm text-gray-700 bg-orange-50 p-3 rounded border-l-4 border-orange-400"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>

        {/* 推奨アクション */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3 flex items-center">
            <Lightbulb className="h-4 w-4 mr-2 text-indigo-600" />
            推奨アクション
          </h4>
          <div className="space-y-2">
            {getArrayFromData(analysis.recommendations?.actions).map((action, index) => (
              <Badge 
                key={index} 
                className="mr-2 mb-2 bg-indigo-50 text-indigo-700 border border-indigo-200"
              >
                {action}
              </Badge>
            ))}
          </div>
        </div>

        {/* 分析バージョンと日時 */}
        <div className="text-xs text-gray-500 text-center pt-4 border-t">
          分析バージョン: {analysis.analysis_version} | 
          最終分析: {new Date(analysis.created_at).toLocaleString('ja-JP')}
        </div>
      </CardContent>
    </Card>
  )
}
