'use client'

import { motion } from 'motion/react'
import { Bot, Zap, Brain } from 'lucide-react'

const agents = [
  { name: 'Categorization', provider: 'Groq', desc: 'Instantly tags every expense', speed: 'Fast' },
  { name: 'NL Parser', provider: 'Groq', desc: 'Understands natural language input', speed: 'Fast' },
  { name: 'Budget Monitor', provider: 'DB Trigger', desc: 'Fires alerts at budget thresholds', speed: 'Instant' },
  { name: 'Forecast', provider: 'Gemini', desc: 'Predicts your month-end balance', speed: 'Smart' },
  { name: 'Anomaly Detector', provider: 'Groq', desc: 'Flags unusual spending patterns', speed: 'Fast' },
  { name: 'Monthly Report', provider: 'Gemini', desc: 'Generates financial health reports', speed: 'Deep' },
  { name: 'Recommendations', provider: 'Gemini', desc: 'Personalizes savings opportunities', speed: 'Smart' },
  { name: 'Chat Assistant', provider: 'Gemini', desc: 'Answers any financial question', speed: 'Deep' },
]

export function LandingAI() {
  return (
    <section id="ai" className="py-24 px-6 bg-muted/30">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 text-sm text-primary font-medium mb-4">
            <Brain className="h-4 w-4" /> Dual AI engine
          </div>
          <h2 className="text-4xl font-bold mb-4">8 agents, 2 providers, 1 goal</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Groq handles speed-critical tasks. Gemini handles deep reasoning.
            Automatic failover ensures you always get an answer.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {[
            { name: 'Groq', icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', desc: 'Llama 3.3 70B — Ultra-fast inference for real-time tasks' },
            { name: 'Gemini', icon: Brain, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', desc: 'Gemini 2.0 Flash — Deep reasoning for complex analysis' },
          ].map((p) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className={`p-6 rounded-xl border ${p.border} ${p.bg}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <p.icon className={`h-6 w-6 ${p.color}`} />
                <span className="font-bold text-lg">{p.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {agents.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="p-4 rounded-lg border border-border bg-card"
            >
              <div className="flex items-center gap-1.5 mb-2">
                <Bot className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">{agent.name}</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">{agent.desc}</p>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                {agent.provider}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
