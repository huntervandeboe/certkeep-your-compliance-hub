import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useId, useState } from "react";

import { pilotApplicationSchema, submitPilotApplication } from "@/lib/pilot.functions";
import { cn } from "@/lib/utils";

import { Container, buttonStyles } from "./primitives";

type Values = {
  fullName: string;
  workEmail: string;
  phone: string;
  company: string;
  state: string;
  jobTitle: string;
  subcontractorCount: string;
  trackingMethod: string;
  biggestProblem: string;
};

const empty: Values = {
  fullName: "",
  workEmail: "",
  phone: "",
  company: "",
  state: "",
  jobTitle: "",
  subcontractorCount: "",
  trackingMethod: "",
  biggestProblem: "",
};

const fieldBase =
  "w-full rounded-xl border bg-surface px-4 py-3 text-[15px] text-ink placeholder:text-[#9ca3af] transition-colors focus:outline-none";

function Field({
  label,
  name,
  value,
  error,
  onChange,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
  className,
}: {
  label: string;
  name: keyof Values;
  value: string;
  error?: string | undefined;
  onChange: (name: keyof Values, value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
}) {
  const id = useId();
  return (
    <div className={cn("min-w-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-brand">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        required={required}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(name, e.target.value)}
        className={cn(fieldBase, error ? "border-destructive" : "border-border focus:border-brand")}
      />
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[13px] font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function PilotForm() {
  const submit = useServerFn(submitPilotApplication);
  const [values, setValues] = useState<Values>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const problemId = useId();
  const trackingId = useId();

  const update = (name: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const parsed = pilotApplicationSchema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<keyof Values, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Values;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }

    setStatus("loading");
    try {
      await submit({ data: parsed.data });
      setStatus("success");
    } catch {
      setStatus("idle");
      setFormError("Something went wrong sending your application. Please try again.");
    }
  };

  return (
    <section id="pilot" className="bg-surface-muted py-[72px] md:py-[112px]">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-border bg-surface">
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="border-b border-border bg-ink p-8 sm:p-10 lg:border-r lg:border-b-0">
              <p className="text-[13px] font-bold tracking-[0.14em] text-brand uppercase">
                Pilot program
              </p>
              <h2 className="mt-5 text-[28px] leading-[1.15] font-extrabold text-white sm:text-[34px]">
                Help shape the simpler way to manage subcontractor compliance.
              </h2>
              <p className="mt-5 text-[16px] leading-relaxed text-white/70">
                We are inviting a small group of commercial contractors to test CertKeep and help
                define the first release.
              </p>
              <p className="mt-8 text-[14px] text-white/50">
                Your information will remain private. No spam and no obligation.
              </p>
            </div>

            <div className="p-8 sm:p-10">
              {status === "success" ? (
                <div
                  role="status"
                  className="flex h-full min-h-[320px] flex-col items-start justify-center"
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-success-soft">
                    <CheckCircle2 className="h-6 w-6 text-success" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-[24px] font-extrabold">Application received.</h3>
                  <p className="mt-3 max-w-[420px] text-[16px] leading-relaxed text-[#374151]">
                    We'll contact you to learn about your current workflow.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Full name"
                    name="fullName"
                    required
                    autoComplete="name"
                    value={values.fullName}
                    error={errors.fullName}
                    onChange={update}
                  />
                  <Field
                    label="Work email"
                    name="workEmail"
                    type="email"
                    required
                    autoComplete="email"
                    value={values.workEmail}
                    error={errors.workEmail}
                    onChange={update}
                  />
                  <Field
                    label="Phone number"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    value={values.phone}
                    error={errors.phone}
                    onChange={update}
                  />
                  <Field
                    label="Company name"
                    name="company"
                    required
                    autoComplete="organization"
                    value={values.company}
                    error={errors.company}
                    onChange={update}
                  />
                  <Field
                    label="State"
                    name="state"
                    autoComplete="address-level1"
                    value={values.state}
                    error={errors.state}
                    onChange={update}
                  />
                  <Field
                    label="Job title"
                    name="jobTitle"
                    autoComplete="organization-title"
                    value={values.jobTitle}
                    error={errors.jobTitle}
                    onChange={update}
                  />
                  <Field
                    label="Active subcontractors"
                    name="subcontractorCount"
                    placeholder="Approximate number"
                    value={values.subcontractorCount}
                    error={errors.subcontractorCount}
                    onChange={update}
                  />

                  <div className="min-w-0">
                    <label
                      htmlFor={trackingId}
                      className="mb-1.5 block text-[14px] font-semibold text-ink"
                    >
                      Current tracking method
                    </label>
                    <select
                      id={trackingId}
                      value={values.trackingMethod}
                      onChange={(e) => update("trackingMethod", e.target.value)}
                      className={cn(fieldBase, "border-border focus:border-brand")}
                    >
                      <option value="">Select one</option>
                      <option>Spreadsheet</option>
                      <option>Email and shared folders</option>
                      <option>Accounting or PM software</option>
                      <option>Another compliance tool</option>
                      <option>Nothing formal yet</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor={problemId}
                      className="mb-1.5 block text-[14px] font-semibold text-ink"
                    >
                      Biggest compliance or document-management problem
                    </label>
                    <textarea
                      id={problemId}
                      rows={4}
                      value={values.biggestProblem}
                      onChange={(e) => update("biggestProblem", e.target.value)}
                      className={cn(fieldBase, "resize-y border-border focus:border-brand")}
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-[14px] font-medium text-destructive sm:col-span-2">
                      {formError}
                    </p>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className={buttonStyles.primary + " w-full sm:w-auto"}
                    >
                      {status === "loading" && (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      )}
                      {status === "loading" ? "Sending..." : "Apply for the Pilot"}
                    </button>
                    <p className="mt-3 text-[14px] text-[#6b7280]">
                      Your information will remain private. No spam and no obligation.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
