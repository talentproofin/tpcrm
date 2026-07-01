import { env } from "@/config/env";
import {
  DEFAULT_LOG_LEVEL,
  LOG_LEVEL_PRIORITY,
  LOG_LEVELS,
} from "@/constants/logging";

/**
 * Structured logger for infrastructure services.
 * Outputs JSON in production, readable format in development.
 */
function shouldLog(level) {
  const configured = LOG_LEVEL_PRIORITY[env.logLevel] ?? LOG_LEVEL_PRIORITY[DEFAULT_LOG_LEVEL];
  const requested = LOG_LEVEL_PRIORITY[level] ?? LOG_LEVEL_PRIORITY[LOG_LEVELS.INFO];
  return requested >= configured;
}

function formatMessage(level, message, context) {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };

  if (env.isDevelopment) {
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";
    return `[${entry.timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  return JSON.stringify(entry);
}

function write(level, message, context) {
  if (!shouldLog(level)) return;

  const output = formatMessage(level, message, context);

  switch (level) {
    case LOG_LEVELS.ERROR:
      console.error(output);
      break;
    case LOG_LEVELS.WARN:
      console.warn(output);
      break;
    default:
      console.log(output);
  }
}

export const logger = {
  debug: (message, context) => write(LOG_LEVELS.DEBUG, message, context),
  info: (message, context) => write(LOG_LEVELS.INFO, message, context),
  warn: (message, context) => write(LOG_LEVELS.WARN, message, context),
  error: (message, context) => write(LOG_LEVELS.ERROR, message, context),
};
