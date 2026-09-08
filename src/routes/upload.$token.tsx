import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Lock, UploadCloud } from "lucide-react";
import { useState, type FormEvent } from "react";

import { LogoMark } from "@/components/landing/Logo";
import { Field, btn, inputClass } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { createUploadTarget, getUploadRequest, submitUpload } from "@/lib/app.functions";

export const Route = createFileRoute("/upload/$token")({
  ssr: false,
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload your document | CertKeep" },
      {
        name: "description",
        content:
          "Upload the requested insurance or compliance document from your phone. No account or password needed.",
      },
      { property: "og:title", content: "Upload your document | CertKeep" },
      {
        property: "og:description",
        content: "Secure document upload link. No account required.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-[440px]">
        <div className="mb-6 flex items-center justify-center gap-2.5 text-ink">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-[18px] font-bold">CertKeep</span>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
          {children}
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[13px] text-[#6b7280]">
          <Lock className="h-3.5 w-3.5" />
          Secure link · no account required
        </p>
      </div>
    </main>
  );
}

function UploadPage() {
  const { token } = Route.useParams();
  const loadRequest = useServerFn(getUploadRequest);
  const makeTarget = useServerFn(createUploadTarget);
  const finish = useServerFn(submitUpload);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["upload", token],
    queryFn: () => loadRequest({ data: { token } }),
  });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    const expirationDate = String(form.get("expirationDate") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a photo or PDF of the document.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      setError("That file is larger than 25 MB. Try a photo instead.");
      return;
    }
    if (!expirationDate) {
      setError("Enter the expiration date on the document.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const target = await makeTarget({ data: { token, fileName: file.name } });
      const { error: upErr } = await supabase.storage
        .from("compliance-docs")
        .uploadToSignedUrl(target.path, target.token, file);
      if (upErr) throw new Error("The upload did not finish. Please try again.");
      await finish({
        data: { token, path: target.path, fileName: file.name, expirationDate },
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <Frame>
        <p className="text-[15px] text-[#6b7280]">Loading your request...</p>
      </Frame>
    );
  }

  if (!data || data.state !== "ok") {
    return (
      <Frame>
        <h1 className="text-[20px]">
          {data?.state === "expired" ? "This link has expired" : "This link is not valid"}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
          Contact the general contractor who sent it and ask for a new upload link.
        </p>
      </Frame>
    );
  }

  if (done || data.status === "submitted" || data.status === "approved") {
    return (
      <Frame>
        <CheckCircle2 className="h-8 w-8 text-success" />
        <h1 className="mt-3 text-[20px]">Document received</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
          Thanks. {data.company || "The contractor"} will review it. You can close this page.
        </p>
      </Frame>
    );
  }

  return (
    <Frame>
      <p className="text-[12px] font-bold tracking-[0.12em] text-[#6b7280] uppercase">
        Requested from
      </p>
      <h1 className="mt-1 text-[21px] leading-tight">{data.company}</h1>
      <p className="mt-1 text-[15px] text-[#374151]">{data.docType}</p>
      {data.notes ? (
        <p className="mt-3 rounded-xl bg-surface-muted px-3.5 py-3 text-[14px] text-[#374151]">
          {data.notes}
        </p>
      ) : null}
      {data.status === "rejected" ? (
        <p className="mt-3 rounded-xl bg-brand-soft px-3.5 py-3 text-[14px] text-brand-hover">
          Your previous upload was rejected. Please send an updated document.
        </p>
      ) : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
        <Field label="Expiration date" htmlFor="expirationDate">
          <input id="expirationDate" name="expirationDate" type="date" className={inputClass} />
        </Field>

        <Field label="Document" htmlFor="file" hint="Take a photo or attach a PDF">
          <label
            htmlFor="file"
            className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#d1d5db] bg-background px-3 py-7 text-center"
          >
            <UploadCloud className="h-5 w-5 text-brand" />
            <span className="text-[14px] font-semibold text-ink">Choose file</span>
            <span className="text-[12px] text-[#6b7280]">JPG, PNG or PDF up to 25 MB</span>
            <input
              id="file"
              name="file"
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => {
                const label = e.currentTarget.files?.[0]?.name;
                const el = document.getElementById("file-name");
                if (el) el.textContent = label ?? "";
              }}
            />
          </label>
          <p id="file-name" className="mt-2 text-[13px] font-medium text-ink" />
        </Field>

        {error ? (
          <p
            className="rounded-xl bg-brand-soft px-3.5 py-3 text-[14px] text-brand-hover"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <button type="submit" disabled={busy} className={`${btn.primary} w-full`}>
          {busy ? "Uploading..." : "Submit document"}
        </button>
      </form>
    </Frame>
  );
}
