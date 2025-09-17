import React from 'react'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'Career Compass',
  description = 'あなたのキャリアアップに伴走する自己理解・自己変革支援ツール'
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Career Compass</h1>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && title !== 'Career Compass' && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-2 text-lg text-gray-600">{description}</p>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  )
}
