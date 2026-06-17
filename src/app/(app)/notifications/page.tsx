import { getNotifications } from '@/actions/notifications'
import { NotificationsClient } from '@/components/notifications/notifications-client'

export const metadata = {
  title: 'Notifications — Cresco',
  description: 'Manage your alerts and notifications',
}

export default async function NotificationsPage() {
  const { data: notifications = [] } = await getNotifications()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground text-sm mt-1">Review alerts, budget warnings, and AI recommendations.</p>
      </div>
      <NotificationsClient initialData={notifications || []} />
    </div>
  )
}
