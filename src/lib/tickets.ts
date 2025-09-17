import { createClient } from '@/lib/supabase'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import type { UsageTicket, TicketPurchaseRequest, TicketProduct, TicketUsage } from '@/types/tickets'

export class TicketManager {
  private supabase = createClient()

  // 既存のTICKET_PRODUCTS定義は維持...
  static readonly TICKET_PRODUCTS: Record<string, TicketProduct> = {
    analysis_normal: {
      type: 'analysis_normal',
      name: '通常分析チケット',
      description: 'モヤモヤ・強み・キャリアパス・価値観分析に利用可能',
      price: 200,
      icon: '🧠',
      features: [
        'モヤモヤ分析',
        '強み分析', 
        'キャリアパス分析',
        '価値観分析',
        '1ヶ月有効期限'
      ]
    },
    analysis_persona: {
      type: 'analysis_persona',
      name: '人物像分析チケット',
      description: '高度な人物像分析専用チケット',
      price: 500,
      icon: '👤',
      features: [
        '高精度人物像分析',
        'セルフブランディング提案',
        '多角的人格分析',
        'キャリア戦略提案',
        '1ヶ月有効期限'
      ]
    }
  }

  /**
   * ユーザーのチケット残高を取得
   */
  async getUserTicketBalance(userId: string): Promise<TicketUsage[]> {
    try {
      const { data: tickets, error } = await this.supabase
        .from('usage_tickets')
        .select('*')
        .eq('user_id', userId)
        .gt('quantity', 0) // 残量があるもののみ
        .order('expires_at', { ascending: true })

      if (error) throw error

      // チケット種別ごとに集計
      const usageMap = new Map<string, TicketUsage>()
      
      // 【修正】型を明示的に指定
      for (const ticket of (tickets || []) as UsageTicket[]) {
        const available = ticket.quantity - ticket.used
        if (available <= 0) continue

        const existing = usageMap.get(ticket.ticket_type) || {
          ticket_type: ticket.ticket_type,
          available: 0,
          used: 0,
          total: 0,
          expires_soon: [] as UsageTicket[] // 【修正】型を明示的に指定
        }

        existing.available += available
        existing.used += ticket.used
        existing.total += ticket.quantity

        // 7日以内に期限切れのチケットを追跡
        if (ticket.expires_at) { // 【修正】null チェック追加
          const expiryDate = new Date(ticket.expires_at)
          const sevenDaysFromNow = new Date()
          sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
          
          if (expiryDate <= sevenDaysFromNow) {
            existing.expires_soon.push(ticket) // 【修正】これでTypeScriptエラーが解消
          }
        }

        usageMap.set(ticket.ticket_type, existing)
      }

      return Array.from(usageMap.values())
    } catch (error) {
      console.error('Error fetching ticket balance:', error)
      throw new Error('チケット残高の取得に失敗しました')
    }
  }

  /**
   * チケット購入用Stripe PaymentIntentを作成
   */
  static async createTicketPurchaseIntentServer(
    request: TicketPurchaseRequest
  ): Promise<{ client_secret: string; payment_intent_id: string }> {
    try {
      const product = TicketManager.TICKET_PRODUCTS[request.ticket_type]
      if (!product) {
        throw new Error('無効なチケット種別です')
      }

      const totalAmount = product.price * request.quantity

      // 最小金額チェック（Stripeは50円以上必要）
      if (totalAmount < 50) {
        throw new Error('購入金額は50円以上である必要があります')
      }

      // 既存のパターンに合わせてサーバー側でSupabaseクライアント作成
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )

      // 認証されたユーザー取得
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        throw new Error('認証が必要です')
      }

      // プロファイル取得
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, full_name')
        .eq('id', user.id)
        .single()

      if (profileError || !profile) {
        console.error('Profile fetch error:', profileError)
        throw new Error('ユーザープロファイルが見つかりません')
      }

      // PaymentIntentを作成
      const paymentIntent = await stripe.paymentIntents.create({
        amount: totalAmount,
        currency: 'jpy',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          user_id: user.id,
          ticket_type: request.ticket_type,
          quantity: request.quantity.toString(),
          price_per_unit: product.price.toString()
        },
        description: `${product.name} × ${request.quantity}枚`,
        receipt_email: profile.email,
      })

      return {
        client_secret: paymentIntent.client_secret!,
        payment_intent_id: paymentIntent.id
      }
    } catch (error) {
      console.error('Error creating ticket purchase intent:', error)
      throw error instanceof Error ? error : new Error('決済の準備に失敗しました')
    }
  }

  /**
   * チケット購入完了処理（Webhookから呼び出し）
   */
  async completeTicketPurchase(paymentIntentId: string): Promise<UsageTicket> {
    try {
      // PaymentIntentの詳細を取得
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status !== 'succeeded') {
        throw new Error('決済が完了していません')
      }

      const metadata = paymentIntent.metadata
      const userId = metadata.user_id
      const ticketType = metadata.ticket_type
      const quantity = parseInt(metadata.quantity)
      const pricePerUnit = parseInt(metadata.price_per_unit)
      const totalAmount = pricePerUnit * quantity

      // 有効期限を1ヶ月後に設定
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1)

      // チケットをデータベースに保存
      const { data: ticket, error } = await this.supabase
        .from('usage_tickets')
        .insert({
          user_id: userId,
          ticket_type: ticketType,
          quantity: quantity,
          price_per_unit: pricePerUnit,
          total_amount: totalAmount,
          used: 0,
          expires_at: expiresAt.toISOString(),
          stripe_payment_intent_id: paymentIntentId
        })
        .select()
        .single()

      if (error) throw error

      return ticket as UsageTicket // 【修正】型アサーション追加
    } catch (error) {
      console.error('Error completing ticket purchase:', error)
      throw new Error('チケット購入の完了処理に失敗しました')
    }
  }

  /**
   * チケット使用処理
   */
  async useTicket(userId: string, ticketType: string): Promise<boolean> {
    try {
      // 利用可能なチケットを取得（期限の早い順）
      const { data: tickets, error: fetchError } = await this.supabase
        .from('usage_tickets')
        .select('*')
        .eq('user_id', userId)
        .eq('ticket_type', ticketType)
        .gt('expires_at', new Date().toISOString()) // 有効期限内
        .order('expires_at', { ascending: true })

      if (fetchError) throw fetchError

      // 利用可能なチケットを探す
      const availableTicket = (tickets as UsageTicket[] || []).find(ticket => ticket.used < ticket.quantity)
      
      if (!availableTicket) {
        return false // 利用可能なチケットなし
      }

      // チケット使用量を増加
      const { error: updateError } = await this.supabase
        .from('usage_tickets')
        .update({ used: availableTicket.used + 1 })
        .eq('id', availableTicket.id)

      if (updateError) throw updateError

      return true
    } catch (error) {
      console.error('Error using ticket:', error)
      throw new Error('チケットの使用に失敗しました')
    }
  }

  /**
   * 期限切れチケットのクリーンアップ
   */
  async cleanupExpiredTickets(userId?: string): Promise<void> {
    try {
      let query = this.supabase
        .from('usage_tickets')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .eq('used', 0) // 未使用のみクリーンアップ

      if (userId) {
        query = query.eq('user_id', userId)
      }

      const { error } = await query

      if (error) throw error
    } catch (error) {
      console.error('Error cleaning up expired tickets:', error)
    }
  }
}
