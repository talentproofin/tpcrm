/**
 * @typedef {'online' | 'offline'} DemoMode
 */

/**
 * @typedef {'scheduled' | 'completed' | 'cancelled' | 'rescheduled'} DemoStatusCode
 */

/**
 * @typedef {'positive' | 'follow_up_required' | 'not_interested' | 'decision_pending'} DemoOutcomeCode
 */

/**
 * @typedef {Object} DemoStatusSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} DemoOutcomeSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} DemoPresenterSummary
 * @property {string} profileId
 * @property {string} fullName
 * @property {string} email
 */

/**
 * @typedef {Object} Demo
 * @property {string} id
 * @property {string} leadId
 * @property {string} scheduledAt
 * @property {number} durationMinutes
 * @property {DemoMode} demoMode
 * @property {string | null} meetingLink
 * @property {string | null} venue
 * @property {string} presenterProfileId
 * @property {string | null} attendees
 * @property {string} demoStatusId
 * @property {string | null} demoOutcomeId
 * @property {string | null} summary
 * @property {string | null} internalNotes
 * @property {string | null} completedAt
 * @property {string | null} cancelledAt
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {DemoStatusSummary | null} [status]
 * @property {DemoOutcomeSummary | null} [outcome]
 * @property {DemoPresenterSummary | null} [presenter]
 */
