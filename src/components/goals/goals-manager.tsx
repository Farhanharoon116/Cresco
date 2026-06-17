'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { Plus, Loader2, Trash2, PlusCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { createGoal, deleteGoal, addToGoal } from '@/actions/goals'
import { toast } from 'sonner'
import { SAVINGS_GOAL_ICONS } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils'
import type { SavingsGoal } from '@/types/database'

export function GoalsManager({ goals, currency = 'USD' }: { goals: SavingsGoal[]; currency?: string }) {
  const [isPending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)
  const [icon, setIcon] = useState('🎯')
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [addAmounts, setAddAmounts] = useState<Record<string, string>>({})

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !target) return
    startTransition(async () => {
      const result = await createGoal({ name, icon, target_amount: parseFloat(target) })
      if (result.success) { toast.success('Goal created! 🎯'); setOpen(false); setName(''); setTarget(''); setIcon('🎯') }
      else toast.error(result.error)
    })
  }

  function handleAdd(goalId: string) {
    const amt = parseFloat(addAmounts[goalId] ?? '')
    if (isNaN(amt) || amt <= 0) { toast.error('Enter a valid amount'); return }
    startTransition(async () => {
      const result = await addToGoal({ goal_id: goalId, amount: amt })
      if (result.success) { toast.success(`Added ${amt}! Keep going! 🚀`); setAddAmounts(prev => ({ ...prev, [goalId]: '' })) }
      else toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this goal?')) return
    startTransition(async () => {
      const result = await deleteGoal(id)
      if (result.success) toast.success('Goal deleted')
      else toast.error(result.error)
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="h-4 w-4" /> New Goal
          </DialogTrigger>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Create Savings Goal</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Choose an icon</Label>
                <div className="flex flex-wrap gap-2">
                  {SAVINGS_GOAL_ICONS.map(i => (
                    <button key={i} type="button" onClick={() => setIcon(i)}
                      className={`text-xl p-2 rounded-lg transition-colors ${icon === i ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}>
                      {i}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Goal name *</Label>
                <Input placeholder="e.g. New Laptop, React Course" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>Target amount *</Label>
                <Input type="number" step="0.01" min="1" placeholder="50000" value={target} onChange={e => setTarget(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Goal'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <div className="text-4xl mb-3">🎯</div>
          <p className="font-medium">No savings goals yet</p>
          <p className="text-sm">Create your first goal and start saving!</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, i) => {
            const pct = goal.percentage ?? (goal.target_amount > 0 ? Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100) : 0)
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className="card-hover border-border/60 bg-card/45">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{goal.icon}</span>
                        <div>
                          <p className="font-bold tracking-tight text-foreground">{goal.name}</p>
                          {goal.status === 'completed' && <Badge variant="outline" className="text-xs mt-0.5 tracking-tight font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Completed! 🎉</Badge>}
                          {goal.days_remaining !== null && goal.days_remaining !== undefined && goal.status === 'active' && (
                            <p className="text-xs text-muted-foreground font-medium">{goal.days_remaining} days left</p>
                          )}
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive active:scale-95" onClick={() => handleDelete(goal.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground font-medium">Progress</span>
                        <span className="font-bold text-primary">{pct}%</span>
                      </div>
                      <div className="h-2.5 bg-muted/40 dark:bg-muted/15 rounded-full overflow-hidden border border-border/10">
                        <motion.div
                          className="h-full rounded-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, delay: i * 0.08 + 0.3 }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground font-medium">
                        <span>{formatCurrency(goal.current_amount, currency)} saved</span>
                        <span>{formatCurrency(goal.target_amount, currency)} target</span>
                      </div>
                    </div>

                    {goal.status === 'active' && (
                      <div className="flex gap-2">
                        <Input
                          type="number" placeholder="Add amount" min="0.01" step="0.01" className="h-8 text-sm bg-background/50"
                          value={addAmounts[goal.id] ?? ''}
                          onChange={e => setAddAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
                        />
                        <Button size="sm" variant="outline" className="gap-1 h-8 rounded-lg flex-shrink-0 active:scale-95"
                          onClick={() => handleAdd(goal.id)} disabled={isPending}>
                          <PlusCircle className="h-3.5 w-3.5" /> Add
                        </Button>
                      </div>
                    )}
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
