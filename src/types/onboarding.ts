export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  optional?: boolean;
}

export interface OnboardingProgress {
  currentStep: number;
  totalSteps: number;
  completedSteps: string[];
  skippedSteps: string[];
}

export interface UserOnboarding {
  id: string;
  user_id: string;
  step: string;
  completed_at: string | null;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ProfileData {
  display_name: string;
  age_range: string;
  age: number;                 // 年齢
  occupation: string;
    // 職業（選択式+その他）
  occupation_category: string; // 職業カテゴリ
  occupation_detail?: string;  // その他の場合の詳細
  // きっかけ（キャリア目標から変更）
  motivation_reason: string;   // CareerCompassを始めたきっかけ
  experience_years: string;
  career_goals: string[];
  interests: string[];
  motivation: string;
  last_name: string;           // 姓
  first_name: string;          // 名
  last_name_kana: string;      // 姓（フリガナ）
  first_name_kana: string;     // 名（フリガナ）
  
}

export interface OnboardingState {
  step: number;
  profile: Partial<ProfileData>;
  hasTriedAnalysis: boolean;
  showPlanRecommendation: boolean;
  selectedPlan?: string;
}

export interface DatabaseProfile {
  id: string;
  email: string;
  full_name?: string;
  age?: number;
  current_industry?: string;
  current_job_title?: string;
  current_skills?: string[];
  current_annual_income?: number;
  target_industry?: string;
  target_job_title?: string;
  target_annual_income?: number;
  career_direction?: string;
  values_work_life_balance?: number;
  values_career_growth?: number;
  values_compensation?: number;
  values_autonomy?: number;
  values_impact?: number;
  onboarding_completed?: boolean;
  subscription_status?: string;
  created_at?: string;
  updated_at?: string;
}

// 既存goalsテーブル構造準拠の目標データ
export interface OnboardingGoal {
  id?: string;
  title: string;
  description?: string;
  category: string;      // 必須カラム
  target_date?: string;
  deadline?: string;     // オンボーディングUI用（target_dateに変換される）
  priority: number | string; // 1-5の数値または'high'/'medium'/'low'
  status?: string;       // デフォルト'active'
}