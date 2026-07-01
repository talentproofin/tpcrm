/**
 * @typedef {'outbound' | 'inbound'} ActivityDirection
 */

/**
 * @typedef {Object} ActivityProfileSummary
 * @property {string} profileId
 * @property {string} fullName
 * @property {string} email
 */

/**
 * @typedef {Object} ActivityLookupSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} ActivityFollowUp
 * @property {string} id
 * @property {string} dueAt
 * @property {string | null} notes
 * @property {ActivityLookupSummary} status
 * @property {ActivityProfileSummary} assignedTo
 */

/**
 * @typedef {Object} Activity
 * @property {string} id
 * @property {string} leadId
 * @property {string} activityTypeId
 * @property {string} activityOutcomeId
 * @property {string} remark
 * @property {ActivityDirection | null} direction
 * @property {string} performedByProfileId
 * @property {string} occurredAt
 * @property {string} createdByProfileId
 * @property {string} createdAt
 * @property {ActivityLookupSummary | null} [activityType]
 * @property {ActivityLookupSummary | null} [activityOutcome]
 * @property {ActivityProfileSummary | null} [performedBy]
 * @property {ActivityFollowUp | null} [nextFollowUp]
 */
