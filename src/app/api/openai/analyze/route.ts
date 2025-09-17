import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { trackActivity } from '@/utils/activity-tracker'
import { SubscriptionManager } from '@/lib/subscription'
import { TicketManager } from '@/lib/tickets'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    console.log('=== OpenAI API Debug Start ===')
    console.log('API Key configured:', !!process.env.OPENAI_API_KEY)
    // 【修正】型安全な方法でAPI Key prefixを取得
    const apiKey = process.env.OPENAI_API_KEY
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 7) + '...' : 'undefined')

    const { analysis_type, input_data, user_id } = await request.json()

    if (!analysis_type || !input_data || !user_id) {
      return NextResponse.json(
        createErrorResponse('INVALID_REQUEST', '必要なパラメータが不足しています。'),
        { status: 400 }
      )
    }

    console.log('Request params:', { analysis_type, user_id, input_data_keys: Object.keys(input_data) })

    // ユーザー情報を取得
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single()

    console.log('User profile loaded:', { 
      subscription_status: profile?.subscription_status || 'not_found',
      user_exists: !!profile 
    })

    // 【改良】分析実行権限チェック（詳細エラーレスポンス追加）
    const subscriptionManager = new SubscriptionManager()
    let usedTicket = false
    
    try {
      console.log('=== Subscription Check Start ===')
      console.log('Checking eligibility for:', { user_id, analysis_type })
      
      const eligibility = await subscriptionManager.checkAnalysisEligibility(user_id, analysis_type)
      
      console.log('Eligibility result:', {
        canAnalyze: eligibility.canAnalyze,
        reason: eligibility.reason,
        ticketPrice: eligibility.ticketPrice,
        usageInfo: eligibility.usageInfo
      })
      
      if (!eligibility.canAnalyze) {
        console.log('Analysis not allowed, reason:', eligibility.reason)
        
        if (eligibility.reason === 'ticket_required') {
          console.log('Attempting to use ticket...')
          // チケット使用を試行
          const ticketManager = new TicketManager()
          const ticketType = analysis_type === 'persona' ? 'analysis_persona' : 'analysis_normal'
          
          console.log('Ticket type required:', ticketType)
          const ticketUsed = await ticketManager.useTicket(user_id, ticketType)
          console.log('Ticket usage result:', ticketUsed)
          
          if (!ticketUsed) {
            console.log('=== Returning 402: Ticket Required ===')
            
            // 【新規追加】詳細なエラーレスポンス
            const errorResponse = createDetailedErrorResponse(
              analysis_type, 
              eligibility.reason, 
              eligibility.usageInfo,
              eligibility.ticketPrice
            )
            
            return NextResponse.json(errorResponse, { status: 402 })
          }
          
          usedTicket = true
          console.log('Ticket used successfully, proceeding with analysis')
        } else {
          console.log('=== Returning 403: Subscription Limit ===')
          
          // 【新規追加】詳細なエラーレスポンス
          const errorResponse = createDetailedErrorResponse(
            analysis_type, 
            eligibility.reason, 
            eligibility.usageInfo,
            eligibility.ticketPrice
          )
          
          return NextResponse.json(errorResponse, { status: 403 })
        }
      } else {
        console.log('Analysis allowed, incrementing usage...')
        // 通常の制限内使用量を増加
        await subscriptionManager.incrementUsage(user_id, `analysis_${analysis_type}`)
        console.log('Usage incremented successfully')
      }
      
      console.log('=== Subscription Check End - Passed ===')
    } catch (subscriptionError) {
      console.error('=== Subscription Check Error ===')
      console.error('Subscription error details:', subscriptionError)
      console.error('Error message:', subscriptionError instanceof Error ? subscriptionError.message : 'Unknown error')
      console.error('Error stack:', subscriptionError instanceof Error ? subscriptionError.stack : 'No stack')
      
      // 【修正】サブスクリプションエラーの場合は一時的にスキップ
      console.log('Subscription check failed, proceeding without restrictions (fallback mode)')
    }

    // 分析タイプに応じてプロンプトを生成
    const systemPrompt = getSystemPrompt(analysis_type)
    const userPrompt = generateUserPrompt(analysis_type, input_data, profile)

    console.log('Generated prompts - System prompt length:', systemPrompt.length)
    console.log('Generated prompts - User prompt length:', userPrompt.length)

    // 【改良】OpenAI APIで分析実行（詳細なエラーハンドリング追加）
    console.log('Calling OpenAI API...')
    let completion
    try {
      completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      })
      console.log('OpenAI API call successful')
    } catch (openaiError: any) {
      console.error('=== OpenAI API Error Details ===')
      console.error('Status:', openaiError.status)
      console.error('Code:', openaiError.code)
      console.error('Type:', openaiError.type)
      console.error('Message:', openaiError.message)
      console.error('Full error object:', openaiError)

      // 【改良】具体的なエラーメッセージを返す
      if (openaiError.status === 402) {
        return NextResponse.json(
          createErrorResponse(
            'OPENAI_PAYMENT_REQUIRED',
            'OpenAI APIのクレジット不足です。管理者にお問い合わせください。',
            [{
              type: 'contact',
              label: 'サポートに問い合わせ',
              url: '/contact',
              primary: true
            }]
          ),
          { status: 502 }
        )
      } else if (openaiError.status === 401) {
        return NextResponse.json(
          createErrorResponse(
            'OPENAI_UNAUTHORIZED', 
            'OpenAI APIキーが無効です。しばらく時間をおいて再度お試しください。',
            [{
              type: 'contact',
              label: 'サポートに問い合わせ',
              url: '/contact',
              primary: true
            }]
          ),
          { status: 500 }
        )
      } else if (openaiError.status === 429) {
        return NextResponse.json(
          createErrorResponse(
            'OPENAI_RATE_LIMIT',
            'API使用量制限に達しました。しばらく待ってから再試行してください。',
            [{
              type: 'wait',
              label: '少し待って再試行',
              description: '数分後に再度お試しください'
            }]
          ),
          { status: 429 }
        )
      } else {
        throw openaiError // 他のエラーは元の処理に任せる
      }
    }

    const analysisResult = completion.choices[0]?.message?.content

    if (!analysisResult) {
      console.error('No analysis result received from OpenAI')
      return NextResponse.json(
        createErrorResponse(
          'ANALYSIS_FAILED',
          '分析結果を取得できませんでした。しばらく時間をおいて再度お試しください。',
          [{
            type: 'contact',
            label: 'サポートに問い合わせ',
            url: '/contact',
            primary: true
          }]
        ),
        { status: 500 }
      )
    }

    console.log('Analysis result length:', analysisResult.length)

    // JSONパースを試行
    let parsedResult
    let cleanResult = '' // 【修正】スコープを外に移動

    try {
      // 【修正】markdownコードブロックを除去してからパース
      cleanResult = analysisResult.trim()
      
      // ```json で始まる場合の処理
      if (cleanResult.startsWith('```json')) {
        cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```$/, '')
      }
      // ``` で始まる場合の処理（言語指定なし）
      else if (cleanResult.startsWith('```')) {
        cleanResult = cleanResult.replace(/^```\s*/, '').replace(/\s*```$/, '')
      }
      
      // JSONをパース
      parsedResult = JSON.parse(cleanResult)
      console.log('✅ JSON parsing successful')
      console.log('Parsed result keys:', Object.keys(parsedResult))
      
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError)
      console.log('Raw result preview:', analysisResult.substring(0, 300) + '...')
      console.log('Cleaned result preview:', cleanResult ? cleanResult.substring(0, 300) + '...' : 'undefined')
      
      // 最後の手段：正規表現でJSONブロックを抽出
      try {
        const jsonMatch = analysisResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
          console.log('✅ JSON extraction successful via regex');
        } else {
          throw new Error('No JSON block found');
        }
      } catch (regexError) {
        console.error('❌ JSON extraction also failed:', regexError);
        parsedResult = getDefaultResult(analysis_type);
        console.log('📄 Using default result due to parsing failure');
      }
    }



    // 【修正】分析結果の保存可否チェック
    let savedAnalysis = null
    try {
      const { canSave } = await subscriptionManager.canSaveAnalysis(user_id)
      
      if (canSave) {
        // 結果をデータベースに保存
        const { data: analysis, error: saveError } = await supabase
          .from('ai_analyses')
          .insert({
            user_id,
            analysis_type,
            input_data,
            result: parsedResult,
          })
          .select()
          .single()

        if (saveError) {
          console.error('Save error:', saveError)
          // 保存エラーは分析結果に影響しないよう、ログ出力のみ
        } else {
          savedAnalysis = analysis
          console.log('Analysis saved successfully, ID:', analysis.id)
        }
      } else {
        console.log('Analysis not saved due to subscription limits')
      }
    } catch (saveError) {
      console.error('Save capability check error:', saveError)
      // 保存機能チェックエラーは分析結果に影響しないよう、ログ出力のみ
    }

    // AI分析完了をトラッキング（既存部分）
    try {
      await trackActivity(user_id, 'ai_analysis_completed', {
        analysis_type,
        analysis_id: savedAnalysis?.id || 'not_saved',
        input_data_length: JSON.stringify(input_data).length,
        result_length: JSON.stringify(parsedResult).length,
        completion_time: new Date().toISOString(),
        used_ticket: usedTicket, // 【新規追加】チケット使用情報
        saved: !!savedAnalysis // 【新規追加】保存状況
      })
      console.log('Activity tracking completed')
    } catch (trackError) {
      // トラッキングエラーは分析結果に影響しないよう、ログ出力のみ
      console.error('Activity tracking error:', trackError)
    }

    console.log('=== OpenAI API Debug End - Success ===')

    // 【修正】レスポンス形式を統一（既存UIとの互換性保持）
    if (savedAnalysis) {
      // 既存の形式を維持
      return NextResponse.json(savedAnalysis)
    } else {
      // 保存されていない場合は結果のみ返す
      return NextResponse.json({
        id: null,
        user_id,
        analysis_type,
        input_data,
        result: parsedResult,
        created_at: new Date().toISOString(),
        saved: false,
        used_ticket: usedTicket
      })
    }

  } catch (error: any) {
    console.error('=== Analysis Error ===')
    console.error('Error type:', typeof error)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    console.error('Full error object:', error)

    // 【改良】より詳細なエラーレスポンス
    return NextResponse.json(
      createErrorResponse(
        'INTERNAL_ERROR',
        '分析中にエラーが発生しました。しばらく時間をおいて再度お試しください。',
        [{
          type: 'contact',
          label: 'サポートに問い合わせ',
          url: '/contact',
          primary: true
        }]
      ),
      { status: 500 }
    )
  }
}

  // 【修正】詳細エラーレスポンス生成関数
  function createDetailedErrorResponse(
    analysisType: string, 
    reason: string | undefined,  // ← undefinedも受け入れる
    usageInfo: any,
    ticketPrice?: number
  ) {
    const analysisName = getAnalysisTypeName(analysisType)
    const errorReason = reason || 'unknown'  // ← undefinedの場合のフォールバック
    
    switch (errorReason) {
      case 'subscription_limit':
        return createErrorResponse(
          'SUBSCRIPTION_LIMIT_REACHED',
          `${analysisName}分析の月間利用上限に達しました。プランのアップグレードをご検討ください。`,
          [
            {
              type: 'upgrade',
              label: 'プランをアップグレード',
              url: '/pricing',
              primary: true
            }
          ],
          {
            analysisType: analysisName,
            currentUsage: usageInfo?.used || 0,
            limit: usageInfo?.limit || 0,
            resetDate: getNextMonthDate()
          }
        )

      case 'ticket_required':
        return createErrorResponse(
          'TICKET_REQUIRED',
          `${analysisName}分析にはチケットが必要です。チケットを購入するかプランをアップグレードしてください。`,
          [
            {
              type: 'purchase',
              label: 'チケットを購入',
              url: '/tickets',
              primary: true
            },
            {
              type: 'upgrade',
              label: 'プランをアップグレード',
              url: '/pricing'
            }
          ],
          {
            analysisType: analysisName,
            ticketPrice: ticketPrice || 100,
            currentUsage: usageInfo?.used || 0,
            limit: usageInfo?.limit || 0
          }
        )

      case 'daily_limit':
        return createErrorResponse(
          'DAILY_LIMIT_REACHED',
          `${analysisName}分析の1日の利用上限に達しました。明日再度お試しいただくか、プランのアップグレードをご検討ください。`,
          [
            {
              type: 'wait',
              label: '明日再試行',
              description: `${getTomorrowDate()}にリセットされます`
            },
            {
              type: 'upgrade',
              label: 'プランをアップグレード',
              url: '/pricing'
            }
          ],
          {
            analysisType: analysisName,
            currentUsage: usageInfo?.used || 0,
            limit: usageInfo?.limit || 0,
            resetTime: getTomorrowDate()
          }
        )

      default:
        return createErrorResponse(
          'USAGE_LIMIT_EXCEEDED',
          `現在${analysisName}分析をご利用いただけません。サポートまでお問い合わせください。`,
          [
            {
              type: 'contact',
              label: 'サポートに問い合わせ',
              url: '/contact',
              primary: true
            }
          ]
        )
    }
  }


