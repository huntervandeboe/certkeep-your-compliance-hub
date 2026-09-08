import { Check } from "lucide-react";

import { PhoneMockup } from "./PhoneMockup";
import { Container, Reveal } from "./primitives";

const bullets = [
  "No subcontractor account",
  "Photo or PDF upload",
  "Expiring and revocable link",
  "Works from any modern phone",
  "Contractor review before approval",
];

export function MagicLink() {
  return (
    <section id="security" className="bg-ink py-[72px] md:py-[112px]">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)] lg:gap-20">
          <div>
            <p className="text-[13px] font-bold tracking-[0.14em] text-brand uppercase">
              The magic link
            </p>
            <h2 className="mt-5 max-w-[560px] text-[32px] leading-[1.1] font-extrabold text-white sm:text-[44px]">
              The easiest upload is the one that does not require a login.
            </h2>
            <p className="mt-6 max-w-[520px] text-[17px] leading-relaxed text-white/70">
              Field teams should not have to remember another password. Every request opens a
              secure, mobile-friendly upload page designed to be completed in seconds.
            </p>

            <ul className="mt-9 grid gap-3 sm:grid-cols-2">
              {bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand">
                    <Check className="h-3 w-3 text-white" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] text-white/90">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <Reveal>
            <PhoneMockup />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
