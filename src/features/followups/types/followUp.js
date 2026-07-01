/**
 * @typedef {'overdue' | 'today' | 'upcoming' | 'completed_today'} FollowUpBucket
 */

/**
 * @typedef {Object} FollowUpProfileSummary
 * @property {string} profileId
 * @property {string} fullName
 * @property {string} email
 */

/**
 * @typedef {Object} FollowUpLookupSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} FollowUpPreviousActivity
 * @property {string} id
 * @property {string} remark
 * @property {string} occurredAt
 * @property {FollowUpLookupSummary | null} activityType
 * @property {FollowUpLookupSummary | null} activityOutcome
 */

/**
 * @typedef {Object} FollowUpLeadSummary
 * @property {string} id
 * @property {string} organizationName
 * @property {string | null} phone
 * @property {string | null} primaryContactName
 * @property {string | null} primaryContactPhone
 * @property {FollowUpLookupSummary | null} leadType
 * @property {FollowUpLookupSummary | null} stage
 */

/**
 * @typedef {Object} FollowUpWorkspaceItem
 * @property {string} id
 * @property {string} leadId
 * @property {string} activityId
 * @property {string} assignedToProfileId
 * @property {string} dueAt
 * @property {string | null} notes
 * @property {string | null} completedAt
 * @property {string} createdAt
 * @property {FollowUpLookupSummary} status
 * @property {FollowUpProfileSummary | null} assignedTo
 * @property {FollowUpLeadSummary} lead
 * @property {FollowUpPreviousActivity | null} previousActivity
 * @property {FollowUpBucket} bucket
 */

/**
 * @typedef {Object} FollowUpWorkspaceResult
 * @property {FollowUpWorkspaceItem[]} items
 * @property {Record<FollowUpBucket, FollowUpWorkspaceItem[]>} grouped
 */
