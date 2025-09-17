export interface Profile {
  id: string
  email: string
  full_name: string | null
  age: number | null
  current_industry: string | null
  current_job_title: string | null
  current_skills: string[] | null
  current_annual_income: number | null
  target_industry: string | null
  target_job_title: string | null
  target_annual_income: number | null
  career_direction: 'management' | 'specialist' | null
  values_work_life_balance: number | null
  values_career_growth: number | null
  values_compensation: number | null
  values_autonomy: number | null
  values_impact: number | null
  onboarding_completed: boolean
  subscription_status: 'free' | 'premium'
  created_at: string
  updated_at: string
  last_name?: string | null
  first_name?: string | null
  last_name_kana?: string | null
  first_name_kana?: string | null
  occupation_category?: string | null
  occupation_detail?: string | null
  experience_years?: string | null
  motivation_reason?: string | null
  interests?: string[] | null
}

export interface AIAnalysis {
  id: string
  user_id: string
  analysis_type: 'confusion' | 'strength' | 'career_path' | 'values'
  input_data: any
  result: any
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  category: 'skill' | 'experience' | 'networking' | 'other'
  target_date: string | null
  status: 'active' | 'completed' | 'paused'
  priority: number
  created_at: string
  updated_at: string
  source?: string; // 'onboarding' | 'manual' | null
}

export interface Task {
  id: string
  user_id: string
  goal_id: string
  title: string
  description: string | null
  due_date: string | null
  completed: boolean
  completed_at: string | null
  estimated_hours: number | null;
  actual_hours: number | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string
  updated_at: string
}

export interface ProgressRecord {
  id: string
  user_id: string
  goal_id: string
  task_id: string | null
  progress_percentage: number
  notes: string | null
  recorded_at: string
}

export interface Reflection {
  id: string
  user_id: string
  reflection_type: 'weekly' | 'monthly' | 'goal_completion'
  content: any
  ai_feedback: any | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'reminder' | 'achievement' | 'weekly_check' | 'system'
  read: boolean
  scheduled_for: string | null
  created_at: string
}

// ユーザーアクティビティ（既存のテーブル構造に合わせて統一）
export interface UserActivity {
  id: string
  user_id: string
  activity_type: string  // データベースではtext型なので制限しない
  activity_data: Record<string, any> | null  // 実際のテーブルのカラム名に合わせる
  created_at: string
}

// AI人物像分析（既存のテーブル構造に合わせて修正）
export interface PersonaAnalysis {
  id: string
  user_id: string
  personality_traits: Record<string, any>  // 実際のテーブルではjsonb型
  behavioral_patterns: Record<string, any>  // 実際のテーブルのカラム名
  career_insights: Record<string, any>      // 実際のテーブルのカラム名
  recommendations: Record<string, any>      // 実際のテーブルのカラム名
  confidence_score: number                  // 実際のテーブルのカラム名
  analysis_version: string
  created_at: string
}

// 補助的な型定義（PersonaAnalysisの中身の構造を定義）
export interface PersonalityTrait {
  trait_name: string
  score: number // 0-100
  description: string
  evidence: string[]
}

export interface BehavioralPattern {
  pattern_name: string
  frequency: 'very_low' | 'low' | 'medium' | 'high' | 'very_high'
  description: string
  trend: 'improving' | 'stable' | 'declining'
}

export interface CareerInsight {
  insight_type: 'strength' | 'opportunity' | 'challenge' | 'recommendation'
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

// アクティビティトラッキング用の型定義
export type ActivityType = 
  | 'login' 
  | 'logout' 
  | 'goal_created' 
  | 'goal_completed' 
  | 'task_created' 
  | 'task_completed' 
  | 'ai_analysis_completed' 
  | 'profile_updated'
