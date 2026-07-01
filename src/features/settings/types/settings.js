/**
 * @typedef {Object} OrganizationSettings
 * @property {string} organizationName
 * @property {string} address
 * @property {string} city
 * @property {string} state
 * @property {string} country
 * @property {string} pincode
 * @property {string} contactEmail
 * @property {string} contactPhone
 * @property {string} website
 * @property {string} timezone
 * @property {string} businessHoursStart
 * @property {string} businessHoursEnd
 * @property {string} defaultFollowupTime
 * @property {string} dateFormat
 * @property {string} timeFormat
 */

/**
 * @typedef {Object} AdminLookupItem
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {number} displayOrder
 * @property {boolean} isActive
 * @property {string | null} activityTypeId
 */

/**
 * @typedef {Object} ArchivedLeadItem
 * @property {string} id
 * @property {string} organizationName
 * @property {string | null} deletedAt
 * @property {string | null} ownerProfileId
 * @property {string | null} stageId
 */

/**
 * @typedef {Object} ArchivedContactItem
 * @property {string} id
 * @property {string} fullName
 * @property {string | null} email
 * @property {string | null} mobileNumber
 * @property {string | null} archivedAt
 * @property {string | null} leadId
 * @property {boolean} isPrimary
 */

/**
 * @typedef {Object} ArchivedDemoItem
 * @property {string} id
 * @property {string | null} leadId
 * @property {string | null} scheduledAt
 * @property {string | null} cancelledAt
 */

/**
 * @typedef {Object} SystemInformation
 * @property {string} applicationVersion
 * @property {string} environment
 * @property {string | null} buildDate
 * @property {string} nodeVersion
 * @property {string} nextVersion
 * @property {string} currentTimezone
 * @property {string} databaseMigrationVersion
 * @property {number} totalActiveUsers
 * @property {number} totalLeads
 * @property {number} totalActivities
 * @property {number} totalFollowups
 */

export {};
