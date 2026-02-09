'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { useWalletContext } from '@/contexts/WalletContext';
import { BetDisplay } from '@/lib/types';
import { calculatePayout } from '@/lib/utils';

export default function PortfolioPage() {
  const { isConnected, address, balance, contracts } = useWalletContext();
  const [userBets, setUserBets] = useState<BetDisplay[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  const loadBets = useCallback(async () => {
    if (!address || !contracts.contractsAvailable) return;
    setLoading(true);
    try {
      const bets = await contracts.getUserBets(address);
      // Enrich with potential payout
      const enriched = bets.map((bet) => {
        if (bet.market) {
          const payout = calculatePayout(bet.amount, bet.outcomeIndex, bet.market);
          return { ...bet, potentialPayout: payout };
        }
        return bet;
      });
      setUserBets(enriched);
    } catch (err) {
      console.error('Failed to load bets:', err);
    } finally {
      setLoading(false);
    }
  }, [address, contracts]);

  useEffect(() => {
    if (isConnected && address) {
      loadBets();
    }
  }, [isConnected, address, loadBets]);

  const handleClaim = async (marketId: number) => {
    setClaimingId(marketId);
    try {
      await contracts.claimWinnings(marketId);
      await loadBets(); // Refresh
    } catch (err) {
      console.error('Failed to claim:', err);
    } finally {
      setClaimingId(null);
    }
  };

  const activeBets = userBets.filter((b) => b.market && b.market.status === 'active');
  const resolvedBets = userBets.filter((b) => b.market && b.market.status !== 'active');

  const totalBet = userBets.reduce((acc, b) => acc + parseFloat(b.amount), 0);
  const totalWon = resolvedBets
    .filter((b) => b.market?.resolved && b.market?.winningOutcome === b.outcomeIndex && b.claimed)
    .reduce((acc, b) => acc + parseFloat(b.potentialPayout || '0'), 0);

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-arena-surface">
        <Navbar />
        <div className="pt-20 max-w-5xl mx-auto px-4 pb-12">
          <div className="flex flex-col items-center justify-center py-32">
            <Wallet className="w-16 h-16 text-gray-600 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h2>
            <p className="text-gray-400 text-center max-w-md">
              Connect your wallet to view your portfolio, active bets, and prediction history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-arena-surface">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
            <p className="text-gray-400 font-mono text-sm">{address}</p>
          </div>
          <button
            onClick={loadBets}
            disabled={loading}
            className="p-2 rounded-lg border border-arena-border hover:border-arena-primary/50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p className="text-xl font-bold text-white">{parseFloat(balance).toFixed(3)} AVAX</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Total Bet</p>
            <p className="text-xl font-bold text-white">{totalBet.toFixed(4)} AVAX</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Total Won</p>
            <p className="text-xl font-bold text-arena-green">{totalWon.toFixed(4)} AVAX</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Active Bets</p>
            <p className="text-xl font-bold text-arena-primary">{activeBets.length}</p>
          </motion.div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-arena-primary animate-spin" />
          </div>
        ) : userBets.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No bets yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Place your first bet on a prediction market to see it here.
            </p>
            <a href="/markets" className="inline-block mt-4 px-6 py-2 bg-arena-primary/20 text-arena-primary rounded-lg text-sm hover:bg-arena-primary/30 transition-colors">
              Browse Markets
            </a>
          </div>
        ) : (
          <>
            {/* Active Bets */}
            {activeBets.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-arena-primary" /> Active Bets ({activeBets.length})
                </h2>
                <div className="space-y-3">
                  {activeBets.map((bet, i) => (
                    <motion.div
                      key={bet.marketId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-arena-card border border-arena-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm text-white font-medium mb-1">{bet.market?.question}</p>
                        <div className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-md font-bold ${
                            bet.outcomeIndex === 0 ? 'bg-arena-green/20 text-arena-green' : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {bet.outcomeLabel}
                          </span>
                          <span className="text-gray-400">{bet.amount} AVAX</span>
                          <span className="text-gray-500">•</span>
                          <span className="text-gray-400">{bet.market?.timeRemaining}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Potential Payout</p>
                        <p className="text-sm font-bold text-arena-primary flex items-center gap-1 justify-end">
                          <TrendingUp className="w-3 h-3" /> {bet.potentialPayout || '—'} AVAX
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Bets */}
            {resolvedBets.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-white mb-4">History</h2>
                <div className="space-y-3">
                  {resolvedBets.map((bet, i) => {
                    const won = bet.market?.resolved && bet.market?.winningOutcome === bet.outcomeIndex;
                    return (
                      <motion.div
                        key={bet.marketId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-arena-card border border-arena-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80"
                      >
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium mb-1">{bet.market?.question}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-0.5 rounded-md font-bold ${
                              bet.outcomeIndex === 0 ? 'bg-arena-green/20 text-arena-green' : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {bet.outcomeLabel}
                            </span>
                            <span className="text-gray-400">{bet.amount} AVAX</span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          {won ? (
                            <>
                              {!bet.claimed ? (
                                <button
                                  onClick={() => handleClaim(bet.marketId)}
                                  disabled={claimingId === bet.marketId}
                                  className="px-3 py-1.5 bg-arena-green/20 text-arena-green text-xs font-bold rounded-lg hover:bg-arena-green/30 transition-colors disabled:opacity-50"
                                >
                                  {claimingId === bet.marketId ? 'Claiming...' : 'Claim'}
                                </button>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4 text-arena-green" />
                                  <span className="text-sm font-bold text-arena-green">Won</span>
                                </>
                              )}
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-sm font-bold text-red-400">-{bet.amount} AVAX</span>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
