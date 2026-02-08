'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';
import { calculatePayout, getCategoryConfig } from '@/lib/utils';
import { useAppStore } from '@/store';

interface BettingPanelProps {
  market: MarketDisplay;
  onPlaceBet: (position: boolean, amount: string) => Promise<void>;
}

export default function BettingPanel({ market, onPlaceBet }: BettingPanelProps) {
  const [position, setPosition] = useState<boolean | null>(null);
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const toggleBettingPanel = useAppStore((s) => s.toggleBettingPanel);
  const category = getCategoryConfig(market.category);

  const potentialPayout = position !== null && amount
    ? calculatePayout(amount, position, market)
    : '0';

  const multiplier = amount && parseFloat(amount) > 0
    ? (parseFloat(potentialPayout) / parseFloat(amount)).toFixed(2)
    : '0';

  const handleBet = async () => {
    if (position === null) {
      setError('Select YES or NO');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setIsPlacing(true);
    setError('');

    try {
      await onPlaceBet(position, amount);
      toggleBettingPanel(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const presetAmounts = ['0.1', '0.5', '1.0', '2.0', '5.0'];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-16 bottom-0 w-full sm:w-[420px] bg-arena-surface border-l border-arena-border 
                   shadow-2xl z-40 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-arena-surface/95 backdrop-blur-sm p-5 border-b border-arena-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Place Your Bet</h2>
            <button
              onClick={() => toggleBettingPanel(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Market Info */}
          <div className="bg-arena-card rounded-xl p-4 border border-arena-border">
            <div className="flex items-center gap-2 mb-2">
              <span
                className="px-2 py-0.5 rounded-md text-xs font-medium"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.emoji} {category.label}
              </span>
            </div>
            <p className="text-white font-medium text-sm leading-relaxed">{market.question}</p>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400">Pool: {market.totalPool} AVAX</span>
              <span className="text-gray-400">Ends: {market.timeRemaining}</span>
            </div>

            {/* Current odds */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-arena-green">YES {market.yesPercent}%</span>
                <span className="text-red-400">NO {market.noPercent}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-arena-green to-arena-green/70 rounded-full"
                  style={{ width: `${market.yesPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Position Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Your Prediction</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setPosition(true);
                  setError('');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${position === true
                    ? 'border-arena-green bg-arena-green/10 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                    : 'border-arena-border hover:border-arena-green/50 bg-arena-card'
                  }`}
              >
                <span className="text-2xl mb-1 block">👍</span>
                <span className={`font-bold text-lg ${position === true ? 'text-arena-green' : 'text-gray-300'}`}>
                  YES
                </span>
                <span className="text-xs text-gray-400 block mt-1">{market.yesPercent}% odds</span>
              </button>

              <button
                onClick={() => {
                  setPosition(false);
                  setError('');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${position === false
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(255,68,68,0.2)]'
                    : 'border-arena-border hover:border-red-500/50 bg-arena-card'
                  }`}
              >
                <span className="text-2xl mb-1 block">👎</span>
                <span className={`font-bold text-lg ${position === false ? 'text-red-400' : 'text-gray-300'}`}>
                  NO
                </span>
                <span className="text-xs text-gray-400 block mt-1">{market.noPercent}% odds</span>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Bet Amount (AVAX)</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setError('');
                }}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-arena-card border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 
                           focus:shadow-[0_0_15px_rgba(0,240,255,0.1)] transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-arena-primary font-medium">
                AVAX
              </span>
            </div>

            {/* Preset amounts */}
            <div className="flex gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors
                    ${amount === preset
                      ? 'bg-arena-primary/20 text-arena-primary border border-arena-primary/40'
                      : 'bg-arena-card text-gray-400 border border-arena-border hover:border-gray-500'
                    }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Payout Info */}
          {position !== null && amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-arena-card rounded-xl p-4 border border-arena-border space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Your Bet</span>
                <span className="text-sm text-white font-medium">{amount} AVAX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Position</span>
                <span className={`text-sm font-medium ${position ? 'text-arena-green' : 'text-red-400'}`}>
                  {position ? 'YES' : 'NO'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Multiplier</span>
                <span className="text-sm text-arena-gold font-medium">{multiplier}x</span>
              </div>
              <div className="border-t border-arena-border pt-2 flex justify-between">
                <span className="text-xs text-gray-400">Potential Payout</span>
                <span className="text-sm text-arena-primary font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {potentialPayout} AVAX
                </span>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleBet}
            disabled={isPlacing || position === null || !amount}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-gradient-to-r from-arena-primary to-arena-secondary text-black
                       hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                       active:scale-[0.98]"
          >
            {isPlacing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing Bet...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Place Bet <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-600 text-center">
            By placing a bet you agree to the market rules. All bets are final and settled on the Avalanche blockchain.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
