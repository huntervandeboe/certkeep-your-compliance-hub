import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  isInsuranceDocType,
  isRestrictedDocType,
  requiresExpirationDate,
} from "@/lib/domain/status";

const BUCKET = "compliance-docs";

export const DOC_TYPES = [
  "General Liability Certificate",
  "Workers Compensation Certificate",
  "Auto Liability Certificate",
  "Umbrella / Excess Liability",
  "Contractor License",
  "W-9",
  "Signed Subcontract",
  "Safety Program",
] as const;

export type DocStatus = "pending" | "submitted" | "approved" | "rejected";

async function ensureWorkspace(context: { userId: string; claims: unknown }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: existing } = await supabaseAdmin
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name)")
    .eq("user_id", context.userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  if (existing) return existing;

  const claims = context.claims as {
    email?: string;
    user_metadata?: { full_name?: string; company_name?: string };
  };
  const workspaceName = claims.user_metadata?.company_name || "My workspace";
  const { data: workspace, error } = await supabaseAdmin
    .from("workspaces")
    .insert({ name: workspaceName, owner_user_id: context.userId })
    .select("id, name")
    .single();
  if (error || !workspace) throw new Error("Could not prepare your workspace.");

  await Promise.all([
    supabaseAdmin.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: context.userId,
      email: claims.email ?? null,
      display_name: claims.user_metadata?.full_name ?? null,
      role: "owner",
      status: "active",
    }),
    supabaseAdmin.from("user_roles").insert({
      workspace_id: workspace.id,
      user_id: context.userId,
      role: "owner",
    }),
  ]);

  return { workspace_id: workspace.id, role: "owner" as const, workspaces: workspace };
}

function randomToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replace(/-/g, "");
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-80);
}

/** Links are stored as hashes; the raw code only ever lives in the URL we hand out. */
export async function hashToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

const LINK_TTL_DAYS = 21;

type LinkClient = {
  from: (table: string) => {
    insert: (rows: unknown) => {
      select: (cols: string) => { single: () => Promise<{ data: { id: string } | null }> };
    };
  };
};

/** Creates one scoped upload link covering the given document requests. */
async function createUploadLinkFor(
  client: unknown,
  input: {
    workspaceId: string;
    subcontractorId: string;
    projectId?: string | null;
    createdBy: string;
    requestIds: string[];
    audience?: "subcontractor" | "broker";
    expiresAt?: Date;
  },
) {
  const supabase = client as LinkClient;
  const raw = randomToken();
  const expires = input.expiresAt ?? new Date(Date.now() + LINK_TTL_DAYS * 86400000);
  const { data: link } = await supabase
    .from("upload_links")
    .insert({
      workspace_id: input.workspaceId,
      subcontractor_id: input.subcontractorId,
      project_id: input.projectId ?? null,
      token_hash: await hashToken(raw),
      audience: input.audience ?? "subcontractor",
      expires_at: expires.toISOString(),
      created_by: input.createdBy,
    })
    .select("id")
    .single();
  if (!link) throw new Error("Could not create a secure upload link.");
  await (
    supabase as unknown as {
      from: (t: string) => { insert: (rows: unknown) => Promise<unknown> };
    }
  )
    .from("upload_link_items")
    .insert(
      input.requestIds.map((requestId) => ({
        workspace_id: input.workspaceId,
        upload_link_id: link.id,
        document_request_id: requestId,
      })),
    );
  return { token: raw, linkId: link.id, expiresAt: expires.toISOString() };
}

/* ------------------------------------------------------------------ */
/* Contractor-side (authenticated)                                     */
/* ------------------------------------------------------------------ */

