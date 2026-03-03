import { Suspense } from 'react'
import LoginClient from './LoginClient'

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] flex items-center justify-center text-white/60">Loading…</div>}>
      <LoginClient />
    </Suspense>
  )
}
