import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, Check, Copy, ExternalLink, Mail, Smartphone } from "lucide-react";
import { useState } from "react";

import { AppShell } from "@/components/app/AppShell";
import { Field, Panel, btn, inputClass } from "@/components/app/ui";
import { DOC_TYPES, completeOnboarding } from "@/lib/app.functions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Pilot setup | CertKeep" },
      {
        name: "description",
        content:
          "Set up your first project, trade partner, and secure mobile upload links in a few minutes.",
      },
      { property: "og:title", content: "Pilot setup | CertKeep" },
      {
        property: "og:description",
        content: "Create your first project and send real upload links to a subcontractor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

const DEFAULT_DOCS = ["General Liability Certificate", "Workers Compensation Certificate", "W-9"];

type Result = Awaited<ReturnType<typeof completeOnboarding>>;

function StepHeader({ step, current }: { step: number; current: number }) {
  const labels = ["Project", "Trade partner", "Documents"];
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {labels.map((label, index) => {
        const value = index + 1;
        const done = current > value;
        const active = current === value;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${
                done
                  ? "bg-success-soft text-success"
                  : active
                    ? "bg-brand text-white"
                    : "bg-surface-muted text-muted-foreground"
              }`}
            >
              {done ? <Check className="h-3 w-3" /> : value}
            </span>
            <span
              className={`text-[11px] font-bold ${active ? "text-ink" : "text-muted-foreground"}`}
            >
              {label}
            </span>
            {value < labels.length ? <span className="h-px w-6 bg-border" /> : null}
          </li>
        );
      })}
      <span className="sr-only">Step {step}</span>
    </ol>
  );
}

function OnboardingPage() {
  const run = useServerFn(completeOnboarding);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const [projectName, setProjectName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectStart, setProjectStart] = useState("");
  const [company, setCompany] = useState("");
  const [trade, setTrade] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [plannedStart, setPlannedStart] = useState("");
  const [docTypes, setDocTypes] = useState<string[]>(DEFAULT_DOCS);

  const finish = useMutation({
    mutationFn: () =>
      run({
        data: {
          projectName,
          projectLocation,
          projectStart,
          company,
          trade,
          contactName,
          contactEmail,
          plannedStart,
          docTypes,
        },
      }),
    onSuccess: (data) => {
      setResult(data);
      setError("");
    },
    onError: (e: unknown) =>
      setError(e instanceof Error ? e.message : "Could not finish the setup."),
  });

  const linkFor = (token: string) =>
    typeof window === "undefined"
      ? `/upload/${token}`
      : `${window.location.origin}/upload/${token}`;

  async function copy(token: string, id: string) {
    const url = linkFor(token);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this upload link", url);
    }
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function emailAll() {
    if (!result) return;
    const body = [
      `Hi ${contactName || result.company},`,
      "",
      "Please upload the documents below. Each link opens on a phone and does not need an account or password.",
      "",
      ...result.links.map((link) => `${link.docType}: ${linkFor(link.token)}`),
      "",
      "Thank you.",
    ].join("\n");
    const to = contactEmail ? encodeURIComponent(contactEmail) : "";
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(
      `Documents needed for ${projectName}`,
    )}&body=${encodeURIComponent(body)}`;
  }

  if (result) {
    return (
      <AppShell
        title="Your links are live"
        subtitle="Send these to your trade partner and watch the queue fill."
      >
        <div className="space-y-5">
          <Panel className="p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-success-soft text-success">
                <Check className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-[17px]">
                  {result.links.length} secure upload links for {result.company}
                </h2>
                <p className="mt-1 max-w-[60ch] text-[12px] leading-5 text-muted-foreground">
                  Each link opens a real mobile upload page. Anyone with the link can submit that
                  one document, and it expires automatically. Nothing is approved until you review
                  it.
                </p>
              </div>
            </div>

            <div className="mt-6 divide-y divide-border rounded-xl border border-border">
              {result.links.map((link) => (
                <div
                  key={link.id}
                  className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-ink">{link.docType}</p>
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">
                      {linkFor(link.token)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={btn.ghost}
                      onClick={() => copy(link.token, link.id)}
                    >
                      <Copy className="h-4 w-4" />
                      {copied === link.id ? "Copied" : "Copy link"}
                    </button>
                    <a
                      className={btn.ghost}
                      href={`/upload/${link.token}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <button type="button" className={btn.primary} onClick={emailAll}>
                <Mail className="h-4 w-4" />
                Email all links
              </button>
              <Link to="/dashboard" className={btn.ghost}>
                Go to today’s queue <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/projects/$id" params={{ id: result.projectId }} className={btn.ghost}>
                View project readiness
              </Link>
            </div>
          </Panel>

          <Panel className="flex items-start gap-3 p-6">
            <Smartphone className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
            <p className="text-[12px] leading-5 text-muted-foreground">
              Test it yourself: open one link on your phone, take a photo of any document, and enter
              an expiration date. It will appear in Document review within seconds.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Pilot setup" subtitle="Three short steps and your queue has real work in it.">
      <Panel className="p-6">
        <StepHeader step={step} current={step} />

        <div className="mt-6 max-w-[640px] space-y-4">
          {step === 1 ? (
            <>
              <Field label="Project name" htmlFor="projectName">
                <input
                  id="projectName"
                  className={inputClass}
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Riverside Medical Office"
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Location" htmlFor="projectLocation">
                  <input
                    id="projectLocation"
                    className={inputClass}
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                    placeholder="Columbus, OH"
                  />
                </Field>
                <Field label="Start date" htmlFor="projectStart">
                  <input
                    id="projectStart"
                    type="date"
                    className={inputClass}
                    value={projectStart}
                    onChange={(e) => setProjectStart(e.target.value)}
                  />
                </Field>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Company" htmlFor="company">
                  <input
                    id="company"
                    className={inputClass}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Apex Electrical"
                  />
                </Field>
                <Field label="Trade" htmlFor="trade">
                  <input
                    id="trade"
                    className={inputClass}
                    value={trade}
                    onChange={(e) => setTrade(e.target.value)}
                    placeholder="Electrical"
                  />
                </Field>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact name" htmlFor="contactName">
                  <input
                    id="contactName"
                    className={inputClass}
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </Field>
                <Field
                  label="Contact email"
                  htmlFor="contactEmail"
                  hint="Used to address the message you send"
                >
                  <input
                    id="contactEmail"
                    type="email"
                    className={inputClass}
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </Field>
              </div>
              <Field
                label="Planned start on site"
                htmlFor="plannedStart"
                hint="Drives how urgently missing documents are ranked"
              >
                <input
                  id="plannedStart"
                  type="date"
                  className={inputClass}
                  value={plannedStart}
                  onChange={(e) => setPlannedStart(e.target.value)}
                />
              </Field>
            </>
          ) : null}

          {step === 3 ? (
            <div>
              <p className="text-[12px] font-bold text-ink">Documents to request</p>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Each one becomes a project requirement and its own secure upload link.
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {DOC_TYPES.map((docType) => {
                  const checked = docTypes.includes(docType);
                  return (
                    <label
                      key={docType}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-3 text-[12px] font-semibold ${
                        checked
                          ? "border-brand bg-brand-soft text-ink"
                          : "border-border bg-surface text-muted-foreground"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--color-brand,#F05A28)]"
                        checked={checked}
                        onChange={() =>
                          setDocTypes((current) =>
                            current.includes(docType)
                              ? current.filter((item) => item !== docType)
                              : [...current, docType],
                          )
                        }
                      />
                      {docType}
                    </label>
                  );
                })}
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="rounded-xl bg-brand-soft px-3.5 py-3 text-[12px] text-brand-hover">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-2 pt-2">
            {step > 1 ? (
              <button type="button" className={btn.ghost} onClick={() => setStep(step - 1)}>
                Back
              </button>
            ) : (
              <Link to="/dashboard" className={btn.ghost}>
                Skip for now
              </Link>
            )}
            {step < 3 ? (
              <button
                type="button"
                className={btn.primary}
                onClick={() => {
                  if (step === 1 && !projectName.trim()) return setError("Name the project first.");
                  if (step === 2 && !company.trim())
                    return setError("Enter the subcontractor’s company name.");
                  setError("");
                  setStep(step + 1);
                }}
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                className={btn.primary}
                disabled={finish.isPending || docTypes.length === 0}
                onClick={() => finish.mutate()}
              >
                {finish.isPending ? "Creating links…" : "Create project and links"}
              </button>
            )}
          </div>
        </div>
      </Panel>
    </AppShell>
  );
}
