import { useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, FolderKanban, MapPin, Plus } from "lucide-react";

import { AppShell } from "@/components/app/AppShell";
import { Field, Panel, PanelHead, btn, inputClass } from "@/components/app/ui";
import { createProject, getCommandCenter } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/projects")({ component: ProjectsPage });

function ProjectsPage() {
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const qc = useQueryClient();
  const load = useServerFn(getCommandCenter);
  const add = useServerFn(createProject);
  const { data, isLoading } = useQuery({ queryKey: ["command-center"], queryFn: () => load() });
  const mutation = useMutation({
    mutationFn: (values: { name: string; code: string; location: string }) => add({ data: values }),
    onSuccess: () => {
      setShowForm(false);
      setError("");
      qc.invalidateQueries({ queryKey: ["command-center"] });
    },
    onError: (e) => setError(e instanceof Error ? e.message : "Could not create that project."),
  });
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    mutation.mutate({
      name: String(form.get("name") ?? ""),
      code: String(form.get("code") ?? ""),
      location: String(form.get("location") ?? ""),
    });
  }

  return (
    <AppShell
      title="Projects"
      subtitle="Job-level compliance, requirements, and trade partner health"
      actions={
        <button type="button" className={btn.primary} onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4" />
          {showForm ? "Close" : "New project"}
        </button>
      }
    >
      <div className="space-y-5">
        {showForm ? (
          <Panel>
            <PanelHead
              title="Create a project"
              subtitle="Start with the job details; requirements can be added next."
            />
            <form onSubmit={submit} className="grid gap-4 p-5 sm:grid-cols-3">
              <Field label="Project name" htmlFor="name">
                <input
                  id="name"
                  name="name"
                  required
                  className={inputClass}
                  placeholder="Harbor Point Tower"
                />
              </Field>
              <Field label="Project code" htmlFor="code">
                <input id="code" name="code" className={inputClass} placeholder="HP-2407" />
              </Field>
              <Field label="Location" htmlFor="location">
                <input
                  id="location"
                  name="location"
                  className={inputClass}
                  placeholder="Austin, TX"
                />
              </Field>
              {error ? <p className="text-[12px] text-destructive sm:col-span-3">{error}</p> : null}
              <div className="sm:col-span-3">
                <button className={btn.primary} disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating…" : "Create project"}
                </button>
              </div>
            </form>
          </Panel>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            <p className="text-[12px] text-[#7b8190]">Loading projects…</p>
          ) : data?.projects.length ? (
            data.projects.map((project) => (
              <Panel key={project.id} className="p-5">
                <div className="flex items-start justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eef0f3] text-ink">
                    <Building2 className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-success-soft px-2.5 py-1 text-[9px] font-bold capitalize text-success">
                    {project.status.replace("_", " ")}
                  </span>
                </div>
                <h2 className="mt-5 text-[15px]">{project.name}</h2>
                <p className="mt-1 text-[10px] text-[#8b91a0]">
                  {project.code || "No project code"}
                </p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[.06] pt-4">
                  <span className="flex items-center gap-1.5 text-[10px] text-[#7b8190]">
                    <MapPin className="h-3.5 w-3.5" />
                    {project.location || "Location not set"}
                  </span>
                  <span className="text-[10px] font-bold text-ink">
                    {data.requirements.filter((r) => r.project_id === project.id).length}{" "}
                    requirements
                  </span>
                </div>
              </Panel>
            ))
          ) : (
            <Panel className="col-span-full grid min-h-[360px] place-items-center p-8 text-center">
              <div>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-soft text-brand">
                  <FolderKanban className="h-6 w-6" />
                </span>
                <h2 className="mt-5 text-[18px]">Start with your first active job</h2>
                <p className="mx-auto mt-2 max-w-[48ch] text-[12px] leading-5 text-[#7b8190]">
                  Projects organize subcontractors and define exactly which insurance, licenses, and
                  tax documents each job requires.
                </p>
                <button className={`${btn.primary} mt-5`} onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4" />
                  Create project
                </button>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}
