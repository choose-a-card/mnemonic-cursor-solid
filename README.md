# 🎴 Mnemonic Stack Trainer

A modern, professional web application for practicing and mastering the Tamariz, Aronson, and 5th Faro card stacks used in magic performances.

## ✨ Features

### 📜 **Stack View**
- **Study Mode**: Display complete stack order with position numbers
- **Blind Mode**: Hide cards and reveal them by tapping for memory practice
- **Clean Interface**: Centered, vertical list with smooth animations

### 🎯 **Practice Modes**
- **Card → Position**: Identify the position of a given card
- **Position → Card**: Identify which card is at a given position
- **One Ahead**: Practice predicting the next card in sequence
- **Stack in Context**: Learn card relationships (previous/next)
- **First or Second Half**: Determine if a card is in the first or second half
- **Quartet Position**: Locate all four cards of the same rank
- **Cut to Position**: Calculate which card to cut to for a target position
- **Cutting Estimation**: Calculate cuts needed to reach target cards (±8 cards)
- **Custom Keyboard**: Seamless card input with rank/suit selection
- **Audio Feedback**: Sound effects for correct/incorrect answers

### 📊 **Advanced Analytics**
- **Overall Accuracy**: Track your success rate across all practice sessions
- **Per-Mode Performance**: Monitor accuracy for each practice mode individually
- **Recent Performance**: View last 10 attempts, current streak, and trends
- **Mode-Specific Failures**: Track most missed cards/positions per practice mode
- **Session Statistics**: Comprehensive progress tracking with persistent storage
- **Achievement System**: Badges and progress tracking (can be enabled via feature flag)

### ⚙️ **Settings & Customization**
- **Stack Selection**: Switch between Tamariz, Aronson & 5th Faro stacks
- **Feature Flags**: Control app features via URL parameters
  - `?enableBadges=true` - Enable the badges/achievement system (disabled by default)
  - `?enablePWA=true` - Enable PWA installation functionality (disabled by default)

## 🏗️ Project Structure

```
src/
├── App.tsx                    # Main application component
├── App.css                    # Global app styles
├── index.tsx                  # Application entry point with routing
├── index.css                  # Base styles and CSS variables
├── components/
│   ├── Navigation/            # Bottom navigation component
│   ├── Practice/              # Practice mode components
│   ├── Settings/              # Settings components
│   ├── shared/                # Reusable UI components
│   ├── Stack/                 # Stack display components
│   └── Stats/                 # Analytics components
├── constants/                 # App constants (stacks, timers, etc.)
├── contexts/                  # React contexts for state management
├── hooks/                     # Custom React hooks
├── layouts/                   # Layout components
├── pages/                     # Page-level components
├── sounds/                    # Audio feedback system
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```

## 🎨 Design Philosophy

- **Apple-like UI**: Clean, minimal, professional aesthetic
- **No Layout Shifts**: Reserved space prevents jarring content jumps
- **Smooth Animations**: Subtle transitions throughout the interface
- **Responsive Design**: Works seamlessly on all screen sizes
- **Accessibility**: Proper contrast, focus states, and ARIA labels

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mnemonic-cursor-solid
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## 🛠️ Technology Stack

- **Framework**: SolidJS - Fast, reactive UI library
- **Language**: TypeScript - Type-safe development
- **Build Tool**: Vite - Lightning-fast development experience
- **Router**: @solidjs/router - Client-side routing
- **Styling**: Vanilla CSS with CSS custom properties
- **Icons**: Unicode emojis for universal compatibility
- **Audio**: Web Audio API for sound effects
- **Testing**: Jest & Playwright for unit and E2E tests

## 📱 Usage

### Stack Practice
1. Select your preferred stack (Tamariz, Aronson, or 5th Faro)
2. Use **Stack** tab to study the order
3. Toggle **Blind Mode** to test your memory

### Training
1. Go to **Practice** tab
2. Choose from 4 different training modes
3. Use the custom keyboard for card input
4. Track your progress in real-time

### Analytics
1. View your **Stats** tab for detailed analysis
2. Follow AI suggestions for improvement
3. Monitor accuracy trends over time

### Configuration
1. Access **Settings** tab for customization
2. Switch stacks, adjust practice size
3. Enable dark mode and sound effects

## 🎯 Card Stacks

### Tamariz Stack (52 cards)
The complete Juan Tamariz memorized deck order, widely used in professional magic.

### Aronson Stack (52 cards)
Simon Aronson's "Aronson Stack" - another popular memorized deck system.

### 5th Faro Stack (52 cards)
A mathematically derived stack based on the 5th perfect faro shuffle, creating a unique memorized order.

## 🔧 Development

### Code Organization
- **Components**: Modular, reusable UI components
- **Separation of Concerns**: Logic, styling, and markup clearly separated
- **Clean Architecture**: Easy to maintain and extend

### Performance
- **Lazy Loading**: Components load only when needed
- **Optimized Rendering**: Minimal re-renders with SolidJS
- **Efficient State**: Granular reactivity system

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For questions or support, please open an issue in the repository.

---

**Built with ❤️ for the magic community**
