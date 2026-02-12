
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

export const LOCALHOST = {
  chainId: 31337,
  chainIdHex: '0x7A69',
  chainName: 'Localhost 8545',
  rpcUrls: ['http://127.0.0.1:8545'],
  nativeCurrency: {
    name: 'ETH',
    symbol: 'ETH',
    decimals: 18,
  },
  blockExplorerUrls: [''],
};

// Use localhost for development, Fuji for testnet
export const ACTIVE_CHAIN = process.env.NEXT_PUBLIC_CHAIN_ID === '43113' ? AVALANCHE_FUJI : LOCALHOST;

export const CONTRACTS = {
  PREDICTION_MARKET: process.env.NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS || '',
  MARKET_FACTORY: process.env.NEXT_PUBLIC_MARKET_FACTORY_ADDRESS || '',
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
  { id: 'leaderboard', label: 'Leaderboard', icon: 'Trophy', href: '/leaderboard' },
  { id: 'portfolio', label: 'Portfolio', icon: 'Wallet', href: '/portfolio' },
  { id: 'create', label: 'Create', icon: 'PlusCircle', href: '/create' },
] as const;
