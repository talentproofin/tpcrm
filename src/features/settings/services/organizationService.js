import { createService } from "@/services/infrastructure/createService";

const ORGANIZATION_KEYS = [
  "organization_name",
  "organization_address",
  "organization_city",
  "organization_state",
  "organization_country",
  "organization_pincode",
  "organization_contact_email",
  "organization_contact_phone",
  "organization_website",
  "organization_timezone",
  "business_hours_start",
  "business_hours_end",
  "default_followup_time",
  "date_format",
  "time_format",
];

/**
 * @param {unknown} value
 * @returns {string}
 */
function parseSettingValue(value) {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @returns {Promise<import('../types/settings').OrganizationSettings>}
 */
async function fetchOrganizationSettings(supabase) {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value")
    .in("key", ORGANIZATION_KEYS);

  if (error) {
    throw new Error(error.message);
  }

  /** @type {Record<string, string>} */
  const values = {};

  for (const row of data ?? []) {
    values[String(row.key)] = parseSettingValue(row.value);
  }

  return {
    organizationName: values.organization_name ?? "",
    address: values.organization_address ?? "",
    city: values.organization_city ?? "",
    state: values.organization_state ?? "",
    country: values.organization_country ?? "",
    pincode: values.organization_pincode ?? "",
    contactEmail: values.organization_contact_email ?? "",
    contactPhone: values.organization_contact_phone ?? "",
    website: values.organization_website ?? "",
    timezone: values.organization_timezone ?? "",
    businessHoursStart: values.business_hours_start ?? "",
    businessHoursEnd: values.business_hours_end ?? "",
    defaultFollowupTime: values.default_followup_time ?? "",
    dateFormat: values.date_format ?? "",
    timeFormat: values.time_format ?? "",
  };
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {import('../types/settings').OrganizationSettings} settings
 * @param {string} profileId
 */
async function saveOrganizationSettings(supabase, settings, profileId) {
  const { error } = await supabase.rpc("update_organization_settings", {
    p_organization_name: settings.organizationName,
    p_address: settings.address,
    p_city: settings.city,
    p_state: settings.state,
    p_country: settings.country,
    p_pincode: settings.pincode,
    p_contact_email: settings.contactEmail,
    p_contact_phone: settings.contactPhone,
    p_website: settings.website,
    p_timezone: settings.timezone,
    p_business_hours_start: settings.businessHoursStart,
    p_business_hours_end: settings.businessHoursEnd,
    p_default_followup_time: settings.defaultFollowupTime,
    p_date_format: settings.dateFormat,
    p_time_format: settings.timeFormat,
    p_updated_by_profile_id: profileId,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export const getOrganizationSettings = createService({
  name: "getOrganizationSettings",
  execute: fetchOrganizationSettings,
});

export const updateOrganizationSettings = createService({
  name: "updateOrganizationSettings",
  execute: saveOrganizationSettings,
});
