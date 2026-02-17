'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';

interface AIInsight {
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  recommendation: string;
  reasoning: string;
}

interface AIInsightBadgeProps {
  market: MarketDisplay;
  compact?: boolean;
}

const sentimentConfig = {
  bullish: { color: '#00FF88', icon: TrendingUp, label: 'Bullish' },
  bearish: { color: '#FF4444', icon: TrendingDown, label: 'Bearish' },
  neutral: { color: '#FFD700', icon: Minus, label: 'Neutral' },
};

export default function AIInsightBadge({ market, compact = false }: AIInsightBadgeProps) {
  const [insight, setInsight] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchInsight = useCallback(async () => {
    if (insight || isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/insights', {
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
        setInsight(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch AI insight:', error);
    } finally {
      setIsLoading(false);
    }
  }, [market, insight, isLoading]);

  // Fetch insight on hover (lazy loading)
  useEffect(() => {
    if (showTooltip && !insight && !isLoading) {
      fetchInsight();
    }
  }, [showTooltip, insight, isLoading, fetchInsight]);

  if (compact) {
    return (
      <motion.div
        onHoverStart={() => setShowTooltip(true)}
        onHoverEnd={() => setShowTooltip(false)}
        onClick={(e) => {
          e.stopPropagation();
          setShowTooltip(!showTooltip);
          if (!insight) fetchInsight();
        }}
        className="relative"
      >
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 cursor-pointer"
        >
          <Brain className="w-3 h-3 text-cyan-400" />
          <span className="text-[10px] font-medium text-cyan-400">AI</span>
        </motion.div>

        {/* Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 
                       bg-arena-dark border border-arena-border rounded-xl p-3 
                       shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-50"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2 py-2">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-xs text-gray-400">Analyzing...</span>
              </div>
            ) : insight ? (
              <InsightContent insight={insight} />
            ) : (
              <p className="text-xs text-gray-400 text-center py-2">
                Click to analyze with AI
              </p>
            )}
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 
                           bg-arena-dark border-r border-b border-arena-border rotate-45" />
          </motion.div>
        )}
      </motion.div>
    );
  }

  // Full-size badge
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-arena-card border border-arena-border rounded-xl p-3"
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs text-gray-400">AI is analyzing this market...</span>
        </div>
      ) : insight ? (
        <InsightContent insight={insight} />
      ) : (
        <button
          onClick={fetchInsight}
          className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <Brain className="w-4 h-4" />
          Get AI Analysis
        </button>
      )}
    </motion.div>
  );
}

function InsightContent({ insight }: { insight: AIInsight }) {
  const config = sentimentConfig[insight.sentiment];
  const Icon = config.icon;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
          <span
            className="text-xs font-bold"
            style={{ color: config.color }}
          >
            {config.label}
          </span>
        </div>
        <span className="text-[10px] text-gray-400">
          {insight.confidence}% confidence
        </span>
      </div>
      <p className="text-xs text-gray-300 leading-relaxed">
        {insight.recommendation}
      </p>
      <p className="text-[10px] text-gray-500 leading-relaxed">
        {insight.reasoning}
      </p>
    </div>
  );
}
