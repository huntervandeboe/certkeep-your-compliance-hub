import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  FileCheck2,
  FolderKanban,
  LayoutGrid,
  LogOut,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import { LogoMark } from "@/components/landing/Logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", to: "/dashboard", icon: LayoutGrid },
  { label: "Projects", to: "/projects", icon: FolderKanban },
  { label: "Subcontractors", to: "/subcontractors", icon: Users },
  { label: "Documents", to: "/review", icon: FileCheck2 },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string | undefined;
  actions?: ReactNode | undefined;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  const isActive = (to: string) => path === to || path.startsWith(to + "/");

  return (
    <div className="min-h-screen bg-[#f1f2f5] lg:p-4">
      <div className="mx-auto flex min-h-screen w-full max-w-[1540px] overflow-hidden bg-[#f8f8f7] lg:min-h-[calc(100vh-2rem)] lg:rounded-[24px] lg:border lg:border-black/[0.06] lg:shadow-[0_24px_80px_-38px_rgba(17,24,39,0.32)]">
        <aside className="hidden w-[232px] shrink-0 flex-col bg-[#111827] px-3 py-4 text-white lg:flex">
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2.5 py-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-brand text-white">
              <LogoMark className="h-4 w-4" />
            </span>
            <span className="font-display text-[16px] font-bold tracking-[-0.03em]">CertKeep</span>
          </Link>
          <button
            className="mt-5 flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-left"
            type="button"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-white/10">
              <Building2 className="h-3.5 w-3.5" />
            </span>
            <span className="min-w-0 flex-1 truncate text-[12px] font-semibold">My workspace</span>
            <ChevronDown className="h-3.5 w-3.5 text-white/45" />
          </button>
          <p className="mb-2 mt-7 px-3 text-[10px] font-bold tracking-[0.16em] text-white/35 uppercase">
            Workspace
          </p>
          <nav className="space-y-1">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors",
                  isActive(item.to)
                    ? "bg-white text-ink shadow-[0_8px_24px_-16px_rgba(0,0,0,.8)]"
                    : "text-white/58 hover:bg-white/[0.06] hover:text-white",
                )}
              >
                <item.icon className="h-[17px] w-[17px]" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto space-y-1 border-t border-white/10 pt-3">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white"
            >
              <CircleHelp className="h-[17px] w-[17px]" />
              Help center
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white"
            >
              <Settings className="h-[17px] w-[17px]" />
              Settings
            </button>
            <button
              type="button"
              onClick={signOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-white/55 hover:bg-white/[0.06] hover:text-white"
            >
              <LogOut className="h-[17px] w-[17px]" />
              Sign out
            </button>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="flex h-[68px] items-center justify-between border-b border-black/[0.06] bg-white px-4 sm:px-6">
            <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-ink text-white">
                <LogoMark className="h-4 w-4" />
              </span>
              <span className="font-display font-bold text-ink">CertKeep</span>
            </Link>
            <button
              type="button"
              className="hidden h-9 w-full max-w-[390px] items-center gap-2.5 rounded-xl border border-border bg-[#fafafa] px-3 text-left text-[12px] text-[#7b8190] lg:flex"
            >
              <Search className="h-4 w-4" />
              <span className="flex-1">Search projects, vendors, documents…</span>
              <kbd className="rounded-md border bg-white px-1.5 py-0.5 text-[10px] text-[#9ca3af]">
                ⌘ K
              </kbd>
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Help"
                className="hidden h-9 w-9 place-items-center rounded-xl border border-border text-[#6b7280] hover:text-ink sm:grid"
              >
                <CircleHelp className="h-[17px] w-[17px]" />
              </button>
              <button
                type="button"
                aria-label="Notifications"
                className="relative hidden h-9 w-9 place-items-center rounded-xl border border-border text-[#6b7280] hover:text-ink sm:grid"
              >
                <Bell className="h-[17px] w-[17px]" />
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-white" />
              </button>
              <span className="hidden h-7 w-px bg-border sm:block" />
              <div className="hidden items-center gap-2.5 sm:flex">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#1f2937] text-[11px] font-bold text-white">
                  CK
                </span>
                <div className="hidden xl:block">
                  <p className="text-[12px] font-bold leading-tight text-ink">Workspace admin</p>
                  <p className="text-[10px] text-[#8b91a0]">Owner</p>
                </div>
              </div>
              <button
                type="button"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen(!open)}
                className="rounded-xl border border-border p-2 text-ink lg:hidden"
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </header>

          {open ? (
            <div className="space-y-1 border-b border-border bg-white px-4 py-3 lg:hidden">
              {nav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold",
                    isActive(item.to) ? "bg-background text-ink" : "text-[#6b7280]",
                  )}
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              ))}
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-[#6b7280]"
              >
                <LogOut className="h-[18px] w-[18px]" />
                Sign out
              </button>
            </div>
          ) : null}

          <main className="min-w-0 px-4 py-6 sm:px-7 sm:py-8 xl:px-9">
            <div className="mb-7 grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
              <div className="min-w-0">
                <h1 className="text-[25px] leading-tight sm:text-[29px]">{title}</h1>
                {subtitle ? <p className="mt-1.5 text-[13px] text-[#737987]">{subtitle}</p> : null}
              </div>
              {actions}
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
