import { useState, useEffect } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopNavbar } from "./TopNavbar";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <TopNavbar sidebarCollapsed={collapsed} darkMode={darkMode} onToggleDark={() => setDarkMode(!darkMode)} />
      <main
        className={`pt-16 transition-all duration-300 ${collapsed ? "pl-16" : "pl-60"}`}
      >
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
