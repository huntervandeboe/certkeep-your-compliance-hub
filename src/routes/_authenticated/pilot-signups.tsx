import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { Download, Mail, Search } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { SettingsNav } from "@/components/app/SettingsNav";
import { EmptyState, Panel, PanelHead, btn, inputClass } from "@/components/app/ui";
import { listPilotApplications, updatePilotApplication } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/pilot-signups")({
  component: PilotSignupsPage,
  head: () => ({
    meta: [
      { title: "Pilot signups | CertKeep" },
      { name: "description", content: "See which contractors applied to the CertKeep pilot." },
      { property: "og:title", content: "Pilot signups | CertKeep" },
      {
        property: "og:description",
        content: "See which contractors applied to the CertKeep pilot.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const STATUSES = ["new", "contacted", "onboarded", "declined"] as const;

const statusStyle: Record<string, string> = {
  new: "bg-brand-soft text-brand-hover",
  contacted: "bg-surface-muted text-ink",
  onboarded: "bg-success-soft text-success",
  declined: "bg-surface-muted text-muted-foreground",
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function PilotSignupsPage() {
  const load = useServerFn(listPilotApplications);
  const save = useServerFn(updatePilotApplication);
  const qc = useQueryClient();

  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["pilot-applications"],
    queryFn: () => load(),
    retry: false,
  });

  const update = useMutation({
    mutationFn: (input: { id: string; status?: (typeof STATUSES)[number]; notes?: string }) =>
      save({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pilot-applications"] }),
  });

  const rows = useMemo(() => {
    const list = data ?? [];
    const needle = q.trim().toLowerCase();
    return list.filter((row) => {
      const status = row.status ?? "new";
      if (filter !== "all" && status !== filter) return false;
      if (!needle) return true;
      return [row.full_name, row.company, row.work_email, row.state]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(needle));
    });
  }, [data, q, filter]);

  function exportCsv() {
    const header = [
      "Signed up",
      "Name",
      "Company",
      "Email",
      "Phone",
      "State",
      "Job title",
      "Subcontractors",
      "Tracking today",
      "Biggest problem",
      "Status",
    ];
    const body = rows.map((r) => [
      r.created_at,
      r.full_name,
      r.company,
      r.work_email,
      r.phone ?? "",
      r.state ?? "",
      r.job_title ?? "",
      r.subcontractor_count ?? "",
      r.tracking_method ?? "",
      (r.biggest_problem ?? "").replace(/\s+/g, " "),
      r.status ?? "new",
    ]);
    const csv = [header, ...body]
      .map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "certkeep-pilot-signups.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <AppShell title="Pilot signups" subtitle="Contractors who applied to the pilot">
        <Panel className="p-6">
          <EmptyState
            title="This list is not available for your account"
            body="Only the CertKeep account owner can view pilot applications."
          />
        </Panel>
      </AppShell>
    );
  }

  const counts = STATUSES.map((s) => ({
    status: s,
    count: (data ?? []).filter((r) => (r.status ?? "new") === s).length,
  }));

  return (
    <AppShell title="Pilot signups" subtitle="Contractors who applied to the pilot">
      <div className="space-y-5">
        <Panel className="overflow-hidden">
          <SettingsNav />
          <div className="grid gap-3 p-6 sm:grid-cols-4">
            {counts.map((c) => (
              <div key={c.status} className="rounded-xl border border-border bg-surface-muted p-4">
                <p className="text-[10px] font-bold tracking-[.1em] text-muted-foreground uppercase">
                  {c.status}
                </p>
                <p className="mt-2 text-[26px] font-bold text-ink">{c.count}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel>
          <PanelHead
            title="Applications"
            subtitle={`${rows.length} shown`}
            action={
              <button className={btn.ghost} onClick={exportCsv} disabled={rows.length === 0}>
                <Download className="h-4 w-4" />
                Export CSV
              </button>
            }
          />

          <div className="flex flex-wrap items-center gap-2 border-b border-border px-5 py-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, company, email"
                aria-label="Search pilot signups"
                className={`${inputClass} pl-9`}
              />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter by status"
              className={`${inputClass} w-auto`}
            >
              <option value="all">All statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="p-6 text-[12px] text-muted-foreground">Loading pilot signups...</p>
          ) : rows.length === 0 ? (
            <div className="p-6">
              <EmptyState
                title="No signups yet"
                body="Applications from the pilot form on your website will appear here as soon as they arrive."
              />
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {rows.map((row) => {
                const status = row.status ?? "new";
                return (
                  <li key={row.id} className="grid gap-3 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[14px] font-bold text-ink">{row.company}</p>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[status]}`}
                        >
                          {status}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          signed up {formatDate(row.created_at)}
                        </span>
                      </div>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {row.full_name}
                        {row.job_title ? ` · ${row.job_title}` : ""}
                        {row.state ? ` · ${row.state}` : ""}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[12px]">
                        <a
                          href={`mailto:${row.work_email}`}
                          className="flex items-center gap-1.5 font-semibold text-brand"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {row.work_email}
                        </a>
                        {row.phone ? (
                          <span className="text-muted-foreground">{row.phone}</span>
                        ) : null}
                      </div>
                      {row.subcontractor_count || row.tracking_method ? (
                        <p className="mt-2 text-[12px] text-muted-foreground">
                          {row.subcontractor_count ? `${row.subcontractor_count} subs` : ""}
                          {row.subcontractor_count && row.tracking_method ? " · " : ""}
                          {row.tracking_method ? `tracks with ${row.tracking_method}` : ""}
                        </p>
                      ) : null}
                      {row.biggest_problem ? (
                        <p className="mt-2 rounded-xl bg-surface-muted px-3.5 py-3 text-[12px] leading-5 text-ink">
                          {row.biggest_problem}
                        </p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <select
                        value={status}
                        aria-label={`Status for ${row.company}`}
                        onChange={(e) =>
                          update.mutate({
                            id: row.id,
                            status: e.target.value as (typeof STATUSES)[number],
                          })
                        }
                        className={inputClass}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <textarea
                        defaultValue={row.notes ?? ""}
                        placeholder="Notes for follow-up"
                        aria-label={`Notes for ${row.company}`}
                        rows={3}
                        onBlur={(e) => {
                          if ((row.notes ?? "") !== e.target.value)
                            update.mutate({ id: row.id, notes: e.target.value });
                        }}
                        className={inputClass}
                      />
                      {row.contacted_at ? (
                        <p className="text-[11px] text-muted-foreground">
                          Contacted {formatDate(row.contacted_at)}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
