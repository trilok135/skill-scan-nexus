import { TrendingUp, Users, Award, Target } from "lucide-react";

const stats = [
  { label: "CANDIDATES MATCHED", value: "3,500+", icon: Users },
  { label: "HIRING ACCURACY", value: "95%", icon: Target },
  { label: "SKILLS ANALYZED", value: "200+", icon: Award },
  { label: "GROWTH RATE", value: "4.8x", icon: TrendingUp },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="border-t-4 border-t-primary rounded-xl bg-card p-8 card-shadow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">{stat.value}</p>
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
