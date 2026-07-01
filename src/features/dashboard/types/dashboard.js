/**
 * @typedef {'ceo' | 'manager' | 'executive'} DashboardVariant
 */

/**
 * @typedef {Object} DashboardMetric
 * @property {string} id
 * @property {string} label
 * @property {number} value
 * @property {string} [href]
 */

/**
 * @typedef {Object} PipelineStageMetric
 * @property {string} stageId
 * @property {string} stageName
 * @property {string} stageCode
 * @property {number} count
 * @property {number} displayOrder
 */

/**
 * @typedef {Object} RecentActivityRow
 * @property {string} id
 * @property {string} leadId
 * @property {string} organizationName
 * @property {string} activityTypeName
 * @property {string} outcomeName
 * @property {string} performerName
 * @property {string} occurredAt
 * @property {string} remark
 */

/**
 * @typedef {Object} TeamPerformanceRow
 * @property {string} profileId
 * @property {string} fullName
 * @property {number} activitiesToday
 * @property {number} completedToday
 * @property {number} interestedToday
 * @property {number} overdueFollowUps
 */

/**
 * @typedef {Object} CeoDashboardData
 * @property {DashboardMetric[]} metrics
 * @property {PipelineStageMetric[]} pipeline
 * @property {RecentActivityRow[]} recentActivities
 * @property {TeamPerformanceRow[]} teamPerformance
 */

/**
 * @typedef {Object} ManagerDashboardData
 * @property {DashboardMetric[]} metrics
 */

/**
 * @typedef {Object} ExecutiveDashboardData
 * @property {DashboardMetric[]} metrics
 */
