export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
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
          career_direction: string | null
          values_work_life_balance: number | null
          values_career_growth: number | null
          values_compensation: number | null
          values_autonomy: number | null
          values_impact: number | null
          onboarding_completed: boolean
          subscription_status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          age?: number | null
          current_industry?: string | null
          current_job_title?: string | null
          current_skills?: string[] | null
          current_annual_income?: number | null
          target_industry?: string | null
          target_job_title?: string | null
          target_annual_income?: number | null
          career_direction?: string | null
          values_work_life_balance?: number | null
          values_career_growth?: number | null
          values_compensation?: number | null
          values_autonomy?: number | null
          values_impact?: number | null
          onboarding_completed?: boolean
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          age?: number | null
          current_industry?: string | null
          current_job_title?: string | null
          current_skills?: string[] | null
          current_annual_income?: number | null
          target_industry?: string | null
          target_job_title?: string | null
          target_annual_income?: number | null
          career_direction?: string | null
          values_work_life_balance?: number | null
          values_career_growth?: number | null
          values_compensation?: number | null
          values_autonomy?: number | null
          values_impact?: number | null
          onboarding_completed?: boolean
          subscription_status?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
