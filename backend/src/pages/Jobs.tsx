import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Plus,
  Search,
  Filter
} from "lucide-react";

const mockJobs = [
  {
    id: "1",
    title: "Senior Frontend Developer",
    department: "Engineering",
    location: "San Francisco, CA",
    type: "Full-time",
    salary: "$120,000 - $160,000",
    applicants: 45,
    status: "active",
    postedAt: "2024-01-15",
    description: "We're looking for a Senior Frontend Developer to join our growing engineering team."
  },
  {
    id: "2", 
    title: "UX/UI Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time",
    salary: "$90,000 - $120,000",
    applicants: 32,
    status: "active",
    postedAt: "2024-01-12",
    description: "Join our design team to create beautiful and intuitive user experiences."
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Austin, TX",
    type: "Full-time", 
    salary: "$110,000 - $140,000",
    applicants: 28,
    status: "paused",
    postedAt: "2024-01-10",
    description: "Help us scale our infrastructure and improve deployment processes."
  },
  {
    id: "4",
    title: "Data Scientist",
    department: "Analytics",
    location: "New York, NY",
    type: "Contract",
    salary: "$95,000 - $125,000",
    applicants: 67,
    status: "active",
    postedAt: "2024-01-08",
    description: "Analyze data to drive business insights and machine learning initiatives."
  }
];

const statusColors = {
  active: "bg-authentic/10 text-authentic border-authentic/20",
  paused: "bg-suspicious/10 text-suspicious border-suspicious/20",
  closed: "bg-muted text-muted-foreground border-muted"
};

export default function Jobs() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Job Openings</h1>
            <p className="text-muted-foreground">Manage active job postings and track applications</p>
          </div>
          <Button className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-card border-0 shadow-card-custom">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search job openings..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        <div className="grid gap-4">
          {mockJobs.map((job) => (
            <Card key={job.id} className="bg-gradient-card border-0 shadow-card-custom hover:shadow-card-hover transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Briefcase className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{job.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">{job.department}</p>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[job.status as keyof typeof statusColors]}>
                    {job.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{job.description}</p>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{job.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{job.salary}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{job.applicants} applicants</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-xs text-muted-foreground">
                    Posted on {new Date(job.postedAt).toLocaleDateString()}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Applications
                    </Button>
                    <Button size="sm">
                      Edit Job
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}