/**
 * One place for document + requirement status logic.
 * Pure functions only: safe to import from client and server code.
 */

export type DocStatus = "pending" | "submitted" | "approved" | "rejected";

/** Computed state of a requirement for a given project / work window. */
export type RequirementState =
  | "missing"
  | "awaiting_review"
  | "changes_requested"
  | "approved"
  | "expiring_during_work"
  | "expired";

export const NO_EXPIRATION_DOC_TYPES = ["W-9", "Signed Subcontract", "Safety Program"] as const;

export const RESTRICTED_DOC_TYPES = ["W-9"] as const;

export const INSURANCE_DOC_TYPES = [
  "General Liability Certificate",
  "Workers Compensation Certificate",
  "Auto Liability Certificate",
  "Umbrella / Excess Liability",
] as const;

export function requiresExpirationDate(docType: string) {
  return !NO_EXPIRATION_DOC_TYPES.includes(docType as (typeof NO_EXPIRATION_DOC_TYPES)[number]);
}

export function isRestrictedDocType(docType: string) {
  return RESTRICTED_DOC_TYPES.includes(docType as (typeof RESTRICTED_DOC_TYPES)[number]);
}

export function isInsuranceDocType(docType: string) {
  return INSURANCE_DOC_TYPES.includes(docType as (typeof INSURANCE_DOC_TYPES)[number]);
}

export const STATE_META: Record<
  RequirementState,
  { label: string; tone: "neutral" | "info" | "warning" | "danger" | "success"; blocking: boolean }
> = {
  missing: { label: "Missing", tone: "danger", blocking: true },
  awaiting_review: { label: "Awaiting review", tone: "info", blocking: false },
  changes_requested: { label: "Changes requested", tone: "warning", blocking: true },
  approved: { label: "Approved against checklist", tone: "success", blocking: false },
  expiring_during_work: { label: "Expiring during work", tone: "warning", blocking: true },
  expired: { label: "Expired", tone: "danger", blocking: true },
};

/** Lower number sorts first in the work queue. */
export const STATE_PRIORITY: Record<RequirementState, number> = {
  expired: 0,
  missing: 1,
  expiring_during_work: 2,
  changes_requested: 3,
  awaiting_review: 4,
  approved: 5,
};

function toDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(`${value.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function daysBetween(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

export type EvaluateInput = {
  docType: string;
  /** Review status of the latest uploaded version, if any. */
  status: DocStatus | null;
  expirationDate: string | null;
  /** Scheduled work window for this subcontractor on this project. */
  workStartDate?: string | null;
  workEndDate?: string | null;
  asOf?: Date;
  /** Warn this many days ahead when there is no scheduled work window. */
  warningDays?: number;
};

/**
 * Evaluate one requirement for one project. Review status and readiness are
 * deliberately separate: an approved document can still be expired today or
 * expire part-way through the scheduled work.
 */
export function evaluateRequirement(input: EvaluateInput): RequirementState {
  const asOf = input.asOf ?? new Date();
  const status = input.status;

  if (!status || status === "pending") return "missing";
  if (status === "submitted") return "awaiting_review";
  if (status === "rejected") return "changes_requested";

  if (!requiresExpirationDate(input.docType)) return "approved";

  const expires = toDate(input.expirationDate);
  if (!expires) return "approved";
  if (expires.getTime() <= asOf.getTime()) return "expired";

  const workEnd = toDate(input.workEndDate ?? null);
  if (workEnd && expires.getTime() < workEnd.getTime()) return "expiring_during_work";

  const warningDays = input.warningDays ?? 30;
  if (!workEnd && daysBetween(asOf, expires) <= warningDays) return "expiring_during_work";

  return "approved";
}

export function stateLabel(state: RequirementState) {
  return STATE_META[state].label;
}

export function isBlocking(state: RequirementState) {
  return STATE_META[state].blocking;
}
