'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportAllExpensesAsCsv } from '@/actions/expenses'
import { toast } from 'sonner'

export function ExportCsvButton() {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const result = await exportAllExpensesAsCsv()
      if (!result.success) {
        toast.error(result.error || 'Failed to export CSV')
        return
      }
      if (!result.data?.csv) {
        toast.error('Failed to export CSV: No data returned')
        return
      }

      // Create blob and trigger download
      const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `cresco_expenses_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.parentNode?.removeChild(link)
      toast.success('CSV exported successfully!')
    } catch (err: unknown) {
      toast.error('Export failed: ' + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="gap-2 h-9 px-3 rounded-xl font-medium border-primary/20 hover:bg-primary/5"
      onClick={handleExport}
      disabled={loading}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      Export CSV
    </Button>
  )
}
