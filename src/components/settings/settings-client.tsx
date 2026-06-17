'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { updateProfile, updateInterests, deleteAllData, deleteAccount, exportData } from '@/actions/settings'
import { toast } from 'sonner'
import { CURRENCIES, INTERESTS } from '@/lib/constants'
import { Loader2, Download, Trash2, AlertTriangle } from 'lucide-react'

interface SettingsClientProps {
  profile: { full_name: string | null; currency: string } | null
  interests: string[]
}

export function SettingsClient({ profile, interests: initInterests }: SettingsClientProps) {
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(profile?.full_name ?? '')
  const [currency, setCurrency] = useState(profile?.currency ?? 'USD')
  const [selectedInterests, setSelectedInterests] = useState<string[]>(initInterests)

  function toggleInterest(val: string) {
    setSelectedInterests(prev => prev.includes(val) ? prev.filter(i => i !== val) : [...prev, val])
  }

  function handleProfileSave(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await updateProfile({ full_name: name, currency })
      if (result.success) toast.success('Profile updated!')
      else toast.error(result.error)
    })
  }

  function handleInterestsSave() {
    startTransition(async () => {
      const result = await updateInterests(selectedInterests)
      if (result.success) toast.success('Interests saved!')
      else toast.error(result.error)
    })
  }

  function handleExport() {
    startTransition(async () => {
      const result = await exportData()
      if (result.success) {
        const blob = new Blob([result.data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'cresco-data.json'; a.click()
        URL.revokeObjectURL(url)
        toast.success('Data exported!')
      } else toast.error(result.error)
    })
  }

  return (
    <div className="space-y-6">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and preferred currency</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={(val) => val && setCurrency(val)}>
                <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.symbol} {c.label} ({c.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Interests */}
      <Card>
        <CardHeader>
          <CardTitle>Interests</CardTitle>
          <CardDescription>Used to personalize your AI savings recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {INTERESTS.map(item => (
              <button key={item.value} type="button" onClick={() => toggleInterest(item.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${selectedInterests.includes(item.value)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border hover:border-primary/40 text-muted-foreground'}`}>
                {item.icon} {item.label}
              </button>
            ))}
          </div>
          <Button variant="outline" onClick={handleInterestsSave} disabled={isPending}>Save Interests</Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or delete your financial data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="gap-2 w-full sm:w-auto" onClick={handleExport} disabled={isPending}>
            <Download className="h-4 w-4" /> Export My Data (JSON)
          </Button>

          <Separator />

          <div className="space-y-3">
            <AlertDialog>
              <AlertDialogTrigger>
                <Button variant="outline" className="gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 w-full sm:w-auto">
                  <Trash2 className="h-4 w-4" /> Clear All Financial Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Clear All Data?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all your expenses, budgets, goals, and reports. You&apos;ll be taken back to onboarding. This cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => startTransition(() => { void deleteAllData() })}>
                    Yes, clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger>
                <Button variant="destructive" className="gap-2 w-full sm:w-auto">
                  <Trash2 className="h-4 w-4" /> Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription>This permanently deletes your account and ALL data. This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => startTransition(() => { void deleteAccount() })}>
                    Delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
