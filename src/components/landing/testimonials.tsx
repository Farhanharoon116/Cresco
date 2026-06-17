'use client'

import { motion } from 'motion/react'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Aisha Rahman',
    role: 'CS Student, NUST',
    avatar: 'AR',
    text: 'Cresco told me I was spending 60% of my allowance on food before I even realized it. The AI insights are actually useful, not generic.',
    rating: 5,
  },
  {
    name: 'Bilal Tariq',
    role: 'Engineering Student, LUMS',
    avatar: 'BT',
    text: 'The forecast feature is incredible. I can see exactly how much I\'ll have left at month end. Saved me from going broke twice already.',
    rating: 5,
  },
  {
    name: 'Sara Hassan',
    role: 'Business Student, IBA',
    avatar: 'SH',
    text: 'I love the "What your savings can unlock" feature. It suggested a React course that perfectly matched my interests and budget.',
    rating: 5,
  },
  {
    name: 'Omar Malik',
    role: 'Medical Student',
    avatar: 'OM',
    text: 'The natural language expense entry is a game-changer. I just type "chai 60 rupees" and it\'s done. Takes 2 seconds.',
    rating: 5,
  },
]

export function LandingTestimonials() {
  return (
    <section id="testimonials" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Students love Cresco</h2>
          <p className="text-muted-foreground text-lg">Real stories from real students managing real money.</p>
        </motion.div>
        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground mb-6 leading-relaxed">&quot;{t.text}&quot;</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
