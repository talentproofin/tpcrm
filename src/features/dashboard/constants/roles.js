export const DASHBOARD_ROLE_CODES = {
  CEO: "ceo",
  ADMIN: "admin",
  MANAGER: "manager",
  BDE: "bde",
  MARKETING: "marketing",
  RECRUITER: "recruiter",
};

export const DASHBOARD_VARIANTS = {
  CEO: "ceo",
  MANAGER: "manager",
  EXECUTIVE: "executive",
};

/**
 * @param {string} roleCode
 * @returns {import('./roles').DashboardVariant}
 */
export function resolveDashboardVariant(roleCode) {
  if (
    roleCode === DASHBOARD_ROLE_CODES.CEO ||
    roleCode === DASHBOARD_ROLE_CODES.ADMIN
  ) {
    return DASHBOARD_VARIANTS.CEO;
  }

  if (roleCode === DASHBOARD_ROLE_CODES.MANAGER) {
    return DASHBOARD_VARIANTS.MANAGER;
  }

  return DASHBOARD_VARIANTS.EXECUTIVE;
}
