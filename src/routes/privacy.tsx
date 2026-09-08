import { Link, createFileRoute } from "@tanstack/react-router";

import { LegalPage } from "@/components/landing/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy | CertKeep" },
      {
        name: "description",
        content: "CertKeep's privacy policy is being prepared ahead of the pilot release.",
      },
      { property: "og:title", content: "Privacy | CertKeep" },
      {
        property: "og:description",
        content: "CertKeep's privacy policy is being prepared ahead of the pilot release.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <LegalPage title="Privacy">
      <p>
        CertKeep is in pre-release. A full privacy policy will be published before the product is
        generally available.
      </p>
      <p>
        Today, the only information we collect is what you provide when you create an account and
        use CertKeep. We use it to run the service and support you. We do not sell it and we do not
        share it with advertisers.
      </p>
      <p>
        If you would like your account information removed, ask us and we will delete it.{" "}
        <Link to="/" className="font-semibold text-brand hover:text-brand-hover">
          Return to the homepage
        </Link>
        .
      </p>
    </LegalPage>
  );
}
