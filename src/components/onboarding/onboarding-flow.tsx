'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronRight, Loader2, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { completeOnboarding } from '@/actions/onboarding'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { DEFAULT_CATEGORIES, INCOME_SOURCES, CURRENCIES, INTERESTS, SAVINGS_GOAL_ICONS } from '@/lib/constants'

const STEPS = ['Welcome', 'Income', 'Categories', 'First Goal', 'Interests', 'Done']

export function OnboardingFlow() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)

  // Step data
  const [currency, setCurrency] = useState('USD')
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomeSource, setIncomeSource] = useState('allowance')
  const [incomeFrequency, setIncomeFrequency] = useState<'weekly' | 'biweekly' | 'monthly' | 'irregular'>('monthly')
  const [selectedCategories, setSelectedCategories] = useState(DEFAULT_CATEGORIES.map(c => ({ ...c, selected: true })))
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalIcon, setGoalIcon] = useState('🎯')
  const [skipGoal, setSkipGoal] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  function toggleCategory(name: string) {
    setSelectedCategories(prev => prev.map(c => c.name === name ? { ...c, selected: !c.selected } : c))
  }

  function toggleInterest(val: string) {
    setSelectedInterests(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val])
  }

  async function handleFinish() {
    setLoading(true)
    const categories = selectedCategories.filter(c => c.selected)
    if (categories.length === 0) { toast.error('Select at least one category'); setLoading(false); return }

    const result = await completeOnboarding({
      currency,
      income: { amount: parseFloat(incomeAmount), source: incomeSource, frequency: incomeFrequency, day_of_month: null },
      categories: categories.map(({ name, icon, color }) => ({ name, icon, color })),
      goal: (!skipGoal && goalName && goalTarget) ? { name: goalName, icon: goalIcon, target_amount: parseFloat(goalTarget), description: null, target_date: null } : null,
      interests: selectedInterests,
    })

    if (result.success) {
      toast.success('Welcome to Cresco! 🚀')
      router.push('/dashboard')
    } else {
      toast.error(result.error)
      setLoading(false)
    }
  }

  const stepContent = [
    // Step 0: Welcome
    <motion.div key="welcome" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center space-y-6">
      <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/20 mx-auto">
        <TrendingUp className="h-10 w-10 text-primary" />
      </div>
      <div>
        <h2 className="text-3xl font-bold mb-3">Welcome to Cresco</h2>
        <p className="text-muted-foreground text-lg">Let&apos;s set up your AI finance coach in 2 minutes. We&apos;ll personalize everything for you.</p>
      </div>
      <div className="space-y-2">
        <Label>Your currency</Label>
        <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
          <SelectTrigger className="w-64 mx-auto"><SelectValue /></SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(c => <SelectItem key={c.value} value={c.value}>{c.symbol} {c.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={() => setStep(1)} size="lg" className="gap-2 w-full max-w-xs">
        Get started <ChevronRight className="h-4 w-4" />
      </Button>
    </motion.div>,

    // Step 1: Income
    <motion.div key="income" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">What&apos;s your monthly income?</h2>
        <p className="text-muted-foreground text-sm">This helps us forecast your balance and set smart budgets.</p>
      </div>
      <div className="space-y-2">
        <Label>Monthly amount ({currency})</Label>
        <Input type="number" placeholder="e.g. 15000" step="0.01" min="0.01"
          value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} className="text-lg h-12" />
      </div>
      <div className="space-y-2">
        <Label>Income source</Label>
        <Select value={incomeSource} onValueChange={(val) => val && setIncomeSource(val)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {INCOME_SOURCES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label>How often do you receive it?</Label>
        <div className="flex gap-2 flex-wrap">
          {(['weekly', 'biweekly', 'monthly', 'irregular'] as const).map(f => (
            <button key={f} onClick={() => setIncomeFrequency(f)}
              className={`px-4 py-2 rounded-lg text-sm border capitalize transition-colors ${incomeFrequency === f ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
        <Button onClick={() => { if (!incomeAmount || parseFloat(incomeAmount) <= 0) { toast.error('Enter a valid income'); return } setStep(2) }} className="flex-1 gap-2">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 2: Categories
    <motion.div key="categories" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Select your spending categories</h2>
        <p className="text-muted-foreground text-sm">Choose which categories apply to you. You can add more later.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {selectedCategories.map(cat => (
          <button key={cat.name} onClick={() => toggleCategory(cat.name)}
            className={`flex items-center gap-2.5 p-3 rounded-xl border text-sm text-left transition-colors ${cat.selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'}`}>
            <span className="text-xl">{cat.icon}</span>
            <span className={`font-medium ${cat.selected ? 'text-primary' : 'text-foreground'}`}>{cat.name}</span>
            {cat.selected && <Check className="h-4 w-4 text-primary ml-auto" />}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
        <Button onClick={() => { if (!selectedCategories.some(c => c.selected)) { toast.error('Select at least one'); return } setStep(3) }} className="flex-1 gap-2">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 3: First Goal
    <motion.div key="goal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">Set your first savings goal</h2>
        <p className="text-muted-foreground text-sm">What are you saving toward? A laptop? Course? Trip? (Optional)</p>
      </div>
      {!skipGoal ? (
        <>
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {SAVINGS_GOAL_ICONS.slice(0, 12).map(i => (
                <button key={i} onClick={() => setGoalIcon(i)}
                  className={`text-xl p-2 rounded-lg transition-colors ${goalIcon === i ? 'bg-primary/20 ring-1 ring-primary' : 'hover:bg-muted'}`}>{i}</button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Goal name</Label>
            <Input placeholder="e.g. New Laptop, React Course, iPhone" value={goalName} onChange={e => setGoalName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Target amount ({currency})</Label>
            <Input type="number" step="0.01" min="0.01" placeholder="e.g. 80000"
              value={goalTarget} onChange={e => setGoalTarget(e.target.value)} />
          </div>
          <button onClick={() => setSkipGoal(true)} className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2">
            Skip for now
          </button>
        </>
      ) : (
        <div className="p-6 rounded-xl border border-border bg-muted/30 text-center text-muted-foreground">
          <p>No goal set. You can create one later from the Goals page.</p>
          <button onClick={() => setSkipGoal(false)} className="text-sm text-primary hover:underline mt-2 block mx-auto">
            Add a goal
          </button>
        </div>
      )}
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(2)}>Back</Button>
        <Button onClick={() => setStep(4)} className="flex-1 gap-2">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>,

    // Step 4: Interests
    <motion.div key="interests" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold mb-1">What are your interests?</h2>
        <p className="text-muted-foreground text-sm">The AI uses this to suggest personalized savings opportunities.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {INTERESTS.map(item => (
          <button key={item.value} onClick={() => toggleInterest(item.value)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-colors ${selectedInterests.includes(item.value) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:border-primary/40 text-muted-foreground'}`}>
            {item.icon} {item.label}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => setStep(3)}>Back</Button>
        <Button onClick={handleFinish} className="flex-1 gap-2" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Setting up...' : 'Launch Cresco 🚀'}
        </Button>
      </div>
    </motion.div>,
  ]

  return (
    <div className="min-h-screen flex items-center justify-center animated-gradient p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Step {Math.min(step + 1, STEPS.length - 1)} of {STEPS.length - 1}</span>
            <span>{STEPS[step]}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${(step / (STEPS.length - 2)) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Step content */}
        <div className="glass rounded-2xl p-8 border border-border">
          <AnimatePresence mode="wait">
            {stepContent[step]}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
