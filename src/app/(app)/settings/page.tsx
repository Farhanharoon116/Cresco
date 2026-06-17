import { createClient } from '@/lib/supabase/server'
import { SettingsClient } from '@/components/settings/settings-client'
import { getUser } from '@/actions/auth'

export default async function SettingsPage() {
  const supabase = await createClient()
  const user = await getUser()

  const [profileRes, interestsRes] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('interest_profiles').select('interests').eq('user_id', user!.id).single(),
  ])

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm">Manage your profile, preferences, and account data.</p>
      </div>
      <SettingsClient profile={profileRes.data} interests={interestsRes.data?.interests ?? []} />
    </div>
  )
}
