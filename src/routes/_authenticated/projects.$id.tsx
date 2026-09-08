import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarDays, CheckCircle2, CircleAlert, Plus, Send, Users } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/AppShell";
import { Field, Panel, PanelHead, btn, inputClass } from "@/components/app/ui";
import { DOC_TYPES, assignSubcontractorsToProject, bulkCreateDocumentRequests, createRequirement, getCommandCenter } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/projects/$id")({
  component: ProjectDetail,
  head: () => ({ meta: [{ title: "Project document readiness | CertKeep" }, { name: "description", content: "Track subcontractor document requirements against upcoming project work." }, { property: "og:title", content: "Project document readiness | CertKeep" }, { property: "og:description", content: "See which project document requirements are satisfied and what needs attention." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
});

function ProjectDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const load = useServerFn(getCommandCenter);
  const assign = useServerFn(assignSubcontractorsToProject);
  const addRequirement = useServerFn(createRequirement);
  const request = useServerFn(bulkCreateDocumentRequests);
  const { data } = useQuery({ queryKey: ["command-center"], queryFn: () => load() });
  const [selected, setSelected] = useState("");
  const refresh = () => qc.invalidateQueries({ queryKey: ["command-center"] });
  const assignMutation = useMutation({ mutationFn: (input: { subcontractorIds: string[]; projectId: string; plannedStartDate: string }) => assign({ data: input }), onSuccess: refresh });
  const requirementMutation = useMutation({ mutationFn: (input: { projectId: string; name: string; documentType: string; trade: string }) => addRequirement({ data: input }), onSuccess: refresh });
  const requestMutation = useMutation({ mutationFn: (input: { subcontractorIds: string[]; docType: string; projectId: string; dueDate: string }) => request({ data: input }), onSuccess: refresh });
  const project = data?.projects.find((item) => item.id === id);
  const assignments = data?.assignments.filter((item) => item.project_id === id) ?? [];
  const requirements = data?.requirements.filter((item) => item.project_id === id && item.status === "required") ?? [];
  const docs = data?.requests ?? [];

  function submitAssign(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); if (!selected) return; assignMutation.mutate({ subcontractorIds: [selected], projectId: id, plannedStartDate: String(f.get("plannedStartDate") ?? "") }); }
  function submitRequirement(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const f = new FormData(event.currentTarget); requirementMutation.mutate({ projectId: id, name: String(f.get("name") ?? ""), documentType: String(f.get("documentType") ?? ""), trade: String(f.get("trade") ?? "") }); event.currentTarget.reset(); }

  return <AppShell title={project?.name ?? "Project"} subtitle={[project?.code, project?.location].filter(Boolean).join(" · ")} actions={<Link to="/projects" className={btn.ghost}>Back to projects</Link>}>
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3"><Panel className="p-4"><CalendarDays className="h-4 w-4 text-brand" /><p className="mt-3 text-[10px] font-bold text-muted-foreground">PROJECT START</p><p className="mt-1 text-[15px] font-bold text-ink">{project?.start_date ?? "Not scheduled"}</p></Panel><Panel className="p-4"><Users className="h-4 w-4 text-ink" /><p className="mt-3 text-[10px] font-bold text-muted-foreground">SUBCONTRACTORS</p><p className="mt-1 text-[20px] font-bold text-ink">{assignments.length}</p></Panel><Panel className="p-4"><CheckCircle2 className="h-4 w-4 text-success" /><p className="mt-3 text-[10px] font-bold text-muted-foreground">REQUIREMENTS</p><p className="mt-1 text-[20px] font-bold text-ink">{requirements.length}</p></Panel></div>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Panel className="overflow-hidden"><PanelHead title="Project readiness" subtitle="Status against customer-defined document requirements" />{assignments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left"><thead><tr className="bg-surface-muted text-[9px] font-bold text-muted-foreground"><th className="px-5 py-3">SUBCONTRACTOR</th><th className="px-4 py-3">PLANNED START</th><th className="px-4 py-3">CHECKLIST</th><th className="px-4 py-3">NEXT STEP</th></tr></thead><tbody>{assignments.map((assignment) => { const sub = data?.subcontractors.find((s) => s.id === assignment.subcontractor_id); const applicable = requirements.filter((r) => !r.trade || r.trade === sub?.trade); const satisfied = applicable.filter((r) => docs.some((d) => d.project_id === id && d.subcontractor_id === sub?.id && d.doc_type === r.document_type && d.status === "approved")).length; const missing = applicable.filter((r) => !docs.some((d) => d.project_id === id && d.subcontractor_id === sub?.id && d.doc_type === r.document_type && ["pending", "submitted", "approved"].includes(d.status))); const nextMissing = missing[0]; return <tr key={assignment.id} className="border-t border-border"><td className="px-5 py-4"><p className="text-[12px] font-bold text-ink">{sub?.company}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{sub?.trade || "Trade not set"}</p></td><td className="px-4 py-4 text-[11px] text-ink">{assignment.planned_start_date || "Not set"}</td><td className="px-4 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold ${applicable.length > 0 && satisfied === applicable.length ? "bg-success-soft text-success" : "bg-brand-soft text-brand"}`}>{applicable.length > 0 && satisfied === applicable.length ? "Document requirements satisfied" : `${satisfied} of ${applicable.length} satisfied`}</span></td><td className="px-4 py-4">{nextMissing ? <button type="button" className={btn.ghost} disabled={requestMutation.isPending} onClick={() => requestMutation.mutate({ subcontractorIds: [assignment.subcontractor_id], docType: nextMissing.document_type, projectId: id, dueDate: assignment.planned_start_date ?? "" })}><Send className="h-4 w-4" />Request {nextMissing.document_type}</button> : <span className="inline-flex items-center gap-1 text-[10px] font-bold text-success"><CheckCircle2 className="h-4 w-4" />No action needed</span>}</td></tr>; })}</tbody></table></div> : <div className="px-6 py-12 text-center"><CircleAlert className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 text-[12px] font-bold text-ink">No subcontractors assigned</p><p className="mt-1 text-[10px] text-muted-foreground">Use the panel to connect upcoming work.</p></div>}</Panel>
        <div className="space-y-5"><Panel><PanelHead title="Assign subcontractor" /><form className="space-y-4 p-5" onSubmit={submitAssign}><Field label="Subcontractor" htmlFor="sub"><select id="sub" className={inputClass} value={selected} onChange={(e) => setSelected(e.target.value)} required><option value="">Choose a subcontractor</option>{data?.subcontractors.filter((s) => !assignments.some((a) => a.subcontractor_id === s.id)).map((s) => <option key={s.id} value={s.id}>{s.company}</option>)}</select></Field><Field label="Planned start date" htmlFor="plannedStartDate"><input id="plannedStartDate" name="plannedStartDate" type="date" className={inputClass} /></Field><button className={`${btn.primary} w-full`} disabled={assignMutation.isPending}><Plus className="h-4 w-4" />Assign to project</button></form></Panel><Panel><PanelHead title="Add requirement" /><form className="space-y-4 p-5" onSubmit={submitRequirement}><Field label="Requirement name" htmlFor="name"><input id="name" name="name" className={inputClass} placeholder="Current workers’ compensation" required /></Field><Field label="Document type" htmlFor="documentType"><select id="documentType" name="documentType" className={inputClass}>{DOC_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field><Field label="Trade" htmlFor="trade" hint="Leave blank for every trade"><input id="trade" name="trade" className={inputClass} /></Field><button className={`${btn.primary} w-full`} disabled={requirementMutation.isPending}>Add requirement</button></form></Panel></div>
      </div>
    </div>
  </AppShell>;
}