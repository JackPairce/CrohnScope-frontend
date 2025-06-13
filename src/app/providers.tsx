"use client";
import AuthCheck from "@/components/AuthCheck";

import { ThemeProvider } from "@/contexts/ThemeContext";
import { usePathname } from "next/navigation";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthCheck isAuthPage={pathname.startsWith("/auth")}>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthCheck>
  );
}
