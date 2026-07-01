import { logger } from "@/services/logging";

/**
 * Creates a reusable infrastructure service with consistent logging and error handling.
 *
 * @template T
 * @param {object} options
 * @param {string} options.name - Service name for logging
 * @param {(args: unknown[]) => Promise<T>} options.execute - Service implementation
 * @returns {(...args: unknown[]) => Promise<{ data: T | null, error: Error | null }>}
 */
export function createService({ name, execute }) {
  if (!name || typeof name !== "string") {
    throw new Error("createService requires a name");
  }

  if (typeof execute !== "function") {
    throw new Error(`createService("${name}") requires an execute function`);
  }

  return async function run(...args) {
    logger.debug(`${name}: started`);

    try {
      const data = await execute(...args);
      logger.debug(`${name}: completed`);
      return { data, error: null };
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error(`${name}: failed`, { error: error.message });
      return { data: null, error };
    }
  };
}
