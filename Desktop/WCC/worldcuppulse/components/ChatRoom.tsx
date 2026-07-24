'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ChatMessage, Profile } from '@/lib/types'
import { Send, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  teamId?: string
  matchId?: string
  isLocked?: boolean
  isEliminated?: boolean
  currentUser: Profile | null
}

export default function ChatRoom({ teamId, matchId, isLocked, isEliminated, currentUser }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const readOnly = isLocked || isEliminated || !currentUser?.has_paid

  useEffect(() => {
    const fetchMessages = async () => {
      let query = supabase
        .from('chat_messages')
        .select('*, profiles(username, avatar_url)')
        .order('created_at', { ascending: true })
        .limit(100)

      if (teamId) query = query.eq('team_id', teamId)
      if (matchId) query = query.eq('match_id', matchId)

      const { data } = await query
      setMessages(data ?? [])
      setLoading(false)
    }

    fetchMessages()

    // Realtime subscription
    const channel = supabase
      .channel(`chat:${teamId ?? matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: teamId ? `team_id=eq.${teamId}` : `match_id=eq.${matchId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('chat_messages')
            .select('*, profiles(username, avatar_url)')
            .eq('id', payload.new.id)
            .single()
          if (data) setMessages(prev => [...prev, data])
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [teamId, matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || !currentUser || readOnly) return
    const content = input.trim()
    setInput('')

    await supabase.from('chat_messages').insert({
      user_id: currentUser.id,
      team_id: teamId ?? null,
      match_id: matchId ?? null,
      content,
    })
  }

  if (loading) return (
    <div className="card-glass rounded-xl p-4 h-96 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="card-glass rounded-xl flex flex-col h-96">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-sm font-medium">
          {isEliminated ? '💬 Chat (Read-only — team eliminated)' : isLocked ? '🔒 Match chat locked' : '💬 Live Chat'}
        </span>
        {readOnly && <Lock size={14} className="text-gray-500" />}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
        {messages.length === 0 && (
          <p className="text-center text-gray-600 text-sm mt-8">No messages yet. Be first!</p>
        )}
        {messages.map((msg) => {
          const isOwn = msg.user_id === currentUser?.id
          return (
            <div key={msg.id} className={cn('flex gap-2', isOwn && 'flex-row-reverse')}>
              <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-xs font-bold shrink-0">
                {(msg.profiles?.username?.[0] ?? '?').toUpperCase()}
              </div>
              <div className={cn('max-w-[75%]', isOwn && 'items-end flex flex-col')}>
                <p className={cn('text-xs text-gray-500 mb-0.5', isOwn && 'text-right')}>
                  {msg.profiles?.username ?? 'Anonymous'}
                </p>
                <div className={cn(
                  'px-3 py-1.5 rounded-2xl text-sm',
                  isOwn ? 'bg-purple-600 text-white' : 'bg-white/10 text-gray-200'
                )}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-2 border-t border-white/10">
        {readOnly ? (
          <p className="text-center text-gray-600 text-xs py-2">
            {!currentUser?.has_paid ? 'Pay to join the chat →' : isEliminated ? 'Chat is read-only' : 'Chat is locked'}
          </p>
        ) : (
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 rounded-full px-4 py-2 text-sm outline-none border border-white/10 focus:border-purple-500 transition-colors"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-500 transition-colors disabled:opacity-40"
            >
              <Send size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
