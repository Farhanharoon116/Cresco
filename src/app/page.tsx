import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { LandingProblem } from "@/components/landing/problem";
import { LandingAI } from "@/components/landing/ai-section";
import { LandingTestimonials } from "@/components/landing/testimonials";
import { LandingCTA } from "@/components/landing/cta";
import { LandingNav } from "@/components/landing/nav";
import { LandingSavingsUnlock } from "@/components/landing/savings-unlock";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
  title: 'Cresco — AI-Powered Finance for Students',
  description: 'Track expenses, set budgets, crush savings goals and get AI-powered financial coaching. Built for students, powered by Gemini & Groq.',
}

export default async function LandingPage() {
  // Redirect logged-in users to dashboard
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav />
      <LandingHero />
      <LandingProblem />
      <LandingFeatures />
      <LandingAI />
      <LandingSavingsUnlock />
      <LandingTestimonials />
      <LandingCTA />
      <LandingFooter />
    </div>
  );
}
