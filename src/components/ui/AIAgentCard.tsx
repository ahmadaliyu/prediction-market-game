'use client';

import { motion } from 'framer-motion';
import { AIAgentDisplay } from '@/lib/types';
import { Target, Zap, Brain, Shuffle } from 'lucide-react';

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
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-arena-card border border-arena-border rounded-xl p-4 hover:border-opacity-60 
                 transition-all duration-300 group"
      style={{ borderColor: `${agent.color}30` }}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl 
                     group-hover:scale-110 transition-transform duration-200"
          style={{ backgroundColor: `${agent.color}20` }}
        >
          {agent.avatarURI}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-sm" style={{ color: agent.color }}>
              {agent.name}
            </h3>
            <div
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium"
              style={{ backgroundColor: `${agent.color}15`, color: agent.color }}
            >
              <Icon className="w-3 h-3" />
              {agent.personality}
            </div>
          </div>

          <p className="text-xs text-gray-400 mb-2 line-clamp-1">{agent.description}</p>

          {/* Stats */}
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
        <div className="mt-3 pt-3 border-t border-arena-border/50">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-gray-500">Current Position</span>
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                  agent.currentBet.position === 'YES'
                    ? 'bg-arena-green/20 text-arena-green'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {agent.currentBet.position}
              </span>
              <span className="text-[10px] text-gray-400">{agent.currentBet.confidence}% confidence</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
