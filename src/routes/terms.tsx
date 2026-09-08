import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/landing/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms | CertKeep" },
      {
        name: "description",
        content: "CertKeep's terms of service are being prepared ahead of the pilot release.",
      },
      { property: "og:title", content: "Terms | CertKeep" },
      {
        property: "og:description",
        content: "CertKeep's terms of service are being prepared ahead of the pilot release.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <LegalPage title="Terms">
      <p>
        CertKeep is in pre-release. Full terms of service will be published before the product is
        generally available.
      </p>
      <p>
        Pilot participation is voluntary, month to month, and carries no contract or obligation.
        CertKeep is a document workflow and tracking tool. It is not an insurance, legal, or
        regulatory adviser, and it does not determine whether coverage or requirements are
        acceptable.
      </p>
      <p>
        <Link to="/" className="font-semibold text-brand hover:text-brand-hover">
          Return to the homepage
        </Link>
        .
      </p>
    </LegalPage>
  );
}
