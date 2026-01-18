# Hopstrike 🥊🦘

A fast-paced mobile boxing game featuring kangaroo fighters, built with React Native.

## About

Hopstrike is a tap-based fighting game where players control unique kangaroo boxers in intense one-on-one matches. Each fighter has their own stats, moves, and signature special combos.

## Features

- **8 Unique Fighters**: Each with distinct fighting styles, stats, and special moves
  - Rocky Roo - The Outback Champion (balanced brawler)
  - Bella Bounce - The Lightning Paw (speedster)
  - Thunder Jack - The Mountain (heavy hitter)
  - Swift Sally - The Counter Queen (counter fighter)
  - Iron Joey - The Unbreakable (defensive tank)
  - Wild Wally - The Loose Cannon (high risk/reward)
  - Duchess Dot - The Aristocrat (technical precision)
  - Brawler Bruce - The Relentless (pressure fighter)

- **Tap-Based Combat**: Intuitive controls with tap zones for jabs, hooks, uppercuts, blocks, and dodges
- **Special Moves**: Build meter and execute devastating combo attacks
- **Frame-Perfect Engine**: 60fps game logic for smooth, responsive gameplay
- **AI Opponents**: Fight against computer-controlled opponents with varying difficulty
- **Screen Shake Effects**: Satisfying visual feedback on hits
- **Round-Based Matches**: Best-of-3 format with time limits

## Tech Stack

- React Native 0.83.1
- React 19.2.0
- TypeScript
- React Navigation
- React Native Reanimated

## Getting Started

### Prerequisites

- Node.js >= 20
- React Native development environment ([Setup Guide](https://reactnative.dev/docs/set-up-your-environment))

### Installation

1. Clone the repository
2. Install dependencies:
   ```sh
   npm install
   ```
3. Install iOS dependencies:
   ```sh
   bundle install
   bundle exec pod install
   ```

### Running the App

```sh
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Project Structure

```
src/
├── components/     # UI components (Fighter, HealthBar, TapZones, etc.)
├── constants/      # Game data (fighters, moves, combos)
├── hooks/          # Custom hooks (useMatch, useGameLoop, useScreenShake)
├── navigation/     # App navigation setup
├── screens/        # Game screens (MainMenu, FighterSelect, Fight)
├── services/       # Game engine and AI logic
├── types/          # TypeScript type definitions
└── utils/          # Helper functions
```

## Roadmap

- [ ] VS Human (local multiplayer) mode
- [ ] Online multiplayer
- [ ] Additional fighters
- [ ] Tournament mode
