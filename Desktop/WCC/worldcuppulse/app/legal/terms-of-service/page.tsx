import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — FanZoned26',
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-8 inline-block">← Back to FanZoned26</Link>

        <h1 className="text-3xl font-extrabold mb-2">Terms of Service</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: June 6, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Agreement</h2>
            <p>By creating an account and paying for access to FanZoned26, you agree to these Terms of Service. If you do not agree, do not use the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. What FanZoned26 Is</h2>
            <p>FanZoned26 is an independent fan engagement platform for the FIFA World Cup 2026. We are not affiliated with, endorsed by, or connected to FIFA or any official World Cup organization. We provide community chat rooms, match predictions, and tournament analytics for entertainment purposes only.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Your Account</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>You must be at least 13 years old to create an account</li>
              <li>You are responsible for keeping your login credentials secure</li>
              <li>You may not create multiple accounts to bypass the payment</li>
              <li>You may not share your account with other users</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Payment Terms</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Access to FanZoned26 requires a one-time payment of $10 USD</li>
              <li>This payment grants you full access for the entire duration of the FIFA World Cup 2026 tournament</li>
              <li>Payments are processed securely by Stripe</li>
              <li>All sales are final — we do not offer refunds once access has been granted</li>
              <li>If the platform experiences significant downtime we will assess refunds on a case by case basis</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Team Selection</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>You may select a primary team during onboarding</li>
              <li>You may change your primary team or follow additional teams at any time without additional payment</li>
              <li>When a team is eliminated from the tournament their community room becomes read only but remains visible</li>
              <li>Your $10 payment covers full platform access regardless of when your chosen team is eliminated</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Chat Room Rules</h2>
            <p className="mb-2">By participating in any chat room on FanZoned26 you agree not to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Post hate speech, racism, or discriminatory content of any kind</li>
              <li>Harass, bully, or threaten other users</li>
              <li>Post spam or promotional content</li>
              <li>Share personal information of other users without consent</li>
              <li>Post content that is illegal in your jurisdiction</li>
              <li>Impersonate other users or public figures</li>
            </ul>
            <p className="mt-3">We reserve the right to remove any content and ban any user who violates these rules without refund.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Predictions</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Match predictions are for entertainment purposes only</li>
              <li>FanZoned26 is not a gambling or betting platform</li>
              <li>No real money prizes are awarded for correct predictions</li>
              <li>Leaderboard rankings are for bragging rights only</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Content You Post</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>You retain ownership of content you post in chat rooms</li>
              <li>By posting you grant FanZoned26 a license to display that content on the platform</li>
              <li>We reserve the right to remove any content that violates these terms</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Platform Availability</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>We aim to keep FanZoned26 available throughout the tournament but cannot guarantee 100% uptime</li>
              <li>We are not responsible for interruptions caused by third party services including Supabase, Stripe, or Vercel</li>
              <li>Match data is sourced from third party APIs and may occasionally be delayed or inaccurate</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Disclaimer</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Tournament analytics and AI generated insights are for entertainment purposes only</li>
              <li>FanZoned26 makes no guarantees about the accuracy of predictions or trend analysis</li>
              <li>We are not responsible for decisions made based on information displayed on the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Termination</h2>
            <p>We reserve the right to suspend or terminate any account that violates these terms. Terminated accounts for rule violations are not eligible for refunds.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Changes To These Terms</h2>
            <p>We may update these terms during the tournament. Continued use of the platform after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">13. Contact</h2>
            <p>For any questions about these terms:<br />
              Email: <a href="mailto:fanzoned26+support@gmail.com" className="text-purple-400 hover:text-purple-300">fanzoned26+support@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
