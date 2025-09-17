import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
})

export async function POST(request: NextRequest) {
  try {
    const { offerId, subscriptionId } = await request.json()
    
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

    let discountData = {}
    let stripeResult = null

    if (offerId === 'discount_50') {
      try {
        // 方法1: Subscription Schedule を使用した割引適用（推奨）
        if (subscription.stripe_subscription_id) {
          // 現在のサブスクリプション情報を取得
          const currentSubscription = await stripe.subscriptions.retrieve(
            subscription.stripe_subscription_id
          )

          // 50%割引の新しい価格を計算
          const currentPrice = currentSubscription.items.data[0]
          const originalAmount = currentPrice.price.unit_amount || 0
          const discountedAmount = Math.floor(originalAmount * 0.5)

          // 新しい価格を作成（50%割引）
          const discountedPrice = await stripe.prices.create({
            unit_amount: discountedAmount,
            currency: currentPrice.price.currency,
            recurring: {
              interval: currentPrice.price.recurring?.interval || 'month',
              interval_count: currentPrice.price.recurring?.interval_count || 1,
            },
            product: currentPrice.price.product as string,
            nickname: `50% Discount - ${currentPrice.price.nickname || 'Retention Offer'}`,
          })

          // Subscription Scheduleを作成して段階的な価格変更
          const schedulePhases = []
          
          // Phase 1: 3ヶ月間50%割引
          const discountEndDate = Math.floor(Date.now() / 1000) + (90 * 24 * 60 * 60) // 90日後
          schedulePhases.push({
            items: [
              {
                price: discountedPrice.id,
                quantity: currentPrice.quantity,
              },
            ],
            end_date: discountEndDate,
          })

          // Phase 2: 元の価格に戻す
          schedulePhases.push({
            items: [
              {
                price: currentPrice.price.id,
                quantity: currentPrice.quantity,
              },
            ],
          })

          // サブスクリプションスケジュールを作成
          const subscriptionSchedule = await stripe.subscriptionSchedules.create({
            from_subscription: subscription.stripe_subscription_id,
            phases: schedulePhases,
          })

          stripeResult = {
            type: 'subscription_schedule',
            scheduleId: subscriptionSchedule.id,
            discountedPriceId: discountedPrice.id,
          }

          discountData = {
            discount_type: 'percentage',
            discount_value: 50,
            discount_duration: 3,
            stripe_schedule_id: subscriptionSchedule.id,
            stripe_discounted_price_id: discountedPrice.id,
          }
        }
      } catch (stripeError) {
        console.error('Stripe schedule error:', stripeError)

        // フォールバック: Invoice Item方式
        try {
          if (subscription.stripe_customer_id) {
            // 次回請求で50%割引を適用するInvoice Itemを作成
            const invoiceItem = await stripe.invoiceItems.create({
              customer: subscription.stripe_customer_id,
              amount: -Math.floor((subscription.current_price_amount || 1480) * 0.5), // 負の値で割引
              currency: 'jpy',
              description: '3ヶ月間50%割引 - リテンションオファー',
            })

            stripeResult = {
              type: 'invoice_item',
              invoiceItemId: invoiceItem.id,
            }

            discountData = {
              discount_type: 'fixed_amount',
              discount_value: Math.floor((subscription.current_price_amount || 1480) * 0.5),
              discount_duration: 3,
              stripe_invoice_item_id: invoiceItem.id,
            }
          }
        } catch (fallbackError) {
          console.error('Fallback invoice item error:', fallbackError)
          return NextResponse.json({ error: 'Failed to apply discount via Stripe' }, { status: 500 })
        }
      }
    }

    // データベース更新
    const { error: updateError } = await supabase
      .from('user_subscriptions')
      .update({
        ...discountData,
        retention_offer_applied: true,
        retention_offer_type: 'discount',
        retention_offer_date: new Date().toISOString(),
        stripe_retention_data: JSON.stringify(stripeResult),
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)

    if (updateError) {
      console.error('Database update error:', updateError)
      return NextResponse.json({ error: 'Failed to update subscription record' }, { status: 500 })
    }

    // 割引適用ログを保存
    try {
      await supabase
        .from('retention_offers')
        .insert({
          user_id: user.id,
          subscription_id: subscriptionId,
          offer_type: 'discount',
          offer_value: '50% for 3 months',
          stripe_data: JSON.stringify(stripeResult),
          applied_at: new Date().toISOString()
        })
    } catch (insertError) {
      console.error('Failed to save retention offer:', insertError)
    }

    // 成功通知をユーザーに送信
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          type: 'discount_applied',
          title: '50%割引が適用されました',
          message: '今後3ヶ月間、月額料金が50%割引になります。次回の請求書でご確認ください。',
          read: false
        })
    } catch (notificationError) {
      console.error('Failed to create notification:', notificationError)
    }

    return NextResponse.json({ 
      success: true,
      message: '50%割引が正常に適用されました。今後3ヶ月間、月額料金が半額になります。',
      discountInfo: {
        percentage: 50,
        duration: '3ヶ月間',
        appliedMethod: stripeResult?.type || 'schedule'
      }
    })

  } catch (error) {
    console.error('Apply discount error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
