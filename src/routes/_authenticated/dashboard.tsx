import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, Panel, PanelHead, StatusBadge, btn } from "@/components/app/ui";
import { getWorkspace } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Compliance overview | CertKeep" },
      {
        name: "description",
        content:
          "See compliance status, documents awaiting review, and upcoming expirations across your subcontractors.",
      },
      { property: "og:title", content: "Compliance overview | CertKeep" },
      {
        property: "og:description",
        content: "Track subcontractor documents, reviews, and expirations in one board.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Stat({
  value,
  label,
  accent,
}: {
  value: string;
  label: string;
  accent?: string | undefined;
}) {
  return (
    <Panel className="px-5 py-4">
      <p className={`text-[28px] leading-none font-extrabold ${accent ?? "text-ink"}`}>{value}</p>
      <p className="mt-2 text-[13px] font-medium text-[#6b7280]">{label}</p>
    </Panel>
  );
}

function DashboardPage() {
  const fetchWorkspace = useServerFn(getWorkspace);
  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const subs = data?.subcontractors ?? [];
  const requests = data?.requests ?? [];

  const approved = requests.filter((r) => r.status === "approved");
  const needsReview = requests.filter((r) => r.status === "submitted");
  const pending = requests.filter((r) => r.status === "pending");
  const score = requests.length
    ? Math.round((approved.length / requests.length) * 100)
    : 0;

  const soon = approved.filter((r) => {
    if (!r.expiration_date) return false;
    const days = (new Date(r.expiration_date).getTime() - Date.now()) / 86400000;
    return days <= 30;
  });

  const nameFor = (id: string) => subs.find((s) => s.id === id)?.company ?? "Subcontractor";

  return (
    <AppShell
      title={`Compliance overview`}
      subtitle={data?.profile.company_name ?? "Your subcontractor documents at a glance"}
      actions={
        <Link to="/subcontractors" className={btn.primary}>
          Add subcontractor
        </Link>
      }
    >
      {isLoading ? (
        <p className="text-[15px] text-[#6b7280]">Loading your board...</p>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Panel className="col-span-2 px-5 py-4 lg:col-span-1">
              <div className="flex items-baseline gap-1.5">
                <p className="text-[28px] leading-none font-extrabold text-ink">{score}%</p>
                <ArrowUpRight className="h-4 w-4 text-success" />
              </div>
              <p className="mt-2 text-[13px] font-medium text-[#6b7280]">Approved documents</p>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-success" style={{ width: `${score}%` }} />
              </div>
            </Panel>
            <Stat value={String(subs.length)} label="Subcontractors" />
            <Stat
              value={String(needsReview.length)}
              label="Waiting on your review"
              accent={needsReview.length ? "text-warning" : undefined}
            />
            <Stat
              value={String(pending.length)}
              label="Awaiting upload"
              accent={pending.length ? "text-brand" : undefined}
            />
          </div>

          <Panel>
            <PanelHead
              title="Needs your review"
              subtitle="Documents subcontractors have uploaded"
              action={
                <Link to="/review" className={btn.ghost}>
                  Open review queue
                </Link>
              }
            />
            {needsReview.length === 0 ? (
              <EmptyState
                title="Nothing waiting"
                body="When a subcontractor uploads a document through their link, it lands here for approval."
              />
            ) : (
              <ul className="divide-y divide-border">
                {needsReview.slice(0, 5).map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {nameFor(r.subcontractor_id)}
                      </p>
                      <p className="truncate text-[13px] text-[#6b7280]">{r.doc_type}</p>
                    </div>
                    <Link
                      to="/subcontractors/$id"
                      params={{ id: r.subcontractor_id }}
                      className={btn.ghost}
                    >
                      Review
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel>
            <PanelHead title="Expiring within 30 days" />
            {soon.length === 0 ? (
              <EmptyState
                title="No upcoming expirations"
                body="Approved documents with an expiration date inside 30 days will show up here."
              />
            ) : (
              <ul className="divide-y divide-border">
                {soon.map((r) => (
                  <li key={r.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {nameFor(r.subcontractor_id)}
                      </p>
                      <p className="truncate text-[13px] text-[#6b7280]">
                        {r.doc_type} · expires {r.expiration_date}
                      </p>
                    </div>
                    <StatusBadge kind="expiring" />
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
