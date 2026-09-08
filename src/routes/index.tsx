import { createFileRoute } from "@tanstack/react-router";

import { Comparison } from "@/components/landing/Comparison";
import { FAQ } from "@/components/landing/FAQ";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { AudienceStrip, Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { MagicLink } from "@/components/landing/MagicLink";
import { Nav } from "@/components/landing/Nav";
import { SignUpCta } from "@/components/landing/SignUpCta";
import { Pricing } from "@/components/landing/Pricing";
import { Problem } from "@/components/landing/Problem";

const title = "CertKeep | Subcontractor Compliance Without the Chasing";
const description =
  "Collect, review, and track subcontractor insurance, licenses, and compliance documents with secure account-free upload links.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "CertKeep" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <AudienceStrip />
        <Problem />
        <HowItWorks />
        <MagicLink />
        <Features />
        <Comparison />
        <Pricing />
        <SignUpCta />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
