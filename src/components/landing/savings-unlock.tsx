'use client'

import { motion } from 'motion/react'
import { BookOpen, Hammer, Gamepad2, TrendingUp, ArrowRight, Sparkles } from 'lucide-react'

const CATEGORIES = [
  {
    icon: BookOpen,
    label: 'Learn',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20',
    items: ['React & Next.js Course', 'UI/UX Design Bootcamp', 'Machine Learning Basics'],
    emoji: '📚',
  },
  {
    icon: Hammer,
    label: 'Build',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20',
    items: ['Your portfolio domain', 'Home lab setup', 'Recording mic & desk'],
    emoji: '🔨',
  },
  {
    icon: Gamepad2,
    label: 'Enjoy',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20',
    items: ['Gaming peripherals', 'Concert tickets', 'Weekend getaway'],
    emoji: '🎮',
  },
  {
    icon: TrendingUp,
    label: 'Grow',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20',
    items: ['Student savings account', 'Index fund starter', 'Emergency fund'],
    emoji: '📈',
  },
]

export function LandingSavingsUnlock() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            What savings can unlock for you
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your savings, <span className="text-primary">intelligently directed</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg">
            Cresco&apos;s AI doesn&apos;t just track money — it studies your interests and suggests exactly what to do with what you save.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`rounded-2xl border p-5 space-y-4 ${cat.bg} transition-shadow hover:shadow-lg hover:shadow-primary/5 cursor-default`}
              >
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-semibold ${cat.color}`}>
                    <Icon className="h-5 w-5" />
                    {cat.label}
                  </div>
                  <span className="text-2xl">{cat.emoji}</span>
                </div>
                <ul className="space-y-2.5">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ArrowRight className={`h-3.5 w-3.5 flex-shrink-0 ${cat.color}`} />
                      {item}
                    </li>
                  ))}
                </ul>
                <p className="text-xs text-muted-foreground italic">
                  AI-matched to your savings &amp; interests
                </p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center mt-10 text-xs text-muted-foreground"
        >
          Educational suggestions only. Not financial advice.
        </motion.div>
      </div>
    </section>
  )
}
