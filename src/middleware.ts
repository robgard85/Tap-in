import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Start with a pass-through response we can attach cookies to
  const response = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data } = await supabase.auth.getUser()
  const user = data.user

  const path = request.nextUrl.pathname

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup")
  const isProtected = path.startsWith("/feed") || path.startsWith("/onboarding")

  // If not logged in and trying to access protected routes -> /login
  if (!user && isProtected) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("next", path)
    return NextResponse.redirect(url)
  }

  // If logged in and trying to access auth pages -> /feed
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = "/feed"
    url.searchParams.delete("next")
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    // Protect only these routes (and subroutes)
    "/feed/:path*",
    "/onboarding/:path*",
    "/login",
    "/signup",
  ],
}
