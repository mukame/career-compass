import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { 
      analysis_type, 
      input_data, 
      result, 
      title, 
      tags 
    } = await request.json();

    // 認証確認（実際の実装では適切な認証チェックが必要）
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: '認証が必要です。' },
        { status: 401 }
      );
    }

    // user_idを取得（実際の実装では認証情報から取得）
    const user_id = request.headers.get('x-user-id');
    if (!user_id) {
      return NextResponse.json(
        { error: 'ユーザーIDが必要です。' },
        { status: 400 }
      );
    }

    // バリデーション
    if (!analysis_type || !input_data || !result) {
      return NextResponse.json(
        { error: '必須項目が不足しています。' },
        { status: 400 }
      );
    }

    // ユーザーのサブスクリプション状況確認
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user_id)
      .single();

    if (profileError || !profileData) {
      return NextResponse.json(
        { error: 'ユーザー情報が見つかりません。' },
        { status: 404 }
      );
    }

    // フリープランは保存不可
    if (profileData.subscription_status === 'free') {
      return NextResponse.json(
        { error: 'この機能を利用するにはプランのアップグレードが必要です。' },
        { status: 403 }
      );
    }

    // 分析結果を保存
    const { data, error } = await supabase
      .from('ai_analyses')
      .insert([
        {
          user_id,
          analysis_type,
          input_data,
          result,
          title: title || `${analysis_type}分析結果`,
          tags: tags || []
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: '保存に失敗しました。' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true, 
        message: '分析結果を保存しました。',
        id: data.id,
        expires_at: data.expires_at
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Save analysis error:', error);
    return NextResponse.json(
      { error: '予期しないエラーが発生しました。' },
      { status: 500 }
    );
  }
}
