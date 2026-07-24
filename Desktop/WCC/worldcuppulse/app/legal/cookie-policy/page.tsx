import Link from 'next/link'

export const metadata = {
  title: 'Cookie Policy — FanZoned26',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-purple-400 hover:text-purple-300 mb-8 inline-block">← Back to FanZoned26</Link>

        <h1 className="text-3xl font-extrabold mb-2">Cookie Policy</h1>
        <p className="text-gray-500 text-sm mb-10">Last updated: June 6, 2026</p>

        <div className="space-y-8 text-gray-300 text-sm leading-relaxed">

          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and keep you logged in.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Cookies We Use</h2>
            <p className="mb-4">FanZoned26 uses essential cookies only:</p>
            <div className="card-glass rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-xs text-gray-500">
                    <th className="text-left px-4 py-3">Cookie</th>
                    <th className="text-left px-4 py-3">Purpose</th>
                    <th className="text-left px-4 py-3">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-gray-300 font-medium">Session cookie</td>
                    <td className="px-4 py-3 text-gray-400">Keeps you logged in</td>
                    <td className="px-4 py-3 text-gray-400">Until you log out</td>
                  </tr>
                  <tr className="border-b border-white/5">
                    <td className="px-4 py-3 text-gray-300 font-medium">Auth token</td>
                    <td className="px-4 py-3 text-gray-400">Verifies your identity securely</td>
                    <td className="px-4 py-3 text-gray-400">7 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-gray-300 font-medium">Payment status</td>
                    <td className="px-4 py-3 text-gray-400">Confirms your $10 access</td>
                    <td className="px-4 py-3 text-gray-400">Tournament duration</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. Cookies We Do NOT Use</h2>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>Advertising cookies</li>
              <li>Tracking cookies</li>
              <li>Analytics cookies that identify you personally</li>
              <li>Third party marketing cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. However, disabling essential cookies will prevent you from staying logged in to FanZoned26.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Third Party Cookies</h2>
            <p>Stripe, our payment processor, may set cookies during the checkout process to prevent fraud. These are governed by Stripe&apos;s own cookie policy.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Contact</h2>
            <p>For cookie related questions:<br />
              Email: <a href="mailto:fanzoned26+privacy@gmail.com" className="text-purple-400 hover:text-purple-300">fanzoned26+privacy@gmail.com</a>
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}
