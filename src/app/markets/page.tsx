'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import MarketCard from '@/components/ui/MarketCard';
import BettingPanel from '@/components/ui/BettingPanel';
import { useMarketStore, useAppStore } from '@/store';
import { CATEGORIES } from '@/lib/constants';
import { MarketDisplay } from '@/lib/types';

export default function MarketsPage() {
  const markets = useMarketStore((s) => s.filteredMarkets);
  const selectedCategory = useMarketStore((s) => s.selectedCategory);
  const setCategory = useMarketStore((s) => s.setCategory);
  const searchQuery = useMarketStore((s) => s.searchQuery);
  const setSearchQuery = useMarketStore((s) => s.setSearchQuery);
  const sortBy = useMarketStore((s) => s.sortBy);
  const setSortBy = useMarketStore((s) => s.setSortBy);

  const selectedMarketId = useAppStore((s) => s.selectedMarketId);
  const showBettingPanel = useAppStore((s) => s.showBettingPanel);
  const selectMarket = useAppStore((s) => s.selectMarket);

  const selectedMarket = markets.find((m: MarketDisplay) => m.id === selectedMarketId);
  const [showFilters, setShowFilters] = useState(false);

  const handlePlaceBet = async (position: boolean, amount: string) => {
    console.log('Placing bet:', { position, amount, marketId: selectedMarketId });
    await new Promise((r) => setTimeout(r, 2000));
    alert(`Bet placed! ${amount} AVAX on ${position ? 'YES' : 'NO'}`);
  };

  return (
    <main className="min-h-screen bg-arena-surface">
      <Navbar />

      <div className="pt-20 max-w-7xl mx-auto px-4 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Prediction Markets</h1>
          <p className="text-gray-400">Browse and bet on active prediction markets</p>
        </motion.div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets..."
              className="w-full pl-10 pr-4 py-2.5 bg-arena-card border border-arena-border rounded-xl text-sm text-white 
                         placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'volume' | 'ending')}
              className="px-3 py-2.5 bg-arena-card border border-arena-border rounded-xl text-sm text-white 
                         focus:outline-none focus:border-arena-primary/50 appearance-none cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="volume">Highest Volume</option>
              <option value="ending">Ending Soon</option>
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2.5 rounded-xl border transition-colors ${
                showFilters
                  ? 'bg-arena-primary/10 border-arena-primary/40 text-arena-primary'
                  : 'bg-arena-card border-arena-border text-gray-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCategory('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-arena-primary/20 text-arena-primary border border-arena-primary/40'
                    : 'bg-arena-card text-gray-400 border border-arena-border hover:text-white'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedCategory === cat.id
                      ? 'border'
                      : 'bg-arena-card text-gray-400 border border-arena-border hover:text-white'
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: `${cat.color}20`, color: cat.color, borderColor: `${cat.color}40` }
                      : {}
                  }
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Markets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {markets.map((market: MarketDisplay, i: number) => (
            <MarketCard
              key={market.id}
              market={market}
              index={i}
              onClick={() => selectMarket(market.id)}
            />
          ))}
        </div>

        {markets.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No markets found</p>
            <p className="text-gray-600 text-sm mt-1">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Betting Panel */}
      {showBettingPanel && selectedMarket && (
        <BettingPanel market={selectedMarket} onPlaceBet={handlePlaceBet} />
      )}
    </main>
  );
}
