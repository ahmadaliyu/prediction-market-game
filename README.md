# 🎮 Prediction Market Arena

> **A 3D prediction market game built on Avalanche** — bet against AI agents in an immersive sci-fi arena.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Avalanche](https://img.shields.io/badge/Avalanche-C--Chain-E84142)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## ✨ What Makes This Different

This isn't a typical prediction market UI. It's a **gaming experience**:

- **3D Arena** — Markets float as glowing orbs in a sci-fi arena scene built with React Three Fiber
- **AI Agent Competitors** — 4 distinct AI personalities (APEX, ORACLE, GHOST, CHAOS) that bet against you with unique strategies
- **On-Chain Betting** — All bets are settled on Avalanche C-Chain smart contracts with a transparent 2% platform fee
- **Real-Time Odds** — Dynamically calculated payout multipliers based on pool sizes
- **Leaderboard** — Humans vs AI agents ranked by win rate, streaks, and PnL

---

## 🏗️ Architecture

```
prediction-market-game/
├── contracts/                    # Solidity smart contracts
│   ├── PredictionMarket.sol      # Core betting & resolution logic
│   └── MarketFactory.sol         # Factory + player stats + leaderboard
├── scripts/
│   └── deploy.ts                 # Hardhat deployment script
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home — 3D arena + hero + live markets
│   │   ├── markets/page.tsx      # Browse & filter all markets
│   │   ├── leaderboard/page.tsx  # Rankings with top-3 podium
│   │   ├── portfolio/page.tsx    # Your bets, stats, history
│   │   ├── create/page.tsx       # Create a new market
│   │   ├── api/                  # API routes (markets, agents, leaderboard)
│   │   ├── layout.tsx            # Root layout + fonts
│   │   └── globals.css           # Tailwind + custom utilities
│   ├── components/
│   │   ├── 3d/                   # React Three Fiber components
│   │   │   ├── ArenaScene.tsx    # Main Canvas with postprocessing
│   │   │   ├── MarketOrb.tsx     # Floating market spheres
│   │   │   ├── AIAgentAvatar.tsx # 3D AI agent characters
│   │   │   ├── ParticleField.tsx # 500-particle ambient effect
│   │   │   └── ArenaFloor.tsx    # Grid floor + ring lights
│   │   └── ui/                   # React UI components
│   │       ├── Navbar.tsx        # Navigation with route animations
│   │       ├── WalletButton.tsx  # MetaMask connect/disconnect
│   │       ├── MarketCard.tsx    # Market display card
│   │       ├── BettingPanel.tsx  # Slide-in betting interface
│   │       └── AIAgentCard.tsx   # AI agent profile card
│   ├── hooks/
│   │   ├── useWallet.ts          # Wallet connection + chain switching
│   │   └── useContracts.ts       # Smart contract interactions
│   ├── store/
│   │   └── index.ts              # Zustand stores (app, markets, agents, leaderboard)
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── constants.ts          # Chain configs, categories, mock data
│   │   ├── utils.ts              # Formatting, calculations, helpers
│   │   └── abis.ts               # Contract ABIs
│   └── global.d.ts               # R3F JSX type declarations
├── hardhat.config.ts
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **MetaMask** browser extension
- **AVAX** on Fuji testnet ([faucet](https://faucet.avax.network/))

### 1. Clone & Install

```bash
git clone https://github.com/<your-username>/prediction-market-game.git
cd prediction-market-game
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Fill in your values:

```env
FUJI_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
PRIVATE_KEY=<deployer-private-key>
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=<after-deploy>
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=<after-deploy>
```

### 3. Deploy Contracts (Fuji Testnet)

```bash
npx hardhat compile
npx hardhat run scripts/deploy.ts --network fuji
```

Copy the deployed addresses into `.env.local`.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🎯 Smart Contracts

### PredictionMarket.sol

| Function | Description |
|---|---|
| `createMarket(question, imageURI, category, endTime)` | Create a YES/NO prediction market |
| `placeBet(marketId, isYes)` | Bet AVAX on YES or NO outcome |
| `resolveMarket(marketId, outcome)` | Owner resolves market (true = YES wins) |
| `claimWinnings(marketId)` | Winners claim proportional payout |
| `getMarketOdds(marketId)` | View current YES/NO percentages |

### MarketFactory.sol

| Function | Description |
|---|---|
| `registerAgent(name, personality, avatarURI)` | Register an AI agent |
| `updatePlayerStats(player, won, amount)` | Track player performance |
| `getLeaderboard(count)` | Get top N players by win count |

---

## 🤖 AI Agents

| Agent | Personality | Strategy |
|---|---|---|
| 🔴 **APEX** | Aggressive | Follows trends, bets big on momentum |
| 🔵 **ORACLE** | Balanced | Data-driven, weighs odds carefully |
| 🟢 **GHOST** | Conservative | Only bets when confidence is >70% |
| 🟡 **CHAOS** | Chaotic | Contrarian bets, random amounts |

Each AI agent has its own decision-making logic in `/src/app/api/agents/route.ts`.

---

## 🎨 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript |
| **3D Engine** | React Three Fiber, Drei, Postprocessing |
| **Styling** | Tailwind CSS, Framer Motion |
| **State** | Zustand |
| **Blockchain** | Avalanche C-Chain, Solidity 0.8.24 |
| **Web3** | Ethers.js v6, MetaMask |
| **Contracts** | Hardhat, TypeChain |

---

## 📜 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npx hardhat compile  # Compile Solidity contracts
npx hardhat test     # Run contract tests
npm run deploy:fuji  # Deploy to Fuji testnet
npm run node:local   # Start local Hardhat node
```

---

## 🌐 Networks

| Network | Chain ID | RPC |
|---|---|---|
| Avalanche Fuji (Testnet) | 43113 | `https://api.avax-test.network/ext/bc/C/rpc` |
| Avalanche Mainnet | 43114 | `https://api.avax.network/ext/bc/C/rpc` |

---

## 📄 License

MIT
