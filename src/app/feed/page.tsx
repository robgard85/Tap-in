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

type SignalRow = {
  id: string
  created_at: string
  updated_at: string
  user_id: string
  city: string
  category: string
  body: string | null
  expires_at: string
  closed_at: string | null
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  const [signalsLoading, setSignalsLoading] = useState(true)
  const [signals, setSignals] = useState<SignalRow[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data } = await supabase.auth.getUser()

      if (!data?.user) {
        router.replace('/login')
        return
      }

      setUserEmail(data.user.email ?? null)
      setLoading(false)

      // Fetch signals after auth is confirmed
      setSignalsLoading(true)
      setError(null)

      const { data: rows, error: fetchErr } = await supabase
        .from('signals')
        .select(
          'id,created_at,updated_at,user_id,city,category,body,expires_at,closed_at'
        )
        .is('closed_at', null)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchErr) {
        setError(fetchErr.message)
        setSignals([])
      } else {
        setSignals((rows as SignalRow[]) ?? [])
      }

      setSignalsLoading(false)
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
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/70">Signals</p>
            <p className="text-sm text-white/60">{signals.length}</p>
          </div>

          {signalsLoading ? (
            <p className="mt-3 text-white/70 text-sm">Loading signals…</p>
          ) : error ? (
            <div className="mt-3 text-sm text-red-300">
              <div className="font-semibold">Can’t load signals</div>
              <div className="mt-1 break-words">{error}</div>
              <div className="mt-2 text-white/60">
                This usually means RLS is blocking SELECT or your env vars are wrong.
              </div>
            </div>
          ) : signals.length === 0 ? (
            <p className="mt-3 text-white/70 text-sm">
              No open signals yet.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {signals.map((s) => (
                <div
                  key={s.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {s.category} • {s.city}
                    </div>
                    <div className="text-xs text-white/60">
                      {new Date(s.created_at).toLocaleString()}
                    </div>
                  </div>

                  {s.body ? (
                    <div className="mt-2 text-sm text-white/80 whitespace-pre-wrap">
                      {s.body}
                    </div>
                  ) : (
                    <div className="mt-2 text-sm text-white/60 italic">
                      (no message)
                    </div>
                  )}

                  <div className="mt-3 text-xs text-white/50">
                    Expires: {new Date(s.expires_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
