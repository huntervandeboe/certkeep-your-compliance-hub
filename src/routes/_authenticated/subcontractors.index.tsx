import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";

import { AppShell } from "@/components/app/AppShell";
import { EmptyState, Field, Panel, PanelHead, btn, inputClass } from "@/components/app/ui";
import { createSubcontractor, getWorkspace } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/subcontractors/")({
  component: SubcontractorsPage,
  head: () => ({
    meta: [
      { title: "Subcontractors | CertKeep" },
      {
        name: "description",
        content: "Add subcontractors and track the compliance documents you have requested.",
      },
      { property: "og:title", content: "Subcontractors | CertKeep" },
      {
        property: "og:description",
        content: "Your subcontractor list and their document status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

type SubInput = {
  company: string;
  trade: string;
  project: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

function SubcontractorsPage() {
  const qc = useQueryClient();
  const fetchWorkspace = useServerFn(getWorkspace);
  const addSub = useServerFn(createSubcontractor);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["workspace"],
    queryFn: () => fetchWorkspace(),
  });

  const mutation = useMutation({
    mutationFn: (values: SubInput) => addSub({ data: values }),
    onSuccess: () => {
      setShowForm(false);
      setError("");
      qc.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not add that subcontractor."),
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const company = String(f.get("company") ?? "").trim();
    if (!company) {
      setError("Enter the company name.");
      return;
    }
    mutation.mutate({
      company,
      trade: String(f.get("trade") ?? "").trim(),
      project: String(f.get("project") ?? "").trim(),
      contactName: String(f.get("contactName") ?? "").trim(),
      contactEmail: String(f.get("contactEmail") ?? "").trim(),
      contactPhone: String(f.get("contactPhone") ?? "").trim(),
    });
  }

  const subs = data?.subcontractors ?? [];
  const requests = data?.requests ?? [];

  return (
    <AppShell
      title="Subcontractors"
      subtitle="Everyone you collect documents from"
      actions={
        <button type="button" className={btn.primary} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Close" : "Add subcontractor"}
        </button>
      }
    >
      <div className="space-y-6">
        {showForm ? (
          <Panel>
            <PanelHead title="New subcontractor" />
            <form onSubmit={onSubmit} className="grid gap-5 px-6 py-6 sm:grid-cols-2" noValidate>
              <Field label="Company" htmlFor="company">
                <input id="company" name="company" required className={inputClass} />
              </Field>
              <Field label="Trade" htmlFor="trade">
                <input
                  id="trade"
                  name="trade"
                  className={inputClass}
                  placeholder="Electrical, concrete..."
                />
              </Field>
              <Field label="Project" htmlFor="project">
                <input id="project" name="project" className={inputClass} />
              </Field>
              <Field label="Contact name" htmlFor="contactName">
                <input id="contactName" name="contactName" className={inputClass} />
              </Field>
              <Field label="Contact email" htmlFor="contactEmail">
                <input id="contactEmail" name="contactEmail" type="email" className={inputClass} />
              </Field>
              <Field label="Contact phone" htmlFor="contactPhone">
                <input id="contactPhone" name="contactPhone" className={inputClass} />
              </Field>
              {error ? (
                <p className="text-[14px] text-destructive sm:col-span-2" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="sm:col-span-2">
                <button type="submit" disabled={mutation.isPending} className={btn.primary}>
                  {mutation.isPending ? "Saving..." : "Save subcontractor"}
                </button>
              </div>
            </form>
          </Panel>
        ) : null}

        <Panel>
          <PanelHead title="All subcontractors" subtitle={`${subs.length} total`} />
          {isLoading ? (
            <p className="px-6 py-8 text-[15px] text-[#6b7280]">Loading...</p>
          ) : subs.length === 0 ? (
            <EmptyState
              title="No subcontractors yet"
              body="Add your first subcontractor, then send a secure link to collect their certificate."
              action={
                <button type="button" className={btn.primary} onClick={() => setShowForm(true)}>
                  Add subcontractor
                </button>
              }
            />
          ) : (
            <ul className="divide-y divide-border">
              {subs.map((s) => {
                const mine = requests.filter((r) => r.subcontractor_id === s.id);
                const waiting = mine.filter((r) => r.status === "submitted").length;
                return (
                  <li key={s.id}>
                    <Link
                      to="/subcontractors/$id"
                      params={{ id: s.id }}
                      className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-surface-muted/60"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-ink">{s.company}</p>
                        <p className="truncate text-[13px] text-[#6b7280]">
                          {[s.trade, s.project].filter(Boolean).join(" · ") || "No trade set"}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        {waiting ? (
                          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-[12px] font-semibold text-warning">
                            {waiting} to review
                          </span>
                        ) : null}
                        <span className="text-[13px] font-medium text-[#6b7280]">
                          {mine.length} document{mine.length === 1 ? "" : "s"}
                        </span>
                      </div>
                    </Link>
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
