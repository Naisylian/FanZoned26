import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { sanitizeEnv } from './env'

export async function updateSession(request: NextRequest) {
  const supabaseUrl  = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const supabaseAnon = sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  if (!supabaseUrl.startsWith('http')) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(supabaseUrl, supabaseAnon, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const isPublicPath = ['/', '/login', '/signup', '/auth/callback'].includes(url.pathname)
  const isApiPath    = url.pathname.startsWith('/api')
  const isLegalPath  = url.pathname.startsWith('/legal')

  if (!user && !isPublicPath && !isApiPath && !isLegalPath) {
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && (url.pathname === '/login' || url.pathname === '/signup')) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
