'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createBrowserClient(url, key)
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [ageBand, setAgeBand] = useState<'18-24' | '25-34' | '35-44' | '45-54' | '55+' | ''>('')
  const [intent, setIntent] = useState<'friends' | 'dating' | 'networking' | ''>('')

  useEffect(() => {
    ;(async () => {
      setError(null)
      const { data, error: authErr } = await supabase.auth.getUser()
      if (authErr || !data?.user) {
        router.replace('/login')
        return
      }

      // If profile already exists and is onboarded, skip
      const { data: prof } = await supabase
        .from('profiles')
        .select('id, onboarded')
        .eq('id', data.user.id)
        .maybeSingle()

      if (prof?.onboarded) {
        router.replace('/feed')
        return
      }

      setLoading(false)
    })()
  }, [router, supabase])

  async function onSave() {
    setError(null)

    const cleanName = displayName.trim()
    if (cleanName.length < 2) {
      setError('Display name must be at least 2 characters.')
      return
    }
    if (!ageBand) {
      setError('Pick an age range.')
      return
    }
    if (!intent) {
      setError('Pick your intent.')
      return
    }

    setSaving(true)
    try {
      const { data: u } = await supabase.auth.getUser()
      if (!u?.user) {
        router.replace('/login')
        return
      }

      const payload = {
        id: u.user.id,
        display_name: cleanName,
        bio: bio.trim().slice(0, 240),
        age_band: ageBand,
        intent,
        onboarded: true,
      }

      const { error: upErr } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' })
      if (upErr) throw upErr

      router.replace('/feed')
    } catch (e: any) {
      setError(e?.message ?? 'Failed to save onboarding.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-sm text-white/70">Loading…</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-6 flex items-start justify-center">
      <div className="w-full max-w-md pt-6 space-y-5">
        <div>
          <h1 className="text-2xl font-semibold">Finish setup</h1>
          <p className="text-white/70 text-sm mt-1">This takes 30 seconds.</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="space-y-3">
          <label className="block text-sm text-white/80">
            Display name
            <input
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 outline-none focus:border-white/25"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Rob"
              autoComplete="nickname"
            />
          </label>

          <label className="block text-sm text-white/80">
            Bio (optional)
            <textarea
              className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 outline-none focus:border-white/25 min-h-[110px]"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A couple lines about you…"
              maxLength={240}
            />
            <div className="mt-1 text-xs text-white/50">{bio.length}/240</div>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-white/80">
              Age range
              <select
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 outline-none focus:border-white/25"
                value={ageBand}
                onChange={(e) => setAgeBand(e.target.value as any)}
              >
                <option value="">Select…</option>
                <option value="18-24">18–24</option>
                <option value="25-34">25–34</option>
                <option value="35-44">35–44</option>
                <option value="45-54">45–54</option>
                <option value="55+">55+</option>
              </select>
            </label>

            <label className="block text-sm text-white/80">
              Intent
              <select
                className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-3 outline-none focus:border-white/25"
                value={intent}
                onChange={(e) => setIntent(e.target.value as any)}
              >
                <option value="">Select…</option>
                <option value="friends">Friends</option>
                <option value="dating">Dating</option>
                <option value="networking">Networking</option>
              </select>
            </label>
          </div>
        </div>

        <button
          onClick={onSave}
          disabled={saving}
          className="w-full rounded-xl bg-white text-[#050b1a] font-semibold py-3 disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Continue'}
        </button>

        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace('/login')
          }}
          className="w-full rounded-xl border border-white/15 text-white/80 py-3"
        >
          Sign out
        </button>
      </div>
    </main>
  )
}
