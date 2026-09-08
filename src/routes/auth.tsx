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
    <main className="grid min-h-screen lg:grid-cols-[1fr_minmax(0,520px)]">
      <div className="hidden flex-col justify-between bg-ink p-12 lg:flex">
        <Link to="/" className="flex items-center gap-2.5 text-white">
          <LogoMark className="h-6 w-6" />
          <span className="font-display text-[18px] font-bold">CertKeep</span>
        </Link>
        <div className="max-w-[34ch]">
          <h1 className="font-display text-[40px] leading-[1.08] font-bold text-white">
            One link. No accounts. Every certificate tracked.
          </h1>
          <p className="mt-5 text-[16px] leading-relaxed text-white/65">
            Request a document, let the subcontractor upload it from their phone, approve it, and
            watch the expiration date for you.
          </p>
        </div>
        <p className="text-[13px] text-white/40">Pilot release</p>
      </div>

      <div className="flex items-center justify-center bg-background px-5 py-14">
        <div className="w-full max-w-[400px]">
          <Link to="/" className="mb-8 flex items-center gap-2.5 text-ink lg:hidden">
            <LogoMark className="h-6 w-6" />
            <span className="font-display text-[18px] font-bold">CertKeep</span>
          </Link>

          <h2 className="text-[26px] leading-tight">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-[15px] text-[#6b7280]">
            {mode === "signup"
              ? "Set up your compliance board in a couple of minutes."
              : "Sign in to your compliance board."}
          </p>

          <button type="button" onClick={google} className={`${btn.ghost} mt-7 w-full`}>
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
