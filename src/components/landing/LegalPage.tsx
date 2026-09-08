import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

import { Logo } from "./Logo";
import { Container } from "./primitives";

export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <Container className="py-10">
        <Link to="/" aria-label="CertKeep home">
          <Logo />
        </Link>
      </Container>
      <Container className="max-w-[760px] pb-24">
        <h1 className="text-4xl font-extrabold sm:text-5xl">{title}</h1>
        <div className="mt-8 space-y-5 text-[17px] leading-relaxed text-[#374151]">{children}</div>
        <Link
          to="/"
          className="mt-10 inline-flex items-center gap-2 text-[15px] font-semibold text-ink hover:text-brand"
        >
          <ArrowLeft className="h-4 w-4" />
          Back home
        </Link>
      </Container>
    </main>
  );
}
