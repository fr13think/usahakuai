"use client";

import { AuthProvider } from "@/components/auth/auth-provider";

interface LandingLayoutProps {
  children: React.ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}