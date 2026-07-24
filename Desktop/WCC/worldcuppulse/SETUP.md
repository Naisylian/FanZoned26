# FanZoned26 — Setup Guide

## 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. In **Project Settings → API**, copy:
   - `NEXT_PUBLIC_SUPABASE_URL` → Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` → service_role key
4. In **Authentication → URL Configuration**, add:
   - Site URL: `https://your-app.vercel.app`
   - Redirect URL: `https://your-app.vercel.app/auth/callback`
5. Enable **Realtime** for the `chat_messages` table in Database → Replication

## 2. Stripe

1. Create account at [stripe.com](https://stripe.com)
2. Create a **Product** → Add a **Price** of $10 (one-time)
3. Copy the **Price ID** → `STRIPE_PRICE_ID`
4. Copy API keys from Dashboard → Developers:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
5. Set up webhook: `https://your-app.vercel.app/api/stripe/webhook`
   - Add event: `checkout.session.completed`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET` (add to .env.local)

## 3. Anthropic (optional)

1. Get API key at [console.anthropic.com](https://console.anthropic.com)
2. Set `ANTHROPIC_API_KEY`
3. Call `POST /api/insights` with `{ team_id }` to generate trend insights

## 4. Local Development

```bash
# Update .env.local with your real values
npm run dev
# Open http://localhost:3000
```

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Add all environment variables in **Vercel → Project → Settings → Environment Variables**.

## Environment Variables Summary

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PRICE_ID` | Stripe price ID for $10 payment |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI insights |
| `NEXT_PUBLIC_APP_URL` | Your app's public URL |

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/signup` | User registration |
| `/login` | Sign in |
| `/onboarding` | Pick primary team + follow teams |
| `/payment` | $10 Stripe checkout |
| `/dashboard` | Home dashboard with matches + podium |
| `/my-teams` | Manage followed teams |
| `/teams/[id]` | Team page: stats, form, chart, chat |
| `/matches/[id]` | Match page: live score, predictions, chat |
| `/predictions` | All matches with prediction widget |
| `/leaderboard` | Global prediction leaderboard |
| `/groups` | All 12 group tables + knockout bracket |
| `/stats` | Stats dashboard + most improved spotlight |