export const getWorkspace = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId, claims } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, company_name")
      .eq("id", userId)
      .maybeSingle();

    if (!profile) {
      await supabase.from("profiles").insert({
        id: userId,
        full_name:
          (claims as { user_metadata?: { full_name?: string } })?.user_metadata?.full_name ?? null,
      });
    }

    const membership = await ensureWorkspace(context);
    const [{ data: subs }, { data: requests }, { data: projects }, { data: assignments }] =
      await Promise.all([
        supabase
          .from("subcontractors")
          .select(
            "id, company, trade, project, contact_name, contact_email, created_at, workspace_id",
          )
          .eq("workspace_id", membership.workspace_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("document_requests")
          .select(
            "id, subcontractor_id, doc_type, status, expiration_date, submitted_at, created_at, reviewed_at, due_date, assigned_to_user_id, project_id, requirement_id, last_requested_at, next_reminder_at, rejection_reason, file_path, token",
          )
          .eq("workspace_id", membership.workspace_id)
          .order("created_at", { ascending: false }),
        supabase
          .from("projects")
          .select("id, name, start_date, end_date, status")
          .eq("workspace_id", membership.workspace_id),
        supabase
          .from("project_subcontractors")
          .select("id, project_id, subcontractor_id, planned_start_date")
          .eq("workspace_id", membership.workspace_id),
      ]);

    return {
      email: (claims as { email?: string })?.email ?? "",
      profile: profile ?? { full_name: null, company_name: null },
      subcontractors: subs ?? [],
      requests: requests ?? [],
      projects: projects ?? [],
      assignments: assignments ?? [],
      workspace: {
        id: membership.workspace_id,
        name: membership.workspaces?.name ?? "My workspace",
      },
    };
  });

export const getCommandCenter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const membership = await ensureWorkspace(context);
    const workspaceId = membership.workspace_id;
    const [
      { data: projects },
      { data: activity },
      { data: requirements },
      { data: assignments },
      { data: reminders },
      { data: members },
      legacy,
    ] = await Promise.all([
      context.supabase
        .from("projects")
        .select("id, name, code, location, status, start_date, end_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("activity_events")
        .select("id, event_type, entity_type, title, detail, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(8),
      context.supabase
        .from("compliance_requirements")
        .select("id, project_id, name, document_type, trade, expiration_warning_days, status")
        .eq("workspace_id", workspaceId),
      context.supabase
        .from("project_subcontractors")
        .select("id, project_id, subcontractor_id, planned_start_date")
        .eq("workspace_id", workspaceId),
      context.supabase
        .from("reminder_events")
        .select(
          "id, document_request_id, recipient_email, status, scheduled_for, sent_at, created_at",
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      context.supabase
        .from("workspace_members")
        .select("user_id, display_name, email, role")
        .eq("workspace_id", workspaceId)
        .eq("status", "active"),
      Promise.all([
        context.supabase
          .from("subcontractors")
          .select("id, company, trade, project, contact_name, contact_email, created_at")
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false }),
        context.supabase
          .from("document_requests")
          .select(
            "id, subcontractor_id, doc_type, status, expiration_date, submitted_at, reviewed_at, created_at, due_date, assigned_to_user_id, project_id, requirement_id, last_requested_at, next_reminder_at, rejection_reason, file_path, token",
          )
          .eq("workspace_id", workspaceId)
          .order("created_at", { ascending: false }),
      ]),
    ]);

    return {
      workspace: {
        id: workspaceId,
        name: membership.workspaces?.name ?? "My workspace",
        role: membership.role,
      },
      projects: projects ?? [],
      requirements: requirements ?? [],
      assignments: assignments ?? [],
      reminders: reminders ?? [],
      members: members ?? [],
      currentUserId: context.userId,
      activity: activity ?? [],
      subcontractors: legacy[0].data ?? [],
      requests: legacy[1].data ?? [],
    };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        name: z.string().trim().min(2, "Enter a project name").max(160),
        code: z.string().trim().max(40).optional().default(""),
        location: z.string().trim().max(180).optional().default(""),
        startDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .or(z.literal("")),
        endDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { data: project, error } = await context.supabase
      .from("projects")
      .insert({
        workspace_id: membership.workspace_id,
        created_by: context.userId,
        name: data.name,
        code: data.code || null,
        location: data.location || null,
        start_date: data.startDate || null,
        end_date: data.endDate || null,
      })
      .select("id")
      .single();
    if (error || !project) throw new Error("Could not create that project.");
    await context.supabase.from("activity_events").insert({
      workspace_id: membership.workspace_id,
      actor_user_id: context.userId,
      event_type: "project.created",
      entity_type: "project",
      entity_id: project.id,
      title: `${data.name} was created`,
      detail: data.location || null,
    });
    return { id: project.id };
  });

