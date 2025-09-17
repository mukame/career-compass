import { createClient } from '@/lib/supabase'

export interface PlanFeatures {
  analysis_clarity: number
  analysis_strengths: number
  analysis_career: number
  analysis_values: number
  analysis_persona: number
  goals_limit: number
  tasks_limit: number
  history_months: number
  save_results: boolean
  export_data: boolean
  comparison?: boolean
  ai_coaching?: boolean
  advanced_persona?: boolean
  weekly_reminder?: boolean
  trend_display?: boolean
  goal_tracking?: boolean
  industry_analysis?: boolean
  future_prediction?: boolean
  personal_report?: boolean
  auto_goal_generation?: boolean
  market_analysis?: boolean
}

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  price_monthly: number
  price_yearly: number
  features: PlanFeatures
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'canceled' | 'past_due' | 'incomplete'
  billing_cycle: 'monthly' | 'yearly'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
}

export interface UsageLimits {
  id?: string // データベースのプライマリキー
  user_id: string // ユーザーID（必須）
  analysis_clarity_used: number
  analysis_clarity_limit: number
  analysis_strengths_used: number
  analysis_strengths_limit: number
  analysis_career_used: number
  analysis_career_limit: number
  analysis_values_used: number
  analysis_values_limit: number
  analysis_persona_used: number
  analysis_persona_limit: number
  goals_used: number
  goals_limit: number
  tasks_used: number
  tasks_limit: number
  period_start: string
  period_end: string
  created_at?: string // 作成日時
  updated_at?: string // 更新日時
}

export class SubscriptionManager {
  private supabase = createClient()

  // 既存メソッドはそのまま維持
  async getCurrentSubscription(userId: string): Promise<{
    subscription: UserSubscription | null
    plan: SubscriptionPlan | null
  }> {
    try {
      const { data: subscription } = await this.supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .single()

      if (!subscription) {
        // フリープランを返す
        const { data: freePlan } = await this.supabase
          .from('subscription_plans')
          .select('*')
          .eq('name', 'free')
          .single()

        return {
          subscription: null,
          plan: freePlan
        }
      }

      return {
        subscription: subscription,
        plan: subscription.plan
      }
    } catch (error) {
      console.error('Error fetching subscription:', error)
      throw error
    }
  }

  async getUserUsageLimits(userId: string): Promise<UsageLimits> {
    try {
      let { data: usage } = await this.supabase
        .from('usage_limits')
        .select('*')
        .eq('user_id', userId)
        .gte('period_end', new Date().toISOString())
        .single()

      // 使用量データが存在しないか期限切れの場合、新規作成
      if (!usage) {
        usage = await this.resetMonthlyUsage(userId)
      }

      return usage
    } catch (error) {
      console.error('Error fetching usage limits:', error)
      throw error
    }
  }

  async resetMonthlyUsage(userId: string): Promise<UsageLimits> {
    const { subscription, plan } = await this.getCurrentSubscription(userId)
    
    if (!plan) {
      throw new Error('No plan found for user')
    }

    const now = new Date()
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1)

    const newUsage = {
      user_id: userId,
      analysis_clarity_used: 0,
      analysis_clarity_limit: plan.features.analysis_clarity,
      analysis_strengths_used: 0,
      analysis_strengths_limit: plan.features.analysis_strengths,
      analysis_career_used: 0,
      analysis_career_limit: plan.features.analysis_career,
      analysis_values_used: 0,
      analysis_values_limit: plan.features.analysis_values,
      analysis_persona_used: 0,
      analysis_persona_limit: plan.features.analysis_persona,
      goals_used: 0,
      goals_limit: plan.features.goals_limit,
      tasks_used: 0,
      tasks_limit: plan.features.tasks_limit,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString()
    }

    const { data, error } = await this.supabase
      .from('usage_limits')
      .upsert(newUsage, { onConflict: 'user_id' })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async checkUsageLimit(userId: string, analysisType: string): Promise<{
    canUse: boolean
    used: number
    limit: number
  }> {
    const usage = await this.getUserUsageLimits(userId)
    const usedField = `${analysisType}_used` as keyof UsageLimits
    const limitField = `${analysisType}_limit` as keyof UsageLimits
    
    const used = usage[usedField] as number
    const limit = usage[limitField] as number
    
    // -1 は無制限を表す
    const canUse = limit === -1 || used < limit

    return { canUse, used, limit }
  }

