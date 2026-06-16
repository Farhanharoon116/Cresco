-- ============================================================
-- CRESCO — Full Database Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- USERS (extends Supabase auth.users)
-- ============================================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    currency TEXT DEFAULT 'USD' CHECK (currency IN (
        'USD','EUR','GBP','PKR','INR','AED','SAR','CAD','AUD','JPY','CNY','BRL','MXN','SGD'
    )),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INCOMES
-- ============================================================
CREATE TABLE public.incomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    source TEXT DEFAULT 'allowance',
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    day_of_month INTEGER DEFAULT 1 CHECK (day_of_month BETWEEN 1 AND 31),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📦',
    color TEXT DEFAULT '#10b981',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    description TEXT,
    merchant TEXT,
    ai_category_suggestion TEXT,
    ai_confidence NUMERIC(5,2),
    user_corrected BOOLEAN DEFAULT FALSE,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- BUDGETS
-- ============================================================
CREATE TABLE public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    limit_amount NUMERIC(12, 2) NOT NULL CHECK (limit_amount > 0),
    spent_amount NUMERIC(12, 2) DEFAULT 0 CHECK (spent_amount >= 0),
    period TEXT DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, category_id, period_start)
);

-- ============================================================
-- SAVINGS GOALS
-- ============================================================
CREATE TABLE public.savings_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🎯',
    target_amount NUMERIC(12, 2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(12, 2) DEFAULT 0 CHECK (current_amount >= 0),
    target_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ALERTS
-- ============================================================
CREATE TABLE public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'budget_warning', 'budget_exceeded', 'anomaly',
        'forecast', 'goal_milestone', 'general'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- FORECASTS
-- ============================================================
CREATE TABLE public.forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    predicted_balance NUMERIC(12, 2),
    avg_daily_spending NUMERIC(12, 2),
    remaining_days INTEGER,
    confidence NUMERIC(5, 2),
    risk_level TEXT DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    forecast_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- MONTHLY REPORTS
-- ============================================================
CREATE TABLE public.monthly_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    total_income NUMERIC(12, 2) DEFAULT 0,
    total_spent NUMERIC(12, 2) DEFAULT 0,
    total_saved NUMERIC(12, 2) DEFAULT 0,
    health_score INTEGER DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
    top_categories JSONB DEFAULT '[]',
    spending_summary JSONB DEFAULT '{}',
    suggestions JSONB DEFAULT '[]',
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, month, year)
);

-- ============================================================
-- RECURRING EXPENSES
-- ============================================================
CREATE TABLE public.recurring_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    frequency TEXT DEFAULT 'monthly' CHECK (frequency IN ('weekly', 'biweekly', 'monthly', 'yearly')),
    next_due_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INTEREST PROFILES
-- ============================================================
CREATE TABLE public.interest_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    interests TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RECOMMENDATIONS
-- ============================================================
CREATE TABLE public.recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('learn', 'build', 'enjoy', 'grow')),
    title TEXT NOT NULL,
    description TEXT,
    url TEXT,
    estimated_cost NUMERIC(12, 2),
    reason TEXT,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forecasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interest_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can delete own profile" ON public.users FOR DELETE USING (auth.uid() = id);

