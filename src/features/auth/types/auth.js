/**
 * @typedef {import('@supabase/supabase-js').Session} AuthSession
 */

/**
 * @typedef {import('@supabase/supabase-js').User} AuthUser
 */

/**
 * @typedef {Object} LoginInput
 * @property {string} email
 * @property {string} password
 */

/**
 * @typedef {Object} ServiceResult
 * @property {unknown} [data]
 * @property {Error | null} error
 */

/**
 * @typedef {Object} SignInResult
 * @property {AuthSession | null} data
 * @property {Error | null} error
 * @property {string | null} [code]
 */
