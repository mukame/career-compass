import { createClient } from '@/lib/supabase'
import type { Referral, ReferralCode, ReferralStats, ReferralReward } from '@/types/referrals'
import { SubscriptionManager } from '@/lib/subscription'
import { TicketManager } from '@/lib/tickets'

export class ReferralManager {
  private supabase = createClient()
  private subscriptionManager = new SubscriptionManager()
  private ticketManager = new TicketManager()

  // 紹介報酬設定
  static readonly REFERRAL_REWARDS: Record<string, ReferralReward> = {
    referrer: {
      type: 'ticket',
      value: 3, // 通常分析チケット3枚
      description: '通常分析チケット3枚'
    },
    referee: {
      type: 'ticket', 
      value: 5, // 通常分析チケット5枚
      description: '通常分析チケット5枚'
    }
  }

  /**
   * 紹介コード生成（英数字12文字）
   */
  generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * ユーザーの紹介コードを作成
   */
  async createReferralCode(userId: string): Promise<ReferralCode> {
    try {
      // 既存の有効なコードがあるかチェック
      const { data: existingCode } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .eq('status', 'pending')
        .gt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // 1週間以内
        .single()

      if (existingCode) {
        const expiresAt = new Date(existingCode.created_at)
        expiresAt.setDate(expiresAt.getDate() + 7)
        
        return {
          code: existingCode.referral_code,
          expires_at: expiresAt.toISOString(),
          usage_count: 0,
          max_uses: 1
        }
      }

      // 新しいコードを生成
      const code = this.generateReferralCode()
      
      const { data: referral, error } = await this.supabase
        .from('referrals')
        .insert({
          referrer_id: userId,
          referral_code: code,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      const expiresAt = new Date(referral.created_at)
      expiresAt.setDate(expiresAt.getDate() + 7)

      return {
        code: referral.referral_code,
        expires_at: expiresAt.toISOString(),
        usage_count: 0,
        max_uses: 1
      }
    } catch (error) {
      console.error('Error creating referral code:', error)
      throw new Error('紹介コードの生成に失敗しました')
    }
  }

  /**
   * 紹介コードの有効性チェック
   */
  async validateReferralCode(code: string, refereeId: string): Promise<{
    isValid: boolean
    reason?: string
    referrerId?: string
  }> {
    try {
      // コードの存在確認
      const { data: referral, error } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code)
        .eq('status', 'pending')
        .single()

      if (error || !referral) {
        return { isValid: false, reason: 'invalid_code' }
      }

      // 期限チェック（1週間）
      const codeCreatedAt = new Date(referral.created_at)
      const expiryDate = new Date(codeCreatedAt)
      expiryDate.setDate(expiryDate.getDate() + 7)

      if (new Date() > expiryDate) {
        // 期限切れのコードを無効化
        await this.supabase
          .from('referrals')
          .update({ status: 'expired' })
          .eq('id', referral.id)

        return { isValid: false, reason: 'expired' }
      }

      // 自己紹介チェック
      if (referral.referrer_id === refereeId) {
        return { isValid: false, reason: 'self_referral' }
      }

      // 既に使用済みチェック
      if (referral.referee_id) {
        return { isValid: false, reason: 'already_used' }
      }

      // 紹介者の有料プラン確認
      const { subscription } = await this.subscriptionManager.getCurrentSubscription(referral.referrer_id)
      if (!subscription || subscription.status !== 'active') {
        return { isValid: false, reason: 'referrer_not_premium' }
      }

      // 紹介者の初回分析完了チェック
      const { data: analyses } = await this.supabase
        .from('ai_analyses')
        .select('id')
        .eq('user_id', referral.referrer_id)
        .limit(1)

      if (!analyses || analyses.length === 0) {
        return { isValid: false, reason: 'referrer_no_analysis' }
      }

      return { 
        isValid: true, 
        referrerId: referral.referrer_id 
      }
    } catch (error) {
      console.error('Error validating referral code:', error)
      return { isValid: false, reason: 'system_error' }
    }
  }

  /**
   * 紹介成功時の報酬処理
   */
  async processReferralSuccess(code: string, refereeId: string): Promise<void> {
    try {
      const validation = await this.validateReferralCode(code, refereeId)
      if (!validation.isValid) {
        throw new Error(`紹介コードが無効です: ${validation.reason}`)
      }

      // トランザクション処理
      const { data: referral, error: updateError } = await this.supabase
        .from('referrals')
        .update({
          referee_id: refereeId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          reward_type: 'tickets',
          reward_value: ReferralManager.REFERRAL_REWARDS.referrer.value + ReferralManager.REFERRAL_REWARDS.referee.value
        })
        .eq('referral_code', code)
        .eq('status', 'pending')
        .select()
        .single()

      if (updateError || !referral) {
        throw new Error('紹介の完了処理に失敗しました')
      }

      // 紹介者への報酬（通常分析チケット3枚）
      await this.grantReferralReward(
        validation.referrerId!,
        ReferralManager.REFERRAL_REWARDS.referrer.value
      )

      // 被紹介者への報酬（通常分析チケット5枚）
      await this.grantReferralReward(
        refereeId,
        ReferralManager.REFERRAL_REWARDS.referee.value
      )

    } catch (error) {
      console.error('Error processing referral success:', error)
      throw error
    }
  }

  /**
   * 紹介報酬のチケット付与
   */
  private async grantReferralReward(userId: string, ticketCount: number): Promise<void> {
    try {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 1) // 1ヶ月有効

      const { error } = await this.supabase
        .from('usage_tickets')
        .insert({
          user_id: userId,
          ticket_type: 'analysis_normal',
          quantity: ticketCount,
          price_per_unit: 0, // 無料付与
          total_amount: 0,
          used: 0,
          expires_at: expiresAt.toISOString(),
          stripe_payment_intent_id: null
        })

      if (error) throw error
    } catch (error) {
      console.error('Error granting referral reward:', error)
      throw error
    }
  }

  /**
   * ユーザーの紹介統計を取得
   */
  async getUserReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const { data: referrals, error } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)

      if (error) throw error

      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      const stats = (referrals || []).reduce((acc, referral) => {
        acc.total_referrals++
        
        if (referral.status === 'completed') {
          acc.successful_referrals++
          acc.total_rewards_earned += referral.reward_value || 0
        } else if (referral.status === 'pending') {
          acc.pending_referrals++
        }

        const referralDate = new Date(referral.created_at)
        if (referralDate >= currentMonth) {
          acc.current_month_referrals++
        }

        return acc
      }, {
        total_referrals: 0,
        successful_referrals: 0,
        pending_referrals: 0,
        total_rewards_earned: 0,
        current_month_referrals: 0
      } as ReferralStats)

      return stats
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      throw error
    }
  }

  /**
   * 紹介履歴を取得
   */
  async getReferralHistory(userId: string): Promise<Referral[]> {
    try {
      const { data: referrals, error } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return referrals || []
    } catch (error) {
      console.error('Error fetching referral history:', error)
      throw error
    }
  }
}
