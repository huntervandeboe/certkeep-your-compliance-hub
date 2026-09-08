import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1240px] px-5 sm:px-8", className)}>{children}</div>
  );
}

export function Section({
  id,
  className,
  children,
  tone = "warm",
}: {
  id?: string;
  className?: string;
  children: ReactNode;
  tone?: "warm" | "white" | "muted" | "ink";
}) {
  const tones = {
    warm: "bg-background",
    white: "bg-surface",
    muted: "bg-surface-muted",
    ink: "bg-ink",
  } as const;

  return (
    <section id={id} className={cn("py-[72px] md:py-[112px]", tones[tone], className)}>
      {children}
    </section>
  );
}

export function Eyebrow({
  children,
  tone = "brand",
  className,
}: {
  children: ReactNode;
  tone?: "brand" | "light";
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-[12px] font-bold tracking-[0.18em] uppercase",
        tone === "brand" ? "text-brand" : "text-white/60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-px w-8", tone === "brand" ? "bg-brand/40" : "bg-white/30")}
      />
      {children}
    </p>
  );
}

export function SectionHead({
  eyebrow,
  title,
  children,
  tone = "brand",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  tone?: "brand" | "light";
  className?: string;
}) {
  return (
    <div className={cn("max-w-[620px]", className)}>
      <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
      <h2
        className={cn(
          "mt-6 text-[clamp(30px,4.2vw,46px)] leading-[1.06]",
          tone === "light" && "text-white",
        )}
      >
        {title}
      </h2>
      {children ? (
        <div
          className={cn(
            "mt-6 max-w-[52ch] text-[17px] leading-[1.65]",
            tone === "light" ? "text-white/70" : "text-[#374151]",
          )}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Component = Tag as "div";

  return (
    <Component
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn("reveal", visible && "is-visible", className)}
    >
      {children}
    </Component>
  );
}

const baseButton =
  "inline-flex items-center justify-center gap-2 rounded-xl text-[15px] font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: cn(
    baseButton,
    "bg-brand px-5 py-3 text-white shadow-[0_1px_2px_rgba(17,24,39,0.08)] hover:bg-brand-hover hover:-translate-y-0.5",
  ),
  secondary: cn(
    baseButton,
    "border border-border bg-surface px-5 py-3 text-ink hover:border-ink/25 hover:-translate-y-0.5",
  ),
  ghostDark: cn(
    baseButton,
    "border border-white/20 bg-transparent px-5 py-3 text-white hover:border-white/45",
  ),
};

export function Card({
  className,
  children,
  interactive = true,
}: {
  className?: string;
  children: ReactNode;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-7 sm:p-8",
        interactive &&
          "transition-all duration-300 hover:-translate-y-1 hover:border-ink/15 hover:shadow-[0_18px_40px_-28px_rgba(17,24,39,0.45)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
