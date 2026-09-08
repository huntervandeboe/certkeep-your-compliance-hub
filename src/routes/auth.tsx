import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";

import { LogoMark } from "@/components/landing/Logo";
import { Field, btn, inputClass } from "@/components/app/ui";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/auth")({
  ssr: false,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in | CertKeep" },
      {
        name: "description",
        content:
          "Sign in to CertKeep to request, review, and track subcontractor compliance documents.",
      },
      { property: "og:title", content: "Sign in | CertKeep" },
      {
        property: "og:description",
        content: "Manage subcontractor insurance and compliance documents in one place.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.42 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/dashboard" });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin + "/dashboard",
            data: { full_name: fullName },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setNotice("Check your email to confirm your address, then sign in.");
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    setError("");
    try {
      await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    } catch {
      setError("Google sign-in is unavailable right now.");
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 lg:flex">
        <div
          className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-brand/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-white/5 blur-3xl"
          aria-hidden
        />
        <Link to="/" className="relative flex items-center gap-2.5 text-white">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-[18px] font-bold">CertKeep</span>
        </Link>

        <div className="relative max-w-[36ch]">
          <h1 className="font-display text-[42px] leading-[1.06] font-bold tracking-[-0.02em] text-white">
            One link. No accounts. Every certificate tracked.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-white/65">
            Request a document, let the subcontractor upload it from their phone, approve it, and
            watch the expiration date for you.
          </p>

          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-white/50 uppercase">
                Compliance board
              </p>
              <span className="rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                84% compliant
              </span>
            </div>
            <div className="mt-4 space-y-2.5">
              {[
                ["Apex Electrical", "General Liability", "Approved", "text-emerald-300 bg-success/15"],
                ["Northline Concrete", "W-9", "In review", "text-amber-300 bg-amber-400/15"],
                ["Summit Fire Systems", "License", "Expiring soon", "text-orange-300 bg-brand/20"],
              ].map(([name, doc, status, cls]) => (
                <div
                  key={name}
                  className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.05] px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-white">{name}</p>
                    <p className="text-[11.5px] text-white/45">{doc}</p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex items-center gap-6 text-[13px] text-white/45">
          <span>No-account uploads</span>
          <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
          <span>Expiration tracking</span>
          <span className="h-1 w-1 rounded-full bg-white/25" aria-hidden />
          <span>Early release</span>
        </div>
      </div>

      <div className="flex items-center justify-center bg-[#f4f5f7] px-5 py-14">
        <div className="w-full max-w-[420px] rounded-3xl border border-black/[0.05] bg-white p-8 shadow-[0_24px_60px_-32px_rgba(17,24,39,0.25)] sm:p-9">
          <Link to="/" className="mb-8 flex items-center gap-2.5 text-ink lg:hidden">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-[18px] font-bold">CertKeep</span>
          </Link>

          <h2 className="font-display text-[26px] leading-tight font-bold tracking-[-0.01em]">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            {mode === "signup"
              ? "Set up your compliance board in a couple of minutes."
              : "Sign in to your compliance board."}
          </p>

          <button
            type="button"
            onClick={google}
            className="mt-7 flex w-full items-center justify-center gap-2.5 rounded-xl border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] font-semibold text-ink transition hover:border-[#d1d5db] hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:outline-none"
          >
            <GoogleLogo />
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3 text-[12px] font-semibold tracking-[0.14em] text-[#9ca3af] uppercase">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            {mode === "signup" ? (
              <Field label="Full name" htmlFor="fullName">
                <input
                  id="fullName"
                  className={inputClass}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
            ) : null}

            <Field label="Work email" htmlFor="email">
              <input
                id="email"
                type="email"
                required
                className={inputClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>

            <Field label="Password" htmlFor="password">
              <input
                id="password"
                type="password"
                required
                minLength={8}
                className={inputClass}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </Field>

            {error ? (
              <p
                className="rounded-xl bg-brand-soft px-3.5 py-3 text-[14px] text-brand-hover"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            {notice ? (
              <p className="rounded-xl bg-success-soft px-3.5 py-3 text-[14px] text-success">
                {notice}
              </p>
            ) : null}

            <button type="submit" disabled={busy} className={`${btn.primary} w-full`}>
              {busy ? "Working..." : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[14px] text-[#6b7280]">
            {mode === "signup" ? "Already have an account?" : "New to CertKeep?"}{" "}
            <button
              type="button"
              className="font-semibold text-brand hover:text-brand-hover"
              onClick={() => {
                setMode(mode === "signup" ? "signin" : "signup");
                setError("");
                setNotice("");
              }}
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
}
