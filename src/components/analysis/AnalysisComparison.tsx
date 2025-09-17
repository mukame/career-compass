'use client'

import { useState, useEffect } from 'react'
import { AnalysisRepository } from '@/lib/analysis-repository'
import { ANALYSIS_TYPE_NAMES, getAnalysisSummary } from '@/types/analysis'
import type { AnalysisResult } from '@/types/analysis'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  BarChart3, 
  Calendar, 
  CheckCircle,
  X,
  Plus,
  Minus,
  ArrowRight,
  TrendingUp,
  Eye,
  Users
} from 'lucide-react'

interface AnalysisComparisonProps {
  userId: string
  initialAnalysisId?: string
  analysisType?: string
}

export function AnalysisComparison({ 
  userId, 
  initialAnalysisId, 
  analysisType 
}: AnalysisComparisonProps) {
  const [availableAnalyses, setAvailableAnalyses] = useState<AnalysisResult[]>([])
  const [selectedAnalyses, setSelectedAnalyses] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showSelection, setShowSelection] = useState(true)
  
  const analysisRepo = new AnalysisRepository()
  const maxComparisons = 3

  useEffect(() => {
    loadAnalyses()
  }, [userId, analysisType])

  useEffect(() => {
    // 初期分析IDが指定されている場合、自動選択
    if (initialAnalysisId && availableAnalyses.length > 0) {
      const initialAnalysis = availableAnalyses.find(a => a.id === initialAnalysisId)
      if (initialAnalysis && !selectedAnalyses.find(s => s.id === initialAnalysisId)) {
        setSelectedAnalyses([initialAnalysis])
      }
    }
  }, [initialAnalysisId, availableAnalyses])

  const loadAnalyses = async () => {
    try {
      let analyses: AnalysisResult[]
      
      if (analysisType) {
        analyses = await analysisRepo.getAnalysesByType(userId, analysisType as any)
      } else {
        analyses = await analysisRepo.getAnalysesByUser(userId, 50)
      }
      
      // 保存された分析のみを対象とする
      const savedAnalyses = analyses.filter(a => a.result && Object.keys(a.result).length > 0)
      setAvailableAnalyses(savedAnalyses)
    } catch (error) {
      console.error('Error loading analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAnalysisSelection = (analysis: AnalysisResult) => {
    const isSelected = selectedAnalyses.find(s => s.id === analysis.id)
    
    if (isSelected) {
      setSelectedAnalyses(prev => prev.filter(s => s.id !== analysis.id))
    } else if (selectedAnalyses.length < maxComparisons) {
      setSelectedAnalyses(prev => [...prev, analysis])
    }
  }

  const startComparison = () => {
    if (selectedAnalyses.length >= 2) {
      setShowSelection(false)
    }
  }

  const resetSelection = () => {
    setSelectedAnalyses([])
    setShowSelection(true)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">分析データを読み込み中...</p>
        </CardContent>
      </Card>
    )
  }

  if (availableAnalyses.length < 2) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">比較機能を利用するには</h3>
          <p className="text-gray-600 mb-4">
            少なくとも2つの保存された分析結果が必要です。<br />
            現在保存されている分析: {availableAnalyses.length}件
          </p>
          <Button 
            onClick={() => window.open('/dashboard', '_blank')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            分析を追加実行
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (showSelection) {
    return (
      <div className="space-y-6">
        {/* 選択ヘッダー */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  分析結果を比較
                </h2>
                <p className="text-gray-600 mt-2">
                  比較したい分析結果を選択してください（最大{maxComparisons}件）
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">選択中</div>
                <div className="text-2xl font-bold text-blue-600">
                  {selectedAnalyses.length}/{maxComparisons}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* 選択済み分析のプレビュー */}
        {selectedAnalyses.length > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <h3 className="text-lg font-semibold text-blue-900">選択済みの分析</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {selectedAnalyses.map((analysis) => (
                  <div 
                    key={analysis.id}
                    className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-2 bg-blue-100 text-blue-700 text-xs">
                          {ANALYSIS_TYPE_NAMES[analysis.analysis_type as keyof typeof ANALYSIS_TYPE_NAMES] || '不明'}
                        </Badge>
                        <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-1">
                          {analysis.title}
                        </h4>
                        <p className="text-xs text-gray-600">
                          {new Date(analysis.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleAnalysisSelection(analysis)}
                        className="ml-2 p-1 text-blue-600 hover:bg-blue-100 rounded-full"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedAnalyses.length >= 2 && (
                <div className="flex justify-center">
                  <Button 
                    onClick={startComparison}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    比較を開始 ({selectedAnalyses.length}件)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 分析リスト */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900">保存済みの分析結果</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {availableAnalyses.map((analysis) => {
                const isSelected = selectedAnalyses.find(s => s.id === analysis.id)
                const canSelect = selectedAnalyses.length < maxComparisons
                
                return (
                  <div 
                    key={analysis.id}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : canSelect 
                        ? 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                    }`}
                    onClick={() => canSelect || isSelected ? toggleAnalysisSelection(analysis) : null}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <Badge className="mr-2 text-xs">
                            {ANALYSIS_TYPE_NAMES[analysis.analysis_type as keyof typeof ANALYSIS_TYPE_NAMES] || '不明'}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(analysis.created_at).toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          {analysis.title || '無題の分析'}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {getAnalysisSummary(analysis.result)}
                        </p>
                      </div>
                      
                      <div className="ml-4 flex items-center">
                        {isSelected ? (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                          </div>
                        ) : canSelect ? (
                          <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-500">
                            <Plus className="w-4 h-4 text-gray-400" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-gray-200 rounded-full flex items-center justify-center">
                            <X className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 比較表示
  return (
    <ComparisonView 
      analyses={selectedAnalyses}
      onReset={resetSelection}
    />
  )
}

interface ComparisonViewProps {
  analyses: AnalysisResult[]
  onReset: () => void
}

function ComparisonView({ analyses, onReset }: ComparisonViewProps) {
  const [comparisonData, setComparisonData] = useState<any>(null)
  
  useEffect(() => {
    generateComparison()
  }, [analyses])

  const generateComparison = () => {
    // 比較データの生成
    const comparison = {
      timeline: analyses.map(a => ({
        id: a.id,
        title: a.title,
        type: a.analysis_type,
        date: new Date(a.created_at),
        summary: getAnalysisSummary(a.result)
      })).sort((a, b) => a.date.getTime() - b.date.getTime()),
      
      insights: generateInsights(analyses),
      progress: calculateProgress(analyses)
    }
    
    setComparisonData(comparison)
  }

  const generateInsights = (analyses: AnalysisResult[]) => {
    const insights = []
    
    if (analyses.length >= 2) {
      const first = analyses[0]
      const last = analyses[analyses.length - 1]
      const timeDiff = new Date(last.created_at).getTime() - new Date(first.created_at).getTime()
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
      
      insights.push({
        type: 'timeline',
        title: '期間の変化',
        content: `${daysDiff}日間での分析結果の変化を比較しています`
      })
    }
    
    // 同じタイプの分析がある場合
    const typeGroups = analyses.reduce((acc, analysis) => {
      if (!acc[analysis.analysis_type]) acc[analysis.analysis_type] = []
      acc[analysis.analysis_type].push(analysis)
      return acc
    }, {} as Record<string, AnalysisResult[]>)
    
    Object.entries(typeGroups).forEach(([type, typeAnalyses]) => {
      if (typeAnalyses.length > 1) {
        insights.push({
          type: 'progress',
          title: `${ANALYSIS_TYPE_NAMES[type as keyof typeof ANALYSIS_TYPE_NAMES] || '不明な分析'}の進展`,
          content: `${typeAnalyses.length}回の分析で見える変化と成長`
        })
      }
    })
    
    return insights
  }

  const calculateProgress = (analyses: AnalysisResult[]) => {
    // 進捗スコアの計算（仮の実装）
    return {
      clarity: Math.min(analyses.length * 20, 100),
      action: Math.min(analyses.length * 15, 100),
      growth: Math.min(analyses.length * 25, 100)
    }
  }

  if (!comparisonData) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">比較データを生成中...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                分析結果の比較
              </h2>
              <p className="text-gray-600 mt-2">
                {analyses.length}件の分析結果を比較しています
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={onReset}
              className="bg-white hover:bg-gray-50"
            >
              選択を変更
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* インサイト */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Eye className="w-5 h-5 mr-2 text-purple-500" />
            比較インサイト
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.insights.map((insight: any, index: number) => (
              <div key={index} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">{insight.title}</h4>
                <p className="text-purple-700 text-sm">{insight.content}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* タイムライン */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            分析のタイムライン
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {comparisonData.timeline.map((item: any, index: number) => (
              <div key={item.id} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <Badge className="mr-2 text-xs">
                      {ANALYSIS_TYPE_NAMES[item.type as keyof typeof ANALYSIS_TYPE_NAMES] || '不明'}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {item.date.toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.summary}</p>
                </div>
                {index < comparisonData.timeline.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 進捗指標 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-green-500" />
            成長指標
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(comparisonData.progress as Record<string, number>).map(([key, value]) => {
              const labels: Record<string, string> = {
                clarity: '自己理解の明確さ',
                action: '行動への意欲',
                growth: '成長の実感'
              }
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      {labels[key] || key}
                    </span>
                    <span className="text-sm font-bold text-green-600">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* 個別分析詳細 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyses.map((analysis, index) => (
          <Card key={analysis.id} className="h-fit">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="text-xs">
                  {ANALYSIS_TYPE_NAMES[analysis.analysis_type as keyof typeof ANALYSIS_TYPE_NAMES] || '不明'}
                </Badge>
                <span className="text-xs text-gray-500">#{index + 1}</span>
              </div>
              <h4 className="font-semibold text-gray-900">{analysis.title}</h4>
              <p className="text-xs text-gray-500">
                {new Date(analysis.created_at).toLocaleDateString('ja-JP')}
              </p>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {getAnalysisSummary(analysis.result)}
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(`/analysis-history/${analysis.id}`, '_blank')}
                className="w-full"
              >
                <Eye className="w-4 h-4 mr-2" />
                詳細を見る
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
