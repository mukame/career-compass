// 既存データ構造に完全準拠した型定義
export interface AnalysisResult {
  id: string
  user_id: string
  analysis_type: 'clarity' | 'strengths' | 'career' | 'values' | 'persona'
  input_data: Record<string, any> // 既存のJSONBフィールド
  result: Record<string, any>     // 既存のJSONBフィールド
  title?: string                  // 新規追加
  tags?: string[]                 // 新規追加
  is_favorite?: boolean           // 新規追加
  created_at: string
  updated_at?: string             // 新規追加
}

// 分析タイプの表示名マッピング
export const ANALYSIS_TYPE_NAMES = {
  clarity: 'モヤモヤ分析',
  strengths: '強み分析', 
  career: 'キャリアパス分析',
  values: '価値観分析',
  persona: '人物像分析'
} as const

// 分析結果の概要抽出用ヘルパー
export function getAnalysisSummary(result: Record<string, any>): string {
  // resultオブジェクトから要約を安全に抽出
  if (result.summary) return result.summary
  if (result.conclusion) return result.conclusion
  if (result.main_points && Array.isArray(result.main_points)) {
    return result.main_points.slice(0, 2).join('、')
  }
  return '分析結果を確認'
}
