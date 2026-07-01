/**
 * @param {string | null | undefined} value
 * @returns {string}
 */
export function normalizeLeadText(value) {
  return (value ?? "").trim().toLowerCase();
}

/**
 * @param {string} organizationName
 * @returns {string}
 */
export function normalizeOrganizationName(organizationName) {
  return normalizeLeadText(organizationName);
}

/**
 * @param {string | null | undefined} email
 * @returns {string | null}
 */
export function normalizeLeadEmail(email) {
  const normalized = normalizeLeadText(email);
  return normalized || null;
}

/**
 * @param {string | null | undefined} phone
 * @returns {string | null}
 */
export function normalizeLeadPhone(phone) {
  const digits = (phone ?? "").replace(/\D/g, "");
  return digits || null;
}

/**
 * @param {string | null | undefined} website
 * @returns {string | null}
 */
export function normalizeWebsite(website) {
  let normalized = normalizeLeadText(website);
  if (!normalized) {
    return null;
  }

  normalized = normalized.replace(/^https?:\/\//, "");
  normalized = normalized.replace(/^www\./, "");
  normalized = normalized.replace(/\/$/, "");
  return normalized || null;
}
