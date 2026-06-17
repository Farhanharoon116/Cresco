'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bot, ChevronRight, X, Sparkles } from 'lucide-react'

interface BudgetGuardianProps {
  insight?: string | null
}

const DEFAULT_INSIGHTS = [
  "Your food spending is 12% above average. Consider reducing snack expenses.",
  "You're on track this month! 68% of budget used with 15 days remaining.",
  "Transport costs are trending higher than usual — consider carpooling or transit.",
  "Great job! Your savings rate is above average for a student.",
]

export function BudgetGuardianBanner({ insight }: BudgetGuardianProps) {
  const [dismissed, setDismissed] = useState(false)

  const message = insight ?? DEFAULT_INSIGHTS[Math.floor(Math.random() * DEFAULT_INSIGHTS.length)]

  if (dismissed) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="guardian-banner rounded-xl px-4 py-3.5 flex items-center gap-4"
      >
        {/* Robot icon */}
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/15 border border-primary/25 flex-shrink-0">
          <Bot className="h-5 w-5 text-primary" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-primary flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Budget Guardian Insight
          </p>
          <p className="text-sm text-foreground/80 mt-0.5 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => {}}
            className="text-xs font-bold text-primary hover:text-primary/80 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
          >
            View details <ChevronRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
