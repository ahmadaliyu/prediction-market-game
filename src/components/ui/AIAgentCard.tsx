'use client';

import { motion } from 'framer-motion';
import { AIAgentDisplay } from '@/lib/types';
import { Target, Zap, Brain, Shuffle, Activity } from 'lucide-react';

const personalityIcons = {
  aggressive: Zap,
  conservative: Target,
  balanced: Brain,
  chaotic: Shuffle,
};

interface AIAgentCardProps {
  agent: AIAgentDisplay;
  index?: number;
}

export default function AIAgentCard({ agent, index = 0 }: AIAgentCardProps) {
  const Icon = personalityIcons[agent.personality] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.12, duration: 0.5, type: 'spring', stiffness: 100 }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.25 } }}
      className="relative bg-arena-card border border-arena-border rounded-xl p-4 
                 transition-all duration-300 group overflow-hidden holo-shine"
      style={{ borderColor: `${agent.color}30` }}
    >
      {/* Animated background pulse */}
      <motion.div
        animate={{
          opacity: [0.03, 0.08, 0.03],
          scale: [1, 1.2, 1],
        }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="absolute inset-0 rounded-xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${agent.color}, transparent 70%)`,
        }}
      />

      {/* Status indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="flex items-center gap-1 text-[10px]"
          style={{ color: agent.color }}
        >
          <Activity className="w-3 h-3" />
          <span>ACTIVE</span>
        </motion.div>
      </div>

      <div className="relative flex items-start gap-3">
        {/* Avatar */}
        <motion.div
          whileHover={{ rotate: [0, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl 
                     group-hover:scale-110 transition-transform duration-300 relative"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          {agent.avatarURI}
          {/* Ring pulse */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ repeat: Infinity, duration: 3 }}
            className="absolute inset-0 rounded-xl border"
            style={{ borderColor: agent.color }}
          />
        </motion.div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm group-hover:text-glow-sm transition-all" style={{ color: agent.color }}>
              {agent.name}
            </h3>
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
            >
              <Icon className="w-3 h-3" />
              {agent.personality}
            </motion.div>
          </div>

          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{agent.description}</p>

          {/* Stats with animated bars */}
          <div className="flex items-center gap-3">
            <div>
              <span className="text-[10px] text-gray-500 block">Accuracy</span>
              <span className="text-xs font-bold" style={{ color: agent.color }}>
                {agent.accuracy}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">Predictions</span>
              <span className="text-xs font-bold text-white">{agent.totalPredictions}</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 block">Correct</span>
              <span className="text-xs font-bold text-arena-green">{agent.correctPredictions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Current bet */}
      {agent.currentBet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-arena-border/50"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Current Position</span>
            <div className="flex items-center gap-2">
              <motion.span
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  agent.currentBet.position === 'YES'
                    ? 'bg-arena-green/20 text-arena-green'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {agent.currentBet.position}
              </motion.span>
              <span className="text-[10px] text-gray-400">{agent.currentBet.confidence}% confidence</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${agent.color}, transparent)` }}
      />
    </motion.div>
  );
}
