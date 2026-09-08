import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const pilotApplicationSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name").max(120),
  workEmail: z
    .string()
    .trim()
    .min(1, "Enter your work email")
    .email("Enter a valid email address")
    .max(255),
  phone: z.string().trim().max(40).optional().default(""),
  company: z.string().trim().min(1, "Enter your company name").max(160),
  state: z.string().trim().max(60).optional().default(""),
  jobTitle: z.string().trim().max(120).optional().default(""),
  subcontractorCount: z.string().trim().max(60).optional().default(""),
  trackingMethod: z.string().trim().max(120).optional().default(""),
  biggestProblem: z.string().trim().max(2000).optional().default(""),
});

export type PilotApplication = z.infer<typeof pilotApplicationSchema>;

export const submitPilotApplication = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => pilotApplicationSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { error } = await supabaseAdmin.from("pilot_applications").insert({
      full_name: data.fullName,
      work_email: data.workEmail,
      phone: data.phone || null,
      company: data.company,
      state: data.state || null,
      job_title: data.jobTitle || null,
      subcontractor_count: data.subcontractorCount || null,
      tracking_method: data.trackingMethod || null,
      biggest_problem: data.biggestProblem || null,
    });

    if (error) {
      console.error("pilot application insert failed", error);
      throw new Error("We could not save your application. Please try again.");
    }

    return { ok: true as const };
  });
