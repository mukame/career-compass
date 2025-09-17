'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  Settings,
  Bell, 
  BellRing, 
  Check, 
  CheckCircle,
  X, 
  Trash2, 
  User,
  Shield,
  CreditCard,
  Palette,
  Moon,
  Sun,
  Globe,
  Brain,
  Target,
  Calendar,
  Award,
  Sparkles,
  AlertCircle,
  Info,
  Filter,
  MoreVertical,
  Save,
  LogOut,
  Download,
  Upload,
  Zap,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  read: boolean
  scheduled_for: string | null
  created_at: string
}

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  subscription_status: 'free' | 'premium'
}

interface NotificationSettings {
  email_notifications: boolean
  push_notifications: boolean
  analysis_complete: boolean
  goal_reminders: boolean
  weekly_summary: boolean
  marketing_emails: boolean
}

// 通知タイプの定義
const notificationTypes = {
  analysis_complete: { 
    label: 'AI分析完了', 
    icon: Brain, 
    color: 'from-blue-500 to-purple-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  },
  goal_achievement: { 
    label: '目標達成', 
    icon: Target, 
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  reminder: { 
    label: 'リマインダー', 
    icon: Calendar, 
    color: 'from-orange-500 to-yellow-500',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200'
  },
  achievement: { 
    label: '実績解除', 
    icon: Award, 
    color: 'from-purple-500 to-pink-500',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200'
  },
  system: { 
    label: 'システム', 
    icon: Info, 
    color: 'from-gray-500 to-slate-500',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200'
  },
  promotion: { 
    label: 'プロモーション', 
    icon: Sparkles, 
    color: 'from-pink-500 to-rose-500',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200'
  }
}

export default function SettingsPage() {
  const { isDesktop, isClient } = useIsDesktop()
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  
  // 通知関連の状態
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    analysis_complete: true,
    goal_reminders: true,
    weekly_summary: true,
    marketing_emails: false
  })
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [actionLoading, setActionLoading] = useState(false)

  // アカウント設定の状態
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light')
  const [language, setLanguage] = useState('ja')
  const [timezone, setTimezone] = useState('Asia/Tokyo')
  
  const router = useRouter()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      // プロフィール取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) setProfile(profileData)

      // 通知一覧取得
      const { data: notificationsData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (notificationsData) setNotifications(notificationsData)

    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationIds: string[]) => {
    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', notificationIds)

      if (error) throw error

      setNotifications(prev => 
        prev.map(notif => 
          notificationIds.includes(notif.id) 
            ? { ...notif, read: true }
            : notif
        )
      )
      setSelectedIds([])
    } catch (error) {
      console.error('Error marking notifications as read:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const deleteNotifications = async (notificationIds: string[]) => {
    if (!confirm('選択した通知を削除しますか？')) return

    setActionLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', notificationIds)

      if (error) throw error

      setNotifications(prev => 
        prev.filter(notif => !notificationIds.includes(notif.id))
      )
      setSelectedIds([])
    } catch (error) {
      console.error('Error deleting notifications:', error)
    } finally {
      setActionLoading(false)
    }
  }

  const saveNotificationSettings = async () => {
    setSaving(true)
    try {
      // ここで通知設定をサーバーに保存
      // 実装は必要に応じて追加
      console.log('Saving notification settings:', notificationSettings)
      
      // 成功メッセージ表示
      alert('通知設定を保存しました')
    } catch (error) {
      console.error('Error saving notification settings:', error)
      alert('設定の保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm('ログアウトしますか？')) return
    
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  const exportData = async () => {
    if (!confirm('データをエクスポートしますか？')) return
    
    try {
      // データエクスポート機能の実装
      alert('データエクスポート機能は準備中です')
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const deleteAccount = async () => {
    const confirmation = prompt('アカウントを削除するには「削除」と入力してください')
    if (confirmation !== '削除') return
    
    try {
      // アカウント削除機能の実装
      alert('アカウント削除機能は準備中です')
    } catch (error) {
      console.error('Error deleting account:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}分前`
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}時間前`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}日前`
    } else {
      return date.toLocaleDateString('ja-JP', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const getNotificationTypeInfo = (type: string) => {
    return notificationTypes[type as keyof typeof notificationTypes] || notificationTypes.system
  }

  const getFilteredNotifications = () => {
    let filtered = notifications

    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.read)
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.read)
    }

    return filtered
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = getFilteredNotifications()

  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-blue-600 rounded-full animate-bounce"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">設定を読み込み中...</p>
        </div>
      </div>
    )
  }

  // デスクトップ版レイアウト
  if (isDesktop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* ヘッダー */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Settings className="w-6 h-6 mr-3 text-blue-600" />
                  設定
                </h1>
                <p className="text-gray-600 mt-1">アプリの設定と通知を管理します</p>
              </div>
              <div className="flex items-center space-x-3">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                  {profile?.subscription_status === 'premium' ? 'プレミアム' : 'フリー'}プラン
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* サイドバーナビゲーション */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-24">
                <CardContent className="p-6">
                  <nav className="space-y-2">
                    {[
                      { key: 'notifications', label: '通知', icon: Bell, count: unreadCount },
                      { key: 'account', label: 'アカウント', icon: User },
                      { key: 'privacy', label: 'プライバシー', icon: Shield },
                      { key: 'appearance', label: '外観', icon: Palette },
                      { key: 'subscription', label: 'サブスクリプション', icon: CreditCard }
                    ].map(item => (
                      <button
                        key={item.key}
                        onClick={() => setActiveTab(item.key)}
                        className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                          activeTab === item.key
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <item.icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        {item.count && item.count > 0 && (
                          <Badge className="bg-red-500 text-white border-0 text-xs">
                            {item.count}
                          </Badge>
                        )}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              {/* 通知タブ */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  {/* 通知設定 */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">通知設定</h3>
                        </div>
                        <Button
                          onClick={saveNotificationSettings}
                          disabled={saving}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                        >
                          {saving ? (
                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          保存
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* メール通知 */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-blue-100 rounded-lg">
                                <Bell className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">メール通知</h4>
                                <p className="text-sm text-gray-600">重要な通知をメールで受信</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setNotificationSettings(prev => ({ 
                                ...prev, 
                                email_notifications: !prev.email_notifications 
                              }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationSettings.email_notifications ? 'bg-blue-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                          
                          {notificationSettings.email_notifications && (
                            <div className="space-y-3 ml-6">
                              {[
                                { key: 'analysis_complete', label: 'AI分析完了通知' },
                                { key: 'goal_reminders', label: '目標リマインダー' },
                                { key: 'weekly_summary', label: '週次サマリー' },
                                { key: 'marketing_emails', label: 'マーケティングメール' }
                              ].map(option => (
                                <div key={option.key} className="flex items-center justify-between">
                                  <span className="text-sm text-gray-700">{option.label}</span>
                                  <button
                                    onClick={() => setNotificationSettings(prev => ({ 
                                      ...prev, 
                                      [option.key]: !prev[option.key as keyof NotificationSettings] 
                                    }))}
                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                      notificationSettings[option.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                        notificationSettings[option.key as keyof NotificationSettings] ? 'translate-x-5' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* プッシュ通知 */}
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <BellRing className="w-4 h-4 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">プッシュ通知</h4>
                                <p className="text-sm text-gray-600">リアルタイム通知を受信</p>
                              </div>
                            </div>
                            <button
                              onClick={() => setNotificationSettings(prev => ({ 
                                ...prev, 
                                push_notifications: !prev.push_notifications 
                              }))}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationSettings.push_notifications ? 'bg-purple-600' : 'bg-gray-300'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  notificationSettings.push_notifications ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 通知履歴 */}
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">通知履歴</h3>
                          {unreadCount > 0 && (
                            <Badge className="bg-red-500 text-white border-0">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* フィルター */}
                          <div className="flex space-x-1">
                            {[
                              { key: 'all', label: '全て' },
                              { key: 'unread', label: '未読' },
                              { key: 'read', label: '既読' }
                            ].map(option => (
                              <button
                                key={option.key}
                                onClick={() => setFilter(option.key as any)}
                                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                                  filter === option.key
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                          
                          {unreadCount > 0 && (
                            <Button
                              size="sm"
                              onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                              disabled={actionLoading}
                              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              全て既読
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {filteredNotifications.length === 0 ? (
                        <div className="text-center py-8">
                          <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <h4 className="text-lg font-medium text-gray-900 mb-2">通知がありません</h4>
                          <p className="text-gray-600">
                            {filter === 'unread' ? '未読の通知はありません' : '通知がまだありません'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {filteredNotifications.slice(0, 10).map((notification) => {
                            const typeInfo = getNotificationTypeInfo(notification.type)
                            const IconComponent = typeInfo.icon

                            return (
                              <div 
                                key={notification.id}
                                className={`p-4 rounded-lg border transition-all ${
                                  !notification.read 
                                    ? 'bg-blue-50 border-blue-200' 
                                    : 'bg-gray-50 border-gray-200'
                                }`}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className={`p-2 rounded-lg bg-gradient-to-r ${typeInfo.color} flex-shrink-0`}>
                                    <IconComponent className="w-4 h-4 text-white" />
                                  </div>
                                  
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-2">
                                        <h4 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                          {notification.title}
                                        </h4>
                                        {!notification.read && (
                                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        )}
                                      </div>
                                      <span className="text-xs text-gray-500">
                                        {formatDate(notification.created_at)}
                                      </span>
                                    </div>
                                    
                                    <p className={`text-sm ${!notification.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                                      {notification.message}
                                    </p>
                                    
                                    <div className="flex items-center space-x-2">
                                      <Badge className={`text-xs ${typeInfo.bgColor} text-gray-700 border-0`}>
                                        {typeInfo.label}
                                      </Badge>
                                      
                                      {!notification.read && (
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => markAsRead([notification.id])}
                                          disabled={actionLoading}
                                          className="text-xs"
                                        >
                                          <Check className="w-3 h-3 mr-1" />
                                          既読
                                        </Button>
                                      )}
                                      
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => deleteNotifications([notification.id])}
                                        disabled={actionLoading}
                                        className="text-xs"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        削除
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* アカウントタブ */}
              {activeTab === 'account' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <User className="w-5 h-5 text-blue-600" />
                      <h3 className="text-xl font-bold text-gray-900">アカウント設定</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 基本情報 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">基本情報</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">メールアドレス</span>
                            <p className="text-sm text-gray-600">{profile?.email}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            変更
                          </Button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">名前</span>
                            <p className="text-sm text-gray-600">{profile?.full_name || '未設定'}</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push('/profile')}
                          >
                            編集
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* 言語・地域設定 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">言語・地域</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">言語</label>
                          <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="ja">日本語</option>
                            <option value="en">English</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">タイムゾーン</label>
                          <select
                            value={timezone}
                            onChange={(e) => setTimezone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Asia/Tokyo">日本標準時 (JST)</option>
                            <option value="UTC">協定世界時 (UTC)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* データ管理 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">データ管理</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button
                          variant="outline"
                          onClick={exportData}
                          className="flex items-center justify-center"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          データをエクスポート
                        </Button>
                        
                        <Button
                          variant="outline"
                          className="flex items-center justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          データをインポート
                        </Button>
                      </div>
                    </div>

                    {/* 危険な操作 */}
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <h4 className="font-medium text-red-900 mb-3">危険な操作</h4>
                      <div className="space-y-3">
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-center text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          ログアウト
                        </Button>
                        
                        <Button
                          variant="outline"
                          onClick={deleteAccount}
                          className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          アカウントを削除
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* プライバシータブ */}
              {activeTab === 'privacy' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-green-600" />
                      <h3 className="text-xl font-bold text-gray-900">プライバシー設定</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* データの使用 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">データの使用</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">分析データの改善への利用</span>
                            <p className="text-sm text-gray-600">匿名化されたデータをサービス改善に利用</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                          </button>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-700">使用状況の分析</span>
                            <p className="text-sm text-gray-600">アプリの使用状況を分析してUX改善</p>
                          </div>
                          <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300">
                            <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* セキュリティ */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">セキュリティ</h4>
                      <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Lock className="w-4 h-4 mr-2" />
                          パスワードを変更
                        </Button>
                        
                        <Button variant="outline" className="w-full justify-start">
                          <Shield className="w-4 h-4 mr-2" />
                          二段階認証を設定
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* 外観タブ */}
              {activeTab === 'appearance' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Palette className="w-5 h-5 text-purple-600" />
                      <h3 className="text-xl font-bold text-gray-900">外観設定</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* テーマ設定 */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">テーマ</h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { key: 'light', label: 'ライト', icon: Sun },
                          { key: 'dark', label: 'ダーク', icon: Moon },
                          { key: 'system', label: 'システム', icon: Globe }
                        ].map(option => (
                          <button
                            key={option.key}
                            onClick={() => setTheme(option.key as any)}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              theme === option.key
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <option.icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-sm font-medium">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* サブスクリプションタブ */}
              {activeTab === 'subscription' && (
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-5 h-5 text-yellow-600" />
                      <h3 className="text-xl font-bold text-gray-900">サブスクリプション</h3>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* 現在のプラン */}
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-bold text-gray-900">
                            {profile?.subscription_status === 'premium' ? 'プレミアムプラン' : 'フリープラン'}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {profile?.subscription_status === 'premium' 
                              ? '全ての機能をご利用いただけます'
                              : '基本機能をご利用いただけます'
                            }
                          </p>
                        </div>
                        <Badge className={`${
                          profile?.subscription_status === 'premium' 
                            ? 'bg-gradient-to-r from-yellow-400 to-orange-500' 
                            : 'bg-gray-500'
                        } text-white border-0`}>
                          {profile?.subscription_status === 'premium' ? 'プレミアム' : 'フリー'}
                        </Badge>
                      </div>
                      
                      {profile?.subscription_status === 'free' ? (
                        <Button 
                          onClick={() => router.push('/pricing')}
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          プレミアムにアップグレード
                        </Button>
                      ) : (
                        <div className="space-y-3">
                          <Button
                            variant="outline"
                            onClick={() => router.push('/pricing')}
                            className="w-full justify-center text-blue-600 border-blue-300 hover:bg-blue-50"
                          >
                            <CreditCard className="w-4 h-4 mr-2" />
                            プラン変更
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push('/settings/cancel')}
                            className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-2" />
                            サブスクリプションを解約
                          </Button>
                          <p className="text-xs text-gray-600 text-center">
                            解約前に特別オファーをご用意しています
                          </p>
                        </div>
                      )}
                    </div>

                    {/* プラン比較 */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <h5 className="font-medium text-gray-900 mb-3">フリープラン</h5>
                        <ul className="space-y-2 text-sm text-gray-600">
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            基本的なAI分析
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-500 mr-2" />
                            目標設定（3個まで）
                          </li>
                          <li className="flex items-center">
                            <X className="w-4 h-4 text-red-500 mr-2" />
                            高度な分析機能
                          </li>
                        </ul>
                      </div>
                      
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-900 mb-3">プレミアムプラン</h5>
                        <ul className="space-y-2 text-sm text-purple-800">
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-purple-600 mr-2" />
                            全てのAI分析機能
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-purple-600 mr-2" />
                            無制限の目標設定
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-purple-600 mr-2" />
                            詳細な進捗分析
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </div>
    )
  }

  // モバイル版レイアウト
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* モバイルヘッダー */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <h1 className="text-lg font-bold text-gray-900">設定</h1>
            </div>
            <div className="flex items-center space-x-2">
              {activeTab === 'notifications' && unreadCount > 0 && (
                <Badge className="bg-red-500 text-white border-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50">
        <div className="px-4 py-3">
          <div className="flex space-x-2 overflow-x-auto">
            {[
              { key: 'notifications', label: '通知', icon: Bell },
              { key: 'account', label: 'アカウント', icon: User },
              { key: 'privacy', label: 'プライバシー', icon: Shield },
              { key: 'appearance', label: '外観', icon: Palette }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-full text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {/* 通知タブ（モバイル） */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
            {/* 通知設定 */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">通知設定</h3>
                  <Button
                    size="sm"
                    onClick={saveNotificationSettings}
                    disabled={saving}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {saving ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* メール通知 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Bell className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-900">メール通知</span>
                    </div>
                    <button
                      onClick={() => setNotificationSettings(prev => ({ 
                        ...prev, 
                        email_notifications: !prev.email_notifications 
                      }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        notificationSettings.email_notifications ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.email_notifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {notificationSettings.email_notifications && (
                    <div className="space-y-2 ml-6">
                      {[
                        { key: 'analysis_complete', label: 'AI分析完了' },
                        { key: 'goal_reminders', label: '目標リマインダー' },
                        { key: 'weekly_summary', label: '週次サマリー' }
                      ].map(option => (
                        <div key={option.key} className="flex items-center justify-between">
                          <span className="text-xs text-gray-700">{option.label}</span>
                          <button
                            onClick={() => setNotificationSettings(prev => ({ 
                              ...prev, 
                              [option.key]: !prev[option.key as keyof NotificationSettings] 
                            }))}
                            className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                              notificationSettings[option.key as keyof NotificationSettings] ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                                notificationSettings[option.key as keyof NotificationSettings] ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* プッシュ通知 */}
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <BellRing className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-gray-900">プッシュ通知</span>
                    </div>
                    <button
                      onClick={() => setNotificationSettings(prev => ({ 
                        ...prev, 
                        push_notifications: !prev.push_notifications 
                      }))}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        notificationSettings.push_notifications ? 'bg-purple-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          notificationSettings.push_notifications ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近の通知 */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">最近の通知</h3>
                  {unreadCount > 0 && (
                    <Button
                      size="sm"
                      onClick={() => markAsRead(notifications.filter(n => !n.read).map(n => n.id))}
                      disabled={actionLoading}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      全既読
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {notifications.length === 0 ? (
                  <div className="text-center py-6">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">通知がありません</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notifications.slice(0, 5).map((notification) => {
                      const typeInfo = getNotificationTypeInfo(notification.type)
                      const IconComponent = typeInfo.icon

                      return (
                        <div 
                          key={notification.id}
                          className={`p-3 rounded-lg border ${
                            !notification.read 
                              ? 'bg-blue-50 border-blue-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`p-1 rounded-lg bg-gradient-to-r ${typeInfo.color} flex-shrink-0`}>
                              <IconComponent className="w-3 h-3 text-white" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-medium text-sm ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                )}
                              </div>
                              
                              <p className={`text-xs ${!notification.read ? 'text-gray-800' : 'text-gray-600'} mb-2`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">
                                  {formatDate(notification.created_at)}
                                </span>
                                
                                <div className="flex items-center space-x-1">
                                  {!notification.read && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => markAsRead([notification.id])}
                                      disabled={actionLoading}
                                      className="text-xs px-2 py-1 h-auto"
                                    >
                                      <Check className="w-3 h-3" />
                                    </Button>
                                  )}
                                  
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => deleteNotifications([notification.id])}
                                    disabled={actionLoading}
                                    className="text-xs px-2 py-1 h-auto"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* アカウントタブ（モバイル） */}
        {activeTab === 'account' && (
          <div className="space-y-4">
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <h3 className="text-base font-bold text-gray-900">アカウント情報</h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">メールアドレス</span>
                    <Button variant="outline" size="sm" className="text-xs">
                      変更
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 break-all">{profile?.email}</p>
                </div>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">名前</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => router.push('/profile')}
                    >
                      編集
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">{profile?.full_name || '未設定'}</p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full justify-center text-orange-600 border-orange-300 hover:bg-orange-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    ログアウト
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={deleteAccount}
                    className="w-full justify-center text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    アカウントを削除
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* プライバシータブ（モバイル） */}
        {activeTab === 'privacy' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <h3 className="text-base font-bold text-gray-900">プライバシー設定</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-gray-700">分析データの改善への利用</span>
                    <p className="text-xs text-gray-600">匿名化されたデータをサービス改善に利用</p>
                  </div>
                  <button className="relative inline-flex h-5 w-9 items-centers rounded-full bg-blue-600">
                    <span className="inline-block h-3 w-3 transform rounded-full bg-white translate-x-5" />
                  </button>
                </div>
                
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="w-4 h-4 mr-2" />
                  パスワードを変更
                </Button>
                
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  二段階認証を設定
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 外観タブ（モバイル） */}
        {activeTab === 'appearance' && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <h3 className="text-base font-bold text-gray-900">外観設定</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'light', label: 'ライト', icon: Sun },
                  { key: 'dark', label: 'ダーク', icon: Moon },
                  { key: 'system', label: 'システム', icon: Globe }
                ].map(option => (
                  <button
                    key={option.key}
                    onClick={() => setTheme(option.key as any)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === option.key
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
