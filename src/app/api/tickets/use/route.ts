import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TicketManager } from '@/lib/tickets'

// POST: チケット使用
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticket_type, analysis_type } = body

    // バリデーション
    if (!ticket_type || !analysis_type) {
      return NextResponse.json(
        { error: 'チケット種別と分析種別は必須です' },
        { status: 400 }
      )
    }

    // チケット種別と分析種別の整合性チェック
    const validCombinations = {
      analysis_normal: ['clarity', 'strengths', 'career', 'values'],
      analysis_persona: ['persona']
    }

    if (!validCombinations[ticket_type as keyof typeof validCombinations]?.includes(analysis_type)) {
      return NextResponse.json(
        { error: 'チケット種別と分析種別が一致しません' },
        { status: 400 }
      )
    }

    const ticketManager = new TicketManager()
    const success = await ticketManager.useTicket(user.id, ticket_type)

    if (!success) {
      return NextResponse.json(
        { error: '利用可能なチケットがありません' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'チケットを使用しました'
    })
  } catch (error) {
    console.error('Error using ticket:', error)
    return NextResponse.json(
      { error: 'チケットの使用に失敗しました' },
      { status: 500 }
    )
  }
}
