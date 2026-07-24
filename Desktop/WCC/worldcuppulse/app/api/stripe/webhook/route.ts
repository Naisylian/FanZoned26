import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { sanitizeEnv } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY?.replace(/[^\x20-\x7E]/g, '').trim() ?? ''
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.replace(/[^\x20-\x7E]/g, '').trim() ?? ''

  if (!stripeKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }

  // Create Stripe inside handler — not at module level — so build doesn't fail
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature') ?? ''

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid' && session.metadata?.user_id) {
      const supabase = createClient(
        sanitizeEnv(process.env.NEXT_PUBLIC_SUPABASE_URL),
        sanitizeEnv(process.env.SUPABASE_SERVICE_ROLE_KEY)
      )
      await supabase
        .from('profiles')
        .update({ has_paid: true, onboarding_complete: true })
        .eq('id', session.metadata.user_id)
    }
  }

  return NextResponse.json({ received: true })
}
