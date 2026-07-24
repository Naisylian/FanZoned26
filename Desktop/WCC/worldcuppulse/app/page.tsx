import Link from 'next/link'
import Image from 'next/image'
import { Trophy, MessageCircle, BarChart2, Target, Zap, Globe } from 'lucide-react'

const features = [
  { icon: MessageCircle, title: 'Team Chat Rooms', desc: 'Live community chat for every team. Match chats open at kickoff.' },
  { icon: Target, title: 'Match Predictions', desc: 'Predict match winners and climb the global leaderboard.' },
  { icon: BarChart2, title: 'Performance Stats', desc: 'Trend charts, form guides, and group tables for all 48 teams.' },
  { icon: Trophy, title: 'Knockout Bracket', desc: 'Progressive bracket that fills in as the tournament advances.' },
  { icon: Zap, title: 'AI Insights', desc: 'One-sentence trend insights per team powered by AI.' },
  { icon: Globe, title: '48 Teams, 12 Groups', desc: 'Full coverage from Group A all the way to Group L.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-transparent to-blue-900/20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 pt-16 pb-24 text-center relative">
          <div className="inline-flex items-center gap-2 bg-purple-900/30 border border-purple-500/30 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
            <span>⚡</span> FIFA World Cup 2026 — 48 teams, 3 countries
          </div>
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="FanZoned26"
              width={400}
              height={120}
              className="h-24 md:h-32 w-auto object-contain"
              priority
            />
          </div>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            The ultimate fan platform for World Cup 2026. Follow your teams, chat live, make predictions, and track every stat — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-semibold text-lg transition-colors">
              Get Started — $10 one-time
            </Link>
            <Link href="/login" className="card-glass px-8 py-3 rounded-xl font-semibold text-lg hover:border-purple-500/40 transition-colors">
              Sign In
            </Link>
          </div>
          <p className="text-sm text-gray-600 mt-4">One-time payment · Full tournament access · No subscription</p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need for the World Cup</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card-glass rounded-xl p-5 hover:border-purple-500/30 transition-all">
              <div className="w-10 h-10 bg-purple-900/40 rounded-lg flex items-center justify-center mb-3">
                <Icon size={20} className="text-purple-400" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <div className="card-glass rounded-2xl p-10">
          <h2 className="text-3xl font-bold mb-3">Ready for the World Cup?</h2>
          <p className="text-gray-400 mb-6">Join thousands of fans tracking all 48 teams across 12 groups.</p>
          <Link href="/signup" className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white px-10 py-3 rounded-xl font-semibold text-lg transition-opacity">
            Join FanZoned26
          </Link>
        </div>
      </section>
    </div>
  )
}
