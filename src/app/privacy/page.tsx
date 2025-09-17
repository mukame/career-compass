'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Calendar, Eye, Lock, Database, Users, AlertTriangle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            プライバシーポリシー
          </h1>
          <p className="text-lg text-gray-600">
            お客様の個人情報保護に関する当社の取り組み
          </p>
          <div className="flex items-center justify-center space-x-2 mt-4 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>最終更新日：2025年9月7日</span>
          </div>
        </motion.div>

        {/* プライバシー保護の約束 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-green-800 mb-2">プライバシー保護への約束</h3>
              <p className="text-green-700 text-sm mb-2">
                Career Compassは、お客様の個人情報とプライバシーの保護を最優先に考えています。
              </p>
              <div className="text-green-700 text-sm space-y-1">
                <p>✅ 業界標準のセキュリティ対策を実施</p>
                <p>✅ 必要最小限のデータのみ収集</p>
                <p>✅ 第三者への無断提供は一切なし</p>
                <p>✅ お客様による情報管理権限の尊重</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* プライバシーポリシー本文 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-8 space-y-8"
        >
          
          {/* 第1条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <Database className="mr-3 h-6 w-6 text-indigo-500" />
              第1条（個人情報の定義）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>本プライバシーポリシーにおいて「個人情報」とは、個人情報保護法に規定する個人情報を指し、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日その他の記述等により特定の個人を識別することができるものを指します。</p>
            </div>
          </section>

          {/* 第2条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <Eye className="mr-3 h-6 w-6 text-indigo-500" />
              第2条（収集する個人情報）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、以下の個人情報を収集いたします：</p>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">📝 登録・認証情報</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <p>• メールアドレス</p>
                  <p>• 氏名（姓名・フリガナ）</p>
                  <p>• 年齢</p>
                  <p>• パスワード（暗号化して保存）</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">🎯 キャリア・プロフィール情報</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <p>• 職業・業界</p>
                  <p>• 経験年数</p>
                  <p>• スキル・興味分野</p>
                  <p>• キャリア目標</p>
                  <p>• 利用動機</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">🧠 AI分析入力データ</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <p>• 各種分析への回答内容</p>
                  <p>• 悩みや課題に関する記述</p>
                  <p>• 価値観・強みに関する自己評価</p>
                  <p>• キャリアパスに関する希望</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">💳 決済・利用情報</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <p>• 課金プラン情報</p>
                  <p>• 利用履歴・ログイン記録</p>
                  <p>• サービス利用状況</p>
                  <p>※ クレジットカード情報は決済代行業者が管理し、当社では保持しません</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold text-gray-800">📱 技術的情報</h4>
                <div className="pl-4 space-y-1 text-sm">
                  <p>• IPアドレス</p>
                  <p>• ブラウザ情報</p>
                  <p>• アクセス日時</p>
                  <p>• Cookie情報</p>
                </div>
              </div>
            </div>
          </section>

          {/* 第3条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <Users className="mr-3 h-6 w-6 text-indigo-500" />
              第3条（個人情報の利用目的）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、収集した個人情報を以下の目的で利用いたします：</p>
              <div className="pl-4 space-y-2">
                <p><strong>1. サービス提供：</strong>AI分析機能、キャリアサポート、目標管理機能の提供</p>
                <p><strong>2. 認証・本人確認：</strong>ユーザー認証、アカウント管理、不正利用防止</p>
                <p><strong>3. 課金・決済：</strong>料金計算、決済処理、利用制限管理</p>
                <p><strong>4. カスタマーサポート：</strong>お問い合わせ対応、技術サポート</p>
                <p><strong>5. サービス改善：</strong>機能改善、新機能開発、品質向上（統計的処理のみ）</p>
                <p><strong>6. マーケティング：</strong>サービス案内、重要な通知の送信</p>
                <p><strong>7. 法的対応：</strong>法令に基づく対応、紛争解決</p>
              </div>
            </div>
          </section>

          {/* 第4条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <AlertTriangle className="mr-3 h-6 w-6 text-indigo-500" />
              第4条（個人情報の第三者提供）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、以下の場合を除き、個人情報を第三者に提供いたしません：</p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-2">第三者提供を行う場合</h4>
                <div className="pl-4 space-y-1 text-sm text-red-700">
                  <p>• ユーザーの同意を得た場合</p>
                  <p>• 法令に基づく場合</p>
                  <p>• 人の生命、身体または財産の保護のために必要がある場合</p>
                  <p>• 国の機関等への協力が必要な場合</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">業務委託先への提供</h4>
                <p className="text-sm text-blue-700">
                  サービス運営上必要な範囲で、十分な個人情報保護水準を確保した業務委託先
                  （決済代行業者、クラウドサービス提供者等）に個人情報を委託することがあります。
                </p>
              </div>
            </div>
          </section>

          {/* 第5条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 flex items-center">
              <Lock className="mr-3 h-6 w-6 text-indigo-500" />
              第5条（個人情報の安全管理）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、個人情報の漏洩、滅失または毀損の防止その他の安全管理のため、以下の措置を講じています：</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2 flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    技術的保護措置
                  </h4>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>• SSL/TLS暗号化通信</p>
                    <p>• データベース暗号化</p>
                    <p>• アクセス制御・認証</p>
                    <p>• ファイアウォール設置</p>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    組織的保護措置
                  </h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>• 個人情報保護規程の策定</p>
                    <p>• 従業員教育の実施</p>
                    <p>• アクセス権限管理</p>
                    <p>• 定期的な監査実施</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* 第6条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第6条（Cookieの利用）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社サービスでは、以下の目的でCookieを利用します：</p>
              <div className="pl-4 space-y-2">
                <p>• ユーザー認証状態の維持</p>
                <p>• サービス利用状況の分析</p>
                <p>• ユーザー体験の向上</p>
                <p>• セキュリティ機能の提供</p>
              </div>
              <p className="text-sm bg-gray-50 p-3 rounded-lg">
                Cookieの使用を望まない場合は、ブラウザの設定で無効にできますが、
                一部機能が正常に動作しない可能性があります。
              </p>
            </div>
          </section>

          {/* 第7条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第7条（個人情報に関するお客様の権利）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>お客様は、当社に対して以下の権利を有します：</p>
              
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-2">お客様の権利</h4>
                <div className="text-sm text-indigo-700 space-y-1">
                  <p>📄 <strong>開示請求：</strong>保有する個人情報の開示を求める権利</p>
                  <p>✏️ <strong>訂正・削除：</strong>個人情報の訂正・削除を求める権利</p>
                  <p>⏸️ <strong>利用停止：</strong>個人情報の利用停止を求める権利</p>
                  <p>📧 <strong>マーケティング停止：</strong>マーケティング目的の利用停止を求める権利</p>
                  <p>📤 <strong>データポータビリティ：</strong>データの移行を求める権利</p>
                </div>
              </div>
              
              <p className="text-sm">
                これらの権利を行使される場合は、本人確認の上、合理的な期間内に対応いたします。
                詳細は<Link href="/contact" className="text-indigo-600 hover:underline">お問い合わせフォーム</Link>よりご連絡ください。
              </p>
            </div>
          </section>

          {/* 第8条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第8条（個人情報の保存期間）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>当社は、利用目的の達成に必要な期間に限り個人情報を保存します：</p>
              <div className="pl-4 space-y-2">
                <p>• <strong>アカウント情報：</strong>退会から1年間</p>
                <p>• <strong>分析データ：</strong>各プランに応じた保存期間</p>
                <p>• <strong>決済情報：</strong>法令で定められた期間</p>
                <p>• <strong>ログ情報：</strong>最大1年間</p>
              </div>
            </div>
          </section>

          {/* 第9条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第9条（未成年者の個人情報）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>18歳未満の方がサービスを利用される場合は、保護者の同意が必要です。未成年者の個人情報については、保護者の方からの開示・削除等の請求にも対応いたします。</p>
            </div>
          </section>

          {/* 第10条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第10条（プライバシーポリシーの変更）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>1. 当社は、法令の改正やサービス内容の変更に伴い、本プライバシーポリシーを変更することがあります。</p>
              <p>2. 重要な変更については、サービス内での通知やメール等により、事前にお知らせいたします。</p>
              <p>3. 変更後のプライバシーポリシーは、本サイトへの掲載により効力を生じます。</p>
            </div>
          </section>

          {/* 第11条 */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500">
              第11条（お問い合わせ窓口）
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>個人情報の取扱いに関するお問い合わせは、以下の窓口までお願いいたします：</p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p><strong>Career Compass カスタマーサポート</strong></p>
                <p>お問い合わせ：<Link href="/contact" className="text-indigo-600 hover:underline">専用フォーム</Link></p>
                <p>受付時間：平日 9:00-18:00</p>
              </div>
            </div>
          </section>

          {/* 施行日 */}
          <section>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600 font-medium">
                本プライバシーポリシーは、2025年9月7日から施行されます。
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
            <Link href="/terms" className="text-indigo-600 hover:underline">
              利用規約
            </Link>
            <Link href="/contact" className="text-indigo-600 hover:underline">
              お問い合わせ
            </Link>
            <Link href="/dashboard" className="text-indigo-600 hover:underline">
              ダッシュボードに戻る
            </Link>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-500">
            <Shield className="w-4 h-4" />
            <span className="text-sm">お客様のプライバシーを最優先に保護します</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
