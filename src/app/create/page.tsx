'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  Calendar,
  Tag,
  ImageIcon,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  Info,
  Lock,
  Globe,
  Bot,
  User,
  Coins,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import Navbar from '@/components/ui/Navbar';
import { CATEGORIES } from '@/lib/constants';
import { useWalletContext } from '@/contexts/WalletContext';
import { useMarketStore } from '@/store';

type MarketType = 'public' | 'private';
type ResolutionType = 'ai' | 'manual';

interface OutcomeInput {
  id: number;
  label: string;
  probability: number;
}

export default function CreatePage() {
  const { isConnected, isCorrectChain, contracts, balance } = useWalletContext();
  const addMarket = useMarketStore((s) => s.addMarket);

  // Basic info
  const [question, setQuestion] = useState('');
  const [rules, setRules] = useState('');
  const [category, setCategory] = useState('crypto');
  const [imageURI, setImageURI] = useState('');

  // Market type
  const [marketType, setMarketType] = useState<MarketType>('public');
  const [accessCode, setAccessCode] = useState('');

  // Outcomes
  const [outcomes, setOutcomes] = useState<OutcomeInput[]>([
    { id: 1, label: '', probability: 50 },
    { id: 2, label: '', probability: 50 },
  ]);
  const [nextId, setNextId] = useState(3);

  // Schedule
  const [launchNow, setLaunchNow] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Resolution
  const [resolutionType, setResolutionType] = useState<ResolutionType>('manual');

  // Liquidity
  const [initialLiquidity, setInitialLiquidity] = useState('');
  const [showLiquiditySection, setShowLiquiditySection] = useState(false);

  // UI state
  const [isCreating, setIsCreating] = useState(false);
  const [created, setCreated] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  // Calculate total probability (must equal 100 including unclassified)
  const totalProbability = useMemo(() => {
    return outcomes.reduce((sum, o) => sum + o.probability, 0);
  }, [outcomes]);

  const unclassifiedProbability = Math.max(0, 100 - totalProbability);

  // Add outcome
  const addOutcome = () => {
    if (outcomes.length >= 10) return;
    const newProb = Math.floor(100 / (outcomes.length + 2)); // Account for unclassified
    const adjusted = outcomes.map((o) => ({ ...o, probability: newProb }));
    setOutcomes([...adjusted, { id: nextId, label: '', probability: newProb }]);
    setNextId(nextId + 1);
  };

  // Remove outcome
  const removeOutcome = (id: number) => {
    if (outcomes.length <= 2) return;
    const filtered = outcomes.filter((o) => o.id !== id);
    // Redistribute probability
    const perOutcome = Math.floor(99 / filtered.length);
    setOutcomes(filtered.map((o) => ({ ...o, probability: perOutcome })));
  };

  // Update outcome
  const updateOutcome = (id: number, field: 'label' | 'probability', value: string | number) => {
    setOutcomes(
      outcomes.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  };

  // Validate form
  const isValid = useMemo(() => {
    if (!question.trim()) return false;
    if (question.length > 150) return false;
    if (rules.length > 1000) return false;
    if (!endDate) return false;
    if (outcomes.some((o) => !o.label.trim())) return false;
    if (marketType === 'private' && !accessCode.trim()) return false;
    return true;
  }, [question, rules, endDate, outcomes, marketType, accessCode]);

  const handleCreate = async () => {
    if (!isValid) return;
    if (!isConnected) {
      setError('Please connect your wallet first');
      return;
    }
    if (!isCorrectChain) {
      setError('Please switch to the correct network');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const startTimestamp = launchNow
        ? Math.floor(Date.now() / 1000)
        : Math.floor(new Date(startDate).getTime() / 1000);
      const endTimestamp = Math.floor(new Date(endDate).getTime() / 1000);

      if (endTimestamp <= startTimestamp) {
        setError('End time must be after start time');
        setIsCreating(false);
        return;
      }

      // Prepare outcomes (contract adds Unclassified automatically)
      const outcomeLabels = outcomes.map((o) => o.label.trim());

      const receipt = await contracts.createMarket(
        question.trim(),
        rules.trim(),
        imageURI.trim(),
        category,
        outcomeLabels,
        startTimestamp,
        endTimestamp,
        marketType === 'private',
        marketType === 'private' ? accessCode : '',
        resolutionType === 'ai' ? 1 : 0,
        initialLiquidity || '0'
      );

      setTxHash(receipt.hash || '');

      // Refresh markets
      const allMarkets = await contracts.getAllMarkets();
      if (allMarkets.length > 0) {
        const newMarket = allMarkets[allMarkets.length - 1];
        addMarket(newMarket);
      }

      setCreated(true);
    } catch (err) {
      console.error('Failed to create market:', err);
      const msg = err instanceof Error ? err.message : 'Failed to create market';
      if (msg.includes('user rejected')) {
        setError('Transaction was rejected');
      } else if (msg.includes('insufficient funds')) {
        setError('Insufficient funds for transaction');
      } else {
        setError(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setCreated(false);
    setQuestion('');
    setRules('');
    setEndDate('');
    setStartDate('');
    setImageURI('');
    setOutcomes([
      { id: 1, label: '', probability: 50 },
      { id: 2, label: '', probability: 50 },
    ]);
    setAccessCode('');
    setInitialLiquidity('');
    setError('');
    setTxHash('');
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
            <p className="text-gray-400 mb-6">Your prediction market is now live.</p>
            {txHash && (
              <p className="text-xs text-gray-500 mb-4 font-mono">
                Tx:{' '}
                <a
                  href={`https://testnet.snowtrace.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-arena-primary hover:underline"
                >
                  {txHash.slice(0, 10)}...{txHash.slice(-8)}
                </a>
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <a
                href="/markets"
                className="px-6 py-3 bg-arena-primary text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all"
              >
                View Markets
              </a>
              <button
                onClick={resetForm}
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
          <p className="text-gray-400">
            Launch a new prediction market • Earn 1.2% of trading volume
          </p>
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
            {/* Market Type */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Market Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMarketType('public')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    marketType === 'public'
                      ? 'border-arena-primary bg-arena-primary/10'
                      : 'border-arena-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-5 h-5 text-arena-primary" />
                    <span className="font-bold text-white">Public</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Anyone can access. AI or manual resolution.
                  </p>
                </button>
                <button
                  onClick={() => setMarketType('private')}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    marketType === 'private'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-arena-border hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="w-5 h-5 text-purple-400" />
                    <span className="font-bold text-white">Private</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Access code required. Creator resolves.
                  </p>
                </button>
              </div>

              {/* Access Code for Private */}
              <AnimatePresence>
                {marketType === 'private' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4"
                  >
                    <label className="text-sm font-medium text-gray-300 mb-2 block">
                      Access Code *
                    </label>
                    <input
                      type="text"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="Enter a secret code for participants"
                      className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                                 placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Question */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Market Question *
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value.slice(0, 150))}
                placeholder='Will the price of Bitcoin (BTC) exceed $200,000 USDT on Binance by December 31, 2026, at 23:59 UTC?'
                rows={3}
                className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 
                           transition-colors resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Phrase as a clear, verifiable question.
                </p>
                <span className={`text-xs ${question.length >= 150 ? 'text-red-400' : 'text-gray-500'}`}>
                  {question.length}/150
                </span>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 block">
                Market Rules
              </label>
              <textarea
                value={rules}
                onChange={(e) => setRules(e.target.value.slice(0, 1000))}
                placeholder="Define the exact criteria that determine the winning outcome. Be specific about data sources, time zones, and edge cases to prevent disputes later."
                rows={4}
                className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                           placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 
                           transition-colors resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-xs text-gray-500">
                  Clear rules help avoid disputes.
                </p>
                <span className={`text-xs ${rules.length >= 1000 ? 'text-red-400' : 'text-gray-500'}`}>
                  {rules.length}/1000
                </span>
              </div>
            </div>

            {/* Category */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400" /> Category *
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

            {/* Outcomes */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-3 block">
                Outcomes *
              </label>
              <div className="space-y-3">
                {outcomes.map((outcome, index) => (
                  <div key={outcome.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={outcome.label}
                      onChange={(e) => updateOutcome(outcome.id, 'label', e.target.value)}
                      placeholder={`Outcome ${index + 1} (e.g., "Yes", "Before March", etc.)`}
                      className="flex-1 px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                                 placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 transition-colors"
                    />
                    {outcomes.length > 2 && (
                      <button
                        onClick={() => removeOutcome(outcome.id)}
                        className="p-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                {/* Unclassified (always shown, not editable) */}
                <div className="flex gap-2 items-center opacity-60">
                  <div className="flex-1 px-4 py-3 bg-arena-surface/50 border border-arena-border rounded-xl text-gray-400">
                    Unclassified (mandatory fallback)
                  </div>
                  <div className="p-3 opacity-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                </div>

                {outcomes.length < 10 && (
                  <button
                    onClick={addOutcome}
                    className="w-full py-3 border border-dashed border-arena-border rounded-xl text-gray-400 
                               hover:border-arena-primary/50 hover:text-arena-primary transition-colors flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Add Outcome
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-start gap-1">
                <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                "Unclassified" is a mandatory fallback if the event is cancelled, rules are ambiguous, or the result doesn't match any option.
              </p>
            </div>

            {/* Schedule */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" /> Schedule
              </label>

              {/* Start Time */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Start Time</span>
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => setLaunchNow(true)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      launchNow
                        ? 'bg-arena-primary/20 text-arena-primary border border-arena-primary/40'
                        : 'bg-arena-surface text-gray-400 border border-arena-border hover:text-white'
                    }`}
                  >
                    Launch Now
                  </button>
                  <button
                    onClick={() => setLaunchNow(false)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                      !launchNow
                        ? 'bg-arena-primary/20 text-arena-primary border border-arena-primary/40'
                        : 'bg-arena-surface text-gray-400 border border-arena-border hover:text-white'
                    }`}
                  >
                    Schedule
                  </button>
                </div>
                <AnimatePresence>
                  {!launchNow && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                                   focus:outline-none focus:border-arena-primary/50 transition-colors [color-scheme:dark]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* End Time */}
              <div>
                <span className="text-sm text-gray-400 block mb-2">End Time *</span>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                             focus:outline-none focus:border-arena-primary/50 transition-colors [color-scheme:dark]"
                />
                <p className="text-xs text-gray-500 mt-1">
                  After this time, no new predictions can be made.
                </p>
              </div>
            </div>

            {/* Resolution */}
            {marketType === 'public' && (
              <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
                <label className="text-sm font-medium text-gray-300 mb-3 block">
                  Resolution Method
                </label>
                <div className="space-y-3">
                  <button
                    onClick={() => setResolutionType('ai')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      resolutionType === 'ai'
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-arena-border hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Bot className="w-5 h-5 text-blue-400" />
                      <span className="font-bold text-white">AI-Powered Resolution</span>
                      <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                        Recommended
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      The AI Oracle verifies the result across multiple data sources to automatically resolve the market.
                    </p>
                    <div className="mt-2 flex items-start gap-1 text-xs text-yellow-500/80">
                      <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      Your question and rules must be strictly fact-based and unambiguous.
                    </div>
                  </button>

                  <button
                    onClick={() => setResolutionType('manual')}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                      resolutionType === 'manual'
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-arena-border hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-5 h-5 text-purple-400" />
                      <span className="font-bold text-white">Manual Resolution</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      You determine the winner and earn the full creator fee.
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Image URI */}
            <div className="bg-arena-card border border-arena-border rounded-2xl p-5">
              <label className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Cover Image (optional)
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

            {/* Liquidity Section (collapsible) */}
            <div className="bg-arena-card border border-arena-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setShowLiquiditySection(!showLiquiditySection)}
                className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-arena-primary" />
                  <span className="text-sm font-medium text-gray-300">
                    Initial Liquidity (optional)
                  </span>
                </div>
                {showLiquiditySection ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <AnimatePresence>
                {showLiquiditySection && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-400">Amount (AVAX)</span>
                          {balance && (
                            <span className="text-xs text-gray-500">
                              Balance: {parseFloat(balance).toFixed(4)} AVAX
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          value={initialLiquidity}
                          onChange={(e) => setInitialLiquidity(e.target.value)}
                          placeholder="0.0"
                          min="0"
                          step="0.1"
                          className="w-full px-4 py-3 bg-arena-surface border border-arena-border rounded-xl text-white 
                                     placeholder-gray-500 focus:outline-none focus:border-arena-primary/50 transition-colors"
                        />
                      </div>

                      <div className="bg-arena-surface/50 rounded-lg p-3 text-xs text-gray-400">
                        <p className="mb-2">
                          Liquidity is distributed across all outcomes. Higher liquidity = better odds for bettors.
                        </p>
                        <div className="flex justify-between">
                          <span>Platform Fee (0.8%)</span>
                          <span>{initialLiquidity ? (parseFloat(initialLiquidity) * 0.008).toFixed(6) : '0'} AVAX</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="text-sm text-red-400">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              onClick={handleCreate}
              disabled={isCreating || !isValid}
              className="w-full py-4 rounded-xl font-bold text-sm transition-all duration-300
                         disabled:opacity-40 disabled:cursor-not-allowed
                         bg-arena-primary text-black
                         hover:shadow-[0_0_20px_rgba(0,212,232,0.3)]
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

            {/* Creator earnings note */}
            <p className="text-center text-xs text-gray-500">
              As the market creator, you'll earn 1.2% of all trading volume.
            </p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
