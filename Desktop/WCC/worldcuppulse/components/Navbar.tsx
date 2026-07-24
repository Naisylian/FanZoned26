'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Trophy, Users, Calendar, BarChart2, Star, LogOut, Menu, X, Shield } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { href: '/dashboard',   label: 'Home',        icon: Trophy },
  { href: '/my-teams',    label: 'My Teams',    icon: Star },
  { href: '/predictions', label: 'Predictions', icon: Calendar },
  { href: '/leaderboard', label: 'Leaderboard', icon: BarChart2 },
  { href: '/groups',      label: 'Groups',      icon: Users },
  { href: '/stats',       label: 'Stats',       icon: BarChart2 },
]

export default function Navbar({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 card-glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/dashboard" className="flex items-center">
          <Image src="/logo.png" alt="FanZoned26" width={140} height={40} className="h-9 w-auto object-contain" priority />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-purple-600/20 text-purple-300'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}

          {/* Admin link — only visible to admin account */}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors border',
                pathname.startsWith('/admin')
                  ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
                  : 'text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10 hover:border-yellow-500/50'
              )}
            >
              <Shield size={16} />
              Admin
            </Link>
          )}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium',
                pathname === href ? 'bg-purple-600/20 text-purple-300' : 'text-gray-400'
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-yellow-400 border border-yellow-500/30"
            >
              <Shield size={16} /> Admin Panel
            </Link>
          )}

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      )}
    </nav>
  )
}
