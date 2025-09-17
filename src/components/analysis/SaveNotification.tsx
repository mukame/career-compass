'use client'

import { useState, useEffect } from 'react'
import { AnalysisRepository } from '@/lib/analysis-repository'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Save, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  History,
  Crown // Upgradeの代わりにCrownを使用
} from 'lucide-react'

interface SaveNotificationProps {
  userId: string
  analysisType: string
  inputData: Record<string, any>
  result: Record<string, any>
  title?: string
  onSaved?: (analysis: any) => void
}

export function SaveNotification({ 
  userId, 
  analysisType, 
  inputData, 
  result, 
  title,
  onSaved 
}: SaveNotificationProps) {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'not_allowed'>('idle')
  const [savedAnalysis, setSavedAnalysis] = useState<any>(null)
  
  const analysisRepo = new AnalysisRepository()

  useEffect(() => {
    // 自動保存を試行
    attemptSave()
  }, [])

  const attemptSave = async () => {
    setSaveStatus('saving')
    
    try {
      const saveResult = await analysisRepo.saveAnalysisResult(
        userId,
        analysisType,
        inputData,
        result,
        title
      )

      if (saveResult.success) {
        setSaveStatus('saved')
        setSavedAnalysis(saveResult.analysis)
        onSaved?.(saveResult.analysis)
      } else if (saveResult.error === 'save_not_allowed') {
        setSaveStatus('not_allowed')
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveStatus('error')
    }
  }

  if (saveStatus === 'idle' || saveStatus === 'saving') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="py-4">
          <div className="flex items-center">
            <Save className="w-5 h-5 text-blue-600 mr-3 animate-pulse" />
            <p className="text-blue-900">分析結果を保存中...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (saveStatus === 'saved') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">分析結果を保存しました</p>
                <p className="text-sm text-green-700">
                  いつでも履歴から確認できます
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => window.open(`/analysis-history/${savedAnalysis?.id}`, '_blank')}
              className="border-green-300 text-green-700 hover:bg-green-100"
            >
              <History className="w-4 h-4 mr-2" />
              詳細を見る
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (saveStatus === 'not_allowed') {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="font-medium text-orange-900">フリープランでは保存できません</p>
                <p className="text-sm text-orange-700">
                  有料プランで分析結果を保存・管理しましょう
                </p>
              </div>
            </div>
            <Button 
              size="sm"
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Crown className="w-4 h-4 mr-2" />
              プラン選択
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (saveStatus === 'error') {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="font-medium text-red-900">保存に失敗しました</p>
                <p className="text-sm text-red-700">
                  もう一度お試しください
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={attemptSave}
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              再試行
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}
