import { NextResponse } from 'next/server'
import { TicketManager } from '@/lib/tickets'

// GET: チケット商品一覧取得
export async function GET() {
  try {
    const products = Object.values(TicketManager.TICKET_PRODUCTS)
    
    return NextResponse.json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('Error fetching ticket products:', error)
    return NextResponse.json(
      { error: 'チケット商品の取得に失敗しました' },
      { status: 500 }
    )
  }
}
