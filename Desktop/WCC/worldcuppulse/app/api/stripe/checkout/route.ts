import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

// Strip invisible/non-ASCII characters (BOM, zero-width spaces) from env vars
const sanitize = (s: string | undefined): string =>
  (s ?? '').replace(/[^\x20-\x7E]/g, '').trim()

export async function POST() {
  try {
    const stripeKey  = sanitize(process.env.STRIPE_SECRET_KEY)
    const priceId    = sanitize(process.env.STRIPE_PRICE_ID)
    const baseUrl    = sanitize(process.env.NEXT_PUBLIC_APP_URL) || 'https://fanzoned26-nu.vercel.app'

    if (!stripeKey) {
      return NextResponse.json({ error: 'STRIPE_SECRET_KEY is not configured' }, { status: 500 })
    }
    if (!priceId) {
      return NextResponse.json({ error: 'STRIPE_PRICE_ID is not configured' }, { status: 500 })
    }

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `https://fanzoned26-nu.vercel.app/api/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `https://fanzoned26-nu.vercel.app/payment`,
      metadata: { user_id: user.id },
    })

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe did not return a checkout URL' }, { status: 500 })
    }

    return NextResponse.json({ url: session.url, sessionId: session.id })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Stripe error'
    console.error('[Stripe checkout error]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
