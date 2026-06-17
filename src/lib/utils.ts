import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Currency formatting
export function formatCurrency(amount: number | string | null | undefined, currency = 'USD'): string {
  if (amount == null) return '—'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '—'

  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return `${currency} ${num.toFixed(2)}`
  }
}

// Date formatting
export function formatRelativeDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = parseISO(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return format(date, 'MMM d, yyyy')
  } catch {
    return dateStr
  }
}

export function formatDate(dateStr: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!dateStr) return '—'
  try { return format(parseISO(dateStr), fmt) } catch { return dateStr }
}

// Month-year utilities
export function getCurrentMonthRange(): { start: string; end: string } {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { start, end }
}

export function getMonthName(month: number): string {
  return new Date(2024, month - 1, 1).toLocaleString('en-US', { month: 'long' })
}

// Financial health score helpers
export function getHealthScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 35) return 'Poor'
  return 'Critical'
}

export function getHealthScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400'
  if (score >= 65) return 'text-blue-400'
  if (score >= 50) return 'text-yellow-400'
  if (score >= 35) return 'text-orange-400'
  return 'text-red-400'
}

// Percentage helpers
export function clampPercentage(value: number, max = 100): number {
  return Math.max(0, Math.min(max, Math.round(value)))
}

// Truncate text
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - 3) + '...'
}

// Safe JSON parse
export function safeJsonParse<T>(str: string | null | undefined, fallback: T): T {
  if (!str) return fallback
  try { return JSON.parse(str) as T } catch { return fallback }
}
