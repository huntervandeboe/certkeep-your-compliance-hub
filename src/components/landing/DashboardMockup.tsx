import { ArrowUpRight, Send } from "lucide-react";

import { cn } from "@/lib/utils";

type Status = "Current" | "Expiring" | "Missing" | "Pending Review";

const statusStyles: Record<Status, string> = {
  Current: "bg-success-soft text-success",
  Expiring: "bg-warning-soft text-warning",
  Missing: "bg-brand-soft text-brand-hover",
  "Pending Review": "bg-surface-muted text-[#4b5563]",
};

export function StatusPill({ status, className }: { status: Status; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}

const rows: { company: string; trade: string; status: Status }[] = [
  { company: "Apex Electrical", trade: "Electrical", status: "Current" },
  { company: "Northline Concrete", trade: "Concrete", status: "Expiring" },
  { company: "Summit Fire Systems", trade: "Fire protection", status: "Missing" },
  { company: "Redgate Roofing", trade: "Roofing", status: "Pending Review" },
];

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-background px-3 py-2.5">
      <p className="text-[19px] leading-tight font-extrabold text-ink">{value}</p>
      <p className="mt-0.5 text-[12px] font-medium text-[#6b7280]">{label}</p>
    </div>
  );
}

export function DashboardMockup() {
  return (
    <div className="animate-rise-in rounded-2xl border border-border bg-surface p-4 shadow-[0_30px_60px_-40px_rgba(17,24,39,0.5)] transition-transform duration-300 hover:-translate-y-1 sm:p-5">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <p className="text-[12px] font-bold tracking-[0.12em] text-[#6b7280] uppercase">
            Compliance board
          </p>
          <p className="truncate text-[15px] font-bold text-ink">Riverside Medical Office</p>
        </div>
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-[13px] font-semibold text-white"
        >
          <Send className="h-3.5 w-3.5" />
          Send upload link
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-4">
        <div className="col-span-2 rounded-xl border border-border bg-background px-3 py-2.5 sm:col-span-1">
          <div className="flex items-baseline gap-1.5">
            <p className="text-[19px] leading-tight font-extrabold text-ink">84%</p>
            <ArrowUpRight className="h-3.5 w-3.5 text-success" />
          </div>
          <p className="mt-0.5 text-[12px] font-medium text-[#6b7280]">Compliance score</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div className="h-full w-[84%] rounded-full bg-success" />
          </div>
        </div>
        <Stat value="24" label="Subcontractors" />
        <Stat value="3" label="Expiring soon" />
        <Stat value="2" label="Missing documents" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full border-collapse text-left">
          <caption className="sr-only">Example subcontractor compliance table</caption>
          <thead>
            <tr className="bg-surface-muted">
              <th className="px-3 py-2 text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase">
                Subcontractor
              </th>
              <th className="hidden px-3 py-2 text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase sm:table-cell">
                Trade
              </th>
              <th className="px-3 py-2 text-right text-[12px] font-semibold tracking-wide text-[#6b7280] uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.company} className="border-t border-border">
                <td className="px-3 py-3 text-[14px] font-semibold text-ink">
                  {row.company}
                  <span className="block text-[12px] font-medium text-[#6b7280] sm:hidden">
                    {row.trade}
                  </span>
                </td>
                <td className="hidden px-3 py-3 text-[14px] text-[#374151] sm:table-cell">
                  {row.trade}
                </td>
                <td className="px-3 py-3 text-right">
                  <StatusPill status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
