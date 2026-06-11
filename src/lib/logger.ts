type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info'

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

function shouldLog(level: LogLevel): boolean {
  return LEVELS[level] >= LEVELS[LOG_LEVEL]
}

const isServer = typeof process !== 'undefined' && typeof process.stdout !== 'undefined'

function stdoutWrite(text: string) {
  if (isServer) {
    process.stdout.write(text)
  }
}

export const logger = {
  debug(...args: unknown[]) {
    if (shouldLog('debug')) stdoutWrite([`[DEBUG]`, ...args].join(' ') + '\n')
  },
  info(...args: unknown[]) {
    if (shouldLog('info')) stdoutWrite([`[INFO]`, ...args].join(' ') + '\n')
  },
  warn(...args: unknown[]) {
    if (shouldLog('warn')) console.warn('[WARN]', ...args)
  },
  error(...args: unknown[]) {
    if (shouldLog('error')) console.error('[ERROR]', ...args)
  },
}