-- Generic helper macro for all other tables
CREATE POLICY "Users manage own incomes" ON public.incomes FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own categories" ON public.categories FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own expenses" ON public.expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own budgets" ON public.budgets FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own goals" ON public.savings_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own alerts" ON public.alerts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own forecasts" ON public.forecasts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own reports" ON public.monthly_reports FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recurring" ON public.recurring_expenses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own interests" ON public.interest_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own recommendations" ON public.recommendations FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_expenses_user_date ON public.expenses(user_id, expense_date DESC);
CREATE INDEX idx_expenses_user_month ON public.expenses(user_id, date_trunc('month', expense_date::timestamptz));
CREATE INDEX idx_expenses_category ON public.expenses(category_id);
CREATE INDEX idx_budgets_user_period ON public.budgets(user_id, period_start);
CREATE INDEX idx_alerts_user_unread ON public.alerts(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_forecasts_user_date ON public.forecasts(user_id, forecast_date DESC);
CREATE INDEX idx_recommendations_user ON public.recommendations(user_id, is_dismissed);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- 1. Auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Auto-update budget spent_amount when expense is added/updated/deleted
CREATE OR REPLACE FUNCTION public.sync_budget_spent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
    v_category_id UUID;
    v_expense_date DATE;
BEGIN
    -- For DELETE use OLD row, otherwise use NEW
    IF TG_OP = 'DELETE' THEN
        v_user_id := OLD.user_id;
        v_category_id := OLD.category_id;
        v_expense_date := OLD.expense_date;
    ELSE
        v_user_id := NEW.user_id;
        v_category_id := NEW.category_id;
        v_expense_date := NEW.expense_date;
    END IF;

    -- Skip if no category
    IF v_category_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;

    -- Recalculate budget spent for the period this expense falls in
    UPDATE public.budgets b
    SET
        spent_amount = (
            SELECT COALESCE(SUM(e.amount), 0)
            FROM public.expenses e
            WHERE e.category_id = v_category_id
              AND e.user_id = v_user_id
              AND e.expense_date >= b.period_start
              AND e.expense_date <= b.period_end
        ),
        updated_at = NOW()
    WHERE b.category_id = v_category_id
      AND b.user_id = v_user_id
      AND b.period_start <= v_expense_date
      AND b.period_end >= v_expense_date;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE OR REPLACE TRIGGER trigger_sync_budget_spent
    AFTER INSERT OR UPDATE OR DELETE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION public.sync_budget_spent();

-- 3. Auto-create budget alerts at thresholds (50%, 75%, 90%, 100%)
CREATE OR REPLACE FUNCTION public.check_budget_thresholds()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_pct NUMERIC;
    v_cat_name TEXT;
    v_severity TEXT;
    v_type TEXT;
    v_title TEXT;
    v_message TEXT;
    v_threshold_crossed INTEGER;
BEGIN
    IF NEW.limit_amount = 0 THEN RETURN NEW; END IF;

    v_pct := ROUND((NEW.spent_amount / NEW.limit_amount) * 100, 1);

    -- Determine which threshold was just crossed
    IF v_pct >= 100 AND (OLD.spent_amount / OLD.limit_amount * 100) < 100 THEN
        v_threshold_crossed := 100;
        v_severity := 'critical';
        v_type := 'budget_exceeded';
    ELSIF v_pct >= 90 AND (OLD.spent_amount / OLD.limit_amount * 100) < 90 THEN
        v_threshold_crossed := 90;
        v_severity := 'critical';
        v_type := 'budget_warning';
    ELSIF v_pct >= 75 AND (OLD.spent_amount / OLD.limit_amount * 100) < 75 THEN
        v_threshold_crossed := 75;
        v_severity := 'warning';
        v_type := 'budget_warning';
    ELSIF v_pct >= 50 AND (OLD.spent_amount / OLD.limit_amount * 100) < 50 THEN
        v_threshold_crossed := 50;
        v_severity := 'info';
        v_type := 'budget_warning';
    ELSE
        RETURN NEW;
    END IF;

    SELECT name INTO v_cat_name FROM public.categories WHERE id = NEW.category_id;

    IF v_threshold_crossed = 100 THEN
        v_title := v_cat_name || ' budget exceeded!';
        v_message := 'You have exceeded your ' || v_cat_name || ' budget by spending ' || NEW.spent_amount || ' of your ' || NEW.limit_amount || ' limit.';
    ELSE
        v_title := v_cat_name || ' budget ' || v_threshold_crossed || '% used';
        v_message := 'You have used ' || v_pct || '% of your ' || v_cat_name || ' budget (' || NEW.spent_amount || ' of ' || NEW.limit_amount || ').';
    END IF;

    INSERT INTO public.alerts (user_id, type, title, message, severity, metadata)
    VALUES (
        NEW.user_id,
        v_type,
        v_title,
        v_message,
        v_severity,
        jsonb_build_object(
            'budget_id', NEW.id,
            'category_id', NEW.category_id,
            'category_name', v_cat_name,
            'percentage', v_pct,
            'spent', NEW.spent_amount,
            'limit', NEW.limit_amount,
            'threshold', v_threshold_crossed
        )
    );

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trigger_budget_alerts
    AFTER UPDATE OF spent_amount ON public.budgets
    FOR EACH ROW
    WHEN (NEW.spent_amount IS DISTINCT FROM OLD.spent_amount)
    EXECUTE FUNCTION public.check_budget_thresholds();

-- 4. Update updated_at timestamps automatically
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER set_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_budgets_updated_at BEFORE UPDATE ON public.budgets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER set_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Useful aggregate function: monthly spending by category
CREATE OR REPLACE FUNCTION public.get_monthly_spending_by_category(
    p_user_id UUID,
    p_month INTEGER,
    p_year INTEGER
)
RETURNS TABLE(
    category_id UUID,
    category_name TEXT,
    category_icon TEXT,
    category_color TEXT,
    total_spent NUMERIC,
    expense_count INTEGER
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
    SELECT
        c.id AS category_id,
        c.name AS category_name,
        c.icon AS category_icon,
        c.color AS category_color,
        COALESCE(SUM(e.amount), 0) AS total_spent,
        COUNT(e.id)::INTEGER AS expense_count
    FROM public.categories c
    LEFT JOIN public.expenses e
        ON e.category_id = c.id
        AND e.user_id = p_user_id
        AND EXTRACT(MONTH FROM e.expense_date) = p_month
        AND EXTRACT(YEAR FROM e.expense_date) = p_year
    WHERE c.user_id = p_user_id
    GROUP BY c.id, c.name, c.icon, c.color
    ORDER BY total_spent DESC;
$$;

-- 6. Dashboard summary function (single query for all top metrics)
CREATE OR REPLACE FUNCTION public.get_dashboard_summary(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
    v_month INTEGER := EXTRACT(MONTH FROM NOW());
    v_year INTEGER := EXTRACT(YEAR FROM NOW());
    v_income NUMERIC := 0;
    v_spent NUMERIC := 0;
    v_days_elapsed INTEGER;
    v_days_total INTEGER;
    v_avg_daily NUMERIC;
    v_remaining_days INTEGER;
    v_forecast_balance NUMERIC;
BEGIN
    -- Monthly income
    SELECT COALESCE(SUM(amount), 0) INTO v_income
    FROM public.incomes WHERE user_id = p_user_id AND is_active = TRUE;

    -- This month's spending
    SELECT COALESCE(SUM(amount), 0) INTO v_spent
    FROM public.expenses
    WHERE user_id = p_user_id
      AND EXTRACT(MONTH FROM expense_date) = v_month
      AND EXTRACT(YEAR FROM expense_date) = v_year;

    -- Forecast calculation
    v_days_elapsed := EXTRACT(DAY FROM NOW())::INTEGER;
    v_days_total := EXTRACT(DAY FROM DATE_TRUNC('month', NOW()) + INTERVAL '1 month - 1 day')::INTEGER;
    v_remaining_days := v_days_total - v_days_elapsed;
    v_avg_daily := CASE WHEN v_days_elapsed > 0 THEN v_spent / v_days_elapsed ELSE 0 END;
    v_forecast_balance := (v_income - v_spent) - (v_avg_daily * v_remaining_days);

    RETURN json_build_object(
        'monthly_income', v_income,
        'total_spent', v_spent,
        'remaining_budget', v_income - v_spent,
        'forecast_balance', v_forecast_balance,
        'avg_daily_spending', ROUND(v_avg_daily, 2),
        'days_remaining', v_remaining_days,
        'month', v_month,
        'year', v_year
    );
END;
$$;
