import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  Star,
  Brain,
  BookOpen,
  Target,
  TrendingUp,
  FileText,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockApplicants } from "@/data/mockData";
import { AISuggestions } from "@/components/AISuggestions";

const getAuthenticityColor = (score: number) => {
  if (score >= 80) return "text-authentic";
  if (score >= 60) return "text-suspicious"; 
  return "text-flagged";
};

const getAuthenticityIcon = (score: number) => {
  if (score >= 80) return CheckCircle;
  if (score >= 60) return AlertTriangle;
  return Shield;
};

const getScoreMessage = (score: number) => {
  if (score >= 90) return { message: "Excellent! Your application shows strong authenticity.", type: "success" };
  if (score >= 80) return { message: "Good score! Minor improvements could boost your profile.", type: "success" };
  if (score >= 60) return { message: "Moderate score. Consider our suggestions for improvement.", type: "warning" };
  return { message: "Low score detected. Review our recommendations carefully.", type: "danger" };
};

export default function CandidateView() {
  const { id } = useParams<{ id: string }>();
  const candidate = mockApplicants.find(app => app.id === id);

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Not Found</h2>
            <p className="text-muted-foreground">
              The application you're looking for doesn't exist or may have been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const AuthenticityIcon = getAuthenticityIcon(candidate.authenticityScore);
  const scoreMessage = getScoreMessage(candidate.authenticityScore);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-primary border-b">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center text-white">
            <h1 className="text-3xl font-bold mb-2">Application Review Results</h1>
            <p className="text-primary-foreground/80">
              AI-Powered Analysis & Improvement Suggestions
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Candidate Info Card */}
        <Card className="mb-8 bg-gradient-card border-0 shadow-card-custom">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl text-foreground mb-1">
                  {candidate.name}
                </CardTitle>
                <p className="text-muted-foreground">{candidate.position}</p>
                <p className="text-sm text-primary font-medium mt-1">
                  {candidate.email}
                </p>
              </div>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                Application #{candidate.id}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Authenticity Score */}
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AuthenticityIcon className={cn("h-5 w-5", getAuthenticityColor(candidate.authenticityScore))} />
                Content Authenticity Score
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className={cn("text-4xl font-bold mb-2", getAuthenticityColor(candidate.authenticityScore))}>
                  {candidate.authenticityScore}%
                </div>
                <Progress 
                  value={candidate.authenticityScore} 
                  className="h-3"
                />
              </div>
              <div className={cn(
                "p-3 rounded-lg text-sm text-center",
                scoreMessage.type === "success" && "bg-authentic/10 text-authentic",
                scoreMessage.type === "warning" && "bg-suspicious/10 text-suspicious",
                scoreMessage.type === "danger" && "bg-flagged/10 text-flagged"
              )}>
                {scoreMessage.message}
              </div>
            </CardContent>
          </Card>

          {/* Overall Rating */}
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-warning" />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold mb-2 text-warning">
                  {candidate.reviewRating.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={cn(
                        "h-5 w-5",
                        star <= candidate.reviewRating 
                          ? "text-warning fill-warning" 
                          : "text-muted-foreground"
                      )}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on technical skills, experience, and presentation
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details */}
        <Card className="mb-8 bg-gradient-card border-0 shadow-card-custom">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Application Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-1">File Type</p>
                <Badge variant="outline">{candidate.fileType}</Badge>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Completeness</p>
                <div className="flex items-center gap-2">
                  <Progress value={candidate.completeness} className="flex-1" />
                  <span className="text-sm font-medium">{candidate.completeness}%</span>
                </div>
              </div>
            </div>
            
            {candidate.skills.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Key Skills Identified</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.flags.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Areas for Improvement</p>
                <div className="flex flex-wrap gap-2">
                  {candidate.flags.map((flag) => (
                    <Badge key={flag} variant="outline" className="bg-flagged/10 border-flagged/20 text-flagged">
                      {flag === 'ai-generated' && 'AI Content Detected'}
                      {flag === 'plagiarism' && 'Similarity Found'}
                      {flag === 'incomplete' && 'Missing Information'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* AI Suggestions */}
        <AISuggestions candidate={candidate} />

        {/* Action Buttons */}
        <Card className="bg-gradient-card border-0 shadow-card-custom">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="flex-1 sm:flex-none">
                <Download className="h-4 w-4 mr-2" />
                Download Detailed Report
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <BookOpen className="h-4 w-4 mr-2" />
                View Learning Resources
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}