import { Bell, Moon, Sun, Search, User, LogOut } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TopNavbarProps {
  sidebarCollapsed: boolean;
  darkMode: boolean;
  onToggleDark: () => void;
}

function UserMenu() {
  const { profile, userRole, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <div className="relative ml-2">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="hidden md:block text-left">
          <p className="text-xs font-medium text-foreground">{profile?.full_name || "User"}</p>
          <p className="text-[10px] text-muted-foreground capitalize">{userRole || "citizen"}</p>
        </div>
      </button>
      {open && (
        <div className="absolute right-0 top-11 w-48 rounded-xl border border-border bg-card p-2 shadow-xl animate-fade-in z-50">
          <button onClick={() => { signOut(); setOpen(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function TopNavbar({ sidebarCollapsed, darkMode, onToggleDark }: TopNavbarProps) {
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 right-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-xl px-6 transition-all duration-300 ${
        sidebarCollapsed ? "left-16" : "left-60"
      }`}
    >
      {/* Search */}
      <div className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 w-72">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search systems, complaints..."
          className="bg-transparent text-sm outline-none w-full text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Status indicator */}
        <div className="hidden md:flex items-center gap-2 mr-4 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full status-online" />
          <span className="font-mono-code">SYSTEMS NOMINAL</span>
        </div>

        <button
          onClick={onToggleDark}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors relative"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-destructive animate-pulse-glow" />
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-11 w-72 rounded-xl border border-border bg-card p-4 shadow-xl animate-fade-in">
              <p className="text-xs font-semibold text-foreground mb-3">Notifications</p>
              {[
                { text: "Water system pressure alert — Zone 4", time: "2m ago", type: "warning" },
                { text: "AI resolved 12 complaints automatically", time: "15m ago", type: "success" },
                { text: "Data pipeline sync completed", time: "1h ago", type: "info" },
              ].map((n, i) => (
                <div key={i} className="flex items-start gap-2 py-2 border-b border-border last:border-0">
                  <span className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.type === "warning" ? "status-warning" : n.type === "success" ? "status-online" : "bg-info"}`} />
                  <div>
                    <p className="text-xs text-foreground">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground">{n.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <UserMenu />
      </div>
    </header>
  );
}
