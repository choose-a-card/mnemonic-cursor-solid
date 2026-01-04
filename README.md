# Mnemonic Stack Trainer

A modern web application for practicing and mastering memorized card stacks used in magic performances. Built with SolidJS for blazing-fast performance.

## Features

### Stack Reference
- **Study Mode** — View complete stack order with position numbers
- **Blind Mode** — Hide cards and reveal by tapping for memory practice
- **Multiple Stacks** — Support for Tamariz, Aronson, and 5th Faro stacks
- **Custom Stacks** — Create and manage your own memorized deck orders

### Practice Modes
Eight specialized training exercises to master your stack:

| Mode | Description |
|------|-------------|
| **Card → Position** | Identify the position of a given card |
| **Position → Card** | Identify which card is at a given position |
| **One Ahead** | Practice predicting the next card in sequence |
| **Stack in Context** | Learn card relationships (previous/next cards) |
| **First or Second Half** | Determine if a card is in positions 1-26 or 27-52 |
| **Quartet Position** | Locate all four cards of the same rank |
| **Cut to Position** | Calculate which card to cut to for a target position |
| **Cutting Estimation** | Calculate cuts needed to reach target cards (±8 tolerance) |

### Analytics
- **Overall Accuracy** — Track your success rate across all sessions
- **Per-Mode Performance** — Monitor accuracy for each practice mode
- **Recent Performance** — View last 10 attempts, current streak, and trends
- **Failure Tracking** — Identify your most missed cards and positions

### Settings
- **Stack Selection** — Switch between preset and custom stacks
- **Practice Range** — Focus on specific card positions (e.g., 1-26)
- **Dark Mode** — Eye-friendly dark theme
- **Sound Effects** — Audio feedback for correct/incorrect answers

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

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Build for Production

```bash
npm run build
npm run preview  # Preview production build locally
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
| **Playwright** | End-to-end testing |
| **CSS Variables** | Theming & dark mode |

## Project Structure

```
src/
├── components/
│   ├── Navigation/     # Bottom tab navigation
│   ├── Practice/       # All practice mode components
│   ├── Settings/       # Configuration cards
│   ├── shared/         # Reusable UI (Button, Card, etc.)
│   ├── Stack/          # Stack display view
│   └── Stats/          # Analytics dashboard
├── contexts/           # Global state (Settings, Stats, CustomStacks)
├── constants/          # Stack data and app constants
├── hooks/              # Custom hooks (keyboard, debug mode)
├── layouts/            # App shell and navigation
├── pages/              # Route-level components
├── types/              # TypeScript interfaces
└── utils/              # Helpers (cards, calculations, logger)
```

## Testing

```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test settings.spec.ts

# Run with UI
npx playwright test --ui
```

## Feature Flags

Optional features can be enabled via URL parameters:

| Parameter | Description |
|-----------|-------------|
| `?enableBadges=true` | Enable achievement badges system |
| `?enablePWA=true` | Enable PWA installation prompt |
| `?debug=true` | Enable debug controls in stats view |

Example: `https://yourapp.com/#/stats?enableBadges=true`

## Card Stacks

### Tamariz Stack
Juan Tamariz's "Mnemonica" — the most widely used memorized deck in professional magic.

### Aronson Stack
Simon Aronson's memorized deck system with powerful built-in tricks.

### 5th Faro Stack
A mathematically derived stack from five perfect faro shuffles.

### Custom Stacks
Create your own 52-card memorized orders through the visual stack builder in Settings.

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

---

**Built for the magic community**
