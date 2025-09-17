import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TicketManager } from '@/lib/tickets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { ticket_type, quantity } = body

    // 認証チェック
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // バリデーション
    if (!ticket_type || !quantity || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: '無効なチケット種別または数量です' },
        { status: 400 }
      )
    }

    const product = TicketManager.TICKET_PRODUCTS[ticket_type]
    if (!product) {
      return NextResponse.json(
        { error: '無効なチケット種別です' },
        { status: 400 }
      )
    }

    // プロフィール取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 顧客情報の取得または作成（既存パターンと同じ）
    const customers = await stripe.customers.list({
      email: profile.email,
      limit: 1
    })

    let customer
    if (customers.data.length > 0) {
      customer = customers.data[0]
    } else {
      customer = await stripe.customers.create({
        email: profile.email,
        name: profile.full_name || undefined,
        metadata: { user_id: user.id }
      })
    }

    // URL設定（既存パターンと同じ）
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const getValidUrl = (url: string) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`
      }
      return url
    }
    const validBaseUrl = getValidUrl(baseUrl)

    // Checkout Session作成
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'jpy',
            product_data: {
              name: product.name,
              description: product.description,
            },
            unit_amount: product.price,
          },
          quantity: quantity,
        },
      ],
      mode: 'payment', // サブスクリプションではなく一回払い
      success_url: `${validBaseUrl}/tickets/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${validBaseUrl}/tickets`,
      metadata: {
        user_id: user.id,
        ticket_type: ticket_type,
        quantity: quantity.toString(),
        type: 'ticket_purchase' // チケット購入の識別子
      },
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'auto',
    })

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Ticket checkout session creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
