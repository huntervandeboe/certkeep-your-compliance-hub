import { DashboardMockup } from "./DashboardMockup";
import { Container, Eyebrow, buttonStyles } from "./primitives";

export function Hero() {
  return (
    <section id="top" className="bg-background pt-14 pb-[72px] md:pt-20 md:pb-[112px]">
      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="max-w-[600px]">
            <Eyebrow>Built for small commercial contractors</Eyebrow>
            <h1 className="mt-5 text-[40px] leading-[1.05] font-extrabold sm:text-[52px] lg:text-[60px]">
              Stop chasing subcontractor certificates.
            </h1>
            <p className="mt-6 max-w-[520px] text-[18px] leading-relaxed text-[#374151]">
              Send one secure link. Subcontractors upload from their phones without creating an
              account. You approve the document, and CertKeep tracks every expiration.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a href="#pilot" className={buttonStyles.primary}>
                Join the 30-Day Pilot
              </a>
              <a href="#how-it-works" className={buttonStyles.secondary}>
                See how it works
              </a>
            </div>
            <p className="mt-5 text-[14px] text-[#6b7280]">
              No sales call. No annual contract. Setup takes minutes.
            </p>
          </div>

          <div className="lg:pl-4">
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
        <p className="py-6 text-center text-[15px] text-[#6b7280]">
          Designed for general contractors, project coordinators, operations teams, and risk
          administrators.
        </p>
      </Container>
    </div>
  );
}
