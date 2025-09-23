"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Bot,
  FileText,
  BookOpen,
  Settings,
  ListTodo,
  TrendingUp,
  Sparkles,
  Lightbulb,
  MessageCircle,
  Palette,
  Activity,
  Target,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/tasks", label: "Tugas", icon: ListTodo },
  { href: "/dashboard/assistant", label: "Asisten AI", icon: Bot },
  { href: "/dashboard/business-advice", label: "Saran Bisnis", icon: Lightbulb },
  { href: "/dashboard/chat-ai", label: "Chat AI", icon: MessageCircle },
  { href: "/dashboard/content-generator", label: "Generator Konten", icon: Sparkles },
  { href: "/dashboard/documents", label: "Analisis Dokumen", icon: FileText },
  { href: "/dashboard/financial-summary", label: "Ringkasan Keuangan", icon: TrendingUp },
  { href: "/dashboard/brand-generator", label: "Brand Generator", icon: Palette },
  { href: "/dashboard/business-simulator", label: "Business Simulator", icon: Target },
  { href: "/dashboard/resource-optimization", label: "Resource Hub", icon: Activity },
  { href: "/dashboard/learning", label: "Pusat Belajar", icon: BookOpen },
  { href: "/dashboard/settings", label: "Pengaturan", icon: Settings },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="flex h-full flex-col">
      <SidebarMenu className="flex-1">
        {navItems.map((item) => (
          <SidebarMenuItem key={item.label}>
            <SidebarMenuButton
              asChild
              isActive={item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)}
              tooltip={item.label}
              size="lg"
            >
              <Link href={item.href}>
                <item.icon />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
