import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Logo } from "@/components/logo";
import { UserNav } from "@/components/user-nav";
import { DashboardNav } from "@/components/dashboard-nav";
import { AuthGuard } from "@/components/auth/auth-guard";
import { ThemeProvider } from "@/components/theme/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ThemeProvider>
        <SidebarProvider>
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <Logo />
          </SidebarHeader>
          <SidebarContent>
            <DashboardNav />
          </SidebarContent>
        </Sidebar>
        <SidebarInset>
          <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm sm:justify-end sm:px-6">
            <SidebarTrigger className="sm:hidden" />
            <UserNav />
          </header>
          <div className="min-h-[calc(100vh-4rem)] w-full">
              {children}
          </div>
        </SidebarInset>
        </SidebarProvider>
      </ThemeProvider>
    </AuthGuard>
  );
}
