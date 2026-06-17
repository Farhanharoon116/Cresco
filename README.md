# Cresco 📈
**Your Intelligent Personal Finance Companion**

Cresco is a modern, AI-powered personal finance dashboard built to help students and professionals track expenses, manage budgets, discover resources, and achieve savings goals.

---

## 🌟 Key Features

### 💰 Core Financial Tracking
- **Interactive Dashboard:** View real-time spending summaries, remaining budget, and AI-predicted end-of-month balances.
- **Expense Categorization:** Easily log expenses with automatic categorization (Housing, Food, Transport, etc.).
- **Savings Goals:** Set specific targets (e.g., "New Laptop", "Emergency Fund") and track your progress visually.

### 🤖 AI-Powered Insights
- **Monthly Reports:** Generate comprehensive monthly financial reports with personalized savings ideas using AI.
- **Intelligent Forecasting:** AI predicts your future balance based on your daily spending velocity.
- **Discover Tab:** An AI-curated discovery engine that recommends books, courses, tools, and games strictly tailored to your *remaining budget* and *personal interests*. 

### 🛡️ Secure Admin Portal
- **Global Broadcasts:** Send platform-wide alerts and announcements.
- **User Management:** View detailed user metrics, monitor onboarding status, and manage platform safety.
- **Data Export:** Instantly export user directories to CSV.

---

## 🏗️ Architecture & Tech Stack

Cresco is built on a cutting-edge, highly performant stack:

### Frontend
- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **UI Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) for utility-first, fully responsive design.
- **Components:** [Base UI](https://base-ui.com/) (Headless accessible components) & custom Shadcn-inspired blocks.
- **Animations:** [Motion (Framer Motion)](https://motion.dev/) for buttery smooth micro-interactions and page transitions.
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend & Database
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication:** Custom JWT-based session management using `jose` over secure HTTP-only cookies.
- **API & Routing:** Next.js Server Actions and Route Handlers.

### AI Integration
- **LLM Providers:** Integrated with [Google Gemini](https://deepmind.google/technologies/gemini/) (Primary) and Groq.
- **Structured Outputs:** Custom JSON parsing pipelines ensure the AI always returns perfectly typed data for UI rendering.

---

## 📂 Project Structure

```text
cresco/
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

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/cresco.git
cd cresco
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Fill in the following values in your `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Providers
GEMINI_API_KEY=your_gemini_api_key

# Admin Settings
ADMIN_PASSWORD=your_secure_admin_password
```

### 4. Database Setup
Ensure your Supabase project contains the following tables:
- `users`
- `expenses`
- `categories`
- `savings_goals`
- `alerts`
- `interest_profiles`

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

**Developed with ❤️ by the Cresco Team**
