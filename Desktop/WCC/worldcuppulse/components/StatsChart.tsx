'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts'
import type { TeamStats } from '@/lib/types'

export default function StatsChart({ stats }: { stats: TeamStats }) {
  const data = stats.performance_trend ?? []

  if (data.length === 0) {
    return (
      <div className="card-glass rounded-xl p-6 text-center text-gray-500 text-sm">
        No performance data yet
      </div>
    )
  }

  return (
    <div className="card-glass rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance Trend</h3>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="round" tick={{ fill: '#6b7280', fontSize: 11 }} />
          <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
            labelStyle={{ color: '#e5e7eb' }}
            itemStyle={{ color: '#a855f7' }}
          />
          <Area type="monotone" dataKey="points" stroke="#a855f7" strokeWidth={2} fill="url(#colorPoints)" />
        </AreaChart>
      </ResponsiveContainer>
      {stats.trend_insight && (
        <p className="text-xs text-purple-300 mt-3 italic">💡 {stats.trend_insight}</p>
      )}
    </div>
  )
}
