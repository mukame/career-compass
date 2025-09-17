'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, ChevronDown, ChevronUp, Search, Mail, Clock, MessageSquare, CreditCard, Shield, Bug, Lightbulb } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'features' | 'technical' | 'account';
}

const faqData: FAQItem[] = [
  // 一般的な質問
  {
    id: 1,
    category: 'general',
    question: 'Career Compassとは何ですか？',
    answer: 'Career CompassはAI技術を活用したキャリアアップ伴走ツールです。あなたのキャリアに関するモヤモヤを整理し、強みを発見し、最適なキャリアパスを見つけるお手伝いをします。AI分析機能により、客観的で具体的なキャリア指針を提供いたします。'
  },
  {
    id: 2,
    category: 'general',
    question: 'どのような人におすすめですか？',
    answer: '転職を考えている方、キャリアチェンジを検討している方、自分の強みがわからない方、将来のキャリアプランに悩んでいる方など、キャリアに関するお悩みをお持ちの18歳以上の方であればどなたでもご利用いただけます。'
  },
  {
    id: 3,
    category: 'general',
    question: '無料で利用できる機能はありますか？',
    answer: 'はい。フリープランでは基本的なプロフィール作成と1回の体験分析をご利用いただけます。まずは無料でお試しいただき、サービスの価値を実感してください。'
  },
  {
    id: 4,
    category: 'general',
    question: 'データの安全性は大丈夫ですか？',
    answer: 'お客様の個人情報とキャリアデータは最高水準のセキュリティで保護されています。SSL暗号化通信、厳格なアクセス制御、定期的なセキュリティ監査を実施し、安全性を確保しています。'
  },

  // 料金について
  {
    id: 5,
    category: 'pricing',
    question: '料金プランについて詳しく教えてください。',
    answer: 'フリープラン（無料）では体験分析が月1回、スタンダードプラン（月額1,480円）では全AI分析を合計月15回のAI分析、プレミアムプラン（月額2,980円）では無制限のAI分析をご利用いただけます。'
  },
  {
    id: 6,
    category: 'pricing',
    question: '支払い方法は何が利用できますか？',
    answer: 'クレジットカード（Visa、Mastercard、JCB、American Express）でのお支払いが可能です。安全で信頼性の高いStripe決済システムを採用しており、お客様の決済情報は暗号化されて保護されます。'
  },
  {
    id: 7,
    category: 'pricing',
    question: 'プランの変更や解約はいつでも可能ですか？',
    answer: 'はい、アカウント設定からいつでもプラン変更・解約が可能です。解約後も現在の契約期間終了まではサービスをご利用いただけます。解約手数料等は一切かかりません。'
  },
  {
    id: 8,
    category: 'pricing',
    question: '返金はできますか？',
    answer: 'サービスの性質上、基本的に返金は承っておりません。ただし、技術的な問題でサービスをご利用いただけない場合など、特別な事情がある場合は個別にご相談させていただきます。'
  },

  // 機能について
  {
    id: 9,
    category: 'features',
    question: 'AI分析ではどのような結果が得られますか？',
    answer: '4つの分析機能をご提供しています：①モヤモヤ整理（現在の悩みを明確化）②強み発見（あなたの才能を特定）③キャリアパス提案（最適な道筋を提示）④価値観診断（働く上で大切にしたいことを明確化）。それぞれ具体的で実践的なアドバイスを提供します。'
  },
  {
    id: 10,
    category: 'features',
    question: '分析結果はどの程度信頼できますか？',
    answer: '最新のAI技術（GPT-4o）を活用し、キャリアコンサルタントの知見を組み込んだ分析を行います。ただし、結果は参考情報として活用し、最終的な判断はご自身で行っていただくことをお勧めします。'
  },
  {
    id: 11,
    category: 'features',
    question: '分析結果は保存されますか？',
    answer: 'フリープランを除き、すべての分析結果はアカウントに保存され、いつでも振り返りが可能です。過去の分析結果と比較して、ご自身の成長や変化を確認することもできます。'
  },
  {
    id: 12,
    category: 'features',
    question: 'オンボーディングとは何ですか？',
    answer: 'Career Compassを初めてご利用いただく際のガイドプロセスです。プロフィール設定、体験分析、プラン選択、目標設定まで、ステップバイステップでサポートし、スムーズにサービスをご利用いただけるようにします。'
  },

  // 技術的な質問
  {
    id: 13,
    category: 'technical',
    question: 'どのデバイス・ブラウザから利用できますか？',
    answer: 'パソコン、スマートフォン、タブレットからブラウザ経由でご利用いただけます。推奨ブラウザ：Google Chrome、Mozilla Firefox、Microsoft Edge、Safariの最新版。Internet Explorerには対応していません。'
  },
  {
    id: 14,
    category: 'technical',
    question: 'アプリのダウンロードは必要ですか？',
    answer: 'いいえ、専用アプリのダウンロードは不要です。ブラウザから直接アクセスしてご利用いただけます。どこからでも、どのデバイスからでも同じアカウントでログインできます。'
  },
  {
    id: 15,
    category: 'technical',
    question: 'ログインできない場合はどうすればいいですか？',
    answer: 'パスワードを忘れた場合は「パスワードを忘れた方」リンクから再設定できます。それでも解決しない場合は、お問い合わせフォームから「アカウント・ログインの問題」を選択してご連絡ください。'
  },

  // アカウントについて
  {
    id: 16,
    category: 'account',
    question: 'アカウントの作成に料金はかかりますか？',
    answer: 'アカウントの作成は完全に無料です。メールアドレスとパスワードがあれば、すぐに始められます。フリープランでまずはお試しください。'
  },
  {
    id: 17,
    category: 'account',
    question: 'メールアドレスの変更は可能ですか？',
    answer: 'はい、アカウント設定からメールアドレスの変更が可能です。変更後は新しいメールアドレスに確認メールが送信されますので、認証を完了してください。'
  },
  {
    id: 18,
    category: 'account',
    question: 'アカウントを削除したい場合はどうすればいいですか？',
    answer: 'アカウント設定から削除手続きができます。削除すると、すべてのデータが完全に削除され、復旧できませんのでご注意ください。'
  }
];

