import { useState } from 'react';
import { createClient } from '@/lib/supabase';

interface SaveAnalysisData {
  analysis_type: string;
  input_data: any;
  result: any;
  title?: string;
  tags?: string[];
}

export const useAnalysisSave = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const supabase = createClient();

  const saveAnalysis = async (data: SaveAnalysisData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // ユーザー情報取得
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('ログインが必要です。');
      }

      // ユーザーのサブスクリプション状況確認
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', user.id)
        .single();

      if (profileError || !profileData) {
        throw new Error('ユーザー情報が見つかりません。');
      }

      // フリープランは保存不可
      if (profileData.subscription_status === 'free') {
        throw new Error('この機能を利用するにはプランのアップグレードが必要です。');
      }

      // 分析結果を保存
      const { data: savedData, error: saveError } = await supabase
        .from('ai_analyses')
        .insert([
          {
            user_id: user.id,
            analysis_type: data.analysis_type,
            input_data: data.input_data,
            result: data.result,
            title: data.title || `${data.analysis_type}分析結果`,
            tags: data.tags || []
          }
        ])
        .select()
        .single();

      if (saveError) {
        throw new Error('保存に失敗しました。');
      }

      return savedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '予期しないエラーが発生しました。';
      setSaveError(errorMessage);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveAnalysis,
    isSaving,
    saveError,
    clearError: () => setSaveError(null)
  };
};
