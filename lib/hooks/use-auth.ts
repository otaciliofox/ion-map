'use client'

import { useEffect, useState } from 'react'
import type { User, Session, AuthChangeEvent } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase'
import type { Profile } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function fetchProfile(u: User) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', u.id)
        .single()

      if (data) {
        setProfile(data as Profile)
      } else {
        // Profile not created by trigger yet — upsert manually
        await supabase.from('profiles').upsert({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || null,
          avatar_url: u.user_metadata?.avatar_url || null,
          role: 'client',
        })
        const { data: created } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .single()
        setProfile(created as Profile | null)
      }
      setLoading(false)
    }

    async function init() {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      if (data.user) await fetchProfile(data.user)
      else setLoading(false)
    }
    init()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user ?? null)
        if (session?.user) fetchProfile(session.user)
        else { setProfile(null); setLoading(false) }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signOut }
}
