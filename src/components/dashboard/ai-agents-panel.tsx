'use client'

import Link from 'next/link'
import { motion } from 'motion/react'
import { ShieldCheck, TrendingUp, Target, MessageSquare, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AgentStatus {
  name: string
  description: string
  status: 'active' | 'idle' | 'online' | 'monitoring'
  icon: React.ElementType
  href?: string
}

const agents: AgentStatus[] = [
  {
    name: 'Budget Guardian',
    description: 'Monitors spending vs limits',
    status: 'active',
    icon: ShieldCheck,
    href: '/budgets',
  },
  {
    name: 'Forecasting',
    description: 'Predicts month-end balance',
    status: 'active',
    icon: TrendingUp,
    href: '/reports',
  },
  {
    name: 'Goal Allocation',
    description: 'Optimizes savings routing',
    status: 'idle',
    icon: Target,
    href: '/goals',
  },
  {
    name: 'Finance Assistant',
    description: 'AI chat with your data',
    status: 'online',
    icon: MessageSquare,
    href: '/assistant',
  },
  {
    name: 'Anomaly Safety',
    description: 'Detects unusual patterns',
    status: 'monitoring',
    icon: AlertTriangle,
  },
]

const STATUS_CONFIG = {
  active: { label: 'active', dotClass: 'status-dot active pulse-teal', labelClass: 'text-teal-400 bg-teal-400/10' },
  idle: { label: 'idle', dotClass: 'status-dot idle', labelClass: 'text-amber-400 bg-amber-400/10' },
  online: { label: 'online', dotClass: 'status-dot online', labelClass: 'text-emerald-400 bg-emerald-400/10' },
  monitoring: { label: 'monitoring', dotClass: 'status-dot monitoring', labelClass: 'text-violet-400 bg-violet-400/10' },
}

export function AIAgentsPanel() {
  return (
    <div className="metric-card rounded-xl p-5 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-4 h-4 rounded-sm bg-primary/20 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-primary pulse-teal" />
        </div>
        <h3 className="text-sm font-bold tracking-tight text-foreground">AI Agents</h3>
      </div>

      <div className="space-y-2 flex-1">
        {agents.map((agent, i) => {
          const cfg = STATUS_CONFIG[agent.status]
          const Icon = agent.icon
          return (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 py-1.5"
            >
              <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-sm text-foreground font-medium flex-1 min-w-0 truncate">
                {agent.name}
              </span>
              <span className={cn(
                'text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1.5',
                cfg.labelClass
              )}>
                <span className={cfg.dotClass} />
                {cfg.label}
              </span>
            </motion.div>
          )
        })}
      </div>

      {/* Open Co-pilot */}
      <Link
        href="/assistant"
        className="mt-4 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-all duration-200 active:scale-[0.98]"
      >
        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
          <MessageSquare className="h-3 w-3 text-primary" />
        </div>
        Open Co-pilot
      </Link>
    </div>
  )
}
