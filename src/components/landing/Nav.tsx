import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import { Logo } from "./Logo";
import { Container, buttonStyles } from "./primitives";

const links = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Security", href: "#security" },
  { label: "FAQ", href: "#faq" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-colors duration-300",
        scrolled ? "border-border bg-background/90 backdrop-blur-sm" : "border-transparent",
      )}
    >
      <Container>
        <div className="flex h-[72px] items-center justify-between gap-4">
          <a href="#top" className="shrink-0" aria-label="CertKeep home">
            <Logo />
          </a>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-[15px] font-medium text-[#374151] transition-colors hover:text-ink"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            <a
              href="/auth"
              className="text-[15px] font-semibold text-ink transition-colors hover:text-brand"
            >
              Log in
            </a>
            <a href="#pilot" className={buttonStyles.primary + " py-2.5"}>
              Join the Pilot
            </a>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {open && (
        <div
          id="mobile-nav"
          className="fixed inset-x-0 top-[72px] bottom-0 z-50 overflow-y-auto border-t border-border bg-background lg:hidden"
        >
          <Container className="py-6">
            <ul className="flex flex-col gap-1">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3.5 text-[17px] font-semibold text-ink hover:bg-surface-muted"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="#pilot"
                onClick={() => setOpen(false)}
                className={buttonStyles.primary + " w-full"}
              >
                Join the Pilot
              </a>
              <a
                href="/auth"
                onClick={() => setOpen(false)}
                className={buttonStyles.secondary + " w-full"}
              >
                Log in
              </a>
              <Link
                to="/privacy"
                onClick={() => setOpen(false)}
                className="px-1 py-2 text-sm text-[#374151]"
              >
                Privacy
              </Link>
            </div>
          </Container>
        </div>
      )}
    </header>
  );
}
