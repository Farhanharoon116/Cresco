# Cresco 📈
**Your Intelligent Personal Finance Companion**

Cresco is a modern, AI-powered personal finance dashboard built to help students and professionals track expenses, manage budgets, discover resources, and achieve savings goals. By leveraging cutting-edge LLMs (Google Gemini & Groq), Cresco transforms mundane financial tracking into an engaging, proactive, and personalized experience.

---

## 🌟 Comprehensive Features

### 💰 Core Financial Tracking
- **Interactive Dashboard:** View real-time spending summaries, remaining budget, and dynamic visual charts (pie charts for categories, line charts for spending trends).
- **Expense Management:** Easily log expenses manually or via natural language. Automatic categorization assigns expenses to the right buckets (Housing, Food, Transport, etc.).
- **Smart Budgets:** Set monthly budgets per category and receive intelligent alerts when approaching or exceeding limits.
- **Savings Goals:** Set specific targets (e.g., "New Laptop", "Emergency Fund") and track your progress visually with milestone markers.
- **Recurring Expenses:** Track subscriptions and fixed costs with automated logging and upcoming payment reminders.

### 🤖 AI-Powered Insights
- **Dual-Agent Architecture:** Utilizes Groq for lightning-fast tasks (categorization, NLP parsing) and Gemini for deep reasoning (reports, forecasting).

#### 🧠 Integrated AI Agents
Our platform employs specialized agents to handle specific financial workflows:
- **Categorization (Groq):** Instantly tags every expense.
- **NL Parser (Groq):** Understands natural language input.
- **Budget Monitor (DB Trigger):** Fires alerts at budget thresholds.
- **Forecast (Gemini):** Predicts your month-end balance based on daily spending velocity.
- **Anomaly Detector (Groq):** Flags unusual spending patterns in real-time.
- **Monthly Report (Gemini):** Generates comprehensive financial health reports.
- **Recommendations (Gemini):** Personalizes savings opportunities and resources.
- **Chat Assistant (Gemini):** Answers any financial question you might have.

### 🛡️ Secure Admin Portal
- **Global Broadcasts:** Send platform-wide alerts and announcements to all users.
- **User Management:** View detailed user metrics, monitor onboarding status, and manage platform safety.
- **Data Export:** Instantly export user directories to CSV for external analysis.

---

## 🏗️ Architecture & Tech Stack

Cresco is built on a cutting-edge, highly performant stack:

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router) for server-side rendering and optimal performance.
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first, fully responsive design.
- **Components:** [Base UI](https://base-ui.com/) (Headless accessible components) & custom Shadcn-inspired blocks.
- **Animations:** [Motion (Framer Motion)](https://motion.dev/) for buttery smooth micro-interactions and page transitions.
- **Charts:** Recharts for dynamic data visualization.
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL) with Row-Level Security (RLS) for robust data protection.
- **Authentication:** Custom JWT-based session management using `jose` over secure HTTP-only cookies.
- **API & Routing:** Next.js Server Actions for seamless mutations and Route Handlers for standard APIs.

### AI Integration
- **LLM Providers:** Integrated with [Google Gemini](https://deepmind.google/technologies/gemini/) (Primary) and [Groq](https://groq.com/).
- **Structured Outputs:** Custom JSON parsing pipelines ensure the AI always returns perfectly typed data (Zod schemas) for UI rendering.

---

## 📂 Project Structure

```text
cresco/
├── docs/              # System architecture, ERDs, and workflow diagrams
├── src/
│   ├── actions/       # Next.js Server Actions (Database mutations, AI calls)
│   ├── app/           # Next.js App Router pages and layouts
│   │   ├── (app)/     # Protected user routes (Dashboard, Budget, Goals)
│   │   ├── (auth)/    # Public authentication routes
│   │   ├── admin/     # Protected Admin Portal
│   │   └── api/       # API Route Handlers (AI endpoints)
│   ├── components/    # Reusable UI components
│   │   ├── dashboard/ # Dashboard specific widgets
│   │   ├── layout/    # Sidebar, Header, Navigation
│   │   └── ui/        # Base UI / Shadcn primitives (Buttons, Inputs, Modals)
│   ├── lib/           # Core utilities
│   │   ├── ai/        # AI prompt logic and JSON extractors
│   │   ├── auth/      # JWT and Session management logic
│   │   └── supabase/  # Supabase client instantiation
│   └── types/         # TypeScript interfaces (Database schemas, AI responses)
├── public/            # Static assets
└── .env.local         # Environment variables
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase Project (for PostgreSQL database)
- Gemini API Key
- Groq API Key (Optional but recommended for speed)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cresco.git
cd cresco
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in the following values in your `.env.local`:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Admin Settings
ADMIN_PASSWORD=your_secure_admin_password
```

### 4. Database Setup
Ensure your Supabase project contains the tables defined in our ERD (see `docs/diagrams/02-database-erd.md`), including:
- `users`, `incomes`, `categories`, `expenses`, `budgets`, `savings_goals`, `alerts`, `forecasts`, `monthly_reports`, `recurring_expenses`, `interest_profiles`, `recommendations`.

*Note: Migrations are intentionally excluded from the repository to prevent conflicts. Please initialize the schema manually or via your own Supabase CLI flow.*

### 5. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🔐 Admin Portal Access
The backend Admin Portal is located at `/admin`.
1. Navigate to `http://localhost:3000/admin/login`
2. Enter the password defined in your `.env.local` (default: `admin123`)

---

## 🎨 Design Philosophy
Cresco follows a **glassmorphic**, premium aesthetic. We utilize a carefully curated palette consisting of `#F5F5F5` (Background), `#424242` (Charcoal Text), `#48CFCB` (Primary Bright), and `#229799` (Secondary Deep). The interface emphasizes bold typography, generous whitespace, and subtle entrance animations to make financial management feel less like a chore and more like an experience.

---

## 🤝 Contributing
Contributions are welcome! If you'd like to improve Cresco:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

**Developed with ❤️ by the Cresco Team**