export const saveProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        fullName: z.string().trim().max(120).optional().default(""),
        companyName: z.string().trim().max(160).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("profiles").upsert({
      id: context.userId,
      full_name: data.fullName || null,
      company_name: data.companyName || null,
    });
    if (error) throw new Error("Could not save your details.");
    return { ok: true as const };
  });

export const subcontractorSchema = z.object({
  company: z.string().trim().min(1, "Enter the company name").max(160),
  trade: z.string().trim().max(80).optional().default(""),
  project: z.string().trim().max(120).optional().default(""),
  contactName: z.string().trim().max(120).optional().default(""),
  contactEmail: z
    .union([z.literal(""), z.string().trim().email("Enter a valid email address").max(255)])
    .optional()
    .default(""),
  contactPhone: z.string().trim().max(40).optional().default(""),
});

export const createSubcontractor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => subcontractorSchema.parse(d))
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { data: row, error } = await context.supabase
      .from("subcontractors")
      .insert({
        owner_id: context.userId,
        workspace_id: membership.workspace_id,
        company: data.company,
        trade: data.trade || null,
        project: data.project || null,
        contact_name: data.contactName || null,
        contact_email: data.contactEmail || null,
        contact_phone: data.contactPhone || null,
      })
      .select("id")
      .single();

    if (error || !row) throw new Error("Could not add that subcontractor.");
    return { id: row.id };
  });

export const deleteSubcontractor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("subcontractors").delete().eq("id", data.id);
    if (error) throw new Error("Could not remove that subcontractor.");
    return { ok: true as const };
  });

export const getSubcontractor = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: sub } = await context.supabase
      .from("subcontractors")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    if (!sub) throw new Error("Subcontractor not found.");

    const { data: requests } = await context.supabase
      .from("document_requests")
      .select("*")
      .eq("subcontractor_id", data.id)
      .order("created_at", { ascending: false });

    return { subcontractor: sub, requests: requests ?? [] };
  });

export const createDocumentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subcontractorId: z.string().uuid(),
        docType: z.string().trim().min(1, "Choose a document").max(120),
        notes: z.string().trim().max(500).optional().default(""),
        projectId: z.string().uuid().optional().nullable(),
        requirementId: z.string().uuid().optional().nullable(),
        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable()
          .or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const now = new Date();
    const nextReminder = new Date(now.getTime() + 3 * 86400000);
    const { data: row, error } = await context.supabase
      .from("document_requests")
      .insert({
        owner_id: context.userId,
        workspace_id: membership.workspace_id,
        subcontractor_id: data.subcontractorId,
        doc_type: data.docType,
        notes: data.notes || null,
        token: randomToken(),
        project_id: data.projectId ?? null,
        requirement_id: data.requirementId ?? null,
        due_date: data.dueDate || null,
        assigned_to_user_id: context.userId,
        last_requested_at: now.toISOString(),
        next_reminder_at: nextReminder.toISOString(),
      })
      .select("id")
      .single();

    if (error || !row) throw new Error("Could not create that request.");

    const link = await createUploadLinkFor(context.supabase, {
      workspaceId: membership.workspace_id,
      subcontractorId: data.subcontractorId,
      projectId: data.projectId ?? null,
      createdBy: context.userId,
      requestIds: [row.id],
    });

    const { data: sub } = await context.supabase
      .from("subcontractors")
      .select("company, contact_email")
      .eq("id", data.subcontractorId)
      .single();
    if (sub?.contact_email) {
      await context.supabase.from("reminder_events").insert({
        workspace_id: membership.workspace_id,
        document_request_id: row.id,
        recipient_email: sub.contact_email,
        status: "scheduled",
        scheduled_for: nextReminder.toISOString(),
        created_by: context.userId,
      });
      await context.supabase.from("notification_jobs").insert({
        workspace_id: membership.workspace_id,
        document_request_id: row.id,
        upload_link_id: link.linkId,
        kind: "reminder",
        recipient_email: sub.contact_email,
        status: "scheduled",
        scheduled_for: nextReminder.toISOString(),
        dedupe_key: `${row.id}:reminder:${nextReminder.toISOString().slice(0, 10)}`,
        created_by: context.userId,
      });
    }
    await context.supabase.from("activity_events").insert({
      workspace_id: membership.workspace_id,
      actor_user_id: context.userId,
      event_type: "request.sent",
      entity_type: "document_request",
      entity_id: row.id,
      title: `Requested ${data.docType} from ${sub?.company ?? "subcontractor"}`,
      detail: "Secure upload link created",
    });
    return { id: row.id, token: link.token };
  });

