import { create } from 'zustand';
import { MarketDisplay, AIAgentDisplay, PlayerStatsDisplay } from '@/lib/types';
import { MOCK_MARKETS, AI_AGENTS } from '@/lib/constants';

interface AppStore {
  isLoading: boolean;
  activeView: 'arena' | 'markets' | 'leaderboard' | 'portfolio';
  selectedMarketId: number | null;
  showBettingPanel: boolean;
  show3DArena: boolean;
  setLoading: (loading: boolean) => void;
  setActiveView: (view: AppStore['activeView']) => void;
  selectMarket: (id: number | null) => void;
  toggleBettingPanel: (show?: boolean) => void;
  toggle3DArena: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  activeView: 'arena',
  selectedMarketId: null,
  showBettingPanel: false,
  show3DArena: true,
  setLoading: (loading) => set({ isLoading: loading }),
  setActiveView: (view) => set({ activeView: view }),
  selectMarket: (id) => set({ selectedMarketId: id, showBettingPanel: id !== null }),
  toggleBettingPanel: (show) =>
    set((state) => ({ showBettingPanel: show ?? !state.showBettingPanel })),
  toggle3DArena: () => set((state) => ({ show3DArena: !state.show3DArena })),
}));

interface MarketStore {
  markets: MarketDisplay[];
  filteredMarkets: MarketDisplay[];
  selectedCategory: string;
  searchQuery: string;
  sortBy: 'newest' | 'volume' | 'ending';
  setMarkets: (markets: MarketDisplay[]) => void;
  setCategory: (category: string) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: MarketStore['sortBy']) => void;
  filterAndSort: () => void;
  addMarket: (market: MarketDisplay) => void;
  updateMarket: (market: MarketDisplay) => void;
}

export const useMarketStore = create<MarketStore>((set, get) => ({
  markets: MOCK_MARKETS as unknown as MarketDisplay[],
  filteredMarkets: MOCK_MARKETS as unknown as MarketDisplay[],
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',

  setMarkets: (markets) => {
    set({ markets });
    get().filterAndSort();
  },

  setCategory: (category) => {
    set({ selectedCategory: category });
    get().filterAndSort();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterAndSort();
  },

  setSortBy: (sort) => {
    set({ sortBy: sort });
    get().filterAndSort();
  },

  filterAndSort: () => {
    const { markets, selectedCategory, searchQuery, sortBy } = get();

    let filtered = [...markets];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((m) => m.category === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((m) => m.question.toLowerCase().includes(q));
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'volume':
        filtered.sort((a, b) => parseFloat(b.totalPool) - parseFloat(a.totalPool));
        break;
      case 'ending':
        filtered.sort((a, b) => a.endTime - b.endTime);
        break;
    }

    set({ filteredMarkets: filtered });
  },

  addMarket: (market) => {
    set((state) => ({ markets: [market, ...state.markets] }));
    get().filterAndSort();
  },

  updateMarket: (market) => {
    set((state) => ({
      markets: state.markets.map((m) => (m.id === market.id ? market : m)),
    }));
    get().filterAndSort();
  },
}));

interface AIAgentStore {
  agents: AIAgentDisplay[];
  selectedAgent: AIAgentDisplay | null;
  selectAgent: (agent: AIAgentDisplay | null) => void;
  updateAgent: (agent: AIAgentDisplay) => void;
}

const initialAgents: AIAgentDisplay[] = AI_AGENTS.map((a, i) => ({
  name: a.name,
  personality: a.personality,
  avatarURI: a.avatar,
  agentAddress: `0x${(i + 1).toString(16).padStart(40, '0')}`,
  isActive: true,
  totalPredictions: Math.floor(Math.random() * 100) + 20,
  correctPredictions: Math.floor(Math.random() * 60) + 10,
  accuracy: 0,
  color: a.color,
  description: a.description,
  currentBet: {
    marketId: Math.floor(Math.random() * 6),
    position: Math.random() > 0.5 ? 'YES' as const : 'NO' as const,
    confidence: Math.floor(Math.random() * 40) + 60,
  },
})).map((a) => ({
  ...a,
  accuracy: a.totalPredictions > 0
    ? Math.round((a.correctPredictions / a.totalPredictions) * 100)
    : 0,
}));

export const useAIAgentStore = create<AIAgentStore>((set) => ({
  agents: initialAgents,
  selectedAgent: null,
  selectAgent: (agent) => set({ selectedAgent: agent }),
  updateAgent: (agent) =>
    set((state) => ({
      agents: state.agents.map((a) => (a.name === agent.name ? agent : a)),
    })),
}));

interface LeaderboardStore {
  players: PlayerStatsDisplay[];
  setPlayers: (players: PlayerStatsDisplay[]) => void;
}

const mockPlayers: PlayerStatsDisplay[] = [
  {
    address: '0xDEAD...BEEF',
    name: 'CryptoKing',
    isAI: false,
    totalBets: 47,
    totalWins: 32,
    totalAmountBet: '156.80',
    totalWinnings: '289.50',
    currentStreak: 5,
    bestStreak: 8,
    gamesPlayed: 47,
    winRate: 68.1,
    rank: 1,
    pnl: '+132.70',
  },
  {
    address: '0xA1B2...APEX',
    name: 'APEX',
    isAI: true,
    totalBets: 38,
    totalWins: 25,
    totalAmountBet: '98.40',
    totalWinnings: '167.20',
    currentStreak: 3,
    bestStreak: 6,
    gamesPlayed: 38,
    winRate: 65.8,
    rank: 2,
    pnl: '+68.80',
  },
  {
    address: '0x1234...5678',
    name: 'AvalancheWhale',
    isAI: false,
    totalBets: 52,
    totalWins: 29,
    totalAmountBet: '210.00',
    totalWinnings: '265.30',
    currentStreak: 1,
    bestStreak: 7,
    gamesPlayed: 52,
    winRate: 55.8,
    rank: 3,
    pnl: '+55.30',
  },
  {
    address: '0xC3D4...ORCL',
    name: 'ORACLE',
    isAI: true,
    totalBets: 25,
    totalWins: 14,
    totalAmountBet: '75.00',
    totalWinnings: '102.10',
    currentStreak: 0,
    bestStreak: 4,
    gamesPlayed: 25,
    winRate: 56.0,
    rank: 4,
    pnl: '+27.10',
  },
  {
    address: '0x9876...5432',
    name: 'DeFiDegen',
    isAI: false,
    totalBets: 61,
    totalWins: 30,
    totalAmountBet: '320.00',
    totalWinnings: '298.40',
    currentStreak: 0,
    bestStreak: 5,
    gamesPlayed: 61,
    winRate: 49.2,
    rank: 5,
    pnl: '-21.60',
  },
];

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  players: mockPlayers,
  setPlayers: (players) => set({ players }),
}));
