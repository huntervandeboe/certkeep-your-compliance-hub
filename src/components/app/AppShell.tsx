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

  const links = (
    <nav className="space-y-1">
      {nav.map((item) => {
        const active = path === item.to || path.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors",
              active
                ? "bg-white/10 text-white"
                : "text-white/55 hover:bg-white/5 hover:text-white/90",
            )}
          >
            <item.icon className="h-[18px] w-[18px]" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background lg:flex">
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col justify-between bg-ink p-5 lg:flex">
        <div>
          <Link to="/" className="mb-8 flex items-center gap-2.5 px-2 text-white">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-[17px] font-bold">CertKeep</span>
          </Link>
          {links}
        </div>
        <button
          type="button"
          onClick={signOut}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white/90"
        >
          <LogOut className="h-[18px] w-[18px]" />
          Sign out
        </button>
      </aside>

      <div className="flex items-center justify-between border-b border-border bg-ink px-4 py-3 lg:hidden">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <LogoMark className="h-5 w-5" />
          <span className="font-display text-[16px] font-bold">CertKeep</span>
        </Link>
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2 text-white"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <div className="bg-ink px-4 pb-4 lg:hidden">
          {links}
          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-semibold text-white/55"
          >
            <LogOut className="h-[18px] w-[18px]" />
            Sign out
          </button>
        </div>
      ) : null}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-[1120px] px-5 py-8 sm:px-8 sm:py-10">
          <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-[27px] leading-tight sm:text-[31px]">{title}</h1>
              {subtitle ? <p className="mt-1.5 text-[15px] text-[#6b7280]">{subtitle}</p> : null}
            </div>
            {actions}
          </header>
          {children}
        </div>
      </main>
    </div>
  );
}