// 【新規追加】汎用エラーレスポンス生成関数
function createErrorResponse(
  code: string, 
  message: string, 
  actions?: any[], 
  details?: any
) {
  return {
    error: code.toLowerCase().replace(/_/g, '_'),
    code,
    title: getErrorTitle(code),
    message,
    actions: actions || [],
    details: details || {},
    // 既存形式との互換性のため
    requires_ticket: code === 'TICKET_REQUIRED',
    ticket_price: details?.ticketPrice,
    usage_info: details
  }
}

// 【新規追加】エラータイトル取得
function getErrorTitle(code: string): string {
  const titles: Record<string, string> = {
    'SUBSCRIPTION_LIMIT_REACHED': '月間利用上限に達しました',
    'TICKET_REQUIRED': 'チケットが必要です',
    'DAILY_LIMIT_REACHED': '1日の利用上限に達しました',
    'OPENAI_PAYMENT_REQUIRED': 'システムエラー',
    'OPENAI_UNAUTHORIZED': 'システムエラー',
    'OPENAI_RATE_LIMIT': '一時的な制限',
    'ANALYSIS_FAILED': '分析に失敗しました',
    'INTERNAL_ERROR': 'システムエラー',
    'INVALID_REQUEST': 'リクエストエラー'
  }
  return titles[code] || 'エラーが発生しました'
}

