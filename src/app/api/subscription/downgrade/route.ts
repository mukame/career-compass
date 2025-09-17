import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()
    
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
      }
    }

    // フリープランのプラン情報を取得
    const { data: freePlan } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('name', 'free')
      .single()

    // データベース更新（フリープランに変更）
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        plan_id: freePlan?.id,
        status: 'active',
        downgraded_from: subscription.plan_id,
        downgraded_at: new Date().toISOString(),
        retention_offer_applied: true,
        retention_offer_type: 'downgrade',
        retention_offer_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to downgrade subscription' }, { status: 500 })
    }

    // プロファイル更新
    await supabase
      .from('profiles')
      .update({ subscription_status: 'free' })
      .eq('id', user.id)

    // ダウングレードログを保存
    try {
      await supabase
        .from('retention_offers')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          offer_type: 'downgrade',
          offer_value: 'free_plan',
          applied_at: new Date().toISOString()
        })
    } catch (insertError) {
      console.error('Failed to save retention offer:', insertError)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Downgrade subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
