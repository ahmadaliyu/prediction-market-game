"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle } from "lucide-react";
import type { MarketDisplay } from "@/lib/types";

interface ResolvePanelProps {
  market: MarketDisplay;
  onResolve: (winningOutcome: number) => Promise<void>;
  isOwner: boolean;
}

export default function ResolvePanel({
  market,
  onResolve,
  isOwner,
}: ResolvePanelProps) {
  const [selectedOutcome, setSelectedOutcome] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user can resolve this market
  const canResolve =
    market.resolutionType === 0
      ? isOwner // Manual resolution - only creator
      : false; // AI Oracle - handled differently (not implemented yet)

  const handleResolve = async () => {
    if (selectedOutcome === null) {
      setError("Please select a winning outcome");
      return;
    }

    setError(null);
    setIsResolving(true);

    try {
      await onResolve(selectedOutcome);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (err: any) {
      console.error("Resolution error:", err);
      setError(err.message || "Failed to resolve market");
    } finally {
      setIsResolving(false);
    }
  };

  if (market.resolved) {
    return (
      <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Market Resolved</h3>
            <p className="text-sm text-gray-400">
              Winning Outcome:{" "}
              {market.outcomes[market.winningOutcome]?.label || "Unknown"}
            </p>
          </div>
        </div>
        <div className="text-sm text-gray-300">
          Winners can claim their payouts from their portfolio.
        </div>
      </div>
    );
  }

  if (!canResolve) {
    return (
      <div className="bg-gray-500/10 rounded-xl p-6 border border-gray-500/30">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-gray-500/20 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-white">Resolution Pending</h3>
        </div>
        <p className="text-sm text-gray-300">
          {market.resolutionType === 0
            ? "Only the market creator can resolve this market."
            : "This market uses AI Oracle resolution (coming soon)."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute inset-0 bg-green-500/90 rounded-xl flex items-center justify-center z-10"
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 flex items-center justify-center"
              >
                <Check className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-xl font-bold text-white">Market Resolved!</h3>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
          <Check className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Resolve Market</h3>
          <p className="text-sm text-gray-400">
            Select the winning outcome to finalize this market
          </p>
        </div>
      </div>

      {/* Outcome Selection */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Select Winning Outcome
        </label>
        <div className="grid gap-2">
          {market.outcomes.map((outcome) => (
            <motion.button
              key={outcome.index}
              onClick={() => setSelectedOutcome(outcome.index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative overflow-hidden rounded-lg p-4 border-2 transition-all
                ${
                  selectedOutcome === outcome.index
                    ? "border-purple-500 bg-purple-500/20"
                    : "border-gray-600 bg-gray-800/50 hover:border-gray-500"
                }
              `}
            >
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center
                    ${
                      selectedOutcome === outcome.index
                        ? "border-purple-500 bg-purple-500"
                        : "border-gray-500"
                    }
                  `}
                  >
                    {selectedOutcome === outcome.index && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-2 h-2 rounded-full bg-white"
                      />
                    )}
                  </div>
                  <span className="font-medium text-white">
                    {outcome.label}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-white">
                    {outcome.pool}
                  </div>
                  <div className="text-xs text-gray-400">
                    {outcome.percent}%
                  </div>
                </div>
              </div>

              {/* Background bar */}
              <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-medium text-white mb-1">Important</p>
            <ul className="list-disc list-inside space-y-1 text-gray-400">
              <li>This action is final and cannot be undone</li>
              <li>Winners will be able to claim their payouts</li>
              <li>You will receive 1.2% of the total trading volume</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Resolve Button */}
      <motion.button
        onClick={handleResolve}
        disabled={isResolving || selectedOutcome === null}
        whileHover={{ scale: selectedOutcome !== null ? 1.02 : 1 }}
        whileTap={{ scale: selectedOutcome !== null ? 0.98 : 1 }}
        className={`
          w-full py-4 rounded-xl font-bold text-lg transition-all
          ${
            selectedOutcome !== null && !isResolving
              ? "bg-purple-500 text-white hover:shadow-lg hover:shadow-purple-500/30"
              : "bg-gray-700 text-gray-400 cursor-not-allowed"
          }
        `}
      >
        {isResolving ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Resolving...</span>
          </div>
        ) : (
          "Resolve Market"
        )}
      </motion.button>

      {selectedOutcome !== null && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-sm text-gray-400"
        >
          Selected:{" "}
          <span className="text-white font-medium">
            {market.outcomes[selectedOutcome]?.label}
          </span>
        </motion.div>
      )}
    </div>
  );
}
