# 🎮 Prediction Arena

> **A 3D prediction market game built on Aptos** — bet against AI agents in an immersive sci-fi arena.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![Move](https://img.shields.io/badge/Move-Aptos-1E90FF)
![Aptos](https://img.shields.io/badge/Aptos-Testnet-00D2B9)
![Three.js](https://img.shields.io/badge/Three.js-R3F-black?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## 🖼️ Screenshots

| Home Arena | Markets | Leaderboard |
|------------|---------|-------------|
| 3D arena with floating market orbs | Browse & filter active markets | Player rankings vs AI agents |

---

## 🕹️ How the Game Works

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  1. CREATE   │────▶│   2. BET (APT)    │────▶│   3. RESOLVE    │
│  a market    │     │  pick an outcome  │     │  outcome locked │
└─────────────┘     └──────────────────┘     └────────┬────────┘
                                                       │
                                                       ▼
                                              ┌─────────────────┐
                                              │  4. CLAIM        │
                                              │  winners paid    │
                                              └─────────────────┘
```

1. **Create** — Anyone creates a multi-outcome question (e.g. *"Will APT hit $20 by March 2026?"*) with a deadline. This publishes a market entry in the on-chain `MarketStore`.
2. **Bet** — Players connect an Aptos wallet (Petra, etc.) and send APT to the Move module, choosing an outcome. AI agents (APEX, ORACLE, GHOST, CHAOS) also place bets with their own strategies. As APT flows in, odds shift in real-time.
3. **Resolve** — When the deadline passes, the market creator (or an AI oracle) resolves it. The outcome is locked on-chain — no one can tamper with it.
4. **Claim** — Winners claim their share: `(yourBet ÷ winningPool) × distributablePool`, where the distributable pool excludes a 1.2% creator fee + 0.8% platform fee. Losers get nothing.

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

### ⛓️ On-Chain Betting (Aptos + Move)
- All bets settled by a **Move module** on Aptos, custodying funds in a resource-account vault
- Transparent 1.2% creator fee + 0.8% platform fee
- Real-time odds calculation based on outcome pool sizes
- Secure claim system for winners

### 🗄️ Shelby Storage
- Market images/metadata can be stored on **Shelby** (`shelbynet`, `https://api.shelby.xyz/shelby`) instead of centralized hosting

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
├── move/                         # Aptos Move package
│   ├── Move.toml
│   └── sources/
│       └── prediction_market.move  # Core betting & resolution logic (module `market`)
├── src/
│   ├── app/                      # Next.js App Router pages
│   │   ├── page.tsx              # Home — 3D arena + hero + live markets
│   │   ├── markets/page.tsx      # Browse & filter all markets
│   │   ├── leaderboard/page.tsx  # Rankings with top-3 podium
│   │   ├── portfolio/page.tsx    # Your bets, stats, claim winnings
│   │   ├── create/page.tsx       # Create a new market (on-chain tx)
│   │   ├── providers.tsx         # AptosWalletAdapterProvider + WalletProvider + MarketLoader
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
│   │   │   ├── WalletButton.tsx  # Aptos wallet connect/disconnect
│   │   │   ├── MarketCard.tsx    # Market display card
│   │   │   ├── BettingPanel.tsx  # Slide-in betting interface
│   │   │   └── AIAgentCard.tsx   # AI agent profile card
│   │   └── MarketLoader.tsx      # Auto-fetches markets from chain on mount
│   ├── contexts/
│   │   └── WalletContext.tsx     # Shared wallet + contract context
│   ├── hooks/
│   │   ├── useWallet.ts          # Aptos wallet connection (wallet-adapter-react)
│   │   └── useContracts.ts       # Move module read/write methods (Aptos SDK)
│   ├── store/
│   │   └── index.ts              # Zustand stores (app, markets, agents, leaderboard)
│   ├── lib/
│   │   ├── types.ts              # TypeScript interfaces
│   │   ├── constants.ts          # Aptos network configs, Shelby config, categories
│   │   ├── utils.ts              # Formatting, calculations, helpers
│   │   └── abis.ts               # Move entry/view function references
│   └── global.d.ts               # R3F JSX type declarations
├── tailwind.config.js
├── next.config.js
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18
- **Aptos CLI** (`aptos`) for compiling/publishing the Move module
- **Petra Wallet** (or another Aptos wallet) browser extension
- **APT** on Aptos testnet ([faucet](https://aptos.dev/en/network/faucet)) — only needed for testnet deployment

### 1. Clone & Install

```bash
git clone https://github.com/ahmadaliyu/prediction-market-game.git
cd prediction-market-game
npm install
```

### 2. Compile the Move module

```bash
npm run move:compile
```

This compiles `move/sources/prediction_market.move` using the Aptos CLI.

---

## 🔧 Deploying the Move Module

### Option A: Local Aptos node (for development)

**Step 1 — Start a local Aptos node:**

```bash
aptos node run-local-testnet --with-faucet
```

**Step 2 — Configure a CLI profile and publish:**

```bash
aptos init --profile local --network local
npm run move:publish:local
```

**Step 3 — Initialize the on-chain store (one-time, from the deployer account):**

```bash
aptos move run --profile local \
  --function-id <deployer_address>::market::init \
  --args hex:00
```

**Step 4 — Create `.env.local`:**

```env
NEXT_PUBLIC_MODULE_ADDRESS=<deployer_address>
NEXT_PUBLIC_STORE_ADDRESS=<deployer_address>
OPENAI_API_KEY=
```

> In development (`npm run dev`), the app connects to a local Aptos node (`http://127.0.0.1:8080/v1`). In production builds, it uses Aptos Testnet.

### Option B: Deploy to Aptos Testnet

**Step 1 — Get test APT from the [Aptos faucet](https://aptos.dev/en/network/faucet).**

**Step 2 — Configure a testnet profile:**

```bash
aptos init --profile testnet --network testnet
npm run move:publish:testnet
```

**Step 3 — Initialize the store and copy the address into `.env.production`:**

```env
NEXT_PUBLIC_MODULE_ADDRESS=<deployer_address>
NEXT_PUBLIC_STORE_ADDRESS=<deployer_address>
```

---

## 🖥️ Running the App

After publishing the Move module and setting `.env.local`:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### How the frontend connects to the Move module

1. **`WalletContext`** (`src/contexts/WalletContext.tsx`) — wraps the entire app (inside `AptosWalletAdapterProvider`), provides the connected wallet's `signAndSubmitTransaction` and all contract methods to every page via React context.

2. **`useContracts`** (`src/hooks/useContracts.ts`) — all blockchain interactions:
   - `createMarket()` → calls `market::create_market` entry function
   - `placeBet()` → sends APT to the module vault via `market::place_bet`
   - `claimWinnings()` → withdraws winnings from resolved markets via `market::claim_winnings`
   - `getAllMarkets()` → reads all markets via the `market::get_market` / `market::market_count` view functions (works without a wallet)
   - `getMarket()` → fetches a single market's current state

3. **`MarketLoader`** (`src/components/MarketLoader.tsx`) — runs on app mount, fetches all markets from the module and populates the Zustand store. Falls back to mock data if the module isn't published yet.

4. **Pages** — each page calls real contract methods:
   - `/create` → `contracts.createMarket()` (submits a transaction)
   - Home & `/markets` → `contracts.placeBet()` via the BettingPanel
   - `/portfolio` → `contracts.getUserBets()` to show your positions + `contracts.claimWinnings()` button

---

## 🎯 Move Module (`prediction_market.move`, module `market`)

| Function | Description |
|---|---|
| `create_market(...)` | Create a multi-outcome prediction market |
| `place_bet(...)` | Bet APT on an outcome index |
| `resolve_market(...)` | Creator (manual) or owner (AI oracle) resolves the market |
| `claim_winnings(...)` | Winners claim proportional payout |
| `get_market(...)` (view) | Read current market state and outcome pools |
| `market_count(...)` (view) | Total number of markets |

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
| **Blockchain** | Aptos, Move |
| **Web3** | `@aptos-labs/ts-sdk`, `@aptos-labs/wallet-adapter-react`, Petra Wallet |
| **Storage** | Shelby (`shelbynet`) for market images/metadata |
| **Contracts** | Aptos CLI (Move compiler/publisher) |

---

## 🔐 Environment Configuration

This project uses **two separate environment files** to cleanly separate local development from production/testnet deployment:

### `.env.local` — Local Development

Used when running `npm run dev` against a local Aptos node.

```env
# Local Development Environment
# Used for: npm run dev with a local Aptos node

# Move module + resource-account store addresses (from local publish + init)
NEXT_PUBLIC_MODULE_ADDRESS=
NEXT_PUBLIC_STORE_ADDRESS=

# Shelby decentralized storage (defaults shown)
NEXT_PUBLIC_SHELBY_RPC_URL=https://api.shelby.xyz/shelby
NEXT_PUBLIC_SHELBY_API_KEY=

# OpenAI API Key for AI features
OPENAI_API_KEY=
```

**When to use:**
- Local development with `aptos node run-local-testnet` running
- Rapid iteration without spending real testnet APT

### `.env.production` — Production (Aptos Testnet)

Used for production builds and Vercel deployment.

```env
# Production Environment (Aptos Testnet)
# Used for: npm run build, Vercel deployment

# Move module + resource-account store addresses (fill after publishing to testnet)
NEXT_PUBLIC_MODULE_ADDRESS=
NEXT_PUBLIC_STORE_ADDRESS=

# Shelby decentralized storage
NEXT_PUBLIC_SHELBY_RPC_URL=https://api.shelby.xyz/shelby
NEXT_PUBLIC_SHELBY_API_KEY=

# OpenAI API Key for AI features
OPENAI_API_KEY=
```

**When to use:**
- Building for production (`npm run build`)
- Deploying to Vercel or other hosting platforms
- Testing with real Aptos testnet APT
- Sharing your app with others

> **Note:** Next.js automatically uses `.env.local` for `npm run dev` and `.env.production` for `npm run build`. You don't need to manually switch files!

---

## 📜 Available Scripts

```bash
# Frontend
npm run dev          # Start Next.js dev server (uses .env.local)
npm run build        # Production build (uses .env.production)
npm run start        # Start production server
npm run lint         # ESLint

# Move module
npm run move:compile          # Compile the Move package
npm run move:publish:local    # Publish to a local Aptos node (profile: local)
npm run move:publish:testnet  # Publish to Aptos testnet (profile: testnet)
```

---

## 🌐 Networks

| Network | RPC | Notes |
|---|---|---|
| Aptos Localnet | `http://127.0.0.1:8080/v1` | Default for development |
| Aptos Testnet | `https://fullnode.testnet.aptoslabs.com/v1` | Get test APT from [faucet](https://aptos.dev/en/network/faucet) |
| Aptos Mainnet | `https://fullnode.mainnet.aptoslabs.com/v1` | Production |
| Shelby (`shelbynet`) | `https://api.shelby.xyz/shelby` | Decentralized storage for images/metadata |

---

## 🚀 Deploying to Vercel

After publishing your Move module to Aptos testnet, add these environment variables in Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_MODULE_ADDRESS` | Your published module's address |
| `NEXT_PUBLIC_STORE_ADDRESS` | Your `MarketStore` resource-account address |
| `NEXT_PUBLIC_SHELBY_RPC_URL` | Shelby RPC endpoint (defaults to `https://api.shelby.xyz/shelby`) |
| `OPENAI_API_KEY` | Your OpenAI API key |

> Chain config (RPC URLs, explorer) is hardcoded in the source code — no env vars needed for those.

---

## 📄 License

MIT