// 【新規追加】ヘルパー関数
function getNextMonthDate(): string {
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  return nextMonth.toLocaleDateString('ja-JP')
}

function getTomorrowDate(): string {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toLocaleDateString('ja-JP')
}

// 【新規追加】分析種別名の取得
function getAnalysisTypeName(analysisType: string): string {
  const names = {
    clarity: 'モヤモヤ',
    strengths: '強み',
    career: 'キャリアパス',
    values: '価値観',
    persona: '人物像'
  }
  
  return names[analysisType as keyof typeof names] || '分析'
}

// 以下は既存コード（変更なし）
function getSystemPrompt(analysisType: string): string {
  const prompts = {
    clarity: `あなたはプロフェッショナルなキャリアコンサルタントのAIです。ユーザーのキャリアのモヤモヤを分析し、明確な洞察と、気づきのある示唆を提供してください。

分析結果は以下のJSON形式で返してください：
{
  "clarity_score": 数値(0-100),
  "main_concerns": ["主な関心事1", "主な関心事2", ...],
  "insights": ["洞察1", "洞察2", ...],
  "recommendations": ["おすすめアクション1", "おすすめアクション2", ...],
  "next_steps": ["次のステップ1", "次のステップ2", ...]
}`,

    strengths: `あなたはプロフェッショナルなキャリアコンサルタントのAIです。ユーザーの強みを多角的に分析し、示唆に富んだキャリア活用法を提案してユーザーに気づきを与えてください。

分析結果は以下のJSON形式で返してください：
{
  "strength_score": 数値(0-100),
  "core_strengths": ["コア強み1", "コア強み2", ...],
  "hidden_strengths": ["隠れた強み1", "隠れた強み2", ...],
  "development_areas": ["成長領域1", "成長領域2", ...],
  "strength_applications": ["活用法1", "活用法2", ...],
  "career_advantages": ["キャリア優位性1", "キャリア優位性2", ...]
}`,

    career: `あなたはプロフェッショナルなキャリアコンサルタントのAIです。ユーザーに最適なキャリアパスを分析し、示唆に富んで気づきを与えるような具体的な提案をしてください。

分析結果は以下のJSON形式で返してください：
{
  "compatibility_score": 数値(0-100),
  "recommended_paths": [
    {
      "title": "キャリアパス名",
      "description": "説明",
      "timeline": "期間",
      "required_skills": ["スキル1", "スキル2", ...],
      "growth_potential": 数値(0-100)
    }
  ],
  "skill_gaps": ["スキルギャップ1", "スキルギャップ2", ...],
  "next_milestones": ["マイルストーン1", "マイルストーン2", ...],
  "industry_insights": ["業界洞察1", "業界洞察2", ...]
}`,

    values: `あなたは経験豊富なキャリアコンサルタントのAIです。ユーザーの価値観を分析し、示唆に富んだキャリア指針を提供してユーザーに気づきを与えてください。

分析結果は以下のJSON形式で返してください：
{
  "alignment_score": 数値(0-100),
  "core_values": [
    {
      "name": "価値観名",
      "description": "説明",
      "strength": 数値(0-100),
      "career_impact": "キャリアへの影響"
    }
  ],
  "value_conflicts": ["衝突要因1", "衝突要因2", ...],
  "recommendations": ["おすすめアクション1", "おすすめアクション2", ...],
  "ideal_work_environment": ["理想環境1", "理想環境2", ...],
  "career_decisions": ["決定指針1", "決定指針2", ...]
}`
  }

  return prompts[analysisType as keyof typeof prompts] || prompts.clarity
}

