'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AnalysisRepository } from '@/lib/analysis-repository'
import { ANALYSIS_TYPE_NAMES } from '@/types/analysis'
import type { AnalysisResult } from '@/types/analysis'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Brain, 
  Zap, 
  Target, 
  Award, 
  Crown,
  Heart,
  Calendar,
  ArrowLeft,
  Edit,
  Share2,
  Download,
  Copy,
  Check,
  Clock,
  Tag,
  User,
  FileText,
  ChevronRight,
  MoreVertical
} from 'lucide-react'

const ANALYSIS_ICONS = {
  clarity: Brain,
  strengths: Zap,
  career: Target,
  values: Award,
  persona: Crown
} as const

const ANALYSIS_COLORS = {
  clarity: 'from-blue-500 to-blue-600',
  strengths: 'from-yellow-500 to-orange-500', 
  career: 'from-green-500 to-green-600',
  values: 'from-purple-500 to-purple-600',
  persona: 'from-pink-500 to-rose-500'
} as const

export default function AnalysisDetailPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string>()
  
  const router = useRouter()
  const params = useParams()
  const analysisId = params.id as string
  const analysisRepo = new AnalysisRepository()

  useEffect(() => {
    checkAuthAndLoadAnalysis()
  }, [analysisId])

  const checkAuthAndLoadAnalysis = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserId(user.id)
      await loadAnalysis(user.id)
    } catch (error) {
      console.error('Error loading analysis:', error)
      router.push('/analysis-history')
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysis = async (uid: string) => {
    try {
      const data = await analysisRepo.getAnalysisById(analysisId, uid)
      if (!data) {
        router.push('/analysis-history')
        return
      }
      setAnalysis(data)
      setNewTitle(data.title || '')
    } catch (error) {
      console.error('Error loading analysis:', error)
      router.push('/analysis-history')
    }
  }

  const toggleFavorite = async () => {
    if (!userId || !analysis) return
    
    const success = await analysisRepo.toggleFavorite(analysis.id, userId)
    if (success) {
      setAnalysis(prev => prev ? { ...prev, is_favorite: !prev.is_favorite } : null)
    }
  }

  const saveTitle = async () => {
    if (!userId || !analysis || !newTitle.trim()) return
    
    const success = await analysisRepo.updateTitle(analysis.id, userId, newTitle.trim())
    if (success) {
      setAnalysis(prev => prev ? { ...prev, title: newTitle.trim() } : null)
      setEditingTitle(false)
    }
  }

  const copyToClipboard = async () => {
    if (!analysis) return
    
    const text = formatAnalysisForShare(analysis)
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const formatAnalysisForShare = (analysis: AnalysisResult): string => {
    const typeName = ANALYSIS_TYPE_NAMES[analysis.analysis_type]
    const date = new Date(analysis.created_at).toLocaleDateString('ja-JP')
    
    let content = `${typeName} - ${analysis.title}\n`
    content += `実施日: ${date}\n\n`
    
    // result内容を整理して表示
    if (analysis.result.summary) {
      content += `【概要】\n${analysis.result.summary}\n\n`
    }
    
    if (analysis.result.key_points && Array.isArray(analysis.result.key_points)) {
      content += `【ポイント】\n`
      analysis.result.key_points.forEach((point: string, index: number) => {
        content += `${index + 1}. ${point}\n`
      })
      content += '\n'
    }
    
    if (analysis.result.recommendations && Array.isArray(analysis.result.recommendations)) {
      content += `【推奨アクション】\n`
      analysis.result.recommendations.forEach((rec: string, index: number) => {
        content += `${index + 1}. ${rec}\n`
      })
    }
    
    return content
  }

  const renderAnalysisContent = (result: Record<string, any>) => {
    const sections = []
    
    // 概要セクション
    if (result.summary) {
      sections.push(
        <Card key="summary" className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              概要
            </h3>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed">{result.summary}</p>
          </CardContent>
        </Card>
      )
    }
    
    // キーポイントセクション
    if (result.key_points && Array.isArray(result.key_points)) {
      sections.push(
        <Card key="key_points" className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ChevronRight className="w-5 h-5 mr-2 text-green-500" />
              重要なポイント
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.key_points.map((point: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-green-100 text-green-600 rounded-full text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )
    }
    
    // 推奨アクションセクション
    if (result.recommendations && Array.isArray(result.recommendations)) {
      sections.push(
        <Card key="recommendations" className="mb-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-500" />
              推奨アクション
            </h3>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-600 rounded-full text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )
    }
    
    // その他の結果データ（柔軟な表示）
    Object.entries(result).forEach(([key, value]) => {
      if (['summary', 'key_points', 'recommendations'].includes(key)) return
      
      if (typeof value === 'string' && value.length > 0) {
        sections.push(
          <Card key={key} className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {key.replace(/_/g, ' ')}
              </h3>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{value}</p>
            </CardContent>
          </Card>
        )
      } else if (Array.isArray(value) && value.length > 0) {
        sections.push(
          <Card key={key} className="mb-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 capitalize">
                {key.replace(/_/g, ' ')}
              </h3>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {value.map((item: any, index: number) => (
                  <li key={index} className="text-gray-700">
                    • {typeof item === 'string' ? item : JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )
      }
    })
    
    return sections.length > 0 ? sections : (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">分析結果の詳細データが見つかりませんでした。</p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">分析結果が見つかりませんでした</p>
          <Button onClick={() => router.push('/analysis-history')}>
            履歴一覧に戻る
          </Button>
        </div>
      </div>
    )
  }

  const IconComponent = ANALYSIS_ICONS[analysis.analysis_type]
  const colorClass = ANALYSIS_COLORS[analysis.analysis_type]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ヘッダー */}
        <div className="mb-8">
          <Button 
            variant="outline"
            onClick={() => router.push('/analysis-history')}
            className="mb-4 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            履歴一覧に戻る
          </Button>

          <Card className="bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${colorClass} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge className="mb-2 bg-gray-100 text-gray-700">
                      {ANALYSIS_TYPE_NAMES[analysis.analysis_type]}
                    </Badge>
                    
                    {editingTitle ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="text-2xl font-bold text-gray-900 bg-transparent border-b-2 border-blue-500 focus:outline-none"
                          onKeyPress={(e) => e.key === 'Enter' && saveTitle()}
                          autoFocus
                        />
                        <Button size="sm" onClick={saveTitle}>
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <h1 
                        className="text-2xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                        onClick={() => setEditingTitle(true)}
                      >
                        {analysis.title || '無題の分析'}
                        <Edit className="w-4 h-4 ml-2 inline opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h1>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFavorite}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Heart 
                      className={`w-6 h-6 transition-colors ${
                        analysis.is_favorite 
                          ? 'text-red-500 fill-current' 
                          : 'text-gray-400 hover:text-red-500'
                      }`} 
                    />
                  </button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={copyToClipboard}
                    className="bg-white hover:bg-gray-50"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="flex items-center space-x-6 text-sm text-gray-500 mt-4">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  作成日: {new Date(analysis.created_at).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                
                {analysis.updated_at && analysis.updated_at !== analysis.created_at && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    更新日: {new Date(analysis.updated_at).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                )}
              </div>

              {analysis.tags && analysis.tags.length > 0 && (
                <div className="flex items-center mt-3">
                  <Tag className="w-4 h-4 mr-2 text-gray-400" />
                  <div className="flex gap-2">
                    {analysis.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* 分析結果コンテンツ */}
        <div>
          {renderAnalysisContent(analysis.result)}
        </div>

        {/* 入力データ表示（開発・デバッグ用） */}
        {process.env.NODE_ENV === 'development' && analysis.input_data && (
          <Card className="mt-8 border-dashed border-gray-300">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-700">入力データ（開発用）</h3>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-600 bg-gray-50 p-4 rounded overflow-auto">
                {JSON.stringify(analysis.input_data, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
