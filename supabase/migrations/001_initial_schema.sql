-- =====================================================================
-- Cresco Database Schema (Custom Auth Version)
-- supabase/migrations/001_initial_schema.sql
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- TABLES
-- =====================================================================

-- Users (Custom Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email           TEXT NOT NULL UNIQUE,
  password_hash   TEXT NOT NULL,
  full_name       TEXT,
  avatar_url      TEXT,
  currency        VARCHAR(3) NOT NULL DEFAULT 'USD',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Incomes
CREATE TABLE IF NOT EXISTS public.incomes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  source          TEXT NOT NULL,
  frequency       TEXT NOT NULL CHECK (frequency IN ('weekly','biweekly','monthly','irregular')),
  day_of_month    INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  icon            TEXT NOT NULL DEFAULT '📦',
  color           TEXT NOT NULL DEFAULT '#6b7280',
  is_default      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount          NUMERIC(15,2) NOT NULL CHECK (amount > 0),
  category_id     UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  description     TEXT,
  merchant        TEXT,
  expense_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  notes           TEXT,
  ai_categorized  BOOLEAN NOT NULL DEFAULT FALSE,
  ai_confidence   NUMERIC(4,3) CHECK (ai_confidence BETWEEN 0 AND 1),
  user_corrected  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category_id     UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  limit_amount    NUMERIC(15,2) NOT NULL CHECK (limit_amount > 0),
  spent_amount    NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (spent_amount >= 0),
  period          TEXT NOT NULL CHECK (period IN ('weekly','monthly','yearly')) DEFAULT 'monthly',
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, category_id, period_start)
);

