'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { 
  User, 
  Briefcase, 
  Target, 
  Heart, 
  Edit3, 
  Save, 
  X, 
  Mail, 
  Calendar,
  Building,
  DollarSign,
  TrendingUp,
  Award,
  Palette,
  Shield,
  CheckCircle
} from 'lucide-react'
import { useIsDesktop } from '@/hooks/useIsDesktop'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  age: number | null
  current_industry: string | null
  current_job_title: string | null
  current_skills: string[] | null
  current_annual_income: number | null
  target_industry: string | null
  target_job_title: string | null
  target_annual_income: number | null
  career_direction: string | null
  values_work_life_balance: number | null
  values_career_growth: number | null
  values_compensation: number | null
  values_autonomy: number | null
  values_impact: number | null
  subscription_status: 'free' | 'premium'
  created_at: string
  updated_at: string
  // 新しいフィールド
  last_name?: string | null
  first_name?: string | null
  last_name_kana?: string | null
  first_name_kana?: string | null
  occupation_category?: string | null
  occupation_detail?: string | null
  experience_years?: string | null
  motivation_reason?: string | null
  interests?: string[] | null
}

// ヘルパー関数
const getDisplayName = (profile: UserProfile) => {
  if (profile.last_name && profile.first_name) {
    return `${profile.last_name} ${profile.first_name}`
  }
  return profile.full_name || 'ユーザー'
}

const getOccupationDisplay = (profile: UserProfile) => {
  if (profile.occupation_category) {
    if (profile.occupation_category === 'その他' && profile.occupation_detail) {
      return profile.occupation_detail
    }
    return profile.occupation_category
  }
  return profile.current_job_title || '職種未設定'
}

// アイコン選択用のイラストアイコン
const avatarIcons = [
  { id: 'business-man', icon: '👨‍💼', name: 'ビジネスマン' },
  { id: 'business-woman', icon: '👩‍💼', name: 'ビジネスウーマン' },
  { id: 'developer', icon: '👨‍💻', name: '開発者' },
  { id: 'designer', icon: '👩‍🎨', name: 'デザイナー' },
  { id: 'scientist', icon: '👨‍🔬', name: '研究者' },
  { id: 'teacher', icon: '👩‍🏫', name: '教育者' },
  { id: 'doctor', icon: '👨‍⚕️', name: '医療従事者' },
  { id: 'engineer', icon: '👷‍♀️', name: 'エンジニア' },
  { id: 'consultant', icon: '🧑‍💼', name: 'コンサルタント' },
  { id: 'creative', icon: '🎭', name: 'クリエイター' }
]

const industries = [
  'IT・通信', '金融・保険', '製造業', '商社・流通', 'コンサルティング', 
  '医療・介護', '教育', '公務員', 'その他'
]

const occupationCategories = [
  'IT・エンジニア系', '営業・セールス', 'マーケティング・広報', '経営・管理職',
  '企画・事業開発', '人事・総務', '経理・財務', 'コンサルティング',
  'デザイナー・クリエイティブ', '製造・技術', '研究・開発', '医療・介護・福祉',
  '教育・保育', '公務員', '金融・保険', '不動産', '小売・販売', 'サービス業',
  '運輸・物流', '建設・建築', '農林水産業', 'フリーランス・個人事業主',
  '学生', '専業主婦・主夫', '無職・求職中', 'その他'
]

const experienceYears = [
  '1年未満', '1-3年', '3-5年', '5-10年', '10-15年', '15-20年', '20年以上'
]

const motivationReasons = [
  '自己理解の促進', '社内でのキャリアアップ', '転職成功', 
  '新しいことへのチャレンジ', 'なんとなく', 'その他'
]

const interestOptions = [
  'テクノロジー', 'マーケティング', 'セールス', 'デザイン',
  'データ分析', '人事・採用', 'コンサルティング', '教育',
  'ヘルスケア', '金融', 'エンターテイメント', 'サステナビリティ',
  'スタートアップ', 'グローバルビジネス', 'DX・デジタル化', 'AI・機械学習'
]

const careerDirections = [
  { value: 'management', label: 'マネジメント志向', icon: '👑' },
  { value: 'specialist', label: 'スペシャリスト志向', icon: '🎯' }
]

