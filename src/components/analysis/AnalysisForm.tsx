'use client'

import React, { useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedInput } from '@/components/ui/AnimatedInput'
import { AnimatedSection } from '@/components/ui/AnimatedSection'

interface AnalysisFormProps {
  analysisType: 'confusion' | 'strength' | 'career_path' | 'values'
  onSubmit: (data: any) => void
  loading: boolean
}

export const AnalysisForm: React.FC<AnalysisFormProps> = ({
  analysisType,
  onSubmit,
  loading
}) => {
  const [formData, setFormData] = useState<any>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const renderConfusionForm = () => (
    <div className="space-y-6">
      <AnimatedSection animation="fadeInUp">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">モヤモヤ分析 🤔</h2>
          <p className="text-xl text-blue-100">
            現在の悩みや課題をAIと一緒に整理しましょう
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="fadeInUp" delay={200}>
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                現在の状況について詳しく教えてください 💭
              </label>
              <textarea
                value={formData.currentSituation || ''}
                onChange={(e) => setFormData({...formData, currentSituation: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: 今の仕事にやりがいを感じられず、毎日が単調に感じています。将来のキャリアについても明確なビジョンが描けず、このままでいいのか不安です..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                特に気になることや悩んでいることは？ 😟
              </label>
              <textarea
                value={formData.specificConcerns || ''}
                onChange={(e) => setFormData({...formData, specificConcerns: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: 同僚と比較して成長が遅いと感じる、上司との関係がうまくいかない、新しいスキルを身につける時間がない..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                理想的にはどうなりたいですか？ ✨
              </label>
              <textarea
                value={formData.desiredOutcome || ''}
                onChange={(e) => setFormData({...formData, desiredOutcome: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: もっとやりがいのある仕事がしたい、チームをリードする立場になりたい、ワークライフバランスを改善したい..."
                required
              />
            </div>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )

  const renderStrengthForm = () => (
    <div className="space-y-6">
      <AnimatedSection animation="fadeInUp">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">強み分析 💪</h2>
          <p className="text-xl text-blue-100">
            あなたの強みを発見し、キャリアに活かす方法を見つけましょう
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="fadeInUp" delay={200}>
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                これまでの経験や成果について教えてください 🏆
              </label>
              <textarea
                value={formData.experiences || ''}
                onChange={(e) => setFormData({...formData, experiences: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: プロジェクトリーダーとして売上20%向上を達成、新人研修プログラムを立ち上げ、チーム離職率を30%改善..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                得意なことや自信があることは？ ⭐
              </label>
              <textarea
                value={formData.strengths || ''}
                onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: 複雑な問題を整理して解決策を見つけること、チームメンバーのモチベーション向上、データ分析..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                周りからよく言われることは？ 👥
              </label>
              <textarea
                value={formData.feedback || ''}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-green-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: 話しやすい、アイデアが豊富、責任感が強い、細かいところまで気づく..."
                required
              />
            </div>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )

  const renderCareerPathForm = () => (
    <div className="space-y-6">
      <AnimatedSection animation="fadeInUp">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">キャリアパス分析 🗺️</h2>
          <p className="text-xl text-blue-100">
            あなたに最適なキャリアパスをAIが提案します
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection animation="fadeInUp" delay={200}>
        <GlassCard className="p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                現在のスキルと経験について 🛠️
              </label>
              <textarea
                value={formData.currentSkills || ''}
                onChange={(e) => setFormData({...formData, currentSkills: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: JavaScript、React、Node.js、プロジェクト管理、チームリーダー経験3年、新規事業立ち上げ経験..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                興味のある分野や挑戦したいこと 🌟
              </label>
              <textarea
                value={formData.interests || ''}
                onChange={(e) => setFormData({...formData, interests: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: AI・機械学習、プロダクトマネジメント、スタートアップ、グローバル展開、社会課題解決..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                5年後、10年後のキャリアビジョン 🔮
              </label>
              <textarea
                value={formData.futureVision || ''}
                onChange={(e) => setFormData({...formData, futureVision: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                placeholder="例: 自分のプロダクトを持つ、チームを率いる、専門性を極める、起業する、社会に大きな影響を与える..."
                required
              />
            </div>

            <div>
              <label className="block text-lg font-semibold text-white mb-4">
                現在の制約や考慮事項 ⚖️
              </label>
              <textarea
                value={formData.constraints || ''}
                onChange={(e) => setFormData({...formData, constraints: e.target.value})}
                className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-purple-400 focus:bg-white/20 transition-all duration-300 min-h-24 resize-none"
                placeholder="例: 転勤は難しい、現在の年収は維持したい、家族の時間を大切にしたい、勉強時間は限られている..."
              />
            </div>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )

  const renderValuesForm = () => {
    const currentValues = [
      { key: 'work_life_balance', label: 'ワークライフバランス', current: formData.workLifeImportance || 0 },
      { key: 'career_growth', label: 'キャリア成長', current: formData.careerGrowthImportance || 0 },
      { key: 'compensation', label: '報酬・待遇', current: formData.compensationImportance || 0 },
      { key: 'autonomy', label: '自律性・裁量権', current: formData.autonomyImportance || 0 },
      { key: 'impact', label: '社会的影響', current: formData.impactImportance || 0 },
      { key: 'stability', label: '安定性', current: formData.stabilityImportance || 0 }
    ]

    return (
      <div className="space-y-6">
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-rose-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">価値観分析 💖</h2>
            <p className="text-xl text-blue-100">
              あなたの価値観を深掘りし、キャリア選択への影響を分析します
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection animation="fadeInUp" delay={200}>
          <GlassCard className="p-8">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-white mb-4">現在の価値観の重要度（1-5で評価）</h3>
              <p className="text-blue-200 mb-6">まず現在あなたが重視している価値観を評価してください</p>
              
              <div className="space-y-6">
                {currentValues.map((value, index) => (
                  <div key={value.key} className="bg-white/5 rounded-2xl p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-lg font-semibold text-white">{value.label}</h4>
                      </div>
                      <div className="flex space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFormData({...formData, [`${value.key}Importance`]: rating})}
                            className={`w-10 h-10 rounded-full font-bold transition-all duration-200 ${
                              value.current === rating
                                ? 'bg-gradient-to-br from-pink-400 to-rose-500 text-white scale-110 shadow-lg'
                                : 'bg-white/20 text-white/70 hover:bg-white/30 hover:scale-105'
                            }`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  価値観に関する具体的なエピソード 📖
                </label>
                <textarea
                  value={formData.valueExperiences || ''}
                  onChange={(e) => setFormData({...formData, valueExperiences: e.target.value})}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-pink-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                  placeholder="例: 残業が多い時期に家族との時間が取れず辛かった、新しいプロジェクトで裁量を持てた時にやりがいを感じた、昇進よりも専門性を高めることに喜びを感じる..."
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold text-white mb-4">
                  価値観の変化や気づき 💡
                </label>
                <textarea
                  value={formData.valueChanges || ''}
                  onChange={(e) => setFormData({...formData, valueChanges: e.target.value})}
                  className="w-full px-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-blue-200 focus:outline-none focus:border-pink-400 focus:bg-white/20 transition-all duration-300 min-h-32 resize-none"
                  placeholder="例: 最近は仕事の意味を重視するようになった、以前は年収重視だったが今は成長を重視、プライベートの充実がパフォーマンス向上に繋がることを実感..."
                  required
                />
              </div>
            </div>
          </GlassCard>
        </AnimatedSection>
      </div>
    )
  }

  // 既存のreturn文のform部分を更新
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <form onSubmit={handleSubmit}>
          {analysisType === 'confusion' && renderConfusionForm()}
          {analysisType === 'strength' && renderStrengthForm()}
          {analysisType === 'career_path' && renderCareerPathForm()}
          {analysisType === 'values' && renderValuesForm()}
          
          <AnimatedSection animation="fadeInUp" delay={400}>
            <div className="text-center mt-12">
              <button
                type="submit"
                disabled={loading}
                className="group px-12 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl rounded-3xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>AI分析中...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <span>AI分析を開始</span>
                    <svg className="w-5 h-5 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </AnimatedSection>
        </form>
      </div>
    </div>
  )
}
