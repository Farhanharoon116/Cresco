'use client'

import { useState, useTransition, useOptimistic } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Pencil, Trash2, Check, X, Loader2, Edit3, ChevronLeft, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { deleteExpense, updateExpense, correctExpenseCategory } from '@/actions/expenses'
import { formatRelativeDate, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Expense, Category } from '@/types/database'

interface ExpenseTableProps {
  expenses: Expense[]
  categories: Category[]
  currency?: string
  currentPage?: number
  totalPages?: number
}

export function ExpenseTable({ expenses, categories, currency = 'USD', currentPage = 1, totalPages = 1 }: ExpenseTableProps) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCat, setEditCat] = useState('')
  const [isPending, startTransition] = useTransition()

  // Optimistic UI for deletion
  const [optimisticExpenses, addOptimisticExpense] = useOptimistic(
    expenses,
    (state, deletedId: string) => state.filter(e => e.id !== deletedId)
  )

  // Full edit dialog state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editMerchant, setEditMerchant] = useState('')
  const [editDate, setEditDate] = useState('')
  const [editCategoryId, setEditCategoryId] = useState('')

  function openEditDialog(expense: Expense) {
    setEditingExpense(expense)
    setEditAmount(String(expense.amount))
    setEditDescription(expense.description ?? '')
    setEditMerchant(expense.merchant ?? '')
    setEditDate(expense.expense_date)
    setEditCategoryId(expense.category_id ?? '')
    setEditDialogOpen(true)
  }

  function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingExpense) return
    const parsed = parseFloat(editAmount)
    if (isNaN(parsed) || parsed <= 0) { toast.error('Please enter a valid amount'); return }
    startTransition(async () => {
      const result = await updateExpense(editingExpense.id, {
        amount: parsed,
        description: editDescription || null,
        merchant: editMerchant || null,
        expense_date: editDate,
        category_id: editCategoryId || null,
      })
      if (result.success) {
        toast.success('Expense updated!')
        setEditDialogOpen(false)
        setEditingExpense(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  function startCategoryEdit(expense: Expense) {
    setEditingId(expense.id)
    setEditCat(expense.category_id ?? '')
  }

  function saveCategory(expenseId: string) {
    startTransition(async () => {
      const result = await correctExpenseCategory(expenseId, editCat)
      if (result.success) {
        toast.success('Category updated')
        setEditingId(null)
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    startTransition(async () => {
      addOptimisticExpense(id)
      const result = await deleteExpense(id)
      if (result.success) toast.success('Expense deleted')
      else toast.error(result.error)
    })
  }

  if (expenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground gap-3">
        <div className="text-4xl">💸</div>
        <p className="font-medium">No expenses this month</p>
        <p className="text-sm">Add your first expense using the button above</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Merchant / Description</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {optimisticExpenses.map((expense, i) => (
                  <motion.tr
                    key={expense.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {formatRelativeDate(expense.expense_date)}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{expense.merchant ?? expense.description ?? '—'}</p>
                        {expense.merchant && expense.description && (
                          <p className="text-xs text-muted-foreground">{expense.description}</p>
                        )}
                        {expense.user_corrected && (
                          <Badge variant="outline" className="text-[10px] mt-0.5 text-primary border-primary/30">corrected</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === expense.id ? (
                        <div className="flex items-center gap-2">
                          <Select value={editCat} onValueChange={(v) => v && setEditCat(v)}>
                            <SelectTrigger className="h-8 w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map(c => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.icon} {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-400" onClick={() => saveCategory(expense.id)} disabled={isPending}>
                            {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground" onClick={() => setEditingId(null)}>
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <span>{expense.category?.icon ?? '📦'}</span>
                          <span className="text-muted-foreground">{expense.category?.name ?? 'Uncategorized'}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      {formatCurrency(expense.amount, currency)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick category edit */}
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => startCategoryEdit(expense)} title="Change category">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        {/* Full edit dialog */}
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-primary/70 hover:text-primary" onClick={() => openEditDialog(expense)} title="Edit expense">
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(expense.id)} disabled={isPending}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${currentPage - 1}`)}
              disabled={currentPage <= 1 || isPending}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`?page=${currentPage + 1}`)}
              disabled={currentPage >= totalPages || isPending}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Full Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input id="edit-amount" type="number" step="0.01" min="0.01" placeholder="0.00"
                  value={editAmount} onChange={e => setEditAmount(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <Input id="edit-date" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={editCategoryId} onValueChange={(v) => v && setEditCategoryId(v)}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex items-center gap-2">{c.icon} {c.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-merchant">Merchant</Label>
              <Input id="edit-merchant" placeholder="KFC, Uber, Netflix..." value={editMerchant} onChange={e => setEditMerchant(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" placeholder="Optional note..." value={editDescription} onChange={e => setEditDescription(e.target.value)} />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
