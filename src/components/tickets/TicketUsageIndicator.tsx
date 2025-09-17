'use client'

import React from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  Coins, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Crown
} from 'lucide-react'
import type { TicketUsage } from '@/types/tickets'

interface TicketUsageIndicatorProps {
  usage: TicketUsage[]
  className?: string
}

export const TicketUsageIndicator: React.FC<TicketUsageIndicatorProps> = ({
  usage,
  className
}) => {
  if (!usage || usage.length === 0) {
    return (
      <Card className={`bg-gray-50 border-gray-200 ${className}`}>
        <CardContent className="p-4 text-center">
          <Coins className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600">保有チケットなし</p>
          <p className="text-xs text-gray-500 mt-1">
            分析制限に達した場合はチケットをご購入ください
          </p>
        </CardContent>
      </Card>
    )
  }

  const getTicketInfo = (ticketType: string) => {
    if (ticketType === 'analysis_persona') {
      return {
        name: '人物像分析チケット',
        icon: Crown,
        color: 'purple'
      }
    }
    return {
      name: '通常分析チケット',
      icon: Brain,
      color: 'blue'
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {usage.map((ticket) => {
        const info = getTicketInfo(ticket.ticket_type)
        const IconComponent = info.icon
        const hasExpiringSoon = ticket.expires_soon.length > 0
        
        return (
          <Card 
            key={ticket.ticket_type}
            className={`border-2 transition-all duration-200 ${
              info.color === 'purple' 
                ? 'border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50' 
                : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    info.color === 'purple' 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  }`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{info.name}</h4>
                    <p className="text-xs text-gray-600">
                      利用可能: {ticket.available}枚 / 総計: {ticket.total}枚
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    info.color === 'purple' ? 'text-purple-600' : 'text-blue-600'
                  }`}>
                    {ticket.available}
                  </div>
                  <div className="text-xs text-gray-500">枚</div>
                </div>
              </div>

              {/* 使用状況バー */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>使用状況</span>
                  <span>{ticket.used}/{ticket.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      info.color === 'purple' 
                        ? 'bg-gradient-to-r from-purple-400 to-pink-400' 
                        : 'bg-gradient-to-r from-blue-400 to-indigo-400'
                    }`}
                    style={{ 
                      width: `${ticket.total > 0 ? (ticket.used / ticket.total) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>

              {/* 期限切れ警告 */}
              {hasExpiringSoon && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-yellow-800">
                        {ticket.expires_soon.length}枚が7日以内に期限切れ
                      </p>
                      <p className="text-xs text-yellow-700">
                        お早めにご利用ください
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* チケットが十分にある場合 */}
              {ticket.available >= 5 && (
                <div className="mt-3 flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-xs font-medium">
                    十分な分析チケットをお持ちです
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