export const bulkCreateDocumentRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subcontractorIds: z.array(z.string().uuid()).min(1).max(100),
        docType: z.string().trim().min(1).max(120),
        projectId: z.string().uuid().optional().nullable(),
        dueDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable()
          .or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { data: subs } = await context.supabase
      .from("subcontractors")
      .select("id, company, contact_email")
      .eq("workspace_id", membership.workspace_id)
      .in("id", data.subcontractorIds);
    if (!subs?.length) throw new Error("Select at least one subcontractor in this workspace.");
    const now = new Date();
    const nextReminder = new Date(now.getTime() + 3 * 86400000);
    const rows = subs.map((sub) => ({
      owner_id: context.userId,
      workspace_id: membership.workspace_id,
      subcontractor_id: sub.id,
      doc_type: data.docType,
      token: randomToken(),
      project_id: data.projectId ?? null,
      due_date: data.dueDate || null,
      assigned_to_user_id: context.userId,
      last_requested_at: now.toISOString(),
      next_reminder_at: nextReminder.toISOString(),
    }));
    const { data: created, error } = await context.supabase
      .from("document_requests")
      .insert(rows)
      .select("id, subcontractor_id");
    if (error || !created) throw new Error("Could not create those requests.");

    const links = await Promise.all(
      created.map(async (request) => ({
        subcontractorId: request.subcontractor_id,
        requestId: request.id,
        ...(await createUploadLinkFor(context.supabase, {
          workspaceId: membership.workspace_id,
          subcontractorId: request.subcontractor_id,
          projectId: data.projectId ?? null,
          createdBy: context.userId,
          requestIds: [request.id],
        })),
      })),
    );

    const reminders = created.flatMap((request) => {
      const sub = subs.find((item) => item.id === request.subcontractor_id);
      return sub?.contact_email
        ? [
            {
              workspace_id: membership.workspace_id,
              document_request_id: request.id,
              recipient_email: sub.contact_email,
              status: "scheduled",
              scheduled_for: nextReminder.toISOString(),
              created_by: context.userId,
            },
          ]
        : [];
    });
    if (reminders.length) await context.supabase.from("reminder_events").insert(reminders);
    await context.supabase.from("activity_events").insert({
      workspace_id: membership.workspace_id,
      actor_user_id: context.userId,
      event_type: "request.bulk_sent",
      entity_type: "document_request",
      title: `${created.length} document requests created`,
      detail: data.docType,
    });
    return {
      created: created.length,
      links: links.map((item) => ({ subcontractorId: item.subcontractorId, token: item.token })),
    };
  });

export const sendRequestFollowUp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { data: request } = await context.supabase
      .from("document_requests")
      .select("id, doc_type, subcontractor_id")
      .eq("id", data.id)
      .eq("workspace_id", membership.workspace_id)
      .single();
    if (!request) throw new Error("Request not found.");
    const { data: sub } = await context.supabase
      .from("subcontractors")
      .select("company, contact_email")
      .eq("id", request.subcontractor_id)
      .single();
    const now = new Date();
    const next = new Date(now.getTime() + 3 * 86400000);
    const { error } = await context.supabase
      .from("document_requests")
      .update({ last_requested_at: now.toISOString(), next_reminder_at: next.toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("Could not record that follow-up.");
    if (sub?.contact_email)
      await context.supabase.from("reminder_events").insert({
        workspace_id: membership.workspace_id,
        document_request_id: data.id,
        recipient_email: sub.contact_email,
        status: "scheduled",
        scheduled_for: next.toISOString(),
        created_by: context.userId,
      });
    await context.supabase.from("activity_events").insert({
      workspace_id: membership.workspace_id,
      actor_user_id: context.userId,
      event_type: "request.follow_up",
      entity_type: "document_request",
      entity_id: data.id,
      title: `Follow-up recorded for ${sub?.company ?? "subcontractor"}`,
      detail: `${request.doc_type} remains outstanding`,
    });
    return { ok: true as const };
  });

