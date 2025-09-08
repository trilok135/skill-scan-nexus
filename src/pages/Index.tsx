import { DashboardLayout } from "@/components/DashboardLayout";
import { DashboardStats } from "@/components/DashboardStats";
import { ApplicantCard } from "@/components/ApplicantCard";
import { FileUploadZone } from "@/components/FileUploadZone";
import { RecentActivity } from "@/components/RecentActivity";
import { HiringFunnel } from "@/components/HiringFunnel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Filter, 
  Download,
  Users,
  BarChart3,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { mockApplicants, applicationSourcesData } from "@/data/mockData";

const Index = () => {
  const recentApplicants = mockApplicants.slice(0, 6);
  const flaggedApplicants = mockApplicants.filter(a => a.flags.length > 0).length;
  const highScoreApplicants = mockApplicants.filter(a => a.authenticityScore >= 80).length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Welcome to SkillMatch ATS</h1>
            <p className="text-muted-foreground mt-1">
              AI-powered applicant tracking with authenticity scoring and skill matching
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
            <Button size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload Files
            </Button>
          </div>
        </div>

        {/* Dashboard Stats */}
        <DashboardStats />

        {/* Quick Actions & Alerts */}
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 space-y-6">
            {/* File Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload New Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone />
              </CardContent>
            </Card>

            {/* Recent Applicants */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Recent Applicants
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {recentApplicants.map((applicant) => (
                    <ApplicantCard key={applicant.id} applicant={applicant} />
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Button variant="outline">View All Candidates</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-4 space-y-6">
            {/* Authenticity Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-warning" />
                  Authenticity Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-danger-light">
                  <div>
                    <p className="font-medium text-danger">Flagged Applications</p>
                    <p className="text-xs text-danger/70">Require manual review</p>
                  </div>
                  <Badge className="bg-danger text-danger-foreground">
                    {flaggedApplicants}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-success-light">
                  <div>
                    <p className="font-medium text-success">High Authenticity</p>
                    <p className="text-xs text-success/70">Score ≥ 80%</p>
                  </div>
                  <Badge className="bg-success text-success-foreground">
                    {highScoreApplicants}
                  </Badge>
                </div>

                <Button variant="outline" className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Review All Flagged
                </Button>
              </CardContent>
            </Card>

            {/* Application Sources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Application Sources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {applicationSourcesData.map((source) => (
                    <div key={source.source} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{source.source}</span>
                        <span className="text-sm text-muted-foreground">
                          {source.applications} ({source.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <RecentActivity />
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="grid gap-6 md:grid-cols-2">
          <HiringFunnel />
          
          <Card>
            <CardHeader>
              <CardTitle>AI Content Analysis Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-lg bg-authentic/10">
                    <div className="text-2xl font-bold text-authentic">
                      {Math.round((highScoreApplicants / mockApplicants.length) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Authentic Content</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-suspicious/10">
                    <div className="text-2xl font-bold text-suspicious">
                      {Math.round((flaggedApplicants / mockApplicants.length) * 100)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Flagged Content</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>AI Detection Accuracy</span>
                    <span className="font-medium">94.7%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-full bg-gradient-success rounded-full w-[94.7%]" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Average Processing Time</span>
                    <span className="font-medium">2.3s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="h-full bg-primary rounded-full w-[85%]" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;