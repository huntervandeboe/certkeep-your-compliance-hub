import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[18px] border border-black/[0.065] bg-surface shadow-[0_1px_2px_rgba(17,24,39,0.03),0_12px_32px_-28px_rgba(17,24,39,0.22)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function PanelHead({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4.5">
      <div className="min-w-0">
        <h2 className="text-[15px] leading-tight font-bold text-ink">{title}</h2>
        {subtitle ? <p className="mt-1 text-[12px] text-[#7b8190]">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

const statusMap = {
  pending: { label: "Awaiting upload", cls: "bg-surface-muted text-[#4b5563]" },
  submitted: { label: "Needs review", cls: "bg-warning-soft text-warning" },
  approved: { label: "Approved", cls: "bg-success-soft text-success" },
  rejected: { label: "Rejected", cls: "bg-brand-soft text-brand-hover" },
  expired: { label: "Expired", cls: "bg-brand-soft text-brand-hover" },
  expiring: { label: "Expiring soon", cls: "bg-warning-soft text-warning" },
} as const;

export type BadgeKind = keyof typeof statusMap;

export function StatusBadge({ kind, className }: { kind: BadgeKind; className?: string }) {
  const s = statusMap[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap",
        s.cls,
        className,
      )}
    >
      {s.label}
    </span>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-[14px] font-semibold text-ink">
        {label}
      </label>
      {hint ? <p className="mt-0.5 text-[13px] text-[#6b7280]">{hint}</p> : null}
      <div className="mt-2">{children}</div>
      {error ? (
        <p className="mt-1.5 text-[13px] font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-[#9ca3af] focus:border-brand focus:ring-2 focus:ring-brand/15 disabled:opacity-60";

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_20px_-10px_rgba(240,90,40,.7)] transition-all hover:-translate-y-px hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60",
  ghost:
    "inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-[13px] font-bold text-ink transition-colors hover:border-ink/25 hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60",
  subtle:
    "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-[14px] font-semibold text-[#4b5563] transition-colors hover:bg-surface-muted hover:text-ink",
};

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="px-6 py-14 text-center">
      <p className="text-[16px] font-bold text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-[46ch] text-[14px] leading-relaxed text-[#6b7280]">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