export const assignSubcontractorsToProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        subcontractorIds: z.array(z.string().uuid()).min(1).max(100),
        projectId: z.string().uuid(),
        plannedStartDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .nullable()
          .or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const rows = data.subcontractorIds.map((id) => ({
      workspace_id: membership.workspace_id,
      project_id: data.projectId,
      subcontractor_id: id,
      planned_start_date: data.plannedStartDate || null,
    }));
    const { error } = await context.supabase
      .from("project_subcontractors")
      .upsert(rows, { onConflict: "project_id,subcontractor_id" });
    if (error) throw new Error("Could not assign those subcontractors.");
    return { ok: true as const };
  });

export const createRequirement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        projectId: z.string().uuid(),
        name: z.string().trim().min(2).max(160),
        documentType: z.string().trim().min(1).max(120),
        trade: z.string().trim().max(80).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { error } = await context.supabase.from("compliance_requirements").insert({
      workspace_id: membership.workspace_id,
      project_id: data.projectId,
      name: data.name,
      document_type: data.documentType,
      trade: data.trade || null,
    });
    if (error) throw new Error("Could not add that requirement.");
    return { ok: true as const };
  });

export const reviewDocumentRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        id: z.string().uuid(),
        action: z.enum(["approve", "reject"]),
        reason: z.string().trim().max(500).optional().default(""),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const { data: before } = await context.supabase
      .from("document_requests")
      .select("doc_type, subcontractor_id, project_id, requirement_id, current_version")
      .eq("id", data.id)
      .single();
    if (!before) throw new Error("Request not found.");

    const approved = data.action === "approve";
    const decidedAt = new Date().toISOString();
    const { error } = await context.supabase
      .from("document_requests")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_at: decidedAt,
        resolved_at: approved ? decidedAt : null,
        rejection_reason: approved ? null : data.reason || null,
      })
      .eq("id", data.id)
      .eq("status", "submitted");

    if (error) throw new Error("Could not save that decision.");

    // Record the decision against the exact version that was reviewed.
    const { data: version } = await context.supabase
      .from("document_versions")
      .select("id")
      .eq("document_request_id", data.id)
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (version) {
      await context.supabase
        .from("document_versions")
        .update({ status: approved ? "approved" : "rejected" })
        .eq("id", version.id);
      await context.supabase.from("document_reviews").insert({
        workspace_id: membership.workspace_id,
        document_version_id: version.id,
        document_request_id: data.id,
        requirement_id: before.requirement_id,
        project_id: before.project_id,
        reviewer_user_id: context.userId,
        decision: approved ? "approved" : "changes_requested",
        reason: approved ? null : data.reason || null,
      });
    }

    // Approved items stop chasing; rejected items start chasing again.
    await context.supabase
      .from("notification_jobs")
      .update({
        status: approved ? "canceled" : "scheduled",
        canceled_at: approved ? decidedAt : null,
      })
      .eq("document_request_id", data.id)
      .in("status", ["scheduled", "paused"]);

    const { data: sub } = await context.supabase
      .from("subcontractors")
      .select("company")
      .eq("id", before.subcontractor_id)
      .single();
    await context.supabase.from("activity_events").insert({
      workspace_id: membership.workspace_id,
      actor_user_id: context.userId,
      event_type: `document.${approved ? "approved" : "correction_requested"}`,
      entity_type: "document_request",
      entity_id: data.id,
      title: `${before.doc_type} ${approved ? "approved" : "sent back for correction"}`,
      detail: sub?.company ?? null,
    });
    return { ok: true as const };
  });

