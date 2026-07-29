import type { LogContext, Logger } from "@/shared/logging/logger";

const sensitiveKeyPattern = /authorization|cookie|password|secret|token|key/i;

export function redactLogContext(context: LogContext = {}): LogContext {
  return Object.fromEntries(
    Object.entries(context).map(([key, value]) => [
      key,
      sensitiveKeyPattern.test(key) ? "[REDACTED]" : value,
    ]),
  );
}

export class ConsoleLogger implements Logger {
  debug(message: string, context?: LogContext): void {
    console.debug(message, redactLogContext(context));
  }

  info(message: string, context?: LogContext): void {
    console.info(message, redactLogContext(context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(message, redactLogContext(context));
  }

  error(message: string, context?: LogContext): void {
    console.error(message, redactLogContext(context));
  }
}
