/**
 * @param {string | null | undefined} isoValue
 * @returns {string}
 */
export function toDateTimeLocalValue(isoValue) {
  if (!isoValue) {
    return "";
  }

  const date = new Date(isoValue);
  const pad = (value) => String(value).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * @param {string} localValue
 * @returns {string}
 */
export function fromDateTimeLocalValue(localValue) {
  if (!localValue) {
    return "";
  }

  return new Date(localValue).toISOString();
}
