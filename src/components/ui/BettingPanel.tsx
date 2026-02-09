'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Loader2, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';
import { getCategoryConfig } from '@/lib/utils';
import { useAppStore } from '@/store';

interface BettingPanelProps {
  market: MarketDisplay;
  onPlaceBet: (outcomeIndex: number, amount: string) => Promise<void>;
}

export default function BettingPanel({ market, onPlaceBet }: BettingPanelProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');
  const [betSuccess, setBetSuccess] = useState(false);
  const toggleBettingPanel = useAppStore((s) => s.toggleBettingPanel);
  const category = getCategoryConfig(market.category);

  const selectedLabel = selectedOutcome !== null
    ? market.outcomes[selectedOutcome]?.label || ''
    : '';

  const handleBet = async () => {
    if (selectedOutcome === null) {
      setError('Select an outcome');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Enter a valid amount');
      return;
    }

    setIsPlacing(true);
    setError('');

    try {
      await onPlaceBet(selectedOutcome, amount);
      setBetSuccess(true);
      setTimeout(() => {
        toggleBettingPanel(false);
      }, 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const presetAmounts = ['0.1', '0.5', '1.0', '2.0', '5.0'];

  if (betSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed right-0 top-16 bottom-0 w-full sm:w-[420px] bg-arena-surface border-l border-arena-border 
                   shadow-2xl z-40 flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="text-center p-8"
        >
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-2 border-arena-green"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: 'linear' }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sparkles className="w-8 h-8 text-arena-gold" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-arena-green" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">Bet Placed! 🎉</h3>
          <p className="text-gray-400">
            {amount} AVAX on <span className="text-arena-primary font-bold">{selectedLabel}</span>
          </p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-30 sm:hidden"
        onClick={() => toggleBettingPanel(false)}
      />

      <motion.div
        initial={{ opacity: 0, x: 400, scale: 0.95 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: 400, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed right-0 top-16 bottom-0 w-full sm:w-[420px] bg-arena-surface border-l border-arena-border 
                   shadow-2xl z-40 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-arena-surface/95 backdrop-blur-sm p-5 border-b border-arena-border">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Place Your Bet</h2>
            <motion.button
              whileHover={{ rotate: 90, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => toggleBettingPanel(false)}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </motion.button>
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
            {market.rules && (
              <p className="text-gray-500 text-xs mt-2 leading-relaxed">{market.rules}</p>
            )}
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-gray-400">Pool: {market.totalPool} AVAX</span>
              <span className="text-gray-400">Ends: {market.timeRemaining}</span>
            </div>
          </div>

          {/* Outcome Selection */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Choose Outcome</label>
            <div className="space-y-2">
              {market.outcomes.map((outcome, i) => {
                const isUnclassified = outcome.label === 'Unclassified';
                const isSelected = selectedOutcome === outcome.index;
                const hue = (i * 60 + 200) % 360;
                const color = isUnclassified ? '#666' : `hsl(${hue}, 70%, 60%)`;

                return (
                  <motion.button
                    key={outcome.index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { setSelectedOutcome(outcome.index); setError(''); }}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left flex justify-between items-center
                      ${isSelected
                        ? 'bg-opacity-10 shadow-lg'
                        : 'border-arena-border hover:border-opacity-50 bg-arena-card'
                      }`}
                    style={isSelected ? {
                      borderColor: color,
                      backgroundColor: `${color}15`,
                    } : {}}
                  >
                    <span className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {outcome.label}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">
                      {outcome.percent}%
                    </span>
                  </motion.button>
                );
              })}
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
                onChange={(e) => { setAmount(e.target.value); setError(''); }}
                placeholder="0.00"
                className="w-full px-4 py-3 bg-arena-card border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-arena-primary font-medium">
                AVAX
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all
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

          {/* Payout preview */}
          {selectedOutcome !== null && amount && parseFloat(amount) > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-arena-card rounded-xl p-4 border border-arena-border space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Your Bet</span>
                <span className="text-sm text-white font-medium">{amount} AVAX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400">Outcome</span>
                <span className="text-sm text-arena-primary font-medium">{selectedLabel}</span>
              </div>
              <div className="border-t border-arena-border pt-2 flex justify-between">
                <span className="text-xs text-gray-400">Creator fee</span>
                <span className="text-xs text-gray-400">1.2%</span>
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

          {/* Submit */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBet}
            disabled={isPlacing || selectedOutcome === null || !amount}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-arena-primary text-black
                       hover:shadow-[0_0_20px_rgba(0,212,232,0.3)]"
          >
            {isPlacing ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Placing Bet...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Place Bet <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </motion.button>

          <p className="text-[10px] text-gray-600 text-center">
            Market creators earn 1.2% of trading volume. All bets are final.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
