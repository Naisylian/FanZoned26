'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Shield, Zap, MessageCircle, Trophy } from 'lucide-react'

const perks = [
  { icon: MessageCircle, label: 'Team & match live chat' },
  { icon: Trophy, label: 'Match predictions & leaderboard' },
  { icon: Zap, label: 'Full stats & AI insights' },
  { icon: Shield, label: 'Full tournament access — no renewals' },
]

export default function PaymentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCheckout = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' })
      const text = await res.text()

      let data: { url?: string; error?: string }
      try {
        data = JSON.parse(text)
      } catch {
        console.error('Non-JSON response from /api/stripe/checkout:', text)
        setError('Server returned an invalid response. Check console for details.')
        setLoading(false)
        return
      }

      if (!res.ok || data.error) {
        setError(data.error ?? `Request failed (${res.status})`)
        setLoading(false)
        return
      }

      if (data.url) {
        window.location.href = data.url
      } else {
        setError('No checkout URL returned from Stripe.')
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🏆</span>
          <h1 className="text-2xl font-bold mt-2">Unlock Full Access</h1>
          <p className="text-gray-500 text-sm mt-1">One-time payment for the entire tournament</p>
        </div>

        <div className="card-glass rounded-2xl p-6">
          <div className="text-center mb-6">
            <p className="text-5xl font-extrabold gradient-text">$10</p>
            <p className="text-gray-500 text-sm mt-1">one-time · no subscription</p>
          </div>

          <ul className="space-y-3 mb-6">
            {perks.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                  <Icon size={14} className="text-green-400" />
                </div>
                <span className="text-gray-300">{label}</span>
              </li>
            ))}
          </ul>

          {error && (
            <div className="bg-red-900/30 border border-red-500/40 text-red-300 text-sm rounded-xl px-4 py-3 mb-4">
              ⚠️ {error}
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-lg transition-opacity"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Redirecting to Stripe...
              </span>
            ) : 'Pay $10 & Get Access'}
          </button>

          <p className="text-center text-xs text-gray-600 mt-3">
            🔒 Secure checkout via Stripe
          </p>
        </div>
      </div>
    </div>
  )
}
