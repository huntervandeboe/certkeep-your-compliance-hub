import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileCheck2,
  FolderKanban,
  Plus,
  Send,
  ShieldCheck,
  Users,
} from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Panel, StatusBadge, btn } from "@/components/app/ui";
import { getCommandCenter } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Compliance command center | CertKeep" }] }),
});

function Metric({
  icon: Icon,
  value,
  label,
  detail,
  tone = "ink",
}: {
  icon: typeof Users;
  value: string;
  label: string;
  detail: string;
  tone?: "ink" | "orange" | "amber";
}) {
  const colors =
    tone === "orange"
      ? "bg-brand-soft text-brand"
      : tone === "amber"
        ? "bg-warning-soft text-warning"
        : "bg-[#eef0f3] text-ink";
  return (
    <Panel className="p-4.5">
      <div className="flex items-start justify-between">
        <span className={`grid h-8 w-8 place-items-center rounded-[10px] ${colors}`}>
          <Icon className="h-4 w-4" />
        </span>
        <ArrowUpRight className="h-3.5 w-3.5 text-[#b2b6bf]" />
      </div>
      <p className="mt-4 font-display text-[26px] font-bold leading-none tracking-[-.05em] text-ink">
        {value}
      </p>
      <p className="mt-2 text-[12px] font-bold text-ink">{label}</p>
      <p className="mt-1 text-[10px] text-[#8b91a0]">{detail}</p>
    </Panel>
  );
}

