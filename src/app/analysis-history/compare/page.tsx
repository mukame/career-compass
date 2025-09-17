'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AnalysisComparison } from '@/components/analysis/AnalysisComparison'

export default function ComparisonPage() {
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const initialAnalysisId = searchParams.get('analysis')
  const analysisType = searchParams.get('type')

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <AnalysisComparison
          userId={userId}
          initialAnalysisId={initialAnalysisId || undefined}
          analysisType={analysisType || undefined}
        />
      </div>
    </div>
  )
}
