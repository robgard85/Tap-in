'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing Supabase env vars')
  return createBrowserClient(url, key)
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.replace('/login')
        return
      }

      setUserEmail(data.user.email ?? null)
      setLoading(false)
    })()
  }, [router, supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-white/70 text-sm">Loading feed…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6">
      <div className="max-w-md mx-auto space-y-6">

        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Tap-In Feed</h1>
          <button
            onClick={signOut}
            className="text-sm text-white/70 border border-white/20 px-3 py-1 rounded-lg"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-sm text-white/70">Logged in as:</p>
          <p className="mt-1 font-medium">{userEmail}</p>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="text-white/70 text-sm">
            Feed placeholder. Signals will render here.
          </p>
        </div>

      </div>
    </main>
  )
}
