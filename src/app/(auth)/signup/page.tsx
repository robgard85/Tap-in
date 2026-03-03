'use client'

import { useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  return createBrowserClient(url, key)
}

export default function SignupPage() {
  const router = useRouter()
  const supabase = useMemo(() => supabaseBrowser(), [])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
async function onSignup(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    // Email+password: Supabase may require email confirmation depending on project settings.
    router.push('/onboarding')
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto w-full max-w-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="mt-1 text-sm text-white/70">Tap-In • deep blue • minimal</p>

        <form onSubmit={onSignup} className="mt-6 space-y-3">
          <label className="block">
            <span className="text-sm text-white/80">Email</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/20"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-white/80">Password</span>
            <input
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 outline-none focus:border-white/20"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          {error ? (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-white/10 px-4 py-2 font-medium hover:bg-white/15 disabled:opacity-60"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>

          <a
            href="/login"
            className="block w-full rounded-lg border border-white/10 bg-transparent px-4 py-2 text-center text-sm text-white/80 hover:bg-white/5"
          >
            Already have an account? Log in
          </a>
        </form>
      </div>
    </main>
  )
}
