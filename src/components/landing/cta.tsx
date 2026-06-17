"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LandingCTA() {
  return (
    <section className="py-24 px-6 bg-muted/30">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 mb-8">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-5xl font-bold mb-6">
            Start growing your
            <br />
            <span className="gradient-text">financial intelligence</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-10">
            Free forever. No credit card. Just you, your money, and your AI
            finance coach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="gap-2 h-14 px-10 text-base neon-glow"
            >
              <Link className="flex items-center gap-2" href="/signup">
                Create free account <ArrowRight className="h-4 w-3" />
              </Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            Takes 2 minutes to set up. AI starts working immediately.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
