export function log(...args: unknown[]) {
  process.stdout.write(`[script] ${args.join(' ')}\n`)
}
export function logWarn(...args: unknown[]) {
  console.warn('[script]', ...args)
}
export function logError(...args: unknown[]) {
  console.error('[script]', ...args)
}
