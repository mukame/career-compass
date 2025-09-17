'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Clock, 
  CheckCircle, 
  Users, 
  Gift,
  AlertTriangle,
  Calendar,
  Coins,
  TrendingUp
} from 'lucide-react'
import type { Referral, ReferralStats } from '@/types/referrals'

export const ReferralHistory: React.FC = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null)
  const [history, setHistory] = useState<Referral[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReferralData()
  }, [])

  const fetchReferralData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/referrals')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data.stats)
        setHistory(data.data.history)
      }
    } catch (error) {
      console.error('Error fetching referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'completed':
        return {
          label: '成功',
          color: 'green',
          icon: CheckCircle
        }
      case 'pending':
        return {
          label: '待機中',
          color: 'yellow',
          icon: Clock
        }
      case 'expired':
        return {
          label: '期限切れ',
          color: 'red',
          icon: AlertTriangle
        }
      default:
        return {
          label: status,
          color: 'gray',
          icon: Clock
        }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 統計情報 */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-900">{stats.total_referrals}</div>
              <div className="text-xs text-blue-700">総紹介数</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-900">{stats.successful_referrals}</div>
              <div className="text-xs text-green-700">成功数</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-900">{stats.pending_referrals}</div>
              <div className="text-xs text-yellow-700">待機中</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Coins className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-bold text-purple-900">{stats.total_rewards_earned}</div>
              <div className="text-xs text-purple-700">獲得チケット</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 今月の実績 */}
      {stats && stats.current_month_referrals > 0 && (
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">今月の紹介実績</h4>
                <p className="text-sm text-gray-600">
                  {stats.current_month_referrals}人の友達を紹介しました！
                </p>
              </div>
              <div className="ml-auto">
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  アクティブ
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 紹介履歴 */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">紹介履歴</h3>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                まだ紹介履歴がありません
              </h4>
              <p className="text-gray-600 mb-4">
                友達を紹介してお得な特典をゲットしましょう！
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((referral) => {
                const statusInfo = getStatusInfo(referral.status)
                const StatusIcon = statusInfo.icon
                
                return (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        statusInfo.color === 'green' ? 'bg-green-100' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100' :
                        statusInfo.color === 'red' ? 'bg-red-100' :
                        'bg-gray-100'
                      }`}>
                        <StatusIcon className={`w-5 h-5 ${
                          statusInfo.color === 'green' ? 'text-green-600' :
                          statusInfo.color === 'yellow' ? 'text-yellow-600' :
                          statusInfo.color === 'red' ? 'text-red-600' :
                          'text-gray-600'
                        }`} />
                      </div>
                      
                      <div>
                        <div className="font-medium text-gray-900">
                          紹介コード: {referral.referral_code}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(referral.created_at)}</span>
                          </div>
                          {referral.completed_at && (
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span>完了: {formatDate(referral.completed_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <Badge className={`${
                        statusInfo.color === 'green' ? 'bg-green-100 text-green-800 border-green-200' :
                        statusInfo.color === 'yellow' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        statusInfo.color === 'red' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }`}>
                        {statusInfo.label}
                      </Badge>
                      {referral.reward_value && referral.status === 'completed' && (
                        <div className="text-xs text-gray-600 mt-1">
                          報酬: {referral.reward_value}チケット
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
