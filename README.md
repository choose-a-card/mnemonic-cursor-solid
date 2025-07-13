# 🎴 Mnemonic Stack Trainer

A modern, professional web application for practicing and mastering the Tamariz, Aronson, and 5th Faro card stacks used in magic performances.

## ✨ Features

### 📜 **Stack View**
- **Study Mode**: Display complete stack order with position numbers
- **Blind Mode**: Hide cards and reveal them by tapping for memory practice
- **Clean Interface**: Centered, vertical list with smooth animations

### 🎯 **Practice Modes**
- **Classic Quiz**: Card→Position & Position→Card training
- **One Ahead**: Practice predicting the next card in sequence
- **Stack in Context**: Learn card relationships (previous/next)
- **Cutting Estimation**: Calculate cuts needed to reach target cards
- **Custom Keyboard**: Seamless card input with rank/suit selection
- **Audio Feedback**: Sound effects for correct/incorrect answers

### 📊 **Advanced Analytics**
- **Accuracy Tracking**: Visual progress charts over time
- **AI Suggestions**: Personalized recommendations based on performance
- **Failure Analysis**: Most missed cards and positions
- **Performance Trends**: Recent attempt visualization
- **Session Statistics**: Comprehensive progress tracking

### ⚙️ **Comprehensive Settings**
- **Stack Selection**: Switch between Tamariz, Aronson & 5th Faro stacks
- **Practice Configuration**: Set number of cards to practice
- **Appearance**: Dark mode support with system integration
- **Audio Controls**: Enable/disable sound effects
- **Data Management**: Reset statistics and progress

## 🏗️ Project Structure

```
src/
├── App.jsx                 # Main application with bottom navigation
├── App.css                 # Global app styles with dark mode
├── index.jsx               # Application entry point
├── index.css               # Base styles and CSS variables
└── components/
    ├── Stack/
    │   ├── StackView.jsx   # Stack display with blind mode
    │   └── StackView.css   # Stack component styles
    ├── Practice/
    │   ├── PracticeView.jsx # All practice modes and custom keyboard
    │   └── PracticeView.css # Practice component styles
    ├── Stats/
    │   ├── StatsView.jsx   # Analytics and AI suggestions
    │   └── StatsView.css   # Stats component styles
    └── Settings/
        ├── SettingsView.jsx # App configuration and about
        └── SettingsView.css # Settings component styles
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
- **Build Tool**: Vite - Lightning-fast development experience
- **Styling**: Vanilla CSS with CSS custom properties
- **Icons**: Unicode emojis for universal compatibility
- **Audio**: Web Audio API for sound effects

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
