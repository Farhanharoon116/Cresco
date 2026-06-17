'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { PlayCircle, Repeat, Calendar, Trash2, Plus, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createRecurringExpense, deleteRecurringExpense, applyRecurringExpense } from '@/actions/recurring-expenses'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/database'

// ─── Local Types ──────────────────────────────────────────

interface RecurringExpense {
  id: string
  name: string
  amount: number
  category_id: string | null
  frequency: string
  next_due_date: string
  is_active: boolean
  category?: { name: string; icon: string } | null
}

interface RecurringExpensesManagerProps {
  recurring: RecurringExpense[]
  categories: Category[]
}

// ─── Frequency Badge Config ───────────────────────────────

const FREQ_CONFIG: Record<string, { label: string; badge: string }> = {
  weekly:   { label: 'Weekly',   badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  biweekly: { label: 'Biweekly', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  monthly:  { label: 'Monthly',  badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
}

// ─── Component ────────────────────────────────────────────

export function RecurringExpensesManager({ recurring, categories }: RecurringExpensesManagerProps) {
  const [isPending, startTransition] = useTransition()
  const [applyingId, setApplyingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'biweekly' | 'monthly'>('monthly')
  const [nextDueDate, setNextDueDate] = useState(new Date().toISOString().split('T')[0])

  function resetForm() {
    setName('')
    setAmount('')
    setCategoryId('')
    setFrequency('monthly')
    setNextDueDate(new Date().toISOString().split('T')[0])
    setShowForm(false)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if (!name.trim()) { toast.error('Name is required'); return }
    if (isNaN(parsedAmount) || parsedAmount <= 0) { toast.error('Enter a valid amount'); return }
    if (!nextDueDate) { toast.error('Next due date is required'); return }

    startTransition(async () => {
      const result = await createRecurringExpense({
        name: name.trim(),
        amount: parsedAmount,
        category_id: categoryId || null,
        frequency,
        next_due_date: nextDueDate,
      })
      if (result.success) {
        toast.success('Recurring expense created!')
        resetForm()
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this recurring expense?')) return
    startTransition(async () => {
      const result = await deleteRecurringExpense(id)
      if (result.success) toast.success('Recurring expense deleted')
      else toast.error(result.error)
    })
  }

  function handleApply(id: string) {
    setApplyingId(id)
    startTransition(async () => {
      const result = await applyRecurringExpense(id)
      setApplyingId(null)
      if (result.success) toast.success('Expense applied! 🎉')
      else toast.error(result.error)
    })
  }

  return (
    <div className="space-y-4">
      {/* Header card with create form */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Repeat className="h-4 w-4 text-muted-foreground" />
            Recurring Expenses
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Add Recurring
          </Button>
        </CardHeader>

        {showForm && (
          <CardContent className="border-t border-border pt-4">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {/* Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="rec-name">Name *</Label>
                  <Input
                    id="rec-name"
                    placeholder="Netflix, Rent, Gym..."
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>

                {/* Amount */}
                <div className="space-y-1.5">
                  <Label htmlFor="rec-amount">Amount *</Label>
                  <Input
                    id="rec-amount"
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <Select value={categoryId} onValueChange={v => { if (v) setCategoryId(v) }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          <span className="flex items-center gap-2">{c.icon} {c.name}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Frequency */}
                <div className="space-y-1.5">
                  <Label>Frequency *</Label>
                  <Select value={frequency} onValueChange={v => setFrequency(v as 'weekly' | 'biweekly' | 'monthly')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Biweekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Next due date */}
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="rec-due">Next Due Date *</Label>
                  <Input
                    id="rec-due"
                    type="date"
                    value={nextDueDate}
                    onChange={e => setNextDueDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isPending} className="gap-1.5">
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Create
                </Button>
                <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Recurring expense cards */}
      {recurring.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">📅</div>
          <p className="font-medium">No recurring expenses</p>
          <p className="text-sm">Add recurring bills to track and apply them quickly</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recurring.map((item, i) => {
            const freqConfig = FREQ_CONFIG[item.frequency] ?? { label: item.frequency, badge: 'bg-muted text-muted-foreground border-border' }
            const isApplying = applyingId === item.id && isPending

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Card className="card-hover border-border/60 bg-card/45">
                  <CardContent className="p-5 space-y-3">
                    {/* Header row: name + delete */}
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-base leading-tight text-foreground">{item.name}</p>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 rounded-lg shrink-0 text-muted-foreground hover:text-destructive active:scale-95"
                        onClick={() => handleDelete(item.id)}
                        disabled={isPending}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Amount */}
                    <p className="text-2xl font-black tracking-tight text-foreground tabular-nums">{item.amount}</p>

                    {/* Category + frequency badges */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {item.category && (
                        <Badge variant="outline" className="text-xs font-semibold tracking-tight border-border/40 gap-1 text-muted-foreground">
                          <span>{item.category.icon}</span>
                          {item.category.name}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={cn('text-xs font-semibold tracking-tight border-current/10', freqConfig.badge)}
                      >
                        {freqConfig.label}
                      </Badge>
                    </div>

                    {/* Next due date */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>Due {item.next_due_date}</span>
                    </div>

                    {/* Apply Today button */}
                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full gap-1.5 rounded-xl border-emerald-500/25 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-300 active:scale-97 transition-all duration-200"
                        onClick={() => handleApply(item.id)}
                        disabled={isPending}
                      >
                        {isApplying
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <PlayCircle className="h-3.5 w-3.5" />
                        }
                        Apply Today
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
