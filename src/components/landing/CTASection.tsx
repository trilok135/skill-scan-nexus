import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function CTASection() {
  return (
    <section className="py-24 bg-primary relative overflow-hidden">
      <div className="absolute inset-0 geometric-pattern-light" />
      <div className="container mx-auto px-4 text-center relative">
        <div className="bg-white/10 h-1 w-24 mx-auto mb-8 rounded-full" />
        <h2 className="text-4xl md:text-6xl font-extrabold text-primary-foreground tracking-tight mb-6">
          Ready to Transform Your{" "}
          <br className="hidden md:block" />
          Hiring Process?
        </h2>
        <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10">
          Join thousands of companies and candidates using AI-powered skill matching
          to find the perfect fit.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button size="xl" className="bg-white text-primary font-bold hover:bg-white/90 gap-2 shadow-xl">
              Start Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <Button size="xl" variant="heroOutline" className="border-white text-white hover:bg-white hover:text-primary">
            Schedule Demo
          </Button>
        </div>
      </div>
    </section>
  );
}
