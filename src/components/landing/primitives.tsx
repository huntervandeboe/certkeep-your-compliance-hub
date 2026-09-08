import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
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
        "flex items-start gap-3 text-[12px] font-bold tracking-[0.18em] uppercase",
        tone === "brand" ? "text-brand" : "text-white/60",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("mt-[0.55em] h-px w-8 shrink-0", tone === "brand" ? "bg-brand/40" : "bg-white/30")}
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
  "inline-flex items-center justify-center gap-2 rounded-[10px] text-[15px] font-semibold tracking-[-0.01em] transition-[background-color,border-color,color,box-shadow] duration-200 disabled:cursor-not-allowed disabled:opacity-60";

export const buttonStyles = {
  primary: cn(
    baseButton,
    "bg-brand px-6 py-3.5 text-white shadow-[0_1px_0_rgba(255,255,255,0.16)_inset,0_8px_20px_-12px_rgba(240,90,40,0.9)] hover:bg-brand-hover",
  ),
  secondary: cn(
    baseButton,
    "border border-border bg-surface px-6 py-3.5 text-ink hover:border-ink/30 hover:bg-surface-muted",
  ),
  ghostDark: cn(
    baseButton,
    "border border-white/20 bg-transparent px-6 py-3.5 text-white hover:border-white/50 hover:bg-white/5",
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
        "rounded-[14px] border border-border bg-surface p-7 sm:p-8",
        interactive &&
          "transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-[3px] hover:border-ink/20 hover:shadow-[0_20px_44px_-34px_rgba(17,24,39,0.5)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
