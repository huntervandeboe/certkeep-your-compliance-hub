import { ArrowRight, Check } from "lucide-react";

import { Container, buttonStyles } from "./primitives";

const points = [
  "Create your workspace in a couple of minutes",
  "Send secure upload links right away",
  "No card required to get started",
];

export function SignUpCta() {
  return (
    <section id="signup" className="bg-surface-muted py-[72px] md:py-[112px]">
      <Container>
        <div className="overflow-hidden rounded-2xl border border-border bg-ink">
          <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:p-16">
            <div>
              <p className="text-[13px] font-bold tracking-[0.14em] text-brand uppercase">
                Get started
              </p>
              <h2 className="mt-5 text-[30px] leading-[1.12] font-extrabold text-white sm:text-[38px]">
                Create your CertKeep account.
              </h2>
              <p className="mt-5 max-w-[52ch] text-[17px] leading-relaxed text-white/70">
                Sign up, add your first subcontractor, and send a secure upload link today.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a href="/auth" className={buttonStyles.primary}>
                  Create your account
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a
                  href="/auth"
                  className="inline-flex items-center justify-center rounded-xl border border-white/25 px-6 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Log in
                </a>
              </div>
            </div>

            <ul className="space-y-4 border-t border-white/10 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
              {points.map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/10">
                    <Check className="h-3 w-3 text-brand" aria-hidden="true" />
                  </span>
                  <span className="text-[15px] leading-relaxed text-white/80">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
