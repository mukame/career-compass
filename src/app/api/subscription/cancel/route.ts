import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, reason, customReason } = await request.json()
    
    const supabase = createClient()
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // サブスクリプション情報を取得
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('user_id', user.id)
      .single()

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Stripeサブスクリプションを解約
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.cancel(subscription.stripe_subscription_id, {
          prorate: true
        })
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError)
        // Stripe解約が失敗してもDBは更新する（手動処理のため）
      }
    }

    // データベース更新
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
    }

    // 解約理由を保存
    try {
      await supabase
        .from('subscription_cancellations')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          reason_code: reason,
          reason_text: customReason || reason,
          canceled_at: new Date().toISOString()
        })
    } catch (insertError) {
      console.error('Failed to save cancellation reason:', insertError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
