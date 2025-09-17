import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'goal_created' 
  | 'goal_completed' 
  | 'task_created' 
  | 'task_completed' 
  | 'ai_analysis_completed' 
  | 'profile_updated'

export async function trackActivity(
  userId: string, 
  activityType: ActivityType, 
  activityData: Record<string, any> = {}
): Promise<void> {
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

    await supabase
      .from('user_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData,  // metadataではなくactivity_dataを使用
        created_at: new Date().toISOString()
      })

  } catch (error) {
    console.error('Activity tracking error:', error)
    // エラーが発生してもメイン処理に影響しないよう、エラーをログ出力のみ
  }
}
