import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3,
  TrendingUp,
  Users,
  Clock,
  Download,
  Calendar,
  PieChart,
  Target,
  Award
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart, Line } from "recharts";

const hiringMetrics = [
  { month: "Jan", applications: 124, hired: 8, ratio: 6.5 },
  { month: "Feb", applications: 156, hired: 12, ratio: 7.7 },
  { month: "Mar", applications: 189, hired: 15, ratio: 7.9 },
  { month: "Apr", applications: 203, hired: 18, ratio: 8.9 },
  { month: "May", applications: 178, hired: 14, ratio: 7.9 },
  { month: "Jun", applications: 167, hired: 16, ratio: 9.6 }
];

const sourceData = [
  { name: "Job Boards", value: 456, color: "hsl(var(--primary))" },
  { name: "Company Website", value: 312, color: "hsl(var(--authentic))" },
  { name: "Referrals", value: 198, color: "hsl(var(--warning))" },
  { name: "LinkedIn", value: 156, color: "hsl(var(--suspicious))" },
  { name: "Tech Events", value: 89, color: "hsl(var(--accent))" }
];

const positionMetrics = [
  { position: "Frontend Dev", applications: 245, timeToHire: 23, avgSalary: "$125k" },
  { position: "Backend Dev", applications: 189, timeToHire: 28, avgSalary: "$135k" },
  { position: "Full Stack", applications: 167, timeToHire: 25, avgSalary: "$130k" },
  { position: "UX Designer", applications: 134, timeToHire: 21, avgSalary: "$105k" },
  { position: "Data Scientist", applications: 98, timeToHire: 32, avgSalary: "$145k" }
];

export default function Reports() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-muted-foreground">Comprehensive hiring insights and performance metrics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              Custom Date Range
            </Button>
            <Button className="w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                  <p className="text-2xl font-bold text-foreground">1,247</p>
                  <p className="text-xs text-authentic flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Hired This Month</p>
                  <p className="text-2xl font-bold text-foreground">16</p>
                  <p className="text-xs text-authentic flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +25% from last month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-authentic/10 text-authentic">
                  <Award className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Time to Hire</p>
                  <p className="text-2xl font-bold text-foreground">24 days</p>
                  <p className="text-xs text-suspicious flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    -2 days from last month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-warning/10 text-warning">
                  <Clock className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-foreground">8.2%</p>
                  <p className="text-xs text-authentic flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +1.3% from last month
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-authentic/10 text-authentic">
                  <Target className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Hiring Trends */}
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Hiring Trends (6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hiringMetrics}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                  <Bar dataKey="applications" fill="hsl(var(--primary))" name="Applications" />
                  <Bar dataKey="hired" fill="hsl(var(--authentic))" name="Hired" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Application Sources */}
          <Card className="bg-gradient-card border-0 shadow-card-custom">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Application Sources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <RechartsPieChart data={sourceData} cx="50%" cy="50%" outerRadius={100} dataKey="value">
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--popover))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {sourceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Position Metrics Table */}
        <Card className="bg-gradient-card border-0 shadow-card-custom">
          <CardHeader>
            <CardTitle>Position Performance Metrics</CardTitle>
            <p className="text-sm text-muted-foreground">
              Detailed breakdown by job position
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Position</th>
                    <th className="text-left py-3 px-4 font-medium">Applications</th>
                    <th className="text-left py-3 px-4 font-medium">Avg. Time to Hire</th>
                    <th className="text-left py-3 px-4 font-medium">Avg. Salary</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {positionMetrics.map((position, index) => (
                    <tr key={index} className="border-b last:border-b-0">
                      <td className="py-3 px-4 font-medium">{position.position}</td>
                      <td className="py-3 px-4">{position.applications}</td>
                      <td className="py-3 px-4">{position.timeToHire} days</td>
                      <td className="py-3 px-4">{position.avgSalary}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="bg-authentic/10 text-authentic border-authentic/20">
                          Active
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}