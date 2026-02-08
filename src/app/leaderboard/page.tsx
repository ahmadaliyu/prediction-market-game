'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, TrendingUp, Flame, Bot } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { useLeaderboardStore } from '@/store';

export default function LeaderboardPage() {
  const players = useLeaderboardStore((s) => s.players);

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
          <p className="text-gray-400">Top predictors and AI agents ranked by performance</p>
        </motion.div>

        {players.length === 0 ? (
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
        <div className="grid grid-cols-3 gap-4 mb-8">
          {players.slice(0, 3).map((player, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const glows = ['shadow-[0_0_30px_rgba(255,215,0,0.3)]', 'shadow-[0_0_20px_rgba(192,192,192,0.3)]', 'shadow-[0_0_20px_rgba(205,127,50,0.3)]'];
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
                <div className="flex items-center justify-center gap-1 mb-1">
                  {player.isAI && <Bot className="w-3 h-3 text-arena-primary" />}
                  <h3 className="font-bold text-white text-sm">{player.name}</h3>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-3">{player.address}</p>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-arena-green font-bold">{player.winRate}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">P&L</span>
                    <span className={`font-bold ${player.pnl.startsWith('+') ? 'text-arena-green' : 'text-red-400'}`}>
                      {player.pnl} AVAX
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Streak</span>
                    <span className="text-arena-gold font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3" /> {player.currentStreak}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

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
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Volume</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">P&L</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Streak</th>
                </tr>
              </thead>
              <tbody>
                {players.map((player, i) => (
                  <motion.tr
                    key={player.address}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-arena-border/50 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <span className={`text-sm font-bold ${i < 3 ? 'text-arena-gold' : 'text-gray-400'}`}>
                        #{player.rank}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {player.isAI && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] bg-arena-primary/20 text-arena-primary font-medium">
                            AI
                          </span>
                        )}
                        <span className="text-sm text-white font-medium">{player.name}</span>
                        <span className="text-xs text-gray-500 font-mono">{player.address}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-arena-green font-medium">{player.winRate}%</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-white">
                        {player.totalWins}/{player.totalBets}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className="text-sm text-gray-300">{player.totalAmountBet} AVAX</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-medium ${player.pnl.startsWith('+') ? 'text-arena-green' : 'text-red-400'}`}>
                        {player.pnl}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {player.currentStreak > 0 && <Flame className="w-3 h-3 text-orange-400" />}
                        <span className="text-sm text-white">{player.currentStreak}</span>
                        <span className="text-[10px] text-gray-500">(best: {player.bestStreak})</span>
                      </div>
                    </td>
                  </motion.tr>
                ))}
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
