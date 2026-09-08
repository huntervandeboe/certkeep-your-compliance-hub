import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Container, Eyebrow } from "./primitives";

const faqs = [
  {
    q: "Do subcontractors need an account?",
    a: "No. They receive a secure upload link that works from a phone or computer.",
  },
  {
    q: "Does CertKeep verify insurance coverage?",
    a: "The initial version helps collect, organize, and review documents. Contractors remain responsible for determining whether coverage and requirements are acceptable.",
  },
  {
    q: "Can I import my existing spreadsheet?",
    a: "CSV importing is planned so contractors can begin with their existing subcontractor list.",
  },
  {
    q: "Will there be annual contracts?",
    a: "The planned Starter plan is month to month.",
  },
  {
    q: "Is this a replacement for my insurance broker or attorney?",
    a: "No. CertKeep is a document workflow and tracking tool, not an insurance, legal, or regulatory adviser.",
  },
  {
    q: "When will CertKeep be available?",
    a: "A limited pilot is being organized now.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="bg-surface py-[72px] md:py-[112px]">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)] lg:gap-20">
          <SectionHead
            eyebrow="Questions"
            title="Answers before you apply."
            className="lg:sticky lg:top-28 lg:self-start"
          />


          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, i) => (
              <AccordionItem key={faq.q} value={`item-${i}`} className="border-border">
                <AccordionTrigger className="py-5 text-left text-[17px] font-bold text-ink hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[16px] leading-relaxed text-[#374151]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
