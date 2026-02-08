import { NextResponse } from 'next/server';
import { AI_AGENTS } from '@/lib/constants';

interface MarketInput {
  id: number;
  question: string;
  yesPercent: number;
}

// AI Agent decision logic
function makeAIDecision(
  personality: string,
  market: MarketInput
): { position: 'YES' | 'NO'; confidence: number; reasoning: string } {
  const yesPercent = market.yesPercent;

  switch (personality) {
    case 'aggressive':
      // APEX: Follows the trend, high confidence
      return {
        position: yesPercent > 50 ? 'YES' : 'NO',
        confidence: Math.min(95, Math.max(70, yesPercent > 50 ? yesPercent + 10 : (100 - yesPercent) + 10)),
        reasoning: `Strong momentum detected. ${yesPercent > 50 ? 'YES' : 'NO'} position looks dominant.`,
      };

    case 'conservative':
      // GHOST: Only bets when very confident
      const strongSide = yesPercent > 65 || yesPercent < 35;
      return {
        position: yesPercent > 50 ? 'YES' : 'NO',
        confidence: strongSide ? 85 : 45,
        reasoning: strongSide
          ? 'Clear market consensus detected. Entering position.'
          : 'Insufficient confidence. Sitting this one out.',
      };

    case 'chaotic':
      // CHAOS: Random and contrarian
      const random = Math.random();
      const contrarian = random > 0.6;
      return {
        position: contrarian ? (yesPercent > 50 ? 'NO' : 'YES') : (yesPercent > 50 ? 'YES' : 'NO'),
        confidence: Math.floor(Math.random() * 50) + 40,
        reasoning: contrarian
          ? 'Going against the crowd. The majority is often wrong.'
          : 'Even chaos has moments of clarity.',
      };

    case 'balanced':
    default:
      // ORACLE: Data-driven, moderate confidence
      return {
        position: yesPercent > 50 ? 'YES' : 'NO',
        confidence: Math.min(80, Math.max(55, Math.abs(yesPercent - 50) + 55)),
        reasoning: `Analysis shows ${Math.abs(yesPercent - 50)}% edge for ${yesPercent > 50 ? 'YES' : 'NO'}.`,
      };
  }
}

// GET /api/agents - Get all AI agent states and decisions
export async function GET() {
  try {
    // Agents return their profile info. Decision-making requires live market data
    // which is now fetched from the chain on the frontend.
    const agentProfiles = AI_AGENTS.map((agent) => ({
      ...agent,
      agentAddress: `0x${agent.name.toLowerCase().padStart(40, '0')}`,
      isActive: true,
      totalPredictions: 0,
      correctPredictions: 0,
      currentDecision: null,
    }));

    return NextResponse.json({
      success: true,
      data: agentProfiles,
    });
  } catch (error) {
    console.error('Failed to fetch AI agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch AI agents' },
      { status: 500 }
    );
  }
}
