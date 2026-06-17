'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, Check, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { markAsRead, markAllAsRead } from '@/actions/notifications'
import type { Alert } from '@/types/database'
import { cn } from '@/lib/utils'

export function NotificationsClient({ initialData }: { initialData: Alert[] }) {
  const [notifications, setNotifications] = useState<Alert[]>(initialData)

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
    await markAsRead(id)
  }

  const handleMarkAll = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
    await markAllAsRead()
  }

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      default:
        return <Info className="h-5 w-5 text-primary" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-medium">
            {unreadCount} unread
          </Badge>
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleMarkAll} className="h-8 text-xs">
            <Check className="h-4 w-4 mr-1.5" />
            Mark all read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border rounded-xl bg-card border-border/50">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4">
            <Bell className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="font-bold text-lg mb-1">All caught up!</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            You have no notifications. When you get new alerts about your budget or AI insights, they will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {notifications.map((notif) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all',
                  notif.is_read ? 'bg-card border-border/50 opacity-70' : 'bg-primary/5 border-primary/20 shadow-sm'
                )}
              >
                <div className={cn(
                  'p-2 rounded-full mt-0.5',
                  notif.is_read ? 'bg-muted' : 'bg-background'
                )}>
                  {getIcon(notif.severity)}
                </div>
                
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={cn("text-sm font-bold", !notif.is_read && "text-foreground")}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                      {new Date(notif.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {notif.message}
                  </p>
                </div>

                {!notif.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleMarkAsRead(notif.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
