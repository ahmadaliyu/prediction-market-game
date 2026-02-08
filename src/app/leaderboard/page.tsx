'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Flame, Bot, Loader2, RefreshCw } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { useWalletContext } from '@/contexts/WalletContext';
import { shortenAddress } from '@/lib/utils';

interface LeaderboardEntry {
  address: string;
  totalBet: string;
  totalWon: string;
  wins: number;
  losses: number;
  bets: number;
  winRate: number;
  pnl: string;
}

export default function LeaderboardPage() {
  const { contracts } = useWalletContext();
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    if (!contracts.contractsAvailable) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await contracts.getLeaderboard();
      const entries: LeaderboardEntry[] = data.map((p) => ({
        ...p,
        winRate: p.bets > 0 ? (p.wins / p.bets) * 100 : 0,
        pnl: (parseFloat(p.totalWon) - parseFloat(p.totalBet)).toFixed(4),
      }));
      setPlayers(entries);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  }, [contracts]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <main className="min-h-screen bg-arena-surface">
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="w-8 h-8 text-arena-gold" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
          <p className="text-gray-400">Top predictors ranked by performance</p>
          <button
            onClick={loadLeaderboard}
            disabled={loading}
            className="mt-3 p-2 rounded-lg border border-arena-border hover:border-arena-primary/50 transition-colors inline-flex"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-arena-primary animate-spin" />
          </div>
        ) : players.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No players yet</h2>
            <p className="text-gray-400 text-sm">
              Create markets and place bets to start climbing the leaderboard.
            </p>
          </div>
        ) : (
        <>
        {/* Top 3 podium */}
        {players.length >= 1 && (
        <div className={`grid gap-4 mb-8 ${players.length >= 3 ? 'grid-cols-3' : players.length === 2 ? 'grid-cols-2' : 'grid-cols-1 max-w-sm mx-auto'}`}>
          {players.slice(0, 3).map((player, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const glows = ['shadow-[0_0_30px_rgba(255,215,0,0.3)]', 'shadow-[0_0_20px_rgba(192,192,192,0.3)]', 'shadow-[0_0_20px_rgba(205,127,50,0.3)]'];
            const pnlNum = parseFloat(player.pnl);
            return (
              <motion.div
                key={player.address}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                className={`bg-arena-card border border-arena-border rounded-2xl p-5 text-center 
                           ${i === 0 ? 'row-start-1 ' + glows[0] : glows[i]} relative`}
              >
                <span className="text-3xl mb-2 block">{medals[i]}</span>
                <h3 className="font-bold text-white text-sm">{shortenAddress(player.address, 6)}</h3>
                <div className="space-y-2 mt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-arena-green font-bold">{player.winRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">W/L</span>
                    <span className="text-white font-bold">{player.wins}/{player.losses}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">P&L</span>
                    <span className={`font-bold ${pnlNum >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
                      {pnlNum >= 0 ? '+' : ''}{player.pnl} AVAX
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
        )}

        {/* Full Leaderboard Table */}
        <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-arena-border">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rank</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Player</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Win Rate</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">W/L</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Total Bet</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Total Won</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">P&L</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => {
                  const pnlNum = parseFloat(player.pnl);
                  return (
                  <motion.tr
                    key={player.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-arena-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-arena-gold' : 'text-gray-400'}`}>
                        #{i + 1}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-sm text-white font-medium font-mono">{shortenAddress(player.address, 6)}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-arena-green font-medium">{player.winRate.toFixed(1)}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-white">
                        {player.wins}/{player.losses}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-300">{player.totalBet} AVAX</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-300">{player.totalWon} AVAX</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-medium ${pnlNum >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
                        {pnlNum >= 0 ? '+' : ''}{player.pnl}
                      </span>
                    </td>
                  </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        </>
        )}
      </div>
    </main>
  );
}
