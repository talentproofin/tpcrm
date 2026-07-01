/**
 * @param {Date} [date]
 * @returns {Date}
 */
export function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

/**
 * @param {Date} [date]
 * @returns {Date}
 */
export function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

/**
 * @param {string} isoValue
 * @returns {boolean}
 */
export function isToday(isoValue) {
  const date = new Date(isoValue);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

/**
 * @param {string} dueAt
 * @param {string} statusCode
 * @param {string | null} completedAt
 * @returns {import('../types/followUp').FollowUpBucket | null}
 */
export function classifyFollowUpBucket(dueAt, statusCode, completedAt) {
  if (statusCode === "completed") {
    if (completedAt && isToday(completedAt)) {
      return "completed_today";
    }
    return null;
  }

  if (statusCode !== "pending" && statusCode !== "overdue") {
    return null;
  }

  const due = new Date(dueAt);
  const start = startOfDay();
  const end = endOfDay();

  if (due < start) {
    return "overdue";
  }

  if (due <= end) {
    return "today";
  }

  return "upcoming";
}

const BUCKET_ORDER = {
  overdue: 0,
  today: 1,
  upcoming: 2,
  completed_today: 3,
};

/**
 * @param {import('../types/followUp').FollowUpWorkspaceItem[]} items
 * @returns {import('../types/followUp').FollowUpWorkspaceItem[]}
 */
export function sortFollowUpItems(items) {
  return [...items].sort((left, right) => {
    const bucketDiff = BUCKET_ORDER[left.bucket] - BUCKET_ORDER[right.bucket];
    if (bucketDiff !== 0) {
      return bucketDiff;
    }

    if (left.bucket === "completed_today") {
      return (
        new Date(right.completedAt ?? right.dueAt).getTime() -
        new Date(left.completedAt ?? left.dueAt).getTime()
      );
    }

    return new Date(left.dueAt).getTime() - new Date(right.dueAt).getTime();
  });
}

/**
 * @param {import('../types/followUp').FollowUpWorkspaceItem[]} items
 * @returns {Record<import('../types/followUp').FollowUpBucket, import('../types/followUp').FollowUpWorkspaceItem[]>}
 */
export function groupFollowUpItems(items) {
  return {
    overdue: items.filter((item) => item.bucket === "overdue"),
    today: items.filter((item) => item.bucket === "today"),
    upcoming: items.filter((item) => item.bucket === "upcoming"),
    completed_today: items.filter((item) => item.bucket === "completed_today"),
  };
}

/**
 * @param {string} text
 * @param {number} [maxLength]
 * @returns {string}
 */
export function summarizeText(text, maxLength = 140) {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  return `${trimmed.slice(0, maxLength - 1)}…`;
}
