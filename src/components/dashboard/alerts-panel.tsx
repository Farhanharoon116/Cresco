'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, AlertTriangle, Info, XCircle } from 'lucide-react'
import { markAlertRead } from '@/actions/dashboard'
import { cn } from '@/lib/utils'
import type { Alert } from '@/types/database'

const SEVERITY_ICONS = {
  info: Info,
  warning: AlertTriangle,
  critical: XCircle,
}

const SEVERITY_COLORS = {
  info: 'text-blue-400 bg-blue-400/10',
  warning: 'text-yellow-400 bg-yellow-400/10',
  critical: 'text-red-400 bg-red-400/10',
}

export function AlertsPanel({ alerts }: { alerts: Alert[] }) {
  return (
    <Card className="card-hover border-border/60 bg-card/45">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-base font-bold tracking-tight flex items-center gap-2 text-foreground">
          <Bell className="h-4 w-4 text-muted-foreground" />
          Alerts
        </CardTitle>
        {alerts.length > 0 && (
          <Badge variant="destructive" className="text-xs font-semibold px-2 py-0.5 rounded-full">{alerts.length}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-6 font-medium">All clear! No alerts.</p>
        ) : (
          <div className="space-y-2.5">
            {alerts.slice(0, 5).map((alert) => {
              const Icon = SEVERITY_ICONS[alert.severity]
              return (
                <form key={alert.id} action={() => { void markAlertRead(alert.id) }}>
                  <button
                    type="submit"
                    className={cn(
                      'w-full flex items-start gap-3 p-3.5 rounded-xl text-left border transition-all duration-200 active:scale-[0.99] cursor-pointer hover:brightness-105',
                      SEVERITY_COLORS[alert.severity].split(' ')[1],
                      alert.severity === 'info' ? 'border-blue-500/10' : alert.severity === 'warning' ? 'border-yellow-500/10' : 'border-red-500/10'
                    )}
                  >
                    <Icon className={cn('h-4 w-4 mt-0.5 flex-shrink-0', SEVERITY_COLORS[alert.severity].split(' ')[0])} />
                    <div className="min-w-0">
                      <p className="text-sm font-bold leading-tight">{alert.title}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">{alert.message}</p>
                    </div>
                  </button>
                </form>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