export const getDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), versionId: z.string().uuid().optional() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    // RLS confirms the caller can see this request before we use admin storage access.
    const { data: row } = await context.supabase
      .from("document_requests")
      .select("file_path, doc_type, workspace_id")
      .eq("id", data.id)
      .maybeSingle();

    if (!row) throw new Error("Request not found.");

    // Tax documents are limited to workspace owners and admins.
    if (isRestrictedDocType(row.doc_type)) {
      const { data: membership } = await context.supabase
        .from("workspace_members")
        .select("role")
        .eq("workspace_id", row.workspace_id ?? "")
        .eq("user_id", context.userId)
        .eq("status", "active")
        .maybeSingle();
      if (!membership || !["owner", "admin"].includes(membership.role)) {
        throw new Error("Only workspace owners and admins can open W-9 documents.");
      }
    }

    let filePath = row.file_path;
    if (data.versionId) {
      const { data: version } = await context.supabase
        .from("document_versions")
        .select("file_path")
        .eq("id", data.versionId)
        .eq("document_request_id", data.id)
        .maybeSingle();
      filePath = version?.file_path ?? null;
    }

    if (!filePath) throw new Error("There is no document on this request yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 60 * 10);

    if (error || !signed) throw new Error("Could not open that document.");
    return { url: signed.signedUrl };
  });

/* ------------------------------------------------------------------ */
/* Subcontractor-side (public, secured by the link token)              */
/* ------------------------------------------------------------------ */

const tokenInput = z.object({ token: z.string().trim().min(20).max(120) });

const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/webp",
  "application/pdf",
];
const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** Resolves a raw link code to its stored hash, then to the documents it may collect. */
async function loadLink(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: link } = await supabaseAdmin
    .from("upload_links")
    .select("id, workspace_id, subcontractor_id, project_id, audience, expires_at, revoked_at")
    .eq("token_hash", await hashToken(token))
    .maybeSingle();
  if (!link) return { supabaseAdmin, link: null, requests: [] as RequestRow[] };

  const { data: items } = await supabaseAdmin
    .from("upload_link_items")
    .select(
      "document_requests(id, doc_type, notes, status, rejection_reason, due_date, current_version)",
    )
    .eq("upload_link_id", link.id);

  const requests = (items ?? [])
    .map((item) => (item as { document_requests: RequestRow | null }).document_requests)
    .filter((row): row is RequestRow => Boolean(row))
    // Broker links only ever expose insurance certificates.
    .filter((row) => link.audience !== "broker" || isInsuranceDocType(row.doc_type));

  return { supabaseAdmin, link, requests };
}

type RequestRow = {
  id: string;
  doc_type: string;
  notes: string | null;
  status: DocStatus;
  rejection_reason: string | null;
  due_date: string | null;
  current_version: number;
};

function linkState(link: { expires_at: string; revoked_at: string | null } | null) {
  if (!link) return "invalid" as const;
  if (link.revoked_at) return "revoked" as const;
  if (new Date(link.expires_at) < new Date()) return "expired" as const;
  return "ok" as const;
}

export const getUploadRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin, link, requests } = await loadLink(data.token);
    const state = linkState(link);
    if (state !== "ok" || !link) return { state };

    const [{ data: sub }, { data: workspace }, { data: project }] = await Promise.all([
      supabaseAdmin
        .from("subcontractors")
        .select("company")
        .eq("id", link.subcontractor_id)
        .maybeSingle(),
      supabaseAdmin.from("workspaces").select("name").eq("id", link.workspace_id).maybeSingle(),
      link.project_id
        ? supabaseAdmin.from("projects").select("name").eq("id", link.project_id).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    await supabaseAdmin
      .from("upload_links")
      .update({ last_opened_at: new Date().toISOString() })
      .eq("id", link.id);

    return {
      state: "ok" as const,
      company: sub?.company ?? "",
      requestedBy: workspace?.name ?? "the general contractor",
      projectName: project?.name ?? null,
      audience: link.audience as "subcontractor" | "broker",
      expiresAt: link.expires_at,
      items: requests.map((row) => ({
        id: row.id,
        docType: row.doc_type,
        notes: row.notes,
        status: row.status,
        dueDate: row.due_date,
        changesRequested: row.status === "rejected" ? row.rejection_reason : null,
        needsExpirationDate: requiresExpirationDate(row.doc_type),
      })),
    };
  });

