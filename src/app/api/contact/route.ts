import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Supabaseクライアントの作成
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // または NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request: NextRequest) {
  try {
    const { name, email, category, subject, message, urgent } = await request.json();

    // バリデーション
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: '必須項目が入力されていません。' },
        { status: 400 }
      );
    }

    // メールアドレスのバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '有効なメールアドレスを入力してください。' },
        { status: 400 }
      );
    }

    // Supabaseにデータ保存
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([
        {
          name,
          email,
          category,
          subject,
          message,
          urgent,
          status: urgent ? 'urgent' : 'unread'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'お問い合わせの送信に失敗しました。しばらく後でお試しください。' },
        { status: 500 }
      );
    }

    // 成功レスポンス
    return NextResponse.json(
      { 
        success: true, 
        message: 'お問い合わせを受け付けました。ありがとうございます。',
        id: data.id
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact API error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}
