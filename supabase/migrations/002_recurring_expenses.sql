-- =====================================================================
-- Migration 002: Add Recurring Expenses Table
-- supabase/migrations/002_recurring_expenses.sql
-- =====================================================================

-- Recurring Expenses
CREATE TABLE IF NOT EXISTS public.recurring_expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly')) DEFAULT 'monthly',
  next_due_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient user queries
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_user
  ON public.recurring_expenses(user_id, next_due_date ASC);
