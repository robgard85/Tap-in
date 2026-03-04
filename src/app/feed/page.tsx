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
  user_id: string
  city: string
  category: string
  body: string | null
  expires_at: string
  closed_at: string | null
}

function isoPlusHours(hours: number) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString()
}

export default function FeedPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [signals, setSignals] = useState<SignalRow[]>([])
  const [signalsLoading, setSignalsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Create Signal UI
  const [showCreate, setShowCreate] = useState(false)
  const [city, setCity] = useState('Kannapolis')
  const [category, setCategory] = useState('general')
  const [body, setBody] = useState('')

  useEffect(() => {
    ;(async () => {
      const { data, error } = await supabase.auth.getUser()

      if (error) {
        setErrorMsg(error.message)
        router.replace('/login')
        return
      }

      if (!data?.user) {
        router.replace('/login')
        return
      }

      setUserEmail(data.user.email ?? null)
      setUserId(data.user.id)
      setLoading(false)
    })()
  }, [router, supabase])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  async function loadSignals() {
    setSignalsLoading(true)
    setErrorMsg(null)

    const { data, error } = await supabase
      .from('signals')
      .select('id, created_at, user_id, city, category, body, expires_at, closed_at')
      .is('closed_at', null)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      setErrorMsg(error.message)
      setSignals([])
      setSignalsLoading(false)
      return
    }

    setSignals(data ?? [])
    setSignalsLoading(false)
  }

  useEffect(() => {
    if (!loading) loadSignals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])
    useEffect(() => {
  if (loading) return

  const channel = supabase
    .channel('signals-live')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'signals' },
      () => {
        loadSignals()
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [loading, supabase])

  async function createSignal() {
    async function closeSignal(signalId: string) {
  setErrorMsg(null)

  const { error } = await supabase
    .from('signals')
    .update({ closed_at: new Date().toISOString() })
    .eq('id', signalId)

  if (error) {
    setErrorMsg(error.message)
    return
  }

  await loadSignals()
}if (!userId) return

    setErrorMsg(null)

    const payload = {
      user_id: userId,
      city: city.trim(),
      category: category.trim(),
      body: body.trim() ? body.trim() : null,
      expires_at: isoPlusHours(24), // 24 hours from now
    }

    const { error } = await supabase.from('signals').insert(payload)

    if (error) {
      setErrorMsg(error.message)
      return
    }

    // reset + refresh
    setShowCreate(false)
    setBody('')
    await loadSignals()
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

        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {errorMsg}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-white/80 text-sm">
            Signals{' '}
            <span className="text-white/50">
              {signalsLoading ? '(loading...)' : `(${signals.length})`}
            </span>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-2 rounded-lg"
          >
            + Create Signal
          </button>
        </div>

        <div className="space-y-3">
          {signals.length === 0 && !signalsLoading ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
              No open signals yet.
            </div>
          ) : (
            signals.map((s) => (
              <div key={s.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex justify-between gap-3">
                  <div className="font-semibold">
                    {s.category} <span className="text-white/50">•</span> {s.city}
                  </div>
                  <div className="text-xs text-white/50 whitespace-nowrap">
                    {new Date(s.created_at).toLocaleString()}
                  </div>
                </div>
                {s.body ? (
                  <div className="mt-2 text-white/80">{s.body}</div>
                ) : (
                  <div className="mt-2 text-white/50 text-sm">(no message)</div>
                )}
                <div className="mt-2 text-xs text-white/50">
                  Expires: {new Date(s.expires_at).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#071022] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Create Signal</div>
              <button
                onClick={() => setShowCreate(false)}
                className="text-white/60 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">City</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
                placeholder="Kannapolis"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">Category</label>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
                placeholder="general"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-white/60">Message (optional)</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full min-h-[90px] rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm outline-none"
                placeholder="What’s your signal?"
              />
              <div className="text-xs text-white/50">
                Auto-expires in 24 hours.
              </div>
            </div>

            <button
              onClick={createSignal}
              className="w-full rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 px-3 py-2 text-sm font-medium"
            >
              Post Signal
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
