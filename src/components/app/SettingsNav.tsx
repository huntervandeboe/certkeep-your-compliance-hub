import { Link, useRouterState } from "@tanstack/react-router";
import { CreditCard, FileText, UserRound } from "lucide-react";

const links = [
  { label: "Account", to: "/settings", icon: UserRound },
  { label: "Billing", to: "/billing", icon: CreditCard },
  { label: "Invoices", to: "/invoices", icon: FileText },
] as const;

export function SettingsNav() {
  const path = useRouterState({ select: (state) => state.location.pathname });

  return (
    <nav
      aria-label="Account settings"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {links.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-[12px] font-bold ${path === item.to ? "border-brand text-ink" : "border-transparent text-muted-foreground hover:text-ink"}`}
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
