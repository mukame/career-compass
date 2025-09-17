'use client';

import React, { useState } from 'react';
import { Save, Crown, Check, AlertCircle, X } from 'lucide-react';
import { useAnalysisSave } from '@/hooks/useAnalysisSave';

interface SaveAnalysisButtonProps {
  analysisType: string;
  inputData: any;
  resultData: any;
  defaultTitle?: string;
  disabled?: boolean;
  className?: string;
}

export default function SaveAnalysisButton({
  analysisType,
  inputData,
  resultData,
  defaultTitle,
  disabled = false,
  className = ""
}: SaveAnalysisButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState(defaultTitle || `${analysisType}分析結果`);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(false);
  
  const { saveAnalysis, isSaving, saveError, clearError } = useAnalysisSave();

  const handleSave = async () => {
    try {
      await saveAnalysis({
        analysis_type: analysisType,
        input_data: inputData,
        result: resultData,
        title,
        tags
      });
      
      setSaved(true);
      setTimeout(() => {
        setShowModal(false);
        setSaved(false);
      }, 2000);
    } catch (error) {
      // エラーハンドリングはuseAnalysisSaveで処理
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (saved) {
    return (
      <button
        className={`flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg ${className}`}
        disabled
      >
        <Check className="w-4 h-4" />
        <span>保存完了</span>
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={disabled || !resultData}
        className={`flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <Save className="w-4 h-4" />
        <span>結果を保存</span>
      </button>

      {/* 保存モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                分析結果を保存
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  clearError();
                }}
                className="p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-red-700 text-sm">{saveError}</span>
                </div>
                {saveError.includes('アップグレード') && (
                  <div className="mt-2">
                    <button
                      onClick={() => window.location.href = '/pricing'}
                      className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                    >
                      <Crown className="w-3 h-3" />
                      <span>プランを確認する</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-4">
              {/* タイトル入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="分析結果のタイトルを入力"
                />
              </div>

              {/* タグ入力 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  タグ（最大5個）
                </label>
                <div className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="タグを入力してEnterキー"
                    maxLength={20}
                  />
                  <button
                    onClick={addTag}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 text-sm"
                  >
                    追加
                  </button>
                </div>
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false);
                  clearError();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={isSaving}
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>保存する</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