const categories = {
  general: { name: '一般的な質問', icon: HelpCircle, color: 'blue' },
  pricing: { name: '料金・プラン', icon: CreditCard, color: 'green' },
  features: { name: '機能・分析', icon: Lightbulb, color: 'purple' },
  technical: { name: '技術的な質問', icon: Bug, color: 'orange' },
  account: { name: 'アカウント', icon: Shield, color: 'red' }
};

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const toggleItem = (id: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  const filteredFAQs = faqData
    .filter(faq => faq.category === activeCategory)
    .filter(faq => 
      searchQuery === '' || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-500 rounded-2xl mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            よくあるご質問
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Career Compassについてのよくある質問をカテゴリ別にまとめました。<br />
            お探しの情報が見つからない場合は、お気軽にお問い合わせください。
          </p>
        </motion.div>

        {/* 検索ボックス */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-md mx-auto mb-8"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="FAQ内を検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* カテゴリサイドバー */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">カテゴリ</h3>
              <div className="space-y-2">
                {Object.entries(categories).map(([key, category]) => {
                  const IconComponent = category.icon;
                  const isActive = activeCategory === key;
                  const categoryFAQs = faqData.filter(faq => faq.category === key);
                  
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setActiveCategory(key);
                        setSearchQuery(''); // 検索クエリをリセット
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 text-left ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-5 h-5" />
                        <span className="font-medium text-sm">{category.name}</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        isActive ? 'bg-white/20' : 'bg-gray-200'
                      }`}>
                        {categoryFAQs.length}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* お問い合わせCTA */}
              {/* <div className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="text-center">
                  <Mail className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-blue-800 mb-2 text-sm">解決しませんか？</h4>
                  <p className="text-blue-700 text-xs mb-3">
                    お気軽にお問い合わせください
                  </p>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    お問い合わせ
                  </Link>
                </div>
              </div> */}
            </div>
          </motion.div>

          {/* FAQ項目 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* カテゴリヘッダー */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 p-6">
                <div className="flex items-center space-x-3">
                  {React.createElement(categories[activeCategory as keyof typeof categories].icon, {
                    className: "w-6 h-6 text-white"
                  })}
                  <h2 className="text-xl font-bold text-white">
                    {categories[activeCategory as keyof typeof categories].name}
                  </h2>
                  <span className="text-white/60 text-sm">
                    ({filteredFAQs.length}件)
                  </span>
                </div>
              </div>

              {/* FAQ項目 */}
              <div className="divide-y divide-gray-100">
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq) => (
                    <div key={faq.id} className="p-6">
                      <button
                        onClick={() => toggleItem(faq.id)}
                        className="w-full text-left flex items-start justify-between group"
                      >
                        <div className="flex-1 pr-4">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 ml-4">
                          {expandedItems.has(faq.id) ? (
                            <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                          )}
                        </div>
                      </button>
                      
                      {expandedItems.has(faq.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4"
                        >
                          <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-gray-700 leading-relaxed">
                              {faq.answer}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      検索結果が見つかりません
                    </h3>
                    <p className="text-gray-600">
                      検索キーワードを変更するか、他のカテゴリもご確認ください。
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* サポート情報 */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              {/* 関連リンク */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <h3 className="text-lg font-semibold text-gray-900">関連情報</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <Link href="/contact" className="block text-blue-600 hover:underline font-medium">
                    お問い合わせフォーム
                  </Link>
                  <Link href="/terms" className="block text-blue-600 hover:underline">
                    利用規約
                  </Link>
                  <Link href="/privacy" className="block text-blue-600 hover:underline">
                    プライバシーポリシー
                  </Link>
                  <Link href="/tokusho" className="block text-blue-600 hover:underline">
                    特定商取引法に基づく表記
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* フッターCTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              まだ解決しませんか？
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed max-w-2xl mx-auto">
              こちらで解決しない場合は、お気軽にお問い合わせください。<br />
              Career Compassチームが丁寧にサポートいたします。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <Mail className="mr-2 h-5 w-5" />
              お問い合わせする
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
