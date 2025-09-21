'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import { FloatingElements } from '@/components/ui/FloatingElements'
import { Card, CardContent } from '@/components/ui/Card'

export default function HomePage() {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        router.push('/dashboard')
        return
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [router, mounted])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200 mx-auto"></div>
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent mx-auto absolute top-0"></div>
          </div>
          <p className="mt-6 text-gray-600 font-medium">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 relative overflow-hidden">
      <FloatingElements />
      
      {/* ヘッダー */}
      <header className="relative bg-white/80 backdrop-blur-lg shadow-sm border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Career Compass
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                ログイン
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                無料で自己分析を始める
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* 1. ヒーローエリア（ベネフィット提示） */}
      <section className="relative pt-20 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <AnimatedSection animation="fadeInUp">
              <div className="mb-8">
                <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-full text-base font-medium mb-8 border border-blue-200">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  👉 高精度の自己分析ツール
                </div>
                <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                  キャリア迷子に、<br />
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    キャリアパスの"正解"を
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-4xl mx-auto">
                  高精度の自己分析ツールで、納得できるキャリアを明確に。<br />
                  <span className="font-semibold text-blue-600">今なら無料登録で、全種類のお試し分析が可能！</span>
                </p>
              </div>
            </AnimatedSection>
            
            <AnimatedSection animation="scaleIn" delay={300}>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="group px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl font-bold text-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
                >
                  <span className="flex items-center">
                    無料で自己分析を始める
                    <svg className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </AnimatedSection>

            {/* 信頼性指標 */}
            <AnimatedSection animation="fadeInUp" delay={600}>
              <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 mb-20">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">プライム上場企業人事監修</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <span className="font-medium">国家資格キャリアコンサルタント参画</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                  <span className="font-medium">プロコーチング知見活用</span>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* 2. 共感・問題提起 */}
      <section className="py-24 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                あなたはこんな悩みを
                <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">抱えていませんか？</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: "😰", text: "このままで良いのか漠然とした不安がある" },
              { icon: "🚀", text: "人生を前に進めたい" },
              { icon: "🔄", text: "転職を繰り返してしまっている" }
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 200}>
                <Card className="p-6 text-center border-2 border-red-100 bg-red-50/50 hover:shadow-lg transition-all duration-300">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <p className="text-lg font-medium text-gray-800">{item.text}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeInUp" delay={600}>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-3xl p-8 border-2 border-orange-200">
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">特に…</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-3">🎓</div>
                  <h4 className="font-bold text-lg text-blue-700 mb-2">就活生</h4>
                  <p className="text-gray-700">「自己PRがうまくできない」</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">💼</div>
                  <h4 className="font-bold text-lg text-green-700 mb-2">20代後半の転職希望者</h4>
                  <p className="text-gray-700">「キャリアの選択が正しいのか分からない」</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-3">⏰</div>
                  <h4 className="font-bold text-lg text-purple-700 mb-2">キャリア停滞を感じる30代</h4>
                  <p className="text-gray-700">「何年も同じ場所に立ち止まっている気がする」</p>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 3. サービス概要（解決策） */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">プロフェッショナル</span>
                自己分析ツール
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                本サービスは、キャリアに本気で向き合う人のための プロフェッショナル自己分析ツール。<br />
                <span className="font-semibold text-blue-600">プライム上場企業の人事、キャリアコンサルタント、コーチングのプロが共同開発</span>しました。
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {[
              {
                title: "キャリアパス分析",
                icon: "🛣️",
                color: "from-green-500 to-teal-500",
                bgColor: "from-green-50 to-teal-50",
                description: "最適な道筋を提案"
              },
              {
                title: "モヤモヤ分析",
                icon: "🧠",
                color: "from-blue-500 to-indigo-500",
                bgColor: "from-blue-50 to-indigo-50",
                description: "悩みを整理し明確化"
              },
              {
                title: "価値観分析",
                icon: "💎",
                color: "from-purple-500 to-pink-500",
                bgColor: "from-purple-50 to-pink-50",
                description: "核となる価値観を発見"
              },
              {
                title: "強み分析",
                icon: "⭐",
                color: "from-orange-500 to-red-500",
                bgColor: "from-orange-50 to-red-50",
                description: "あなたの強みを特定"
              }
            ].map((analysis, index) => (
              <AnimatedSection key={index} animation="scaleIn" delay={index * 150}>
                <Card className={`group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br ${analysis.bgColor} hover:scale-105`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{analysis.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{analysis.title}</h3>
                    <p className="text-gray-600 text-sm">{analysis.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeInUp" delay={600}>
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                さらに、分析結果を蓄積・比較することで「変化」を実感できます。
              </h3>
              <p className="text-gray-600 text-lg">
                継続的な自己理解の深化により、確実な成長を支援します。
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* スクリーンショット挿入エリア1: 分析画面のデモ */}
      <section className="py-16 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">実際の分析画面</h2>
              <p className="text-lg text-gray-600">直感的で使いやすいインターフェース</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="scaleIn" delay={300}>
            {/* スクリーンショット挿入箇所1 */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-2xl border-4 border-white max-w-sm">
                <div className="bg-white rounded-2xl overflow-hidden">
                  <img 
                    src="/images/analysis-screen.png" 
                    alt="分析画面のスクリーンショット" 
                    className="w-full h-auto object-cover"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 4. 具体的メリット・利用イメージ（Before→After） */}
      <section className="py-24 bg-gradient-to-r from-green-600 to-blue-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Before → After
              </h2>
              <p className="text-xl text-blue-100">
                あなたのキャリアがこう変わります
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              {
                before: "ただ何となく過ごす日々",
                after: "やりがいにあふれ、前進を実感できる毎日に",
                icon: "🌟"
              },
              {
                before: "転職を繰り返してしまう",
                after: "深い自己理解で同じ失敗は繰り返さない",
                icon: "🎯"
              },
              {
                before: "自分に自信が持てない",
                after: "強み分析で自分の価値発揮の方法がわかる",
                icon: "💪"
              }
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 200}>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <div className="text-3xl text-center mb-4">{item.icon}</div>
                  <div className="text-center mb-4">
                    <div className="bg-red-500/20 rounded-lg p-3 mb-2">
                      <p className="text-red-100 font-medium">Before:</p>
                      <p className="text-sm">{item.before}</p>
                    </div>
                    <div className="text-2xl my-2">↓</div>
                    <div className="bg-green-500/20 rounded-lg p-3">
                      <p className="text-green-100 font-medium">After:</p>
                      <p className="text-sm">{item.after}</p>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection animation="fadeInUp" delay={600}>
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-center mb-8">利用シーン</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl mb-3">🎓</div>
                  <h4 className="font-bold text-lg mb-2">就活準備に</h4>
                </div>
                <div>
                  <div className="text-3xl mb-3">💼</div>
                  <h4 className="font-bold text-lg mb-2">転職活動の整理に</h4>
                </div>
                <div>
                  <div className="text-3xl mb-3">🚀</div>
                  <h4 className="font-bold text-lg mb-2">キャリア停滞から抜け出す一歩に</h4>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* スクリーンショット挿入エリア2: 分析結果画面 */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">詳細な分析結果</h2>
              <p className="text-lg text-gray-600">わかりやすく、実践的な結果をお届け</p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection animation="scaleIn" delay={300}>
            {/* スクリーンショット挿入箇所2 */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-100 to-purple-200 rounded-3xl p-8 shadow-2xl border-4 border-white max-w-sm">
                <div className="bg-white rounded-2xl overflow-hidden">
                  <img 
                    src="/images/analysis-result.png" 
                    alt="分析結果のスクリーンショット" 
                    className="w-full h-auto object-cover"
                  />
                </div>              
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 5. 社会的証明（権威性） */}
      <section className="py-24 bg-white/70 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">プロが集結</span>
                してつくったから
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                「自己分析で終わらない」実践的な結果が得られます
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🏢",
                title: "プライム上場企業の人事が監修",
                description: "実際の採用現場で求められる観点を反映",
                color: "from-blue-50 to-blue-100",
                border: "border-blue-200"
              },
              {
                icon: "📜",
                title: "国家資格キャリアコンサルタントが参画",
                description: "専門的な理論と実践知を組み合わせ",
                color: "from-green-50 to-green-100",
                border: "border-green-200"
              },
              {
                icon: "💡",
                title: "プロフェッショナルコーチングの知見を反映",
                description: "行動変容を促す構造化されたアプローチ",
                color: "from-purple-50 to-purple-100",
                border: "border-purple-200"
              }
            ].map((item, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 200}>
                <Card className={`group hover:shadow-xl transition-all duration-300 border-2 ${item.border} bg-gradient-to-br ${item.color} hover:scale-105`}>
                  <CardContent className="p-8 text-center">
                    <div className="text-4xl mb-6">{item.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 6. 料金・プラン */}
      <section className="py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                今なら<span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">無料登録</span>で
              </h2>
              <p className="text-2xl font-bold text-green-600 mb-4">
                全種類のお試し分析が可能！
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="scaleIn" delay={300}>
            <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-green-200">
              <div className="text-center">
                <div className="inline-flex items-center px-6 py-3 bg-green-100 text-green-800 rounded-full text-lg font-bold mb-6">
                  🎉 期間限定キャンペーン
                </div>
                <div className="text-5xl font-bold text-green-600 mb-4">無料</div>
                <p className="text-xl text-gray-600 mb-8">
                  すべての分析機能をお試しいただけます
                </p>
                <ul className="text-left max-w-md mx-auto space-y-3 mb-8">
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    キャリアパス分析
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    モヤモヤ分析
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    価値観分析
                  </li>
                  <li className="flex items-center">
                    <svg className="w-5 h-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    強み分析
                  </li>
                </ul>
                <button
                  onClick={() => router.push('/auth/signup')}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold text-xl hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  今すぐ無料で始める
                </button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* 7. FAQ（不安解消） */}
      <section className="py-24 bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection animation="fadeInUp">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                よくある
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">ご質問</span>
              </h2>
            </div>
          </AnimatedSection>

          <div className="space-y-6">
            {[
              {
                question: "Q. 無料登録だけでも使えますか？",
                answer: "はい。すべての分析をお試しいただけます。"
              },
              {
                question: "Q. データは安全ですか？",
                answer: "セキュリティ基準を満たした環境で管理しています。"
              },
              {
                question: "Q. キャリアの専門知識がなくても使えますか？",
                answer: "大丈夫です。結果は誰でもわかりやすく解説されます。"
              }
            ].map((faq, index) => (
              <AnimatedSection key={index} animation="fadeInUp" delay={index * 200}>
                <Card className="p-6 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">→ {faq.answer}</p>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* 8. クロージングCTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection animation="fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              「納得キャリア」を手に入れる<br />
              最初の一歩を。
            </h2>
            <p className="text-xl mb-12">
              今すぐ無料で自己分析を試しましょう。
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="inline-flex items-center px-12 py-5 bg-white text-blue-600 rounded-2xl font-bold text-xl hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-white/50 transition-all duration-200 shadow-2xl hover:shadow-3xl transform hover:scale-105"
            >
              無料で自己分析を始める
              <svg className="ml-3 w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <p className="text-sm text-blue-100 mt-6">
              クレジットカード不要 • いつでもキャンセル可能
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* フッター */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold">Career Compass</h3>
          </div>
          <p className="text-gray-400 mb-6">
            キャリアに本気で向き合う人のための プロフェッショナル自己分析ツール
          </p>
          <p className="text-sm text-gray-500">
            © 2025 Career Compass. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
