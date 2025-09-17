'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { OnboardingManager } from '@/lib/onboarding';

export default function OnboardingDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const runDebug = async () => {
      const info: any = {
        timestamp: new Date().toLocaleString('ja-JP'),
        steps: []
      };

      try {
        // Step 1: 認証チェック
        info.steps.push('🔍 認証状態をチェック中...');
        setDebugInfo({...info});

        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          info.authError = authError.message;
          info.steps.push(`❌ 認証エラー: ${authError.message}`);
        } else if (!session) {
          info.steps.push('❌ セッションが見つかりません');
          info.authStatus = 'no_session';
        } else {
          info.steps.push('✅ 認証成功');
          info.authStatus = 'authenticated';
          info.userId = session.user.id;
          info.userEmail = session.user.email;
        }
        setDebugInfo({...info});

        // Step 2: データベース接続テスト（認証済みの場合のみ）
        if (session) {
          info.steps.push('🔍 データベース接続をテスト中...');
          setDebugInfo({...info});

          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('id, email, full_name, onboarding_completed')
              .eq('id', session.user.id)
              .single();

            if (profileError) {
              info.steps.push(`❌ プロフィール取得エラー: ${profileError.message}`);
              info.profileError = profileError.message;
            } else {
              info.steps.push('✅ プロフィール取得成功');
              info.profile = profileData;
            }
          } catch (error) {
            info.steps.push(`❌ プロフィール取得で予期しないエラー: ${error}`);
          }
          setDebugInfo({...info});

          // Step 3: user_onboardingテーブルチェック
          info.steps.push('🔍 オンボーディングテーブルをチェック中...');
          setDebugInfo({...info});

          try {
            const { data: onboardingData, error: onboardingError } = await supabase
              .from('user_onboarding')
              .select('*')
              .eq('user_id', session.user.id);

            if (onboardingError) {
              info.steps.push(`❌ オンボーディングデータ取得エラー: ${onboardingError.message}`);
              info.onboardingError = onboardingError.message;
            } else {
              info.steps.push('✅ オンボーディングテーブルアクセス成功');
              info.onboardingData = onboardingData;
              info.onboardingCount = onboardingData?.length || 0;
            }
          } catch (error) {
            info.steps.push(`❌ オンボーディングテーブルで予期しないエラー: ${error}`);
          }
          setDebugInfo({...info});

          // Step 4: OnboardingManagerテスト
          info.steps.push('🔍 OnboardingManagerをテスト中...');
          setDebugInfo({...info});

          try {
            const progress = await OnboardingManager.getProgress(session.user.id);
            const isComplete = await OnboardingManager.isOnboardingComplete(session.user.id);

            info.steps.push('✅ OnboardingManager動作確認成功');
            info.managerResults = {
              progress,
              isComplete
            };
          } catch (error) {
            info.steps.push(`❌ OnboardingManagerエラー: ${error}`);
            info.managerError = String(error);
          }
          setDebugInfo({...info});
        }

      } catch (error) {
        info.steps.push(`❌ 全体的なエラー: ${error}`);
        info.globalError = String(error);
      } finally {
        info.steps.push('🏁 デバッグ完了');
        setDebugInfo({...info});
        setLoading(false);
      }
    };

    runDebug();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 オンボーディング システム診断
          </h1>

          {loading && (
            <div className="flex items-center space-x-2 text-blue-600 mb-4">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>診断実行中...</span>
            </div>
          )}

          {/* 実行ステップ */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">実行ログ:</h2>
            <div className="bg-gray-900 text-green-400 rounded p-4 font-mono text-sm space-y-1 max-h-60 overflow-y-auto">
              {debugInfo.steps?.map((step: string, index: number) => (
                <div key={index} className="text-green-400">{step}</div>
              ))}
            </div>
          </div>

          {/* 診断結果詳細 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 認証情報 */}
            <div className="bg-blue-50 rounded p-4 border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">認証状態</h3>
              <div className="text-sm space-y-1 text-blue-800">
                <div><strong>ステータス:</strong> {debugInfo.authStatus || '確認中'}</div>
                {debugInfo.userId && <div><strong>ユーザーID:</strong> <span className="font-mono text-xs">{debugInfo.userId}</span></div>}
                {debugInfo.userEmail && <div><strong>メール:</strong> {debugInfo.userEmail}</div>}
                {debugInfo.authError && <div className="text-red-700 font-semibold">❌ エラー: {debugInfo.authError}</div>}
              </div>
            </div>

            {/* プロフィール情報 */}
            <div className="bg-green-50 rounded p-4 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">プロフィール</h3>
              <div className="text-sm space-y-1 text-green-800">
                {debugInfo.profile ? (
                  <>
                    <div><strong>氏名:</strong> {debugInfo.profile.full_name || '未設定'}</div>
                    <div><strong>オンボーディング完了:</strong> {debugInfo.profile.onboarding_completed ? '✅ Yes' : '❌ No'}</div>
                  </>
                ) : (
                  <div className="text-gray-600">データなし</div>
                )}
                {debugInfo.profileError && <div className="text-red-700 font-semibold">❌ エラー: {debugInfo.profileError}</div>}
              </div>
            </div>

            {/* オンボーディングデータ */}
            <div className="bg-purple-50 rounded p-4 border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">オンボーディング進捗</h3>
              <div className="text-sm space-y-1 text-purple-800">
                <div><strong>記録数:</strong> {debugInfo.onboardingCount || 0}</div>
                {debugInfo.managerResults && (
                  <>
                    <div><strong>現在ステップ:</strong> {debugInfo.managerResults.progress?.currentStep || 0}</div>
                    <div><strong>完了済み:</strong> {debugInfo.managerResults.isComplete ? '✅ Yes' : '❌ No'}</div>
                  </>
                )}
                {debugInfo.onboardingError && <div className="text-red-700 font-semibold">❌ エラー: {debugInfo.onboardingError}</div>}
                {debugInfo.managerError && <div className="text-red-700 font-semibold">❌ Manager エラー: {debugInfo.managerError}</div>}
              </div>
            </div>

            {/* システム情報 */}
            <div className="bg-yellow-50 rounded p-4 border border-yellow-200">
              <h3 className="font-semibold text-yellow-900 mb-2">システム情報</h3>
              <div className="text-sm space-y-1 text-yellow-800">
                <div><strong>実行時刻:</strong> {debugInfo.timestamp}</div>
                <div><strong>環境:</strong> {typeof window !== 'undefined' ? 'Client' : 'Server'}</div>
                {debugInfo.globalError && <div className="text-red-700 font-semibold">❌ グローバルエラー: {debugInfo.globalError}</div>}
              </div>
            </div>
          </div>

          {/* 生データ表示 */}
          <details className="mt-6">
            <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium">
              🔍 詳細データを表示（クリック）
            </summary>
            <pre className="mt-2 bg-gray-900 text-green-400 rounded p-4 text-xs overflow-auto max-h-60 border">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </details>

          {/* アクション */}
          <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t border-gray-200">
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              📊 ダッシュボードへ
            </a>
            <a
              href="/onboarding"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium"
            >
              🚀 オンボーディングページへ
            </a>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-medium"
            >
              🔄 再実行
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
