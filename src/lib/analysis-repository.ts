import { createClient } from '@/lib/supabase'
import { SubscriptionManager } from '@/lib/subscription'
import type { AnalysisResult } from '@/types/analysis'

export class AnalysisRepository {
  private supabase = createClient()
  private subscriptionManager = new SubscriptionManager()

  // 既存メソッド
  async getAnalysesByUser(userId: string, limit = 50): Promise<AnalysisResult[]> {
    const { data, error } = await this.supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data || []
  }

  async getAnalysesByType(
    userId: string, 
    analysisType: AnalysisResult['analysis_type']
  ): Promise<AnalysisResult[]> {
    const { data, error } = await this.supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', userId)
      .eq('analysis_type', analysisType)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async getAnalysisById(id: string, userId: string): Promise<AnalysisResult | null> {
    const { data, error } = await this.supabase
      .from('ai_analyses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (error) return null
    return data
  }

  async toggleFavorite(id: string, userId: string): Promise<boolean> {
    const analysis = await this.getAnalysisById(id, userId)
    if (!analysis) return false

    const { error } = await this.supabase
      .from('ai_analyses')
      .update({ 
        is_favorite: !analysis.is_favorite,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)

    return !error
  }

  async updateTitle(id: string, userId: string, title: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('ai_analyses')
      .update({ 
        title: title.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId)

    return !error
  }

  // 新規追加メソッド
  /**
   * 分析結果の保存（プラン制限考慮）
   */
  async saveAnalysisResult(
    userId: string,
    analysisType: string,
    inputData: Record<string, any>,
    result: Record<string, any>,
    title?: string
  ): Promise<{ success: boolean; analysis?: AnalysisResult; error?: string }> {
    try {
      // プラン情報とデータ保持期限をチェック
      const { canSave } = await this.subscriptionManager.canSaveAnalysis(userId)
      
      if (!canSave) {
        return {
          success: false,
          error: 'save_not_allowed',
        }
      }

      // 期限切れデータのクリーンアップ
      await this.subscriptionManager.cleanupExpiredAnalyses(userId)

      // タイトル自動生成
      const analysisTitle = title || this.generateDefaultTitle(analysisType)

      // 分析結果を保存
      const { data, error } = await this.supabase
        .from('ai_analyses')
        .insert({
          user_id: userId,
          analysis_type: analysisType,
          input_data: inputData,
          result: result,
          title: analysisTitle,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      return { success: true, analysis: data }
    } catch (error) {
      console.error('Error saving analysis:', error)
      return { success: false, error: 'save_failed' }
    }
  }

  /**
   * 分析前のプラン・使用量チェック
   */
  async checkAnalysisEligibility(
    userId: string, 
    analysisType: string
  ): Promise<{
    canAnalyze: boolean
    reason?: 'limit_exceeded' | 'plan_required' | 'ticket_required'
    usageInfo?: { used: number; limit: number }
    ticketPrice?: number
  }> {
    return await this.subscriptionManager.checkAnalysisEligibility(userId, analysisType)
  }

  /**
   * デフォルトタイトル生成
   */
  private generateDefaultTitle(analysisType: string): string {
    const typeNames = {
      clarity: 'モヤモヤ分析',
      strengths: '強み分析',
      career: 'キャリアパス分析',
      values: '価値観分析',
      persona: '人物像分析'
    }
    
    const typeName = typeNames[analysisType as keyof typeof typeNames] || '分析'
    const date = new Date().toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    })
    
    return `${typeName} - ${date}`
  }
}
