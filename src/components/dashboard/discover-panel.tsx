'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Search, BookOpen, Code2, Wrench, Users, Loader2, Sparkles,
  ExternalLink, RefreshCw, Globe, Star, Gamepad2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { DiscoverItem } from '@/app/api/ai/discover/route'
import { cn } from '@/lib/utils'

type Filter = 'all' | 'courses' | 'books' | 'tools' | 'communities' | 'games'

const FILTER_TABS: { value: Filter; label: string; icon: React.ElementType }[] = [
  { value: 'all', label: 'All', icon: Sparkles },
  { value: 'courses', label: 'Courses', icon: Code2 },
  { value: 'books', label: 'Books', icon: BookOpen },
  { value: 'tools', label: 'Tools', icon: Wrench },
  { value: 'communities', label: 'Communities', icon: Users },
  { value: 'games', label: 'Games', icon: Gamepad2 },
]

const TYPE_ICONS: Record<string, React.ElementType> = {
  course: Code2,
  book: BookOpen,
  tool: Wrench,
  community: Users,
  game: Gamepad2,
}

const TYPE_COLORS: Record<string, string> = {
  course: 'text-primary bg-primary/10 border-primary/20',
  book: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  tool: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  community: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
  game: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
}

export function DiscoverPanel() {
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<DiscoverItem[]>([])
  const [summary, setSummary] = useState('')
  const [sources, setSources] = useState<Array<{ uri: string; title: string }>>([])
  const [budgetContext, setBudgetContext] = useState<{ amount: number; currency: string } | null>(null)
  const [hasLoaded, setHasLoaded] = useState(false)

  async function fetchDiscoveries(f: Filter = filter, forceRefresh = false) {
    if (!forceRefresh) {
      const cached = localStorage.getItem(`discover_cache_${f}`)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          // Use cache if it's less than 24 hours old
          if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
            setItems(parsed.items)
            setSummary(parsed.summary)
            setSources(parsed.sources)
            setBudgetContext(parsed.budgetContext)
            setHasLoaded(true)
            return
          }
        } catch {
          // ignore parsing error
        }
      }
    }

    setLoading(true)
    try {
      const res = await fetch('/api/ai/discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: f }),
      })
      const data = await res.json()
      if (data.success) {
        setItems(data.data.items)
        setSummary(data.data.search_summary)
        setSources(data.data.sources ?? [])
        setBudgetContext(data.data.budget_context ?? null)
        setHasLoaded(true)
        
        // Cache the result
        localStorage.setItem(`discover_cache_${f}`, JSON.stringify({
          timestamp: Date.now(),
          items: data.data.items,
          summary: data.data.search_summary,
          sources: data.data.sources ?? [],
          budgetContext: data.data.budget_context ?? null
        }))
        
        toast.success('Discovery complete!')
      } else {
        toast.error(data.error ?? 'Discovery failed')
      }
    } catch {
      toast.error('Could not connect to Discover AI')
    } finally {
      setLoading(false)
    }
  }

  function handleFilterChange(f: Filter) {
    setFilter(f)
    if (hasLoaded) fetchDiscoveries(f)
  }

  const displayedItems = filter === 'all' ? items :
    filter === 'communities' ? items.filter((i) => i.type === 'community') :
    items.filter((i) => {
      if (filter === 'courses') return i.type === 'course'
      if (filter === 'books') return i.type === 'book'
      if (filter === 'tools') return i.type === 'tool'
      return true
    })

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="guardian-banner rounded-xl px-6 py-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/20 border border-primary/30">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight">Discover</h2>
            
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed mt-1">
          Real-time AI-powered discovery of courses, books, tools, and communities — tailored to your interests and budget.
        </p>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.value}
                onClick={() => handleFilterChange(tab.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                  filter === tab.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        <Button
          onClick={() => fetchDiscoveries(filter, true)}
          disabled={loading}
          className="gap-2 font-bold rounded-xl text-sm"
        >
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Searching web...</>
          ) : hasLoaded ? (
            <><RefreshCw className="h-4 w-4" /> Refresh</>
          ) : (
            <><Search className="h-4 w-4" /> Find Resources</>
          )}
        </Button>
      </div>

      {/* Summary and Budget Context */}
      {(summary || budgetContext) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-xl border border-primary/20 bg-primary/5">
          <p className="text-xs text-muted-foreground font-medium flex-1">
            🔍 {summary}
            {sources.length > 0 && ` · ${sources.length} sources verified`}
          </p>
          {budgetContext && (
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider">
              <span>Budget Aware:</span>
              <span className="text-foreground">Under {budgetContext.amount} {budgetContext.currency}</span>
            </div>
          )}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="metric-card rounded-xl p-5 space-y-3">
              <div className="skeleton h-4 w-3/4 rounded" />
              <div className="skeleton h-3 w-full rounded" />
              <div className="skeleton h-3 w-5/6 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !hasLoaded && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="text-base font-bold text-foreground">Your personalized feed awaits</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Click &quot;Find Resources&quot; to search the web for courses, books, and tools matched to your interests.
            </p>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      {!loading && hasLoaded && displayedItems.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No {filter} found. Try a different filter or refresh.
        </div>
      )}

      {!loading && displayedItems.length > 0 && (
        <motion.div
          layout
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence>
            {displayedItems.map((item, i) => {
              const Icon = TYPE_ICONS[item.type] ?? BookOpen
              const colorClass = TYPE_COLORS[item.type] ?? TYPE_COLORS.course
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.04 }}
                  className="metric-card rounded-xl p-5 flex flex-col gap-3 card-hover group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className={cn(
                      'flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border',
                      colorClass
                    )}>
                      <Icon className="h-3 w-3" />
                      {item.type}
                    </div>
                    {item.free ? (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-lg border border-emerald-400/20">
                        FREE
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-muted-foreground">{item.price}</span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-primary font-semibold mt-1">{item.platform}</p>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-3">
                      {item.description}
                    </p>
                  </div>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    {item.rating && (
                      <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
                        <Star className="h-3 w-3" />
                        {item.rating}
                      </span>
                    )}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-auto flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div className="border-t border-border/50 pt-4">
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
            Search Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {sources.map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary transition-colors underline underline-offset-2"
              >
                {src.title || src.uri}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
