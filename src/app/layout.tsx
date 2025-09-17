import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { ConditionalNavigation } from '@/components/layouts/ConditionalNavigation'

export const metadata: Metadata = {
  title: 'Career Compass - あなたのキャリアアップパートナー',
  description: 'AIと共にキャリアアップの道筋を見つけましょう',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="bg-gray-50">
        <AuthProvider>
          <ConditionalNavigation>
            {children}
          </ConditionalNavigation>
        </AuthProvider>
      </body>
    </html>
  )
}
