
export interface Market {
  id: number;
  question: string;
  imageURI: string;
  category: MarketCategory;
  endTime: number;
  totalYesAmount: bigint;
  totalNoAmount: bigint;
  resolved: boolean;
  outcome: boolean;
  creator: string;
  createdAt: number;
}

export interface MarketDisplay extends Omit<Market, 'totalYesAmount' | 'totalNoAmount'> {
  totalYesAmount: string;
  totalNoAmount: string;
  totalPool: string;
  yesPercent: number;
  noPercent: number;
  timeRemaining: string;
  isExpired: boolean;
  status: MarketStatus;
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

export type MarketStatus = 'active' | 'expired' | 'resolved';

export interface Bet {
  amount: bigint;
  position: boolean; // true = YES, false = NO
  claimed: boolean;
}

export interface BetDisplay {
  marketId: number;
  amount: string;
  position: 'YES' | 'NO';
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
    position: 'YES' | 'NO';
    confidence: number;
  };
}

//                    3D SCENE TYPES

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
  imageURI?: string;
  category: MarketCategory;
  endTime: number;
}

export interface PlaceBetParams {
  marketId: number;
  position: boolean;
  amount: string;
}
