/**
 * @typedef {'invited' | 'active' | 'inactive' | 'suspended'} ProfileStatus
 */

/**
 * @typedef {import('@supabase/supabase-js').Session} AuthSession
 */

/**
 * @typedef {import('@supabase/supabase-js').User} AuthUser
 */

/**
 * @typedef {Object} AuthProfile
 * @property {string} profileId
 * @property {string | null} authUserId
 * @property {string} roleId
 * @property {string | null} managerProfileId
 * @property {string} fullName
 * @property {string} email
 * @property {string | null} phone
 * @property {ProfileStatus} status
 * @property {string | null} invitedAt
 * @property {string | null} activatedAt
 * @property {string | null} lastLoginAt
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} AuthRole
 * @property {string} id
 * @property {string} code
 * @property {string} name
 * @property {string | null} [description]
 */

/**
 * @typedef {Object} SignInIdentity
 * @property {AuthUser} user
 * @property {AuthSession} session
 * @property {AuthProfile} profile
 * @property {AuthRole} role
 */

/**
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} SignInResult
 * @property {SignInIdentity | null} data
 * @property {Error | null} error
 * @property {boolean} accessDenied
 * @property {string | null} accessReason
 * @property {string | null} [code]
 */
