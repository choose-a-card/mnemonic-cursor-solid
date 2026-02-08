# Mnemonic Stack Trainer

A modern web application for practicing and mastering memorized card stacks used in magic performances. Built with SolidJS for blazing-fast performance.

> 🎨 **Vibe coded** — This project was built entirely through AI-assisted development using Cursor.

## Features

### Stack Reference
- **Study Mode** — View complete stack order with position numbers
- **Blind Mode** — Hide cards and reveal by tapping for memory practice
- **Multiple Stacks** — Support for Tamariz, Aronson, and 5th Faro stacks
- **Custom Stacks** — Create and manage your own memorized deck orders via the visual Stack Builder

### Practice Modes
Nine specialized training exercises to master your stack:

| Mode | Description |
|------|-------------|
| **Card → Position** | Identify the position of a given card |
| **Position → Card** | Identify which card is at a given position |
| **One Ahead** | Practice predicting the next card in sequence |
| **Stack Context** | Learn card relationships (previous/next cards) |
| **First or Second Half** | Determine if a card is in positions 1-26 or 27-52 |
| **Quartet Position** | Locate all four cards of the same rank |
| **Cut to Position** | Calculate which card to cut to for a target position |
| **Cutting Estimation** | Estimate how many cards to cut to reach a target card from any position |
| **PLOP - Denis Behr** | Given a value, enter the suit to cut to the bottom and the three relative distances *(Tamariz stack only)* |

### Analytics
- **Overall Accuracy** — Track your success rate across all sessions
- **Per-Mode Performance** — Accuracy breakdown with visual progress bars for each practice mode
- **Recent Performance** — View last 10 attempts with dot indicators, current streak, and trend analysis

### Achievement Badges *(Feature Flag)*
- **30+ unlockable badges** across five categories: Accuracy, Practice, Modes, Streaks, and Milestones
- **Progress tracking** — See how close you are to earning each badge
- **Mode-specific expert badges** — Earn recognition for mastering individual practice modes

### Progressive Web App (PWA) *(Feature Flag)*
- **Installable** — Add to your home screen on iOS, Android, and desktop
- **Offline support** — Service worker caching for full offline functionality
- **Native-like experience** — Runs as a standalone app with custom icons

### Cookie Consent & Privacy
- **GDPR/CCPA compliant** — Cookie consent dialog with granular preferences
- **Essential vs Analytics** — Users can opt in/out of analytics cookies independently
- **Customizable preferences** — Manage cookie settings anytime from the Settings page

### Settings
- **Stack Selection** — Switch between Tamariz, Aronson, 5th Faro, and custom stacks
- **Custom Stack Builder** — Create, edit, and manage your own 52-card memorized deck orders
- **Practice Range** — Focus on specific card positions with a dual-range slider (e.g., positions 1-26)
- **Dark Mode** — Eye-friendly dark theme with CSS variable-based theming
- **Sound Effects** — Audio feedback for correct/incorrect answers
- **Data Management** — Export or reset all progress data
- **Support** — Buy Me a Coffee integration to support the developer

### Navigation
- **Desktop** — Permanent sidebar navigation with Stack, Practice, Stats, and Settings tabs
- **Mobile** — Bottom tab navigation optimized for touch interaction
- **Responsive** — Adaptive layout across all screen sizes

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/mnemonic-stack-trainer.git
cd mnemonic-stack-trainer

# Install dependencies
npm install --legacy-peer-deps

