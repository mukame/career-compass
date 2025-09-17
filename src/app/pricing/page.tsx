'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { PricingPlans } from '@/components/subscription/PricingPlans'

export default function PricingPage() {
  const [userId, setUserId] = useState<string>()
  const router = useRouter()
  
  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PricingPlans 
        currentUserId={userId}
        showTrialInfo={false} // お試し期間の表示を無効化
      />
    </div>
  )
}
