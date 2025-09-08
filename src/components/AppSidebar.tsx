import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Briefcase, 
  MessageCircle, 
  FileText, 
  BarChart3, 
  Settings,
  Search
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Events", url: "/events", icon: Calendar },
  { title: "Candidates", url: "/candidates", icon: Users },
  { title: "Job Openings", url: "/jobs", icon: Briefcase },
  { title: "Interviews", url: "/interviews", icon: MessageCircle },
  { title: "Reviews", url: "/reviews", icon: FileText },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/") return currentPath === "/";
    return currentPath.startsWith(path);
  };

  const getNavClasses = (path: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200";
    if (isActive(path)) {
      return `${baseClasses} bg-sidebar-accent text-sidebar-primary font-medium shadow-sm`;
    }
    return `${baseClasses} text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary`;
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-primary text-white font-bold">
              S
            </div>
            <div>
              <h2 className="font-semibold text-sidebar-foreground">SkillMatch</h2>
              <p className="text-xs text-muted-foreground">ATS Dashboard</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded bg-gradient-primary text-white font-bold mx-auto">
            S
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className={isCollapsed ? "sr-only" : ""}>
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClasses(item.url)}>
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && (
          <div className="mt-6 p-4 rounded-lg bg-gradient-card border border-sidebar-border">
            <div className="flex items-center gap-2 mb-2">
              <Search className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quick Search</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Search candidates, jobs, and events quickly from anywhere in the app.
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}