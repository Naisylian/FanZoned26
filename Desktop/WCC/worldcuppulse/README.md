# FanZoned26 ⚽

**FanZoned26** is World Cup fan engagement web platform built for the FIFA World Cup 2026. It gives football fans across the world a space to come together, pick their team, chat live during matches, make predictions, and track tournament stats — all in one place.

Built solo in under a week and launched before the tournament kicked off on June 11, 2026.

---

## What It Does

- **Team Selection** — Pick your primary team from all 48 official World Cup 2026 teams across 12 groups (A–L). Follow additional teams without extra cost.
- **Live Match Chat** — Every match has its own chat room that opens at kickoff and locks 30 minutes after the final whistle.
- **Team Community Rooms** — Permanent chat rooms for every team where fans can talk before, during, and after matches.
- **Match Predictions** — Vote on match winners before kickoff. See how the community voted in real time.
- **Leaderboard** — Track who's called the most correct results across the tournament.
- **Stats Dashboard** — Performance trends and insights for all 48 teams, updating after every match.
- **Knockout Bracket** — Progressive bracket that fills in as teams advance through the tournament.
- **AI Insights** — One-sentence trend analysis per team powered by the Anthropic Claude API.
- **Admin Panel** — Secure admin dashboard for updating match results, scores, and team statuses throughout the tournament.
- **$10 One-Time Paywall** — Full tournament access for a single payment via Stripe. No subscription, no renewals.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Realtime Chat | Supabase Realtime |
| Auth | Supabase Auth |
| Payments | Stripe |
| AI Insights | Anthropic Claude API |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase account
- A Stripe account
- An Anthropic API key

### Installation

```bash
git clone https://github.com/Naisylian/FanZoned26.git
cd FanZoned26
npm install
```

### Environment Variables

Create a `.env.local` file in the root of the project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PRICE_ID=your_stripe_price_id
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
ADMIN_EMAILS=your_admin_email@gmail.com
```

### Database Setup

Run the schema in your Supabase SQL Editor:

```bash
# Copy contents of supabase/schema.sql and run in Supabase SQL Editor
```

### Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Tournament Structure

- **48 teams** across **12 groups** (A through L)
- Group Stage → Round of 32 → Round of 16 → Quarter Finals → Semi Finals → Final
- Teams marked as eliminated automatically as the tournament progresses
- Eliminated team chat rooms become read-only but stay visible

---

## Deployment

Deploy to Vercel with one command:

```bash
vercel --prod
```

Make sure to add all environment variables in your Vercel project settings before deploying.

---

## Built By

Kate Naisylian

---

## License

This project is for personal and educational use. Not affiliated with or endorsed by FIFA.
