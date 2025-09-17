import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { ReferralManager } from '@/lib/referrals'

// POST: 紹介コード検証
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

    const referralManager = new ReferralManager()
    const validation = await referralManager.validateReferralCode(referral_code, user.id)

    // エラーメッセージのマッピング
    const errorMessages = {
      invalid_code: '無効な紹介コードです',
      expired: '紹介コードの有効期限が切れています',
      self_referral: '自分の紹介コードは使用できません',
      already_used: 'この紹介コードは既に使用済みです',
      referrer_not_premium: '紹介者が有料プランに加入していません',
      referrer_no_analysis: '紹介者が初回分析を完了していません',
      system_error: 'システムエラーが発生しました'
    }

    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: errorMessages[validation.reason as keyof typeof errorMessages] || '紹介コードが無効です'
      })
    }

    return NextResponse.json({
      success: true,
      message: '有効な紹介コードです',
      data: {
        rewards: {
          referrer: ReferralManager.REFERRAL_REWARDS.referrer,
          referee: ReferralManager.REFERRAL_REWARDS.referee
        }
      }
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json(
      { error: '紹介コードの検証に失敗しました' },
      { status: 500 }
    )
  }
}
