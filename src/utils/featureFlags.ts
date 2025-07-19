// Feature flags utility for controlling app features via URL parameters
// Usage: ?disableBadges=true to disable the badges system
import { WindowURLParser, type URLParser } from './urlParsers'

interface FeatureFlags {
  badgesEnabled: boolean
  pwaEnabled: boolean
}

// Parse URL parameters to determine feature flags
const parseFeatureFlags = (urlParser: URLParser): FeatureFlags => {
  const urlParams = urlParser.getSearchParams()
  
  return {
    badgesEnabled: urlParams.get('enableBadges') === 'true',
    pwaEnabled: urlParams.get('enablePWA') === 'true'
  }
}

// Global URL parser instance (defaults to window parser)
let globalURLParser: URLParser = new WindowURLParser()

// Set the global URL parser (used for testing)
export const setURLParser = (parser: URLParser): void => {
  globalURLParser = parser
}

// Get current feature flags (memoized to avoid repeated parsing)
let cachedFlags: FeatureFlags | null = null

export const getFeatureFlags = (): FeatureFlags => {
  if (cachedFlags === null) {
    cachedFlags = parseFeatureFlags(globalURLParser)
  }
  return cachedFlags
}

// Force refresh of feature flags (useful for testing)
export const refreshFeatureFlags = (): FeatureFlags => {
  cachedFlags = parseFeatureFlags(globalURLParser)
  return cachedFlags
}

// Check if a specific feature is enabled
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return getFeatureFlags()[feature]
} 