import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, Panel, PanelHead, StatusBadge, btn } from "@/components/app/ui";
import type { BadgeKind } from "@/components/app/ui";
import { getWorkspace } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/review")({
  component: ReviewPage,
  head: () => ({
    meta: [
      { title: "Document review | CertKeep" },
      {
        name: "description",
        content: "Review documents your subcontractors uploaded and approve or reject them.",
      },
      { property: "og:title", content: "Document review | CertKeep" },
      {
        property: "og:description",
        content: "Approve or reject subcontractor compliance documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function ReviewPage() {
  const fetchWorkspace = useServerFn(getWorkspace);
  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const subs = data?.subcontractors ?? [];
  const requests = (data?.requests ?? []).filter((r) => r.status !== "pending");
  const nameFor = (id: string) => subs.find((s) => s.id === id)?.company ?? "Subcontractor";

  return (
    <AppShell title="Document review" subtitle="Everything that has been uploaded">
      <Panel>
        <PanelHead title="Uploaded documents" subtitle={`${requests.length} total`} />
        {isLoading ? (
          <p className="px-6 py-8 text-[15px] text-[#6b7280]">Loading...</p>
        ) : requests.length === 0 ? (
          <EmptyState
            title="Nothing uploaded yet"
            body="Send an upload link from a subcontractor's page. Everything they submit shows up here."
          />
        ) : (
          <ul className="divide-y divide-border">
            {requests.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-semibold text-ink">
                    {nameFor(r.subcontractor_id)}
                  </p>
                  <p className="truncate text-[13px] text-[#6b7280]">
                    {r.doc_type}
                    {r.expiration_date ? ` · expires ${r.expiration_date}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge kind={r.status as BadgeKind} />
                  <Link
                    to="/subcontractors/$id"
                    params={{ id: r.subcontractor_id }}
                    className={btn.ghost}
                  >
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </AppShell>
  );
}
