export const EXECUTIVE_ROLE_CODES = ["bde", "marketing", "recruiter"];

export const DAILY_REPORT_ACCESS_ROLE_CODES = ["ceo", "admin"];

/**
 * @param {string} roleCode
 * @returns {boolean}
 */
export function canAccessDailyReport(roleCode) {
  return DAILY_REPORT_ACCESS_ROLE_CODES.includes(roleCode);
}
