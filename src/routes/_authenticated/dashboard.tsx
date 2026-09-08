import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Filter,
  Plus,
  Send,
  UserRound,
  Copy,
} from "lucide-react";
import { useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { Panel, StatusBadge, btn, inputClass } from "@/components/app/ui";
import { getCommandCenter, sendRequestFollowUp } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Daily compliance work queue | CertKeep" },
      {
        name: "description",
        content:
          "Prioritize document reviews, follow-ups, expirations, and upcoming project starts.",
      },
      { property: "og:title", content: "Daily compliance work queue | CertKeep" },
      {
        property: "og:description",
        content: "Your prioritized subcontractor document work for today.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const DAY = 86400000;
const shortDate = (date: string | null) =>
  date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : "No date";
const relativeDay = (date: string | null) => {
  if (!date) return "Date not set";
  const days = Math.ceil((new Date(`${date}T12:00:00`).getTime() - Date.now()) / DAY);
  if (days === 0) return "Starts today";
  if (days === 1) return "Starts tomorrow";
  if (days > 1) return `Starts in ${days} days`;
  return `Started ${Math.abs(days)} days ago`;
};

function Metric({
  label,
  value,
  note,
  tone = "neutral",
}: {
  label: string;
  value: number;
  note: string;
  tone?: "neutral" | "warning" | "danger" | "success";
}) {
  const toneClass =
    tone === "danger"
      ? "bg-brand-soft text-brand"
      : tone === "warning"
        ? "bg-warning-soft text-warning"
        : tone === "success"
          ? "bg-success-soft text-success"
          : "bg-surface-muted text-ink";
  return (
    <Panel className="p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-muted-foreground">{label}</p>
        <span className={`h-2 w-2 rounded-full ${toneClass}`} />
      </div>
      <p className="mt-3 font-display text-[28px] font-bold leading-none text-ink">{value}</p>
      <p className="mt-2 text-[10px] text-muted-foreground">{note}</p>
    </Panel>
  );
}

function DashboardPage() {
  const qc = useQueryClient();
  const load = useServerFn(getCommandCenter);
  const followUp = useServerFn(sendRequestFollowUp);
  const { data, isLoading } = useQuery({ queryKey: ["command-center"], queryFn: () => load() });
  const hasStarted = Boolean(
    data?.projects.length || data?.subcontractors.length || data?.requests.length,
  );
  const [project, setProject] = useState("all");
  const [issue, setIssue] = useState("all");
  const [mine, setMine] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyUploadLink(token: string, id: string) {
    const url = `${window.location.origin}/upload/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this upload link", url);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const reminder = useMutation({
    mutationFn: (id: string) => followUp({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["command-center"] }),
  });

  const model = useMemo(() => {
    const subs = data?.subcontractors ?? [];
    const docs = data?.requests ?? [];
    const assignments = data?.assignments ?? [];
    const projects = data?.projects ?? [];
    const requirements = data?.requirements ?? [];
    const nameFor = (id: string) => subs.find((sub) => sub.id === id)?.company ?? "Subcontractor";
    const projectFor = (id: string | null) => projects.find((item) => item.id === id);
    const startFor = (subId: string, projectId: string | null) =>
      assignments.find(
        (item) => item.subcontractor_id === subId && (!projectId || item.project_id === projectId),
      )?.planned_start_date ??
      projectFor(projectId)?.start_date ??
      null;
    const now = Date.now();
    const rows = docs
      .flatMap((doc) => {
        const expiration = doc.expiration_date
          ? new Date(`${doc.expiration_date}T12:00:00`).getTime()
          : null;
        const isExpired = doc.status === "approved" && expiration !== null && expiration < now;
        const isExpiring =
          doc.status === "approved" &&
          expiration !== null &&
          expiration >= now &&
          expiration - now <= 30 * DAY;
        const type =
          doc.status === "submitted"
            ? "review"
            : doc.status === "rejected"
              ? "correction"
              : isExpired
                ? "expired"
                : isExpiring
                  ? "expiring"
                  : doc.status === "pending"
                    ? "missing"
                    : null;
        if (!type) return [];
        const start = startFor(doc.subcontractor_id, doc.project_id);
        const due = doc.due_date ? new Date(`${doc.due_date}T12:00:00`).getTime() : null;
        const startTime = start ? new Date(`${start}T12:00:00`).getTime() : null;
        const priority =
          (startTime && startTime - now <= 7 * DAY ? 0 : 20) +
          (due && due < now ? 0 : 10) +
          (type === "review"
            ? 1
            : type === "expired"
              ? 2
              : type === "correction"
                ? 3
                : type === "missing"
                  ? 4
                  : 5);
        return [
          {
            ...doc,
            type,
            company: nameFor(doc.subcontractor_id),
            projectName: projectFor(doc.project_id)?.name ?? "No project",
            start,
            priority,
          },
        ];
      })
      .sort((a, b) => a.priority - b.priority);
    const filtered = rows.filter(
      (row) =>
        (!mine || row.assigned_to_user_id === data?.currentUserId) &&
        (project === "all" || row.project_id === project) &&
        (issue === "all" || row.type === issue),
    );
    const readySubs = subs.filter((sub) => {
      const mineDocs = docs.filter((doc) => doc.subcontractor_id === sub.id);
      return (
        mineDocs.length > 0 &&
        mineDocs.every(
          (doc) =>
            doc.status === "approved" &&
            (!doc.expiration_date || new Date(`${doc.expiration_date}T12:00:00`).getTime() >= now),
        )
      );
    }).length;
    const upcoming = assignments
      .filter(
        (a) =>
          a.planned_start_date && new Date(`${a.planned_start_date}T12:00:00`).getTime() >= now,
      )
      .sort((a, b) => String(a.planned_start_date).localeCompare(String(b.planned_start_date)))
      .slice(0, 5)
      .map((a) => {
        const projectItem = projects.find((p) => p.id === a.project_id);
        const required = requirements.filter(
          (r) =>
            r.project_id === a.project_id &&
            r.status === "required" &&
            (!r.trade || r.trade === subs.find((s) => s.id === a.subcontractor_id)?.trade),
        );
        const satisfied = required.filter((r) =>
          docs.some(
            (d) =>
              d.subcontractor_id === a.subcontractor_id &&
              d.project_id === a.project_id &&
              d.doc_type === r.document_type &&
              d.status === "approved",
          ),
        ).length;
        return {
          ...a,
          company: nameFor(a.subcontractor_id),
          projectName: projectItem?.name ?? "Project",
          required: required.length,
          satisfied,
        };
      });
    return { rows: filtered, allRows: rows, readySubs, upcoming };
  }, [data, issue, mine, project]);

  const reviewCount = (data?.requests ?? []).filter((d) => d.status === "submitted").length;
  const expiringCount = model.allRows.filter((d) => d.type === "expiring").length;
  const weekActivity = (data?.activity ?? []).filter(
    (e) => Date.now() - new Date(e.created_at).getTime() <= 7 * DAY,
  );
  const approvals = weekActivity.filter((e) => e.event_type === "document.approved").length;

  return (
    <AppShell
      title="Good afternoon"
      subtitle="Here’s the document work that needs attention today."
      actions={
        <div className="flex flex-wrap gap-2">
          <Link to="/subcontractors" search={{ bulk: undefined }} className={btn.ghost}>
            <Plus className="h-4 w-4" />
            Add subcontractor
          </Link>
          <Link to="/subcontractors" search={{ bulk: "request" }} className={btn.primary}>
            <Send className="h-4 w-4" />
            Send requests
          </Link>
        </div>
      }
    >
      {isLoading ? (
        <div className="grid min-h-[420px] place-items-center text-[12px] text-muted-foreground">
          Preparing today’s work…
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              label="Needs action"
              value={model.allRows.length}
              note="Across review, missing, and expiring records"
              tone="danger"
            />
            <Metric
              label="Awaiting review"
              value={reviewCount}
              note="Uploaded and ready for a decision"
              tone="warning"
            />
            <Metric
              label="Expiring within 30 days"
              value={expiringCount}
              note="Approved documents approaching renewal"
            />
            <Metric
              label="Document-ready subcontractors"
              value={model.readySubs}
              note="All tracked requirements satisfied"
              tone="success"
            />
          </div>

          {!hasStarted ? (
            <Panel className="overflow-hidden">
              <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.15fr)] lg:p-7">
                <div>
                  <p className="text-[10px] font-bold tracking-[.12em] text-brand uppercase">
                    Set up today’s queue
                  </p>
                  <h2 className="mt-3 text-[22px]">
                    Turn your first job into an actionable checklist.
                  </h2>
                  <p className="mt-2 max-w-[54ch] text-[12px] leading-5 text-muted-foreground">
                    Add an upcoming project and trade partner, then send the first secure request.
                    CertKeep will prioritize every submission, follow-up, and expiration here.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/onboarding" className={btn.primary}>
                      <Plus className="h-4 w-4" /> Start pilot setup
                    </Link>
                    <Link to="/subcontractors" search={{ bulk: undefined }} className={btn.ghost}>
                      Add subcontractor
                    </Link>
                  </div>
                </div>
                <ol className="grid gap-2 sm:grid-cols-3">
                  {[
                    ["01", "Add the job", "Set the start date that drives priority."],
                    ["02", "Add trade partners", "Record the people and companies on site."],
                    ["03", "Request documents", "Create secure, account-free upload links."],
                  ].map(([number, title, copy]) => (
                    <li
                      key={number}
                      className="rounded-xl border border-border bg-surface-muted p-4"
                    >
                      <span className="text-[10px] font-bold text-brand">{number}</span>
                      <p className="mt-4 text-[12px] font-bold text-ink">{title}</p>
                      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">{copy}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </Panel>
          ) : null}

          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.55fr)_340px]">
            <Panel className="overflow-hidden">
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-[16px]">Needs your attention</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Prioritized by upcoming work, due date, and issue severity
                    </p>
                  </div>
                  <span className="rounded-lg bg-brand-soft px-2.5 py-1 text-[10px] font-bold text-brand">
                    {model.rows.length} open
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-surface-muted text-muted-foreground">
                    <Filter className="h-4 w-4" />
                  </span>
                  <button
                    type="button"
                    className={`${mine ? btn.primary : btn.ghost} h-9 px-3 py-0`}
                    onClick={() => setMine(!mine)}
                  >
                    Assigned to me
                  </button>
                  <select
                    aria-label="Filter by project"
                    className={`${inputClass} h-9 w-auto min-w-[150px] py-0 text-[12px]`}
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                  >
                    <option value="all">All projects</option>
                    {data?.projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="Filter by issue"
                    className={`${inputClass} h-9 w-auto min-w-[140px] py-0 text-[12px]`}
                    value={issue}
                    onChange={(e) => setIssue(e.target.value)}
                  >
                    <option value="all">All issue types</option>
                    <option value="review">Awaiting review</option>
                    <option value="missing">Missing</option>
                    <option value="correction">Correction</option>
                    <option value="expired">Expired</option>
                    <option value="expiring">Expiring</option>
                  </select>
                </div>
              </div>
              {model.rows.length ? (
                <div className="divide-y divide-border">
                  {model.rows.slice(0, 10).map((row) => {
                    const member = data?.members.find((m) => m.user_id === row.assigned_to_user_id);
                    const status =
                      row.type === "review"
                        ? "submitted"
                        : row.type === "expired"
                          ? "expired"
                          : row.type === "expiring"
                            ? "expiring"
                            : row.status;
                    return (
                      <div
                        key={row.id}
                        className="grid gap-4 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_150px_auto] lg:items-center"
                      >
                        <div className="flex min-w-0 gap-3">
                          <span
                            className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg ${row.type === "review" ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"}`}
                          >
                            {row.type === "review" ? (
                              <FileCheck2 className="h-4 w-4" />
                            ) : (
                              <AlertTriangle className="h-4 w-4" />
                            )}
                          </span>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-ink">{row.company}</p>
                              <StatusBadge kind={status} />
                            </div>
                            <p className="mt-1 text-[12px] text-ink">{row.doc_type}</p>
                            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
                              {row.start ? `${relativeDay(row.start)} on ${row.projectName}. ` : ""}
                              {row.type === "review"
                                ? "A submitted document needs a decision."
                                : row.type === "correction"
                                  ? "A correction is still outstanding."
                                  : row.type === "expired"
                                    ? "The current document has expired."
                                    : row.type === "expiring"
                                      ? `Expires ${shortDate(row.expiration_date)}.`
                                      : "The requested document has not been submitted."}
                            </p>
                          </div>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          <p className="flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5" />
                            {member?.display_name ||
                              member?.email ||
                              (row.assigned_to_user_id === data?.currentUserId
                                ? "You"
                                : "Unassigned")}
                          </p>
                          <p className="mt-1.5 flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {row.due_date ? `Due ${shortDate(row.due_date)}` : "No due date"}
                          </p>
                        </div>
                        {row.type === "review" ? (
                          <Link to="/review" search={{ document: row.id }} className={btn.primary}>
                            Review <ArrowRight className="h-4 w-4" />
                          </Link>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {row.token ? (
                              <button
                                type="button"
                                className={btn.ghost}
                                onClick={() => copyUploadLink(row.token, row.id)}
                              >
                                <Copy className="h-4 w-4" />
                                {copiedId === row.id ? "Copied" : "Copy upload link"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              className={btn.ghost}
                              disabled={reminder.isPending}
                              onClick={() => reminder.mutate(row.id)}
                            >
                              <Send className="h-4 w-4" />
                              Follow up
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : hasStarted ? (
                <div className="grid min-h-[250px] place-items-center px-6 text-center">
                  <div>
                    <CheckCircle2 className="mx-auto h-8 w-8 text-success" />
                    <p className="mt-3 font-bold text-ink">You’re caught up</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      No work matches these filters.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="px-5 py-6 text-[11px] text-muted-foreground">
                  Your prioritized work will appear here after the first document request.
                </div>
              )}
            </Panel>

            <div className="space-y-5">
              <Panel className="overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-[15px]">Upcoming starts</h2>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Document readiness before field work
                  </p>
                </div>
                {model.upcoming.length ? (
                  <div className="divide-y divide-border">
                    {model.upcoming.map((item) => (
                      <Link
                        key={item.id}
                        to="/projects/$id"
                        params={{ id: item.project_id }}
                        className="block px-5 py-4 hover:bg-surface-muted/60"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[12px] font-bold text-ink">{item.company}</p>
                            <p className="mt-0.5 text-[10px] text-muted-foreground">
                              {item.projectName} · {relativeDay(item.planned_start_date)}
                            </p>
                          </div>
                          <span
                            className={`rounded-full px-2 py-1 text-[9px] font-bold ${item.required > 0 && item.satisfied === item.required ? "bg-success-soft text-success" : "bg-brand-soft text-brand"}`}
                          >
                            {item.satisfied}/{item.required} satisfied
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    to="/projects"
                    className="flex items-center justify-between px-5 py-5 hover:bg-surface-muted"
                  >
                    <span className="text-[11px] font-semibold text-ink">
                      Plan an upcoming start
                    </span>
                    <ArrowRight className="h-4 w-4 text-brand" />
                  </Link>
                )}
              </Panel>
              <Panel className="overflow-hidden">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-[15px]">Scheduled reminders</h2>
                </div>
                <div className="divide-y divide-border">
                  {(data?.reminders ?? [])
                    .filter((r) => r.status === "scheduled")
                    .slice(0, 4)
                    .map((r) => (
                      <div key={r.id} className="flex gap-3 px-5 py-3.5">
                        <Clock3 className="mt-0.5 h-4 w-4 text-warning" />
                        <div>
                          <p className="text-[11px] font-bold text-ink">Follow-up scheduled</p>
                          <p className="mt-0.5 text-[9px] text-muted-foreground">
                            {r.scheduled_for
                              ? new Date(r.scheduled_for).toLocaleString(undefined, {
                                  month: "short",
                                  day: "numeric",
                                  hour: "numeric",
                                })
                              : "Date pending"}
                          </p>
                        </div>
                      </div>
                    ))}
                  {!(data?.reminders ?? []).some((r) => r.status === "scheduled") ? (
                    <Link
                      to="/subcontractors"
                      search={{ bulk: "request" }}
                      className="flex items-center justify-between px-5 py-5 hover:bg-surface-muted"
                    >
                      <span className="text-[11px] font-semibold text-ink">
                        Send a request to schedule follow-up
                      </span>
                      <ArrowRight className="h-4 w-4 text-brand" />
                    </Link>
                  ) : null}
                </div>
              </Panel>
            </div>
          </div>

          <Panel className="overflow-hidden">
            <div className="grid gap-5 border-b border-border px-5 py-5 md:grid-cols-[1fr_auto]">
              <div>
                <p className="text-[10px] font-bold tracking-[.12em] text-muted-foreground uppercase">
                  This week
                </p>
                <h2 className="mt-2 text-[18px]">
                  {approvals} documents approved ·{" "}
                  {weekActivity.filter((e) => e.event_type === "request.follow_up").length}{" "}
                  follow-ups recorded · {model.readySubs} checklists complete
                </h2>
              </div>
              <Link to="/review" search={{ document: undefined }} className={btn.ghost}>
                Open completed work
              </Link>
            </div>
            <div className="grid md:grid-cols-3">
              {(data?.activity ?? []).slice(0, 6).map((event) => (
                <div
                  key={event.id}
                  className="border-b border-border px-5 py-4 md:border-b-0 md:border-r last:border-0"
                >
                  <p className="text-[11px] font-bold text-ink">{event.title}</p>
                  <p className="mt-1 text-[9px] text-muted-foreground">
                    {new Date(event.created_at).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    {event.detail ? ` · ${event.detail}` : ""}
                  </p>
                </div>
              ))}
              {!(data?.activity ?? []).length ? (
                <div className="px-5 py-5 text-[11px] text-muted-foreground md:col-span-3">
                  Completed reviews, requests, and project changes will build your audit trail here.
                </div>
              ) : null}
            </div>
          </Panel>
        </div>
      )}
    </AppShell>
  );
}
