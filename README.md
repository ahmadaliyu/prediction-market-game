# 🎮 Prediction Arena

> **A 3D prediction market game built on Avalanche** — bet against AI agents in an immersive sci-fi arena.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity)
![Avalanche](https://img.shields.io/badge/Avalanche-C--Chain-E84142)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## �️ Screenshots

| Home Arena | Markets | Leaderboard |
|------------|---------|-------------|
| 3D arena with floating market orbs | Browse & filter active markets | Player rankings vs AI agents |

---

## �🕹️ How the Game Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  1. CREATE   │────▶│   2. BET (AVAX)   │────▶│   3. RESOLVE    │
│  a market    │     │  YES or NO side   │     │  outcome locked │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  4. CLAIM        │
                                              │  winners paid    │
                                              └─────────────────┘
```

1. **Create** — Anyone creates a YES/NO question (e.g. *"Will AVAX hit $100 by March 2026?"*) with a deadline. This deploys a market on-chain.
2. **Bet** — Players connect MetaMask and send AVAX to the smart contract, choosing YES or NO. AI agents (APEX, ORACLE, GHOST, CHAOS) also place bets with their own strategies. As AVAX flows in, odds shift in real-time.
3. **Resolve** — When the deadline passes, the market creator resolves it. The outcome is locked on-chain — no one can tamper with it.
4. **Claim** — Winners claim their share: `(yourBet ÷ winningPool) × totalPool × 0.98`. The 2% fee stays in the contract. Losers get nothing.

**The twist:** You're not betting into a void — 4 AI agents with distinct personalities compete against you. APEX bets aggressively on trends, GHOST only bets when confident, CHAOS is a contrarian wildcard, and ORACLE plays the data. Beat them all and climb the leaderboard.

---

## ✨ Features of the app

### 🌐 Immersive 3D Arena
- **React Three Fiber** powered sci-fi arena with floating market orbs
- Particle field ambient effects and animated ring lights
- Interactive 3D AI agent avatars with distinct visual styles
- Smooth camera controls and responsive design

### 🤖 AI Agent Competitors
- **4 unique AI personalities** with different betting strategies
- Real-time agent activity and position tracking
- Compete against APEX, ORACLE, GHOST, and CHAOS

### ⛓️ On-Chain Betting
- All bets settled on **Avalanche C-Chain** smart contracts
- Transparent 2% platform fee
- Real-time odds calculation based on pool sizes
- Secure claim system for winners

### 🎨 Modern UI/UX
- Sleek dark theme with cyan accent colors
- **Framer Motion** animations throughout
- Responsive design for desktop and mobile
- Animated counters, transitions, and micro-interactions

### 📊 Dashboard & Stats
- Portfolio page to track your bets and claim winnings
- Leaderboard with top players vs AI agents
- Live market statistics (volume, players, active markets)

---

## 🏗️ Architecture

```
prediction-market-game/
├── contracts/                    # Solidity smart contracts
│   ├── PredictionMarket.sol      # Core betting & resolution logic
│   └── MarketFactory.sol         # Factory + player stats + leaderboard
├── ignition/
│   └── modules/
│       └── PredictionMarket.ts   # Hardhat Ignition deployment module
├── scripts/
│   └── deploy.ts                 # Legacy deploy script (alternative)
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home — 3D arena + hero + live markets
│   │   ├── markets/page.tsx      # Browse & filter all markets
│   │   ├── leaderboard/page.tsx  # Rankings with top-3 podium
│   │   ├── portfolio/page.tsx    # Your bets, stats, claim winnings
│   │   ├── create/page.tsx       # Create a new market (on-chain tx)
│   │   ├── providers.tsx         # WalletProvider + MarketLoader
│   │   ├── api/                  # API routes (markets, agents, leaderboard)
│   │   ├── layout.tsx            # Root layout + fonts + providers
│   │   └── globals.css           # Tailwind + custom utilities
│   ├── components/
│   │   ├── 3d/                   # React Three Fiber components
│   │   │   ├── ArenaScene.tsx    # Main Canvas with camera + fog
│   │   │   ├── MarketOrb.tsx     # Floating market spheres
│   │   │   ├── AIAgentAvatar.tsx # 3D AI agent characters
│   │   │   ├── ParticleField.tsx # 500-particle ambient effect
│   │   │   └── ArenaFloor.tsx    # Grid floor + ring lights
│   │   ├── ui/                   # React UI components
│   │   │   ├── Navbar.tsx        # Navigation with route animations
│   │   │   ├── WalletButton.tsx  # MetaMask connect/disconnect
│   │   │   ├── MarketCard.tsx    # Market display card
│   │   │   ├── BettingPanel.tsx  # Slide-in betting interface
│   │   │   └── AIAgentCard.tsx   # AI agent profile card
│   │   └── MarketLoader.tsx      # Auto-fetches markets from chain on mount
│   ├── contexts/
│   │   └── WalletContext.tsx     # Shared wallet + contract context
│   ├── hooks/
│   │   ├── useWallet.ts          # Wallet connection + chain switching
│   │   └── useContracts.ts       # Smart contract read/write methods
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
- **AVAX** on Fuji testnet ([faucet](https://faucet.avax.network/)) — only needed for Fuji deployment

### 1. Clone & Install

```bash
git clone https://github.com/ahmadaliyu/prediction-market-game.git
cd prediction-market-game
npm install
```

### 2. Compile Contracts

```bash
npx hardhat compile
```

This compiles both `PredictionMarket.sol` and `MarketFactory.sol` and generates TypeChain typings.

---

## 🔧 Deploying Smart Contracts

Contracts are deployed using [Hardhat Ignition](https://hardhat.org/ignition), the official declarative deployment system. The Ignition module is at `ignition/modules/PredictionMarket.ts`.

### Option A: Deploy to Local Hardhat Node (for development)

**Step 1 — Start a local blockchain node:**

```bash
npx hardhat node
```

This starts a local JSON-RPC server at `http://127.0.0.1:8545` with 20 pre-funded accounts (10,000 ETH each). Keep this terminal running.

**Step 2 — Deploy contracts (in a new terminal):**

```bash
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts --network localhost
```

You'll see output like:

```
Deployed Addresses

PredictionMarketModule#PredictionMarket - 0x5FbDB2315678afecb367f032d93F642f64180aa3
PredictionMarketModule#MarketFactory - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Step 3 — Create `.env.local`:**

```bash
cp .env.example .env.local
```

Paste the deployed addresses into `.env.local`:

```env
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

> In development (`npm run dev`), the app automatically connects to localhost (chainId 31337). In production builds, it uses Avalanche Fuji.

**Step 4 — Add the local network to MetaMask:**

| Field | Value |
|-------|-------|
| Network Name | Localhost 8545 |
| RPC URL | `http://127.0.0.1:8545` |
| Chain ID | `31337` |
| Currency Symbol | ETH |

**Step 5 — Import a test account into MetaMask:**

Use Hardhat Account #0 private key:

```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

This account has 10,000 ETH for testing.

> ⚠️ **Never send real funds to Hardhat test accounts.** Their private keys are publicly known.

### Option B: Deploy to Avalanche Fuji Testnet

**Step 1 — Get test AVAX from the [Avalanche Faucet](https://faucet.avax.network/).**

**Step 2 — Set your private key in `.env.local`:**

```env
PRIVATE_KEY=<your-deployer-wallet-private-key>
FUJI_RPC_URL=https://avalanche-fuji-c-chain-rpc.publicnode.com
```

**Step 3 — Deploy:**

```bash
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts --network fuji
```

**Step 4 — Copy the deployed addresses into `.env.local`:**

```env
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=<PredictionMarket address from output>
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=<MarketFactory address from output>
```

Ignition stores deployment artifacts in `ignition/deployments/chain-43113/`. Commit this folder to version your deployments.

### Option C: Simulated Deployment (no node needed)

To quickly verify the deployment definition works:

```bash
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts
```

This runs against an in-memory network and finishes instantly. Useful for CI/testing — no addresses are persisted.

---

## 🖥️ Running the App

After deploying contracts and setting `.env.local`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### How the frontend connects to contracts

The app is fully wired to the smart contracts:

1. **`WalletContext`** (`src/contexts/WalletContext.tsx`) — wraps the entire app, provides the connected wallet's `signer` and all contract methods to every page via React context.

2. **`useContracts`** (`src/hooks/useContracts.ts`) — all blockchain interactions:
   - `createMarket()` → calls `PredictionMarket.createMarket()` on-chain
   - `placeBet()` → sends AVAX to the contract with `placeBet(marketId, position)`
   - `claimWinnings()` → withdraws winnings from resolved markets
   - `getAllMarkets()` → reads all markets from the contract (works without wallet via read-only provider)
   - `getUserBets()` → reads a user's bet history from chain
   - `getMarket()` → fetches a single market's current state

3. **`MarketLoader`** (`src/components/MarketLoader.tsx`) — runs on app mount, fetches all markets from the contract and populates the Zustand store. Falls back to mock data if contracts aren't deployed.

4. **Pages** — each page calls real contract methods:
   - `/create` → `contracts.createMarket()` (sends a transaction)
   - Home & `/markets` → `contracts.placeBet()` via the BettingPanel
   - `/portfolio` → `contracts.getUserBets()` to show your positions + `contracts.claimWinnings()` button

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
| **3D Engine** | React Three Fiber, Drei |
| **Styling** | Tailwind CSS, Framer Motion |
| **State** | Zustand |
| **Blockchain** | Avalanche C-Chain, Solidity 0.8.24 |
| **Web3** | Ethers.js v6, MetaMask |
| **Contracts** | Hardhat, Hardhat Ignition, TypeChain |

---

## � Environment Configuration

This project uses **two separate environment files** to cleanly separate local development from production/testnet deployment:

### `.env.local` — Local Development (Hardhat)

Used when running `npm run dev` for local development with Hardhat.

```env
# Local Development Environment
# Used for: npm run dev with Hardhat node

# Deployment addresses (from Hardhat localhost deployment)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

# Hardhat deployment keys
FUJI_RPC_URL=https://avalanche-fuji-c-chain-rpc.publicnode.com
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# OpenAI API Key for AI features
OPENAI_API_KEY=
```

**When to use:** 
- Local development with `npx hardhat node` running
- Testing with Hardhat's pre-funded accounts
- Rapid iteration without spending real testnet AVAX

### `.env.production` — Production (Fuji Testnet)

Used for production builds and Vercel deployment.

```env
# Production Environment (Fuji Testnet)
# Used for: npm run build, Vercel deployment

# Deployment addresses (fill these after deploying to Fuji)
NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS=
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=

# OpenAI API Key for AI features
OPENAI_API_KEY=
```

**When to use:**
- Building for production (`npm run build`)
- Deploying to Vercel or other hosting platforms
- Testing with real Fuji testnet AVAX
- Sharing your app with others

### Switching Between Environments

**For local development:**
```bash
# 1. Start Hardhat node
npx hardhat node

# 2. Deploy contracts locally (in another terminal)
npm run deploy:local

# 3. Copy addresses to .env.local
# 4. Start Next.js dev server
npm run dev
```

**For production deployment:**
```bash
# 1. Deploy to Fuji testnet
npm run deploy:fuji

# 2. Copy addresses to .env.production
# 3. Build and test production build
npm run build && npm run start

# 4. Deploy to Vercel (it will use .env.production automatically)
```

> **Note:** Next.js automatically uses `.env.local` for `npm run dev` and `.env.production` for `npm run build`. You don't need to manually switch files!

---

## 📜 Available Scripts

```bash
# Frontend
npm run dev          # Start Next.js dev server (uses .env.local)
npm run build        # Production build (uses .env.production)
npm run start        # Start production server
npm run lint         # ESLint

# Smart Contracts
npx hardhat compile  # Compile Solidity contracts + generate TypeChain types
npx hardhat test     # Run contract tests
npx hardhat node     # Start local Hardhat JSON-RPC node (port 8545)

# Deployment (Hardhat Ignition)
npm run deploy:local           # Deploy to localhost + print addresses
npm run deploy:fuji            # Deploy to Fuji + print addresses
npm run print:deploy:local     # Print local deployment addresses
npm run print:deploy:fuji      # Print Fuji deployment addresses
npm run reset:deploy:local     # Clear local Ignition state
npm run reset:deploy:fuji      # Clear Fuji Ignition state (fixes reconciliation errors)

# Manual Deployment
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts --network localhost  # Local
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts --network fuji       # Fuji testnet
npx hardhat ignition deploy ignition/modules/PredictionMarket.ts                      # In-memory (dry run)
```

### Useful Script Combinations

**Fresh local development setup:**
```bash
npm run reset:deploy:local && npm run deploy:local
```

**Deploy to Fuji and verify addresses:**
```bash
npm run deploy:fuji
# Copy the printed addresses to .env.production
```

**Fix Ignition reconciliation errors:**
```bash
# If you see "Reconciliation detected differences" error
npm run reset:deploy:fuji && npm run deploy:fuji
```

---

## 🌐 Networks

| Network | Chain ID | RPC | Notes |
|---|---|---|---|
| Localhost (Hardhat) | 31337 | `http://127.0.0.1:8545` | Default for development |
| Avalanche Fuji (Testnet) | 43113 | `https://avalanche-fuji-c-chain-rpc.publicnode.com` | Get test AVAX from [faucet](https://faucet.avax.network/) |
| Avalanche Mainnet | 43114 | `https://api.avax.network/ext/bc/C/rpc` | Production |

---

## 🚀 Deploying to Vercel

After deploying your contracts to Fuji testnet, add these environment variables in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS` | Your deployed PredictionMarket address |
| `NEXT_PUBLIC_MARKET_FACTORY_ADDRESS` | Your deployed MarketFactory address |
| `OPENAI_API_KEY` | Your OpenAI API key |

> Chain config (RPC URLs, chain ID, explorer) is hardcoded in the source code — no env vars needed for those.

---

## 📄 License

MIT
