'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Zap,
  Target,
  Shuffle,
  Sparkles,
  Loader2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  Trophy,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { useMarketStore } from '@/store';
import { AI_AGENTS } from '@/lib/constants';
import { MarketDisplay } from '@/lib/types';

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface AgentDecision {
  agent: string;
  personality: string;
  color: string;
  position: string;
  confidence: number;
  reasoning: string;
  betSize: 'small' | 'medium' | 'large';
}

interface AgentStats {
  name: string;
  totalDecisions: number;
  avgConfidence: number;
  favoritePosition: string;
  decisionsHistory: {
    marketQuestion: string;
    marketId: number;
    decision: AgentDecision;
  }[];
}

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const personalityIcons: Record<string, typeof Brain> = {
  aggressive: Zap,
  conservative: Target,
  balanced: Brain,
  chaotic: Shuffle,
};

const personalityDescriptions: Record<string, string> = {
  aggressive:
    'APEX thrives on momentum and volatility. It chases big moves, bets heavily on trending outcomes, and is not afraid of high-risk plays. When markets spike, APEX goes all in.',
  balanced:
    'ORACLE takes a measured approach, weighing all available data before committing. It spreads risk across positions and uses statistical analysis to find value in odds discrepancies.',
  conservative:
    'GHOST only strikes when the odds are overwhelmingly in its favor. It waits patiently, often sitting out volatile markets entirely. Low volume, but deadly accurate when it acts.',
  chaotic:
    'CHAOS is the wildcard of the arena. It deliberately takes contrarian positions, exploits overconfidence in the crowd, and occasionally makes seemingly random bets to keep opponents off-balance.',
};

