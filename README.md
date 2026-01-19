# 🎰 Casino Platform

<div align="center">

![Casino Banner](https://img.shields.io/badge/🎲_Casino-Virtual_Gaming_Platform-blueviolet?style=for-the-badge)

[![TypeScript](https://img.shields.io/badge/TypeScript-97.1%25-blue?style=flat-square&logo=typescript)](https://github.com/Paidguy/casino)
[![HTML](https://img.shields.io/badge/HTML-2.5%25-orange?style=flat-square&logo=html5)](https://github.com/Paidguy/casino)
[![CSS](https://img.shields.io/badge/CSS-0.4%25-blue?style=flat-square&logo=css3)](https://github.com/Paidguy/casino)

**A sophisticated virtual casino gaming platform featuring provably fair games and an immersive user experience**

[🎮 Live Demo](http://paidguy.me/casino/) • [📖 Documentation](#documentation) • [🐛 Report Bug](#issues) • [✨ Request Feature](#contributing)

---

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Game Modules](#-game-modules)
- [Architecture](#-architecture)
- [Fair Play](#-fair-play)
- [Performance](#-performance)
- [Contributing](#-contributing)
- [License](#-license)

## 🎯 Overview

**Casino** is a cutting-edge virtual gaming platform that brings the excitement of casino games to your browser. Built with modern web technologies, this application demonstrates advanced React patterns, cryptographic fairness verification, and responsive design principles.

This platform is designed for educational and entertainment purposes, showcasing how modern web technologies can create engaging, fair, and performant gaming experiences.

### 🌟 Key Highlights

- **Provably Fair Gaming** - All game outcomes use HMAC-SHA256 for cryptographic verification
- **Multiple Game Types** - From classic Kalyan Matka to modern Aviator-style games
- **Responsive Design** - Optimized for desktop, tablet, and mobile devices
- **Real-time Updates** - Live game statistics and betting history
- **Zero Backend Required** - Runs entirely in the browser using client-side logic

## ✨ Features

### 🎮 Gaming Experience

- **Immersive UI/UX** - Neon-themed interface inspired by Mumbai's vibrant nightlife
- **Multiple Game Modes** - Includes Kalyan Matka, Aviator, Baccarat, Keno, and Slots
- **Live Statistics** - Real-time tracking of wins, losses, and game history
- **Responsive Controls** - Optimized input handling for quick betting decisions
- **Session Management** - Persistent game state across browser sessions

### 🔒 Security & Fairness

- **Cryptographic Verification** - HMAC-SHA256 based provably fair system
- **Client Seed Control** - Users can verify and rotate their own seeds
- **Transparent Algorithms** - All game logic is auditable and deterministic
- **No Server Manipulation** - All calculations happen client-side

### 🎨 Design & Performance

- **Theater Mode Layout** - Distraction-free fullscreen game experience
- **60 FPS Target** - Smooth animations and transitions
- **GPU Acceleration** - Hardware-accelerated graphics for slots and animations
- **Optimized Bundle** - Code-splitting and lazy loading for fast initial loads
- **Dark Theme** - Eye-friendly color scheme for extended play sessions

## 🛠 Technology Stack

### Frontend Framework
- **React** - Component-based UI architecture
- **TypeScript** - Type-safe development with enhanced IDE support
- **Vite** - Lightning-fast build tool and development server

### Styling & UI
- **CSS3** - Custom animations and responsive layouts
- **CSS Variables** - Dynamic theming capabilities
- **Flexbox/Grid** - Modern layout techniques

### State Management
- **React Hooks** - Modern state management with useState, useEffect, useContext
- **Local Storage** - Persistent game state and user preferences

### Game Logic
- **Cryptographic Libraries** - HMAC-SHA256 for fair random generation
- **Canvas API** - High-performance rendering for certain game types
- **Web Audio API** - Sound effects and audio feedback

## 📁 Project Structure

```
casino/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD pipelines
├── components/             # Reusable React components
│   ├── GameCard.tsx       # Individual game display components
│   ├── BettingPanel.tsx   # Betting interface components
│   ├── Sidebar.tsx        # Navigation and info sidebar
│   └── ...
├── pages/                 # Main page components
│   ├── Lobby.tsx         # Game selection lobby
│   ├── KalyanMatka.tsx   # Matka game page
│   ├── Aviator.tsx       # Aviator game page
│   ├── Baccarat.tsx      # Baccarat game page
│   └── ...
├── services/             # Business logic and utilities
│   ├── fairness.ts      # Provably fair algorithms
│   ├── gameEngine.ts    # Core game mechanics
│   └── storage.ts       # Local storage management
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── index.css            # Global styles
├── types.ts             # TypeScript type definitions
├── metadata.json        # Project metadata
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Project dependencies
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16.0 or higher)
- **npm** or **yarn** package manager
- A modern web browser (Chrome, Firefox, Safari, or Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Paidguy/casino.git
   cd casino
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:5173` (or the port shown in your terminal)

### Building for Production

To create an optimized production build:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist/` directory, ready for deployment to any static hosting service.

### Deployment

This project can be deployed to various platforms:

- **GitHub Pages** - Automated via GitHub Actions workflow
- **Vercel** - Zero-config deployment
- **Netlify** - Drag-and-drop or Git integration
- **Cloudflare Pages** - Fast edge deployment

## 🎲 Game Modules

### 🏺 Kalyan Matka
Traditional Indian lottery-style game with three-digit draws.

- **Gameplay**: Select numbers and bet on the outcome
- **Payout**: 9x multiplier on winning single digit
- **Features**: Historical charts, trend analysis, pattern recognition
- **House Edge**: 5.0%

### 🚀 Aviator
Modern multiplier game with exponential risk/reward.

- **Gameplay**: Cash out before the rocket crashes
- **Multiplier**: Exponential growth from 1.00x onwards
- **Features**: Real-time multiplier, auto-cashout, crash history
- **House Edge**: 3.0%

### 🃏 Baccarat
Classic card comparison game.

- **Gameplay**: Bet on Player, Banker, or Tie
- **Payouts**: 2x for Player/Banker, 9x for Tie
- **Features**: Card reveal animations, betting history
- **House Edge**: 1.06%

### 🔢 Keno
Number selection game with progressive payouts.

- **Gameplay**: Pick 1-10 numbers from a field of 40
- **Payouts**: Progressive multipliers based on hits
- **Features**: Quick pick, number frequency stats
- **House Edge**: 5.0%

### 🎰 Slots
Three-reel slot machine with multiple symbols.

- **Symbols**: 🍒 (2x), 🍋 (2x), 🍇 (20x), 💎 (50x), 7️⃣ (100x)
- **Features**: Smooth reel animations, near-miss effects
- **Special**: Jackpot progressive multiplier
- **House Edge**: 4.0%

## 🏗 Architecture

### Component Hierarchy

```
App
├── Router
│   ├── Lobby
│   │   ├── GameGrid
│   │   │   └── GameCard[]
│   │   └── WalletDisplay
│   └── GamePages
│       ├── KalyanMatka
│       │   ├── BettingPanel
│       │   ├── ResultDisplay
│       │   └── HistoryChart
│       ├── Aviator
│       │   ├── RocketCanvas
│       │   ├── MultiplierDisplay
│       │   └── CashoutButton
│       └── [Other Games...]
└── GlobalComponents
    ├── Sidebar
    ├── Header
    └── FairnessVerifier
```

### State Management Strategy

The application uses a hybrid state management approach:

1. **Local Component State** - For UI-specific state (loading, animations)
2. **Context API** - For global state (wallet balance, user preferences)
3. **LocalStorage** - For persistent state (game history, seeds)

### Data Flow

```
User Action → Component Handler → State Update → Re-render
                                ↓
                           LocalStorage Sync
                                ↓
                        Fairness Verification
```

## 🎲 Fair Play

### Provably Fair System

Every game result is generated using a cryptographically secure algorithm:

1. **Server Seed** - Generated randomly for each session
2. **Client Seed** - User-provided or randomly generated
3. **Nonce** - Incremental counter for each bet
4. **Result** - HMAC-SHA256(server_seed + client_seed + nonce)

### Verification Process

Users can verify any result by:

1. Viewing the hashed server seed before betting
2. Checking the revealed server seed after the round
3. Computing HMAC-SHA256 with their client seed and nonce
4. Comparing the output with the game result

### Seed Rotation

Users can rotate their client seed at any time to ensure fresh randomness and maintain control over the verification process.

## ⚡ Performance

### Optimization Techniques

- **Code Splitting** - Games loaded on-demand to reduce initial bundle size
- **Lazy Loading** - Components imported asynchronously
- **Memoization** - React.memo() and useMemo() for expensive computations
- **Virtual Scrolling** - For long game history lists
- **RequestAnimationFrame** - Smooth 60 FPS animations
- **Web Workers** - Heavy calculations offloaded from main thread (future enhancement)

### Bundle Analysis

| Asset | Size (Gzipped) |
|-------|----------------|
| Main Bundle | ~180 KB |
| Game Modules (lazy) | ~40 KB each |
| Total Initial Load | < 250 KB |

### Performance Metrics

- **First Contentful Paint**: < 1.2s
- **Time to Interactive**: < 2.5s
- **Lighthouse Score**: 95+ (Performance)

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/Paidguy/casino/issues)
2. If not, create a new issue with:
   - Clear description of the bug
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Browser and OS information

### Suggesting Features

1. Open a new issue with the `enhancement` label
2. Describe the feature and its benefits
3. Provide examples or mockups if possible

### Code Contributions

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow the existing code style
   - Add comments for complex logic
   - Update documentation as needed
4. **Test thoroughly**
5. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to your fork**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Development Guidelines

- Write clean, readable TypeScript code
- Follow React best practices and hooks guidelines
- Maintain responsive design principles
- Ensure accessibility standards (WCAG 2.1)
- Add unit tests for new features (when applicable)
- Keep bundle size optimized

## 📜 License

This project is open source and available for educational purposes.

**Important Notice**: This is a **VIRTUAL SIMULATION** platform.
- No real money is exchanged
- All balances are demo credits
- Intended for educational and entertainment purposes only
- Users must be 18+ years of age

## 🙏 Acknowledgments

- Built by [@paidguy](https://github.com/Paidguy)
- Inspired by the vibrant gaming culture of Mumbai
- Generated from [google-gemini/aistudio-repository-template](https://github.com/google-gemini/aistudio-repository-template)

## 📞 Contact & Support

- **Live Demo**: [paidguy.me/casino](http://paidguy.me/casino/)
- **GitHub**: [github.com/Paidguy/casino](https://github.com/Paidguy/casino)
- **Issues**: [Report a bug or request a feature](https://github.com/Paidguy/casino/issues)

---

<div align="center">

**Made with ❤️ by [@paidguy](https://github.com/Paidguy)**

⭐ Star this repo if you found it helpful!

</div>
