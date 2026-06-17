'use client'

import { motion } from 'motion/react'
import { HelpCircle } from 'lucide-react'

const problems = [
  { q: 'Where does my money go?', a: 'AI auto-categorizes every expense instantly.' },
  { q: 'Am I overspending?', a: 'Real-time budget alerts at 50%, 75%, 90%, 100%.' },
  { q: 'What\'s left at month end?', a: 'Forecast engine predicts your exact balance daily.' },
  { q: 'How do I save more?', a: 'AI coach gives personalized weekly tips.' },
  { q: 'What can savings unlock?', a: 'Personalized opportunities based on your interests.' },
]

export function LandingProblem() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-4">
            <HelpCircle className="h-4 w-4" /> The student money problem
          </div>
          <h2 className="text-4xl font-bold mb-4">Every student asks these questions</h2>
          <p className="text-muted-foreground text-lg">Cresco answers them automatically, before you even ask.</p>
        </motion.div>
        <div className="space-y-4">
          {problems.map((p, i) => (
            <motion.div
              key={p.q}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-6 p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex-1">
                <p className="font-medium text-muted-foreground">❓ {p.q}</p>
              </div>
              <div className="w-px h-10 bg-border" />
              <div className="flex-1">
                <p className="font-medium text-primary">✅ {p.a}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
