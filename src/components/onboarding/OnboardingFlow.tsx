'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { OnboardingManager } from '@/lib/onboarding';
import { SubscriptionManager } from '@/lib/subscription';
import { createClient } from '@/lib/supabase';

// ステップコンポーネント
import WelcomeStep from './steps/WelcomeStep';
import ProfileStep from './steps/ProfileStep';
import TrialAnalysisStep from './steps/TrialAnalysisStep';
import PlanSelectionStep from './steps/PlanSelectionStep';
import GoalSettingStep from './steps/GoalSettingStep';
import CompleteStep from './steps/CompleteStep';

// UI コンポーネント
import ProgressBar from './ProgressBar';

import type { ProfileData, OnboardingState } from '@/types/onboarding';

const STEPS = [
  { id: 'welcome', title: 'ようこそ' },
  { id: 'profile', title: 'プロフィール' },
  { id: 'trial_analysis', title: '体験' },
  { id: 'plan_selection', title: 'プラン選択' },
  { id: 'goal_setting', title: '目標設定' },
  { id: 'complete', title: '完了' }
];

export default function OnboardingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  
  const [user, setUser] = useState<any>(null);
  const [state, setState] = useState<OnboardingState>({
    step: 0,
    profile: {},
    hasTriedAnalysis: false,
    showPlanRecommendation: false
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // 🔧 修正: データベース構造に対応した現在ステップ取得
  const getCurrentStepFromDB = async (userId: string): Promise<number> => {
    try {
      // 完了済みのステップを全て取得
      const { data: completedSteps, error } = await supabase
        .from('user_onboarding')
        .select('step, completed_at')
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ ステップ取得エラー:', error);
        return 0;
      }

      if (!completedSteps || completedSteps.length === 0) {
        return 0; // welcome ステップ
      }

      const completedStepNames = completedSteps.map(s => s.step);
      console.log('✅ 完了済みステップ:', completedStepNames);
      
      // ステップの順序
      const stepOrder = ['welcome', 'profile', 'trial_analysis', 'plan_selection', 'goal_setting'];
      
      // 次に実行すべきステップを特定
      for (let i = 0; i < stepOrder.length; i++) {
        if (!completedStepNames.includes(stepOrder[i])) {
          return i; // 0-based index
        }
      }
      
      // 全て完了している場合
      return 5; // complete ステップ
      
    } catch (error) {
      console.error('❌ getCurrentStepFromDB エラー:', error);
      return 0;
    }
  };

  // 認証チェックとオンボーディング進捗の復元
  useEffect(() => {
    const loadProgress = async () => {
      try {
        // ユーザー認証チェック
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (!currentUser) {
          router.push('/auth/login');
          return;
        }
        setUser(currentUser);

        // 🔧 修正: 新しいステップ取得方法を使用
        const currentStepIndex = await getCurrentStepFromDB(currentUser.id);
        const isComplete = currentStepIndex >= 5;
        
        // 強制表示フラグがない場合、完了済みならダッシュボードへ
        if (searchParams?.get('force') !== 'true' && isComplete) {
          router.push('/dashboard');
          return;
        }

        // 体験分析完了チェック
        const fromAnalysis = searchParams?.get('from_analysis');
        
        // 🔧 修正: trial_analysisステップの完了確認
        const { data: trialStep } = await supabase
          .from('user_onboarding')
          .select('completed_at')
          .eq('user_id', currentUser.id)
          .eq('step', 'trial_analysis')
          .maybeSingle();

        const hasTriedAnalysis = fromAnalysis === 'true' || 
          (trialStep?.completed_at !== null);

        setState(prev => ({
          ...prev,
          step: currentStepIndex,
          hasTriedAnalysis,
          showPlanRecommendation: hasTriedAnalysis
        }));
        
      } catch (error) {
        console.error('Failed to load onboarding progress:', error);
        setError('オンボーディング情報の読み込みに失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
  }, [router, searchParams]);

  // ステップ完了処理
  const completeStep = async (stepName: string, data: any = {}) => {
    if (!user?.id) return false;

    try {
      const success = await OnboardingManager.completeStep(user.id, stepName, data);
      if (success) {
        console.log(`Step ${stepName} completed successfully`);
      }
      return success;
    } catch (error) {
      console.error(`Failed to complete step ${stepName}:`, error);
      return false;
    }
  };

  // ナビゲーション関数
  const nextStep = () => {
    if (state.step < STEPS.length - 1) {
      setState(prev => ({ ...prev, step: prev.step + 1 }));
    }
  };

  const prevStep = () => {
    if (state.step > 0) {
      setState(prev => ({ ...prev, step: prev.step - 1 }));
    }
  };

  // ステップハンドラー
  const handleWelcomeComplete = async () => {
    await completeStep('welcome');
    nextStep();
  };

  const handleProfileComplete = async (profile: ProfileData) => {
    setState(prev => ({ ...prev, profile }));
    await completeStep('profile', { profile });
    nextStep();
  };

  const handleTrialComplete = async () => {
    setState(prev => ({ 
      ...prev, 
      hasTriedAnalysis: true,
      showPlanRecommendation: true 
    }));
    await completeStep('trial_analysis');
    nextStep();
  };

  const handlePlanSelection = async (planId: string) => {
    setState(prev => ({ ...prev, selectedPlan: planId }));
    
    // 有料プランの場合は決済処理（現在はスキップ）
    if (planId !== 'free') {
      try {
        const subscriptionManager = new SubscriptionManager();
        const { sessionUrl } = await subscriptionManager.createCheckoutSession(
          user!.id,
          planId,
          window.location.origin + '/onboarding?step=goal_setting'
        );
        
        if (sessionUrl) {
          window.location.href = sessionUrl;
          return;
        }
      } catch (error) {
        console.error('Failed to create checkout session:', error);
        setError('決済処理でエラーが発生しました');
        return;
      }
    }

    await completeStep('plan_selection', { planId });
    nextStep();
  };

  const handleGoalSetting = async (goals: any[]) => {
    // 目標をデータベースに保存
    if (goals.length > 0 && user?.id) {
      try {
        await OnboardingManager.saveGoals(user.id, goals);
      } catch (error) {
        console.error('Failed to save goals:', error);
      }
    }

    await completeStep('goal_setting', { goals });
    nextStep();
  };

  const handleComplete = async () => {
    await completeStep('complete');
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-purple-300/30 border-t-purple-400 rounded-full mx-auto mb-6"
          />
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 font-medium text-lg"
          >
            セットアップを準備中...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 max-w-md w-full"
        >
          <p className="text-red-300 font-medium mb-6 text-lg">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            再試行
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 40% 80%, rgba(120, 255, 198, 0.3) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0"
        />
      </div>

      {/* プログレスバー（完了ステップ以外） */}
      {state.step < STEPS.length - 1 && (
        <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-10 bg-white/5 backdrop-blur-xl border-b border-white/10"
        >
          <div className="max-w-lg mx-auto px-4 py-6">
            <ProgressBar 
              current={state.step + 1} 
              total={STEPS.length}
              steps={STEPS}
            />
          </div>
        </motion.div>
      )}

      {/* メインコンテンツ */}
      <div className="relative z-10 px-4 py-8 min-h-screen flex items-center">
        <div className="w-full max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.step}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -300, scale: 0.8 }}
              transition={{ 
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.6
              }}
            >
              {state.step === 0 && (
                <WelcomeStep 
                  onNext={handleWelcomeComplete}
                />
              )}
              
              {state.step === 1 && (
                <ProfileStep
                  onNext={handleProfileComplete}
                  onBack={prevStep}
                  initialData={state.profile}
                />
              )}
              
              {state.step === 2 && (
                <TrialAnalysisStep
                  onNext={handleTrialComplete}
                  onBack={prevStep}
                  userName={state.profile.display_name || user?.email?.split('@')[0] || 'ユーザー'}
                />
              )}
              
              {state.step === 3 && (
                <PlanSelectionStep
                  onNext={handlePlanSelection}
                  onBack={prevStep}
                  userName={state.profile.display_name || user?.email?.split('@')[0] || 'ユーザー'}
                  trialCompleted={state.hasTriedAnalysis}
                />
              )}
              
              {state.step === 4 && (
                <GoalSettingStep
                  onNext={handleGoalSetting}
                  onBack={prevStep}
                  userName={state.profile.display_name || user?.email?.split('@')[0] || 'ユーザー'}
                />
              )}
              
              {state.step === 5 && (
                <CompleteStep
                  userName={state.profile.display_name || user?.email?.split('@')[0] || 'ユーザー'}
                  selectedPlan={state.selectedPlan || 'free'}
                  onComplete={handleComplete}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
