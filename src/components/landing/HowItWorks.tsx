import { Container, Eyebrow, Reveal } from "./primitives";

const steps = [
  {
    number: "01",
    title: "Add the subcontractor",
    body: "Enter their company, trade, project, and contact information. CertKeep creates the standard document checklist.",
  },
  {
    number: "02",
    title: "Send one secure link",
    body: "The subcontractor opens the link on their phone and uploads a photo or PDF. No account. No password.",
  },
  {
    number: "03",
    title: "Approve it and move on",
    body: "Review the submission, approve or reject it, and let CertKeep monitor the expiration date.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-surface py-[72px] md:py-[112px]">
      <Container>
        <div className="max-w-[560px]">
          <Eyebrow>How it works</Eyebrow>
          <h2 className="mt-5 text-[32px] leading-[1.12] font-extrabold sm:text-[42px]">
            Three steps, start to approved.
          </h2>
        </div>

        <div className="relative mt-14 grid gap-10 md:grid-cols-3 md:gap-8">
          <div
            aria-hidden="true"
            className="absolute top-[26px] right-[12%] left-[12%] hidden h-px bg-border md:block"
          />
          {steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 120} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full border border-border bg-surface text-[16px] font-extrabold text-brand">
                  {step.number}
                </span>
              </div>
              <h3 className="mt-6 text-[22px] font-extrabold">{step.title}</h3>
              <p className="mt-3 max-w-[340px] text-[16px] leading-relaxed text-[#374151]">
                {step.body}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
