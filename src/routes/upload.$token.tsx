import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Clock, Lock, UploadCloud } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";

import { LogoMark } from "@/components/landing/Logo";
import { Field, btn, inputClass } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { createUploadTarget, getUploadRequest, submitUpload } from "@/lib/app.functions";

export const Route = createFileRoute("/upload/$token")({
  ssr: false,
  component: UploadPage,
  head: () => ({
    meta: [
      { title: "Upload your documents | CertKeep" },
      {
        name: "description",
        content:
          "Upload the requested insurance or compliance documents from your phone. No account or password needed.",
      },
      { property: "og:title", content: "Upload your documents | CertKeep" },
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

function Frame({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-[460px]">
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

const MAX_BYTES = 25 * 1024 * 1024;

type Item = {
  id: string;
  docType: string;
  notes: string | null;
  status: "pending" | "submitted" | "approved" | "rejected";
  dueDate: string | null;
  changesRequested: string | null;
  needsExpirationDate: boolean;
};

function UploadPage() {
  const { token } = Route.useParams();
  const loadRequest = useServerFn(getUploadRequest);
  const [activeId, setActiveId] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["upload", token],
    queryFn: () => loadRequest({ data: { token } }),
  });

  if (isLoading) {
    return (
      <Frame>
        <p className="text-[15px] text-[#6b7280]">Loading your request…</p>
      </Frame>
    );
  }

  if (!data || data.state !== "ok") {
    const expired = data?.state === "expired";
    return (
      <Frame>
        <AlertTriangle className="h-7 w-7 text-brand" />
        <h1 className="mt-3 text-[20px]">
          {expired ? "This link has expired" : "This link is not valid"}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#6b7280]">
          Contact the general contractor who sent it and ask for a new upload link.
        </p>
      </Frame>
    );
  }

  const items = data.items as Item[];
  const outstanding = items.filter((item) => item.status === "pending" || item.status === "rejected");
  const active = items.find((item) => item.id === activeId) ?? null;

  if (active) {
    return (
      <Frame>
        <UploadForm
          token={token}
          item={active}
          onDone={async () => {
            setActiveId(null);
            await refetch();
          }}
          onCancel={() => setActiveId(null)}
        />
      </Frame>
    );
  }

  return (
    <Frame>
      <p className="text-[12px] font-bold tracking-[0.12em] text-[#6b7280] uppercase">
        Requested by {data.requestedBy}
      </p>
      <h1 className="mt-1 text-[21px] leading-tight">{data.company}</h1>
      {data.projectName ? (
        <p className="mt-1 text-[15px] text-[#374151]">{data.projectName}</p>
      ) : null}
      {data.audience === "broker" ? (
        <p className="mt-3 rounded-xl bg-surface-muted px-3.5 py-3 text-[14px] text-[#374151]">
          This link is for insurance certificates only.
        </p>
      ) : null}

      {outstanding.length === 0 ? (
        <div className="mt-6 rounded-xl bg-surface-muted px-4 py-5 text-center">
          <CheckCircle2 className="mx-auto h-7 w-7 text-success" />
          <p className="mt-2 text-[15px] font-semibold text-ink">Everything has been received</p>
          <p className="mt-1 text-[14px] text-[#6b7280]">
            {data.company || "The contractor"} will review your documents. You can close this page.
          </p>
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-[#6b7280]">
          {outstanding.length} document{outstanding.length === 1 ? "" : "s"} still needed.
        </p>
      )}

      <ul className="mt-4 space-y-2.5">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-border px-3.5 py-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[15px] font-semibold text-ink">{item.docType}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[#6b7280]">
                  <StatusIcon status={item.status} />
                  {statusLabel(item.status)}
                  {item.dueDate ? ` · due ${item.dueDate}` : ""}
                </p>
                {item.notes ? (
                  <p className="mt-1.5 text-[13px] text-[#374151]">{item.notes}</p>
                ) : null}
                {item.changesRequested ? (
                  <p className="mt-1.5 rounded-lg bg-brand-soft px-2.5 py-2 text-[13px] text-brand-hover">
                    Changes requested: {item.changesRequested}
                  </p>
                ) : null}
              </div>
              {item.status === "pending" || item.status === "rejected" ? (
                <button
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  className={`${btn.primary} shrink-0`}
                >
                  Upload
                </button>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  );
}

function statusLabel(status: Item["status"]) {
  if (status === "approved") return "Approved";
  if (status === "submitted") return "Received · awaiting review";
  if (status === "rejected") return "Changes requested";
  return "Not uploaded yet";
}

function StatusIcon({ status }: { status: Item["status"] }) {
  if (status === "approved") return <CheckCircle2 className="h-3.5 w-3.5 text-success" />;
  if (status === "submitted") return <Clock className="h-3.5 w-3.5 text-[#6b7280]" />;
  if (status === "rejected") return <AlertTriangle className="h-3.5 w-3.5 text-brand" />;
  return <UploadCloud className="h-3.5 w-3.5 text-[#6b7280]" />;
}

function UploadForm({
  token,
  item,
  onDone,
  onCancel,
}: {
  token: string;
  item: Item;
  onDone: () => void | Promise<void>;
  onCancel: () => void;
}) {
  const makeTarget = useServerFn(createUploadTarget);
  const finish = useServerFn(submitUpload);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const file = form.get("file");
    const expirationDate = String(form.get("expirationDate") ?? "");

    if (!(file instanceof File) || file.size === 0) {
      setError("Choose a photo or PDF of the document.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That file is larger than 25 MB. Try a photo instead.");
      return;
    }
    if (item.needsExpirationDate && !expirationDate) {
      setError("Enter the expiration date shown on the document.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const target = await makeTarget({
        data: {
          token,
          requestId: item.id,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
        },
      });
      const { error: upErr } = await supabase.storage
        .from("compliance-docs")
        .uploadToSignedUrl(target.path, target.token, file);
      if (upErr) throw new Error("The upload did not finish. Please try again.");
      await finish({
        data: {
          token,
          requestId: item.id,
          path: target.path,
          fileName: file.name,
          fileSize: file.size,
          contentType: file.type || "application/octet-stream",
          expirationDate: item.needsExpirationDate ? expirationDate : "",
        },
      });
      await onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={onCancel}
        className="text-[13px] font-semibold text-[#6b7280] hover:text-ink"
      >
        ← All documents
      </button>
      <h1 className="mt-3 text-[21px] leading-tight">{item.docType}</h1>
      {item.notes ? <p className="mt-1.5 text-[14px] text-[#374151]">{item.notes}</p> : null}

      <form onSubmit={onSubmit} className="mt-6 space-y-5" noValidate>
        {item.needsExpirationDate ? (
          <Field label="Expiration date" htmlFor="expirationDate">
            <input id="expirationDate" name="expirationDate" type="date" className={inputClass} />
          </Field>
        ) : null}

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
          {busy ? "Uploading…" : "Submit document"}
        </button>
      </form>
    </>
  );
}
