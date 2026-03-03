'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createBrowserClient(url, key)
}

export default function LoginPage() {
  const router = useRouter()
  const sp = useSearchParams()
  const next = sp.get('next') || '/feed'

  const supabase = useMemo(() => supabaseBrowser(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.replace(next)
      router.refresh()
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight">Log in</h1>
          <p className="mt-1 text-sm text-white/70">Welcome back. Enter your credentials.</p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1">
              <label className="text-sm text-white/80">Email</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-0 placeholder:text-white/40 focus:border-white/20"
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-white/80">Password</label>
              <input
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 outline-none ring-0 placeholder:text-white/40 focus:border-white/20"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                type="password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            ) : null}

            <button
              disabled={loading}
              className="w-full rounded-xl bg-white/90 px-4 py-3 text-sm font-semibold text-[#050b1a] disabled:opacity-60"
            >
              {loading ? 'Logging in…' : 'Log in'}
            </button>

            <div className="flex items-center justify-between pt-1 text-sm">
              <a className="text-white/70 underline-offset-4 hover:underline" href="/signup">
                Create account
              </a>
              <a className="text-white/70 underline-offset-4 hover:underline" href="/">
                Back
              </a>
            </div>
          </form>
        </div>

        <p className="mt-4 text-xs text-white/50">
          Tip: If login works but pages don’t redirect, your <code>middleware.ts</code> will handle auth gating next.
        </p>
      </div>
    </main>
  )
}
