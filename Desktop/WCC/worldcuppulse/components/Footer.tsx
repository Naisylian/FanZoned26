import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-white/5 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="FanZoned26" width={90} height={26} className="h-6 w-auto object-contain opacity-60" />
          <p className="text-xs text-gray-600">© 2026 · Not affiliated with FIFA</p>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/legal/privacy-policy"  className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <span className="text-gray-700">·</span>
          <Link href="/legal/terms-of-service" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Terms of Service</Link>
          <span className="text-gray-700">·</span>
          <Link href="/legal/cookie-policy"   className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Cookie Policy</Link>
          <span className="text-gray-700">·</span>
          <a href="mailto:fanzoned26@gmail.com" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Contact</a>
        </nav>
      </div>
    </footer>
  )
}
