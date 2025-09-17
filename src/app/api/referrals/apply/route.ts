import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ReferralManager } from '@/lib/referrals'

// POST: 紹介コード適用
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { referral_code } = body

    if (!referral_code) {
      return NextResponse.json(
        { error: '紹介コードを入力してください' },
        { status: 400 }
      )
    }

    // 既に紹介コードを使用していないかチェック
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referee_id', user.id)
      .eq('status', 'completed')
      .single()

    if (existingReferral) {
      return NextResponse.json(
        { error: '既に紹介コードを使用しています' },
        { status: 400 }
      )
    }

    const referralManager = new ReferralManager()
    await referralManager.processReferralSuccess(referral_code, user.id)

    return NextResponse.json({
      success: true,
      message: '紹介コードを適用しました！報酬チケットを付与いたします。',
      data: {
        reward: ReferralManager.REFERRAL_REWARDS.referee
      }
    })
  } catch (error) {
    console.error('Error applying referral code:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '紹介コードの適用に失敗しました' },
      { status: 500 }
    )
  }
}
