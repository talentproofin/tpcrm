/**
 * @typedef {'won' | 'lost' | 'archived'} LeadOutcome
 */

/**
 * @typedef {Object} LeadProfileSummary
 * @property {string} profileId
 * @property {string} fullName
 * @property {string} email
 */

/**
 * @typedef {Object} LeadStageSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} LeadSourceSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} LeadTypeSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} Lead
 * @property {string} id
 * @property {string} organizationName
 * @property {string | null} website
 * @property {string | null} phone
 * @property {string} leadTypeId
 * @property {string | null} primaryContactName
 * @property {string | null} primaryContactPhone
 * @property {string | null} primaryContactEmail
 * @property {string} ownerProfileId
 * @property {string | null} assignedToProfileId
 * @property {string} stageId
 * @property {string | null} leadSourceId
 * @property {LeadOutcome | null} outcome
 * @property {string | null} description
 * @property {string | null} archivedAt
 * @property {string | null} deletedAt
 * @property {string | null} deletedByProfileId
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string} createdByProfileId
 * @property {string | null} updatedByProfileId
 * @property {LeadProfileSummary | null} [owner]
 * @property {LeadProfileSummary | null} [assignedTo]
 * @property {LeadStageSummary | null} [stage]
 * @property {LeadSourceSummary | null} [leadSource]
 * @property {LeadTypeSummary | null} [leadType]
 */

/**
 * @typedef {Object} LeadListItem
 * @property {string} id
 * @property {string} organizationName
 * @property {string | null} primaryContactEmail
 * @property {LeadOutcome | null} outcome
 * @property {string} createdAt
 * @property {LeadProfileSummary | null} owner
 * @property {LeadStageSummary | null} stage
 * @property {LeadTypeSummary | null} leadType
 */

/**
 * @typedef {Object} LeadListResult
 * @property {LeadListItem[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} LeadDuplicateMatch
 * @property {string} id
 * @property {string} organizationName
 * @property {'organization_name' | 'website' | 'phone' | 'primary_contact_email'} matchedOn
 */
