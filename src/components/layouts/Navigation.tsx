'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { 
  Home,
  Brain,
  Target,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Compass,
  Star,
  Route,
  Heart,
  ChevronDown,
  Crown,
  Zap,
  ArrowUp,
  Sparkles,
  Shield,
  FileText,
  Mail,
  Coins,
  Users,
  HelpCircle  // 🔧 追加: FAQアイコン
} from 'lucide-react'

interface Profile {
  id: string
  subscription_status: string
  full_name?: string
}

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAnalysisMenuOpen, setIsAnalysisMenuOpen] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      // プロフィール情報を取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, subscription_status, full_name')
        .eq('id', user.id)
        .single()
      
      setProfile(profileData)
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleUpgradeClick = () => {
    setShowUpgradeModal(true)
  }

  const isPremium = profile?.subscription_status === 'premium'
  const planDisplayName = isPremium ? 'プレミアム' : 'フリー'
  const planColor = isPremium ? 'bg-gradient-to-r from-yellow-400 to-orange-500' : 'bg-gray-500'

  const analysisMenuItems = [
    {
      href: '/ai-analysis/clarity',
      label: 'モヤモヤ分析',
      icon: Brain,
      description: 'キャリアの悩みを整理',
      color: 'text-blue-600',
      isPremiumFeature: false
    },
    {
      href: '/ai-analysis/strengths',
      label: '強み分析',
      icon: Star,
      description: 'あなたの強みを発見',
      color: 'text-orange-600',
      isPremiumFeature: true
    },
    {
      href: '/ai-analysis/career-path',
      label: 'キャリアパス分析',
      icon: Route,
      description: '最適な道筋を提案',
      color: 'text-green-600',
      isPremiumFeature: true
    },
    {
      href: '/ai-analysis/values',
      label: '価値観分析',
      icon: Heart,
      description: '価値観を明確化',
      color: 'text-purple-600',
      isPremiumFeature: true
    }
  ]

  const navigationItems = [
    {
      href: '/dashboard',
      label: 'ダッシュボード',
      icon: Home,
      color: 'text-blue-600'
    },
    {
      href: '/goals',
      label: '目標管理',
      icon: Target,
      color: 'text-green-600'
    },
    {
      href: '/analysis-history',
      label: '分析履歴',
      icon: BarChart3,
      color: 'text-indigo-600'
    },
    {
      label: 'チケット購入',
      href: '/tickets',
      icon: Coins,
    },
    {
      label: '友達紹介',
      href: '/referrals', 
      icon: Users
    }
  ]

  if (!user || !profile) {
    return null
  }

  return (
    <>
      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                プレミアムプランにアップグレード
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                すべてのAI分析機能、分析結果の保存、詳細なレポート機能をご利用いただけます。
              </p>
              
              <div className="space-y-3">
                <Button 
                  onClick={() => router.push('/pricing')}
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white"
                >
                  <Crown className="mr-2 h-4 w-4" />
                  プレミアムプランを見る
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowUpgradeModal(false)}
                  className="w-full"
                >
                  後で確認する
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* デスクトップナビゲーション */}
      <nav className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-200 lg:bg-white lg:shadow-sm">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Career Compass</span>
            </Link>
          </div>

          {/* プラン表示セクション */}
          <div className="mt-6 mx-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${planColor}`}></div>
                  <span className="text-sm font-medium text-gray-900">{planDisplayName}プラン</span>
                  {isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
              </div>
              
              <div className="text-xs text-gray-600 mb-3">
                {isPremium 
                  ? 'すべての機能をご利用いただけます' 
                  : 'モヤモヤ分析のみ利用可能'
                }
              </div>

              {!isPremium && (
                <Button
                  onClick={handleUpgradeClick}
                  size="sm"
                  className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs"
                >
                  <ArrowUp className="mr-1 h-3 w-3" />
                  アップグレード
                </Button>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {/* メインナビゲーション */}
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon className={`mr-3 h-5 w-5 ${isActive ? item.color : 'text-gray-400'}`} />
                    {item.label}
                  </Link>
                )
              })}

              {/* AI分析メニュー */}
              <div className="mt-6">
                <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  AI分析機能
                </div>
                {analysisMenuItems.map((item) => {
                  const isActive = pathname === item.href
                  const isAccessible = !item.isPremiumFeature || isPremium
                  
                  return (
                    <div key={item.href} className="relative">
                      <Link
                        href={isAccessible ? item.href : '#'}
                        onClick={!isAccessible ? (e) => {
                          e.preventDefault()
                          handleUpgradeClick()
                        } : undefined}
                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                          isActive
                            ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border-r-2 border-gray-700'
                            : isAccessible 
                              ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              : 'text-gray-400 cursor-pointer hover:bg-yellow-50'
                        }`}
                      >
                        <item.icon className={`mr-3 h-5 w-5 ${
                          isActive ? item.color : 
                          isAccessible ? 'text-gray-400' : 'text-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">{item.label}</div>
                            {item.isPremiumFeature && !isPremium && (
                              <Crown className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                      
                      {item.isPremiumFeature && !isPremium && (
                        <div className="absolute inset-0 rounded-md border border-yellow-200 bg-yellow-50 bg-opacity-20 pointer-events-none">
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </nav>
          </div>

          {/* ユーザーメニュー */}
          <div className="flex-shrink-0 px-2 space-y-1">
            <Link
              href="/profile"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/profile'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <User className="mr-3 h-5 w-5 text-gray-400" />
              プロフィール
            </Link>
            <Link
              href="/settings"
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                pathname === '/settings'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Settings className="mr-3 h-5 w-5 text-gray-400" />
              設定
            </Link>
            <button
              onClick={handleSignOut}
              className="group flex items-center w-full px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              ログアウト
            </button>
          </div>

          {/* 🔧 修正: フッターリンク */}
          <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-center space-x-4 text-xs text-gray-500">
              <Link href="/faq" className="hover:text-gray-700 flex items-center space-x-1">
                <HelpCircle className="h-3 w-3" />
                <span>FAQ</span>
              </Link>
              <Link href="/terms" className="hover:text-gray-700 flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>利用規約</span>
              </Link>
              <Link href="/contact" className="hover:text-gray-700 flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>お問い合わせ</span>
              </Link>
            </div>
            <div className="flex justify-center space-x-3 text-xs text-gray-500 mt-2">
              <Link href="/privacy" className="hover:text-gray-700 flex items-center space-x-1">
                <Shield className="h-3 w-3" />
                <span>プライバシー</span>
              </Link>
              <Link href="/tokusho" className="hover:text-gray-700 flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>特商法表記</span>
              </Link>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400 mt-2">
              <Shield className="w-3 h-3" />
              <span className="text-xs">安心・安全にご利用いただけます</span>
            </div>
          </div>
        </div>
      </nav>

      {/* モバイルナビゲーション */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 shadow-sm">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Compass className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Career Compass</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            {/* モバイル用プランバッジ */}
            <div className={`px-2 py-1 rounded-full text-xs text-white font-medium flex items-center space-x-1 ${planColor}`}>
              {isPremium && <Crown className="h-3 w-3" />}
              <span>{planDisplayName}</span>
            </div>
            
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {isMenuOpen && (
          <div className="bg-white border-b border-gray-200 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* プラン情報（モバイル） */}
              {!isPremium && (
                <div className="mb-4 mx-2">
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">フリープラン</div>
                        <div className="text-xs text-gray-600">機能制限あり</div>
                      </div>
                      <Button
                        onClick={handleUpgradeClick}
                        size="sm"
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white text-xs"
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        アップグレード
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* メインナビゲーション */}
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <item.icon className={`mr-3 h-5 w-5 ${isActive ? item.color : 'text-gray-400'}`} />
                      {item.label}
                    </div>
                  </Link>
                )
              })}

              {/* AI分析メニュー */}
              <div className="pt-4">
                <button
                  onClick={() => setIsAnalysisMenuOpen(!isAnalysisMenuOpen)}
                  className="flex items-center justify-between w-full px-3 py-2 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider"
                >
                  AI分析機能
                  <ChevronDown className={`h-4 w-4 transition-transform ${isAnalysisMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isAnalysisMenuOpen && (
                  <div className="ml-4 space-y-1">
                    {analysisMenuItems.map((item) => {
                      const isActive = pathname === item.href
                      const isAccessible = !item.isPremiumFeature || isPremium
                      
                      return (
                        <Link
                          key={item.href}
                          href={isAccessible ? item.href : '#'}
                          onClick={(e) => {
                            if (!isAccessible) {
                              e.preventDefault()
                              handleUpgradeClick()
                            } else {
                              setIsMenuOpen(false)
                            }
                          }}
                          className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                            isActive
                              ? 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900'
                              : isAccessible
                                ? 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                : 'text-gray-400 hover:bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <item.icon className={`mr-3 h-4 w-4 ${
                              isActive ? item.color :
                              isAccessible ? 'text-gray-400' : 'text-gray-300'
                            }`} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{item.label}</div>
                                {item.isPremiumFeature && !isPremium && (
                                  <Crown className="h-3 w-3 text-yellow-500" />
                                )}
                              </div>
                              <div className="text-xs text-gray-500">{item.description}</div>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* ユーザーメニュー */}
              <div className="pt-4 space-y-1">
                <Link
                  href="/profile"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === '/profile'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <User className="mr-3 h-5 w-5 text-gray-400" />
                    プロフィール
                  </div>
                </Link>
                <Link
                  href="/settings"
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    pathname === '/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <Settings className="mr-3 h-5 w-5 text-gray-400" />
                    設定
                  </div>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                >
                  <LogOut className="mr-3 h-5 w-5 text-gray-400" />
                  ログアウト
                </button>
              </div>

              {/* 🔧 修正: モバイル用フッターリンク */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-1">
                  <Link
                    href="/faq"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <HelpCircle className="mr-3 h-4 w-4 text-gray-400" />
                      よくあるご質問
                    </div>
                  </Link>
                  <Link
                    href="/contact"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Mail className="mr-3 h-4 w-4 text-gray-400" />
                      お問い合わせ
                    </div>
                  </Link>
                  <Link
                    href="/terms"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FileText className="mr-3 h-4 w-4 text-gray-400" />
                      利用規約
                    </div>
                  </Link>
                  <Link
                    href="/privacy"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <Shield className="mr-3 h-4 w-4 text-gray-400" />
                      プライバシーポリシー
                    </div>
                  </Link>
                  <Link
                    href="/tokusho"
                    className="block px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center">
                      <FileText className="mr-3 h-4 w-4 text-gray-400" />
                      特定商取引法表記
                    </div>
                  </Link>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-400 mt-3 pb-2">
                  <Shield className="w-3 h-3" />
                  <span className="text-xs">安心・安全にご利用いただけます</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