export const createUploadTarget = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    tokenInput
      .extend({
        requestId: z.string().uuid(),
        fileName: z.string().trim().min(1).max(160),
        fileSize: z
          .number()
          .int()
          .positive()
          .max(MAX_UPLOAD_BYTES, "That file is larger than 25 MB."),
        contentType: z.string().trim().min(1).max(120),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, link, requests } = await loadLink(data.token);
    if (linkState(link) !== "ok") throw new Error("This link is no longer valid.");
    if (!requests.some((row) => row.id === data.requestId))
      throw new Error("That document is not part of this request.");
    if (!ALLOWED_UPLOAD_TYPES.includes(data.contentType))
      throw new Error("Upload a JPG, PNG or PDF.");

    const path = `${data.requestId}/${Date.now()}-${safeName(data.fileName)}`;
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUploadUrl(path);

    if (error || !signed) throw new Error("Upload could not be started. Please try again.");
    return { path, token: signed.token };
  });

export const submitUpload = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    tokenInput
      .extend({
        requestId: z.string().uuid(),
        path: z.string().trim().min(1).max(300),
        fileName: z.string().trim().min(1).max(160),
        fileSize: z.number().int().positive().max(MAX_UPLOAD_BYTES).optional(),
        contentType: z.string().trim().max(120).optional(),
        expirationDate: z
          .string()
          .regex(/^\d{4}-\d{2}-\d{2}$/)
          .optional()
          .or(z.literal("")),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, link, requests } = await loadLink(data.token);
    if (linkState(link) !== "ok" || !link) throw new Error("This link is no longer valid.");
    const request = requests.find((row) => row.id === data.requestId);
    if (!request) throw new Error("That document is not part of this request.");
    if (!data.path.startsWith(`${request.id}/`)) throw new Error("Invalid upload.");
    if (requiresExpirationDate(request.doc_type) && !data.expirationDate)
      throw new Error("Enter the expiration date shown on the document.");

    const now = new Date().toISOString();
    const nextVersion = (request.current_version ?? 0) + 1;

    // A replacement upload is a new version and never inherits the old approval.
    const { error: versionError } = await supabaseAdmin.from("document_versions").insert({
      workspace_id: link.workspace_id,
      document_request_id: request.id,
      version: nextVersion,
      file_path: data.path,
      file_name: data.fileName,
      file_size: data.fileSize ?? null,
      content_type: data.contentType ?? null,
      expiration_date: data.expirationDate || null,
      status: "submitted",
      uploaded_via: "link",
      uploaded_at: now,
    });
    if (versionError) throw new Error("We could not save your document. Please try again.");

    const { error } = await supabaseAdmin
      .from("document_requests")
      .update({
        status: "submitted",
        file_path: data.path,
        file_name: data.fileName,
        expiration_date: data.expirationDate || null,
        submitted_at: now,
        rejection_reason: null,
        reviewed_at: null,
        resolved_at: null,
        current_version: nextVersion,
      })
      .eq("id", request.id);

    if (error) throw new Error("We could not save your document. Please try again.");

    // Stop chasing while this item is waiting on the contractor's review.
    await supabaseAdmin
      .from("notification_jobs")
      .update({ status: "paused" })
      .eq("document_request_id", request.id)
      .eq("status", "scheduled");

    await supabaseAdmin.from("activity_events").insert({
      workspace_id: link.workspace_id,
      event_type: "document.submitted",
      entity_type: "document_request",
      entity_id: request.id,
      title: `${request.doc_type} uploaded`,
      detail: `Version ${nextVersion} received through a secure link`,
    });

    return { ok: true as const, version: nextVersion };
  });

