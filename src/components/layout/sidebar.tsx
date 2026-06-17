'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'motion/react'
import {
  LayoutDashboard, Receipt, PiggyBank, Target, TrendingUp,
  Sparkles, BookOpen, Sun, Moon, Bell, LogOut, ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/actions/auth'

import type { ElementType } from 'react'

interface NavItem {
  href: string
  label: string
  icon: ElementType
  badge?: string
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/budgets', label: 'Budget', icon: PiggyBank },
  { href: '/expenses', label: 'Expenses', icon: Receipt },
  { href: '/goals', label: 'Goals', icon: Target },
  { href: '/reports', label: 'Forecast', icon: TrendingUp },
  { href: '/assistant', label: 'Ask AI', icon: Sparkles },
  { href: '/discover', label: 'Discover', icon: BookOpen },
]

interface TopNavProps {
  user: { full_name: string | null; email: string; currency: string } | null
  alertCount?: number
  onAddExpense?: () => void
}

export function TopNav({ user, alertCount = 0 }: TopNavProps) {
  const pathname = usePathname()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const initials = (user?.full_name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()
  const displayName = user?.full_name ?? user?.email?.split('@')[0] ?? 'Student'

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border/60 bg-background/90 backdrop-blur-xl flex items-center px-4 md:px-6 gap-4 flex-shrink-0 print:hidden">
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 mr-2 flex-shrink-0">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary neon-glow-sm flex-shrink-0">
          <TrendingUp className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="text-base font-black tracking-tight text-foreground">Cresco</span>
      </Link>

      {/* Nav links */}
      <nav className="flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn('topnav-link whitespace-nowrap flex items-center gap-1.5', isActive && 'active')}
            >
              <item.icon className="h-3.5 w-3.5 flex-shrink-0" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="text-[8px] font-black bg-primary text-primary-foreground px-1 py-0.5 rounded-full leading-none">
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg"
          onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
        >
          {mounted ? (
            currentTheme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
          ) : (
            <span className="h-4 w-4" />
          )}
        </Button>

        {/* Alerts */}
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg relative">
            <Bell className="h-4 w-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 h-3 w-3 rounded-full bg-destructive text-[8px] font-black text-white flex items-center justify-center">
                {alertCount > 9 ? '9+' : alertCount}
              </span>
            )}
          </Button>
        </Link>

        {/* User avatar / menu */}
        <div className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-muted transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-xs font-black text-primary flex-shrink-0">
              {initials}
            </div>
            <span className="text-sm font-semibold text-foreground hidden md:block max-w-[100px] truncate">
              {displayName}
            </span>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
          </button>

          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="absolute right-0 top-10 w-52 bg-card border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-border/60">
                <p className="text-sm font-bold text-foreground truncate">{user?.full_name ?? 'Student'}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
              <Link
                href="/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground/80 hover:text-foreground hover:bg-muted transition-colors"
              >
                Settings
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  Sign out
                </button>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}