-- Savings Goals
CREATE TABLE IF NOT EXISTS public.savings_goals (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT,
  icon            TEXT NOT NULL DEFAULT '🎯',
  target_amount   NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
  current_amount  NUMERIC(15,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  target_date     DATE,
  status          TEXT NOT NULL CHECK (status IN ('active','paused','completed')) DEFAULT 'active',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Alerts
CREATE TABLE IF NOT EXISTS public.alerts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type            TEXT NOT NULL,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  severity        TEXT NOT NULL CHECK (severity IN ('info','warning','critical')) DEFAULT 'info',
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  metadata        JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Forecasts
CREATE TABLE IF NOT EXISTS public.forecasts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  predicted_balance   NUMERIC(15,2) NOT NULL,
  avg_daily_spending  NUMERIC(15,2) NOT NULL,
  remaining_days      INTEGER NOT NULL,
  confidence          NUMERIC(4,3),
  risk_level          TEXT NOT NULL CHECK (risk_level IN ('low','medium','high','critical')),
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly Reports
CREATE TABLE IF NOT EXISTS public.monthly_reports (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  month           INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year            INTEGER NOT NULL CHECK (year >= 2020),
  total_income    NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_spent     NUMERIC(15,2) NOT NULL DEFAULT 0,
  total_saved     NUMERIC(15,2) NOT NULL DEFAULT 0,
  health_score    INTEGER NOT NULL DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  top_categories  JSONB NOT NULL DEFAULT '[]',
  spending_summary JSONB NOT NULL DEFAULT '{}',
  suggestions     JSONB NOT NULL DEFAULT '[]',
  narrative       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  category        TEXT NOT NULL CHECK (category IN ('learn','build','enjoy','grow')),
  title           TEXT NOT NULL,
  description     TEXT,
  url             TEXT,
  estimated_cost  NUMERIC(15,2),
  reason          TEXT,
  month           INTEGER NOT NULL,
  year            INTEGER NOT NULL,
  is_dismissed    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Interest Profiles
CREATE TABLE IF NOT EXISTS public.interest_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  interests       TEXT[] NOT NULL DEFAULT '{}',
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_expenses_user_date    ON public.expenses(user_id, expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category     ON public.expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period   ON public.budgets(user_id, period_start);
CREATE INDEX IF NOT EXISTS idx_alerts_user_unread    ON public.alerts(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forecasts_user        ON public.forecasts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recommendations_user  ON public.recommendations(user_id, created_at DESC);

-- =====================================================================
-- ROW LEVEL SECURITY (Removed for Custom Auth)
-- All operations will be validated at the application layer via user_id
-- =====================================================================

-- =====================================================================
-- TRIGGER: Auto-sync budget spent_amount when expense is created/updated/deleted
-- =====================================================================
CREATE OR REPLACE FUNCTION public.sync_budget_spent()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user_id UUID;
  v_cat_id  UUID;
  v_period_start DATE;
BEGIN
  -- Determine user_id and category from OLD or NEW
  v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  v_cat_id  := COALESCE(NEW.category_id, OLD.category_id);

  IF v_cat_id IS NULL THEN RETURN COALESCE(NEW, OLD); END IF;

  -- Find current month period start
  v_period_start := DATE_TRUNC('month', CURRENT_DATE)::DATE;

  -- Recalculate spent_amount for affected budgets
  UPDATE public.budgets b
  SET 
    spent_amount = COALESCE((
      SELECT SUM(e.amount)
      FROM public.expenses e
      WHERE e.user_id = b.user_id
        AND e.category_id = b.category_id
        AND e.expense_date >= b.period_start
        AND e.expense_date <= b.period_end
    ), 0),
    updated_at = NOW()
  WHERE b.user_id = v_user_id
    AND b.category_id = v_cat_id
    AND b.period_start = v_period_start;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_budget_spent ON public.expenses;
CREATE TRIGGER trg_sync_budget_spent
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.sync_budget_spent();

-- =====================================================================
-- TRIGGER: Fire alerts when budget thresholds are crossed
-- =====================================================================
CREATE OR REPLACE FUNCTION public.check_budget_thresholds()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_pct    NUMERIC;
  v_cat    RECORD;
  v_thresh INTEGER;
  v_thresholds INTEGER[] := ARRAY[50, 75, 90, 100];
BEGIN
  IF NEW.limit_amount = 0 THEN RETURN NEW; END IF;
  v_pct := ROUND((NEW.spent_amount / NEW.limit_amount) * 100);

  -- Get category name
  SELECT name, icon INTO v_cat FROM public.categories WHERE id = NEW.category_id;

  FOREACH v_thresh IN ARRAY v_thresholds LOOP
    IF v_pct >= v_thresh AND (OLD.spent_amount / NEW.limit_amount * 100) < v_thresh THEN
      INSERT INTO public.alerts (user_id, type, title, message, severity, metadata)
      VALUES (
        NEW.user_id,
        'budget_threshold',
        CASE v_thresh
          WHEN 100 THEN v_cat.icon || ' Budget exceeded: ' || v_cat.name
          ELSE v_cat.icon || ' Budget at ' || v_thresh || '%: ' || v_cat.name
        END,
        CASE v_thresh
          WHEN 100 THEN 'You have exceeded your ' || v_cat.name || ' budget of ' || NEW.limit_amount
          ELSE 'You have used ' || v_thresh || '% of your ' || v_cat.name || ' budget'
        END,
        CASE WHEN v_thresh = 100 THEN 'critical' WHEN v_thresh >= 90 THEN 'warning' ELSE 'info' END,
        jsonb_build_object('budget_id', NEW.id, 'threshold', v_thresh, 'spent', NEW.spent_amount, 'limit', NEW.limit_amount)
      )
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_check_budget_thresholds ON public.budgets;
CREATE TRIGGER trg_check_budget_thresholds
  AFTER UPDATE OF spent_amount ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION public.check_budget_thresholds();

-- =====================================================================
-- RPC FUNCTIONS (called from server actions)
-- =====================================================================

-- Dashboard summary
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_user_id UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_income       NUMERIC := 0;
  v_spent        NUMERIC := 0;
  v_period_start DATE;
  v_days_in_month INTEGER;
  v_days_elapsed  INTEGER;
BEGIN
  v_period_start  := DATE_TRUNC('month', CURRENT_DATE)::DATE;
  v_days_in_month := EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day'))::INTEGER;
  v_days_elapsed  := EXTRACT(DAY FROM CURRENT_DATE)::INTEGER;

  SELECT COALESCE(SUM(amount), 0) INTO v_income
  FROM public.incomes WHERE user_id = p_user_id AND is_active = TRUE;

  SELECT COALESCE(SUM(amount), 0) INTO v_spent
  FROM public.expenses
  WHERE user_id = p_user_id AND expense_date >= v_period_start;

  RETURN json_build_object(
    'monthly_income',    v_income,
    'total_spent',       v_spent,
    'remaining_budget',  v_income - v_spent,
    'forecast_balance',  v_income - v_spent - ((v_spent / NULLIF(v_days_elapsed, 0)) * (v_days_in_month - v_days_elapsed)),
    'days_remaining',    v_days_in_month - v_days_elapsed,
    'total_expenses',    (SELECT COUNT(*) FROM public.expenses WHERE user_id = p_user_id AND expense_date >= v_period_start)
  );
END;
$$;

-- Category spending for current month
CREATE OR REPLACE FUNCTION public.get_monthly_spending_by_category(p_user_id UUID, p_month INTEGER, p_year INTEGER)
RETURNS TABLE (
  category_id    UUID,
  category_name  TEXT,
  category_icon  TEXT,
  category_color TEXT,
  total_spent    NUMERIC,
  budget_limit   NUMERIC,
  transaction_count BIGINT
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_period_start DATE;
  v_period_end   DATE;
BEGIN
  v_period_start := MAKE_DATE(p_year, p_month, 1);
  v_period_end   := (DATE_TRUNC('month', v_period_start) + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.icon,
    c.color,
    COALESCE(SUM(e.amount), 0)::NUMERIC,
    b.limit_amount,
    COUNT(e.id)
  FROM public.categories c
  LEFT JOIN public.expenses e ON e.category_id = c.id
    AND e.user_id = p_user_id
    AND e.expense_date BETWEEN v_period_start AND v_period_end
  LEFT JOIN public.budgets b ON b.category_id = c.id
    AND b.user_id = p_user_id
    AND b.period_start = v_period_start
  WHERE c.user_id = p_user_id
  GROUP BY c.id, c.name, c.icon, c.color, b.limit_amount
  ORDER BY total_spent DESC;
END;
$$;
