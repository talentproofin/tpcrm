import { LEAD_ERROR_CODES } from "../constants/errors";
import {
  normalizeLeadEmail,
  normalizeLeadPhone,
  normalizeOrganizationName,
  normalizeWebsite,
} from "./normalize";

/**
 * @param {string} code
 * @param {string} message
 * @param {Record<string, unknown>} [details]
 * @returns {Error}
 */
export function createLeadError(code, message, details) {
  const error = new Error(message);
  error.code = code;
  if (details) {
    error.details = details;
  }
  return error;
}

const LEAD_SELECT =
  "id, organization_name, website, phone, lead_type_id, primary_contact_name, primary_contact_phone, primary_contact_email, owner_profile_id, assigned_to_profile_id, stage_id, lead_source_id, outcome, description, archived_at, deleted_at, deleted_by_profile_id, created_at, updated_at, created_by_profile_id, updated_by_profile_id";

const LEAD_LIST_SELECT =
  "id, organization_name, primary_contact_email, outcome, created_at, owner_profile_id, stage_id, lead_type_id";

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{
 *   organizationName: string,
 *   website?: string | null,
 *   phone?: string | null,
 *   primaryContactEmail?: string | null,
 *   excludeLeadId?: string,
 * }} params
 * @returns {Promise<import('../types/lead').LeadDuplicateMatch[]>}
 */
export async function findDuplicateLeads(supabase, params) {
  const normalizedName = normalizeOrganizationName(params.organizationName);
  const normalizedWebsite = params.website ? normalizeWebsite(params.website) : null;
  const normalizedPhone = params.phone ? normalizeLeadPhone(params.phone) : null;
  const normalizedEmail = params.primaryContactEmail
    ? normalizeLeadEmail(params.primaryContactEmail)
    : null;

  const matches = /** @type {import('../types/lead').LeadDuplicateMatch[]} */ ([]);
  const seenIds = new Set();

  const { data: rows, error } = await supabase
    .from("leads")
    .select(
      "id, organization_name, website, phone, primary_contact_email"
    )
    .is("deleted_at", null);

  if (error) {
    throw createLeadError(
      LEAD_ERROR_CODES.UNKNOWN,
      "Unable to check for duplicate leads."
    );
  }

  for (const row of rows ?? []) {
    if (params.excludeLeadId && row.id === params.excludeLeadId) {
      continue;
    }

    if (
      normalizedName &&
      normalizeOrganizationName(String(row.organization_name)) === normalizedName
    ) {
      seenIds.add(row.id);
      matches.push({
        id: String(row.id),
        organizationName: String(row.organization_name),
        matchedOn: "organization_name",
      });
      continue;
    }

    if (
      normalizedWebsite &&
      row.website &&
      normalizeWebsite(String(row.website)) === normalizedWebsite
    ) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        matches.push({
          id: String(row.id),
          organizationName: String(row.organization_name),
          matchedOn: "website",
        });
      }
      continue;
    }

    if (
      normalizedPhone &&
      row.phone &&
      normalizeLeadPhone(String(row.phone)) === normalizedPhone
    ) {
      if (!seenIds.has(row.id)) {
        seenIds.add(row.id);
        matches.push({
          id: String(row.id),
          organizationName: String(row.organization_name),
          matchedOn: "phone",
        });
      }
      continue;
    }

    if (
      normalizedEmail &&
      row.primary_contact_email &&
      normalizeLeadEmail(String(row.primary_contact_email)) === normalizedEmail
    ) {
      if (!seenIds.has(row.id)) {
        matches.push({
          id: String(row.id),
          organizationName: String(row.organization_name),
          matchedOn: "primary_contact_email",
        });
      }
    }
  }

  return matches;
}

export { LEAD_SELECT, LEAD_LIST_SELECT };
