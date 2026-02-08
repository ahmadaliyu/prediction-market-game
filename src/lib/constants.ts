// ═══════════════════════════════════════════════════════════════
//                    CHAIN CONFIGURATION
// ═══════════════════════════════════════════════════════════════

export const AVALANCHE_FUJI = {
  chainId: 43113,
  chainIdHex: '0xA869',
  chainName: 'Avalanche Fuji Testnet',
  rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorerUrls: ['https://testnet.snowtrace.io/'],
};

export const AVALANCHE_MAINNET = {
  chainId: 43114,
  chainIdHex: '0xA86A',
  chainName: 'Avalanche C-Chain',
  rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
  nativeCurrency: {
    name: 'AVAX',
    symbol: 'AVAX',
    decimals: 18,
  },
  blockExplorerUrls: ['https://snowtrace.io/'],
};

// Use Fuji testnet by default
export const ACTIVE_CHAIN = AVALANCHE_FUJI;

// ═══════════════════════════════════════════════════════════════
//                    CONTRACT ADDRESSES
// ═══════════════════════════════════════════════════════════════

export const CONTRACTS = {
  PREDICTION_MARKET: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '',
  MARKET_FACTORY: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '',
};

// ═══════════════════════════════════════════════════════════════
//                    MARKET CATEGORIES
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
//                    AI AGENTS CONFIG
// ═══════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════
//                    UI CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const NAV_ITEMS = [
  { id: 'arena', label: 'Arena', icon: 'Gamepad2', href: '/' },
  { id: 'markets', label: 'Markets', icon: 'TrendingUp', href: '/markets' },
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', href: '/leaderboard' },
  { id: 'portfolio', label: 'Portfolio', icon: 'Wallet', href: '/portfolio' },
  { id: 'create', label: 'Create', icon: 'PlusCircle', href: '/create' },
] as const;

// ═══════════════════════════════════════════════════════════════
//                    MOCK MARKETS (for dev)
// ═══════════════════════════════════════════════════════════════

export const MOCK_MARKETS = [
  {
    id: 0,
    question: 'Will AVAX reach $100 by March 2026?',
    imageURI: '',
    category: 'crypto' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
    totalYesAmount: '15.5',
    totalNoAmount: '8.2',
    totalPool: '23.7',
    yesPercent: 65,
    noPercent: 35,
    resolved: false,
    outcome: false,
    creator: '0x1234...5678',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 2,
    timeRemaining: '29d 12h',
    isExpired: false,
    status: 'active' as const,
  },
  {
    id: 1,
    question: 'Will Bitcoin ETF daily volume exceed $10B this week?',
    imageURI: '',
    category: 'crypto' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 7,
    totalYesAmount: '42.0',
    totalNoAmount: '18.5',
    totalPool: '60.5',
    yesPercent: 69,
    noPercent: 31,
    resolved: false,
    outcome: false,
    creator: '0xABCD...EF01',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    timeRemaining: '6d 18h',
    isExpired: false,
    status: 'active' as const,
  },
  {
    id: 2,
    question: 'Will the next Avalanche subnet launch exceed 1M transactions in week 1?',
    imageURI: '',
    category: 'technology' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 14,
    totalYesAmount: '5.8',
    totalNoAmount: '12.3',
    totalPool: '18.1',
    yesPercent: 32,
    noPercent: 68,
    resolved: false,
    outcome: false,
    creator: '0x9876...5432',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 3,
    timeRemaining: '13d 6h',
    isExpired: false,
    status: 'active' as const,
  },
  {
    id: 3,
    question: 'Will AI beat the world chess champion in a 10-game match?',
    imageURI: '',
    category: 'gaming' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 21,
    totalYesAmount: '88.0',
    totalNoAmount: '12.0',
    totalPool: '100.0',
    yesPercent: 88,
    noPercent: 12,
    resolved: false,
    outcome: false,
    creator: '0xDEAD...BEEF',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 5,
    timeRemaining: '20d 3h',
    isExpired: false,
    status: 'active' as const,
  },
  {
    id: 4,
    question: 'Will Ethereum gas fees stay below 10 gwei for a full week?',
    imageURI: '',
    category: 'crypto' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 10,
    totalYesAmount: '22.4',
    totalNoAmount: '33.6',
    totalPool: '56.0',
    yesPercent: 40,
    noPercent: 60,
    resolved: false,
    outcome: false,
    creator: '0xFACE...CAFE',
    createdAt: Math.floor(Date.now() / 1000) - 86400 * 4,
    timeRemaining: '9d 15h',
    isExpired: false,
    status: 'active' as const,
  },
  {
    id: 5,
    question: 'Will SpaceX successfully land Starship by end of February?',
    imageURI: '',
    category: 'science' as const,
    endTime: Math.floor(Date.now() / 1000) + 86400 * 20,
    totalYesAmount: '75.0',
    totalNoAmount: '25.0',
    totalPool: '100.0',
    yesPercent: 75,
    noPercent: 25,
    resolved: false,
    outcome: false,
    creator: '0x0000...0001',
    createdAt: Math.floor(Date.now() / 1000) - 86400,
    timeRemaining: '19d 8h',
    isExpired: false,
    status: 'active' as const,
  },
];
