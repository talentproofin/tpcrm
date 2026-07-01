/**
 * @typedef {'invited' | 'active' | 'inactive' | 'suspended'} UserStatus
 */

/**
 * @typedef {Object} UserRoleSummary
 * @property {string} id
 * @property {string} code
 * @property {string} name
 */

/**
 * @typedef {Object} UserManagerSummary
 * @property {string} profileId
 * @property {string} fullName
 */

/**
 * @typedef {Object} ManagedUser
 * @property {string} profileId
 * @property {string | null} authUserId
 * @property {string} fullName
 * @property {string} email
 * @property {string | null} phone
 * @property {UserStatus} status
 * @property {string | null} managerProfileId
 * @property {string | null} lastLoginAt
 * @property {string} createdAt
 * @property {UserRoleSummary | null} role
 * @property {UserManagerSummary | null} manager
 */

/**
 * @typedef {Object} UserListResult
 * @property {ManagedUser[]} items
 * @property {number} total
 * @property {number} page
 * @property {number} pageSize
 * @property {number} totalPages
 */

/**
 * @typedef {Object} UserMetrics
 * @property {number} totalUsers
 * @property {number} activeUsers
 * @property {number} inactiveUsers
 */
