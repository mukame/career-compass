import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_WEBHOOK_SECRET } from '@/lib/stripe'
import { createClient } from '@/lib/supabase'
import { SubscriptionManager } from '@/lib/subscription'
import { TicketManager } from '@/lib/tickets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    let event: import('stripe').Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createClient()
    const subscriptionManager = new SubscriptionManager()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as import('stripe').Stripe.Checkout.Session
        
        if (session.mode === 'subscription') {
          // 【既存】サブスクリプション処理
          const subscriptionId = session.subscription as string
          const userId = session.metadata?.user_id
          const planId = session.metadata?.plan_id
          const billingCycle = session.metadata?.billing_cycle

          if (!userId || !planId) {
            console.error('Missing metadata in checkout session')
            break
          }

          // サブスクリプション情報の保存
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            plan_id: planId,
            status: subscription.status,
            billing_cycle: billingCycle,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            stripe_subscription_id: subscriptionId,
          }, { onConflict: 'user_id' })

          // プロフィールのサブスクリプションステータス更新
          await supabase
            .from('profiles')
            .update({ 
              subscription_status: planId === 'premium' ? 'premium' : 'standard' 
            })
            .eq('id', userId)

          // 使用量制限の更新
          await subscriptionManager.resetMonthlyUsage(userId)

          // ウェルカム通知の送信
          await supabase.from('notifications').insert({
            user_id: userId,
            title: `${planId === 'premium' ? 'プレミアム' : 'スタンダード'}プランへようこそ！`,
            message: `${planId === 'premium' ? 'プレミアム' : 'スタンダード'}プランが正常にアクティベートされました。すべての機能をお楽しみください。`,
            type: 'system'
          })
        }
        // 【新規追加】チケット購入処理
        else if (session.mode === 'payment' && session.metadata?.type === 'ticket_purchase') {
          const userId = session.metadata.user_id
          const ticketType = session.metadata.ticket_type
          const quantity = parseInt(session.metadata.quantity)

          if (!userId || !ticketType || !quantity) {
            console.error('Missing metadata in ticket purchase session')
            break
          }

          try {
            const product = TicketManager.TICKET_PRODUCTS[ticketType]
            
            if (!product) {
              console.error('Invalid ticket type:', ticketType)
              break
            }

            // 有効期限を1ヶ月後に設定
            const expiresAt = new Date()
            expiresAt.setMonth(expiresAt.getMonth() + 1)

            // チケットをデータベースに保存
            await supabase.from('usage_tickets').insert({
              user_id: userId,
              ticket_type: ticketType,
              quantity: quantity,
              price_per_unit: product.price,
              total_amount: product.price * quantity,
              used: 0,
              expires_at: expiresAt.toISOString(),
              stripe_payment_intent_id: null, // Checkout Sessionの場合はnull
              created_at: new Date().toISOString()
            })

            // 購入完了通知
            await supabase.from('notifications').insert({
              user_id: userId,
              title: 'チケット購入が完了しました',
              message: `${product.name}を${quantity}枚購入いただきました。ありがとうございます！`,
              type: 'system'
            })

            console.log(`Ticket purchase completed via checkout session: ${session.id}`)
          } catch (error) {
            console.error('Error processing ticket purchase:', error)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as import('stripe').Stripe.Subscription
        const userId = subscription.metadata.user_id

        if (userId) {
          await supabase.from('user_subscriptions').update({
            status: subscription.status,
            current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
            current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
          }).eq('stripe_subscription_id', subscription.id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as import('stripe').Stripe.Subscription
        const userId = subscription.metadata.user_id

        if (userId) {
          await supabase.from('user_subscriptions').update({
            status: 'canceled'
          }).eq('stripe_subscription_id', subscription.id)

          await supabase
            .from('profiles')
            .update({ subscription_status: 'free' })
            .eq('id', userId)

          // 使用量制限をフリープランに戻す
          await subscriptionManager.resetMonthlyUsage(userId)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as import('stripe').Stripe.Invoice
        const subscriptionId = (invoice as any).subscription as string
        
        if (subscriptionId) {
          const { data: userSub } = await supabase
            .from('user_subscriptions')
            .select('user_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single()

          if (userSub) {
            // 支払い失敗通知
            await supabase.from('notifications').insert({
              user_id: userSub.user_id,
              title: '支払いに失敗しました',
              message: 'お支払い方法を確認し、更新してください。サービスが一時停止される可能性があります。',
              type: 'system'
            })
          }
        }
        break
      }

      // 【既存】PaymentIntent処理（後で削除予定）
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as import('stripe').Stripe.PaymentIntent
        
        // チケット購入の場合のみ処理（metadataで判断）
        if (paymentIntent.metadata && paymentIntent.metadata.ticket_type) {
          try {
            const ticketManager = new TicketManager()
            const ticket = await ticketManager.completeTicketPurchase(paymentIntent.id)
            
            console.log(`Ticket purchase completed: ${paymentIntent.id}`)
            
            // チケット購入完了通知
            await supabase.from('notifications').insert({
              user_id: paymentIntent.metadata.user_id,
              title: 'チケット購入が完了しました',
              message: `${paymentIntent.metadata.ticket_type === 'analysis_persona' ? '人物像分析' : '通常分析'}チケット${paymentIntent.metadata.quantity}枚を購入いただきました。ありがとうございます！`,
              type: 'system'
            })
          } catch (error) {
            console.error('Error handling ticket purchase success:', error)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing failed:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
