export interface Referral {
  id: string
  referrer_id: string
  referee_id: string | null
  referral_code: string
  status: 'pending' | 'completed' | 'expired'
  reward_type: string | null
  reward_value: number | null
  completed_at: string | null
  created_at: string
}

export interface ReferralCode {
  code: string
  expires_at: string
  usage_count: number
  max_uses: number
}

export interface ReferralReward {
  type: 'ticket'
  value: number
  description: string
}

export interface ReferralStats {
  total_referrals: number
  successful_referrals: number
  pending_referrals: number
  total_rewards_earned: number
  current_month_referrals: number
}
