import { Link } from "@tanstack/react-router";

import { Logo } from "./Logo";
import { Container } from "./primitives";

const productLinks = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "#security" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background">
      <Container>
        <div className="grid gap-10 py-14 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-[320px] text-[15px] leading-relaxed text-[#6b7280]">
              Collect, review, and track subcontractor insurance, licenses, and compliance documents
              in one place.
            </p>
          </div>

          <nav aria-label="Product">
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">
              Product
            </h2>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[15px] text-[#374151] transition-colors hover:text-brand"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Company">
            <h2 className="text-[13px] font-bold tracking-[0.14em] text-[#6b7280] uppercase">
              Company
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  to="/privacy"
                  className="text-[15px] text-[#374151] transition-colors hover:text-brand"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-[15px] text-[#374151] transition-colors hover:text-brand"
                >
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="#pilot"
                  className="text-[15px] text-[#374151] transition-colors hover:text-brand"
                >
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="border-t border-border py-6">
          <p className="text-[14px] text-[#6b7280]">© {year} CertKeep. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
