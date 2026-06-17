// ============================================================
// Cresco Constants — All app-wide constants live here
// ============================================================

export const GROQ_MODEL = 'llama-3.3-70b-versatile'
export const GEMINI_MODEL = 'gemini-2.5-flash-lite'
export const GEMINI_SEARCH_MODEL = 'gemini-2.5-flash-lite' // With Google Search grounding

export const MAX_RETRIES = 1
export const RETRY_DELAY_MS = 500

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const DEFAULT_CURRENCY = 'USD'

export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
  { value: 'GBP', label: 'British Pound', symbol: '£' },
  { value: 'PKR', label: 'Pakistani Rupee', symbol: '₨' },
  { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
  { value: 'BDT', label: 'Bangladeshi Taka', symbol: '৳' },
  { value: 'NGN', label: 'Nigerian Naira', symbol: '₦' },
  { value: 'KES', label: 'Kenyan Shilling', symbol: 'KSh' },
  { value: 'EGP', label: 'Egyptian Pound', symbol: 'E£' },
  { value: 'AED', label: 'UAE Dirham', symbol: 'د.إ' },
  { value: 'MYR', label: 'Malaysian Ringgit', symbol: 'RM' },
  { value: 'IDR', label: 'Indonesian Rupiah', symbol: 'Rp' },
  { value: 'BRL', label: 'Brazilian Real', symbol: 'R$' },
  { value: 'TRY', label: 'Turkish Lira', symbol: '₺' },
  { value: 'CAD', label: 'Canadian Dollar', symbol: 'CA$' },
  { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
] as const

export const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#10b981' },
  { name: 'Transport', icon: '🚗', color: '#3b82f6' },
  { name: 'Shopping', icon: '🛍️', color: '#a855f7' },
  { name: 'Education', icon: '📚', color: '#f59e0b' },
  { name: 'Entertainment', icon: '🎮', color: '#ef4444' },
  { name: 'Subscriptions', icon: '📱', color: '#06b6d4' },
  { name: 'Health', icon: '💊', color: '#ec4899' },
  { name: 'Other', icon: '📦', color: '#6b7280' },
]

export const INCOME_SOURCES = [
  { value: 'allowance', label: 'Monthly Allowance' },
  { value: 'part_time', label: 'Part-time Job' },
  { value: 'scholarship', label: 'Scholarship' },
  { value: 'freelance', label: 'Freelance / Gig' },
  { value: 'stipend', label: 'Stipend' },
  { value: 'other', label: 'Other' },
]

export const SAVINGS_GOAL_ICONS = [
  '🎯', '💻', '📱', '🎮', '✈️', '📚', '🎓', '💪',
  '🎸', '📷', '🏋️', '🧳', '💡', '🚀', '🌱', '🏆',
]

export const INTERESTS = [
  { value: 'programming', label: 'Programming', icon: '💻' },
  { value: 'design', label: 'Design', icon: '🎨' },
  { value: 'gaming', label: 'Gaming', icon: '🎮' },
  { value: 'music', label: 'Music', icon: '🎵' },
  { value: 'fitness', label: 'Fitness', icon: '💪' },
  { value: 'travel', label: 'Travel', icon: '✈️' },
  { value: 'reading', label: 'Reading', icon: '📚' },
  { value: 'photography', label: 'Photography', icon: '📷' },
  { value: 'cooking', label: 'Cooking', icon: '👨‍🍳' },
  { value: 'investing', label: 'Investing', icon: '📈' },
  { value: 'entrepreneurship', label: 'Entrepreneurship', icon: '🚀' },
  { value: 'ai_ml', label: 'AI / ML', icon: '🤖' },
  { value: 'content_creation', label: 'Content Creation', icon: '🎬' },
  { value: 'sports', label: 'Sports', icon: '⚽' },
  { value: 'art', label: 'Art', icon: '🖼️' },
] as const

export const AI_SUGGESTED_PROMPTS = [
  'Can I afford a new laptop this month?',
  'Where am I overspending?',
  'How much should I save per week to hit my goals?',
  'What\'s my biggest spending category?',
  'Am I on track this month?',
  'Give me 3 tips to save more money',
  'What\'s my forecast for month-end?',
  'How does my spending compare to last month?',
]

export const BUDGET_ALERT_THRESHOLDS = [50, 75, 90, 100] as const
