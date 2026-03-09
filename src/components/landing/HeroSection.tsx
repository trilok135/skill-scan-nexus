import { ArrowRight, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";

const floatingCards = [
  { label: "Accuracy", value: "95%", sub: "Hiring match", delay: 0 },
  { label: "Skills", value: "200+", sub: "Analyzed", delay: 0.4 },
];

export function HeroSection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-background">
      <div className="absolute inset-0 geometric-pattern opacity-60" />
      <div className="container mx-auto px-4 relative">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left — 70% text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold border border-border">
              <span className="h-2 w-2 rounded-full bg-primary" />
              AI-POWERED PLACEMENT READINESS
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.05] tracking-tight">
              Smart, Skill-Based{" "}
              <span className="text-primary">Recruitment</span>{" "}
              with AI
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl leading-relaxed">
              Powered by transformer-based semantic embeddings, vector databases for real-time
              similarity search, RAG for contextual roadmaps, and LLMs for personalized feedback.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/dashboard">
                <Button variant="hero" size="xl" className="gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Button variant="heroOutline" size="xl" className="gap-2">
                <Play className="h-5 w-5" />
                Request Demo
              </Button>
            </div>

            {/* Powered-by tech badges */}
            <div className="flex flex-wrap gap-2 mt-2">
              {["Transformers", "Vector DB", "RAG", "LLMs", "vLLM", "ONNX Runtime"].map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/5 text-primary border border-primary/15"
                >
                  {tech}
                </span>
              ))}
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {["JD", "ES", "ML", "SJ"].map((initials) => (
                  <div
                    key={initials}
                    className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background"
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">3,500+ candidates matched</p>
                <p className="text-xs text-muted-foreground">Join thousands of users</p>
              </div>
            </div>
          </div>

          {/* Right — 30% illustration */}
          <div className="lg:col-span-5 relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border">
              <img src={heroIllustration} alt="SkillMatch AI Dashboard" className="w-full" />
            </div>

            {/* Floating cards */}
            {floatingCards.map((card) => (
              <div
                key={card.label}
                className="absolute bg-card rounded-xl p-4 card-shadow-hover border border-border animate-float"
                style={{
                  animationDelay: `${card.delay}s`,
                  ...(card.delay === 0
                    ? { top: "10%", left: "-20%" }
                    : { bottom: "15%", right: "-10%" }),
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-extrabold text-primary">{card.value}</span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{card.label}</p>
                    <p className="text-xs text-muted-foreground">{card.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
