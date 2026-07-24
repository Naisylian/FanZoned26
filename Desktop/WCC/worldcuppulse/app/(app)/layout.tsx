export const dynamic = 'force-dynamic'

import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/isAdmin'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const admin = isAdmin(user.email)

  // Admins bypass all onboarding/payment gates
  if (admin) {
    return (
      <div className="min-h-screen">
        <Navbar isAdmin />
        <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
      </div>
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_complete && !profile.has_paid) {
    // allow /onboarding and /payment through without redirect
  }

  return (
    <div className="min-h-screen">
      <Navbar isAdmin={false} />
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
