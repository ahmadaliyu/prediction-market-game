'use client';

import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { useWallet } from '@/hooks/useWallet';

export default function PortfolioPage() {
  const { isConnected, address, balance } = useWallet();

  // Mock user bets
  const userBets = [
    {
      marketId: 0,
      question: 'Will AVAX reach $100 by March 2026?',
      position: 'YES',
      amount: '2.5',
      potentialPayout: '4.85',
      status: 'active',
      timeRemaining: '29d 12h',
    },
    {
      marketId: 1,
      question: 'Will Bitcoin ETF daily volume exceed $10B this week?',
      position: 'NO',
      amount: '1.0',
      potentialPayout: '2.10',
      status: 'active',
      timeRemaining: '6d 18h',
    },
    {
      marketId: 3,
      question: 'Will AI beat the world chess champion?',
      position: 'YES',
      amount: '5.0',
      potentialPayout: '5.68',
      status: 'won',
      winnings: '5.68',
    },
    {
      marketId: 4,
      question: 'Will Ethereum gas fees stay below 10 gwei?',
      position: 'YES',
      amount: '3.0',
      potentialPayout: '0',
      status: 'lost',
    },
  ];

  const totalBet = userBets.reduce((acc, b) => acc + parseFloat(b.amount), 0);
  const totalWon = userBets
    .filter((b) => b.status === 'won')
    .reduce((acc, b) => acc + parseFloat(b.winnings || '0'), 0);
  const activeBets = userBets.filter((b) => b.status === 'active');
  const resolvedBets = userBets.filter((b) => b.status !== 'active');

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
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Portfolio</h1>
          <p className="text-gray-400 font-mono text-sm">{address}</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Balance</p>
            <p className="text-xl font-bold text-white">{parseFloat(balance).toFixed(3)} AVAX</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Total Bet</p>
            <p className="text-xl font-bold text-white">{totalBet.toFixed(2)} AVAX</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">Total Won</p>
            <p className="text-xl font-bold text-arena-green">{totalWon.toFixed(2)} AVAX</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-arena-card border border-arena-border rounded-xl p-4"
          >
            <p className="text-xs text-gray-400 mb-1">P&L</p>
            <p className={`text-xl font-bold ${totalWon - totalBet >= 0 ? 'text-arena-green' : 'text-red-400'}`}>
              {totalWon - totalBet >= 0 ? '+' : ''}{(totalWon - totalBet).toFixed(2)} AVAX
            </p>
          </motion.div>
        </div>

        {/* Active Bets */}
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
                  <p className="text-sm text-white font-medium mb-1">{bet.question}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${
                      bet.position === 'YES' ? 'bg-arena-green/20 text-arena-green' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {bet.position}
                    </span>
                    <span className="text-gray-400">{bet.amount} AVAX</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-400">{bet.timeRemaining}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Potential Payout</p>
                  <p className="text-sm font-bold text-arena-primary flex items-center gap-1 justify-end">
                    <TrendingUp className="w-3 h-3" /> {bet.potentialPayout} AVAX
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* History */}
        <div>
          <h2 className="text-lg font-bold text-white mb-4">History</h2>
          <div className="space-y-3">
            {resolvedBets.map((bet, i) => (
              <motion.div
                key={bet.marketId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-arena-card border border-arena-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-80"
              >
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">{bet.question}</p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-md font-bold ${
                      bet.position === 'YES' ? 'bg-arena-green/20 text-arena-green' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {bet.position}
                    </span>
                    <span className="text-gray-400">{bet.amount} AVAX</span>
                  </div>
                </div>
                <div className="text-right flex items-center gap-2">
                  {bet.status === 'won' ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-arena-green" />
                      <span className="text-sm font-bold text-arena-green">+{bet.winnings} AVAX</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm font-bold text-red-400">-{bet.amount} AVAX</span>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
