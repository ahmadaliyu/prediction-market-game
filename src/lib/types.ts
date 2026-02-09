export interface MarketRaw {
  id: bigint;
  question: string;
  rules: string;
  imageURI: string;
  category: string;
  outcomeLabels: string[];
  outcomePools: bigint[];
  outcomeCount: bigint;
  endTime: bigint;
  startTime: bigint;
  totalPool: bigint;
  resolved: boolean;
  winningOutcome: bigint;
  creator: string;
  createdAt: bigint;
  isPrivate: boolean;
  resolutionType: number;
}

export interface OutcomeDisplay {
  label: string;
  pool: string;
  percent: number;
  index: number;
}

export interface MarketDisplay {
  id: number;
  question: string;
  rules: string;
  imageURI: string;
  category: MarketCategory;
  outcomes: OutcomeDisplay[];
  outcomeCount: number;
  endTime: number;
  startTime: number;
  totalPool: string;
  resolved: boolean;
  winningOutcome: number;
  creator: string;
  createdAt: number;
  isPrivate: boolean;
  resolutionType: number;
  timeRemaining: string;
  isExpired: boolean;
  isStarted: boolean;
  status: MarketStatus;
  bettorCount: number;
}

export type MarketCategory =
  | 'crypto'
  | 'sports'
  | 'politics'
  | 'entertainment'
  | 'technology'
  | 'science'
  | 'gaming'
  | 'other';

export type MarketStatus = 'upcoming' | 'active' | 'expired' | 'resolved';

export interface Bet {
  amount: bigint;
  outcomeIndex: number;
  claimed: boolean;
}

export interface BetDisplay {
  marketId: number;
  amount: string;
  outcomeLabel: string;
  outcomeIndex: number;
  claimed: boolean;
  market?: MarketDisplay;
  potentialPayout?: string;
}

export interface PlayerStats {
  totalBets: number;
  totalWins: number;
  totalAmountBet: bigint;
  totalWinnings: bigint;
  currentStreak: number;
  bestStreak: number;
  gamesPlayed: number;
}

export interface PlayerStatsDisplay {
  address: string;
  name: string;
  isAI: boolean;
  totalBets: number;
  totalWins: number;
  totalAmountBet: string;
  totalWinnings: string;
  currentStreak: number;
  bestStreak: number;
  gamesPlayed: number;
  winRate: number;
  rank?: number;
  pnl: string;
}

export type AIPersonality = 'aggressive' | 'conservative' | 'balanced' | 'chaotic';

export interface AIAgent {
  name: string;
  personality: AIPersonality;
  avatarURI: string;
  agentAddress: string;
  isActive: boolean;
  totalPredictions: number;
  correctPredictions: number;
}

export interface AIAgentDisplay extends AIAgent {
  accuracy: number;
  color: string;
  description: string;
  currentBet?: {
    marketId: number;
    outcomeIndex: number;
    confidence: number;
  };
}

export interface MarketOrb {
  id: number;
  position: [number, number, number];
  color: string;
  size: number;
  intensity: number;
  market: MarketDisplay;
}

export interface AgentAvatar {
  id: string;
  position: [number, number, number];
  agent: AIAgentDisplay;
  animationState: 'idle' | 'thinking' | 'betting' | 'celebrating';
}

export interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  isCorrectChain: boolean;
}

export interface AppState {
  isLoading: boolean;
  error: string | null;
  activeView: 'arena' | 'markets' | 'leaderboard' | 'portfolio';
  selectedMarketId: number | null;
  showBettingPanel: boolean;
}

export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CreateMarketParams {
  question: string;
  rules: string;
  imageURI?: string;
  category: MarketCategory;
  outcomes: string[];
  startTime: number;
  endTime: number;
  isPrivate: boolean;
  accessCode: string;
  resolutionType: number;
  initialLiquidity: string;
}
