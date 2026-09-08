import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Check, Copy, X } from "lucide-react";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/AppShell";
import {
  EmptyState,
  Field,
  Panel,
  PanelHead,
  StatusBadge,
  btn,
  inputClass,
} from "@/components/app/ui";
import type { BadgeKind } from "@/components/app/ui";
import {
  DOC_TYPES,
  createDocumentRequest,
  getDocumentUrl,
  getSubcontractor,
  reviewDocumentRequest,
} from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/subcontractors/$id")({
  component: SubcontractorDetail,
  head: () => ({
    meta: [
      { title: "Subcontractor documents | CertKeep" },
      {
        name: "description",
        content:
          "Request documents, share a secure upload link, and approve or reject what the subcontractor sends.",
      },
      { property: "og:title", content: "Subcontractor documents | CertKeep" },
      {
        property: "og:description",
        content: "Request, review, and approve subcontractor compliance documents.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function SubcontractorDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const fetchDetail = useServerFn(getSubcontractor);
  const requestDoc = useServerFn(createDocumentRequest);
  const review = useServerFn(reviewDocumentRequest);
  const openDoc = useServerFn(getDocumentUrl);

  const [error, setError] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["subcontractor", id],
    queryFn: () => fetchDetail({ data: { id } }),
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["subcontractor", id] });
    qc.invalidateQueries({ queryKey: ["workspace"] });
  };

  const createReq = useMutation({
    mutationFn: (values: {
      subcontractorId: string;
      docType: string;
      notes: string;
      projectId: null;
      requirementId: null;
      dueDate: null;
    }) =>
      requestDoc({ data: values }),
    onSuccess: () => {
      setError("");
      refresh();
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not create that request."),
  });

  const decide = useMutation({
    mutationFn: (values: { id: string; action: "approve" | "reject"; reason: string }) =>
      review({ data: values }),
    onSuccess: () => {
      setRejecting(null);
      refresh();
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not save that decision."),
  });

  async function copyLink(token: string, requestId: string) {
    const url = `${window.location.origin}/upload/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this upload link", url);
    }
    setCopied(requestId);
    setTimeout(() => setCopied(null), 2000);
  }

  async function viewDoc(requestId: string) {
    try {
      const res = await openDoc({ data: { id: requestId } });
      window.open(res.url, "_blank", "noopener");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open that document.");
    }
  }

  function onRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    createReq.mutate({
      subcontractorId: id,
      docType: String(f.get("docType") ?? ""),
      notes: String(f.get("notes") ?? "").trim(),
      projectId: null,
      requirementId: null,
      dueDate: null,
    });
    e.currentTarget.reset();
  }

  const sub = data?.subcontractor;
  const requests = data?.requests ?? [];

  return (
    <AppShell
      title={sub?.company ?? "Subcontractor"}
      subtitle={
        sub ? [sub.trade, sub.project].filter(Boolean).join(" · ") || "No trade set" : undefined
      }
      actions={
        <Link to="/subcontractors" search={{ bulk: undefined }} className={btn.ghost}>
          Back to list
        </Link>
      }
    >
      {isLoading ? (
        <p className="text-[15px] text-[#6b7280]">Loading...</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <Panel>
            <PanelHead title="Documents" subtitle={`${requests.length} requested`} />
            {error ? (
              <p className="border-b border-border bg-brand-soft px-6 py-3 text-[14px] text-brand-hover">
                {error}
              </p>
            ) : null}
            {requests.length === 0 ? (
              <EmptyState
                title="No documents requested yet"
                body="Request a document and share the secure link. Your subcontractor uploads it from their phone, no account needed."
              />
            ) : (
              <ul className="divide-y divide-border">
                {requests.map((r) => (
                  <li key={r.id} className="px-6 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[15px] font-semibold text-ink">{r.doc_type}</p>
                        <p className="mt-0.5 text-[13px] text-[#6b7280]">
                          {r.status === "pending"
                            ? "Waiting on the subcontractor"
                            : r.expiration_date
                              ? `Expires ${r.expiration_date}`
                              : "Uploaded"}
                        </p>
                        {r.rejection_reason ? (
                          <p className="mt-1 text-[13px] text-brand-hover">
                            Rejected: {r.rejection_reason}
                          </p>
                        ) : null}
                      </div>
                      <StatusBadge kind={r.status as BadgeKind} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {r.status === "pending" || r.status === "rejected" ? (
                        <button
                          type="button"
                          className={btn.ghost}
                          onClick={() => copyLink(r.token, r.id)}
                        >
                          {copied === r.id ? (
                            <Check className="h-4 w-4 text-success" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                          {copied === r.id ? "Link copied" : "Copy upload link"}
                        </button>
                      ) : null}
                      {r.file_path ? (
                        <button type="button" className={btn.ghost} onClick={() => viewDoc(r.id)}>
                          View document
                        </button>
                      ) : null}
                      {r.status === "submitted" ? (
                        <>
                          <button
                            type="button"
                            className={btn.primary}
                            disabled={decide.isPending}
                            onClick={() =>
                              decide.mutate({ id: r.id, action: "approve", reason: "" })
                            }
                          >
                            <Check className="h-4 w-4" /> Approve
                          </button>
                          <button
                            type="button"
                            className={btn.subtle}
                            onClick={() => setRejecting(rejecting === r.id ? null : r.id)}
                          >
                            <X className="h-4 w-4" /> Reject
                          </button>
                        </>
                      ) : null}
                    </div>

                    {rejecting === r.id ? (
                      <form
                        className="mt-4 flex flex-wrap items-end gap-3"
                        onSubmit={(e) => {
                          e.preventDefault();
                          const reason = String(
                            new FormData(e.currentTarget).get("reason") ?? "",
                          ).trim();
                          decide.mutate({ id: r.id, action: "reject", reason });
                        }}
                      >
                        <div className="min-w-[220px] flex-1">
                          <Field label="Why is it rejected?" htmlFor={`reason-${r.id}`}>
                            <input
                              id={`reason-${r.id}`}
                              name="reason"
                              className={inputClass}
                              placeholder="Coverage limits too low"
                            />
                          </Field>
                        </div>
                        <button type="submit" className={btn.primary} disabled={decide.isPending}>
                          Send rejection
                        </button>
                      </form>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <div className="space-y-6">
            <Panel>
              <PanelHead title="Request a document" />
              <form onSubmit={onRequest} className="space-y-4 px-6 py-6">
                <Field label="Document" htmlFor="docType">
                  <select id="docType" name="docType" className={inputClass} required>
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Note to subcontractor" htmlFor="notes" hint="Optional">
                  <textarea id="notes" name="notes" rows={3} className={inputClass} />
                </Field>
                <button
                  type="submit"
                  className={`${btn.primary} w-full`}
                  disabled={createReq.isPending}
                >
                  {createReq.isPending ? "Creating..." : "Create secure link"}
                </button>
              </form>
            </Panel>

            {sub ? (
              <Panel>
                <PanelHead title="Contact" />
                <dl className="space-y-3 px-6 py-5 text-[14px]">
                  <div>
                    <dt className="text-[#6b7280]">Name</dt>
                    <dd className="font-semibold text-ink">{sub.contact_name || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[#6b7280]">Email</dt>
                    <dd className="font-semibold break-words text-ink">
                      {sub.contact_email || "—"}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#6b7280]">Phone</dt>
                    <dd className="font-semibold text-ink">{sub.contact_phone || "—"}</dd>
                  </div>
                </dl>
              </Panel>
            ) : null}
          </div>
        </div>
      )}
    </AppShell>
  );
}
