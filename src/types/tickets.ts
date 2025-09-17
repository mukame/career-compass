export interface UsageTicket {
  id: string
  user_id: string
  ticket_type: 'analysis_normal' | 'analysis_persona'
  quantity: number
  price_per_unit: number
  total_amount: number
  used: number
  expires_at: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface TicketPurchaseRequest {
  ticket_type: 'analysis_normal' | 'analysis_persona'
  quantity: number
}

export interface TicketProduct {
  type: 'analysis_normal' | 'analysis_persona'
  name: string
  description: string
  price: number
  icon: string
  features: string[]
}

export interface TicketUsage {
  ticket_type: string
  available: number
  used: number
  total: number
  expires_soon: UsageTicket[]
}
