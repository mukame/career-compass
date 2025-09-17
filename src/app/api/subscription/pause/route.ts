import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, pauseMonths = 1 } = await request.json()
    
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

    // 一時停止期間を計算
    const pauseUntil = new Date()
    pauseUntil.setMonth(pauseUntil.getMonth() + pauseMonths)

    // Stripeサブスクリプションを一時停止
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          pause_collection: {
            behavior: 'void',
            resumes_at: Math.floor(pauseUntil.getTime() / 1000)
          }
        })
      } catch (stripeError) {
        console.error('Stripe pause error:', stripeError)
        return NextResponse.json({ error: 'Failed to pause subscription' }, { status: 500 })
      }
    }

    // データベース更新
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        status: 'paused',
        paused_at: new Date().toISOString(),
        pause_until: pauseUntil.toISOString(),
        retention_offer_applied: true,
        retention_offer_type: 'pause',
        retention_offer_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to pause subscription' }, { status: 500 })
    }

    // 一時停止ログを保存
    try {
      await supabase
        .from('retention_offers')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          offer_type: 'pause',
          offer_value: `${pauseMonths} months`,
          applied_at: new Date().toISOString()
        })
    } catch (insertError) {
      console.error('Failed to save retention offer:', insertError)
    }

    return NextResponse.json({ 
      success: true,
      resumeDate: pauseUntil.toISOString()
    })

  } catch (error) {
    console.error('Pause subscription error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
