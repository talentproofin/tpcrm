/**
 * @typedef {Object} OrganizationSummary
 * @property {number} callsAttempted
 * @property {number} callsConnected
 * @property {number} notAnswered
 * @property {number} busy
 * @property {number} interested
 * @property {number} notInterested
 * @property {number} emailActivities
 * @property {number} whatsappActivities
 * @property {number} linkedinActivities
 * @property {number} demoScheduled
 * @property {number} demoCompleted
 * @property {number} activitiesLogged
 * @property {number} completedFollowUps
 * @property {number} overdueFollowUps
 */

/**
 * @typedef {Object} TeamSummaryRow
 * @property {string} profileId
 * @property {string} fullName
 * @property {number} calls
 * @property {number} activities
 * @property {number} interested
 * @property {number} followUpsCompleted
 * @property {number} demosScheduled
 */

/**
 * @typedef {Object} DailyReport
 * @property {string} reportDate
 * @property {OrganizationSummary} organizationSummary
 * @property {TeamSummaryRow[]} teamSummary
 */