# (Optional) Set up Google Analytics
# Create a .env file and add your GA4 Measurement ID:
# VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
```

### PWA Preview

```bash
npm run preview:pwa  # Build and preview with service worker enabled
```

## Deployment

The app builds to static files in the `dist/` directory. Deploy to any static hosting:

**Vercel:**
```bash
npm i -g vercel
vercel --prod
```

**Netlify:**
```bash
npm run build
# Drag dist/ folder to Netlify, or connect your repo
```

**GitHub Pages:**
```bash
npm run build
# Push dist/ contents to gh-pages branch
```

## Technology Stack

| Technology | Purpose |
|------------|---------|
| **SolidJS** | Reactive UI framework |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **vite-plugin-pwa** | PWA service worker & manifest generation |
| **solid-transition-group** | Animated route and element transitions |
| **@solidjs/router** | Hash-based client-side routing |
| **Playwright** | End-to-end testing |
| **Jest** | Unit testing |
| **CSS Variables** | Theming & dark mode |

## Project Structure

```
src/
├── components/
│   ├── Navigation/     # Desktop sidebar & mobile bottom tab navigation
│   ├── Practice/       # All 9 practice mode components
│   ├── Settings/       # Configuration, custom stacks, preferences, about & support cards
│   ├── shared/         # Reusable UI (Button, Card, Input, CookieConsent, etc.)
│   ├── Stack/          # Stack reference view (study & blind modes)
│   └── Stats/          # Analytics dashboard, mode performance, badge display
├── contexts/           # Global state (AppSettings, Stats, CustomStacks, CookieConsent, Practice)
├── constants/          # Stack data, practice modes, PLOP data, and app constants
├── hooks/              # Custom hooks (keyboard, debug mode)
├── layouts/            # App shell with responsive navigation
├── pages/              # Route-level components (Stack, Practice, Stats, Settings, StackBuilder)
├── types/              # TypeScript interfaces
└── utils/              # Helpers (analytics, badges, cards, cookies, feature flags, logger, PWA, stats)
```

## Testing

```bash
# Run unit tests
npm run test

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with coverage
npm run test:coverage

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test settings.spec.ts

# Run with UI
npx playwright test --ui

# Run on specific browsers
npm run test:e2e:chromium
npm run test:e2e:firefox
npm run test:e2e:webkit
npm run test:e2e:mobile
```

## Google Analytics

The app includes Google Analytics 4 (GA4) integration for tracking page views and custom events, gated behind cookie consent.

### Setup

1. Create a `.env` file in the project root
2. Add your GA4 Measurement ID:
   ```
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
3. Get your Measurement ID from [Google Analytics](https://analytics.google.com/)

### Features

- **Automatic page view tracking** — Tracks route changes automatically
- **Custom event tracking** — Use `trackEvent()` in components for custom analytics
- **Development mode disabled** — Analytics only run in production builds
- **Privacy-friendly** — Only loads when a measurement ID is provided and the user has given analytics consent

### Usage in Components

```typescript
import { trackEvent } from '../utils/analytics'

// Track a custom event
trackEvent('practice_started', {
  mode: 'card_to_position',
  stack: 'tamariz'
})
```

## Feature Flags

Optional features can be enabled via URL parameters:

| Parameter | Description |
|-----------|-------------|
| `?enableBadges=true` | Enable achievement badges system |
| `?enablePWA=true` | Enable PWA installation prompt UI |
| `?debug=true` | Enable debug controls in stats view |

Example: `https://yourapp.com/#/stats?enableBadges=true`

> **Note:** PWA infrastructure (service worker, manifest, caching) is always active. The `enablePWA` flag only controls the in-app install prompt UI.

## Card Stacks

### Tamariz Stack
Juan Tamariz's "Mnemonica" — the most widely used memorized deck in professional magic. Includes the exclusive PLOP (Denis Behr) practice mode.

### Aronson Stack
Simon Aronson's memorized deck system with powerful built-in tricks.

### 5th Faro Stack
A mathematically derived stack from five perfect faro shuffles.

### Custom Stacks
Create your own 52-card memorized orders through the visual Stack Builder — accessible from the Settings page. Supports creating, editing, and deleting custom stacks with a drag-and-drop card assignment interface.

## Browser Support

- Chrome/Edge 90+
- Firefox 90+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome for Android)

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — see [LICENSE](LICENSE) for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/mnemonic-stack-trainer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/mnemonic-stack-trainer/discussions)
- **Buy Me a Coffee**: [jcvaleravl](https://buymeacoffee.com/jcvaleravl)

---

**Built for the magic community** 🎩✨
