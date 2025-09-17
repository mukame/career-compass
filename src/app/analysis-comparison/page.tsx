'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, ArrowLeft, Calendar, Star, Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface AnalysisRecord {
  id: string;
  analysis_type: string;
  title: string;
  created_at: string;
  result: any;
  input_data: any;
  tags: string[];
  is_favorite: boolean;
}

export default function AnalysisComparisonPage() {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  
  const analysisIds = searchParams?.get('ids')?.split(',') || [];

  const analysisTypes = {
    clarity: { name: 'モヤモヤ分析', color: 'blue' },
    strengths: { name: '強み分析', color: 'orange' },
   'career': { name: 'キャリアパス分析', color: 'green' },
    values: { name: '価値観分析', color: 'purple' }
  };

  useEffect(() => {
    if (analysisIds.length >= 2) {
      fetchAnalyses();
    }
  }, [analysisIds]);

  const fetchAnalyses = async () => {
    try {
      setIsLoading(true);
      // 実際の実装ではSupabaseから取得
      // const { data, error } = await supabase
      //   .from('ai_analyses')
      //   .select('*')
      //   .in('id', analysisIds);
      // setAnalyses(data || []);
      
      // デモデータ
      const demoData: AnalysisRecord[] = analysisIds.map((id, index) => ({
        id,
        analysis_type: ['clarity', 'strengths','career'][index] || 'clarity',
        title: `分析結果 ${index + 1}`,
        created_at: new Date(Date.now() - index * 86400000).toISOString(),
        result: {
          summary: `分析結果のサマリー ${index + 1}`,
          insights: [`インサイト ${index + 1}-1`, `インサイト ${index + 1}-2`],
          recommendations: [`推奨事項 ${index + 1}-1`, `推奨事項 ${index + 1}-2`]
        },
        input_data: { responses: [`回答 ${index + 1}` ] },
        tags: [`タグ${index + 1}`, `カテゴリ${index + 1}`],
        is_favorite: index === 0
      }));
      setAnalyses(demoData);
    } catch (error) {
      console.error('Error fetching analyses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const findCommonElements = (arrays: string[][]) => {
    if (arrays.length === 0) return [];
    return arrays[0].filter(item => 
      arrays.every(arr => arr.includes(item))
    );
  };

  const findUniqueElements = (arrays: string[][], index: number) => {
    const otherArrays = arrays.filter((_, i) => i !== index);
    const otherElements = otherArrays.flat();
    return arrays[index].filter(item => !otherElements.includes(item));
  };

  if (analysisIds.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <GitCompare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            比較する分析を選択してください
          </h1>
          <p className="text-gray-600 mb-8">
            分析履歴ページで2つ以上の分析を選択して比較を開始してください。
          </p>
          <Link
            href="/analysis-history"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            分析履歴に戻る
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">比較データを読み込み中...</p>
        </div>
      </div>
    );
  }

  const allInsights = analyses.map(a => a.result.insights || []);
  const allRecommendations = analyses.map(a => a.result.recommendations || []);
  const commonInsights = findCommonElements(allInsights);
  const commonRecommendations = findCommonElements(allRecommendations);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Link
              href="/analysis-history"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>分析履歴に戻る</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-3 mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl">
              <GitCompare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                分析結果の比較
              </h1>
              <p className="text-gray-600">
                {analyses.length}件の分析結果を比較しています
              </p>
            </div>
          </div>
        </motion.div>

        {/* 比較サマリー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            比較サマリー
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* 共通点 */}
            <div>
              <h3 className="font-medium text-green-700 mb-3 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                共通のインサイト ({commonInsights.length}件)
              </h3>
              {commonInsights.length > 0 ? (
                <ul className="space-y-2">
                  {commonInsights.map((insight, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">共通のインサイトはありません</p>
              )}
            </div>

            {/* 共通の推奨事項 */}
            <div>
              <h3 className="font-medium text-blue-700 mb-3 flex items-center">
                <Star className="w-4 h-4 mr-2" />
                共通の推奨事項 ({commonRecommendations.length}件)
              </h3>
              {commonRecommendations.length > 0 ? (
                <ul className="space-y-2">
                  {commonRecommendations.map((rec, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">共通の推奨事項はありません</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* 詳細比較 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid gap-6"
        >
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                詳細比較
              </h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      項目
                    </th>
                    {analyses.map((analysis, index) => (
                      <th key={analysis.id} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        分析 {index + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* タイトル行 */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      タイトル
                    </td>
                    {analyses.map((analysis) => (
                      <td key={analysis.id} className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium bg-${analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.color || 'gray'}-100 text-${analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.color || 'gray'}-800`}>
                            {analysisTypes[analysis.analysis_type as keyof typeof analysisTypes]?.name || analysis.analysis_type}
                          </span>
                          {analysis.is_favorite && <Star className="w-3 h-3 text-yellow-500 fill-current" />}
                        </div>
                        <div className="font-medium mt-1">{analysis.title}</div>
                      </td>
                    ))}
                  </tr>

                  {/* 実施日 */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      実施日
                    </td>
                    {analyses.map((analysis) => (
                      <td key={analysis.id} className="px-6 py-4 text-sm text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>{formatDate(analysis.created_at)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* サマリー */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      サマリー
                    </td>
                    {analyses.map((analysis) => (
                      <td key={analysis.id} className="px-6 py-4 text-sm text-gray-700">
                        <div className="max-w-xs">
                          {analysis.result.summary || '−'}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* 独自のインサイト */}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      独自のインサイト
                    </td>
                    {analyses.map((analysis, index) => {
                      const uniqueInsights = findUniqueElements(allInsights, index);
                      return (
                        <td key={analysis.id} className="px-6 py-4 text-sm text-gray-700">
                          {uniqueInsights.length > 0 ? (
                            <ul className="space-y-1">
                              {uniqueInsights.map((insight, i) => (
                                <li key={i} className="flex items-start space-x-2">
                                  <div className="w-1 h-1 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                                  <span className="text-xs">{insight}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-gray-400">−</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  {/* タグ */}
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      タグ
                    </td>
                    {analyses.map((analysis) => (
                      <td key={analysis.id} className="px-6 py-4 text-sm text-gray-700">
                        {analysis.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {analysis.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                              >
                                <Tag className="w-2 h-2 mr-1" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">−</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* アクションボタン */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              次のアクション
            </h3>
            <div className="flex justify-center space-x-4">
              <Link
                href="/analysis-history"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50"
              >
                他の分析を選択
              </Link>
              <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                この比較結果を保存
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
