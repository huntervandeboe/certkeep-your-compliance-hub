import { CalendarDays, Lock, UploadCloud } from "lucide-react";

import { LogoMark } from "./Logo";

export function PhoneMockup() {
  return (
    <div className="mx-auto w-full max-w-[320px] rounded-[34px] border border-white/15 bg-white/5 p-3">
      <div className="overflow-hidden rounded-[26px] border border-border bg-surface">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <LogoMark className="h-5 w-5 text-ink" />
          <p className="text-[13px] font-bold text-ink">CertKeep secure request</p>
        </div>

        <div className="space-y-4 px-4 py-5">
          <div>
            <p className="text-[12px] font-bold tracking-[0.12em] text-[#6b7280] uppercase">
              Requested from
            </p>
            <p className="text-[16px] font-extrabold text-ink">Apex Electrical</p>
            <p className="mt-1 text-[14px] text-[#374151]">General Liability Certificate</p>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Expiration date</p>
            <div className="flex items-center justify-between rounded-xl border border-border bg-background px-3 py-2.5">
              <span className="text-[14px] text-[#374151]">03 / 14 / 2027</span>
              <CalendarDays className="h-4 w-4 text-[#6b7280]" />
            </div>
          </div>

          <div>
            <p className="mb-1.5 text-[13px] font-semibold text-ink">Document</p>
            <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-[#d1d5db] bg-background px-3 py-6 text-center">
              <UploadCloud className="h-5 w-5 text-brand" />
              <span className="text-[14px] font-semibold text-ink">Take a photo or attach PDF</span>
              <span className="text-[12px] text-[#6b7280]">JPG, PNG or PDF</span>
            </div>
          </div>

          <div className="w-full rounded-xl bg-brand px-4 py-3 text-center text-[15px] font-semibold text-white">
            Submit document
          </div>

          <p className="flex items-center justify-center gap-1.5 text-[12px] text-[#6b7280]">
            <Lock className="h-3.5 w-3.5" />
            No account required
          </p>
        </div>
      </div>
    </div>
  );
}
