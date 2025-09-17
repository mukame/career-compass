'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'

// ナビゲーションを非表示にするパス
const NO_NAVIGATION_PATHS = [
  '/',           // LP
  '/auth/login', // ログインページ
  '/auth/signup' // 新規登録ページ
]

interface ConditionalNavigationProps {
  children: React.ReactNode
}

export function ConditionalNavigation({ children }: ConditionalNavigationProps) {
  const pathname = usePathname()
  
  // 現在のパスがナビゲーション非表示対象かチェック
  const shouldHideNavigation = NO_NAVIGATION_PATHS.includes(pathname)
  
  if (shouldHideNavigation) {
    // ナビゲーション非表示の場合：そのまま表示
    return (
      <main className="min-h-screen">
        {children}
      </main>
    )
  }
  
  // ナビゲーション表示の場合：PC版でマージンを適用
  return (
    <div className="min-h-screen">
      <Navigation />
      {/* PC表示: ナビゲーション分のマージンを追加 */}
      <div className="lg:ml-64">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  )
}
