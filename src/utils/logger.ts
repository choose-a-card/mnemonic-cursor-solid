/**
 * Production-safe logger utility
 * Only logs in development mode (import.meta.env.DEV)
 */

const isDev = import.meta.env.DEV

export const logger = {
  log: (...args: unknown[]): void => {
    if (isDev) {
      console.log(...args)
    }
  },
  
  warn: (...args: unknown[]): void => {
    if (isDev) {
      console.warn(...args)
    }
  },
  
  error: (...args: unknown[]): void => {
    // Errors are always logged (important for debugging production issues)
    console.error(...args)
  },
  
  debug: (...args: unknown[]): void => {
    if (isDev) {
      console.debug(...args)
    }
  }
}