const betSizeLabels = {
  small: { label: '0.1 APT', color: 'text-gray-400' },
  medium: { label: '0.5 APT', color: 'text-yellow-400' },
  large: { label: '1.0 APT', color: 'text-red-400' },
};

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AgentsPage() {
  const markets = useMarketStore((s) => s.markets);
  const activeMarkets = markets.filter((m) => m.status === 'active');

  const [selectedAgent, setSelectedAgent] = useState<string>(AI_AGENTS[0].name);
  const [agentStats, setAgentStats] = useState<Record<string, AgentStats>>({});
  const [currentDecisions, setCurrentDecisions] = useState<AgentDecision[]>([]);
  const [selectedMarketIdx, setSelectedMarketIdx] = useState(0);
  const [isLoadingDecisions, setIsLoadingDecisions] = useState(false);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  const selectedMarket = activeMarkets[selectedMarketIdx] || null;

  // Initialize agent stats
  useEffect(() => {
    const initialStats: Record<string, AgentStats> = {};
    AI_AGENTS.forEach((a) => {
      initialStats[a.name] = {
        name: a.name,
        totalDecisions: 0,
        avgConfidence: 0,
        favoritePosition: '-',
        decisionsHistory: [],
      };
    });
    setAgentStats(initialStats);
  }, []);

  // Fetch decisions for selected market
  const fetchDecisions = useCallback(
    async (market: MarketDisplay) => {
      setIsLoadingDecisions(true);
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
          setCurrentDecisions(data.data);

          // Update agent stats with new decisions
          setAgentStats((prev) => {
            const updated = { ...prev };
            for (const decision of data.data as AgentDecision[]) {
              const existing = updated[decision.agent];
              if (!existing) continue;

              const alreadyRecorded = existing.decisionsHistory.some(
                (d) => d.marketId === market.id
              );
              if (alreadyRecorded) continue;

              const newHistory = [
                ...existing.decisionsHistory,
                {
                  marketQuestion: market.question,
                  marketId: market.id,
                  decision,
                },
              ];

              const allConfidences = newHistory.map((d) => d.decision.confidence);
              const avgConf = allConfidences.reduce((a, b) => a + b, 0) / allConfidences.length;

              // Find most common position
              const positionCounts: Record<string, number> = {};
              newHistory.forEach((d) => {
                positionCounts[d.decision.position] = (positionCounts[d.decision.position] || 0) + 1;
              });
              const fav = Object.entries(positionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

              updated[decision.agent] = {
                ...existing,
                totalDecisions: newHistory.length,
                avgConfidence: Math.round(avgConf),
                favoritePosition: fav,
                decisionsHistory: newHistory,
              };
            }
            return updated;
          });
        }
      } catch (error) {
        console.error('Failed to fetch agent decisions:', error);
      } finally {
        setIsLoadingDecisions(false);
      }
    },
    []
  );

  // Fetch decisions when market changes
  useEffect(() => {
    if (selectedMarket) {
      fetchDecisions(selectedMarket);
    }
  }, [selectedMarketIdx, selectedMarket, fetchDecisions]);

  const currentAgentData = AI_AGENTS.find((a) => a.name === selectedAgent);
  const currentAgentDecision = currentDecisions.find((d) => d.agent === selectedAgent);
  const currentStats = agentStats[selectedAgent];

  return (
    <div className="min-h-screen bg-arena-dark text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-24 pb-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4"
          >
            <Brain className="w-3 h-3" /> AI-Powered Agents
          </motion.div>
          <h1 className="text-4xl font-bold mb-3">AI Agent Arena</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Four AI agents with unique personalities analyze every market in real-time.
            Watch their strategies, compare decisions, and learn from their analysis.
          </p>
        </motion.div>

        {/* Agent Selector Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {AI_AGENTS.map((agent, i) => {
            const Icon = personalityIcons[agent.personality] || Brain;
            const stats = agentStats[agent.name];
            const isSelected = selectedAgent === agent.name;

            return (
              <motion.button
                key={agent.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedAgent(agent.name)}
                className={`relative p-5 rounded-2xl border text-left transition-all duration-300
                  ${
                    isSelected
                      ? 'border-opacity-60 bg-arena-card shadow-lg'
                      : 'border-arena-border bg-arena-card/50 hover:bg-arena-card'
                  }`}
                style={{
                  borderColor: isSelected ? agent.color : undefined,
                  boxShadow: isSelected ? `0 4px 30px ${agent.color}20` : undefined,
                }}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <motion.div
                    layoutId="agentSelector"
                    className="absolute inset-0 rounded-2xl border-2"
                    style={{ borderColor: agent.color }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${agent.color}20` }}
                    >
                      {agent.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-base" style={{ color: agent.color }}>
                        {agent.name}
                      </h3>
                      <div className="flex items-center gap-1">
                        <Icon className="w-3 h-3 text-gray-500" />
                        <span className="text-[10px] text-gray-500 capitalize">{agent.personality}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-arena-dark/50 rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-gray-500 uppercase">Decisions</p>
                      <p className="text-sm font-bold text-white">{stats?.totalDecisions || 0}</p>
                    </div>
                    <div className="bg-arena-dark/50 rounded-lg px-2.5 py-1.5">
                      <p className="text-[9px] text-gray-500 uppercase">Avg Conf.</p>
                      <p className="text-sm font-bold text-white">{stats?.avgConfidence || 0}%</p>
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Agent Detail Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Agent Profile */}
          <motion.div
            key={selectedAgent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-arena-card border border-arena-border rounded-2xl p-6 lg:col-span-1"
          >
            <div className="flex items-center gap-4 mb-6">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${currentAgentData?.color}20` }}
              >
                {currentAgentData?.avatar}
              </div>
              <div>
                <h2 className="text-2xl font-bold" style={{ color: currentAgentData?.color }}>
                  {currentAgentData?.name}
                </h2>
                <p className="text-sm text-gray-400 capitalize">{currentAgentData?.personality} Strategy</p>
              </div>
            </div>

            <p className="text-sm text-gray-300 leading-relaxed mb-6">
              {personalityDescriptions[currentAgentData?.personality || 'balanced']}
            </p>

            {/* Traits */}
            <div className="mb-6">
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Traits</h4>
              <div className="flex flex-wrap gap-2">
                {currentAgentData?.traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{
                      color: currentAgentData.color,
                      borderColor: `${currentAgentData.color}40`,
                      backgroundColor: `${currentAgentData.color}10`,
                    }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* Performance Stats */}
            <div>
              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Activity className="w-4 h-4" /> Total Decisions
                  </span>
                  <span className="text-sm font-bold">{currentStats?.totalDecisions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Avg Confidence
                  </span>
                  <span className="text-sm font-bold">{currentStats?.avgConfidence || 0}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400 flex items-center gap-2">
                    <Trophy className="w-4 h-4" /> Favorite Position
                  </span>
                  <span className="text-sm font-bold">{currentStats?.favoritePosition || '-'}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Live Decisions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Market Selector */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                  Live Analysis
                </h3>
                <button
                  onClick={() => selectedMarket && fetchDecisions(selectedMarket)}
                  disabled={isLoadingDecisions}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-arena-border hover:bg-arena-border/80 text-xs text-gray-300 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDecisions ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>

              {/* Market Tabs */}
              {activeMarkets.length > 0 ? (
                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                  {activeMarkets.slice(0, 6).map((m, idx) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMarketIdx(idx)}
                      className={`flex-shrink-0 px-4 py-2 rounded-lg text-xs font-medium transition-all
                        ${
                          idx === selectedMarketIdx
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-arena-dark text-gray-400 border border-arena-border hover:text-white'
                        }`}
                    >
                      {m.question.length > 40 ? m.question.slice(0, 37) + '...' : m.question}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No active markets. Create one to see AI analysis.</p>
              )}

              {/* Selected Market Info */}
              {selectedMarket && (
                <div className="bg-arena-dark rounded-xl p-4 mb-4">
                  <h4 className="font-bold text-white mb-2">{selectedMarket.question}</h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>Pool: {selectedMarket.totalPool} APT</span>
                    <span>â€¢</span>
                    <span>{selectedMarket.timeRemaining}</span>
                    <span>â€¢</span>
                    <span className="capitalize">{selectedMarket.category}</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedMarket.outcomes.map((outcome, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 w-24 truncate">{outcome.label}</span>
                        <div className="flex-1 h-2 bg-arena-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${outcome.percent}%` }}
                            transition={{ duration: 0.8 }}
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
                        <span className="text-xs font-bold w-10 text-right">{outcome.percent}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Agent Decision (highlighted) */}
              {isLoadingDecisions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-3" />
                  <span className="text-gray-400">Agents are analyzing...</span>
                </div>
              ) : currentAgentDecision ? (
                <motion.div
                  key={`${selectedAgent}-${selectedMarketIdx}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border rounded-xl p-5 relative overflow-hidden"
                  style={{
                    borderColor: `${currentAgentDecision.color}40`,
                    background: `linear-gradient(135deg, ${currentAgentDecision.color}08, transparent)`,
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${currentAgentDecision.color}20` }}
                      >
                        {currentAgentData?.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold" style={{ color: currentAgentDecision.color }}>
                          {currentAgentDecision.agent}&apos;s Decision
                        </h4>
                        <p className="text-[10px] text-gray-500 capitalize">
                          {currentAgentDecision.personality} strategy
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        {currentAgentDecision.confidence > 60 ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <span className="text-lg font-bold text-white">
                          {currentAgentDecision.position}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {currentAgentDecision.confidence}% confidence
                      </p>
                    </div>
                  </div>

                  {/* Confidence bar */}
                  <div className="mb-4">
                    <div className="h-2 bg-arena-border rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentAgentDecision.confidence}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: currentAgentDecision.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">Bet Size</span>
                    <span
                      className={`text-sm font-medium ${betSizeLabels[currentAgentDecision.betSize].color}`}
                    >
                      {betSizeLabels[currentAgentDecision.betSize].label}
                    </span>
                  </div>

                  <div className="bg-arena-dark rounded-lg p-3">
                    <p className="text-sm text-gray-300 italic leading-relaxed">
                      &quot;{currentAgentDecision.reasoning}&quot;
                    </p>
                  </div>
                </motion.div>
              ) : null}
            </div>

            {/* All Agents Comparison for this market */}
            {selectedMarket && currentDecisions.length > 0 && !isLoadingDecisions && (
              <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  All Agents â€” Side by Side
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentDecisions.map((decision, i) => {
                    const agent = AI_AGENTS.find((a) => a.name === decision.agent);
                    const Icon = personalityIcons[decision.personality] || Brain;
                    const isActive = decision.agent === selectedAgent;

                    return (
                      <motion.div
                        key={decision.agent}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedAgent(decision.agent)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]
                          ${
                            isActive
                              ? 'border-opacity-60 bg-arena-dark'
                              : 'border-arena-border bg-arena-dark/50 hover:bg-arena-dark'
                          }`}
                        style={{
                          borderColor: isActive ? decision.color : undefined,
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{agent?.avatar}</span>
                            <div>
                              <span className="text-sm font-bold" style={{ color: decision.color }}>
                                {decision.agent}
                              </span>
                              <div className="flex items-center gap-1">
                                <Icon className="w-2.5 h-2.5 text-gray-500" />
                                <span className="text-[9px] text-gray-500 capitalize">
                                  {decision.personality}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-white block">
                              {decision.position}
                            </span>
                            <span className="text-[10px]" style={{ color: decision.color }}>
                              {decision.confidence}%
                            </span>
                          </div>
                        </div>
                        <div className="h-1 bg-arena-border rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${decision.confidence}%` }}
                            transition={{ duration: 0.8, delay: i * 0.05 }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: decision.color }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Decision History */}
            {currentStats && currentStats.decisionsHistory.length > 0 && (
              <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
                <button
                  onClick={() =>
                    setExpandedAgent(expandedAgent === selectedAgent ? null : selectedAgent)
                  }
                  className="flex items-center justify-between w-full mb-4"
                >
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Decision History ({currentStats.decisionsHistory.length})
                  </h3>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedAgent === selectedAgent ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {expandedAgent === selectedAgent && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden space-y-2"
                    >
                      {currentStats.decisionsHistory.map((entry, i) => (
                        <motion.div
                          key={`${entry.marketId}-${i}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="flex items-center justify-between bg-arena-dark rounded-lg px-4 py-3"
                        >
                          <div className="flex-1 min-w-0 mr-4">
                            <p className="text-sm text-white truncate">{entry.marketQuestion}</p>
                            <p className="text-[10px] text-gray-500 italic mt-0.5 truncate">
                              &quot;{entry.decision.reasoning}&quot;
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-bold text-white block">
                                {entry.decision.position}
                              </span>
                              <span
                                className="text-[10px]"
                                style={{ color: currentAgentData?.color }}
                              >
                                {entry.decision.confidence}% conf
                              </span>
                            </div>
                            <span
                              className={`text-xs font-medium ${betSizeLabels[entry.decision.betSize].color}`}
                            >
                              {betSizeLabels[entry.decision.betSize].label}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* AI Disclaimer */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[10px] text-gray-600 mt-10 flex items-center justify-center gap-1"
        >
          <Sparkles className="w-3 h-3" />
          AI analysis is for entertainment only. Always do your own research before betting.
        </motion.p>
      </main>
    </div>
  );
}
