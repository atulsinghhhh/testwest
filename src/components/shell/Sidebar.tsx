import { useMemo } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  PlusCircle,
  BookOpen,
  BarChart3,
  Settings,
  School,
  Briefcase,
  Sparkles,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/api/hooks";

type NavItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
};

const dashboards: NavItem[] = [
  { title: "Student", url: "/dashboard/student", icon: GraduationCap },
  { title: "Parent", url: "/dashboard/parent", icon: Users },
  { title: "Teacher", url: "/dashboard/teacher", icon: Briefcase },
  { title: "School", url: "/dashboard/school", icon: School },
  { title: "Solo learner", url: "/dashboard/solo", icon: Sparkles },
];

const learning: NavItem[] = [
  { title: "Create Test", url: "/test/new", icon: PlusCircle },
  { title: "My Tests", url: "/tests", icon: BookOpen },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
];

const administration: NavItem[] = [
  { title: "Register School", url: "/schools/new", icon: PlusCircle },
];

export function AppSidebar() {
  const { data: user } = useUser();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) => pathname === url || pathname.startsWith(url + "/");

  const dashboardsList = useMemo(() => {
    if (!user) return [];
    const role = user.role;
    if (role === "STUDENT") return dashboards.filter(d => d.title === "Student");
    if (role === "SOLO") return dashboards.filter(d => d.title === "Solo learner");
    if (role === "PARENT") return dashboards.filter(d => d.title === "Parent");
    if (role === "TEACHER") return dashboards.filter(d => d.title === "Teacher");
    if (role === "SCHOOL") return dashboards.filter(d => d.title === "School");
    return dashboards;
  }, [user]);

  const showLearning = user?.role === "STUDENT" || user?.role === "SOLO";
  const showAdmin = user?.role === "SCHOOL";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          to="/"
          className="flex items-center gap-2 px-2 py-2 transition-opacity hover:opacity-80"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <LayoutDashboard className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold tracking-tight">TestWest</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                K-12 Assessments
              </span>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboards</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboardsList.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showLearning && (
        <SidebarGroup>
          <SidebarGroupLabel>Learning</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {learning.map((item) => (
                <SidebarMenuItem key={item.url}>
                  {item.disabled ? (
                    <SidebarMenuButton
                      tooltip={`${item.title} — coming soon`}
                      className="cursor-not-allowed opacity-50"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {!collapsed && (
                        <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={isActive(item.url)}
                      tooltip={item.title}
                    >
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}

        {showAdmin && (
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {administration.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
              <Link to="/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
