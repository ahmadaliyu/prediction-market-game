'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, AlertCircle, Loader2, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';
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
  const [betSuccess, setBetSuccess] = useState(false);
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
      setBetSuccess(true);
      // Auto close after celebration
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

  // Success celebration screen
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
          {/* Animated rings */}
          <div className="relative w-24 h-24 mx-auto mb-6">
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-2 border-arena-green"
            />
            <motion.div
              animate={{ scale: [1, 2], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
              className="absolute inset-0 rounded-full border-2 border-arena-primary"
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
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-white mb-2"
          >
            Bet Placed! 🎉
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-gray-400"
          >
            {amount} AVAX on <span className={position ? 'text-arena-green font-bold' : 'text-red-400 font-bold'}>{position ? 'YES' : 'NO'}</span>
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-arena-primary mt-2"
          >
            Potential payout: {potentialPayout} AVAX
          </motion.p>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
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
                   shadow-[−20px_0_60px_rgba(0,0,0,0.5)] z-40 overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-arena-surface/95 backdrop-blur-sm p-5 border-b border-arena-border">
          <div className="flex items-center justify-between">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg font-bold text-white"
            >
              Place Your Bet
            </motion.h2>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-arena-card rounded-xl p-4 border border-arena-border"
          >
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${market.yesPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-arena-green to-arena-green/70 rounded-full"
                />
              </div>
            </div>
          </motion.div>

          {/* Position Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="text-sm text-gray-400 mb-2 block">Your Prediction</label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setPosition(true);
                  setError('');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center overflow-hidden
                  ${position === true
                    ? 'border-arena-green bg-arena-green/10 shadow-[0_0_30px_rgba(0,255,136,0.25)]'
                    : 'border-arena-border hover:border-arena-green/50 bg-arena-card'
                  }`}
              >
                {position === true && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-arena-green/5"
                  />
                )}
                <span className="text-2xl mb-1 block relative">👍</span>
                <span className={`font-bold text-lg relative ${position === true ? 'text-arena-green' : 'text-gray-300'}`}>
                  YES
                </span>
                <span className="text-xs text-gray-400 block mt-1 relative">{market.yesPercent}% odds</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setPosition(false);
                  setError('');
                }}
                className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-center overflow-hidden
                  ${position === false
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_30px_rgba(255,68,68,0.25)]'
                    : 'border-arena-border hover:border-red-500/50 bg-arena-card'
                  }`}
              >
                {position === false && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-red-500/5"
                  />
                )}
                <span className="text-2xl mb-1 block relative">👎</span>
                <span className={`font-bold text-lg relative ${position === false ? 'text-red-400' : 'text-gray-300'}`}>
                  NO
                </span>
                <span className="text-xs text-gray-400 block mt-1 relative">{market.noPercent}% odds</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Amount */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
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
                           focus:shadow-[0_0_20px_rgba(0,240,255,0.15)] transition-all duration-300"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-arena-primary font-medium">
                AVAX
              </span>
            </div>

            {/* Preset amounts */}
            <div className="flex gap-2 mt-2">
              {presetAmounts.map((preset, i) => (
                <motion.button
                  key={preset}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setAmount(preset)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                    ${amount === preset
                      ? 'bg-arena-primary/20 text-arena-primary border border-arena-primary/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]'
                      : 'bg-arena-card text-gray-400 border border-arena-border hover:border-gray-500'
                    }`}
                >
                  {preset}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Payout Info */}
          <AnimatePresence>
            {position !== null && amount && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -10, height: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-arena-card rounded-xl p-4 border border-arena-border space-y-2 overflow-hidden"
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
                  <motion.span
                    key={multiplier}
                    initial={{ scale: 1.5, color: '#FFD700' }}
                    animate={{ scale: 1, color: '#FFD700' }}
                    className="text-sm text-arena-gold font-medium"
                  >
                    {multiplier}x
                  </motion.span>
                </div>
                <div className="border-t border-arena-border pt-2 flex justify-between">
                  <span className="text-xs text-gray-400">Potential Payout</span>
                  <motion.span
                    key={potentialPayout}
                    initial={{ scale: 1.3 }}
                    animate={{ scale: 1 }}
                    className="text-sm text-arena-primary font-bold flex items-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" />
                    {potentialPayout} AVAX
                  </motion.span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                <span className="text-xs text-red-400">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,240,255,0.4)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBet}
            disabled={isPlacing || position === null || !amount}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-gradient-to-r from-arena-primary to-arena-secondary text-black
                       hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                       active:scale-[0.98] relative overflow-hidden"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 shimmer" />
            
            {isPlacing ? (
              <span className="flex items-center justify-center gap-2 relative">
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing Bet...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2 relative">
                Place Bet <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </motion.button>

          {/* Disclaimer */}
          <p className="text-[10px] text-gray-600 text-center">
            By placing a bet you agree to the market rules. All bets are final and settled on the Avalanche blockchain.
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