// シンプルなタブコンポーネント
interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
}

const Tabs = ({ value, onValueChange, children }: TabsProps) => {
  return <div>{children}</div>
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

const TabsList = ({ children, className }: TabsListProps) => {
  return <div className={className}>{children}</div>
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsTrigger = ({ value, children, className }: TabsTriggerProps) => {
  return <div className={className}>{children}</div>
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContent = ({ value, children, className }: TabsContentProps) => {
  return <div className={className}>{children}</div>
}

export default function ProfilePage() {
  const { isDesktop, isClient } = useIsDesktop()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [editData, setEditData] = useState<Partial<UserProfile>>({})
  const [selectedAvatar, setSelectedAvatar] = useState('business-man')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      
      setProfile(data)
      setEditData(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profile) return
    
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({
          ...editData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editData })
      setEditMode(false)
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('プロフィールの更新に失敗しました。')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditData(profile || {})
    setEditMode(false)
  }

  const handleInterestToggle = (interest: string) => {
    const currentInterests = editData.interests || []
    const updated = currentInterests.includes(interest)
      ? currentInterests.filter(item => item !== interest)
      : [...currentInterests, interest]
    setEditData({...editData, interests: updated})
  }

  const getCompletionPercentage = () => {
    if (!profile) return 0
    
    const fields = [
      'full_name', 'age', 'current_industry', 'current_job_title', 
      'current_annual_income', 'target_industry', 'target_job_title',
      'target_annual_income', 'career_direction'
    ]
    
    // 新しいフィールドも考慮
    const newFields = [
      'last_name', 'first_name', 'occupation_category', 'experience_years', 'motivation_reason'
    ]
    
    const allFields = [...fields, ...newFields]
    const completed = allFields.filter(field => profile[field as keyof UserProfile]).length
    return Math.round((completed / allFields.length) * 100)
  }

  const getValueLabel = (value: number | null) => {
    if (!value) return '未設定'
    const labels = ['', '重要でない', 'あまり重要でない', '普通', '重要', '非常に重要']
    return labels[value] || '未設定'
  }

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
          <p className="text-gray-600">プロフィールを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-gray-400 mx-auto" />
          <p className="text-gray-600">プロフィールが見つかりません</p>
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
                <h1 className="text-2xl font-bold text-gray-900">プロフィール設定</h1>
                <p className="text-gray-600 mt-1">あなたの情報を管理・更新しましょう</p>
              </div>
              <div className="flex items-center space-x-4">
                {!editMode ? (
                  <Button 
                    onClick={() => setEditMode(true)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    編集する
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <X className="w-4 h-4 mr-2" />
                      キャンセル
                    </Button>
                    <Button
                      onClick={handleSave}
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
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* プロフィールサマリー */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm sticky top-24">
                <CardContent className="p-6 text-center">
                  {/* アバター選択 */}
                  <div className="mb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl shadow-lg">
                      {avatarIcons.find(icon => icon.id === selectedAvatar)?.icon || '👤'}
                    </div>
                    
                    {editMode && (
                      <div className="grid grid-cols-5 gap-2 mt-4">
                        {avatarIcons.map((icon) => (
                          <button
                            key={icon.id}
                            onClick={() => setSelectedAvatar(icon.id)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                              selectedAvatar === icon.id
                                ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            <span className="text-lg">{icon.icon}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {getDisplayName(profile)}
                  </h2>
                  <p className="text-gray-600 mb-4">{getOccupationDisplay(profile)}</p>
                  
                  <Badge className="mb-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                    {profile.subscription_status === 'premium' ? 'プレミアム' : 'フリー'}プラン
                  </Badge>

                  {/* 完了度 */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>プロフィール完了度</span>
                      <span>{getCompletionPercentage()}%</span>
                    </div>
                    <Progress value={getCompletionPercentage()} className="h-2" />
                  </div>

                  {/* アカウント情報 */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">メールアドレス</span>
                      <Shield className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-900 break-all">{profile.email}</p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 w-full text-xs"
                      onClick={() => alert('メールアドレス変更機能は準備中です')}
                    >
                      変更する
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* メインコンテンツ */}
            <div className="lg:col-span-3">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'basic'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>基本情報</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('career')}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'career'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Target className="w-4 h-4" />
                    <span>キャリア</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('values')}
                    className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      activeTab === 'values'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Heart className="w-4 h-4" />
                    <span>価値観</span>
                  </button>
                </TabsList>

                {/* 基本情報タブ */}
                {activeTab === 'basic' && (
                  <TabsContent value="basic">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <User className="w-5 h-5 text-blue-600" />
                          <h3 className="text-xl font-bold text-gray-900">基本情報</h3>
                        </div>
                        <p className="text-gray-600 mt-2">あなたの基本的な情報を管理します</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 名前 - 新旧対応 */}
                          {editMode ? (
                            <>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  姓
                                </label>
                                <input
                                  type="text"
                                  value={editData.last_name || ''}
                                  onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="山田"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  名
                                </label>
                                <input
                                  type="text"
                                  value={editData.first_name || ''}
                                  onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="太郎"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  姓（フリガナ）
                                </label>
                                <input
                                  type="text"
                                  value={editData.last_name_kana || ''}
                                  onChange={(e) => setEditData({...editData, last_name_kana: e.target.value})}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="ヤマダ"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                  名（フリガナ）
                                </label>
                                <input
                                  type="text"
                                  value={editData.first_name_kana || ''}
                                  onChange={(e) => setEditData({...editData, first_name_kana: e.target.value})}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="タロウ"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                氏名
                              </label>
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {getDisplayName(profile)}
                              </p>
                              {profile.last_name_kana && profile.first_name_kana && (
                                <p className="text-sm text-gray-500 mt-1">
                                  フリガナ: {profile.last_name_kana} {profile.first_name_kana}
                                </p>
                              )}
                            </div>
                          )}

                          {/* 年齢 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              年齢
                            </label>
                            {editMode ? (
                              <input
                                type="number"
                                value={editData.age?.toString() || ''}
                                onChange={(e) => setEditData({...editData, age: parseInt(e.target.value) || null})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="30"
                              />
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.age ? `${profile.age}歳` : '未設定'}
                              </p>
                            )}
                          </div>

                          {/* 職業 - 新形式対応 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              職業
                            </label>
                            {editMode ? (
                              <div className="space-y-2">
                                <select
                                  value={editData.occupation_category || ''}
                                  onChange={(e) => setEditData({
                                    ...editData, 
                                    occupation_category: e.target.value,
                                    occupation_detail: e.target.value !== 'その他' ? '' : editData.occupation_detail
                                  })}
                                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                  <option value="">職業を選択してください</option>
                                  {occupationCategories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                  ))}
                                </select>
                                {editData.occupation_category === 'その他' && (
                                  <input
                                    type="text"
                                    value={editData.occupation_detail || ''}
                                    onChange={(e) => setEditData({...editData, occupation_detail: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="具体的な職業を入力してください"
                                  />
                                )}
                              </div>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {getOccupationDisplay(profile)}
                              </p>
                            )}
                          </div>

                          {/* 経験年数 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              経験年数
                            </label>
                            {editMode ? (
                              <select
                                value={editData.experience_years || ''}
                                onChange={(e) => setEditData({...editData, experience_years: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">経験年数を選択してください</option>
                                {experienceYears.map(years => (
                                  <option key={years} value={years}>{years}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.experience_years || '未設定'}
                              </p>
                            )}
                          </div>

                          {/* きっかけ */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Career Compassを始めたきっかけ
                            </label>
                            {editMode ? (
                              <select
                                value={editData.motivation_reason || ''}
                                onChange={(e) => setEditData({...editData, motivation_reason: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              >
                                <option value="">きっかけを選択してください</option>
                                {motivationReasons.map(reason => (
                                  <option key={reason} value={reason}>{reason}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.motivation_reason || '未設定'}
                              </p>
                            )}
                          </div>

                          {/* 興味分野 */}
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              興味のある分野
                            </label>
                            {editMode ? (
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {interestOptions.map(interest => (
                                  <button
                                    key={interest}
                                    onClick={() => handleInterestToggle(interest)}
                                    className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                                      (editData.interests || []).includes(interest)
                                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                                        : 'border-gray-300 hover:border-blue-300'
                                    }`}
                                  >
                                    {interest}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.interests && profile.interests.length > 0
                                  ? profile.interests.join(', ')
                                  : '未設定'
                                }
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* キャリアタブ（既存のまま） */}
                {activeTab === 'career' && (
                  <TabsContent value="career">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5 text-green-600" />
                          <h3 className="text-xl font-bold text-gray-900">キャリア目標</h3>
                        </div>
                        <p className="text-gray-600 mt-2">あなたの目指すキャリアの方向性を設定します</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* 目標業界 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              目標とする業界
                            </label>
                            {editMode ? (
                              <select
                                value={editData.target_industry || ''}
                                onChange={(e) => setEditData({...editData, target_industry: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              >
                                <option value="">選択してください</option>
                                {[...industries, '現在と同じ'].map(industry => (
                                  <option key={industry} value={industry}>{industry}</option>
                                ))}
                              </select>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.target_industry || '未設定'}
                              </p>
                            )}
                          </div>

                          {/* 目標職種 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              目標とする職種
                            </label>
                            {editMode ? (
                              <input
                                type="text"
                                value={editData.target_job_title || ''}
                                onChange={(e) => setEditData({...editData, target_job_title: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="テックリード"
                              />
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.target_job_title || '未設定'}
                              </p>
                            )}
                          </div>

                          {/* 目標年収 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              目標年収（万円）
                            </label>
                            {editMode ? (
                              <input
                                type="number"
                                value={editData.target_annual_income?.toString() || ''}
                                onChange={(e) => setEditData({...editData, target_annual_income: parseInt(e.target.value) || null})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                placeholder="800"
                              />
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {profile.target_annual_income ? `${profile.target_annual_income}万円` : '未設定'}
                              </p>
                            )}
                          </div>

                          {/* キャリア方向性 */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              キャリアの方向性
                            </label>
                            {editMode ? (
                              <div className="space-y-2">
                                {careerDirections.map((direction) => (
                                  <button
                                    key={direction.value}
                                    onClick={() => setEditData({...editData, career_direction: direction.value})}
                                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                                      editData.career_direction === direction.value
                                        ? 'border-green-500 bg-green-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                  >
                                    <span className="mr-2">{direction.icon}</span>
                                    {direction.label}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <p className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                                {careerDirections.find(d => d.value === profile.career_direction)?.label || '未設定'}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {/* 価値観タブ（既存のまま） */}
                {activeTab === 'values' && (
                  <TabsContent value="values">
                    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-center space-x-2">
                          <Heart className="w-5 h-5 text-purple-600" />
                          <h3 className="text-xl font-bold text-gray-900">価値観設定</h3>
                        </div>
                        <p className="text-gray-600 mt-2">キャリアにおいて重視する価値観を管理します</p>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {[
                          { key: 'values_work_life_balance', label: 'ワークライフバランス', description: '仕事とプライベートの両立' },
                          { key: 'values_career_growth', label: 'キャリア成長', description: '昇進や職責の拡大' },
                          { key: 'values_compensation', label: '報酬・待遇', description: '給与や福利厚生の充実' },
                          { key: 'values_autonomy', label: '自律性', description: '裁量権や自由度の高さ' },
                          { key: 'values_impact', label: '社会的影響', description: '社会や他者への貢献' }
                        ].map((value) => (
                          <div key={value.key} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-medium text-gray-900">{value.label}</h4>
                                <p className="text-sm text-gray-600">{value.description}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-lg font-bold text-purple-600">
                                  {(profile as any)[value.key] || 0}
                                </span>
                                <p className="text-xs text-gray-500">
                                  {getValueLabel((profile as any)[value.key])}
                                </p>
                              </div>
                            </div>
                            {editMode && (
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={(editData as any)[value.key] || 1}
                                onChange={(e) => setEditData({
                                  ...editData,
                                  [value.key]: parseInt(e.target.value)
                                })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                              />
                            )}
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // モバイル版レイアウト（既存UIを保持しつつ新フィールド対応）
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-20">
      {/* モバイルヘッダー */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900">プロフィール</h1>
              <p className="text-sm text-gray-600">設定を管理</p>
            </div>
            {!editMode ? (
              <Button 
                size="sm"
                onClick={() => setEditMode(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                編集
              </Button>
            ) : (
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
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
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* プロフィールサマリーカード */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
                  {avatarIcons.find(icon => icon.id === selectedAvatar)?.icon || '👤'}
                </div>
                
                {editMode && (
                  <div className="mt-2">
                    <div className="grid grid-cols-5 gap-1">
                      {avatarIcons.slice(0, 5).map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => setSelectedAvatar(icon.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
                            selectedAvatar === icon.id
                              ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span>{icon.icon}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-1 mt-1">
                      {avatarIcons.slice(5, 10).map((icon) => (
                        <button
                          key={icon.id}
                          onClick={() => setSelectedAvatar(icon.id)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all text-sm ${
                            selectedAvatar === icon.id
                              ? 'bg-blue-100 ring-2 ring-blue-500 scale-110'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          <span>{icon.icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-bold text-gray-900 truncate">
                  {getDisplayName(profile)}
                </h2>
                <p className="text-sm text-gray-600 truncate">{getOccupationDisplay(profile)}</p>
                
                <div className="flex items-center space-x-2 mt-2">
                  <Badge className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                    {profile.subscription_status === 'premium' ? 'プレミアム' : 'フリー'}
                  </Badge>
                  <span className="text-xs text-gray-500">完了度 {getCompletionPercentage()}%</span>
                </div>
                
                <div className="mt-2">
                  <Progress value={getCompletionPercentage()} className="h-1" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 基本情報カード */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-bold text-gray-900">基本情報</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* 名前セクション - モバイル版 */}
            {editMode ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">姓</label>
                  <input
                    type="text"
                    value={editData.last_name || ''}
                    onChange={(e) => setEditData({...editData, last_name: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="山田"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">名</label>
                  <input
                    type="text"
                    value={editData.first_name || ''}
                    onChange={(e) => setEditData({...editData, first_name: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="太郎"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">姓（フリガナ）</label>
                  <input
                    type="text"
                    value={editData.last_name_kana || ''}
                    onChange={(e) => setEditData({...editData, last_name_kana: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ヤマダ"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">名（フリガナ）</label>
                  <input
                    type="text"
                    value={editData.first_name_kana || ''}
                    onChange={(e) => setEditData({...editData, first_name_kana: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="タロウ"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">氏名</label>
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {getDisplayName(profile)}
                </p>
                {profile.last_name_kana && profile.first_name_kana && (
                  <p className="text-xs text-gray-500 mt-1">
                    フリガナ: {profile.last_name_kana} {profile.first_name_kana}
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {/* 年齢 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">年齢</label>
                {editMode ? (
                  <input
                    type="number"
                    value={editData.age?.toString() || ''}
                    onChange={(e) => setEditData({...editData, age: parseInt(e.target.value) || null})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="30"
                  />
                ) : (
                  <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                    {profile.age ? `${profile.age}歳` : '未設定'}
                  </p>
                )}
              </div>

              {/* 経験年数 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">経験年数</label>
                {editMode ? (
                  <select
                    value={editData.experience_years || ''}
                    onChange={(e) => setEditData({...editData, experience_years: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">選択</option>
                    {experienceYears.map(years => (
                      <option key={years} value={years}>{years}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                    {profile.experience_years || '未設定'}
                  </p>
                )}
              </div>
            </div>

            {/* 職業 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">職業</label>
              {editMode ? (
                <div className="space-y-2">
                  <select
                    value={editData.occupation_category || ''}
                    onChange={(e) => setEditData({
                      ...editData, 
                      occupation_category: e.target.value,
                      occupation_detail: e.target.value !== 'その他' ? '' : editData.occupation_detail
                    })}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">職業を選択</option>
                    {occupationCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {editData.occupation_category === 'その他' && (
                    <input
                      type="text"
                      value={editData.occupation_detail || ''}
                      onChange={(e) => setEditData({...editData, occupation_detail: e.target.value})}
                      className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="具体的な職業"
                    />
                  )}
                </div>
              ) : (
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {getOccupationDisplay(profile)}
                </p>
              )}
            </div>

            {/* きっかけ */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">始めたきっかけ</label>
              {editMode ? (
                <select
                  value={editData.motivation_reason || ''}
                  onChange={(e) => setEditData({...editData, motivation_reason: e.target.value})}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">きっかけを選択</option>
                  {motivationReasons.map(reason => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              ) : (
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {profile.motivation_reason || '未設定'}
                </p>
              )}
            </div>

            {/* 興味分野 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">興味分野</label>
              {editMode ? (
                <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                  {interestOptions.map(interest => (
                    <button
                      key={interest}
                      onClick={() => handleInterestToggle(interest)}
                      className={`px-2 py-1 text-xs rounded border transition-all ${
                        (editData.interests || []).includes(interest)
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {profile.interests && profile.interests.length > 0
                    ? profile.interests.join(', ')
                    : '未設定'
                  }
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* キャリア目標カード（既存のまま） */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-600" />
              <h3 className="text-base font-bold text-gray-900">キャリア目標</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {/* 目標業界 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">目標業界</label>
                {editMode ? (
                  <select
                    value={editData.target_industry || ''}
                    onChange={(e) => setEditData({...editData, target_industry: e.target.value})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">選択してください</option>
                    {[...industries, '現在と同じ'].map(industry => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                ) : (
                  <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm truncate">
                    {profile.target_industry || '未設定'}
                  </p>
                )}
              </div>

              {/* 目標年収 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">目標年収（万円）</label>
                {editMode ? (
                  <input
                    type="number"
                    value={editData.target_annual_income?.toString() || ''}
                    onChange={(e) => setEditData({...editData, target_annual_income: parseInt(e.target.value) || null})}
                    className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="800"
                  />
                ) : (
                  <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                    {profile.target_annual_income ? `${profile.target_annual_income}万円` : '未設定'}
                  </p>
                )}
              </div>
            </div>

            {/* 目標職種 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">目標職種</label>
              {editMode ? (
                <input
                  type="text"
                  value={editData.target_job_title || ''}
                  onChange={(e) => setEditData({...editData, target_job_title: e.target.value})}
                  className="w-full px-2 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="テックリード"
                />
              ) : (
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {profile.target_job_title || '未設定'}
                </p>
              )}
            </div>

            {/* キャリア方向性 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">キャリア方向性</label>
              {editMode ? (
                <div className="grid grid-cols-1 gap-2">
                  {careerDirections.map((direction) => (
                    <button
                      key={direction.value}
                      onClick={() => setEditData({...editData, career_direction: direction.value})}
                      className={`w-full p-2 rounded-lg border-2 transition-all text-left text-sm ${
                        editData.career_direction === direction.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="mr-2">{direction.icon}</span>
                      {direction.label}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="px-2 py-2 bg-gray-50 rounded-lg text-gray-900 text-sm">
                  {careerDirections.find(d => d.value === profile.career_direction)?.label || '未設定'}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 価値観カード（既存のまま） */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-600" />
              <h3 className="text-base font-bold text-gray-900">価値観設定</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { key: 'values_work_life_balance', label: 'ワークライフバランス', icon: '⚖️' },
              { key: 'values_career_growth', label: 'キャリア成長', icon: '📈' },
              { key: 'values_compensation', label: '報酬・待遇', icon: '💰' },
              { key: 'values_autonomy', label: '自律性', icon: '🎯' },
              { key: 'values_impact', label: '社会的影響', icon: '🌟' }
            ].map((value) => (
              <div key={value.key} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-lg">{value.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{value.label}</h4>
                      <p className="text-xs text-gray-500">
                        {getValueLabel((profile as any)[value.key])}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-base font-bold text-purple-600">
                      {(profile as any)[value.key] || 0}
                    </span>
                  </div>
                </div>
                {editMode && (
                  <div className="mt-2">
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={(editData as any)[value.key] || 1}
                      onChange={(e) => setEditData({
                        ...editData,
                        [value.key]: parseInt(e.target.value)
                      })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>1</span>
                      <span>2</span>
                      <span>3</span>
                      <span>4</span>
                      <span>5</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* アカウント設定カード（既存のまま） */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-bold text-gray-900">アカウント設定</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm">メールアドレス</h4>
                <p className="text-xs text-gray-600 truncate">{profile.email}</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs flex-shrink-0 ml-2"
                onClick={() => alert('メールアドレス変更機能は準備中です')}
              >
                変更
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
