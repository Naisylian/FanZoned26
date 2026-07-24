import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — FanZoned26',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-8 inline-block">← Back to FanZoned26</Link>

        <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: June 6, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Who We Are</h2>
            <p>FanZoned26 ("we", "us", "our") is a fan engagement platform for the FIFA World Cup 2026, accessible at fanzoned26-nu.vercel.app. We are operated as an independent platform and are not affiliated with FIFA or any official World Cup organization.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. What Data We Collect</h2>
            <h3 className="font-semibold text-gray-200 mb-2">Data You Provide</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400 mb-4">
              <li>Full name and email address when you register</li>
              <li>Payment information processed securely by Stripe (we never store your card details)</li>
              <li>Messages and content you post in chat rooms</li>
              <li>Team selections and match predictions you make</li>
            </ul>
            <h3 className="font-semibold text-gray-200 mb-2">Data We Collect Automatically</h3>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>IP address and approximate location</li>
              <li>Device type and browser information</li>
              <li>Pages visited and time spent on the platform</li>
              <li>Date and time of account activity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>To create and manage your account</li>
              <li>To process your one-time $10 payment via Stripe</li>
              <li>To display your predictions and chat messages</li>
              <li>To send essential account emails (receipt, password reset)</li>
              <li>To improve the platform during the tournament</li>
              <li>To detect and prevent fraud or abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. How We Store Your Data</h2>
            <p>Your data is stored securely using Supabase, a trusted cloud database provider. All data is encrypted in transit using SSL. Payment data is handled exclusively by Stripe and is never stored on our servers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Who We Share Your Data With</h2>
            <p className="mb-2">We share data only with:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li><span className="text-gray-200 font-medium">Stripe</span> — to process your $10 payment</li>
              <li><span className="text-gray-200 font-medium">Supabase</span> — to store your account and chat data</li>
              <li><span className="text-gray-200 font-medium">Vercel</span> — to host and serve the platform</li>
            </ul>
            <p className="mt-3 text-gray-400">We never sell your personal data to third parties. We never share your data with advertisers.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-2">You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and associated data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. GDPR (European Users)</h2>
            <p>If you are located in the European Union, you have additional rights under GDPR including the right to data portability and the right to lodge a complaint with your local data protection authority.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. CCPA (California Users)</h2>
            <p>If you are a California resident, you have the right to know what personal information we collect, request deletion of your data, and opt out of the sale of personal information. We do not sell personal information.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Cookies</h2>
            <p>We use essential cookies only to keep you logged in and maintain your session. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">10. Children&apos;s Privacy</h2>
            <p>FanZoned26 is not intended for users under the age of 13. We do not knowingly collect data from children under 13.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">11. Changes To This Policy</h2>
            <p>We may update this policy during the tournament. We will notify you of significant changes by email or by posting a notice on the platform.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">12. Contact Us</h2>
            <p>For any privacy related questions or requests:<br />
              Email: <a href="mailto:fanzoned26+privacy@gmail.com" className="text-purple-400 hover:text-purple-300">fanzoned26+privacy@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
