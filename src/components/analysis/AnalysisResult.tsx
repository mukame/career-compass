'use client'

import React from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { SaveAnalysisModal } from './SaveAnalysisModal'
import { PricingPlans } from '../subscription/PricingPlans'

interface AnalysisResultProps {
  result: any
  analysisType: string
  onNewAnalysis: () => void
  onSaveToGoals?: (recommendation: any) => void
}

export const AnalysisResult: React.FC<AnalysisResultProps> = ({
  result,
  analysisType,
  onNewAnalysis,
  onSaveToGoals
}) => {
  const renderConfusionResult = () => (
    <div className="space-y-8">
      {/* サマリー */}
      <AnimatedSection animation="scaleIn">
        <GlassCard className="p-8 text-center border-l-4 border-l-blue-400">
          <h3 className="text-2xl font-bold text-white mb-4">🎯 分析結果サマリー</h3>
          <p className="text-xl text-blue-100 leading-relaxed">{result.summary}</p>
        </GlassCard>
      </AnimatedSection>

      {/* 根本原因分析 */}
      <AnimatedSection animation="fadeInLeft" delay={200}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.598 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            根本原因の分析
          </h3>
          <p className="text-blue-100 text-lg mb-6">{result.analysis?.rootCause}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">🔍 パターン分析</h4>
              <div className="space-y-2">
                {result.analysis?.patterns?.map((pattern: string, index: number) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span className="text-blue-200">{pattern}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3">💭 感情分析</h4>
              <div className="space-y-2">
                {result.analysis?.emotions?.map((emotion: string, index: number) => (
                  <Badge key={index} variant="info" size="sm" className="mr-2 mb-2">
                    {emotion}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* 推奨アクション */}
      <AnimatedSection animation="fadeInRight" delay={400}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            推奨アクション
          </h3>
          
          <div className="space-y-6">
            {result.recommendations?.map((rec: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-white">{rec.title}</h4>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={rec.priority === 'high' ? 'error' : rec.priority === 'medium' ? 'warning' : 'info'} 
                      size="sm"
                    >
                      {rec.priority === 'high' ? '高優先度' : rec.priority === 'medium' ? '中優先度' : '低優先度'}
                    </Badge>
                    <span className="text-sm text-blue-200">{rec.timeframe}</span>
                  </div>
                </div>
                <p className="text-blue-100 mb-4">{rec.description}</p>
                
                {onSaveToGoals && (
                  <button
                    onClick={() => onSaveToGoals(rec)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 text-sm"
                  >
                    📋 目標として保存
                  </button>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* 次のステップ */}
      <AnimatedSection animation="fadeInUp" delay={600}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            具体的な次のステップ
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {result.nextSteps?.map((step: string, index: number) => (
              <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </div>
                  <p className="text-blue-100 text-sm">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* AI洞察 */}
      <AnimatedSection animation="scaleIn" delay={800}>
        <GlassCard className="p-8 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
              🧠
            </div>
            AI からの深い洞察
          </h3>
          <p className="text-purple-100 text-lg leading-relaxed">{result.insights}</p>
        </GlassCard>
      </AnimatedSection>
    </div>
  )
    const renderStrengthResult = () => (
    <div className="space-y-8">
      <AnimatedSection animation="scaleIn">
        <GlassCard className="p-8 text-center border-l-4 border-l-green-400">
          <h3 className="text-2xl font-bold text-white mb-4">💪 あなたの強み分析</h3>
          <p className="text-xl text-blue-100 leading-relaxed">{result.summary}</p>
        </GlassCard>
      </AnimatedSection>

      {/* 発見された強み */}
      <AnimatedSection animation="fadeInUp" delay={200}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              ⭐
            </div>
            発見された強み
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.strengths?.map((strength: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-white">{strength.name}</h4>
                  <Badge 
                    variant={strength.level === 'high' ? 'success' : strength.level === 'medium' ? 'warning' : 'info'} 
                    size="sm"
                  >
                    {strength.level === 'high' ? '高レベル' : strength.level === 'medium' ? '中レベル' : '発達中'}
                  </Badge>
                </div>
                <p className="text-blue-100 mb-4">{strength.description}</p>
                <div>
                  <h5 className="font-medium text-white mb-2">根拠：</h5>
                  <ul className="space-y-1">
                    {strength.evidence?.map((evidence: string, i: number) => (
                      <li key={i} className="text-blue-200 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {evidence}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* 強みの活用方法 */}
      <AnimatedSection animation="fadeInLeft" delay={400}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
              🎯
            </div>
            強みの活用方法
          </h3>
          
          <div className="space-y-6">
            {result.applications?.map((app: any, index: number) => (
              <div key={index} className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl p-6 border border-blue-400/20">
                <h4 className="text-lg font-semibold text-white mb-3">{app.area}</h4>
                <div className="mb-4">
                  <h5 className="font-medium text-blue-100 mb-2">具体的な活用方法：</h5>
                  <ul className="space-y-2">
                    {app.specific_ways?.map((way: string, i: number) => (
                      <li key={i} className="text-blue-200 flex items-start">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {way}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white/5 rounded-xl p-4">
                  <h5 className="font-medium text-white mb-2">期待される効果：</h5>
                  <p className="text-blue-100">{app.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* 強化計画 */}
      <AnimatedSection animation="fadeInRight" delay={600}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
              📈
            </div>
            強み強化計画
          </h3>
          
          <div className="space-y-6">
            {result.development_plan?.map((plan: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-semibold text-white">{plan.strength}</h4>
                  <span className="text-sm text-orange-200 bg-orange-500/20 px-3 py-1 rounded-full">{plan.timeline}</span>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-3">推奨アクション：</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {plan.actions?.map((action: string, i: number) => (
                      <div key={i} className="flex items-center space-x-2 text-blue-200">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )

  const renderCareerPathResult = () => (
    <div className="space-y-8">
      <AnimatedSection animation="scaleIn">
        <GlassCard className="p-8 text-center border-l-4 border-l-purple-400">
          <h3 className="text-2xl font-bold text-white mb-4">🗺️ 推奨キャリアパス</h3>
          <p className="text-xl text-blue-100 leading-relaxed">{result.summary}</p>
        </GlassCard>
      </AnimatedSection>

      {/* 推奨キャリアパス */}
      <AnimatedSection animation="fadeInUp" delay={200}>
        <div className="space-y-6">
          {result.recommended_paths?.map((path: any, index: number) => (
            <GlassCard key={index} className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{path.title}</h3>
                  <p className="text-blue-100 mb-4">{path.description}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-200">適合度:</span>
                      <div className="flex items-center space-x-2">
                        <Progress value={path.fit_score} className="w-20" color="purple" />
                        <span className="text-sm font-semibold text-white">{path.fit_score}%</span>
                      </div>
                    </div>
                    <Badge variant="info" size="sm">{path.timeline}</Badge>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-white mb-3">必要スキル:</h4>
                <div className="flex flex-wrap gap-2">
                  {path.required_skills?.map((skill: string, i: number) => (
                    <Badge key={i} variant="default" size="sm">{skill}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-white mb-4">ステップバイステップ計画:</h4>
                <div className="space-y-4">
                  {path.steps?.map((step: any, i: number) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4 border-l-4 border-l-purple-400">
                      <div className="flex justify-between items-center mb-3">
                        <h5 className="font-semibold text-white">{step.phase}</h5>
                        <span className="text-sm text-purple-200">{step.duration}</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h6 className="text-sm font-medium text-blue-100 mb-2">アクション:</h6>
                          <ul className="space-y-1">
                            {step.actions?.map((action: string, j: number) => (
                              <li key={j} className="text-blue-200 text-sm flex items-start">
                                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {action}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h6 className="text-sm font-medium text-blue-100 mb-2">マイルストーン:</h6>
                          <ul className="space-y-1">
                            {step.milestones?.map((milestone: string, j: number) => (
                              <li key={j} className="text-blue-200 text-sm flex items-start">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {milestone}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </AnimatedSection>

      {/* スキルギャップ分析 */}
      <AnimatedSection animation="fadeInUp" delay={400}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mr-3">
              📊
            </div>
            スキルギャップ分析
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result.skill_gaps?.map((gap: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">{gap.skill}</h4>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">現在レベル: {gap.current_level}</span>
                    <span className="text-green-200">目標レベル: {gap.target_level}</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-orange-400 to-red-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>
                <div>
                  <h5 className="font-medium text-white mb-2">学習リソース:</h5>
                  <ul className="space-y-1">
                    {gap.learning_resources?.map((resource: string, i: number) => (
                      <li key={i} className="text-blue-200 text-sm flex items-start">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )

  const renderValuesResult = () => (
    <div className="space-y-8">
      <AnimatedSection animation="scaleIn">
        <GlassCard className="p-8 text-center border-l-4 border-l-pink-400">
          <h3 className="text-2xl font-bold text-white mb-4">💖 価値観分析結果</h3>
          <p className="text-xl text-blue-100 leading-relaxed">{result.summary}</p>
        </GlassCard>
      </AnimatedSection>

      {/* 価値観プロファイル */}
      <AnimatedSection animation="fadeInUp" delay={200}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center mr-3">
              🎯
            </div>
            あなたの価値観プロファイル
          </h3>
          
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-2xl p-6 border border-pink-400/20">
              <h4 className="font-semibold text-white mb-3">主要な価値観</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {result.value_profile?.dominant_values?.map((value: string, index: number) => (
                  <Badge key={index} variant="info" size="md" className="bg-pink-500/20 text-pink-100">
                    {value}
                  </Badge>
                ))}
              </div>
              <p className="text-pink-100">{result.value_profile?.life_stage_consideration}</p>
            </div>

            {result.value_profile?.value_conflicts?.length > 0 && (
              <div className="bg-orange-500/10 rounded-2xl p-6 border border-orange-400/20">
                <h4 className="font-semibold text-white mb-3">価値観の矛盾</h4>
                <ul className="space-y-2">
                  {result.value_profile.value_conflicts.map((conflict: string, index: number) => (
                    <li key={index} className="text-orange-200 flex items-start">
                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      {conflict}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* キャリアへの影響 */}
      <AnimatedSection animation="fadeInLeft" delay={400}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
              💼
            </div>
            キャリアへの影響分析
          </h3>
          
          <div className="space-y-6">
            {result.career_implications?.map((implication: any, index: number) => (
              <div key={index} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-3">{implication.value}</h4>
                <p className="text-blue-100 mb-4">{implication.career_impact}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="font-medium text-green-200 mb-2">推奨環境:</h5>
                    <ul className="space-y-1">
                      {implication.recommended_environments?.map((env: string, i: number) => (
                        <li key={i} className="text-green-100 text-sm flex items-start">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {env}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-red-200 mb-2">潜在的課題:</h5>
                    <ul className="space-y-1">
                      {implication.potential_challenges?.map((challenge: string, i: number) => (
                        <li key={i} className="text-red-100 text-sm flex items-start">
                          <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </AnimatedSection>

      {/* 適合度評価 */}
      <AnimatedSection animation="fadeInRight" delay={600}>
        <GlassCard className="p-8">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mr-3">
              📊
            </div>
            キャリア適合度評価
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-3">現在の役割</h4>
              <div className="flex items-center space-x-3">
                <Progress value={result.alignment_assessment?.current_role_fit || 0} className="flex-1" color="blue" />
                <span className="text-lg font-bold text-white">{result.alignment_assessment?.current_role_fit || 0}%</span>
              </div>
            </div>
            <div className="bg-white/5 rounded-xl p-6">
              <h4 className="font-semibold text-white mb-3">目標役割</h4>
              <div className="flex items-center space-x-3">
                <Progress value={result.alignment_assessment?.target_role_fit || 0} className="flex-1" color="green" />
                <span className="text-lg font-bold text-white">{result.alignment_assessment?.target_role_fit || 0}%</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-4">推奨事項:</h4>
            <div className="space-y-3">
              {result.alignment_assessment?.recommendations?.map((rec: string, index: number) => (
                <div key={index} className="flex items-start space-x-3 bg-green-500/10 rounded-xl p-4">
                  <div className="w-6 h-6 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  <p className="text-green-100">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>
      </AnimatedSection>
    </div>
  )


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* 背景エフェクト */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* ヘッダー */}
        <AnimatedSection animation="fadeInUp">
          <div className="text-center mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl animate-bounce">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              分析完了！ 🎉
            </h1>
            <p className="text-xl text-blue-100">
              AIがあなたの
              {analysisType === 'confusion' ? 'モヤモヤ' : 
               analysisType === 'strength' ? '強み' :
               analysisType === 'career_path' ? 'キャリアパス' : '価値観'}
              を詳しく分析しました
            </p>
          </div>
        </AnimatedSection>

        {/* 結果表示 */}
        {analysisType === 'confusion' && renderConfusionResult()}
        {analysisType === 'strength' && renderStrengthResult()}
        {analysisType === 'career_path' && renderCareerPathResult()}
        {analysisType === 'values' && renderValuesResult()}

        {/* アクションボタン */}
        <AnimatedSection animation="fadeInUp" delay={1000}>
          <div className="text-center mt-12 space-y-4">
            <button
              onClick={onNewAnalysis}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300/50 transition-all duration-200 shadow-xl hover:shadow-2xl transform hover:scale-105 mr-4"
            >
              🔄 新しい分析を開始
            </button>
            <button
              onClick={() => window.history.back()}
              className="px-8 py-3 bg-white/20 text-white font-semibold rounded-2xl hover:bg-white/30 focus:outline-none focus:ring-4 focus:ring-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              📊 ダッシュボードに戻る
            </button>
          </div>
        </AnimatedSection>
      </div>
    </div>
  )
}
