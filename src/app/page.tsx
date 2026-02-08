'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Sparkles, ChevronDown, TrendingUp, Users, Zap, ArrowRight } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import MarketCard from '@/components/ui/MarketCard';
import AIAgentCard from '@/components/ui/AIAgentCard';
import BettingPanel from '@/components/ui/BettingPanel';
import { useMarketStore, useAIAgentStore, useAppStore, useLeaderboardStore } from '@/store';
import { useWalletContext } from '@/contexts/WalletContext';
import { MarketDisplay } from '@/lib/types';

// Dynamic import for 3D scene (no SSR)
const ArenaScene = dynamic(() => import('@/components/3d/ArenaScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-arena-surface flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-arena-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400 text-sm">Loading 3D Arena...</p>
      </div>
    </div>
  ),
});

export default function HomePage() {
  const markets = useMarketStore((s) => s.filteredMarkets);
  const allMarkets = useMarketStore((s) => s.markets);
  const agents = useAIAgentStore((s) => s.agents);
  const players = useLeaderboardStore((s) => s.players);
  const selectedMarketId = useAppStore((s) => s.selectedMarketId);
  const showBettingPanel = useAppStore((s) => s.showBettingPanel);
  const selectMarket = useAppStore((s) => s.selectMarket);
  const show3DArena = useAppStore((s) => s.show3DArena);

  const totalVolume = useMemo(() => {
    return allMarkets.reduce((sum, m) => sum + parseFloat(m.totalPool || '0'), 0);
  }, [allMarkets]);

  const playerCount = useMemo(() => {
    return players.filter((p) => !p.isAI).length;
  }, [players]);

  const selectedMarket = markets.find((m: MarketDisplay) => m.id === selectedMarketId);
  const { contracts, isConnected } = useWalletContext();
  const updateMarket = useMarketStore((s) => s.updateMarket);

  const handlePlaceBet = async (position: boolean, amount: string) => {
    if (!isConnected) throw new Error('Connect your wallet first');
    if (selectedMarketId === null) throw new Error('No market selected');
    await contracts.placeBet(selectedMarketId, position, amount);
    // Refresh the market data from chain after betting
    const updated = await contracts.getMarket(selectedMarketId);
    if (updated) updateMarket(updated);
  };

  return (
    <main className="min-h-screen bg-arena-surface">
      <Navbar />

      {/* Hero Section with 3D Arena */}
      <section className="relative pt-16">
        {/* 3D Arena */}
        {show3DArena && (
          <div className="relative h-[600px]">
            <ArenaScene />

            {/* Hero overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-arena-gold" />
                  <span className="text-xs text-arena-gold font-medium tracking-widest uppercase">
                    Avalanche Gaming Ecosystem
                  </span>
                  <Sparkles className="w-5 h-5 text-arena-gold" />
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-4">
                  <span className="text-gradient">Prediction</span>{' '}
                  <span className="text-white">Arena</span>
                </h1>
                <p className="text-gray-400 text-lg max-w-xl mx-auto mb-6">
                  Compete against AI agents in immersive 3D markets. Bet with AVAX,
                  climb the leaderboard, prove your forecasting skills.
                </p>
                <div className="flex items-center justify-center gap-4 pointer-events-auto">
                  <a
                    href="#markets"
                    className="px-6 py-3 bg-gradient-to-r from-arena-primary to-arena-secondary text-black 
                             font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,240,255,0.4)] 
                             transition-all duration-300 flex items-center gap-2"
                  >
                    Start Predicting <ArrowRight className="w-4 h-4" />
                  </a>
                  <a
                    href="#agents"
                    className="px-6 py-3 border border-arena-border text-white font-medium rounded-xl 
                             hover:border-arena-primary/50 transition-all duration-300"
                  >
                    Meet AI Agents
                  </a>
                </div>
              </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
              <ChevronDown className="w-6 h-6 text-gray-500" />
            </motion.div>
          </div>
        )}

        {/* Stats Bar */}
        <div className="bg-arena-card/50 backdrop-blur-sm border-y border-arena-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-arena-primary" />
                  <span className="text-xs text-gray-400">Total Volume</span>
                </div>
                <span className="text-xl font-bold text-white">{totalVolume.toFixed(1)} AVAX</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-arena-gold" />
                  <span className="text-xs text-gray-400">Active Markets</span>
                </div>
                <span className="text-xl font-bold text-white">{allMarkets.length}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-arena-green" />
                  <span className="text-xs text-gray-400">Players</span>
                </div>
                <span className="text-xl font-bold text-white">{playerCount}</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-arena-secondary" />
                  <span className="text-xs text-gray-400">AI Agents</span>
                </div>
                <span className="text-xl font-bold text-white">{agents.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Section */}
      <section id="agents" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">AI Competitors</h2>
            <p className="text-sm text-gray-400">Autonomous agents making predictions in the arena</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent, i) => (
            <AIAgentCard key={agent.name} agent={agent} index={i} />
          ))}
        </div>
      </section>

      {/* Markets Section */}
      <section id="markets" className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Live Markets</h2>
            <p className="text-sm text-gray-400">
              Click any market to place your prediction
            </p>
          </div>
          <a
            href="/markets"
            className="text-sm text-arena-primary hover:text-arena-primary/80 transition-colors flex items-center gap-1"
          >
            View All <ArrowRight className="w-3 h-3" />
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.length > 0 ? (
            markets.slice(0, 6).map((market: MarketDisplay, i: number) => (
              <MarketCard
                key={market.id}
                market={market}
                index={i}
                onClick={() => selectMarket(market.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <Zap className="w-10 h-10 text-gray-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white mb-1">No markets yet</h3>
              <p className="text-gray-400 text-sm mb-4">Be the first to create a prediction market.</p>
              <a
                href="/create"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-arena-primary to-arena-secondary text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                Create Market <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Betting Panel */}
      {showBettingPanel && selectedMarket && (
        <BettingPanel market={selectedMarket} onPlaceBet={handlePlaceBet} />
      )}

      {/* Footer */}
      <footer className="border-t border-arena-border bg-arena-surface">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-arena-primary to-arena-secondary flex items-center justify-center">
                <span className="text-sm font-bold text-black">P</span>
              </div>
              <span className="text-sm text-gray-400">
                Prediction Arena — Built on Avalanche
              </span>
            </div>
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span>Fuji Testnet</span>
              <span>•</span>
              <a href="https://github.com/ahmadaliyu/prediction-market-game" target="_blank" rel="noopener noreferrer" className="hover:text-arena-primary transition-colors">
                GitHub
              </a>
              <span>•</span>
              <span>© 2026 Prediction Arena</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
