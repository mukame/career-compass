import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    const supabase = createClient()
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ユーザー情報を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // メール通知をデータベースに保存（実際の送信は別途実装）
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'subscription_canceled',
          title: 'サブスクリプション解約完了',
          message: 'Career Compassのプレミアムプランが正常に解約されました。またのご利用をお待ちしております。',
          scheduled_for: new Date().toISOString(),
          read: false
        })
    } catch (notificationError) {
      console.error('Failed to save notification:', notificationError)
    }

    // 実際のメール送信処理（例：SendGrid, AWS SES等）
    // await sendCancelConfirmationEmail(profile.email, profile.full_name)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Send cancel email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
