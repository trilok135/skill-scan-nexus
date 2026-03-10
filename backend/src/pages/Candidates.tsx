import { DashboardLayout } from "@/components/DashboardLayout";
import { ApplicantCard } from "@/components/ApplicantCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Filter, 
  Download,
  SortDesc,
  Grid3X3,
  List
} from "lucide-react";
import { mockApplicants } from "@/data/mockData";
import { useState } from "react";

const Candidates = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredApplicants = mockApplicants.filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    all: mockApplicants.length,
    new: mockApplicants.filter(a => a.status === 'new').length,
    reviewed: mockApplicants.filter(a => a.status === 'reviewed').length,
    interviewed: mockApplicants.filter(a => a.status === 'interviewed').length,
    hired: mockApplicants.filter(a => a.status === 'hired').length,
    rejected: mockApplicants.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-8 w-8" />
              Candidates
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and review all candidate applications
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filter
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates, skills, positions..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <Badge
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/10 transition-colors"
                      onClick={() => setStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <SortDesc className="h-4 w-4 mr-2" />
                  Sort
                </Button>
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filteredApplicants.length} Candidates Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            {viewMode === 'grid' ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredApplicants.map((applicant) => (
                  <ApplicantCard key={applicant.id} applicant={applicant} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplicants.map((applicant) => (
                  <div key={applicant.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{applicant.name}</h3>
                        <Badge className={applicant.status === 'new' ? 'bg-primary/10 text-primary' : 'bg-muted'}>
                          {applicant.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{applicant.position}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Authenticity: {applicant.authenticityScore}%</span>
                        <span>Rating: {applicant.reviewRating.toFixed(1)}★</span>
                        <span>Submitted: {new Date(applicant.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {filteredApplicants.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">No candidates found</h3>
                <p className="text-muted-foreground">Try adjusting your search criteria or filters.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Candidates;