function generateUserPrompt(analysisType: string, inputData: any, profile: any): string {
  const baseInfo = profile ? `
ユーザー情報：
- 年齢: ${profile.age || '未設定'}
- 現在の業界: ${profile.current_industry || '未設定'}
- 現在の職種: ${profile.current_job_title || '未設定'}
- 現在の年収: ${profile.current_annual_income || '未設定'}万円
- 目標業界: ${profile.target_industry || '未設定'}
- 目標職種: ${profile.target_job_title || '未設定'}
- 目標年収: ${profile.target_annual_income || '未設定'}万円
` : ''

  const prompts = {
    clarity: `${baseInfo}

モヤモヤ分析のための回答：
- 現在の状況: ${inputData.current_situation}
- 主な悩み: ${inputData.main_concerns}
- 理想の未来: ${inputData.ideal_future}
- 障害・課題: ${inputData.obstacles}
- 価値観の優先順位: ${inputData.values_priority}

上記の情報を基に、ユーザーのキャリア明確度を分析し、具体的な洞察とアクションプランを提供して気づきを与えてください。`,

    strengths: `${baseInfo}

強み分析のための回答：
- 過去の成果: ${inputData.achievements}
- 自信のあるスキル: ${inputData.skills_confidence}
- 他者からの評価: ${inputData.feedback_received}
- 自然にできること: ${inputData.natural_talents}
- エネルギーの源泉: ${inputData.energy_sources}
- 問題解決アプローチ: ${inputData.problem_solving}

上記の情報を基に、ユーザーの強みを多角的に分析し、示唆に富んだキャリアでの活用法を提案して気づきを与えてください。`,

   career: `${baseInfo}

キャリアパス分析のための回答：
- 現在の役割: ${inputData.current_role}
- キャリア目標: ${inputData.career_goals}
- 興味のある業界: ${inputData.preferred_industries}
- 理想の働き方: ${inputData.work_style}
- タイムライン: ${inputData.timeline_expectations}
- 学びたいスキル: ${inputData.skill_interests}

上記の情報を基に、最適なキャリアパスを2-3つ提案し、具体的なロードマップを作成して気づきを与えてください。`,

    values: `${baseInfo}

価値観分析のための回答：
- やりがいを感じる要因: ${inputData.motivating_factors}
- ストレスを感じる要因: ${inputData.demotivating_factors}
- 理想の職場環境: ${inputData.ideal_workplace}
- 意思決定の基準: ${inputData.decision_criteria}
- 人生の優先順位: ${inputData.life_priorities}
- 満足度の要因: ${inputData.satisfaction_factors}

上記の情報を基に、ユーザーの価値観を分析し、キャリア選択の指針を提供して気づきを与えてください。`
  }

  return prompts[analysisType as keyof typeof prompts] || prompts.clarity
}

