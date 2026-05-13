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

    // Safety timeout — never stay loading forever
    const timeout = setTimeout(() => setLoading(false), 5000)

    async function fetchProfile(u: User) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', u.id)
          .maybeSingle()

        if (data) {
          setProfile(data as Profile)
          setLoading(false)
          return
        }

        // RLS may block read before insert — try upsert first
        const { error: upsertError } = await supabase.from('profiles').upsert({
          id: u.id,
          name: u.user_metadata?.full_name || u.user_metadata?.name || null,
          avatar_url: u.user_metadata?.avatar_url || null,
          role: 'client',
        }, { onConflict: 'id' })

        if (!upsertError) {
          const { data: created } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', u.id)
            .maybeSingle()
          setProfile((created as Profile | null) ?? {
            id: u.id,
            name: u.user_metadata?.full_name || null,
            phone: null,
            role: 'client',
            avatar_url: u.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        } else {
          // Fallback: build profile from user metadata even if DB fails
          setProfile({
            id: u.id,
            name: u.user_metadata?.full_name || u.email || null,
            phone: null,
            role: 'client',
            avatar_url: u.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch {
        // Always unblock loading
        setProfile({
          id: u.id,
          name: u.user_metadata?.full_name || null,
          phone: null,
          role: 'client',
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
      } finally {
        setLoading(false)
      }
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

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signOut }
}
