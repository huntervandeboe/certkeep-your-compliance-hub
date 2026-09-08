import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      aria-hidden="true"
      className={cn("h-7 w-7", className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14 2.2 24 5.4v8.1c0 6-4.1 10.7-10 12.3-5.9-1.6-10-6.3-10-12.3V5.4L14 2.2Z"
        fill="currentColor"
        opacity="0.1"
      />
      <path
        d="M14 2.2 24 5.4v8.1c0 6-4.1 10.7-10 12.3-5.9-1.6-10-6.3-10-12.3V5.4L14 2.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="m9.4 13.9 3.1 3.2 6.1-6.4"
        stroke="var(--brand)"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark className={light ? "text-white" : "text-ink"} />
      <span
        className={cn(
          "text-[19px] font-extrabold tracking-[-0.03em]",
          light ? "text-white" : "text-ink",
        )}
      >
        CertKeep
      </span>
    </span>
  );
}
