/**
 * Structured logger used by simulation modules and diagnostics panels.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  readonly timestamp: number;
  readonly level: LogLevel;
  readonly scope: string;
  readonly message: string;
  readonly context: unknown;
}

export class Logger {
  private readonly entries: LogEntry[] = [];

  /** Write a debug entry. */
  public debug(scope: string, message: string, context: unknown = null): void {
    this.write('debug', scope, message, context);
  }

  /** Write an info entry. */
  public info(scope: string, message: string, context: unknown = null): void {
    this.write('info', scope, message, context);
  }

  /** Write a warning entry. */
  public warn(scope: string, message: string, context: unknown = null): void {
    this.write('warn', scope, message, context);
  }

  /** Write an error entry. */
  public error(scope: string, message: string, context: unknown = null): void {
    this.write('error', scope, message, context);
  }

  /** Return the most recent logger entries. */
  public recent(limit: number): readonly LogEntry[] {
    return this.entries.slice(-limit);
  }

  private write(level: LogLevel, scope: string, message: string, context: unknown): void {
    this.entries.push({
      timestamp: Date.now(),
      level,
      scope,
      message,
      context
    });
  }
}

