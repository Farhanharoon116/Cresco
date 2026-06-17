import { z } from 'zod'

// ─── Auth ──────────────────────────────────────────────────
export const signupSchema = z.object({
  full_name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// ─── Expense ───────────────────────────────────────────────
export const expenseSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().uuid().nullable().optional(),
  description: z.string().max(500).nullable().optional(),
  merchant: z.string().max(200).nullable().optional(),
  expense_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().max(1000).nullable().optional(),
})

// ─── Budget ────────────────────────────────────────────────
export const budgetSchema = z.object({
  category_id: z.string().uuid(),
  limit_amount: z.number().positive('Limit must be positive'),
  period: z.enum(['weekly', 'monthly', 'yearly']).default('monthly'),
})

// ─── Savings Goal ──────────────────────────────────────────
export const savingsGoalSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).nullable().optional(),
  icon: z.string().default('🎯'),
  target_amount: z.number().positive(),
  current_amount: z.number().min(0).default(0),
  target_date: z.string().nullable().optional(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
})

export const addToGoalSchema = z.object({
  goal_id: z.string().uuid(),
  amount: z.number().positive(),
})

// ─── Profile ───────────────────────────────────────────────
export const profileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  currency: z.string().length(3).optional(),
  avatar_url: z.string().url().nullable().optional(),
})

// ─── Onboarding ────────────────────────────────────────────
export const onboardingSchema = z.object({
  income: z.object({
    amount: z.number().positive('Income must be positive'),
    source: z.string().min(1),
    frequency: z.enum(['weekly', 'biweekly', 'monthly', 'irregular']),
    day_of_month: z.number().min(1).max(31).nullable().optional(),
  }),
  categories: z.array(z.object({
    name: z.string().min(1),
    icon: z.string(),
    color: z.string(),
  })).min(1),
  goal: z.object({
    name: z.string().min(1),
    description: z.string().nullable().optional(),
    icon: z.string().default('🎯'),
    target_amount: z.number().positive(),
    current_amount: z.number().min(0).default(0),
    target_date: z.string().nullable().optional(),
  }).nullable().optional(),
  interests: z.array(z.string()).default([]),
  currency: z.string().length(3).default('USD'),
})

// ─── AI Chat ───────────────────────────────────────────────
export const chatMessageSchema = z.object({
  message: z.string().min(1).max(2000),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).max(20).default([]),
})

// ─── Recurring Expense ─────────────────────────────────────
export const recurringExpenseSchema = z.object({
  name: z.string().min(1).max(200),
  amount: z.number().positive('Amount must be positive'),
  category_id: z.string().uuid().nullable().optional(),
  frequency: z.enum(['weekly', 'biweekly', 'monthly']),
  next_due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

