import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow'
import { getUser } from '@/actions/auth'

export const metadata = {
  title: 'Set up Cresco — Your AI Finance Coach',
  description: 'Configure your income, categories, and first savings goal',
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const user = await getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', user.id)
    .single()

  // Already onboarded — go to dashboard
  if (profile?.onboarding_complete) redirect('/dashboard')

  return <OnboardingFlow />
}
