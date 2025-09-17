import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ReferralManager } from '@/lib/referrals'
import { SubscriptionManager } from '@/lib/subscription'

// GET: 紹介統計と履歴取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const referralManager = new ReferralManager()
    const [stats, history] = await Promise.all([
      referralManager.getUserReferralStats(user.id),
      referralManager.getReferralHistory(user.id)
    ])

    return NextResponse.json({
      success: true,
      data: {
        stats,
        history
      }
    })
  } catch (error) {
    console.error('Error fetching referral data:', error)
    return NextResponse.json(
      { error: '紹介データの取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: 紹介コード生成
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 有料プラン確認
    const subscriptionManager = new SubscriptionManager()
    const { subscription } = await subscriptionManager.getCurrentSubscription(user.id)
    
    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json(
        { error: '紹介コードの生成には有料プランへの加入が必要です' },
        { status: 403 }
      )
    }

    // 初回分析完了確認
    const { data: analyses, error: analysisError } = await supabase
      .from('ai_analyses')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)

    if (analysisError || !analyses || analyses.length === 0) {
      return NextResponse.json(
        { error: '紹介コードの生成には初回分析の完了が必要です' },
        { status: 403 }
      )
    }

    const referralManager = new ReferralManager()
    const referralCode = await referralManager.createReferralCode(user.id)

    return NextResponse.json({
      success: true,
      data: referralCode
    })
  } catch (error) {
    console.error('Error creating referral code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '紹介コードの生成に失敗しました' },
      { status: 500 }
    )
  }
}
