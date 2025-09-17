import { createClient } from '@/lib/supabase';
import type { OnboardingProgress, ProfileData, UserOnboarding } from '@/types/onboarding';

const supabase = createClient();

export class OnboardingManager {
  static async getProgress(userId: string): Promise<OnboardingProgress | null> {
    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const steps = [
        'welcome',
        'profile',
        'trial_analysis',
        'plan_selection',
        'goal_setting',
        'complete'
      ];

      const completedSteps = data?.map((d: any) => d.step) || [];
      const currentStepIndex = completedSteps.length < steps.length 
        ? completedSteps.length 
        : steps.length - 1;

      return {
        currentStep: currentStepIndex,
        totalSteps: steps.length,
        completedSteps,
        skippedSteps: data?.filter((d: any) => d.data?.skipped).map((d: any) => d.step) || []
      };
    } catch (error) {
      console.error('Error getting onboarding progress:', error);
      return null;
    }
  }

  static async completeStep(
    userId: string, 
    step: string, 
    data: Record<string, any> = {}
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: userId,
          step,
          completed_at: new Date().toISOString(),
          data,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,step'
        });

      if (error) throw error;

      // プロフィール情報の場合は profiles テーブルも更新
      if (step === 'profile' && data.profile) {
        await this.updateProfile(userId, data.profile);
      }

      // 完了ステップの場合は onboarding_completed フラグを更新
      if (step === 'complete') {
        await this.markOnboardingComplete(userId);
      }

      return true;
    } catch (error) {
      console.error('Error completing onboarding step:', error);
      return false;
    }
  }

  // 新しいプロフィールデータ構造に対応した更新処理
  static async updateProfile(userId: string, profileData: Partial<ProfileData>): Promise<boolean> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString()
      };
      
      // 新しいフィールド（優先）
      if (profileData.last_name) {
        updateData.last_name = profileData.last_name;
      }
      if (profileData.first_name) {
        updateData.first_name = profileData.first_name;
      }
      if (profileData.last_name_kana) {
        updateData.last_name_kana = profileData.last_name_kana;
      }
      if (profileData.first_name_kana) {
        updateData.first_name_kana = profileData.first_name_kana;
      }
      if (profileData.age) {
        updateData.age = profileData.age;
      }
      if (profileData.occupation_category) {
        updateData.occupation_category = profileData.occupation_category;
        updateData.current_job_title = profileData.occupation_category; // 既存フィールドとの互換性
      }
      if (profileData.occupation_detail) {
        updateData.occupation_detail = profileData.occupation_detail;
        if (profileData.occupation_category === 'その他') {
          updateData.current_job_title = profileData.occupation_detail;
        }
      }
      if (profileData.experience_years) {
        updateData.experience_years = profileData.experience_years;
      }
      if (profileData.motivation_reason) {
        updateData.motivation_reason = profileData.motivation_reason;
      }
      if (profileData.interests && profileData.interests.length > 0) {
        updateData.interests = profileData.interests;
        updateData.current_skills = profileData.interests; // 既存フィールドとの互換性
      }
      
      // 旧形式データのフォールバック（下位互換性）
      if (profileData.display_name && !profileData.last_name && !profileData.first_name) {
        updateData.full_name = profileData.display_name;
      }
      if (profileData.age_range && !profileData.age) {
        updateData.age = this.parseAgeRange(profileData.age_range);
      }
      if (profileData.occupation && !profileData.occupation_category) {
        updateData.current_job_title = profileData.occupation;
      }
      if (profileData.career_goals && profileData.career_goals.length > 0) {
        updateData.career_direction = profileData.career_goals.join(', ');
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
      return false;
    }
  }

  // age_range文字列を数値に変換（下位互換性用）
  private static parseAgeRange(ageRange: string): number | undefined {
    if (ageRange.includes('20代前半')) return 23;
    if (ageRange.includes('20代後半')) return 27;
    if (ageRange.includes('30代前半')) return 33;
    if (ageRange.includes('30代後半')) return 37;
    if (ageRange.includes('40代前半')) return 43;
    if (ageRange.includes('40代後半')) return 47;
    if (ageRange.includes('50代以上')) return 55;
    return undefined;
  }

  // onboarding_completed フラグの更新
  static async markOnboardingComplete(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error marking onboarding complete:', error);
      return false;
    }
  }

  static async isOnboardingComplete(userId: string): Promise<boolean> {
    try {
      // profilesテーブルのonboarding_completedフラグをチェック
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') throw profileError;
      
      // profilesテーブルにフラグがある場合はそれを使用
      if (profileData?.onboarding_completed) {
        return true;
      }

      // fallback: user_onboardingテーブルのcompleteステップをチェック
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('step')
        .eq('user_id', userId)
        .eq('step', 'complete')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking onboarding completion:', error);
      return false;
    }
  }

  static async skipStep(userId: string, step: string): Promise<boolean> {
    return this.completeStep(userId, step, { skipped: true });
  }

  static async resetOnboarding(userId: string): Promise<boolean> {
    try {
      // user_onboardingテーブルをクリア
      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .delete()
        .eq('user_id', userId);

      if (onboardingError) throw onboardingError;

      // profilesテーブルのonboarding_completedフラグをリセット
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return true;
    } catch (error) {
      console.error('Error resetting onboarding:', error);
      return false;
    }
  }

  // 改良された目標保存処理
  static async saveGoals(userId: string, goals: any[]): Promise<boolean> {
    try {
      if (!goals || goals.length === 0) {
        console.log('No goals to save');
        return true; // 空の目標リストは正常として扱う
      }

      const goalsData = goals.map(goal => ({
        user_id: userId,
        title: goal.title || '無題の目標',
        description: goal.description || '',
        category: this.mapGoalCategory(goal.title), // タイトルから適切なカテゴリを推測
        target_date: goal.deadline || null,
        priority: typeof goal.priority === 'string' 
          ? this.convertPriorityToNumber(goal.priority) 
          : (goal.priority || 3),
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('goals')
        .insert(goalsData);

      if (error) throw error;
      
      console.log(`Successfully saved ${goals.length} goals for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error saving goals:', error);
      return false;
    }
  }

  // 目標タイトルから適切なカテゴリを推測
  private static mapGoalCategory(title: string): string {
    const titleLower = title?.toLowerCase() || '';
    
    if (titleLower.includes('スキル') || titleLower.includes('技術') || titleLower.includes('資格')) {
      return 'skill';
    }
    if (titleLower.includes('昇進') || titleLower.includes('昇格') || titleLower.includes('管理職')) {
      return 'promotion';
    }
    if (titleLower.includes('転職') || titleLower.includes('キャリア')) {
      return 'career';
    }
    if (titleLower.includes('収入') || titleLower.includes('年収') || titleLower.includes('給与')) {
      return 'financial';
    }
    if (titleLower.includes('ネットワーク') || titleLower.includes('人脈')) {
      return 'network';
    }
    if (titleLower.includes('副業') || titleLower.includes('起業')) {
      return 'business';
    }
    
    return 'career'; // デフォルト
  }

  // 優先度文字列を数値に変換
  private static convertPriorityToNumber(priority: string): number {
    switch (priority.toLowerCase()) {
      case 'high': return 1;
      case 'medium': return 3;
      case 'low': return 5;
      default: return 3;
    }
  }

  // デバッグ用：オンボーディングデータの確認
  static async debugOnboardingData(userId: string): Promise<void> {
    try {
      const [onboardingData, profileData] = await Promise.all([
        supabase.from('user_onboarding').select('*').eq('user_id', userId),
        supabase.from('profiles').select('*').eq('id', userId).single()
      ]);

      console.log('=== Onboarding Debug Data ===');
      console.log('User ID:', userId);
      console.log('Onboarding Steps:', onboardingData.data);
      console.log('Profile Data:', profileData.data);
      console.log('=============================');
    } catch (error) {
      console.error('Debug error:', error);
    }
  }
}
