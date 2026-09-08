import { BellRing, ClipboardCheck, FileSpreadsheet, History, LayoutList, Layers } from "lucide-react";

import { StatusPill } from "./DashboardMockup";
import { Card, Container, Reveal, SectionHead } from "./primitives";

function CardHead({
  icon: Icon,
  title,
}: {
  icon: typeof LayoutList;
  title: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-background">
        <Icon className="h-[18px] w-[18px] text-ink" aria-hidden="true" />
      </span>
      <h3 className="mt-2 text-[19px] leading-tight font-extrabold">{title}</h3>
    </div>
  );
}

export function Features() {
  return (
    <section id="features" className="bg-background py-[72px] md:py-[112px]">
      <Container>
        <SectionHead
          eyebrow="Features"
          title="Everything you need to keep documents current."
        />


        <div className="mt-14 grid gap-5 md:grid-cols-6">
          <Reveal className="md:col-span-4">
            <Card className="h-full">
              <CardHead icon={LayoutList} title="One clear compliance board" />
              <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-[#374151]">
                Filter by project, trade, and status to see exactly where each subcontractor stands.
              </p>
              <div className="mt-6 overflow-hidden rounded-xl border border-border">
                <div className="flex flex-wrap gap-2 border-b border-border bg-surface-muted px-3 py-2.5 text-[12px] font-semibold text-[#4b5563]">
                  <span className="rounded-md bg-surface px-2 py-1">Project: Riverside</span>
                  <span className="rounded-md bg-surface px-2 py-1">Trade: All</span>
                  <span className="rounded-md bg-surface px-2 py-1">Status: Needs attention</span>
                </div>
                <table className="w-full text-left">
                  <caption className="sr-only">Example filtered compliance rows</caption>
                  <tbody>
                    {[
                      { c: "Northline Concrete", t: "Concrete", s: "Expiring" as const },
                      { c: "Summit Fire Systems", t: "Fire protection", s: "Missing" as const },
                      { c: "Redgate Roofing", t: "Roofing", s: "Pending Review" as const },
                    ].map((r) => (
                      <tr key={r.c} className="border-b border-border last:border-0">
                        <td className="px-3 py-2.5 text-[14px] font-semibold text-ink">{r.c}</td>
                        <td className="hidden px-3 py-2.5 text-[14px] text-[#374151] sm:table-cell">
                          {r.t}
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <StatusPill status={r.s} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-2" delay={80}>
            <Card className="h-full">
              <CardHead icon={Layers} title="Requirements that start ready" />
              <p className="mt-4 text-[15px] leading-relaxed text-[#374151]">
                Trade-based templates give you a configurable starting point for roofing,
                electrical, plumbing, concrete, and general subcontractors.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Roofing", "Electrical", "Plumbing", "Concrete", "General"].map((t) => (
                  <span
                    key={t}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-[13px] font-semibold text-[#374151]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-3" delay={40}>
            <Card className="h-full">
              <CardHead icon={BellRing} title="Expiration alerts" />
              <p className="mt-4 text-[15px] leading-relaxed text-[#374151]">
                See what lapses next and send a reminder before the date arrives.
              </p>
              <div className="mt-6">
                <div className="flex justify-between text-[12px] font-semibold text-[#6b7280]">
                  <span>Today</span>
                  <span>In 30 days</span>
                </div>
                <div className="relative mt-2 h-2 rounded-full bg-surface-muted">
                  <span className="absolute top-1/2 left-[22%] h-3 w-3 -translate-y-1/2 rounded-full bg-warning" />
                  <span className="absolute top-1/2 left-[58%] h-3 w-3 -translate-y-1/2 rounded-full bg-warning" />
                  <span className="absolute top-1/2 left-[86%] h-3 w-3 -translate-y-1/2 rounded-full bg-brand" />
                </div>
                <ul className="mt-4 space-y-2 text-[14px] text-[#374151]">
                  <li className="flex justify-between gap-3">
                    <span>Northline Concrete — GL</span>
                    <span className="font-semibold text-warning">7 days</span>
                  </li>
                  <li className="flex justify-between gap-3">
                    <span>Apex Electrical — Workers comp</span>
                    <span className="font-semibold text-warning">18 days</span>
                  </li>
                </ul>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-3" delay={120}>
            <Card className="h-full">
              <CardHead icon={ClipboardCheck} title="Human-approved accuracy" />
              <p className="mt-4 text-[15px] leading-relaxed text-[#374151]">
                Every submission stays pending until a contractor reviews it and approves or rejects
                it. Nothing is marked current automatically.
              </p>
              <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-3">
                <StatusPill status="Pending Review" />
                <span className="text-[14px] text-[#374151]">awaiting your decision</span>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-2" delay={60}>
            <Card className="h-full">
              <CardHead icon={FileSpreadsheet} title="CSV in, CSV out" />
              <p className="mt-4 text-[15px] leading-relaxed text-[#374151]">
                Import the spreadsheet you already keep, and export your compliance data any time
                you need it.
              </p>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-4" delay={100}>
            <Card className="h-full">
              <CardHead icon={History} title="A complete activity record" />
              <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-[#374151]">
                Upload requests, submissions, approvals, rejections, and reminders are all recorded,
                so you can see what happened and when.
              </p>
              <ul className="mt-5 space-y-2.5 text-[14px] text-[#374151]">
                {[
                  "Upload link sent to Apex Electrical",
                  "Certificate submitted from mobile",
                  "Approved by project coordinator",
                ].map((line, i) => (
                  <li key={line} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <span>{line}</span>
                    <span className="ml-auto text-[13px] text-[#9ca3af]">
                      {["9:12 AM", "1:44 PM", "4:03 PM"][i]}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
