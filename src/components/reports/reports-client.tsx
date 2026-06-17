'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Loader2, BookOpen, Hammer, Gamepad2, TrendingUp, ExternalLink, X, Printer } from 'lucide-react'
import { toast } from 'sonner'
import { getMonthName, getHealthScoreLabel, getHealthScoreColor, formatCurrency } from '@/lib/utils'

const REC_ICONS = { learn: BookOpen, build: Hammer, enjoy: Gamepad2, grow: TrendingUp }
const REC_COLORS = {
  learn: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  build: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  enjoy: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
  grow: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
}

export function ReportsClient({ reports, recommendations, currency = 'USD' }: {
  reports: { id: string; month: number; year: number; total_income: number; total_spent: number; total_saved: number; health_score: number; suggestions: string[]; narrative?: string | null }[]
  recommendations: { id: string; category: string; title: string; description: string | null; url: string | null; estimated_cost: number | null; reason: string | null }[]
  currency?: string
}) {
  const [generating, setGenerating] = useState(false)
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  async function generateReport() {
    setGenerating(true)
    try {
      const res = await fetch('/api/ai/analyze', { method: 'POST' })
      const data = await res.json()
      if (data.success) { toast.success('Report generated! Refresh to see it.') }
      else toast.error(data.error ?? 'Generation failed')
    } catch { toast.error('Failed to generate report') }
    finally { setGenerating(false) }
  }

  const visibleRecs = recommendations.filter(r => !dismissed.has(r.id))
  const groupedRecs = visibleRecs.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = []
    acc[r.category].push(r)
    return acc
  }, {} as Record<string, typeof recommendations>)

  return (
    <Tabs defaultValue="reports">
      <TabsList className="inline-flex h-10 w-auto flex-row items-center justify-center mb-6 rounded-xl bg-muted/50 p-1">
        <TabsTrigger value="reports" className="rounded-lg px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">Reports</TabsTrigger>
        <TabsTrigger value="savings" className="rounded-lg gap-1.5 px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Savings Ideas
        </TabsTrigger>
      </TabsList>

      {/* Reports Tab */}
      <TabsContent value="reports" className="space-y-4 mt-4">
        <div className="flex justify-end gap-3 no-print">
          <Button variant="outline" onClick={() => window.print()} className="gap-2">
            <Printer className="h-4 w-4" />
            Export PDF
          </Button>
          <Button onClick={generateReport} disabled={generating} className="gap-2">
            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? 'Generating...' : 'Generate AI Report'}
          </Button>
        </div>

        {reports.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">📊</div>
            <p className="font-medium">No reports yet</p>
            <p className="text-sm">Click &quot;Generate AI Report&quot; to create your first monthly summary</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="card-hover border-border/60 bg-card/45">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base font-bold tracking-tight text-foreground">{getMonthName(report.month)} {report.year}</CardTitle>
                      <div className="flex items-center gap-2">
                        <span className={`text-2xl font-black tracking-tight ${getHealthScoreColor(report.health_score)}`}>{report.health_score}</span>
                        <div>
                          <p className="text-xs font-bold tracking-tight">{getHealthScoreLabel(report.health_score)}</p>
                          <Progress value={report.health_score} className="w-20 h-1.5 mt-1" />
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10">
                        <p className="text-xs text-muted-foreground font-semibold">Income</p>
                        <p className="font-bold text-foreground text-sm mt-0.5">{formatCurrency(report.total_income, currency)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10">
                        <p className="text-xs text-muted-foreground font-semibold">Spent</p>
                        <p className="font-bold text-red-400 text-sm mt-0.5">{formatCurrency(report.total_spent, currency)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl border border-border/40 bg-muted/10">
                        <p className="text-xs text-muted-foreground font-semibold">Saved</p>
                        <p className="font-bold text-emerald-400 text-sm mt-0.5">{formatCurrency(report.total_saved, currency)}</p>
                      </div>
                    </div>
                    {report.narrative && (
                      <p className="text-sm italic text-muted-foreground border-l-2 border-primary/30 pl-3 leading-relaxed font-medium">{report.narrative}</p>
                    )}
                    {Array.isArray(report.suggestions) && report.suggestions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-foreground">AI Suggestions</p>
                        <ul className="space-y-1.5">
                          {report.suggestions.map((s: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground font-medium flex gap-2.5 leading-relaxed">
                              <span className="text-primary font-bold">→</span> {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </TabsContent>
 
      {/* Savings Opportunities Tab */}
      <TabsContent value="savings" className="space-y-6 mt-4">
        <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-sm text-muted-foreground font-semibold leading-relaxed">
          <span className="font-bold text-foreground">Educational suggestions only.</span> These recommendations are based on your savings and interests. They are not financial advice. Always do your own research before any purchase.
        </div>
 
        {visibleRecs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">💡</div>
            <p className="font-medium">No recommendations yet</p>
            <p className="text-sm">Generate an AI analysis to get personalized savings opportunities</p>
          </div>
        ) : (
          ['learn', 'build', 'enjoy', 'grow'].map(cat => {
            const items = groupedRecs[cat]
            if (!items?.length) return null
            const Icon = REC_ICONS[cat as keyof typeof REC_ICONS]
            return (
              <div key={cat} className="space-y-3.5">
                <h3 className="text-lg font-bold tracking-tight capitalize flex items-center gap-2 text-foreground">
                  <Icon className={`h-5 w-5 ${REC_COLORS[cat as keyof typeof REC_COLORS].split(' ')[0]}`} />
                  {cat}
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((rec, i) => (
                    <motion.div key={rec.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                      <Card className="card-hover border-border/60 bg-card/45 relative">
                        <button onClick={() => setDismissed(prev => new Set([...prev, rec.id]))}
                          className="absolute top-3.5 right-3.5 text-muted-foreground hover:text-foreground active:scale-95 transition-transform duration-200">
                          <X className="h-4 w-4" />
                        </button>
                        <CardContent className="p-5 space-y-3">
                          <Badge variant="outline" className={`text-xs font-semibold tracking-tight border-current/10 ${REC_COLORS[rec.category as keyof typeof REC_COLORS]}`}>
                            {rec.category}
                          </Badge>
                          <p className="font-bold text-sm text-foreground pr-4 leading-snug">{rec.title}</p>
                          {rec.description && <p className="text-xs text-muted-foreground leading-relaxed font-medium">{rec.description}</p>}
                          {rec.reason && <p className="text-xs text-primary/80 italic font-medium leading-relaxed">&quot;{rec.reason}&quot;</p>}
                          <div className="flex items-center justify-between pt-1">
                            {rec.estimated_cost != null && (
                              <span className="text-xs text-muted-foreground font-semibold">~{formatCurrency(rec.estimated_cost, currency)}</span>
                            )}
                            {rec.url && (
                              <a href={rec.url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline font-bold flex items-center gap-1">
                                Explore <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
            )
          })
        )}
      </TabsContent>
    </Tabs>
  )
}
