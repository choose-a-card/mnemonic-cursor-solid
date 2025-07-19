# Feature Flags

This application supports feature flags that can be controlled via URL parameters. This allows for easy testing and deployment of features.

## Available Feature Flags

### Badges System

**Flag**: `enableBadges`

**Usage**: Add `?enableBadges=true` to the URL to enable the badges/achievement system.

**Examples**:
- `http://localhost:5173/` - Badges disabled (default)
- `http://localhost:5173/?enableBadges=true` - Badges enabled
- `http://localhost:5173/?enableBadges=false` - Badges explicitly disabled

**What it does**:
- Disables all badge calculations and tracking
- Hides the "Achievements" section from the Stats view
- Prevents badge unlock notifications
- Reduces computational overhead

### PWA System

**Flag**: `enablePWA`

**Usage**: Add `?enablePWA=true` to the URL to enable the PWA installation functionality.

**Examples**:
- `http://localhost:5173/` - PWA disabled (default)
- `http://localhost:5173/?enablePWA=true` - PWA enabled
- `http://localhost:5173/?enablePWA=false` - PWA explicitly disabled

**What it does**:
- Shows/hides the "App Installation" section in Settings
- Controls PWA installation prompts and functionality
- Disabled by default since PWA is not ready

## Implementation Details

The feature flags system is modularized across several files:

- `src/utils/featureFlags.ts` - Core feature flags logic
- `src/utils/urlParsers.ts` - URL parser interface and production implementations  
- `src/utils/testUtils.ts` - Test-specific utilities

The system provides:

- **Dependency Injection**: URL parsing is abstracted through the `URLParser` interface
- **Testability**: Easy to test without mocking `window.location`
- **Cached flag values** for performance
- **Type-safe flag checking**
- **Easy extensibility** for new flags

### Architecture

The system uses dependency injection to separate concerns:

```typescript
// URL parser interface and production implementation (in src/utils/urlParsers.ts)
interface URLParser {
  getSearchParams(): URLSearchParams
}

class WindowURLParser implements URLParser {
  getSearchParams(): URLSearchParams {
    return new URLSearchParams(window.location.search)
  }
}

// Test implementation (in src/utils/testUtils.ts)
class TestURLParser implements URLParser {
  private searchParams: URLSearchParams
  
  constructor(searchString: string = '') {
    this.searchParams = new URLSearchParams(searchString)
  }
  
  getSearchParams(): URLSearchParams {
    return this.searchParams
  }
  
  updateSearch(searchString: string): void {
    this.searchParams = new URLSearchParams(searchString)
  }
}
```

## Testing

The dependency injection approach makes testing much easier and more reliable:

```typescript
import { setURLParser } from './featureFlags'
import { TestURLParser } from './testUtils'

describe('Feature Flags', () => {
  let testParser: TestURLParser

  beforeEach(() => {
    testParser = new TestURLParser()
    setURLParser(testParser)
  })

  it('should disable badges when disableBadges=true', () => {
    testParser.updateSearch('?disableBadges=true')
    refreshFeatureFlags()
    expect(isFeatureEnabled('badgesEnabled')).toBe(false)
  })
})
```

**Benefits of this approach:**
- ✅ No need to mock `window.location` (which is problematic in JSDOM)
- ✅ Tests are more reliable and faster
- ✅ Clear separation of concerns
- ✅ Easy to test edge cases
- ✅ No browser-specific dependencies in tests

## Adding New Feature Flags

To add a new feature flag:

1. Update the `FeatureFlags` interface in `src/utils/featureFlags.ts`
2. Add the flag parsing logic in `parseFeatureFlags()`
3. Use `isFeatureEnabled('flagName')` in your components

Example:
```typescript
// In featureFlags.ts
interface FeatureFlags {
  badgesEnabled: boolean
  newFeatureEnabled: boolean  // Add new flag
}

const parseFeatureFlags = (urlParser: URLParser): FeatureFlags => {
  const urlParams = urlParser.getSearchParams()
  
  return {
    badgesEnabled: urlParams.get('disableBadges') !== 'true',
    newFeatureEnabled: urlParams.get('enableNewFeature') === 'true'  // Add parsing
  }
}

// In your component
import { isFeatureEnabled } from '../utils/featureFlags'

if (isFeatureEnabled('newFeatureEnabled')) {
  // Show new feature
}
``` 