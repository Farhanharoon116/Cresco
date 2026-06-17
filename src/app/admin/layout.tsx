import { ReactNode } from 'react'
import { Shield, LayoutDashboard, Users, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'
import { adminLogout } from '@/actions/admin'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/60 bg-muted/20 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border/60 gap-2">
          <div className="bg-primary/20 p-1.5 rounded-lg border border-primary/30">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <span className="font-black tracking-tight text-lg">Admin Portal</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Users className="h-4 w-4" />
            Users
          </Link>
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground font-medium transition-colors">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-border/60">
          <form action={adminLogout}>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-400/10">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 border-b border-border/60 flex items-center justify-between px-6 bg-background/90 backdrop-blur">
          <h2 className="font-semibold text-lg">System Overview</h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-muted-foreground">Systems Operational</span>
          </div>
        </header>
        <div className="p-6 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