function getDefaultResult(analysisType: string): any {
  const defaults = {
    clarity: {
      clarity_score: 60,
      main_concerns: ["キャリアの方向性が不明確", "将来への不安"],
      insights: ["現状の整理が必要", "目標設定が重要"],
      recommendations: ["自己分析を深める", "情報収集を行う"],
      next_steps: ["価値観を明確にする", "スキルアップ計画を立てる"]
    },
    strengths: {
      strength_score: 65,
      core_strengths: ["コミュニケーション能力", "問題解決能力"],
      hidden_strengths: ["リーダーシップの素質", "創造性"],
      development_areas: ["技術スキルの向上", "マネジメント経験"],
      strength_applications: ["チームプロジェクトで活用", "メンター役を担う"],
      career_advantages: ["多様な職種に適応可能", "チーム貢献度が高い"]
    },
   career: {
      compatibility_score: 70,
      recommended_paths: [{
        title: "スペシャリスト路線",
        description: "専門性を深めるキャリア",
        timeline: "2-3年",
        required_skills: ["専門知識", "業界経験"],
        growth_potential: 80
      }],
      skill_gaps: ["専門資格の取得", "実務経験の蓄積"],
      next_milestones: ["スキル習得", "実績作り"],
      industry_insights: ["需要が安定している", "成長分野"]
    },
    values: {
      alignment_score: 65,
      core_values: [{
        name: "成長",
        description: "継続的な学習と発展",
        strength: 85,
        career_impact: "新しい挑戦を求める"
      }],
      value_conflicts: ["安定性と挑戦のバランス"],
      recommendations: ["価値観に合う職場を選ぶ"],
      ideal_work_environment: ["学習機会がある", "成長を支援する"],
      career_decisions: ["価値観を優先する", "長期的視点で判断する"]
    }
  }

  return defaults[analysisType as keyof typeof defaults] || defaults.clarity
}