/* ------------------------------------------------------------------ */
/* Onboarding: first project, first subcontractor, first links   */
/* ------------------------------------------------------------------ */

const optionalDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .nullable()
  .or(z.literal(""));

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        projectName: z.string().trim().min(1, "Name the project").max(120),
        projectLocation: z.string().trim().max(160).optional().default(""),
        projectStart: optionalDate,
        company: z.string().trim().min(1, "Enter the company name").max(160),
        trade: z.string().trim().max(80).optional().default(""),
        contactName: z.string().trim().max(120).optional().default(""),
        contactEmail: z.string().trim().email("Enter a valid email").max(255).or(z.literal("")),
        plannedStart: optionalDate,
        docTypes: z.array(z.string().trim().min(1).max(120)).min(1, "Pick at least one document"),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const membership = await ensureWorkspace(context);
    const workspaceId = membership.workspace_id;

    const { data: project, error: projectError } = await context.supabase
      .from("projects")
      .insert({
        workspace_id: workspaceId,
        name: data.projectName,
        location: data.projectLocation || null,
        start_date: data.projectStart || null,
        status: "active",
        created_by: context.userId,
      })
      .select("id, name")
      .single();
    if (projectError || !project) throw new Error("Could not create that project.");

    const { data: sub, error: subError } = await context.supabase
      .from("subcontractors")
      .insert({
        owner_id: context.userId,
        workspace_id: workspaceId,
        company: data.company,
        trade: data.trade || null,
        project: project.name,
        contact_name: data.contactName || null,
        contact_email: data.contactEmail || null,
      })
      .select("id, company")
      .single();
    if (subError || !sub) throw new Error("Could not add that subcontractor.");

    await context.supabase.from("project_subcontractors").insert({
      workspace_id: workspaceId,
      project_id: project.id,
      subcontractor_id: sub.id,
      planned_start_date: data.plannedStart || null,
    });

    await context.supabase.from("compliance_requirements").insert(
      data.docTypes.map((docType) => ({
        workspace_id: workspaceId,
        project_id: project.id,
        name: docType,
        document_type: docType,
        status: "required" as const,
      })),
    );

    const now = new Date();
    const nextReminder = new Date(now.getTime() + 3 * 86400000);
    const due = new Date(now.getTime() + 5 * 86400000).toISOString().slice(0, 10);
    const { data: created, error: requestError } = await context.supabase
      .from("document_requests")
      .insert(
        data.docTypes.map((docType) => ({
          owner_id: context.userId,
          workspace_id: workspaceId,
          subcontractor_id: sub.id,
          project_id: project.id,
          doc_type: docType,
          token: randomToken(),
          due_date: due,
          assigned_to_user_id: context.userId,
          last_requested_at: now.toISOString(),
          next_reminder_at: nextReminder.toISOString(),
        })),
      )
      .select("id, doc_type");
    if (requestError || !created) throw new Error("Could not create the first document requests.");

    // One secure link collects every document for this subcontractor.
    const firstLink = await createUploadLinkFor(context.supabase, {
      workspaceId,
      subcontractorId: sub.id,
      projectId: project.id,
      createdBy: context.userId,
      requestIds: created.map((row) => row.id),
    });

    if (data.contactEmail) {
      await context.supabase.from("reminder_events").insert(
        created.map((row) => ({
          workspace_id: workspaceId,
          document_request_id: row.id,
          recipient_email: data.contactEmail,
          status: "scheduled",
          scheduled_for: nextReminder.toISOString(),
          created_by: context.userId,
        })),
      );
    }

    await context.supabase.from("activity_events").insert({
      workspace_id: workspaceId,
      actor_user_id: context.userId,
      event_type: "workspace.onboarded",
      entity_type: "project",
      entity_id: project.id,
      title: `Setup complete for ${project.name}`,
      detail: `${created.length} secure upload links created for ${sub.company}`,
    });

    return {
      projectId: project.id,
      subcontractorId: sub.id,
      company: sub.company,
      token: firstLink.token,
      links: created.map((row) => ({
        id: row.id,
        docType: row.doc_type,
        token: firstLink.token,
      })),
    };
  });
