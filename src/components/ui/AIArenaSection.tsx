'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Target, Shuffle, Sparkles, Loader2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';
import { AI_AGENTS } from '@/lib/constants';

interface AgentDecision {
  agent: string;
  personality: string;
  color: string;
  position: string;
  confidence: number;
  reasoning: string;
  betSize: 'small' | 'medium' | 'large';
}

const personalityIcons: Record<string, typeof Brain> = {
  aggressive: Zap,
  conservative: Target,
  balanced: Brain,
  chaotic: Shuffle,
};

const betSizeLabels = {
  small: { label: '0.1 AVAX', color: 'text-gray-400' },
  medium: { label: '0.5 AVAX', color: 'text-yellow-400' },
  large: { label: '1.0 AVAX', color: 'text-red-400' },
};

interface AIArenaProps {
  markets: MarketDisplay[];
}

export default function AIArenaSection({ markets }: AIArenaProps) {
  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMarketIdx, setSelectedMarketIdx] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const activeMarkets = markets.filter((m) => m.status === 'active');
  const selectedMarket = activeMarkets[selectedMarketIdx] || null;

  const fetchDecisions = useCallback(async (market: MarketDisplay) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/agents/decide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          market: {
            question: market.question,
            category: market.category,
            outcomes: market.outcomes.map((o) => ({
              label: o.label,
              percent: o.percent,
              pool: o.pool,
            })),
            totalPool: market.totalPool,
            timeRemaining: market.timeRemaining,
            isExpired: market.isExpired,
            resolved: market.resolved,
            status: market.status,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.data) {
        setDecisions(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI decisions:', error);
      // Use fallback static decisions
      setDecisions(
        AI_AGENTS.map((a) => ({
          agent: a.name,
          personality: a.personality,
          color: a.color,
          position: market.outcomes[0]?.label || 'YES',
          confidence: Math.floor(Math.random() * 30) + 50,
          reasoning: `${a.name} is analyzing this market...`,
          betSize: 'medium' as const,
        }))
      );
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (selectedMarket && !hasLoaded) {
      fetchDecisions(selectedMarket);
    }
  }, [selectedMarket, hasLoaded, fetchDecisions]);

  const handleMarketChange = (idx: number) => {
    setSelectedMarketIdx(idx);
    setHasLoaded(false);
    setDecisions([]);
  };

  const handleRefresh = () => {
    if (selectedMarket) {
      setHasLoaded(false);
      fetchDecisions(selectedMarket);
    }
  };

  if (activeMarkets.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-6 py-16 relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 relative"
      >
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4"
        >
          <Brain className="w-3 h-3" /> AI-Powered Analysis
        </motion.div>
        <h2 className="text-3xl font-bold mb-2">AI Arena Intelligence</h2>
        <p className="text-gray-500 max-w-lg mx-auto">
          Watch our AI agents analyze markets in real-time. Each agent has a unique personality and strategy.
        </p>
      </motion.div>

      {/* Market Selector */}
      {activeMarkets.length > 1 && (
        <div className="flex justify-center mb-8">
          <div className="flex gap-2 p-1 bg-arena-card border border-arena-border rounded-xl overflow-x-auto max-w-full">
            {activeMarkets.slice(0, 5).map((m, idx) => (
              <button
                key={m.id}
                onClick={() => handleMarketChange(idx)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                  ${
                    idx === selectedMarketIdx
                      ? 'bg-arena-primary text-black'
                      : 'text-gray-400 hover:text-white hover:bg-arena-border'
                  }`}
              >
                {m.question.length > 35 ? m.question.slice(0, 32) + '...' : m.question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Market Info */}
      {selectedMarket && (
        <motion.div
          key={selectedMarket.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-arena-card border border-arena-border rounded-2xl p-5 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-1">
                {selectedMarket.question}
              </h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span>Pool: {selectedMarket.totalPool} AVAX</span>
                <span>•</span>
                <span>{selectedMarket.timeRemaining}</span>
                <span>•</span>
                <span className="capitalize">{selectedMarket.category}</span>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-2 rounded-lg hover:bg-arena-border transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Outcome Bars */}
          <div className="space-y-2">
            {selectedMarket.outcomes.map((outcome, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 truncate">
                  {outcome.label}
                </span>
                <div className="flex-1 h-2 bg-arena-border rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${outcome.percent}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        i === 0
                          ? 'linear-gradient(90deg, #3B82F6, #6366F1)'
                          : i === 1
                          ? 'linear-gradient(90deg, #EF4444, #F97316)'
                          : `hsl(${i * 60 + 120}, 70%, 50%)`,
                    }}
                  />
                </div>
                <span className="text-xs font-bold text-white w-12 text-right">
                  {outcome.percent.toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Agent Decisions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="wait">
          {isLoading
            ? AI_AGENTS.map((agent, i) => (
                <motion.div
                  key={`loading-${agent.name}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-arena-card border border-arena-border rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      {agent.avatar}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: agent.color }}>
                        {agent.name}
                      </h4>
                      <span className="text-[10px] text-gray-500 capitalize">{agent.personality}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: agent.color }} />
                    <span className="text-xs text-gray-400 ml-2">Analyzing...</span>
                  </div>
                </motion.div>
              ))
            : decisions.map((decision, i) => {
                const agent = AI_AGENTS.find((a) => a.name === decision.agent);
                const Icon = personalityIcons[decision.personality] || Brain;
                const isPositive = decision.confidence > 60;

                return (
                  <motion.div
                    key={decision.agent}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: i * 0.1, type: 'spring', stiffness: 100 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-arena-card border border-arena-border rounded-xl p-4 relative overflow-hidden group"
                    style={{ borderColor: `${decision.color}30` }}
                  >
                    {/* Background glow */}
                    <motion.div
                      animate={{ opacity: [0.02, 0.06, 0.02] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `radial-gradient(circle at 30% 30%, ${decision.color}, transparent 70%)`,
                      }}
                    />

                    {/* Agent Header */}
                    <div className="relative flex items-center gap-3 mb-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg relative"
                        style={{ backgroundColor: `${decision.color}20` }}
                      >
                        {agent?.avatar || '🤖'}
                        <motion.div
                          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                          transition={{ repeat: Infinity, duration: 3 }}
                          className="absolute inset-0 rounded-xl border"
                          style={{ borderColor: decision.color }}
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm" style={{ color: decision.color }}>
                          {decision.agent}
                        </h4>
                        <div className="flex items-center gap-1">
                          <Icon className="w-3 h-3 text-gray-500" />
                          <span className="text-[10px] text-gray-500 capitalize">
                            {decision.personality}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Decision */}
                    <div className="relative space-y-2">
                      {/* Position */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Position</span>
                        <div className="flex items-center gap-1.5">
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3 text-green-400" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-400" />
                          )}
                          <span className="text-sm font-bold text-white">
                            {decision.position}
                          </span>
                        </div>
                      </div>

                      {/* Confidence Bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Confidence</span>
                          <span className="text-xs font-bold" style={{ color: decision.color }}>
                            {decision.confidence}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-arena-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${decision.confidence}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: i * 0.1 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: decision.color }}
                          />
                        </div>
                      </div>

                      {/* Bet Size */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Bet Size</span>
                        <span className={`text-xs font-medium ${betSizeLabels[decision.betSize].color}`}>
                          {betSizeLabels[decision.betSize].label}
                        </span>
                      </div>

                      {/* Reasoning */}
                      <div className="pt-2 border-t border-arena-border mt-2">
                        <p className="text-[11px] text-gray-400 leading-relaxed italic">
                          &quot;{decision.reasoning}&quot;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
        </AnimatePresence>
      </div>

      {/* AI Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="text-center text-[10px] text-gray-600 mt-6 flex items-center justify-center gap-1"
      >
        <Sparkles className="w-3 h-3" />
        AI analysis is for entertainment only. Always do your own research before betting.
      </motion.p>
    </section>
  );
}
