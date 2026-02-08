'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { TrendingUp, Users, Zap, Bot, ArrowRight, BarChart3, Sparkles } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import MarketCard from '@/components/ui/MarketCard';
import AIAgentCard from '@/components/ui/AIAgentCard';
import BettingPanel from '@/components/ui/BettingPanel';
import { useMarketStore, useAppStore } from '@/store';
import { useWalletContext } from '@/contexts/WalletContext';
import { AI_AGENTS } from '@/lib/constants';
import { AIAgentDisplay, MarketDisplay } from '@/lib/types';
import Link from 'next/link';

const ArenaScene = dynamic(() => import('@/components/3d/ArenaScene'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-arena-dark flex items-center justify-center">
      <motion.div
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-arena-primary text-lg"
      >
        Loading Arena...
      </motion.div>
    </div>
  ),
});

// Animated counter component
function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    const target = parseFloat(value);
    if (isNaN(target)) { setDisplay(value); return; }
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = eased * target;
      setDisplay(Number.isInteger(target) ? Math.floor(current).toString() : current.toFixed(2));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [isInView, value]);

  return <div ref={ref}>{display}{suffix}</div>;
}

export default function HomePage() {
  const { contracts, address } = useWalletContext();
  const markets = useMarketStore((s) => s.markets);
  const { selectedMarketId, showBettingPanel } = useAppStore();
  const selectMarket = useAppStore((s) => s.selectMarket);

  const selectedMarket = markets.find((m) => m.id === selectedMarketId) || null;
  const activeMarkets = markets.filter((m) => m.status === 'active');

  // Stats
  const totalVolume = markets.reduce((sum, m) => sum + parseFloat(m.totalPool), 0);
  const playerCount = new Set(markets.map((m) => m.creator)).size;

  // AI agents display
  const agents: AIAgentDisplay[] = AI_AGENTS.map((a) => ({
    name: a.name,
    personality: a.personality,
    color: a.color,
    description: a.description,
    avatarURI: a.avatar,
    agentAddress: '',
    isActive: true,
    totalPredictions: 0,
    correctPredictions: 0,
    accuracy: 0,
  }));

  const handlePlaceBet = async (position: boolean, amount: string) => {
    if (selectedMarketId === null) throw new Error('No market selected');
    await contracts.placeBet(selectedMarketId, position, amount);
    const updated = await contracts.getAllMarkets();
    useMarketStore.getState().setMarkets(updated);
  };

  return (
    <div className="min-h-screen bg-arena-dark text-white overflow-x-hidden">
      <Navbar />

      {/* Hero + 3D Arena */}
      <section className="relative h-[70vh] min-h-[500px]">
        <div className="absolute inset-0">
          <ArenaScene />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-arena-dark via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-8 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto text-center pointer-events-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <motion.span
                initial={{ opacity: 0, y: 40, filter: 'blur(10px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="bg-gradient-to-r from-arena-primary via-arena-accent to-arena-secondary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient inline-block"
              >
                Prediction Arena
              </motion.span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-xl text-gray-400 mb-6"
            >
              AI-powered prediction markets on Avalanche. Bet against intelligent agents.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="flex gap-4 justify-center"
            >
              <Link href="/markets">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(0,240,255,0.4)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-arena-primary text-black font-bold rounded-xl hover:bg-arena-primary/90 transition-colors flex items-center gap-2 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center gap-2">Enter Arena <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                  <div className="absolute inset-0 shimmer" />
                </motion.button>
              </Link>
              <Link href="/create">
                <motion.button
                  whileHover={{ scale: 1.05, borderColor: 'rgba(0,240,255,0.6)' }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 border border-arena-primary/30 text-arena-primary rounded-xl hover:bg-arena-primary/10 transition-all duration-300"
                >
                  Create Market
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/5 bg-arena-darker/50 backdrop-blur-sm relative overflow-hidden">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-arena-primary/5 via-transparent to-arena-secondary/5 animate-gradient bg-[length:200%_100%]" />
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 relative">
          {[
            { label: 'Total Volume', value: totalVolume.toFixed(2), suffix: ' AVAX', icon: BarChart3, color: 'text-arena-primary' },
            { label: 'Active Markets', value: activeMarkets.length.toString(), suffix: '', icon: TrendingUp, color: 'text-arena-accent' },
            { label: 'Players', value: playerCount.toString(), suffix: '', icon: Users, color: 'text-arena-secondary' },
            { label: 'AI Agents', value: AI_AGENTS.length.toString(), suffix: '', icon: Bot, color: 'text-purple-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className="text-center group cursor-default"
            >
              <motion.div
                animate={{ y: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 3, delay: i * 0.5 }}
              >
                <stat.icon className={`w-6 h-6 ${stat.color} mx-auto mb-2 group-hover:drop-shadow-[0_0_8px_currentColor] transition-all`} />
              </motion.div>
              <div className={`text-2xl font-bold ${stat.color}`}>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Agents */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative">
        {/* Section background accent */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-arena-primary/[0.02] to-transparent pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12 relative"
        >
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="w-48 h-48 bg-arena-primary/10 rounded-full blur-3xl" />
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-arena-primary/10 border border-arena-primary/20 text-arena-primary text-xs font-medium mb-4"
          >
            <Sparkles className="w-3 h-3" /> AI-Powered
          </motion.div>
          <h2 className="text-3xl font-bold mb-2 relative">AI Agents</h2>
          <p className="text-gray-500 relative">Intelligent agents competing in the arena</p>
        </motion.div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {agents.map((agent, i) => (
            <AIAgentCard key={agent.name} agent={agent} index={i} />
          ))}
        </div>
      </section>

      {/* Live Markets */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold">Live Markets</h2>
            <p className="text-gray-500 mt-1">Active prediction markets</p>
          </motion.div>
          <Link href="/markets">
            <motion.button
              whileHover={{ scale: 1.05, x: 5 }}
              whileTap={{ scale: 0.95 }}
              className="text-arena-primary hover:text-arena-primary/80 flex items-center gap-1 text-sm group"
            >
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </Link>
        </div>

        {activeMarkets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 border border-white/5 rounded-2xl bg-arena-darker/30 relative overflow-hidden"
          >
            {/* Animated background */}
            <div className="absolute inset-0">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-conic from-arena-primary/10 via-transparent to-arena-secondary/10 rounded-full blur-3xl"
              />
            </div>
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Zap className="w-12 h-12 text-arena-primary/30 mx-auto mb-4" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-400 mb-2 relative">No markets yet</h3>
            <p className="text-gray-600 mb-6 relative">Be the first to create a prediction market!</p>
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.08, boxShadow: '0 0 30px rgba(0,240,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2.5 bg-arena-primary text-black font-bold rounded-xl relative"
              >
                Create Market
              </motion.button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMarkets.slice(0, 6).map((market, i) => (
              <MarketCard key={market.id} market={market} onClick={() => selectMarket(market.id)} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* Betting Panel */}
      <AnimatePresence>
        {showBettingPanel && selectedMarket && (
          <BettingPanel
            market={selectedMarket}
            onPlaceBet={handlePlaceBet}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center text-gray-600 text-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-arena-primary/[0.02] to-transparent pointer-events-none" />
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          Prediction Arena &copy; {new Date().getFullYear()} &mdash; Built on Avalanche
        </motion.p>
      </footer>
    </div>
  );
}
