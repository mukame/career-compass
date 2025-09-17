'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Profile } from '@/types/database'
import { useRouter } from 'next/navigation'

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const getProfile = async () => {
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

        if (error) {
          if (error.code === 'PGRST116') {
            // プロファイルが存在しない場合、新規作成
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email!,
                  full_name: user.user_metadata?.full_name || null,
                }
              ])
              .select()
              .single()

            if (createError) throw createError
            setProfile(newProfile)
          } else {
            throw error
          }
        } else {
          setProfile(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'プロファイルの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    getProfile()
  }, [router])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return

    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single()

      if (error) throw error
      setProfile(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'プロファイルの更新に失敗しました')
      throw err
    }
  }

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: () => {
      setLoading(true)
      // useEffectが再実行される
    }
  }
}
