'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AnalysisGuard } from './AnalysisGuard'
import { SaveNotification } from './SaveNotification'

interface AnalysisPageWrapperProps {
  analysisType: string
  title: string
  children: (props: {
    userId: string
    canProceed: boolean
    onAnalysisComplete: (inputData: Record<string, any>, result: Record<string, any>) => void
  }) => React.ReactNode
}

export function AnalysisPageWrapper({ 
  analysisType, 
  title, 
  children 
}: AnalysisPageWrapperProps) {
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [canProceed, setCanProceed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    inputData: Record<string, any>
    result: Record<string, any>
  } | null>(null)
  const [showSaveNotification, setShowSaveNotification] = useState(false)
  
  const router = useRouter()

  useEffect(() => {
    checkAuthAndInit()
  }, [])

  const checkAuthAndInit = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }
      
      setUserId(user.id)
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const handleProceed = () => {
    setCanProceed(true)
  }

  const handleUpgrade = () => {
    router.push('/pricing')
  }

  const handlePurchaseTicket = () => {
    // TODO: チケット購入機能を実装
    alert('チケット購入機能は後日実装予定です')
  }

  const handleAnalysisComplete = (inputData: Record<string, any>, result: Record<string, any>) => {
    setAnalysisResult({ inputData, result })
    setShowSaveNotification(true)
  }

  const handleSaved = (analysis: any) => {
    // 保存完了後の処理
    console.log('Analysis saved:', analysis)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* ページタイトル */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-gray-600">AIがあなたのキャリアを深く分析します</p>
        </div>

        {/* 分析実行権限チェック */}
        {!canProceed && (
          <AnalysisGuard
            userId={userId}
            analysisType={analysisType}
            onProceed={handleProceed}
            onUpgrade={handleUpgrade}
            onPurchaseTicket={handlePurchaseTicket}
          />
        )}

        {/* 保存通知 */}
        {showSaveNotification && analysisResult && (
          <div className="mb-6">
            <SaveNotification
              userId={userId}
              analysisType={analysisType}
              inputData={analysisResult.inputData}
              result={analysisResult.result}
              onSaved={handleSaved}
            />
          </div>
        )}

        {/* 分析コンテンツ */}
        {canProceed && children({
          userId,
          canProceed,
          onAnalysisComplete: handleAnalysisComplete
        })}
      </div>
    </div>
  )
}
