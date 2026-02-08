import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { 
  getFeatureFlags, 
  refreshFeatureFlags, 
  isFeatureEnabled, 
  setURLParser
} from './featureFlags'
import { TestURLParser } from './testUtils'

describe('Feature Flags', () => {
  let testParser: TestURLParser

  beforeEach(() => {
    // Create a new test parser for each test
    testParser = new TestURLParser()
    setURLParser(testParser)
  })

  afterEach(() => {
    // Clean up - this will be handled by the next test's beforeEach
  })

  it('should disable badges by default', () => {
    testParser.updateSearch('')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })

  it('should enable badges when enableBadges=true', () => {
    testParser.updateSearch('?enableBadges=true')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(true)
  })

  it('should disable badges when enableBadges=false', () => {
    testParser.updateSearch('?enableBadges=false')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })

  it('should disable badges when enableBadges is not set', () => {
    testParser.updateSearch('?otherParam=value')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })

  it('should return correct feature flags object', () => {
    testParser.updateSearch('?enableBadges=true')
    refreshFeatureFlags()
    const flags = getFeatureFlags()
    expect(flags).toEqual({
      badgesEnabled: true,
      pwaEnabled: true
    })
  })

  it('should handle multiple URL parameters correctly', () => {
    testParser.updateSearch('?enableBadges=true&otherParam=value&anotherParam=123')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(true)
  })

  it('should handle empty search string correctly', () => {
    testParser.updateSearch('')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })

  it('should handle search string with only question mark correctly', () => {
    testParser.updateSearch('?')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })

  it('should enable PWA by default', () => {
    testParser.updateSearch('')
    refreshFeatureFlags()
    expect(isFeatureEnabled('pwaEnabled')).toBe(true)
  })

  it('should keep PWA enabled when enablePWA=true', () => {
    testParser.updateSearch('?enablePWA=true')
    refreshFeatureFlags()
    expect(isFeatureEnabled('pwaEnabled')).toBe(true)
  })

  it('should disable PWA when enablePWA=false', () => {
    testParser.updateSearch('?enablePWA=false')
    refreshFeatureFlags()
    expect(isFeatureEnabled('pwaEnabled')).toBe(false)
  })

  it('should handle multiple feature flags correctly', () => {
    testParser.updateSearch('?enableBadges=true&enablePWA=true')
    refreshFeatureFlags()
    const flags = getFeatureFlags()
    expect(flags).toEqual({
      badgesEnabled: true,
      pwaEnabled: true
    })
  })
}) 