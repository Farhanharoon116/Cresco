'use client'

import { motion } from 'motion/react'
import { Receipt, PiggyBank, TrendingUp, AlertTriangle, MessageSquare, Lightbulb, BarChart3, Target } from 'lucide-react'

const features = [
  {
    icon: Receipt,
    title: 'Smart Expense Entry',
    description: 'Add expenses by typing naturally: "Spent 450 on KFC". AI extracts amount, merchant, and category.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: PiggyBank,
    title: 'Budget Monitoring',
    description: 'Set category budgets. Get real-time alerts at 50%, 75%, 90%, and 100% — before overspending.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: TrendingUp,
    title: 'Month-End Forecast',
    description: 'Know your exact predicted balance before the month ends. Adjust spending before it\'s too late.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: AlertTriangle,
    title: 'Anomaly Detection',
    description: 'Catch unusual spending spikes, duplicate charges, and unexpected subscription increases automatically.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: MessageSquare,
    title: 'AI Chat Assistant',
    description: 'Ask anything: "Can I afford a new laptop?" and get answers using your actual financial data.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: Lightbulb,
    title: 'Savings Opportunities',
    description: '"What can your savings unlock?" AI suggests courses, tools, and experiences matched to your interests.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: BarChart3,
    title: 'Monthly AI Reports',
    description: 'Auto-generated monthly reports with health score, top categories, and personalized improvement tips.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Target,
    title: 'Savings Goals',
    description: 'Create goals (MacBook, course, game) and track progress with automatic completion celebrations.',
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-sm text-primary font-bold mb-4 bg-primary/10 px-3 py-1 rounded-full">
            <Lightbulb className="h-4 w-4" /> Everything you need
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-4">Not just an expense tracker</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium">
            8 AI agents working 24/7 to analyze your finances, detect problems, and unlock opportunities.
          </p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group p-6 rounded-2xl border-2 border-border/60 bg-card/50 hover:border-primary/50 hover:bg-card transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-5 shadow-inner`}>
                <f.icon className={`h-6 w-6 ${f.color}`} />
              </div>
              <h3 className="font-bold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
