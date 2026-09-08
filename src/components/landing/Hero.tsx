import { DashboardMockup } from "./DashboardMockup";
import { Container, Eyebrow, buttonStyles } from "./primitives";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-border"
      />
      <Container className="relative pt-16 pb-[76px] md:pt-24 md:pb-[120px]">
        <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-14">
          <div className="max-w-[560px] lg:pt-6">
            <Eyebrow>Built for small commercial contractors</Eyebrow>
            <h1 className="mt-7 text-[clamp(38px,6.2vw,64px)] leading-[1.02]">
              Stop chasing subcontractor certificates.
            </h1>
            <p className="mt-7 max-w-[48ch] text-[18px] leading-[1.65] text-[#374151]">
              Send one secure link. Subcontractors upload from their phones without creating an
              account. You approve the document, and CertKeep tracks every expiration.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <a href="/auth" className={buttonStyles.primary}>
                Create your account
              </a>
              <a href="#how-it-works" className={buttonStyles.secondary}>
                See how it works
              </a>
            </div>
            <p className="mt-6 border-t border-border pt-5 text-[14px] text-[#6b7280]">
              No sales call. No annual contract. Setup takes minutes.
            </p>
          </div>

          <div className="lg:-mr-6 xl:-mr-10">
            <DashboardMockup />
          </div>
        </div>
      </Container>
    </section>
  );
}

export function AudienceStrip() {
  return (
    <div className="border-y border-border bg-surface">
      <Container>
        <div className="grid gap-3 py-7 md:grid-cols-[auto_minmax(0,1fr)] md:items-baseline md:gap-10">
          <p className="text-[12px] font-bold tracking-[0.18em] text-[#9ca3af] uppercase">
            Who it is for
          </p>
          <p className="max-w-[70ch] text-[16px] leading-relaxed text-[#4b5563]">
            Designed for general contractors, project coordinators, operations teams, and risk
            administrators.
          </p>
        </div>
      </Container>
    </div>
  );
}
