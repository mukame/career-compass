'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { ReferralCodeGenerator } from '@/components/referrals/ReferralCodeGenerator'
import { ReferralHistory } from '@/components/referrals/ReferralHistory'
import { 
  Users, 
  Gift, 
  Heart,
  Coins,
  CheckCircle,
  ArrowRight,
  Star,
  Target,
  Zap
} from 'lucide-react'

export default function ReferralsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate')

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            友達紹介プログラム
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            友達を招待してお互いにお得な特典をゲット！
            あなたも友達も嬉しい Win-Win の紹介システム
          </p>
        </div>

        {/* 特典の説明 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">あなたの特典</h3>
              <div className="text-3xl font-bold text-blue-600 mb-2">
                通常分析チケット 3枚
              </div>
              <p className="text-sm text-gray-700 mb-4">
                友達が新規登録すると自動的に付与されます
              </p>
              <div className="flex items-center justify-center space-x-1 text-sm text-blue-700">
                <Coins className="w-4 h-4" />
                <span>約600円相当</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">友達の特典</h3>
              <div className="text-3xl font-bold text-green-600 mb-2">
                通常分析チケット 5枚
              </div>
              <p className="text-sm text-gray-700 mb-4">
                新規登録時に自動的に付与されます
              </p>
              <div className="flex items-center justify-center space-x-1 text-sm text-green-700">
                <Coins className="w-4 h-4" />
                <span>約1000円相当</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 紹介の流れ */}
        <Card className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
          <CardHeader>
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              紹介の流れ
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">1</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">コード生成</h4>
                <p className="text-sm text-gray-600">
                  あなた専用の紹介コードを生成します
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">2</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">友達に共有</h4>
                <p className="text-sm text-gray-600">
                  SNSやメールで友達にコードをシェア
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-lg font-bold text-purple-600">3</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">友達が登録</h4>
                <p className="text-sm text-gray-600">
                  コードを入力して新規登録完了
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">特典付与</h4>
                <p className="text-sm text-gray-600">
                  お互いにチケットが自動付与
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'generate'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              コード生成・共有
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              紹介履歴
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div className="mb-12">
          {activeTab === 'generate' ? (
            <div className="max-w-2xl mx-auto">
              <ReferralCodeGenerator />
            </div>
          ) : (
            <ReferralHistory />
          )}
        </div>

        {/* 紹介の条件 */}
        <Card className="mb-12 bg-yellow-50 border-yellow-200">
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Target className="w-6 h-6 mr-2 text-yellow-600" />
              紹介成功の条件
            </h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">紹介者（あなた）の条件</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>有料プラン（スタンダードまたはプレミアム）に加入済み</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>初回分析を1回以上完了している</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>アカウントが正常に利用できる状態</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">被紹介者（友達）の条件</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>Career Compass初回利用（新規ユーザー）</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>紹介コードを正確に入力して登録</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>コードが有効期限内（1週間以内）</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* よくある質問 */}
        <Card className="mb-12">
          <CardHeader>
            <h3 className="text-xl font-bold text-gray-900">よくある質問</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">紹介コードの有効期限はありますか？</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                はい。紹介コードは生成から1週間が有効期限です。期限を過ぎた場合は新しいコードを生成してください。
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">何人まで紹介できますか？</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                紹介人数に制限はありません！たくさんの友達を紹介してチケットを獲得してください。
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">特典はいつ付与されますか？</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                友達が紹介コードを使用して新規登録を完了した直後に、自動的に両方のアカウントに特典が付与されます。
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-900">自分の紹介コードは何回でも使えますか？</span>
                <ArrowRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="mt-3 p-3 text-sm text-gray-700 bg-white border border-gray-100 rounded-lg">
                1つの紹介コードは1回のみ使用可能です。使用後は新しいコードを生成してください。
              </div>
            </details>
          </CardContent>
        </Card>

        {/* アップグレード提案 */}
        <div className="text-center">
          <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200 max-w-3xl mx-auto">
            <CardContent className="p-8">
              <Zap className="w-12 h-12 mx-auto mb-4 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                まだ有料プランに加入していませんか？
              </h3>
              <p className="text-gray-700 mb-6">
                友達紹介機能を利用するには有料プランへの加入が必要です。
                今すぐアップグレードして友達招待を始めましょう！
              </p>
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white"
                onClick={() => window.location.href = '/pricing'}
              >
                <Star className="w-5 h-5 mr-2" />
                プランをアップグレード
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
