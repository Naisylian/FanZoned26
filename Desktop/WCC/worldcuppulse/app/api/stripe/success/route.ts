import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

export const dynamic = 'force-dynamic'

const sanitize = (s: string | undefined): string =>
  (s ?? '').replace(/[^\x20-\x7E]/g, '').trim()

export async function GET(request: Request) {
  const baseUrl = 'https://fanzoned26-nu.vercel.app'

  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) return NextResponse.redirect(`${baseUrl}/payment`)

    const stripeKey = sanitize(process.env.STRIPE_SECRET_KEY)
    if (!stripeKey) return NextResponse.redirect(`${baseUrl}/dashboard`)

    const stripe = new Stripe(stripeKey, { apiVersion: '2026-05-27.dahlia' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid' && session.metadata?.user_id) {
      const supabase = await createClient()
      await supabase
        .from('profiles')
        .update({ has_paid: true, onboarding_complete: true })
        .eq('id', session.metadata.user_id)
    }
  } catch (err) {
    console.error('[Stripe success error]', err)
  }

  return NextResponse.redirect(`${baseUrl}/dashboard`)
}
