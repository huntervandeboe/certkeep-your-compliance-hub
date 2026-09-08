import { Check, Minus } from "lucide-react";

import { Container, Eyebrow, Reveal } from "./primitives";

const oldWay = [
  "Spreadsheet rows",
  "Repeated follow-up emails",
  "Documents buried in folders",
  "Subcontractor passwords",
  "Surprise expirations",
];

const newWay = [
  "Live status dashboard",
  "One-click upload requests",
  "Central document history",
  "No subcontractor account",
  "Proactive expiration alerts",
];

export function Comparison() {
  return (
    <section className="bg-surface-muted py-[72px] md:py-[112px]">
      <Container>
        <div className="max-w-[560px]">
          <Eyebrow>The difference</Eyebrow>
          <h2 className="mt-5 text-[32px] leading-[1.12] font-extrabold sm:text-[42px]">
            Same job. Far less chasing.
          </h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-2xl border border-border bg-surface/60 p-7 sm:p-8">
              <h3 className="text-[13px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">
                The current workflow
              </h3>
              <ul className="mt-6 space-y-3.5">
                {oldWay.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <Minus className="h-4 w-4 shrink-0 text-[#9ca3af]" aria-hidden="true" />
                    <span className="text-[16px] text-[#6b7280]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="h-full rounded-2xl border border-ink/10 bg-surface p-7 shadow-[0_20px_50px_-40px_rgba(17,24,39,0.6)] sm:p-8">
              <h3 className="text-[13px] font-bold tracking-[0.14em] text-brand uppercase">
                With CertKeep
              </h3>
              <ul className="mt-6 space-y-3.5">
                {newWay.map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft">
                      <Check className="h-3 w-3 text-success" aria-hidden="true" />
                    </span>
                    <span className="text-[16px] font-medium text-ink">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
