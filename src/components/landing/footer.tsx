import Link from 'next/link'
import { Sparkles, ExternalLink, Heart } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'AI Assistant', href: '/assistant' },
    { label: 'Reports', href: '/reports' },
  ],
  Learn: [
    { label: 'Blog', href: '#' },
    { label: 'Documentation', href: '#' },
    { label: 'Privacy Policy', href: '#' },
  ],
  Connect: [
    { label: 'GitHub', href: '#', icon: ExternalLink },
    { label: 'Twitter / X', href: '#', icon: ExternalLink },
  ],

}

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg">Cresco</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered personal finance for students. Track smarter, save more, grow faster.
            </p>
            <p className="text-xs text-muted-foreground">
              Built with{' '}
              <Heart className="h-3 w-3 inline text-red-400" />
              {' '}for students worldwide.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section} className="space-y-3">
              <h4 className="font-semibold text-sm">{section}</h4>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      {'icon' in link && link.icon && <link.icon className="h-3.5 w-3.5" />}
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Cresco. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All systems operational
            </span>
            <span>Powered by <span className="text-primary font-medium">AI</span></span>
          </div>
        </div>
      </div>
    </footer>
  )
}
