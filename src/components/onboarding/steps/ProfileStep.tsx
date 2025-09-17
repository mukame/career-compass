'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Briefcase, Target, Heart, ArrowRight, ArrowLeft } from 'lucide-react';
import type { ProfileData } from '@/types/onboarding';

interface ProfileStepProps {
  onNext: (profile: ProfileData) => void;
  onBack: () => void;
  initialData?: Partial<ProfileData>;
}

export default function ProfileStep({ onNext, onBack, initialData = {} }: ProfileStepProps) {
  const [profile, setProfile] = useState<Partial<ProfileData>>({
    last_name: '',
    first_name: '',
    last_name_kana: '',
    first_name_kana: '',
    age: undefined,
    occupation_category: '',
    occupation_detail: '',
    experience_years: '',
    motivation_reason: '',
    interests: [],
    ...initialData
  });

  const [currentSection, setCurrentSection] = useState(0);

  // 年齢選択肢（18-65歳）
  const ageOptions = Array.from({ length: 48 }, (_, i) => i + 18);

  const experienceYears = [
    '1年未満', '1-3年', '3-5年', '5-10年', '10-15年', '15-20年', '20年以上'
  ];

  // 2025年時点の日本における職業カテゴリ
  const occupationCategories = [
    'IT・エンジニア系',
    '営業・セールス',
    'マーケティング・広報',
    '経営・管理職',
    '企画・事業開発',
    '人事・総務',
    '経理・財務',
    'コンサルティング',
    'デザイナー・クリエイティブ',
    '製造・技術',
    '研究・開発',
    '医療・介護・福祉',
    '教育・保育',
    '公務員',
    '金融・保険',
    '不動産',
    '小売・販売',
    'サービス業',
    '運輸・物流',
    '建設・建築',
    '農林水産業',
    'フリーランス・個人事業主',
    '学生',
    '専業主婦・主夫',
    '無職・求職中',
    'その他'
  ];

  // CareerCompassを始めたきっかけ
  const motivationReasons = [
    '自己理解の促進',
    '社内でのキャリアアップ',
    '転職成功',
    '新しいことへのチャレンジ',
    'なんとなく',
    'その他'
  ];

  const interestOptions = [
    'テクノロジー', 'マーケティング', 'セールス', 'デザイン',
    'データ分析', '人事・採用', 'コンサルティング', '教育',
    'ヘルスケア', '金融', 'エンターテイメント', 'サステナビリティ',
    'スタートアップ', 'グローバルビジネス', 'DX・デジタル化', 'AI・機械学習'
  ];

  const handleArrayToggle = (field: 'interests', value: string) => {
    const current = profile[field] || [];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    
    setProfile(prev => ({ ...prev, [field]: updated }));
  };

  // セクション別バリデーション
  const getSectionValidation = (sectionIndex: number) => {
    switch (sectionIndex) {
      case 0: // 基本情報
        return !!(
          profile.last_name?.trim() && 
          profile.first_name?.trim() && 
          profile.last_name_kana?.trim() && 
          profile.first_name_kana?.trim() && 
          profile.age &&
          profile.occupation_category && 
          (profile.occupation_category !== 'その他' || profile.occupation_detail?.trim()) &&
          profile.experience_years
        );
      case 1: // きっかけ
        return !!profile.motivation_reason;
      case 2: // 興味分野
        return !!(profile.interests?.length);
      default:
        return false;
    }
  };

  const isValid = () => {
    return profile.last_name?.trim() && 
           profile.first_name?.trim() && 
           profile.last_name_kana?.trim() && 
           profile.first_name_kana?.trim() && 
           profile.age &&
           profile.occupation_category && 
           (profile.occupation_category !== 'その他' || profile.occupation_detail?.trim()) &&
           profile.experience_years &&
           profile.motivation_reason &&
           (profile.interests?.length || 0) > 0;
  };

  const sections = [
    {
      title: '基本情報',
      icon: User,
      content: (
        <div className="space-y-6">
          {/* 姓名 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                姓 <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={profile.last_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name: e.target.value }))}
                placeholder="山田"
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                名 <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={profile.first_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name: e.target.value }))}
                placeholder="太郎"
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg"
              />
            </div>
          </div>

          {/* フリガナ */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                姓（フリガナ） <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={profile.last_name_kana || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, last_name_kana: e.target.value }))}
                placeholder="ヤマダ"
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-3">
                名（フリガナ） <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={profile.first_name_kana || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, first_name_kana: e.target.value }))}
                placeholder="タロウ"
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg"
              />
            </div>
          </div>

        {/* 年齢 */}
        <div>
        <label className="block text-sm font-semibold text-white mb-3">
            年齢 <span className="text-pink-300">*</span>
        </label>
        <select
            value={profile.age || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, age: Number(e.target.value) }))}
            className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg [&>option]:bg-slate-800 [&>option]:text-white"
        >
            <option value="" className="bg-slate-800 text-white">年齢を選択してください</option>
            {ageOptions.map(age => (
            <option key={age} value={age} className="bg-slate-800 text-white py-2">{age}歳</option>
            ))}
        </select>
        </div>

         {/* 職業 */}
         <div>
         <label className="block text-sm font-semibold text-white mb-3">
             職業 <span className="text-pink-300">*</span>
         </label>
         <select
             value={profile.occupation_category || ''}
             onChange={(e) => setProfile(prev => ({ 
             ...prev, 
             occupation_category: e.target.value,
             occupation_detail: e.target.value !== 'その他' ? '' : prev.occupation_detail
             }))}
             className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg [&>option]:bg-slate-800 [&>option]:text-white"
         >
             <option value="" className="bg-slate-800 text-white">職業を選択してください</option>
             {occupationCategories.map(category => (
             <option key={category} value={category} className="bg-slate-800 text-white py-2">{category}</option>
             ))}
         </select>
        </div>

          {/* その他職業の詳細入力 */}
          {profile.occupation_category === 'その他' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <label className="block text-sm font-semibold text-white mb-3">
                職業の詳細 <span className="text-pink-300">*</span>
              </label>
              <input
                type="text"
                value={profile.occupation_detail || ''}
                onChange={(e) => setProfile(prev => ({ ...prev, occupation_detail: e.target.value }))}
                placeholder="具体的な職業を入力してください"
                className="w-full px-4 py-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl text-white placeholder-white/60 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all text-lg shadow-lg"
              />
            </motion.div>
          )}

          {/* 経験年数 */}
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              経験年数 <span className="text-pink-300">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {experienceYears.map(years => (
                <button
                  key={years}
                  onClick={() => setProfile(prev => ({ ...prev, experience_years: years }))}
                  className={`px-4 py-3 rounded-xl border-2 transition-all text-sm font-medium shadow-lg ${
                    profile.experience_years === years
                      ? 'border-purple-400 bg-purple-400/30 text-white backdrop-blur-xl'
                      : 'border-white/30 bg-white/10 text-white/90 hover:border-purple-300 hover:bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  {years}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'きっかけ',
      icon: Heart,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              Career Compassを始めたきっかけは？ <span className="text-pink-300">*</span>
            </label>
            <div className="space-y-3">
              {motivationReasons.map(reason => (
                <button
                  key={reason}
                  onClick={() => setProfile(prev => ({ ...prev, motivation_reason: reason }))}
                  className={`w-full px-4 py-4 rounded-xl border-2 text-left transition-all text-sm font-medium shadow-lg ${
                    profile.motivation_reason === reason
                      ? 'border-purple-400 bg-purple-400/30 text-white backdrop-blur-xl'
                      : 'border-white/30 bg-white/10 text-white/90 hover:border-purple-300 hover:bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '興味分野',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-white mb-3">
              興味のある分野（複数選択可） <span className="text-pink-300">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {interestOptions.map(interest => (
                <button
                  key={interest}
                  onClick={() => handleArrayToggle('interests', interest)}
                  className={`px-4 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium shadow-lg ${
                    profile.interests?.includes(interest)
                      ? 'border-purple-400 bg-purple-400/30 text-white backdrop-blur-xl'
                      : 'border-white/30 bg-white/10 text-white/90 hover:border-purple-300 hover:bg-white/20 backdrop-blur-xl'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {(profile.interests?.length || 0) > 0 && (
              <p className="text-purple-200 text-sm mt-2">
                {profile.interests?.length}個選択済み
              </p>
            )}
          </div>
        </div>
      )
    }
  ];

  const currentSectionData = sections[currentSection];
  const canProceed = getSectionValidation(currentSection);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="space-y-8"
    >
      {/* ヘッダー */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mb-4 shadow-2xl"
        >
          <currentSectionData.icon className="w-8 h-8 text-white" />
        </motion.div>
        
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          {currentSectionData.title}
        </h2>
        <p className="text-white/80 text-lg">
          あなたのことを教えてください（{currentSection + 1}/3）
        </p>
      </div>

      {/* プログレス */}
      <div className="flex items-center justify-center space-x-2">
        {sections.map((_, index) => (
          <motion.div
            key={index}
            animate={{
              width: index <= currentSection ? 32 : 8,
              backgroundColor: index <= currentSection ? 'rgb(168, 85, 247)' : 'rgba(255, 255, 255, 0.3)'
            }}
            className="h-2 rounded-full transition-all duration-500"
          />
        ))}
      </div>

      {/* コンテンツ */}
      <motion.div
        key={currentSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20"
      >
        {currentSectionData.content}
      </motion.div>

      {/* ナビゲーション */}
      <div className="flex justify-between">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={currentSection === 0 ? onBack : () => setCurrentSection(prev => prev - 1)}
          className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/30 text-white font-medium rounded-2xl hover:bg-white/20 transition-all shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          戻る
        </motion.button>

        <motion.button
          whileHover={canProceed ? { scale: 1.05, y: -2 } : {}}
          whileTap={canProceed ? { scale: 0.95 } : {}}
          onClick={() => {
            if (currentSection < sections.length - 1) {
              if (canProceed) {
                setCurrentSection(prev => prev + 1);
              }
            } else if (isValid()) {
              onNext(profile as ProfileData);
            }
          }}
          disabled={!canProceed}
          className={`inline-flex items-center px-8 py-3 font-semibold rounded-2xl transition-all duration-300 shadow-lg ${
            canProceed 
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl' 
              : 'bg-white/10 text-white/50 cursor-not-allowed border border-white/20'
          }`}
        >
          {currentSection < sections.length - 1 ? '次へ' : '完了'}
          <ArrowRight className="w-4 h-4 ml-2" />
        </motion.button>
      </div>

      {/* バリデーションメッセージ */}
      {!canProceed && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-pink-300 text-sm bg-white/10 backdrop-blur-xl rounded-xl px-4 py-2 inline-block border border-pink-300/30">
            <span className="text-pink-300">*</span> 必須項目をすべて入力してください
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
