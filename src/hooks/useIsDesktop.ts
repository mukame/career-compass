'use client'

import { useState, useEffect } from 'react'

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    
    const checkIsDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }

    // 初回チェック
    checkIsDesktop()

    // リサイズ時の更新
    window.addEventListener('resize', checkIsDesktop)
    
    return () => {
      window.removeEventListener('resize', checkIsDesktop)
    }
  }, [])

  return { isDesktop, isClient }
}
