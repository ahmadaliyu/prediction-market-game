'use client';

import { motion } from 'framer-motion';
import { getCategoryConfig } from '@/lib/utils';
import { MarketDisplay } from '@/lib/types';
import { Clock, Users, TrendingUp, Zap } from 'lucide-react';

interface MarketCardProps {
  market: MarketDisplay;
  onClick: () => void;
  index?: number;
}

export default function MarketCard({ market, onClick, index = 0 }: MarketCardProps) {
  const category = getCategoryConfig(market.category);
  const isHot = parseFloat(market.totalPool) > 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      onClick={onClick}
      className="group relative bg-arena-card border border-arena-border rounded-2xl p-5 
                 hover:border-arena-primary/40 transition-all duration-300 cursor-pointer
                 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] overflow-hidden"
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${category.color}15, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-lg text-xs font-medium"
            style={{
              backgroundColor: `${category.color}20`,
              color: category.color,
            }}
          >
            {category.emoji} {category.label}
          </span>
          {isHot && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-orange-500/20 text-orange-400">
              <Zap className="w-3 h-3" /> Hot
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs">{market.timeRemaining}</span>
        </div>
      </div>

      {/* Question */}
      <h3 className="relative text-white font-semibold text-sm leading-relaxed mb-4 line-clamp-2 group-hover:text-arena-primary transition-colors">
        {market.question}
      </h3>

      {/* Odds Bar */}
      <div className="relative mb-3">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-arena-green font-medium">YES {market.yesPercent}%</span>
          <span className="text-red-400 font-medium">NO {market.noPercent}%</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${market.yesPercent}%`,
              background: `linear-gradient(90deg, #00FF88, ${market.yesPercent > 70 ? '#00FF88' : '#FFD700'})`,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="relative flex items-center justify-between pt-3 border-t border-arena-border/50">
        <div className="flex items-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-arena-primary" />
          <span className="text-xs text-gray-400">Pool:</span>
          <span className="text-xs text-arena-primary font-medium">{market.totalPool} AVAX</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs text-gray-400">
            {market.bettorCount} {market.bettorCount === 1 ? 'bettor' : 'bettors'}
          </span>
        </div>
      </div>

      {/* Status badge */}
      {market.status !== 'active' && (
        <div className="absolute top-3 right-3">
          <span
            className={`px-2 py-1 rounded-md text-xs font-bold ${
              market.status === 'resolved'
                ? 'bg-arena-green/20 text-arena-green'
                : 'bg-yellow-500/20 text-yellow-400'
            }`}
          >
            {market.status.toUpperCase()}
          </span>
        </div>
      )}
    </motion.div>
  );
}
