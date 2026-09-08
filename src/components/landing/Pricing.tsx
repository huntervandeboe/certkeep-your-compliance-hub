import { Check } from "lucide-react";

import { Container, Reveal, SectionHead, buttonStyles } from "./primitives";

const included = [
  "Account-free upload links",
  "Document requirements",
  "Approval and rejection workflow",
  "Expiration monitoring",
  "Email reminders",
  "CSV import and export",
  "One administrator",
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-background py-[72px] md:py-[112px]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-20">
          <SectionHead
            eyebrow="Straightforward pricing"
            title="Start small. Stay month to month."
            className="lg:sticky lg:top-28 lg:self-start"
          >
            One plan while we run the pilot. If your subcontractor list grows past the Starter
            limit, we will work out the next tier with you directly.
          </SectionHead>

          <Reveal>
            <div className="rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-40px_rgba(17,24,39,0.55)] sm:p-9">
              <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-[20px] font-extrabold">Starter</h3>
                <span className="rounded-full bg-brand-soft px-3 py-1 text-[12px] font-bold text-brand-hover">
                  Pilot plan
                </span>
              </div>
              <p className="mt-6 text-[44px] leading-none font-extrabold text-ink">
                $49
                <span className="text-[17px] font-semibold text-[#6b7280]">/month</span>
              </p>
              <p className="mt-3 text-[15px] text-[#374151]">
                For contractors tracking up to 25 active subcontractors.
              </p>

              <ul className="mt-8 space-y-3 border-t border-border pt-8">
                {included.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft">
                      <Check className="h-3 w-3 text-success" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] text-[#374151]">{item}</span>
                  </li>
                ))}
              </ul>

              <a href="#pilot" className={buttonStyles.primary + " mt-8 w-full"}>
                Join the 30-Day Pilot
              </a>
              <p className="mt-4 text-center text-[14px] text-[#6b7280]">
                14-day free trial planned after the pilot. No annual contract.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
