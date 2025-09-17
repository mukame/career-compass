'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Filter, 
  Calendar,
  Star,
  Trash2,
  Eye,
  GitCompare, // Compare の代替
  Clock,
  AlertCircle,
  Crown
} from 'lucide-react';
import Link from 'next/link';

interface AnalysisRecord {
  id: string;
  analysis_type: string;
  title: string;
  created_at: string;
  expires_at?: string;
  status: string;
  is_favorite: boolean;
  tags: string[];
}

export default function AnalysisHistoryPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>([]);
  const [selectedType, setSelectedType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAnalyses, setSelectedAnalyses] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const analysisTypes = {
    clarity: { name: 'モヤモヤ分析', color: 'blue' },
    strengths: { name: '強み分析', color: 'orange' },
   'career': { name: 'キャリアパス分析', color: 'green' },
    values: { name: '価値観分析', color: 'purple' }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  useEffect(() => {
    filterAnalyses();
  }, [analyses, selectedType, searchQuery]);

  const fetchAnalyses = async () => {
    try {
      // 実際の実装ではSupabaseから取得
      setIsLoading(true);
      // const { data, error } = await supabase.from('ai_analyses').select('*').order('created_at', { ascending: false });
      // setAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAnalyses = () => {
    let filtered = [...analyses];
    
    if (selectedType !== 'all') {
      filtered = filtered.filter(analysis => analysis.analysis_type === selectedType);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(analysis => 
        analysis.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        analysis.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    setFilteredAnalyses(filtered);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedAnalyses);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else if (newSelected.size < 3) { // 最大3件まで
      newSelected.add(id);
    }
    setSelectedAnalyses(newSelected);
  };

  // 🔧 追加: 比較ページへ移動する関数
  const handleCompare = () => {
    const ids = Array.from(selectedAnalyses).join(',');
    window.location.href = `/analysis-comparison?ids=${ids}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const getExpiryStatus = (expiresAt?: string) => {
    if (!expiresAt) return { status: 'permanent', label: '無期限', color: 'green' };
    
    const expiry = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysLeft < 0) return { status: 'expired', label: '期限切れ', color: 'red' };
    if (daysLeft <= 7) return { status: 'expiring', label: `${daysLeft}日後に期限切れ`, color: 'yellow' };
    return { status: 'active', label: `${daysLeft}日後に期限切れ`, color: 'gray' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-4">
            <History className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            分析履歴
          </h1>
          <p className="text-lg text-gray-600">
            保存された分析結果を確認・比較できます
          </p>
        </motion.div>

        {/* フィルター・検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* 検索 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="タイトルやタグで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            {/* タイプフィルター */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">すべての分析</option>
              {Object.entries(analysisTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.name}</option>
              ))}
            </select>
          </div>

          {/* 比較選択状況 */}
          {selectedAnalyses.size > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedAnalyses.size}件選択中（最大3件まで比較可能）
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => setSelectedAnalyses(new Set())}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    選択解除
                  </button>
                  {selectedAnalyses.size >= 2 && (
                    <button 
                      onClick={handleCompare}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                    >
                      <GitCompare className="w-4 h-4 inline mr-2" />
                      比較表示
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* 分析結果一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">読み込み中...</p>
            </div>
          ) : filteredAnalyses.length === 0 ? (
            <div className="text-center py-12">
              <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                保存された分析がありません
              </h3>
              <p className="text-gray-600 mb-6">
                分析を実行して結果を保存してみましょう
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
              >
                分析を開始する
              </Link>
            </div>
          ) : (
            filteredAnalyses.map((analysis) => {
              const expiryStatus = getExpiryStatus(analysis.expires_at);
              const isSelected = selectedAnalyses.has(analysis.id);
              
              return (
                <div
                  key={analysis.id}
                  className={`bg-white rounded-2xl shadow-lg p-6 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-xl'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium bg-${analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.color || 'gray'}-100 text-${analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.color || 'gray'}-800`}>
                          {analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.name || analysis.analysis_type}
                        </span>
                        {analysis.is_favorite && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {analysis.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(analysis.created_at)}</span>
                        </div>
                        <div className={`flex items-center space-x-1 text-${expiryStatus.color}-600`}>
                          <Clock className="w-4 h-4" />
                          <span>{expiryStatus.label}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleSelection(analysis.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        disabled={!isSelected && selectedAnalyses.size >= 3}
                      >
                        <GitCompare className="w-4 h-4" />
                      </button>
                      <button className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {analysis.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {analysis.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </motion.div>

        {/* プランアップグレード促進 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-8 text-center"
        >
          <Crown className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            さらに多くの分析結果を保存
          </h3>
          <p className="text-gray-600 mb-6">
            プレミアムプランなら分析結果を無期限で保存でき、<br />
            より詳細な比較・分析機能もご利用いただけます。
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <Crown className="mr-2 h-5 w-5" />
            プランを確認する
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
