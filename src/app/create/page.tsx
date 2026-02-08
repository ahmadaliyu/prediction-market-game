'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Calendar, Tag, ImageIcon, Loader2, CheckCircle } from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { CATEGORIES } from '@/lib/constants';
import { useWallet } from '@/hooks/useWallet';

export default function CreatePage() {
  const { isConnected } = useWallet();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('crypto');
  const [endDate, setEndDate] = useState('');
  const [imageURI, setImageURI] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);

  const handleCreate = async () => {
    if (!question || !endDate) return;

    setIsCreating(true);
    try {
      // In production this would call the smart contract
      await new Promise((r) => setTimeout(r, 2000));
      setCreated(true);
    } catch (err) {
      console.error('Failed to create market:', err);
    } finally {
      setIsCreating(false);
    }
  };

  if (created) {
    return (
      <main className="min-h-screen bg-arena-surface">
        <Navbar />
        <div className="pt-20 max-w-2xl mx-auto px-4 pb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <CheckCircle className="w-16 h-16 text-arena-green mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Market Created!</h2>
            <p className="text-gray-400 mb-6">Your prediction market is now live on the arena.</p>
            <div className="flex gap-3 justify-center">
              <a
                href="/markets"
                className="px-6 py-3 bg-arena-primary text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                View Markets
              </a>
              <button
                onClick={() => {
                  setCreated(false);
                  setQuestion('');
                  setEndDate('');
                  setImageURI('');
                }}
                className="px-6 py-3 border border-arena-border text-white rounded-xl hover:border-arena-primary/50 transition-all"
              >
                Create Another
              </button>
            </div>
          </motion.div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-arena-surface">
      <Navbar />

      <div className="pt-20 max-w-2xl mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <PlusCircle className="w-7 h-7 text-arena-primary" />
            <h1 className="text-3xl font-bold text-white">Create Market</h1>
          </div>
          <p className="text-gray-400">Launch a new prediction market for the arena</p>
        </motion.div>

        {!isConnected ? (
          <div className="bg-arena-card border border-arena-border rounded-2xl p-8 text-center">
            <p className="text-gray-400 mb-4">Connect your wallet to create a market</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Question */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Question *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Will AVAX reach $100 by March 2026?"
                rows={3}
                className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 
                           transition-colors resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Phrase as a yes/no question that can be objectively resolved.
              </p>
            </div>

            {/* Category */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" /> Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      category === cat.id
                        ? 'border-2'
                        : 'bg-arena-surface text-gray-400 border-2 border-transparent hover:text-white'
                    }`}
                    style={
                      category === cat.id
                        ? {
                            backgroundColor: `${cat.color}15`,
                            color: cat.color,
                            borderColor: `${cat.color}50`,
                          }
                        : {}
                    }
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* End Date */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> End Date *
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                           focus:outline-none focus:border-arena-primary/50 transition-colors
                           [color-scheme:dark]"
              />
            </div>

            {/* Image URI */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Image URL (optional)
              </label>
              <input
                type="url"
                value={imageURI}
                onChange={(e) => setImageURI(e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 transition-colors"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={isCreating || !question || !endDate}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         bg-gradient-to-r from-arena-primary to-arena-secondary text-black
                         hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                         active:scale-[0.98]"
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Market...
                </span>
              ) : (
                'Create Prediction Market'
              )}
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
