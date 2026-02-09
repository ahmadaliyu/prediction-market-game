import { create } from 'zustand';
import { MarketDisplay, AIAgentDisplay, PlayerStatsDisplay } from '@/lib/types';
import { AI_AGENTS } from '@/lib/constants';

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
  markets: [],
  filteredMarkets: [],
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
  totalPredictions: 0,
  correctPredictions: 0,
  accuracy: 0,
  color: a.color,
  description: a.description,
  currentBet: undefined,
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

export const useLeaderboardStore = create<LeaderboardStore>((set) => ({
  players: [],
  setPlayers: (players) => set({ players }),
}));

// ─── Theme Store ─────────────────────────────────────────────

interface ThemeStore {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  initTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDarkMode: true, // Default to dark mode
  toggleDarkMode: () => {
    const newValue = !get().isDarkMode;
    set({ isDarkMode: newValue });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
    }
  },
  setDarkMode: (isDark) => {
    set({ isDarkMode: isDark });
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  },
  initTheme: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        set({ isDarkMode: saved === 'dark' });
      } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        set({ isDarkMode: prefersDark });
      }
    }
  },
}));