  async incrementUsage(userId: string, analysisType: string): Promise<void> {
    const usedField = `${analysisType}_used`
    
    const { error } = await this.supabase.rpc('increment_usage', {
      user_id: userId,
      field_name: usedField
    })

    if (error) {
      console.error('Error incrementing usage:', error)
      throw error
    }
  }

  async generateReferralCode(userId: string): Promise<string> {
    const code = `REF_${userId.slice(0, 8)}_${Date.now().toString(36).toUpperCase()}`
    
    const { error } = await this.supabase
      .from('referrals')
      .insert({
        referrer_id: userId,
        referral_code: code,
        status: 'pending'
      })

    if (error) throw error
    return code
  }

  async applyReferralCode(userId: string, code: string): Promise<boolean> {
    try {
      const { data: referral } = await this.supabase
        .from('referrals')
        .select('*')
        .eq('referral_code', code)
        .eq('status', 'pending')
        .single()

      if (!referral || referral.referrer_id === userId) {
        return false
      }

      // 紹介を完了状態に更新
      await this.supabase
        .from('referrals')
        .update({
          referee_id: userId,
          status: 'completed',
          completed_at: new Date().toISOString(),
          reward_type: 'discount',
          reward_value: 500 // 500円割引
        })
        .eq('id', referral.id)

      return true
    } catch (error) {
      console.error('Error applying referral code:', error)
      return false
    }
  }

  // 新規追加メソッド（既存と統合版）
  /**
   * プラン別保存機能チェック（既存メソッドを活用）
   */
  async canSaveAnalysis(userId: string): Promise<{
    canSave: boolean
    planName: string
    historyMonths: number
  }> {
    try {
      const { subscription, plan } = await this.getCurrentSubscription(userId)
      
      if (!plan) {
        return { canSave: false, planName: 'free', historyMonths: 0 }
      }

      const canSave = plan.features.save_results || false
      const historyMonths = plan.features.history_months || 0
      
      return {
        canSave,
        planName: plan.name,
        historyMonths
      }
    } catch (error) {
      console.error('Error checking save capability:', error)
      return { canSave: false, planName: 'free', historyMonths: 0 }
    }
  }

  /**
   * 分析実行可否チェック（既存checkUsageLimitを活用）
   */
  async checkAnalysisEligibility(userId: string, analysisType: string): Promise<{
    canAnalyze: boolean
    reason?: 'limit_exceeded' | 'plan_required' | 'ticket_required'
    usageInfo?: { used: number; limit: number }
    ticketPrice?: number
  }> {
    try {
      const usageCheck = await this.checkUsageLimit(userId, `analysis_${analysisType}`)
      
      if (usageCheck.canUse) {
        return { canAnalyze: true }
      }

      // 制限に達している場合
      const ticketPrice = analysisType === 'persona' ? 500 : 200
      
      return {
        canAnalyze: false,
        reason: 'ticket_required',
        usageInfo: { used: usageCheck.used, limit: usageCheck.limit },
        ticketPrice
      }
    } catch (error) {
      console.error('Error checking analysis eligibility:', error)
      return { canAnalyze: false, reason: 'plan_required' }
    }
  }

  /**
   * プラン別データ保持期限チェック（既存メソッドを活用）
   */
  async cleanupExpiredAnalyses(userId: string): Promise<void> {
    try {
      const { canSave, historyMonths } = await this.canSaveAnalysis(userId)
      
      if (!canSave || historyMonths === -1 || historyMonths === 0) {
        return // 保存不可、無制限、またはフリープラン
      }

      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - historyMonths)

      await this.supabase
        .from('ai_analyses')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString())

    } catch (error) {
      console.error('Error cleaning up expired analyses:', error)
    }
  }
  /**Stripe決済セッション作成（オンボーディング用スタブ）*/
  async createCheckoutSession(
    userId: string, 
    planId: string, 
    successUrl: string
  ): Promise<{ sessionUrl: string | null }> {
    try {
      // 将来のStripe統合のためのスタブ実装
      console.log('Checkout session creation for:', { userId, planId, successUrl });
      
      // 現在は null を返す（実際のStripe統合は後で実装）
      return { sessionUrl: null };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { sessionUrl: null };
    }
  }
}

// SQL関数の追加（データベースに実行）
export const createUsageIncrementFunction = `
CREATE OR REPLACE FUNCTION increment_usage(user_id UUID, field_name TEXT)
RETURNS VOID AS $$
BEGIN
  EXECUTE format('UPDATE usage_limits SET %I = %I + 1 WHERE user_id = $1', field_name, field_name)
  USING user_id;
END;

$$ LANGUAGE plpgsql;
`
