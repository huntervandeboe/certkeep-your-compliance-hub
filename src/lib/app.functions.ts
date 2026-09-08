import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

async function ensureWorkspace(context: {
  userId: string;
  claims: unknown;
}) {
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

    const [{ data: subs }, { data: requests }] = await Promise.all([
      supabase
        .from("subcontractors")
        .select("id, company, trade, project, contact_name, contact_email, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("document_requests")
        .select("id, subcontractor_id, doc_type, status, expiration_date, submitted_at, created_at")
        .order("created_at", { ascending: false }),
    ]);

    return {
      email: (claims as { email?: string })?.email ?? "",
      profile: profile ?? { full_name: null, company_name: null },
      subcontractors: subs ?? [],
      requests: requests ?? [],
    };
  });

export const getCommandCenter = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const membership = await ensureWorkspace(context);
    const workspaceId = membership.workspace_id;
    const [{ data: projects }, { data: activity }, { data: requirements }, legacy] =
      await Promise.all([
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
          .select("id, project_id, name, document_type, status")
          .eq("workspace_id", workspaceId),
        Promise.all([
          context.supabase
            .from("subcontractors")
            .select("id, company, trade, project, contact_name, created_at")
            .order("created_at", { ascending: false }),
          context.supabase
            .from("document_requests")
            .select("id, subcontractor_id, doc_type, status, expiration_date, submitted_at, created_at")
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
      activity: activity ?? [],
      subcontractors: legacy[0].data ?? [],
      requests: legacy[1].data ?? [],
    };
  });

export const createProject = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      name: z.string().trim().min(2, "Enter a project name").max(160),
      code: z.string().trim().max(40).optional().default(""),
      location: z.string().trim().max(180).optional().default(""),
    }).parse(d),
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
    const { data: row, error } = await context.supabase
      .from("subcontractors")
      .insert({
        owner_id: context.userId,
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
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("document_requests")
      .insert({
        owner_id: context.userId,
        subcontractor_id: data.subcontractorId,
        doc_type: data.docType,
        notes: data.notes || null,
        token: randomToken(),
      })
      .select("id, token")
      .single();

    if (error || !row) throw new Error("Could not create that request.");
    return { id: row.id, token: row.token };
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
    const { error } = await context.supabase
      .from("document_requests")
      .update({
        status: data.action === "approve" ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        rejection_reason: data.action === "reject" ? data.reason || null : null,
      })
      .eq("id", data.id)
      .eq("status", "submitted");

    if (error) throw new Error("Could not save that decision.");
    return { ok: true as const };
  });

export const getDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    // RLS confirms the caller owns this request before we use admin storage access.
    const { data: row } = await context.supabase
      .from("document_requests")
      .select("file_path")
      .eq("id", data.id)
      .maybeSingle();

    if (!row?.file_path) throw new Error("There is no document on this request yet.");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(row.file_path, 60 * 10);

    if (error || !signed) throw new Error("Could not open that document.");
    return { url: signed.signedUrl };
  });

/* ------------------------------------------------------------------ */
/* Subcontractor-side (public, secured by the link token)              */
/* ------------------------------------------------------------------ */

const tokenInput = z.object({ token: z.string().trim().min(20).max(120) });

async function loadByToken(token: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("document_requests")
    .select("id, doc_type, notes, status, token_expires_at, subcontractor_id")
    .eq("token", token)
    .maybeSingle();
  return { supabaseAdmin, request: data };
}

export const getUploadRequest = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => tokenInput.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin, request } = await loadByToken(data.token);
    if (!request) return { state: "invalid" as const };
    if (new Date(request.token_expires_at) < new Date()) return { state: "expired" as const };

    const { data: sub } = await supabaseAdmin
      .from("subcontractors")
      .select("company")
      .eq("id", request.subcontractor_id)
      .maybeSingle();

    return {
      state: "ok" as const,
      docType: request.doc_type,
      notes: request.notes,
      status: request.status as DocStatus,
      company: sub?.company ?? "",
    };
  });

export const createUploadTarget = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    tokenInput.extend({ fileName: z.string().trim().min(1).max(160) }).parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, request } = await loadByToken(data.token);
    if (!request) throw new Error("This link is no longer valid.");
    if (new Date(request.token_expires_at) < new Date())
      throw new Error("This link has expired. Ask for a new one.");

    const path = `${request.id}/${Date.now()}-${safeName(data.fileName)}`;
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
        path: z.string().trim().min(1).max(300),
        fileName: z.string().trim().min(1).max(160),
        expirationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter the expiration date"),
      })
      .parse(d),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin, request } = await loadByToken(data.token);
    if (!request) throw new Error("This link is no longer valid.");
    if (new Date(request.token_expires_at) < new Date())
      throw new Error("This link has expired. Ask for a new one.");
    if (!data.path.startsWith(`${request.id}/`)) throw new Error("Invalid upload.");

    const { error } = await supabaseAdmin
      .from("document_requests")
      .update({
        status: "submitted",
        file_path: data.path,
        file_name: data.fileName,
        expiration_date: data.expirationDate,
        submitted_at: new Date().toISOString(),
        rejection_reason: null,
        reviewed_at: null,
      })
      .eq("id", request.id);

    if (error) throw new Error("We could not save your document. Please try again.");
    return { ok: true as const };
  });
