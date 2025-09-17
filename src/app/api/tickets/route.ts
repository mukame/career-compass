import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { TicketManager } from '@/lib/tickets'

// GET: ユーザーのチケット残高取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ticketManager = new TicketManager()
    const balance = await ticketManager.getUserTicketBalance(user.id)

    return NextResponse.json({ 
      success: true, 
      data: balance 
    })
  } catch (error) {
    console.error('Error fetching ticket balance:', error)
    return NextResponse.json(
      { error: 'チケット残高の取得に失敗しました' },
      { status: 500 }
    )
  }
}

// POST: チケット購入Intent作成
export async function POST(request: NextRequest) {
  try {
    // 【修正】認証チェックをここで行う
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { ticket_type, quantity } = body

    // バリデーション
    if (!ticket_type || !quantity || quantity < 1 || quantity > 10) {
      return NextResponse.json(
        { error: '無効なチケット種別または数量です' },
        { status: 400 }
      )
    }

    if (!['analysis_normal', 'analysis_persona'].includes(ticket_type)) {
      return NextResponse.json(
        { error: '無効なチケット種別です' },
        { status: 400 }
      )
    }

    // 【修正】静的メソッドを使用
    const intent = await TicketManager.createTicketPurchaseIntentServer({
      ticket_type,
      quantity
    })

    return NextResponse.json({
      success: true,
      data: intent
    })
  } catch (error) {
    console.error('Error creating ticket purchase intent:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'チケット購入の準備に失敗しました' },
      { status: 500 }
    )
  }
}
