import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/layout/sidebar'
import { getUser } from '@/actions/auth'
import { getUnreadAlertCount } from '@/actions/dashboard'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const user = await getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile && !profile.onboarding_complete) {
    redirect('/onboarding')
  }

  const alertResult = await getUnreadAlertCount()
  const alertCount = alertResult.success ? alertResult.data : 0

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNav user={profile} alertCount={alertCount} />
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      {/* Footer */}
      <footer className="border-t border-border/50 py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-muted-foreground">
          <span>© 2026 Cresco · AI Financial Co-Pilot</span>
          <div className="flex items-center gap-3">
            <span>🔒 AES-256 encrypted</span>
            <span>·</span>
            <span>Student first · consent-based</span>
            <span>·</span>
            <span className="text-primary font-bold">MVP · hackathon ready</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
