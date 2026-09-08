import { Check, Minus } from "lucide-react";

import { Container, Reveal, SectionHead } from "./primitives";

const rows: { old: string; now: string }[] = [
  { old: "Spreadsheet rows", now: "Live status dashboard" },
  { old: "Repeated follow-up emails", now: "One-click upload requests" },
  { old: "Documents buried in folders", now: "Central document history" },
  { old: "Subcontractor passwords", now: "No subcontractor account" },
  { old: "Surprise expirations", now: "Proactive expiration alerts" },
];

export function Comparison() {
  return (
    <section className="bg-surface-muted py-[72px] md:py-[120px]">
      <Container>
        <SectionHead eyebrow="The difference" title="Same job. Far less chasing." />

        <Reveal className="mt-12 md:mt-14">
          <div className="overflow-hidden rounded-[14px] border border-border bg-surface">
            <div className="grid grid-cols-1 border-b border-border sm:grid-cols-2">
              <p className="px-6 py-4 text-[12px] font-bold tracking-[0.18em] text-[#9ca3af] uppercase sm:border-r sm:border-border">
                The current workflow
              </p>
              <p className="hidden px-6 py-4 text-[12px] font-bold tracking-[0.18em] text-brand uppercase sm:block">
                With CertKeep
              </p>
            </div>

            {rows.map((row) => (
              <div
                key={row.old}
                className="grid grid-cols-1 border-b border-border last:border-b-0 sm:grid-cols-2"
              >
                <div className="flex items-center gap-3 bg-surface-muted/50 px-6 py-5 sm:border-r sm:border-border">
                  <Minus className="h-4 w-4 shrink-0 text-[#9ca3af]" aria-hidden="true" />
                  <span className="text-[16px] text-[#6b7280] line-through decoration-[#d1d5db]">
                    {row.old}
                  </span>
                </div>
                <div className="flex items-center gap-3 px-6 py-5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft">
                    <Check className="h-3 w-3 text-success" aria-hidden="true" />
                  </span>
                  <span className="text-[16px] font-semibold text-ink">{row.now}</span>
                </div>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
