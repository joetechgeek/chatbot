'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useSupabase } from './SupabaseProvider'
import type { Session } from '@supabase/auth-helpers-nextjs'
import type { AuthChangeEvent } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const SupabaseAuthContext = createContext<{
  session: Session | null
  isLoading: boolean
}>({
  session: null,
  isLoading: true,
})

export default function SupabaseAuthProvider({
  children,
  serverSession,
}: {
  children: React.ReactNode
  serverSession: Session | null
}) {
  const supabase = useSupabase()
  const [session, setSession] = useState<Session | null>(serverSession)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, currentSession: Session | null) => {
        setSession(currentSession)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <SupabaseAuthContext.Provider value={{ session, isLoading }}>
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider')
  }
  return context
} 