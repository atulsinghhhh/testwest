import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./Sidebar";
import { Header } from "./Header";
import type { Role } from "@/types";

interface AppShellProps {
  title: string;
  subtitle?: string;
  role: Role;
  userName: string;
  children: React.ReactNode;
}

export function AppShell({ title, subtitle, role, userName, children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Header title={title} subtitle={subtitle} role={role} userName={userName} />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
