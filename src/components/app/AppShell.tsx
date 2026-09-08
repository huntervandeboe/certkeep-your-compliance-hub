import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, Users, FileCheck2, LogOut, Menu, X } from "lucide-react";
import { useState, type ReactNode } from "react";

import { LogoMark } from "@/components/landing/Logo";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Overview", to: "/dashboard", icon: LayoutGrid },
  { label: "Subcontractors", to: "/subcontractors", icon: Users },
  { label: "Document review", to: "/review", icon: FileCheck2 },
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
    <div className="min-h-screen bg-app-canvas px-0 py-0 sm:px-6 sm:py-8 lg:px-10 lg:py-10">
      <div className="mx-auto min-h-screen w-full max-w-[1240px] overflow-hidden bg-surface sm:min-h-0 sm:rounded-[26px] sm:shadow-[0_28px_70px_-40px_rgba(17,24,39,0.35)]">
        {/* Top bar */}
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-3.5 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5 text-ink">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-ink text-white">
              <LogoMark className="h-4 w-4" />
            </span>
            <span className="truncate font-display text-[16px] font-bold">CertKeep</span>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-border bg-background p-1 lg:flex">
            {nav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[14px] font-semibold transition-colors",
                  isActive(item.to)
                    ? "bg-surface text-ink shadow-[0_1px_2px_rgba(17,24,39,0.10)]"
                    : "text-[#6b7280] hover:text-ink",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={signOut}
              className="hidden items-center gap-2 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-semibold text-[#4b5563] transition-colors hover:border-ink/25 hover:text-ink lg:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
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
          <div className="space-y-1 border-b border-border px-4 py-3 lg:hidden">
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

        <main className="min-w-0 bg-background px-4 py-7 sm:px-7 sm:py-9">
          <div className="mb-6 grid grid-cols-1 items-end gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="min-w-0">
              <h1 className="text-[26px] leading-tight sm:text-[30px]">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-[15px] text-[#6b7280]">{subtitle}</p> : null}
            </div>
            {actions}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
