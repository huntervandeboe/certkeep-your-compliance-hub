import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, ChevronRight, FileText, RotateCcw, Send, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, Panel, StatusBadge, btn, inputClass } from "@/components/app/ui";
import { getCommandCenter, getDocumentUrl, reviewDocumentRequest } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/review")({
  validateSearch: (search: Record<string, unknown>) => ({ document: typeof search["document"] === "string" ? search["document"] : undefined }),
  component: ReviewPage,
  head: () => ({ meta: [{ title: "Fast document review | CertKeep" }, { name: "description", content: "Review subcontractor documents beside project requirements." }, { property: "og:title", content: "Fast document review | CertKeep" }, { property: "og:description", content: "Review and resolve uploaded compliance documents quickly." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
});

function ReviewPage() {
  const search = Route.useSearch();
  const qc = useQueryClient();
  const load = useServerFn(getCommandCenter);
  const open = useServerFn(getDocumentUrl);
  const decide = useServerFn(reviewDocumentRequest);
  const { data, isLoading } = useQuery({ queryKey: ["command-center"], queryFn: () => load() });
  const queue = useMemo(() => (data?.requests ?? []).filter((r) => r.status === "submitted"), [data]);
  const [selectedId, setSelectedId] = useState(search.document);
  const [documentUrl, setDocumentUrl] = useState("");
  const [reason, setReason] = useState("");
  const [correcting, setCorrecting] = useState(false);
  const selected = queue.find((r) => r.id === selectedId) ?? queue[0];

  useEffect(() => {
    if (!selected?.file_path) { setDocumentUrl(""); return; }
    let active = true;
    open({ data: { id: selected.id } }).then((result) => { if (active) setDocumentUrl(result.url); }).catch(() => { if (active) setDocumentUrl(""); });
    return () => { active = false; };
  }, [open, selected?.file_path, selected?.id]);

  const mutation = useMutation({
    mutationFn: (input: { id: string; action: "approve" | "reject"; reason: string }) => decide({ data: input }),
    onSuccess: async () => { setCorrecting(false); setReason(""); setSelectedId(undefined); await qc.invalidateQueries({ queryKey: ["command-center"] }); await qc.invalidateQueries({ queryKey: ["workspace"] }); },
  });
  const sub = data?.subcontractors.find((item) => item.id === selected?.subcontractor_id);
  const project = data?.projects.find((item) => item.id === selected?.project_id);
  const requirement = data?.requirements.find((item) => item.id === selected?.requirement_id) ?? data?.requirements.find((item) => item.project_id === selected?.project_id && item.document_type === selected?.doc_type);

  return <AppShell title="Document review" subtitle={`${queue.length} submission${queue.length === 1 ? "" : "s"} waiting for a decision`}>
    {isLoading ? <p className="text-[12px] text-muted-foreground">Loading review queue…</p> : !selected ? <Panel><EmptyState title="Review queue complete" body="New submissions will appear here with their project requirements and document details." /></Panel> : <div className="grid min-h-[660px] overflow-hidden rounded-[18px] border border-border bg-surface shadow-sm xl:grid-cols-[280px_minmax(360px,1fr)_320px]">
      <aside className="border-b border-border xl:border-b-0 xl:border-r"><div className="border-b border-border px-4 py-4"><p className="text-[11px] font-bold tracking-[.1em] text-muted-foreground uppercase">Review queue</p></div><div className="max-h-[220px] overflow-auto xl:max-h-[600px]">{queue.map((item) => { const company = data?.subcontractors.find((s) => s.id === item.subcontractor_id)?.company ?? "Subcontractor"; return <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`flex w-full items-center gap-3 border-b border-border px-4 py-4 text-left ${item.id === selected.id ? "bg-warning-soft" : "hover:bg-surface-muted"}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-muted text-ink"><FileText className="h-4 w-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-bold text-ink">{company}</span><span className="mt-1 block truncate text-[9px] text-muted-foreground">{item.doc_type}</span></span><ChevronRight className="h-4 w-4 text-muted-foreground" /></button>; })}</div></aside>
      <section className="flex min-h-[460px] flex-col bg-surface-muted/50"><div className="flex items-center justify-between border-b border-border bg-surface px-5 py-3"><div><p className="text-[12px] font-bold text-ink">{selected.file_path ? "Submitted document" : "Document unavailable"}</p><p className="text-[9px] text-muted-foreground">{selected.submitted_at ? `Submitted ${new Date(selected.submitted_at).toLocaleString()}` : ""}</p></div>{documentUrl ? <a href={documentUrl} target="_blank" rel="noreferrer" className={btn.ghost}>Open full size</a> : null}</div>{documentUrl ? <iframe title={`${selected.doc_type} preview`} src={documentUrl} className="min-h-[520px] w-full flex-1 bg-surface" /> : <div className="grid flex-1 place-items-center text-center"><div><FileText className="mx-auto h-10 w-10 text-muted-foreground" /><p className="mt-3 text-[12px] font-bold text-ink">Preview unavailable</p><p className="mt-1 text-[10px] text-muted-foreground">Open the file in a new tab if needed.</p></div></div>}</section>
      <aside className="border-t border-border xl:border-l xl:border-t-0"><div className="space-y-5 p-5"><div><div className="flex items-center justify-between"><StatusBadge kind="submitted" /><span className="text-[9px] font-bold text-muted-foreground">{queue.findIndex((r) => r.id === selected.id) + 1} OF {queue.length}</span></div><h2 className="mt-4 text-[18px]">{selected.doc_type}</h2><p className="mt-1 text-[12px] text-muted-foreground">{sub?.company}</p></div><dl className="grid gap-3 border-y border-border py-4 text-[11px]"><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Project</dt><dd className="text-right font-bold text-ink">{project?.name ?? "Not assigned"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Expires</dt><dd className="text-right font-bold text-ink">{selected.expiration_date ?? "Not provided"}</dd></div><div className="flex justify-between gap-4"><dt className="text-muted-foreground">Due</dt><dd className="text-right font-bold text-ink">{selected.due_date ?? "No due date"}</dd></div></dl><div><p className="text-[10px] font-bold tracking-[.1em] text-muted-foreground uppercase">Requirement</p>{requirement ? <div className="mt-3 space-y-2 text-[11px]"><p className="font-bold text-ink">{requirement.name}</p><p className="text-muted-foreground">Type: {requirement.document_type}</p><p className="text-muted-foreground">Trade: {requirement.trade || "All trades"}</p><p className="text-muted-foreground">Warning window: {requirement.expiration_warning_days} days</p></div> : <p className="mt-2 text-[11px] leading-5 text-muted-foreground">No project-specific requirement is linked. Review against your company’s standard.</p>}</div>{correcting ? <div className="space-y-3"><label className="text-[11px] font-bold text-ink" htmlFor="correction">Correction needed</label><textarea id="correction" className={inputClass} rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Explain what needs to be corrected" /><button type="button" className={`${btn.primary} w-full`} disabled={!reason.trim() || mutation.isPending} onClick={() => mutation.mutate({ id: selected.id, action: "reject", reason })}><Send className="h-4 w-4" />Request correction</button><button type="button" className={`${btn.subtle} w-full`} onClick={() => setCorrecting(false)}>Cancel</button></div> : <div className="grid gap-2"><button type="button" className={`${btn.primary} w-full`} disabled={mutation.isPending} onClick={() => mutation.mutate({ id: selected.id, action: "approve", reason: "" })}><Check className="h-4 w-4" />Approve & review next</button><button type="button" className={`${btn.ghost} w-full`} onClick={() => setCorrecting(true)}><RotateCcw className="h-4 w-4" />Request correction</button></div>}{mutation.isError ? <p role="alert" className="text-[11px] text-destructive">That decision could not be saved. Try again.</p> : null}</div>
      </aside>
    </div>}
  </AppShell>;
}