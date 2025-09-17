import { createClient } from '@/lib/supabase'
import OpenAI from 'openai'
import type { PersonaAnalysis, PersonalityTrait, BehavioralPattern, CareerInsight } from '@/types/database'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export class PersonaAnalyzer {
  private supabase = createClient()

  async analyzeUserPersona(userId: string): Promise<PersonaAnalysis | null> {
    try {
      // 1. ユーザーデータを収集
      const userData = await this.collectUserData(userId)
      
      // 2. AI分析を実行
      const analysisResult = await this.runAIAnalysis(userData)
      
      // 3. 結果をデータベースに保存
      const savedAnalysis = await this.saveAnalysis(userId, analysisResult)
      
      return savedAnalysis
    } catch (error) {
      console.error('Persona analysis error:', error)
      return null
    }
  }

  private async collectUserData(userId: string) {
    const [
      profile,
      activities,
      analyses,
      goals,
      tasks
    ] = await Promise.all([
      // プロフィール情報
      this.supabase.from('profiles').select('*').eq('id', userId).single(),
      
      // 活動履歴（過去30日）
      this.supabase
        .from('user_activities')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
      
      // AI分析結果
      this.supabase.from('ai_analyses').select('*').eq('user_id', userId),
      
      // 目標データ
      this.supabase.from('goals').select('*').eq('user_id', userId),
      
      // タスクデータ
      this.supabase.from('tasks').select('*').eq('user_id', userId)
    ])

    return {
      profile: profile.data,
      activities: activities.data || [],
      analyses: analyses.data || [],
      goals: goals.data || [],
      tasks: tasks.data || []
    }
  }

  private async runAIAnalysis(userData: any) {
    const systemPrompt = `あなたはキャリアコンサルタントのAIです。ユーザーの行動データと分析結果を総合的に評価し、その人物の特性を分析してください。

以下のJSON形式で回答してください：
{
  "personality_traits": [
    {
      "trait_name": "特性名（例：目標志向性）",
      "score": 0-100の数値,
      "description": "特性の説明",
      "evidence": ["根拠1", "根拠2"]
    }
  ],
  "behavioral_patterns": [
    {
      "pattern_name": "パターン名",
      "frequency": "very_low|low|medium|high|very_high",
      "description": "パターンの説明",
      "trend": "improving|stable|declining"
    }
  ],
  "career_insights": [
    {
      "insight_type": "strength|opportunity|challenge|recommendation",
      "title": "洞察のタイトル",
      "description": "詳細説明",
      "priority": "low|medium|high"
    }
  ],
  "recommendations": ["おすすめアクション1", "おすすめアクション2"],
  "confidence_score": 0-100の信頼度
}`

    const userPrompt = `
ユーザーデータ分析：

【基本情報】
- 年齢: ${userData.profile?.age || '未設定'}
- 業界: ${userData.profile?.current_industry || '未設定'}
- 職種: ${userData.profile?.current_job_title || '未設定'}
- サブスク状況: ${userData.profile?.subscription_status || 'free'}

【活動パターン】
- 過去30日のログイン回数: ${userData.activities.filter((a: any) => a.activity_type === 'login').length}回
- タスク作成数: ${userData.activities.filter((a: any) => a.activity_type === 'task_created').length}個
- タスク完了数: ${userData.activities.filter((a: any) => a.activity_type === 'task_completed').length}個
- 分析完了数: ${userData.analyses.length}個

【目標設定状況】
- 設定済み目標数: ${userData.goals.length}個
- 完了した目標数: ${userData.goals.filter((g: any) => g.status === 'completed').length}個

【タスク管理状況】
- 総タスク数: ${userData.tasks.length}個
- 完了タスク数: ${userData.tasks.filter((t: any) => t.completed).length}個
- 完了率: ${userData.tasks.length > 0 ? Math.round((userData.tasks.filter((t: any) => t.completed).length / userData.tasks.length) * 100) : 0}%

【AI分析結果サマリー】
${userData.analyses.map((analysis: any) => 
  `- ${analysis.analysis_type}: ${JSON.stringify(analysis.result).substring(0, 200)}...`
).join('\n')}

上記のデータを基に、このユーザーの人物特性、行動パターン、キャリア洞察を分析してください。
`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2500,
    })

    const result = completion.choices[0]?.message?.content
    if (!result) {
      throw new Error('AI分析結果を取得できませんでした')
    }

    return JSON.parse(result)
  }

  private async saveAnalysis(userId: string, analysisResult: any): Promise<PersonaAnalysis> {
    const { data, error } = await this.supabase
      .from('persona_analyses')
      .insert({
        user_id: userId,
        personality_traits: analysisResult.personality_traits,
        behavioral_patterns: analysisResult.behavioral_patterns,
        career_insights: analysisResult.career_insights,
        recommendations: analysisResult.recommendations,
        confidence_score: analysisResult.confidence_score,
        analysis_version: '1.0'
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  }

  async getLatestPersonaAnalysis(userId: string): Promise<PersonaAnalysis | null> {
    const { data } = await this.supabase
      .from('persona_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return data
  }
}

export const personaAnalyzer = new PersonaAnalyzer()
