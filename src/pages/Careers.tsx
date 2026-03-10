import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Briefcase, MapPin, Clock, DollarSign, Building2, ExternalLink, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function getMatchColor(score: number) {
    if (score >= 90) return "text-metric-green bg-metric-green/10";
    if (score >= 80) return "text-primary bg-primary/10";
    return "text-metric-orange bg-metric-orange/10";
}

const Careers = () => {
    const { data: opportunities, isLoading } = useQuery({
        queryKey: ["career-opportunities"],
        queryFn: async () => {
            const { data: { session } } = await supabase.auth.getSession();
            const headers = { Authorization: `Bearer ${session?.access_token}` };

            // 1. Fetch jobs
            const jobsRes = await fetch("/api/jobs", { headers });
            if (!jobsRes.ok) throw new Error("Failed to fetch jobs");
            const { jobs } = await jobsRes.json();

            // 2. Fetch match scores for each job in parallel
            const jobsWithScores = await Promise.all(
                jobs.map(async (job: any) => {
                    try {
                        const scoreRes = await fetch(`/api/skills/match-score/${job.id}`, { headers });
                        if (scoreRes.ok) {
                            const scoreData = await scoreRes.json();
                            return { ...job, matchScore: scoreData.match_score };
                        }
                    } catch (e) {
                        console.error("Failed to fetch score for job", job.id);
                    }
                    return { ...job, matchScore: 0 };
                })
            );

            // Sort by match score descending
            return jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
        }
    });

    return (
        <div className="min-h-screen bg-background">
            <DashboardSidebar />
            <div className="pl-64 min-h-screen transition-all duration-300">
                <DashboardHeader />
                <main className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Career Opportunities</h1>
                            <p className="text-muted-foreground">AI-matched opportunities based on your skill profile</p>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent border border-border">
                            <Brain className="h-3.5 w-3.5 text-primary" />
                            <span className="text-xs font-bold text-muted-foreground">Matched by: <span className="text-foreground">all-MiniLM-L6-v2</span> + <span className="text-foreground">Pinecone</span></span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="text-center py-10 text-muted-foreground animate-pulse">Loading AI matches...</div>
                        ) : opportunities?.map((job: any) => (
                            <div
                                key={job.id}
                                className="rounded-xl bg-card p-5 card-shadow hover:card-shadow-hover transition-all duration-300 group"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                                                <Building2 className="h-5 w-5 text-primary" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {job.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{job.company || job.department || "Company"}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-3">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-4 w-4" /> {job.location || "Remote"}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase className="h-4 w-4" /> {job.type || "Full-time"}
                                            </span>
                                            {(job.salary_min || job.salary_max) && (
                                                <span className="flex items-center gap-1">
                                                    <DollarSign className="h-4 w-4" />
                                                    {job.salary_min ? `$${(job.salary_min / 1000).toFixed(0)}k` : ""}
                                                    {job.salary_max ? ` - $${(job.salary_max / 1000).toFixed(0)}k` : ""}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" /> {new Date(job.created_at || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-3">
                                            {(job.required_skills || []).map((skill: string) => (
                                                <span
                                                    key={skill}
                                                    className="px-2 py-1 rounded-md bg-accent text-xs font-medium text-accent-foreground"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 ml-4">
                                        <span
                                            className={cn(
                                                "px-3 py-1.5 rounded-full text-sm font-bold",
                                                getMatchColor(job.matchScore)
                                            )}
                                        >
                                            {job.matchScore}% Match
                                        </span>
                                        <Button variant="outline" size="sm" className="gap-1">
                                            Apply <ExternalLink className="h-3 w-3" />
                                        </Button>
                                        <p className="text-[10px] text-muted-foreground text-right mt-1">
                                            via Transformer + Vector DB
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Careers;
