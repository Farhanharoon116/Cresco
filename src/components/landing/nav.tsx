'use client'

import Link from 'next/link'
import { TrendingUp, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export function LandingNav() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary neon-glow">
            <TrendingUp className="h-4.5 w-4.5 text-primary-foreground" />
          </div>
          <span className="text-xl font-black tracking-tight text-foreground">Cresco</span>
          <span className="text-[10px] font-bold bg-primary/15 text-primary px-1.5 py-0.5 rounded-full border border-primary/20">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#ai" className="hover:text-foreground transition-colors">AI</a>
          <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm"><Link href="/login">Sign in</Link></Button>
          <Button size="sm"><Link href="/signup">Get started free</Link></Button>
        </div>
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background px-6 py-4 flex flex-col gap-4">
          <a href="#features" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>Features</a>
          <a href="#ai" className="text-sm text-muted-foreground" onClick={() => setOpen(false)}>AI</a>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" size="sm" className="flex-1"><Link href="/login">Sign in</Link></Button>
            <Button size="sm" className="flex-1"><Link href="/signup">Get started</Link></Button>
          </div>
        </div>
      )}
    </nav>
  )
}
