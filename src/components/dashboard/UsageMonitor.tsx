// /src/components/dashboard/UsageMonitor.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { AnimatedSection } from '@/components/ui/AnimatedSection'
import {
  Brain,
  Star,
  Route,
  Heart,
  User,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Ticket,
  Crown,
  Plus,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import Link from 'next/link'

interface UsageData {
  analysis_type: string
  used: number
  limit: number
  can_use: boolean
}

interface TicketBalance {
  ticket_type: string
  available: number
  total_purchased: number
}

interface UsageMonitorProps {
  userId: string
  subscriptionStatus: string
}

export function UsageMonitor({ userId, subscriptionStatus }: UsageMonitorProps) {
  const [usageData, setUsageData] = useState<UsageData[]>([])
  const [ticketBalances, setTicketBalances] = useState<TicketBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  
  const supabase = createClient()

  const analysisTypes = [
    {
      key: 'clarity',
      name: 'モヤモヤ分析',
      description: 'キャリアの悩みを整理',
      icon: Brain,
      color: 'from-indigo-500 to-purple-600',
      bgColor: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-200'
    },
    {
      key: 'strengths',
      name: '強み分析',
      description: 'あなたの強みを発見',
      icon: Star,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200'
    },
    {
      key:'career',
      name: 'キャリアパス分析',
      description: '最適な道筋を提案',
      icon: Route,
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50',
      borderColor: 'border-green-200'
    },
    {
      key: 'values',
      name: '価値観分析',
      description: '価値観を明確化',
      icon: Heart,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200'
    },
    {
      key: 'persona',
      name: '人物像分析',
      description: '性格と行動パターン',
      icon: User,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200'
    }
  ]

  useEffect(() => {
    fetchUsageData()
    fetchTicketBalances()

    // リアルタイム更新を設定
    const interval = setInterval(() => {
      fetchUsageData()
      fetchTicketBalances()
      setLastUpdated(new Date())
    }, 30000) // 30秒ごと

    return () => clearInterval(interval)
  }, [userId])

    const fetchUsageData = async () => {
    try {
        // 現在のセッションを取得
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
        console.error('No valid session found')
        setUsageData([])
        return
        }

        const response = await fetch('/api/usage/status', {
        headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
        }
        })
        
        const data = await response.json()
        
        if (data.success) {
        setUsageData(data.usage || [])
        } else {
        console.error('Failed to fetch usage data:', data.error)
        }
    } catch (error) {
        console.error('Error fetching usage data:', error)
    }
    }

  const fetchTicketBalances = async () => {
    try {
      const response = await fetch('/api/tickets')
      const data = await response.json()
      
      if (data.success) {
        setTicketBalances(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching ticket balances:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsageForType = (analysisType: string) => {
    return usageData.find(u => u.analysis_type === analysisType) || {
      analysis_type: analysisType,
      used: 0,
      limit: subscriptionStatus === 'free' ? 1 : -1,
      can_use: true
    }
  }

  const getTicketBalance = (ticketType: string) => {
    return ticketBalances.find(t => t.ticket_type === ticketType)?.available || 0
  }

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0 // 無制限
    return Math.min((used / limit) * 100, 100)
  }

  const getStatusColor = (used: number, limit: number, canUse: boolean) => {
    if (!canUse || (limit !== -1 && used >= limit)) return 'text-red-600'
    if (limit !== -1 && used / limit > 0.8) return 'text-yellow-600'
    return 'text-green-600'
  }

  const getStatusIcon = (used: number, limit: number, canUse: boolean) => {
    if (!canUse || (limit !== -1 && used >= limit)) return AlertCircle
    if (limit !== -1 && used / limit > 0.8) return Clock
    return CheckCircle
  }

  const refreshData = async () => {
    setLoading(true)
    await Promise.all([fetchUsageData(), fetchTicketBalances()])
    setLastUpdated(new Date())
    setLoading(false)
  }

  if (loading && usageData.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded-lg mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -inset-2 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-2xl lg:rounded-3xl blur-2xl opacity-20"></div>
      <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/50">
        
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-4 lg:mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl lg:rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg">
              <TrendingUp className="h-4 w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg lg:text-xl font-bold text-gray-900">使用状況モニター</h3>
              <p className="text-xs lg:text-sm text-gray-600">
                最終更新: {lastUpdated.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={loading}
              className="p-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <div className="block lg:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
                className="p-2"
              >
                {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* サマリーカード - モバイル版 */}
        <div className="block lg:hidden mb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
              <p className="text-xs font-medium text-green-700 mb-1">利用可能</p>
              <p className="text-lg font-bold text-green-900">
                {analysisTypes.filter(type => {
                  const usage = getUsageForType(type.key)
                  return usage.can_use && (usage.limit === -1 || usage.used < usage.limit)
                }).length}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-medium text-blue-700 mb-1">チケット残高</p>
              <p className="text-lg font-bold text-blue-900">
                {ticketBalances.reduce((sum, ticket) => sum + ticket.available, 0)}
              </p>
            </div>
          </div>
        </div>

        {/* 詳細表示切り替え */}
        <div className="block lg:hidden">
          <Button
            variant="outline"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mb-4 text-sm"
          >
            {showDetails ? (
              <>
                詳細を非表示 <ChevronUp className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                詳細を表示 <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* 分析タイプ別使用状況 */}
        <div className={`space-y-3 lg:space-y-4 ${!showDetails && 'hidden lg:block'}`}>
          {analysisTypes.map((type, index) => {
            const usage = getUsageForType(type.key)
            const normalTickets = getTicketBalance('analysis_normal')
            const personaTickets = getTicketBalance('analysis_persona')
            const availableTickets = type.key === 'persona' ? personaTickets : normalTickets
            const StatusIcon = getStatusIcon(usage.used, usage.limit, usage.can_use)
            const percentage = getUsagePercentage(usage.used, usage.limit)
            
            return (
              <AnimatedSection key={type.key} delay={index * 0.1}>
                <div className={`relative group hover:shadow-lg transition-all duration-300 rounded-xl lg:rounded-2xl overflow-hidden border ${type.borderColor}`}>
                  <div className={`bg-gradient-to-r ${type.bgColor} p-3 sm:p-4 lg:p-6`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center shadow-lg`}>
                          <type.icon className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm lg:text-base">{type.name}</h4>
                          <p className="text-xs lg:text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 lg:h-5 lg:w-5 ${getStatusColor(usage.used, usage.limit, usage.can_use)}`} />
                      </div>
                    </div>

                    {/* 使用状況バー */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs lg:text-sm font-medium text-gray-700">
                          今月の利用状況
                        </span>
                        <span className={`text-xs lg:text-sm font-bold ${getStatusColor(usage.used, usage.limit, usage.can_use)}`}>
                          {usage.used}/{usage.limit === -1 ? '無制限' : usage.limit}
                        </span>
                      </div>
                      <Progress 
                        value={percentage} 
                        className="h-2 lg:h-3"
                      />
                    </div>

                    {/* チケット情報とアクション */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                      <div className="flex items-center space-x-2">
                        {availableTickets > 0 && (
                          <Badge variant="info" className="text-xs">
                            <Ticket className="w-3 h-3 mr-1" />
                            {availableTickets}枚利用可能
                          </Badge>
                        )}
                        {subscriptionStatus === 'free' && type.key !== 'clarity' && (
                          <Badge variant="warning" className="text-xs">
                            <Crown className="w-3 h-3 mr-1" />
                            プレミアム機能
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex space-x-2">
                        {usage.can_use && (usage.limit === -1 || usage.used < usage.limit) ? (
                          <Link href={`/ai-analysis/${type.key}`}>
                            <Button size="sm" className={`bg-gradient-to-r ${type.color} text-white hover:shadow-lg text-xs`}>
                              分析開始
                            </Button>
                          </Link>
                        ) : availableTickets > 0 ? (
                          <Link href={`/ai-analysis/${type.key}`}>
                            <Button size="sm" variant="outline" className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50">
                              <Ticket className="w-3 h-3 mr-1" />
                              チケットで実行
                            </Button>
                          </Link>
                        ) : (
                          <Link href="/tickets">
                            <Button size="sm" variant="outline" className="text-xs">
                              <Plus className="w-3 h-3 mr-1" />
                              チケット購入
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            )
          })}
        </div>

        {/* チケット残高サマリー - デスクトップ版 */}
        <div className="hidden lg:block mt-6">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl p-4 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Ticket className="w-5 h-5 mr-2 text-blue-600" />
              チケット残高
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">通常分析用</p>
                <p className="text-2xl font-bold text-blue-600">{getTicketBalance('analysis_normal')}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">人物像分析用</p>
                <p className="text-2xl font-bold text-purple-600">{getTicketBalance('analysis_persona')}</p>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link href="/tickets">
                <Button size="sm" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  チケットを購入
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
