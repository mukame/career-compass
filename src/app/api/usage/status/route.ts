import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // リクエストヘッダーから認証情報を取得
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'Authorization header required' },
        { status: 401 }
      )
    }

    const token = authHeader.split('Bearer ')[1]
    
    // トークンを使用してユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // 【修正】usage_limitsテーブルから直接データを取得
    const { data: usageData, error: usageError } = await supabase
      .from('usage_limits')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (usageError) {
      console.error('Error fetching usage limits:', usageError)
      return NextResponse.json(
        { success: false, error: 'Database error' },
        { status: 500 }
      )
    }

    // プロフィール情報を取得（サブスクリプション状態）
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single()

    const subscriptionStatus = profile?.subscription_status || 'free'

    // 【修正】実際のテーブル構造に合わせて使用状況データを構築
    const usageStatus = [
      {
        analysis_type: 'clarity',
        used: usageData?.analysis_clarity_used || 0,
        limit: usageData?.analysis_clarity_limit || (subscriptionStatus === 'free' ? 1 : -1),
        can_use: (usageData?.analysis_clarity_limit || 1) === -1 || 
                 (usageData?.analysis_clarity_used || 0) < (usageData?.analysis_clarity_limit || 1)
      },
      {
        analysis_type: 'strengths',
        used: usageData?.analysis_strengths_used || 0,
        limit: usageData?.analysis_strengths_limit || (subscriptionStatus === 'free' ? 1 : -1),
        can_use: (usageData?.analysis_strengths_limit || 1) === -1 || 
                 (usageData?.analysis_strengths_used || 0) < (usageData?.analysis_strengths_limit || 1)
      },
      {
        analysis_type: 'career',
        used: usageData?.analysis_career_used || 0,
        limit: usageData?.analysis_career_limit || (subscriptionStatus === 'free' ? 1 : -1),
        can_use: (usageData?.analysis_career_limit || 1) === -1 || 
                 (usageData?.analysis_career_used || 0) < (usageData?.analysis_career_limit || 1)
      },
      {
        analysis_type: 'values',
        used: usageData?.analysis_values_used || 0,
        limit: usageData?.analysis_values_limit || (subscriptionStatus === 'free' ? 1 : -1),
        can_use: (usageData?.analysis_values_limit || 1) === -1 || 
                 (usageData?.analysis_values_used || 0) < (usageData?.analysis_values_limit || 1)
      },
      {
        analysis_type: 'persona',
        used: usageData?.analysis_persona_used || 0,
        limit: usageData?.analysis_persona_limit || (subscriptionStatus === 'free' ? 0 : -1),
        can_use: (usageData?.analysis_persona_limit || 0) === -1 || 
                 (usageData?.analysis_persona_used || 0) < (usageData?.analysis_persona_limit || 0)
      }
    ]

    console.log('💡 Usage Status API Response:', {
      success: true,
      usage: usageStatus,
      subscription_status: subscriptionStatus,
      raw_usage_data: {
        clarity: `${usageData?.analysis_clarity_used || 0}/${usageData?.analysis_clarity_limit || 1}`,
        strengths: `${usageData?.analysis_strengths_used || 0}/${usageData?.analysis_strengths_limit || 1}`,
        career: `${usageData?.analysis_career_used || 0}/${usageData?.analysis_career_limit || 1}`,
        values: `${usageData?.analysis_values_used || 0}/${usageData?.analysis_values_limit || 1}`,
        persona: `${usageData?.analysis_persona_used || 0}/${usageData?.analysis_persona_limit || 0}`
      }
    })

    return NextResponse.json({
      success: true,
      usage: usageStatus,
      subscription_status: subscriptionStatus
    })

  } catch (error) {
    console.error('Usage status API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
