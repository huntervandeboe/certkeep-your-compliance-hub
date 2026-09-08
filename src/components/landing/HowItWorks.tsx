import { Container, Reveal, SectionHead } from "./primitives";

const steps = [
  {
    number: "01",
    title: "Add the subcontractor",
    body: "Enter their company, trade, project, and contact information. CertKeep creates the standard document checklist.",
    note: "Company, trade, project, contact",
  },
  {
    number: "02",
    title: "Send one secure link",
    body: "The subcontractor opens the link on their phone and uploads a photo or PDF. No account. No password.",
    note: "Expiring, revocable, mobile-first",
  },
  {
    number: "03",
    title: "Approve it and move on",
    body: "Review the submission, approve or reject it, and let CertKeep monitor the expiration date.",
    note: "Approval, rejection, expiration watch",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-[72px] md:py-[120px]">
      <Container>
        <SectionHead eyebrow="How it works" title="Three steps, start to approved." />

        <ol className="mt-14 border-t border-border md:mt-16">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 110}>
              <div className="group grid gap-4 border-b border-border py-10 md:grid-cols-[auto_minmax(0,0.9fr)_minmax(0,1fr)] md:items-baseline md:gap-12 md:py-14">
                <span className="font-display text-[15px] font-bold tracking-[0.16em] text-brand tabular-nums">
                  {step.number}
                </span>
                <h3 className="text-[clamp(24px,2.6vw,32px)] leading-[1.1]">{step.title}</h3>
                <div>
                  <p className="max-w-[50ch] text-[16px] leading-[1.7] text-[#4b5563]">
                    {step.body}
                  </p>
                  <p className="mt-4 text-[13px] font-semibold tracking-[0.1em] text-[#9ca3af] uppercase">
                    {step.note}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </section>
  );
}
