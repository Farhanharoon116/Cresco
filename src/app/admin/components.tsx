'use client'

import { useState } from 'react'
import { Download, Megaphone, Trash2, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { broadcastAlert, deleteUser } from '@/actions/admin'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'motion/react'

export function ExportCsvButton({ users }: { users: { id: string; email: string; full_name?: string | null; currency: string; onboarding_complete: boolean; created_at: string }[] }) {
  const handleExport = () => {
    if (users.length === 0) {
      toast.error('No users to export')
      return
    }
    const headers = ['ID', 'Email', 'Full Name', 'Currency', 'Onboarding Complete', 'Joined At']
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        u.id,
        u.email,
        `"${u.full_name || ''}"`,
        u.currency,
        u.onboarding_complete,
        u.created_at
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `cresco_users_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} className="gap-2 text-xs">
      <Download className="h-3.5 w-3.5" />
      Export CSV
    </Button>
  )
}

export function BroadcastButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleBroadcast = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const result = await broadcastAlert(new FormData(e.currentTarget))
    if (result && !result.success) {
      toast.error(result.error)
    } else if (result && result.success) {
      toast.success(`Successfully broadcasted alert to ${result.count} users!`)
      setOpen(false)
    }
    setLoading(false)
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
        <Megaphone className="h-4 w-4" />
        Broadcast Alert
      </Button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-border/60">
                <h3 className="font-bold flex items-center gap-2">
                  <Megaphone className="h-4 w-4 text-primary" />
                  Global Broadcast
                </h3>
                <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={handleBroadcast} className="p-4 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Alert Title</label>
                  <input name="title" required className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm" placeholder="e.g. Scheduled Maintenance" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message Details</label>
                  <textarea name="message" required className="w-full p-3 rounded-lg border border-border bg-background text-sm min-h-[100px]" placeholder="Type your announcement here..." />
                </div>
                <div className="pt-2">
                  <Button type="submit" className="w-full gap-2" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send to All Users'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

export function DeleteUserButton({ userId, userName }: { userId: string, userName: string }) {
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`Are you absolutely sure you want to delete the user: ${userName}? This action cannot be undone.`)) return
    setLoading(true)
    const result = await deleteUser(userId)
    if (result && !result.success) {
      toast.error(result.error)
    } else {
      toast.success('User deleted successfully')
    }
    setLoading(false)
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-xs font-medium text-destructive hover:underline inline-flex items-center gap-1 disabled:opacity-50">
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
      Delete
    </button>
  )
}
