'use client'

import { useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Sparkles, Loader2, Check, Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createExpense } from '@/actions/expenses'
import { toast } from 'sonner'
import type { Category } from '@/types/database'

interface ExpenseFormProps {
  categories: Category[]
  onSuccess?: () => void
}

export function AddExpenseDialog({ categories, onSuccess }: ExpenseFormProps) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [nlText, setNlText] = useState('')
  const [nlResult, setNlResult] = useState<{
    amount: number | null
    description: string | null
    merchant: string | null
    category_name: string | null
  } | null>(null)
  const [nlLoading, setNlLoading] = useState(false)
  const [ocrLoading, setOcrLoading] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Manual form state
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [merchant, setMerchant] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  // Find the selected category object for display
  const selectedCategory = categories.find((c) => c.id === categoryId)

  async function parseNL() {
    if (!nlText.trim()) return
    setNlLoading(true)
    try {
      const res = await fetch('/api/ai/categorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'nl', text: nlText }),
      })
      const data = await res.json()
      if (data.success) {
        setNlResult(data.data)
        if (data.data.amount) setAmount(String(data.data.amount))
        if (data.data.description) setDescription(data.data.description)
        if (data.data.merchant) setMerchant(data.data.merchant)
        if (data.data.category_name) {
          const match = categories.find(
            (c) => c.name.toLowerCase() === data.data.category_name?.toLowerCase()
          )
          if (match) setCategoryId(match.id)
        }
        toast.success('AI parsed your expense!')
      } else {
        toast.error('Could not parse. Try typing more details.')
      }
    } catch {
      toast.error('AI parsing failed. Use manual entry.')
    } finally {
      setNlLoading(false)
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    
    setOcrLoading(true)
    try {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const base64String = reader.result as string
        const res = await fetch('/api/ai/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String }),
        })
        const data = await res.json()
        if (data.success && data.data) {
          const parsed = data.data
          setNlResult(parsed)
          if (parsed.amount) setAmount(String(parsed.amount))
          if (parsed.description) setDescription(parsed.description)
          if (parsed.merchant) setMerchant(parsed.merchant)
          if (parsed.date) setDate(parsed.date)
          toast.success('Receipt scanned successfully!')
        } else {
          toast.error(data.error || 'Failed to read receipt.')
        }
        setOcrLoading(false)
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
      reader.readAsDataURL(file)
    } catch (_err) {
      toast.error('Failed to process image.')
      setOcrLoading(false)
    }
  }

  async function handleManualSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const parsed = parseFloat(amount)
    if (isNaN(parsed) || parsed <= 0) {
      toast.error('Please enter a valid amount')
      return
    }
    startTransition(async () => {
      const result = await createExpense({
        amount: parsed,
        category_id: categoryId || null,
        description: description || null,
        merchant: merchant || null,
        expense_date: date,
      })
      if (result.success) {
        toast.success('Expense added!')
        setOpen(false)
        resetForm()
        onSuccess?.()
      } else {
        toast.error(result.error)
      }
    })
  }

  function resetForm() {
    setAmount('')
    setCategoryId('')
    setDescription('')
    setMerchant('')
    setDate(new Date().toISOString().split('T')[0])
    setNlText('')
    setNlResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm() }}>
      {/* FIX: removed asChild to fix Base UI compilation error */}
      <DialogTrigger>
        <Button id="add-expense-btn" size="sm" className="gap-1.5 h-9 px-4 font-bold rounded-xl">
          <Plus className="h-4 w-4" />
          Add expense
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Expense</DialogTitle>
          <DialogDescription>
            Log a new transaction manually or let AI parse it instantly.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="manual" className="mt-2">
          <TabsList className="grid w-full grid-cols-2 h-9">
            <TabsTrigger value="manual" className="text-xs font-bold">Manual Entry</TabsTrigger>
            <TabsTrigger value="ai" className="text-xs font-bold gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              AI & Scan
            </TabsTrigger>
          </TabsList>

          {/* AI Tab */}
          <TabsContent value="ai" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Describe your expense
              </Label>
              <Textarea
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder={'e.g. "Spent 450 on KFC today"\n"Uber to uni 120 rupees"\n"Netflix subscription 1100"'}
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={parseNL}
                disabled={nlLoading || !nlText.trim() || ocrLoading}
                className="w-full gap-2 font-bold"
              >
                {nlLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> ...</>
                  : <><Sparkles className="h-4 w-4" /> Parse Text</>
                }
              </Button>
              
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={ocrLoading || nlLoading}
                className="w-full gap-2 font-bold border border-border"
              >
                {ocrLoading
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Scanning...</>
                  : <><Camera className="h-4 w-4" /> Scan Receipt</>
                }
              </Button>
            </div>

            <AnimatePresence>
              {nlResult && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-1.5 text-sm"
                >
                  <p className="font-bold text-primary flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> AI Parsed:
                  </p>
                  {nlResult.amount && <p>💰 Amount: <strong>{nlResult.amount}</strong></p>}
                  {nlResult.merchant && <p>🏪 Merchant: <strong>{nlResult.merchant}</strong></p>}
                  {nlResult.category_name && <p>📂 Category: <strong>{nlResult.category_name}</strong></p>}
                  <p className="text-muted-foreground text-xs pt-1">
                    Form pre-filled. Switch to Manual tab to review and save.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          {/* Manual Tab */}
          <TabsContent value="manual" className="mt-4">
            <form onSubmit={handleManualSubmit} className="space-y-4">
              {/* Amount + Date row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="exp-amount" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Amount *
                  </Label>
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="exp-date" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Date *
                  </Label>
                  <Input
                    id="exp-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Category — FIX: proper display using selectedCategory */}
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Category
                </Label>
                <Select
                  value={categoryId}
                  onValueChange={(v) => { if (v) setCategoryId(v) }}
                >
                  <SelectTrigger id="exp-category" className="w-full">
                    {/* FIX: render icon+name explicitly from selected category object */}
                    {selectedCategory ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span>{selectedCategory.icon}</span>
                        <span className="truncate">{selectedCategory.name}</span>
                      </span>
                    ) : (
                      <SelectValue placeholder="Select category..." />
                    )}
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        <span className="flex items-center gap-2">
                          <span className="text-base leading-none">{c.icon}</span>
                          <span>{c.name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Merchant */}
              <div className="space-y-1.5">
                <Label htmlFor="exp-merchant" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Merchant
                </Label>
                <Input
                  id="exp-merchant"
                  placeholder="KFC, Uber, Netflix..."
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="exp-description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Input
                  id="exp-description"
                  placeholder="Optional note..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => { setOpen(false); resetForm() }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending} className="flex-1 font-bold gap-2">
                  {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Expense
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
