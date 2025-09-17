import { NextRequest, NextResponse } from 'next/server'
import { stripe, STRIPE_PRICE_IDS } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, billingCycle, referralDiscount = 0 } = body

    const supabase = await createServerSupabaseClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log('Auth check - User:', user?.id, 'Error:', authError)
    
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return NextResponse.json(
        { error: 'Unauthorized - Authentication required' }, 
        { status: 401 }
      )
    }

    const priceKey = `${planId}_${billingCycle}` as keyof typeof STRIPE_PRICE_IDS
    const priceId = STRIPE_PRICE_IDS[priceKey]
    
    // デバッグ用ログ追加（最小限の修正）
    console.log('Plan lookup:', { planId, billingCycle, priceKey, priceId })
    console.log('Available price IDs:', STRIPE_PRICE_IDS)
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan configuration' },
        { status: 400 }
      )
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    console.log('Profile found:', profile.email)

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
        metadata: {
          user_id: user.id
        }
      })
    }

    // 修正：URL生成を安全に行う
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    
    // URLにスキームが含まれていない場合は追加
    const getValidUrl = (url: string) => {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`
      }
      return url
    }
    
    const validBaseUrl = getValidUrl(baseUrl)
    
    console.log('Using base URL:', validBaseUrl) // デバッグ用

    // セッション作成のベース設定
    const sessionConfig: import('stripe').Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      metadata: {
        user_id: user.id,
        plan_id: planId,
        billing_cycle: billingCycle,
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan_id: planId,
        },
      },
      // 修正：安全なURL生成
      success_url: `${validBaseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${validBaseUrl}/pricing`,
      allow_promotion_codes: true,
      customer_update: {
        address: 'auto',
        name: 'auto',
      },
      billing_address_collection: 'auto',
      //以下の部分は利用規約部分。一時的にコメントアウト。
      // consent_collection: {
      //   terms_of_service: 'required',
      // },
      custom_text: {
        submit: {
          message: 'いつでもキャンセル可能です。'
        }
      }
    }

    if (referralDiscount > 0) {
      const coupon = await stripe.coupons.create({
        amount_off: referralDiscount * 100,
        currency: 'jpy',
        duration: 'once',
        name: '友達紹介特典',
      })

      sessionConfig.discounts = [{
        coupon: coupon.id
      }]
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('Session created successfully:', session.id)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })

  } catch (error) {
    console.error('Stripe checkout session creation failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
