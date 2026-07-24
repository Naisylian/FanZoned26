export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { sanitizeEnv } from '@/lib/supabase/env'
import Link from 'next/link'
import { Shield } from 'lucide-react'

function isAdmin(email: string | undefined): boolean {
  const adminEmails = sanitizeEnv(process.env.ADMIN_EMAILS)
    .split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  return adminEmails.includes((email ?? '').toLowerCase())
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (!isAdmin(user.email)) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Admin header bar */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-yellow-500/30">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-yellow-400" />
            <span className="font-bold text-yellow-400 text-sm tracking-wide">ADMIN PANEL</span>
            <span className="text-gray-600 text-sm ml-2">FanZoned26</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-500">{user.email}</span>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              ← Back to site
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
