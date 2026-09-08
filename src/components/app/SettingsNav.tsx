import { Link, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, FileText, Sparkles, UserRound } from "lucide-react";

import { getPlatformAccess } from "@/lib/app.functions";

const links = [
  { label: "Account", to: "/settings", icon: UserRound },
  { label: "Billing", to: "/billing", icon: CreditCard },
  { label: "Invoices", to: "/invoices", icon: FileText },
] as const;

export function SettingsNav() {
  const path = useRouterState({ select: (state) => state.location.pathname });
  const loadAccess = useServerFn(getPlatformAccess);
  const { data } = useQuery({
    queryKey: ["platform-access"],
    queryFn: () => loadAccess(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const items = [
    ...links,
    ...(data?.isPlatformAdmin
      ? ([{ label: "Pilot signups", to: "/pilot-signups", icon: Sparkles }] as const)
      : []),
  ];

  return (
    <nav
      aria-label="Account settings"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {items.map((item) => (
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
