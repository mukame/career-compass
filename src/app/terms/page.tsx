'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Calendar, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TermsOfServicePage() {
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
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            利用規約
          </h1>
          <p className="text-lg text-gray-600">
            Career Compassサービスのご利用にあたって
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>最終更新日：2025年9月7日</span>
          </div>
        </motion.div>

        {/* 重要なお知らせ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-800 mb-2">重要事項</h3>
              <p className="text-amber-700 text-sm">
                本サービスをご利用いただく前に、必ずこの利用規約をお読みください。
                サービスのご利用により、本規約に同意いただいたものとみなします。
              </p>
            </div>
          </div>
        </motion.div>

        {/* 利用規約本文 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
        >
          
          {/* 第1条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第1条（定義）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>本利用規約（以下「本規約」）において使用する用語の定義は、次のとおりとします。</p>
              <div className="pl-4 space-y-2">
                <p><strong>1. サービス：</strong>当社が運営する「Career Compass」およびこれに関連するサービス</p>
                <p><strong>2. 当社：</strong>本サービスを運営する事業者</p>
                <p><strong>3. ユーザー：</strong>本サービスを利用する個人</p>
                <p><strong>4. コンテンツ：</strong>本サービス上で提供される文章、画像、動画、音声、その他の情報</p>
                <p><strong>5. AI分析：</strong>人工知能技術を用いたキャリア・強み・価値観等の分析機能</p>
              </div>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第2条（本規約の適用）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 本規約は、本サービスの利用に関して、当社とユーザーとの間に適用されます。</p>
              <p>2. 当社が本サービス上で掲載する個別の利用条件は、本規約の一部を構成します。</p>
              <p>3. 本規約と個別の利用条件との間に齟齬がある場合、個別の利用条件が優先して適用されます。</p>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第3条（アカウント登録）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. ユーザーは、当社の定める方法により、利用登録を申請できます。</p>
              <p>2. 当社は、以下の場合、登録申請を承認しないことがあります：</p>
              <div className="pl-4 space-y-1">
                <p>• 申請内容に虚偽、誤記、記載漏れがある場合</p>
                <p>• 過去に本規約違反により登録を取り消された場合</p>
                <p>• 反社会的勢力に該当する場合</p>
                <p>• その他、当社が不適切と判断した場合</p>
              </div>
              <p>3. ユーザーは、登録情報に変更があった場合、速やかに当社に通知するものとします。</p>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第4条（料金・支払い）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 有料サービスの利用料金は、当社が別途定める料金表によります。</p>
              <p>2. 支払方法は、クレジットカード決済とし、毎月または年払いでの前払いとなります。</p>
              <p>3. 一度支払われた料金は、当社の責に帰すべき事由がある場合を除き、返金いたしません。</p>
              <p>4. 料金の支払いが遅延した場合、当社は事前通知なくサービス利用を停止できます。</p>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第5条（AI分析サービスについて）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 本サービスで提供するAI分析は、一般的な傾向に基づく参考情報です。</p>
              <p>2. 分析結果は、ユーザーの入力内容に基づく推定であり、結果を保証するものではありません。</p>
              <p>3. 分析結果に基づく判断・行動は、ユーザー自身の責任で行ってください。</p>
              <p>4. 当社は分析結果の正確性、完全性について一切保証いたしません。</p>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第6条（禁止事項）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>ユーザーは、以下の行為を行ってはならないものとします：</p>
              <div className="pl-4 space-y-1">
                <p>• 法令または本規約に違反する行為</p>
                <p>• 当社や第三者の知的財産権を侵害する行為</p>
                <p>• 虚偽の情報を登録または入力する行為</p>
                <p>• 本サービスの運営を妨害する行為</p>
                <p>• 他のユーザーに迷惑をかける行為</p>
                <p>• 反社会的勢力への利益供与行為</p>
                <p>• アカウントを第三者に貸与、譲渡する行為</p>
                <p>• その他、当社が不適切と判断する行為</p>
              </div>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第7条（個人情報・データの取扱い）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 当社は、別途定める<Link href="/privacy" className="text-blue-600 hover:underline">プライバシーポリシー</Link>に従い、個人情報を適切に取り扱います。</p>
              <p>2. ユーザーが入力した分析データは、サービス向上のため統計的に処理する場合があります。</p>
              <p>3. 個人を特定できない形で加工したデータを、研究・開発目的で利用することがあります。</p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第8条（サービス利用の停止・制限）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、以下の場合、事前通知なくサービス利用を停止・制限できます：</p>
              <div className="pl-4 space-y-1">
                <p>• 本規約に違反した場合</p>
                <p>• 料金支払いが遅延した場合</p>
                <p>• 長期間サービスの利用がない場合</p>
                <p>• その他、当社が必要と判断した場合</p>
              </div>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第9条（免責事項）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 当社は、本サービスの内容変更、中断、終了によって生じた損害について責任を負いません。</p>
              <p>2. 当社は、本サービスが完全、正確、安全であることを保証いたしません。</p>
              <p>3. ユーザー間または第三者との間で生じたトラブルについて、当社は責任を負いません。</p>
              <p>4. システム障害、通信障害等による損害について、当社は責任を負いません。</p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第10条（本規約の変更）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 当社は、本規約を随時変更することができます。</p>
              <p>2. 変更後の規約は、本サービス上での掲示により効力を生じます。</p>
              <p>3. ユーザーは、規約変更後の本サービス利用により、変更に同意したものとみなされます。</p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500">
              第11条（準拠法・管轄裁判所）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 本規約の解釈・適用については、日本法を準拠法とします。</p>
              <p>2. 本サービスに関する一切の紛争については、当社所在地を管轄する裁判所を専属的合意管轄裁判所とします。</p>
            </div>
          </section>

          {/* 施行日 */}
          <section>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 font-medium">
                本規約は、2025年9月7日から施行されます。
              </p>
            </div>
          </section>
        </motion.div>

        {/* フッターナビ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 text-center space-y-4"
        >
          <div className="flex justify-center space-x-6 text-sm">
            <Link href="/privacy" className="text-blue-600 hover:underline">
              プライバシーポリシー
            </Link>
            <Link href="/contact" className="text-blue-600 hover:underline">
              お問い合わせ
            </Link>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              ダッシュボードに戻る
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">安心・安全にご利用いただけます</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