function DashboardPage() {
  const fetchDashboard = useServerFn(getCommandCenter);
  const { data, isLoading } = useQuery({
    queryKey: ["command-center"],
    queryFn: () => fetchDashboard(),
  });
  const subs = data?.subcontractors ?? [];
  const docs = data?.requests ?? [];
  const approved = docs.filter((item) => item.status === "approved");
  const review = docs.filter((item) => item.status === "submitted");
  const missing = docs.filter((item) => item.status === "pending" || item.status === "rejected");
  const expired = approved.filter(
    (item) => item.expiration_date && new Date(item.expiration_date).getTime() < Date.now(),
  );
  const expiring = approved.filter(
    (item) =>
      item.expiration_date &&
      new Date(item.expiration_date).getTime() >= Date.now() &&
      new Date(item.expiration_date).getTime() - Date.now() <= 30 * 86400000,
  );
  const score = docs.length ? Math.round((approved.length / docs.length) * 100) : 0;
  const nameFor = (id: string) => subs.find((sub) => sub.id === id)?.company ?? "Subcontractor";
  const setup = [subs.length > 0, (data?.projects.length ?? 0) > 0, docs.length > 0];
  const setupDone = setup.filter(Boolean).length;

  return (
    <AppShell
      title="Compliance command center"
      subtitle={`${data?.workspace.name ?? "Your workspace"} · Portfolio-wide risk and document operations`}
      actions={
        <Link to="/subcontractors" className={btn.primary}>
          <Plus className="h-4 w-4" />
          Add subcontractor
        </Link>
      }
    >
      {isLoading ? (
        <div className="grid min-h-[420px] place-items-center">
          <div className="text-center">
            <span className="mx-auto block h-6 w-6 animate-spin rounded-full border-2 border-brand border-t-transparent" />
            <p className="mt-3 text-[12px] text-[#7b8190]">Preparing your command center…</p>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric
              icon={ShieldCheck}
              value={`${score}%`}
              label="Portfolio compliance"
              detail={
                docs.length
                  ? `${approved.length} of ${docs.length} documents approved`
                  : "Add requirements to establish a baseline"
              }
            />
            <Metric
              icon={FileCheck2}
              value={String(review.length)}
              label="Awaiting review"
              detail={review.length ? "Ready for your decision" : "Your review queue is clear"}
              tone="amber"
            />
            <Metric
              icon={CircleAlert}
              value={String(missing.length + expired.length)}
              label="Open compliance gaps"
              detail={`${missing.length} missing or rejected · ${expired.length} expired`}
              tone="orange"
            />
            <Metric
              icon={CalendarClock}
              value={String(expiring.length)}
              label="Expiring in 30 days"
              detail="Approved documents approaching renewal"
            />
          </div>

          {setupDone < 3 ? (
            <Panel className="overflow-hidden bg-ink text-white">
              <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_.9fr]">
                <div>
                  <span className="inline-flex rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold tracking-[.12em] text-white/65 uppercase">
                    Workspace setup
                  </span>
                  <h2 className="mt-4 max-w-[520px] text-[22px] text-white sm:text-[25px]">
                    Build your compliance system, not another spreadsheet.
                  </h2>
                  <p className="mt-2 max-w-[560px] text-[12px] leading-5 text-white/55">
                    Set up a project, add your trade partners, then send secure document requests.
                    CertKeep will surface the work that needs attention here.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/projects" className={btn.primary}>
                      Continue setup <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      to="/subcontractors"
                      className="inline-flex items-center rounded-xl border border-white/15 px-4 py-2.5 text-[13px] font-bold text-white hover:bg-white/10"
                    >
                      Add a company
                    </Link>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/[.055] p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-[11px] font-bold text-white">Launch checklist</p>
                    <span className="text-[10px] text-white/40">{setupDone}/3 complete</span>
                  </div>
                  {[
                    { done: setup[0], label: "Add your first subcontractor" },
                    { done: setup[1], label: "Create an active project" },
                    { done: setup[2], label: "Send a document request" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 border-t border-white/10 py-3 first:border-0"
                    >
                      <span
                        className={`grid h-6 w-6 place-items-center rounded-full ${item.done ? "bg-success text-white" : "border border-white/20 text-white/30"}`}
                      >
                        {item.done ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        )}
                      </span>
                      <span
                        className={`text-[11px] font-semibold ${item.done ? "text-white/45 line-through" : "text-white"}`}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          ) : null}

          <div className="grid gap-5 xl:grid-cols-[1.55fr_.85fr]">
            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/[.06] px-5 py-4">
                <div>
                  <h2 className="text-[15px]">Action queue</h2>
                  <p className="mt-1 text-[11px] text-[#8b91a0]">
                    Highest-priority compliance work
                  </p>
                </div>
                <Link to="/review" className="text-[11px] font-bold text-brand">
                  View all
                </Link>
              </div>
              {review.length + missing.length === 0 ? (
                <div className="grid min-h-[230px] place-items-center px-6 text-center">
                  <div>
                    <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-success-soft text-success">
                      <CheckCircle2 className="h-5 w-5" />
                    </span>
                    <p className="mt-3 text-[13px] font-bold text-ink">No urgent document work</p>
                    <p className="mt-1 max-w-[38ch] text-[11px] leading-5 text-[#8b91a0]">
                      New uploads, rejected files, and missing requirements will be prioritized
                      here.
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  {[...review, ...missing].slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      to="/subcontractors/$id"
                      params={{ id: item.subcontractor_id }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-black/[.05] px-5 py-3.5 last:border-0 hover:bg-[#fafafa]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <span
                          className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${item.status === "submitted" ? "bg-warning-soft text-warning" : "bg-brand-soft text-brand"}`}
                        >
                          <FileCheck2 className="h-4 w-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-ink">
                            {nameFor(item.subcontractor_id)}
                          </p>
                          <p className="truncate text-[10px] text-[#8b91a0]">{item.doc_type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge kind={item.status} />
                        <ChevronRight className="h-4 w-4 text-[#b5bac3]" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Panel>

            <Panel className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-[15px]">Compliance posture</h2>
                  <p className="mt-1 text-[11px] text-[#8b91a0]">Current document status</p>
                </div>
                <span className="rounded-lg bg-[#f4f5f6] px-2 py-1 text-[9px] font-bold text-[#6b7280]">
                  LIVE
                </span>
              </div>
              <div className="my-6 flex items-center justify-center">
                <div
                  className="relative grid h-36 w-36 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(#167a5a 0 ${score}%, #f05a28 ${score}% ${Math.min(100, score + (review.length / Math.max(1, docs.length)) * 100)}%, #ebecef 0)`,
                  }}
                >
                  <div className="grid h-[104px] w-[104px] place-items-center rounded-full bg-white text-center">
                    <div>
                      <p className="font-display text-[27px] font-bold leading-none text-ink">
                        {score}%
                      </p>
                      <p className="mt-1 text-[9px] font-bold text-[#8b91a0] uppercase">
                        Compliant
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 border-t border-black/[.06] pt-4">
                {[
                  ["Approved", approved.length, "bg-success"],
                  ["Review", review.length, "bg-warning"],
                  ["Open", missing.length + expired.length, "bg-brand"],
                ].map(([label, value, color]) => (
                  <div key={String(label)}>
                    <div className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
                      <span className="text-[9px] font-bold text-[#8b91a0]">{label}</span>
                    </div>
                    <p className="mt-1 text-[16px] font-bold text-ink">{value}</p>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
            <Panel className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/[.06] px-5 py-4">
                <div>
                  <h2 className="text-[15px]">Project health</h2>
                  <p className="mt-1 text-[11px] text-[#8b91a0]">Compliance across active jobs</p>
                </div>
                <Link to="/projects" className="text-[11px] font-bold text-brand">
                  Manage projects
                </Link>
              </div>
              {data?.projects.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px] text-left">
                    <thead>
                      <tr className="bg-[#fafafa] text-[9px] font-bold tracking-[.08em] text-[#9aa0aa] uppercase">
                        <th className="px-5 py-3">Project</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Requirements</th>
                        <th className="px-4 py-3">Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.projects.slice(0, 5).map((project) => (
                        <tr key={project.id} className="border-t border-black/[.05]">
                          <td className="px-5 py-3.5">
                            <p className="text-[12px] font-bold text-ink">{project.name}</p>
                            <p className="text-[9px] text-[#9aa0aa]">
                              {project.code || "No project code"}
                            </p>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="inline-flex rounded-full bg-success-soft px-2 py-1 text-[9px] font-bold capitalize text-success">
                              {project.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] font-semibold text-ink">
                            {data.requirements.filter((r) => r.project_id === project.id).length}
                          </td>
                          <td className="px-4 py-3.5 text-[10px] text-[#7b8190]">
                            {project.location || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex min-h-[190px] items-center justify-center px-5 text-center">
                  <div>
                    <FolderKanban className="mx-auto h-5 w-5 text-[#b5bac3]" />
                    <p className="mt-3 text-[12px] font-bold text-ink">No projects yet</p>
                    <p className="mt-1 text-[10px] text-[#8b91a0]">
                      Create a job to track project-level compliance.
                    </p>
                    <Link
                      to="/projects"
                      className="mt-3 inline-flex text-[11px] font-bold text-brand"
                    >
                      Create a project <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </Panel>
            <Panel className="overflow-hidden">
              <div className="border-b border-black/[.06] px-5 py-4">
                <h2 className="text-[15px]">Recent activity</h2>
                <p className="mt-1 text-[11px] text-[#8b91a0]">Workspace events and decisions</p>
              </div>
              {data?.activity.length ? (
                <div className="px-5">
                  {data.activity.map((event) => (
                    <div
                      key={event.id}
                      className="flex gap-3 border-b border-black/[.05] py-3.5 last:border-0"
                    >
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#eef0f3] text-ink">
                        <Clock3 className="h-3.5 w-3.5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold text-ink">{event.title}</p>
                        <p className="mt-0.5 text-[9px] text-[#9297a1]">
                          {new Date(event.created_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                          {event.detail ? ` · ${event.detail}` : ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid min-h-[190px] place-items-center px-5 text-center">
                  <div>
                    <Clock3 className="mx-auto h-5 w-5 text-[#b5bac3]" />
                    <p className="mt-3 text-[12px] font-bold text-ink">Activity starts here</p>
                    <p className="mt-1 text-[10px] text-[#8b91a0]">
                      Project and compliance actions will form your audit trail.
                    </p>
                  </div>
                </div>
              )}
            </Panel>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { icon: FolderKanban, label: "Create project", to: "/projects" },
              { icon: Users, label: "Add subcontractor", to: "/subcontractors" },
              { icon: Send, label: "Request documents", to: "/subcontractors" },
              { icon: Building2, label: "Open vendor roster", to: "/subcontractors" },
            ].map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="group flex items-center gap-3 rounded-[16px] border border-black/[.06] bg-white p-4 shadow-[0_1px_2px_rgba(17,24,39,.03)] hover:border-brand/25"
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#f2f3f5] text-ink group-hover:bg-brand-soft group-hover:text-brand">
                  <item.icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold text-ink">{item.label}</span>
                <ChevronRight className="ml-auto h-4 w-4 text-[#bec2ca]" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
