import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 既存の人物像分析をチェック
    const { data: existingAnalysis } = await supabase
      .from('persona_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // 7日以内の分析がある場合はそれを返す
    if (existingAnalysis) {
      const analysisDate = new Date(existingAnalysis.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      
      if (analysisDate > weekAgo) {
        return NextResponse.json(existingAnalysis)
      }
    }

    // ユーザーのアクティビティデータを取得
    const { data: activities } = await supabase
      .from('user_activities')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    // AI分析データを取得
    const { data: analyses } = await supabase
      .from('ai_analyses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)

    // ユーザープロフィールを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // 目標とタスクデータを取得
    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // データが不足している場合
    if (!activities?.length && !analyses?.length && !goals?.length && !tasks?.length) {
      return NextResponse.json({
        error: 'insufficient_data',
        message: 'アプリの使用データが不足しています。もう少しアプリを使用してから再度お試しください。'
      }, { status: 400 })
    }

    // AI分析用のプロンプト作成
    const analysisPrompt = createPersonaAnalysisPrompt({
      activities,
      analyses,
      profile,
      goals,
      tasks
    })

    // OpenAI APIで人物像分析
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `あなたはキャリアコンサルタントのAIです。ユーザーの行動データを分析し、人物像を推論してください。

回答は以下のJSON形式で返してください：
{
  "personality_traits": {
    "summary": "性格特性のサマリー",
    "traits": ["特性1", "特性2", "特性3"]
  },
  "behavioral_patterns": {
    "patterns": ["パターン1", "パターン2", "パターン3"],
    "working_style": "働き方の特徴"
  },
  "career_insights": {
    "summary": "キャリア洞察のサマリー",
    "insights": ["洞察1", "洞察2", "洞察3"],
    "inclinations": ["傾向1", "傾向2"]
  },
  "recommendations": {
    "actions": ["推奨アクション1", "推奨アクション2", "推奨アクション3"],
    "growth_areas": ["成長領域1", "成長領域2"]
  }
}`
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })

    const analysisResult = completion.choices[0]?.message?.content

    if (!analysisResult) {
      return NextResponse.json({ error: '分析結果を生成できませんでした' }, { status: 500 })
    }

    let parsedResult
    try {
      parsedResult = JSON.parse(analysisResult)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      // パースに失敗した場合はデフォルト結果
      parsedResult = getDefaultPersonaResult()
    }

    // 信頼度スコアを計算
    const confidenceScore = calculateConfidenceScore({
      activities,
      analyses,
      goals,
      tasks
    })

    // 結果をデータベースに保存
    const { data: savedAnalysis, error: saveError } = await supabase
      .from('persona_analyses')
      .insert({
        user_id: user.id,
        personality_traits: parsedResult.personality_traits,
        behavioral_patterns: parsedResult.behavioral_patterns,
        career_insights: parsedResult.career_insights,
        recommendations: parsedResult.recommendations,
        confidence_score: confidenceScore,
        analysis_version: '1.0'
      })
      .select()
      .single()

    if (saveError) {
      console.error('Save error:', saveError)
      return NextResponse.json({ error: '分析結果の保存に失敗しました' }, { status: 500 })
    }

    return NextResponse.json(savedAnalysis)

  } catch (error) {
    console.error('Persona analysis error:', error)
    return NextResponse.json(
      { error: '人物像分析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}

function createPersonaAnalysisPrompt(data: any): string {
  const { activities, analyses, profile, goals, tasks } = data

  return `
ユーザーの行動データを分析してください：

## プロフィール情報
${profile ? `
- 年齢: ${profile.age || '未設定'}
- 現在の業界: ${profile.current_industry || '未設定'}
- 現在の職種: ${profile.current_job_title || '未設定'}
- キャリア方向性: ${profile.career_direction || '未設定'}
- 価値観スコア:
  - ワークライフバランス: ${profile.values_work_life_balance || 0}/10
  - キャリア成長: ${profile.values_career_growth || 0}/10
  - 報酬: ${profile.values_compensation || 0}/10
  - 自律性: ${profile.values_autonomy || 0}/10
  - インパクト: ${profile.values_impact || 0}/10
` : '未設定'}

## アクティビティ履歴 (最新50件)
${activities?.map((activity: any) => 
  `- ${activity.activity_type}: ${JSON.stringify(activity.activity_data)}`
).join('\n') || 'データなし'}

## AI分析履歴 (最新10件)
${analyses?.map((analysis: any) => 
  `- ${analysis.analysis_type}: 入力${JSON.stringify(analysis.input_data).length}文字, 結果${JSON.stringify(analysis.result).length}文字`
).join('\n') || 'データなし'}

## 目標設定履歴
${goals?.map((goal: any) => 
  `- ${goal.title} (${goal.status}): ${goal.description || ''}`
).join('\n') || 'データなし'}

## タスク履歴
${tasks?.map((task: any) => 
  `- ${task.title} (${task.status}): ${task.description || ''}`
).join('\n') || 'データなし'}

上記のデータから、このユーザーの人物像、働き方の特徴、キャリア傾向を分析し、具体的な推奨アクションを提案してください。
  `
}

function calculateConfidenceScore(data: any): number {
  const { activities, analyses, goals, tasks } = data
  
  let score = 0
  
  // アクティビティの多様性と量
  if (activities?.length) {
    score += Math.min(activities.length * 2, 30)
    const uniqueTypes = new Set(activities.map((a: any) => a.activity_type))
    score += uniqueTypes.size * 5
  }
  
  // AI分析の完了数
  if (analyses?.length) {
    score += analyses.length * 8
  }
  
  // 目標設定の有無
  if (goals?.length) {
    score += Math.min(goals.length * 5, 20)
  }
  
  // タスク実行の有無
  if (tasks?.length) {
    score += Math.min(tasks.length * 3, 15)
  }
  
  return Math.min(score, 100)
}

function getDefaultPersonaResult() {
  return {
    personality_traits: {
      summary: "データ不足のため、詳細な分析ができません。より多くのアプリ使用により精度が向上します。",
      traits: ["学習意欲", "向上心", "計画性"]
    },
    behavioral_patterns: {
      patterns: ["目標志向", "継続的改善", "自己成長重視"],
      working_style: "計画的で継続的な取り組みを好む"
    },
    career_insights: {
      summary: "キャリア成長への意識が高く、自己改善に積極的です。",
      insights: ["自己分析への関心が高い", "キャリア向上への意欲がある"],
      inclinations: ["専門性向上", "スキルアップ"]
    },
    recommendations: {
      actions: ["継続的な学習", "明確な目標設定", "定期的な振り返り"],
      growth_areas: ["専門スキル向上", "キャリアプランニング"]
    }
  }
}
