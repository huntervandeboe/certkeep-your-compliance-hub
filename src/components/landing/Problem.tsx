import { FolderOpen, MailWarning, ShieldAlert } from "lucide-react";

import { Container, Reveal, SectionHead } from "./primitives";

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
    <section className="bg-background py-[72px] md:py-[120px]">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-24">
          <SectionHead
            eyebrow="Compliance without the chaos"
            title="Your spreadsheet cannot chase an expired policy."
            className="lg:sticky lg:top-28 lg:self-start"
          >
            Subcontractor documents arrive through email, text messages, brokers, and jobsite
            conversations. CertKeep gives your team one place to see what is current, what is
            missing, and what needs attention.
          </SectionHead>

          <ul className="border-t border-border">
            {pains.map((pain, i) => (
              <Reveal as="li" key={pain.title} delay={i * 90}>
                <div className="group grid grid-cols-[auto_minmax(0,1fr)] gap-5 border-b border-border py-8 transition-colors duration-300 hover:bg-surface/70 sm:gap-7 sm:py-9">
                  <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-border bg-surface transition-colors duration-300 group-hover:border-brand/40">
                    <pain.icon className="h-4 w-4 text-brand" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[18px] leading-snug">{pain.title}</h3>
                    <p className="mt-2.5 max-w-[52ch] text-[15px] leading-[1.7] text-[#4b5563]">
                      {pain.body}
                    </p>
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
