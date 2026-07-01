/** @type {const} */
export const ACTIVITY_DIRECTIONS = ["outbound", "inbound"];

/** @type {import('../types/activity').ActivityDirection} */
export const DEFAULT_ACTIVITY_DIRECTION = "outbound";

/** @type {Record<import('../types/activity').ActivityDirection, string>} */
export const ACTIVITY_DIRECTION_LABELS = {
  outbound: "Outbound",
  inbound: "Inbound",
};
