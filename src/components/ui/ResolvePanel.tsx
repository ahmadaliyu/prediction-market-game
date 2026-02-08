'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gavel, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { MarketDisplay } from '@/lib/types';
import { getCategoryConfig } from '@/lib/utils';

interface ResolvePanelProps {
  market: MarketDisplay;
  onResolve: (outcome: boolean) => Promise<void>;
  onClose: () => void;
}

export default function ResolvePanel({ market, onResolve, onClose }: ResolvePanelProps) {
  const [outcome, setOutcome] = useState<boolean | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState('');
  const [resolved, setResolved] = useState(false);
  const category = getCategoryConfig(market.category);

  const handleResolve = async () => {
    if (outcome === null) {
      setError('Select the outcome: YES or NO');
      return;
    }

    setIsResolving(true);
    setError('');

    try {
      await onResolve(outcome);
      setResolved(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to resolve market';
      if (msg.includes('user rejected')) {
        setError('Transaction was rejected');
      } else if (msg.includes('Market not ended yet')) {
        setError('Market has not ended yet');
      } else if (msg.includes('Not authorized')) {
        setError('Only the market creator or owner can resolve');
      } else {
        setError(msg);
      }
    } finally {
      setIsResolving(false);
    }
  };

  if (resolved) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-arena-surface border border-arena-border rounded-2xl p-8 max-w-md w-full text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <CheckCircle className="w-16 h-16 text-arena-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Market Resolved!</h2>
            <p className="text-gray-400 mb-2">
              Outcome: <span className={`font-bold ${outcome ? 'text-arena-green' : 'text-red-400'}`}>{outcome ? 'YES' : 'NO'}</span>
            </p>
            <p className="text-gray-500 text-sm mb-6">Winners can now claim their payouts.</p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-arena-primary text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
            >
              Done
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-arena-surface border border-arena-border rounded-2xl p-6 max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Gavel className="w-5 h-5 text-arena-gold" />
              <h2 className="text-lg font-bold text-white">Resolve Market</h2>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Market Info */}
          <div className="bg-arena-card rounded-xl p-4 border border-arena-border mb-5">
            <span
              className="inline-block px-2 py-0.5 rounded-md text-xs font-medium mb-2"
              style={{ backgroundColor: `${category.color}20`, color: category.color }}
            >
              {category.emoji} {category.label}
            </span>
            <p className="text-white font-medium text-sm leading-relaxed">{market.question}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
              <span>Pool: {market.totalPool} AVAX</span>
              <span>{market.bettorCount} {market.bettorCount === 1 ? 'bettor' : 'bettors'}</span>
            </div>
          </div>

          {/* Outcome Selection */}
          <div className="mb-5">
            <label className="text-sm text-gray-400 mb-3 block">What was the actual outcome?</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setOutcome(true); setError(''); }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${outcome === true
                    ? 'border-arena-green bg-arena-green/10 shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                    : 'border-arena-border hover:border-arena-green/50 bg-arena-card'
                  }`}
              >
                <span className="text-2xl mb-1 block">✅</span>
                <span className={`font-bold text-lg ${outcome === true ? 'text-arena-green' : 'text-gray-300'}`}>YES</span>
                <span className="text-xs text-gray-400 block mt-1">It happened</span>
              </button>

              <button
                onClick={() => { setOutcome(false); setError(''); }}
                className={`p-4 rounded-xl border-2 transition-all duration-200 text-center
                  ${outcome === false
                    ? 'border-red-500 bg-red-500/10 shadow-[0_0_20px_rgba(255,68,68,0.2)]'
                    : 'border-arena-border hover:border-red-500/50 bg-arena-card'
                  }`}
              >
                <span className="text-2xl mb-1 block">❌</span>
                <span className={`font-bold text-lg ${outcome === false ? 'text-red-400' : 'text-gray-300'}`}>NO</span>
                <span className="text-xs text-gray-400 block mt-1">It didn&apos;t happen</span>
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span className="text-xs text-red-400">{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleResolve}
            disabled={isResolving || outcome === null}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-300
                       disabled:opacity-40 disabled:cursor-not-allowed
                       bg-gradient-to-r from-arena-gold to-yellow-500 text-black
                       hover:shadow-[0_0_30px_rgba(255,215,0,0.4)]
                       active:scale-[0.98]"
          >
            {isResolving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Resolving...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Gavel className="w-4 h-4" /> Resolve Market
              </span>
            )}
          </button>

          <p className="text-[10px] text-gray-600 text-center mt-3">
            This action is permanent. Once resolved, the outcome cannot be changed and winners can claim payouts.
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
