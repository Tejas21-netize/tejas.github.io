'use client'

import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  full_name: string | null
  company_name: string | null
  phone: string | null
  job_title: string | null
  created_at: string
  updated_at: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    // Get initial session
    const getUser = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()

        if (userError) throw userError

        setUser(user)

        if (user) {
          // Fetch profile data
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError
          }

          if (profileData) {
            setProfile(profileData)
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // Subscribe to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)

      if (session?.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  return { user, profile, loading }
}
