'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Clock, CheckCircle, AlertCircle, MessageSquare, HelpCircle, Bug, CreditCard, Shield } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: '',
    urgent: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'technical', label: '技術的な問題・バグ報告', icon: Bug, priority: 'high' },
    { value: 'billing', label: '課金・決済に関するお問い合わせ', icon: CreditCard, priority: 'high' },
    { value: 'account', label: 'アカウント・ログインの問題', icon: Shield, priority: 'high' },
    { value: 'feature', label: '機能・使い方についてのご質問', icon: HelpCircle, priority: 'medium' },
    { value: 'feedback', label: 'ご意見・ご要望', icon: MessageSquare, priority: 'medium' },
    { value: 'other', label: 'その他のお問い合わせ', icon: Mail, priority: 'low' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (!response.ok) {
        throw new Error(result.error || 'お問い合わせの送信に失敗しました。');
        }

        // 送信成功時の処理
        setSubmitted(true);
        
        // フォームをリセット（必要に応じて）
        setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: '',
        urgent: false
        });

    } catch (error) {
        console.error('送信エラー:', error);
        
        // エラー表示（既存のUIに合わせて簡単なalertで対応）
        alert(error instanceof Error ? error.message : 'お問い合わせの送信に失敗しました。しばらく後でお試しください。');
        
    } finally {
        setIsSubmitting(false);
    }
    };


  const getSelectedCategory = () => {
    return categories.find(cat => cat.value === formData.category);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 py-12 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto px-4"
        >
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              送信完了
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              お問い合わせありがとうございます。<br />
              内容を確認の上、必要に応じてご連絡いたします。
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
            >
              ダッシュボードに戻る
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

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
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            お問い合わせ
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Career Compassに関するご質問やご意見をお聞かせください。<br />
            お客様のフィードバックがサービス向上の原動力です。
          </p>
        </motion.div>

        {/* よくある質問への誘導 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8"
        >
          <div className="flex items-start space-x-3">
            <HelpCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800 mb-2">お問い合わせ前にご確認ください</h3>
              <p className="text-blue-700 text-sm mb-3">
                よくあるご質問で解決できる場合があります。まずはこちらをご確認ください。
              </p>
              <Link
                href="/faq"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                よくあるご質問を見る →
              </Link>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* お問い合わせフォーム */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                お問い合わせフォーム
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* お名前 */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="山田 太郎"
                  />
                </div>

                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="example@email.com"
                  />
                </div>

                {/* お問い合わせ種別 */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ種別 <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">選択してください</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 件名 */}
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    件名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="お問い合わせの件名を入力してください"
                  />
                </div>

                {/* お問い合わせ内容 */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    お問い合わせ内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                    placeholder="お問い合わせ内容を詳しくご記入ください。エラーの場合は、発生した状況や操作手順もお教えいただけると助かります。"
                  />
                </div>

                {/* 緊急度 */}
                {/* <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="urgent"
                    name="urgent"
                    checked={formData.urgent}
                    onChange={handleChange}
                    className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  />
                  <label htmlFor="urgent" className="text-sm text-gray-700">
                    <span className="font-medium">緊急対応が必要</span>
                    <p className="text-gray-500 mt-1">
                      サービスが利用できない、課金に関する問題など、緊急性の高いお問い合わせの場合はチェックしてください。
                    </p>
                  </label>
                </div> */}

                {/* 送信ボタン */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-5 w-5" />
                        送信する
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>

          {/* サイドバー情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* 返信について */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-gray-900">ご返信について</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p>
                  お問い合わせ内容を確認の上、<strong>必要に応じて</strong>ご連絡させていただきます。
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-amber-800">優先対応：</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-amber-700">
                    <li>技術的な問題・バグ報告</li>
                    <li>課金・決済に関する問題</li>
                    <li>アカウント・ログインの問題</li>
                  </ul>
                </div>
                <p className="text-xs text-gray-500">
                  ご意見・ご要望は今後のサービス改善に活用させていただきますが、
                  個別のご返信をお約束するものではございません。
                  予めご了承ください。
                </p>
              </div>
            </div>

            {/* 関連リンク */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                関連情報
              </h3>
              <div className="space-y-2 text-sm">
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
          </motion.div>
        </div>

        {/* フッターメッセージ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              お客様の声を大切にしています
            </h3>
            <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Career Compassは、お客様のフィードバックによってより良いサービスに成長していきます。
              どんな小さなことでも、ご意見・ご要望をお聞かせください。
              皆様の声が、次の機能改善や新機能開発のヒントとなります。
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
