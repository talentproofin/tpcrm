import { createService } from "@/services/infrastructure/createService";
import {
  normalizeLeadEmail,
  normalizeLeadPhone,
} from "@/features/leads/utils/normalize";
import { CONTACT_ERROR_CODES } from "../constants/errors";
import { CONTACT_SELECT, mapContactRow } from "./contactMapper";

/**
 * @param {string} code
 * @param {string} message
 * @returns {Error & { code: string }}
 */
function createContactError(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

/**
 * @param {unknown} error
 * @returns {Error}
 */
function mapDatabaseError(error) {
  if (error && typeof error === "object" && "code" in error) {
    const pgCode = String(error.code);
    const message =
      "message" in error ? String(error.message) : "Database error";

    if (pgCode === "23505") {
      return createContactError(
        CONTACT_ERROR_CODES.DUPLICATE,
        "A contact with this mobile number or email already exists on this lead."
      );
    }

    if (message.includes("Cannot archive the primary contact")) {
      return createContactError(
        CONTACT_ERROR_CODES.PRIMARY_REQUIRED,
        "Assign another primary contact before archiving this one."
      );
    }
  }

  return createContactError(
    CONTACT_ERROR_CODES.UNKNOWN,
    "Unable to complete the contact request. Please try again."
  );
}

/**
 * @param {import('../types/contact').Contact[]} contacts
 * @param {import('zod').infer<typeof import('../validation/contactSchema').contactSchema>} input
 * @param {string} [excludeContactId]
 */
export function findDuplicateContact(contacts, input, excludeContactId) {
  const normalizedMobile = normalizeLeadPhone(input.mobileNumber);
  const normalizedEmail = normalizeLeadEmail(input.email);

  for (const contact of contacts) {
    if (excludeContactId && contact.id === excludeContactId) {
      continue;
    }

    if (!contact.isActive || contact.archivedAt) {
      continue;
    }

    if (
      normalizedMobile &&
      normalizeLeadPhone(contact.mobileNumber) === normalizedMobile
    ) {
      return "mobile number";
    }

    if (
      normalizedEmail &&
      normalizeLeadEmail(contact.email) === normalizedEmail
    ) {
      return "email";
    }
  }

  return null;
}

/**
 * @param {import('../types/contact').Contact[]} contacts
 * @param {string} [search]
 */
export function filterContacts(contacts, search) {
  const query = (search ?? "").trim().toLowerCase();
  if (!query) {
    return contacts;
  }

  return contacts.filter((contact) => {
    const values = [
      contact.fullName,
      contact.designation,
      contact.mobileNumber,
      contact.alternateNumber,
      contact.email,
    ];

    return values.some((value) =>
      (value ?? "").toLowerCase().includes(query)
    );
  });
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} leadId
 * @returns {Promise<import('../types/contact').Contact[]>}
 */
async function fetchContactsByLead(supabase, leadId) {
  const { data, error } = await supabase
    .from("contacts")
    .select(CONTACT_SELECT)
    .eq("lead_id", leadId)
    .eq("is_active", true)
    .is("archived_at", null)
    .order("is_primary", { ascending: false })
    .order("full_name", { ascending: true });

  if (error) {
    throw mapDatabaseError(error);
  }

  return (data ?? []).map(mapContactRow);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} contactId
 * @returns {Promise<import('../types/contact').Contact>}
 */
async function fetchContactById(supabase, contactId) {
  const { data, error } = await supabase
    .from("contacts")
    .select(CONTACT_SELECT)
    .eq("id", contactId)
    .maybeSingle();

  if (error) {
    throw mapDatabaseError(error);
  }

  if (!data) {
    throw createContactError(
      CONTACT_ERROR_CODES.NOT_FOUND,
      "Contact not found."
    );
  }

  return mapContactRow(data);
}

/**
 * @param {string | null | undefined} value
 */
function emptyToNull(value) {
  const trimmed = (value ?? "").trim();
  return trimmed || null;
}

export const getContactsByLead = createService({
  name: "getContactsByLead",
  execute: async (supabase, leadId) => fetchContactsByLead(supabase, leadId),
});

export const createContact = createService({
  name: "createContact",
  execute: async (supabase, profileId, leadId, input) => {
    const existing = await fetchContactsByLead(supabase, leadId);
    const duplicateField = findDuplicateContact(existing, input);

    if (duplicateField) {
      throw createContactError(
        CONTACT_ERROR_CODES.DUPLICATE,
        `A contact with this ${duplicateField} already exists on this lead.`
      );
    }

    const { data, error } = await supabase.rpc("create_contact", {
      p_lead_id: leadId,
      p_full_name: input.fullName.trim(),
      p_designation: emptyToNull(input.designation),
      p_department: emptyToNull(input.department),
      p_mobile_number: emptyToNull(input.mobileNumber),
      p_alternate_number: emptyToNull(input.alternateNumber),
      p_email: emptyToNull(input.email),
      p_linkedin_profile_url: emptyToNull(input.linkedinProfileUrl),
      p_notes: emptyToNull(input.notes),
      p_is_primary: Boolean(input.isPrimary),
      p_created_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchContactById(supabase, String(data));
  },
});

export const updateContact = createService({
  name: "updateContact",
  execute: async (supabase, profileId, contactId, input) => {
    const current = await fetchContactById(supabase, contactId);
    const existing = await fetchContactsByLead(supabase, current.leadId);
    const duplicateField = findDuplicateContact(existing, input, contactId);

    if (duplicateField) {
      throw createContactError(
        CONTACT_ERROR_CODES.DUPLICATE,
        `A contact with this ${duplicateField} already exists on this lead.`
      );
    }

    const { data, error } = await supabase.rpc("update_contact", {
      p_contact_id: contactId,
      p_full_name: input.fullName.trim(),
      p_designation: emptyToNull(input.designation),
      p_department: emptyToNull(input.department),
      p_mobile_number: emptyToNull(input.mobileNumber),
      p_alternate_number: emptyToNull(input.alternateNumber),
      p_email: emptyToNull(input.email),
      p_linkedin_profile_url: emptyToNull(input.linkedinProfileUrl),
      p_notes: emptyToNull(input.notes),
      p_is_primary: Boolean(input.isPrimary),
      p_is_active: Boolean(input.isActive),
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return fetchContactById(supabase, String(data));
  },
});

export const archiveContact = createService({
  name: "archiveContact",
  execute: async (supabase, profileId, contactId) => {
    const { error } = await supabase.rpc("archive_contact", {
      p_contact_id: contactId,
      p_updated_by_profile_id: profileId,
    });

    if (error) {
      throw mapDatabaseError(error);
    }

    return true;
  },
});
