import { Network } from '@aptos-labs/ts-sdk';

// ─── Aptos Networks ────────────────────────────────────────────

export const APTOS_TESTNET = {
  network: Network.TESTNET,
  chainName: 'Aptos Testnet',
  rpcUrls: ['https://fullnode.testnet.aptoslabs.com/v1'],
  nativeCurrency: {
    name: 'Aptos',
    symbol: 'APT',
    decimals: 8,
  },
  blockExplorerUrls: ['https://explorer.aptoslabs.com/?network=testnet'],
};

export const APTOS_MAINNET = {
  network: Network.MAINNET,
  chainName: 'Aptos Mainnet',
  rpcUrls: ['https://fullnode.mainnet.aptoslabs.com/v1'],
  nativeCurrency: {
    name: 'Aptos',
    symbol: 'APT',
    decimals: 8,
  },
  blockExplorerUrls: ['https://explorer.aptoslabs.com/?network=mainnet'],
};

export const APTOS_LOCALNET = {
  network: Network.LOCAL,
  chainName: 'Aptos Localnet',
  rpcUrls: ['http://127.0.0.1:8080/v1'],
  nativeCurrency: {
    name: 'Aptos',
    symbol: 'APT',
    decimals: 8,
  },
  blockExplorerUrls: [''],
};

// Use testnet in production, localnet in development
export const ACTIVE_CHAIN = process.env.NODE_ENV === 'production' ? APTOS_TESTNET : APTOS_LOCALNET;

// ─── Shelby (decentralized storage protocol) ───────────────────
// Used to store market images/metadata off-chain instead of centralized hosting.
export const SHELBY = {
  network: 'shelbynet',
  rpcUrl: process.env.NEXT_PUBLIC_SHELBY_RPC_URL || 'https://api.shelby.xyz/shelby',
  apiKey: process.env.NEXT_PUBLIC_SHELBY_API_KEY || '',
};

export const CONTRACTS = {
  // Address the `prediction_market` Move module is published under.
  MODULE_ADDRESS: process.env.NEXT_PUBLIC_MODULE_ADDRESS || '',
  MODULE_NAME: 'market',
  // Resource-account address holding the MarketStore + coin vault (same as MODULE_ADDRESS
  // unless deployed via a separate resource account).
  STORE_ADDRESS: process.env.NEXT_PUBLIC_STORE_ADDRESS || process.env.NEXT_PUBLIC_MODULE_ADDRESS || '',
};

export const CATEGORIES = [
  { id: 'crypto', label: 'Crypto', emoji: '₿', color: '#F7931A' },
  { id: 'sports', label: 'Sports', emoji: '⚽', color: '#00FF88' },
  { id: 'politics', label: 'Politics', emoji: '🏛️', color: '#7B61FF' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬', color: '#FF00E5' },
  { id: 'technology', label: 'Technology', emoji: '🤖', color: '#00F0FF' },
  { id: 'science', label: 'Science', emoji: '🔬', color: '#FFD700' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', color: '#E84142' },
  { id: 'other', label: 'Other', emoji: '🌐', color: '#888888' },
] as const;

export const AI_AGENTS = [
  {
    name: 'APEX',
    personality: 'aggressive' as const,
    color: '#FF4444',
    description: 'High-risk, high-reward. APEX bets big on volatile markets.',
    avatar: '🔴',
    traits: ['Bold Bets', 'Trend Follower', 'High Volume'],
  },
  {
    name: 'ORACLE',
    personality: 'balanced' as const,
    color: '#00F0FF',
    description: 'Data-driven and methodical. ORACLE weighs all possibilities.',
    avatar: '🔵',
    traits: ['Analytical', 'Diversified', 'Steady Returns'],
  },
  {
    name: 'GHOST',
    personality: 'conservative' as const,
    color: '#7B61FF',
    description: 'Quiet and precise. GHOST only bets when confident.',
    avatar: '🟣',
    traits: ['Selective', 'Low Risk', 'High Win Rate'],
  },
  {
    name: 'CHAOS',
    personality: 'chaotic' as const,
    color: '#FF00E5',
    description: 'Unpredictable and wild. CHAOS keeps everyone guessing.',
    avatar: '🟡',
    traits: ['Random', 'Contrarian', 'Surprise Factor'],
  },
];

export const NAV_ITEMS = [
  { id: 'arena', label: 'Arena', icon: 'Gamepad2', href: '/' },
  { id: 'markets', label: 'Markets', icon: 'TrendingUp', href: '/markets' },
  { id: 'agents', label: 'AI Agents', icon: 'Bot', href: '/agents' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', href: '/leaderboard' },
  { id: 'portfolio', label: 'Portfolio', icon: 'Wallet', href: '/portfolio' },
  { id: 'create', label: 'Create', icon: 'PlusCircle', href: '/create' },
] as const;
