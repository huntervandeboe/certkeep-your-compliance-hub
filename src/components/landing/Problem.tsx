import { FolderOpen, MailWarning, ShieldAlert } from "lucide-react";

import { Container, Eyebrow, Reveal } from "./primitives";

const pains = [
  {
    icon: ShieldAlert,
    title: "Expired coverage discovered after work begins",
    body: "A policy lapses quietly and nobody notices until the crew is already on site.",
  },
  {
    icon: MailWarning,
    title: "Hours spent sending the same follow-up emails",
    body: "The third reminder to the same subcontractor is not a good use of a coordinator's week.",
  },
  {
    icon: FolderOpen,
    title: "Documents scattered across inboxes and shared folders",
    body: "The current certificate exists somewhere. Finding it takes longer than it should.",
  },
];

export function Problem() {
  return (
    <section className="bg-background py-[72px] md:py-[112px]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Compliance without the chaos</Eyebrow>
            <h2 className="mt-5 max-w-[460px] text-[32px] leading-[1.12] font-extrabold sm:text-[42px]">
              Your spreadsheet cannot chase an expired policy.
            </h2>
            <p className="mt-6 max-w-[480px] text-[17px] leading-relaxed text-[#374151]">
              Subcontractor documents arrive through email, text messages, brokers, and jobsite
              conversations. CertKeep gives your team one place to see what is current, what is
              missing, and what needs attention.
            </p>
          </div>

          <ul className="space-y-4">
            {pains.map((pain, i) => (
              <Reveal as="li" key={pain.title} delay={i * 90}>
                <div className="flex gap-4 rounded-2xl border border-border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 sm:p-8">
                  <pain.icon className="mt-0.5 h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
                  <div className="min-w-0">
                    <h3 className="text-[17px] font-bold">{pain.title}</h3>
                    <p className="mt-2 text-[15px] leading-relaxed text-[#374151]">{pain.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
