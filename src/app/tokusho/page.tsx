'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building, Calendar, CreditCard, Phone, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function TokushoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            特定商取引法に基づく表記
          </h1>
          <p className="text-lg text-gray-600">
            Career Compassサービスの販売事業者情報
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>最終更新日：2025年9月7日</span>
          </div>
        </motion.div>

        {/* 重要事項 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">安心してご利用いただくために</h3>
              <p className="text-blue-700 text-sm">
                Career Compassは特定商取引法に基づき、以下の通り販売事業者情報を明示いたします。
                ご購入前に必ずご確認ください。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 特定商取引法表記本文 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          
          {/* 販売事業者 */}
          {/* <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 flex items-center">
              <Building className="mr-3 h-5 w-5 text-blue-500" />
              販売事業者
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">事業者名</span>
                <span className="font-medium">［事業者名を記入］</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">代表者</span>
                <span className="font-medium">［代表者名を記入］</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">所在地</span>
                <span className="font-medium">［住所を記入］</span>
              </div>
            </div>
          </div> */}

          {/* 連絡先 */}
          {/* <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 flex items-center">
              <Phone className="mr-3 h-5 w-5 text-blue-500" />
              連絡先
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">電話番号</span>
                <span className="font-medium">［電話番号を記入］</span>
                <span className="text-xs text-gray-500">受付時間：平日 9:00-18:00</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">メールアドレス</span>
                <span className="font-medium">［メールアドレスを記入］</span>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-500">お問い合わせ</span>
                <Link href="/contact" className="font-medium text-blue-600 hover:underline">
                  専用お問い合わせフォーム
                </Link>
              </div>
            </div>
          </div> */}

          {/* 商品・サービス */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 flex items-center">
              <CreditCard className="mr-3 h-5 w-5 text-blue-500" />
              販売商品・サービス
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-2">Career Compass サブスクリプションサービス</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>フリープラン</span>
                    <span className="font-medium">無料</span>
                  </div>
                  <div className="flex justify-between">
                    <span>スタンダードプラン（月払い）</span>
                    <span className="font-medium">月額 1,480円（税込）</span>
                  </div>
                  <div className="flex justify-between">
                    <span>スタンダードプラン（年払い）</span>
                    <span className="font-medium">年額 14,208円（税込）※月額換算1,184円</span>
                  </div>
                  <div className="flex justify-between">
                    <span>プレミアムプラン（月払い）</span>
                    <span className="font-medium">月額 2,980円（税込）</span>
                  </div>
                  <div className="flex justify-between">
                    <span>プレミアムプラン（年払い）</span>
                    <span className="font-medium">年額 28,608円（税込）※月額換算2,384円</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                <p><strong>提供内容：</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>AI分析機能（モヤモヤ分析、強み分析、キャリアパス分析、価値観分析）</li>
                  <li>分析結果の保存・履歴管理</li>
                  <li>目標管理・進捗追跡機能</li>
                  <li>詳細レポート機能</li>
                  <li>カスタマーサポート</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 支払い方法 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              支払い方法・時期
            </h2>
            <div className="space-y-3 text-gray-700">
              <div>
                <h4 className="font-medium mb-2">支払い方法</h4>
                <div className="text-sm space-y-1">
                  <p>• クレジットカード決済（Visa, MasterCard, American Express, JCB）</p>
                  <p>• 決済代行：Stripe</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">支払い時期</h4>
                <div className="text-sm space-y-1">
                  <p>• 月払い：毎月の契約更新日</p>
                  <p>• 年払い：年間契約時および更新時</p>
                  <p>• 初回：プラン選択・決済完了時</p>
                </div>
              </div>
            </div>
          </div>

          {/* サービス提供時期 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              サービス提供時期
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>• 決済完了後、即時にサービス利用が可能になります</p>
              <p>• システムメンテナンス等によりサービス提供が遅れる場合は、事前にお知らせいたします</p>
            </div>
          </div>

          {/* 返金・解約 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 flex items-center">
              <RefreshCw className="mr-3 h-5 w-5 text-blue-500" />
              返金・解約について
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <h4 className="font-semibold text-amber-800 mb-2">返金について</h4>
                    <div className="text-amber-700 space-y-1">
                      <p>• サブスクリプションサービスの性質上、原則として返金はお受けできません</p>
                      <p>• 当社システム障害等、当社の責に帰すべき事由による場合は個別対応いたします</p>
                      <p>• 詳細は<Link href="/refund" className="text-amber-600 hover:underline font-medium">返金ポリシー</Link>をご確認ください</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">解約について</h4>
                <div className="text-sm space-y-1">
                  <p>• 解約はいつでも可能です</p>
                  <p>• 解約手続き完了後、次回更新日からサービス停止となります</p>
                  <p>• 月の途中での解約でも、当月末まではサービスをご利用いただけます</p>
                  <p>• 年払いプランの場合、契約期間満了まではサービスをご利用いただけます</p>
                </div>
              </div>
            </div>
          </div>

          {/* 動作環境 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              動作環境
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <div>
                <h4 className="font-medium mb-2">推奨ブラウザ</h4>
                <div className="space-y-1">
                  <p>• Google Chrome（最新版）</p>
                  <p>• Mozilla Firefox（最新版）</p>
                  <p>• Safari（最新版）</p>
                  <p>• Microsoft Edge（最新版）</p>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">その他の要件</h4>
                <div className="space-y-1">
                  <p>• インターネット接続環境</p>
                  <p>• JavaScript有効化</p>
                  <p>• Cookie有効化</p>
                </div>
              </div>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              その他の注意事項
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="space-y-2">
                {/* <p>• 当サービスは継続的なサブスクリプションサービスです</p> */}
                <p>• AI分析結果は参考情報であり、結果を保証するものではありません</p>
                <p>• サービス内容は予告なく変更される場合があります</p>
                <p>• 利用規約、プライバシーポリシーも併せてご確認ください</p>
                <p>• 18歳未満の方のご利用には保護者の同意が必要です</p>
              </div>
            </div>
          </div>

          {/* 関連法規 */}
          {/* <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              準拠法・管轄裁判所
            </h2>
            <div className="space-y-3 text-gray-700 text-sm">
              <p>• 準拠法：日本法</p>
              <p>• 管轄裁判所：当社所在地を管轄する裁判所</p>
            </div>
          </div> */}

          {/* 施行日 */}
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <p className="text-gray-600 font-medium">
              本表記は、2025年10月1日から施行されています。
            </p>
          </div>
        </motion.div>

        {/* フッターナビ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/terms" className="text-blue-600 hover:underline">
              利用規約
            </Link>
            <Link href="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            {/* <Link href="/refund" className="text-blue-600 hover:underline">
              返金ポリシー
            </Link> */}
            <Link href="/contact" className="text-blue-600 hover:underline">
              お問い合わせ
            </Link>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ダッシュボードに戻る
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">特定商取引法に基づく適切な表記</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
