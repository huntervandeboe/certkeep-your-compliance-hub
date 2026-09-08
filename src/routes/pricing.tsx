import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, ShieldCheck } from "lucide-react";

import { Footer } from "@/components/landing/Footer";
import { Logo } from "@/components/landing/Logo";
import { Container, buttonStyles } from "@/components/landing/primitives";

const included = [
  "Up to 25 active subcontractors",
  "Unlimited secure upload links",
  "Project requirements and start-date readiness",
  "Document review and correction requests",
  "Expiration and follow-up tracking",
  "CSV export",
  "One administrator",
];

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
  head: () => ({
    meta: [
      { title: "CertKeep Pricing | Starter at $49/month" },
      { name: "description", content: "See CertKeep Starter pricing for subcontractor document collection, review, reminders, and project readiness." },
      { property: "og:title", content: "CertKeep Pricing | Starter at $49/month" },
      { property: "og:description", content: "One straightforward plan for contractors tracking up to 25 active subcontractors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-ink">
      <header className="border-b border-border bg-background">
        <Container className="flex h-[72px] items-center justify-between">
          <Link to="/" aria-label="CertKeep home"><Logo /></Link>
          <div className="flex items-center gap-3">
            <Link to="/auth" className={buttonStyles.secondary}>Log in</Link>
            <Link to="/auth" className={buttonStyles.primary}>Start with CertKeep</Link>
          </div>
        </Container>
      </header>
      <main>
        <section className="border-b border-border py-16 sm:py-24">
          <Container>
            <div className="mx-auto max-w-[720px] text-center">
              <p className="text-[12px] font-bold tracking-[0.14em] text-brand uppercase">Simple pricing</p>
              <h1 className="mt-4 text-[42px] leading-[1.08] font-extrabold sm:text-[58px]">One plan for the team doing the chasing.</h1>
              <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-7 text-muted-foreground">Collect documents, work through reviews, and see what is holding up upcoming work without adding subcontractor logins.</p>
            </div>
            <div className="mx-auto mt-12 max-w-[920px] overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_70px_-48px_rgba(17,24,39,.5)]">
              <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
                <div className="bg-ink p-7 text-white sm:p-10">
                  <div className="flex items-center justify-between gap-3"><h2 className="text-[21px] text-white">Starter</h2><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold">Month to month</span></div>
                  <p className="mt-8 text-[54px] leading-none font-bold">$49<span className="text-[16px] font-semibold text-white/60"> / month</span></p>
                  <p className="mt-4 text-[14px] leading-6 text-white/65">For small and midsize contractors tracking up to 25 active subcontractors.</p>
                  <Link to="/auth" className={`${buttonStyles.primary} mt-8 w-full`}>Create your account <ArrowRight className="h-4 w-4" /></Link>
                  <p className="mt-4 text-center text-[11px] text-white/50">Payment checkout is not active yet. No charge is collected.</p>
                </div>
                <div className="p-7 sm:p-10">
                  <p className="text-[12px] font-bold text-muted-foreground">EVERYTHING IN STARTER</p>
                  <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                    {included.map((item) => <li key={item} className="flex gap-3 text-[14px] leading-5"><span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-success-soft"><Check className="h-3 w-3 text-success" /></span>{item}</li>)}
                  </ul>
                  <div className="mt-8 flex gap-3 border-t border-border pt-6"><ShieldCheck className="h-5 w-5 shrink-0 text-brand" /><p className="text-[12px] leading-5 text-muted-foreground">CertKeep reports document status against requirements you define. It does not make legal, safety, or coverage determinations.</p></div>
                </div>
              </div>
            </div>
          </Container>
        </section>
        <section className="py-14"><Container><div className="grid gap-6 md:grid-cols-3">{[["Can subcontractors upload free?","Yes. They use your secure link without creating an account."],["Is there an annual contract?","No. Starter is designed as a month-to-month plan."],["What happens above 25?","Talk with us about a plan sized to your active subcontractor roster."]].map(([q,a])=><div key={q} className="border-t border-ink pt-5"><h2 className="text-[15px]">{q}</h2><p className="mt-2 text-[13px] leading-6 text-muted-foreground">{a}</p></div>)}</div></Container></section>
      </main>
      <Footer />
    </div>
  );
}