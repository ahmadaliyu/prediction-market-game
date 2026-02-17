import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, SYSTEM_PROMPTS, MarketContext, AgentDecision } from '@/lib/ai';
import { AI_AGENTS } from '@/lib/constants';

// POST /api/agents/decide — AI agents make decisions using OpenAI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const market: MarketContext = body.market;

    if (!market || !market.question) {
      return NextResponse.json(
        { success: false, error: 'Market data is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    const outcomesDescription = market.outcomes
      .map((o) => `${o.label}: ${o.percent}% (${o.pool} AVAX in pool)`)
      .join('\n');

    // Run all 4 agents in parallel
    const agentPromises = AI_AGENTS.map(async (agent) => {
      const personality =
        SYSTEM_PROMPTS.agentPersonalities[agent.personality] ||
        SYSTEM_PROMPTS.agentPersonalities.balanced;

      const prompt = `Analyze this prediction market and make your trading decision:

**Question:** ${market.question}
**Category:** ${market.category}
**Total Pool:** ${market.totalPool} AVAX
**Time Remaining:** ${market.timeRemaining}

**Outcomes:**
${outcomesDescription}

Available outcomes to choose from: ${market.outcomes.map((o) => `"${o.label}"`).join(', ')}

Respond in valid JSON format:
{
  "position": "one of the exact outcome labels listed above",
  "confidence": number between 0-100,
  "reasoning": "Your reasoning in character (max 30 words)",
  "betSize": "small" | "medium" | "large"
}`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: personality },
            { role: 'user', content: prompt },
          ],
          max_tokens: 200,
          temperature: agent.personality === 'chaotic' ? 1.2 : 0.7,
          response_format: { type: 'json_object' },
        });

        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error('No response');

        const decision = JSON.parse(content);

        return {
          agent: agent.name,
          personality: agent.personality,
          color: agent.color,
          position: decision.position,
          confidence: Math.min(100, Math.max(0, decision.confidence)),
          reasoning: decision.reasoning,
          betSize: decision.betSize || 'medium',
        } as AgentDecision & { color: string };
      } catch {
        // Fallback to simple logic if OpenAI fails for this agent
        return fallbackDecision(agent, market);
      }
    });

    const decisions = await Promise.all(agentPromises);

    return NextResponse.json({ success: true, data: decisions });
  } catch (error) {
    console.error('Agent decision error:', error);

    // Full fallback for all agents if OpenAI completely fails
    const body = await request.clone().json().catch(() => ({ market: null }));
    const market: MarketContext | null = body.market;

    const fallbackDecisions = AI_AGENTS.map((agent) =>
      fallbackDecision(agent, market)
    );

    return NextResponse.json({ success: true, data: fallbackDecisions });
  }
}

// Fallback decision logic (used when OpenAI is unavailable)
function fallbackDecision(
  agent: (typeof AI_AGENTS)[number],
  market: MarketContext | null
): AgentDecision & { color: string } {
  const outcomes = market?.outcomes || [
    { label: 'YES', percent: 50, pool: '0' },
    { label: 'NO', percent: 50, pool: '0' },
  ];

  const topOutcome = outcomes.reduce((a, b) => (a.percent > b.percent ? a : b));
  const bottomOutcome = outcomes.reduce((a, b) =>
    a.percent < b.percent ? a : b
  );

  switch (agent.personality) {
    case 'aggressive':
      return {
        agent: agent.name,
        personality: agent.personality,
        color: agent.color,
        position: topOutcome.label,
        confidence: Math.min(95, topOutcome.percent + 10),
        reasoning: `Strong momentum for ${topOutcome.label}. Going all in.`,
        betSize: 'large',
      };

    case 'conservative':
      const isConfident = topOutcome.percent > 65;
      return {
        agent: agent.name,
        personality: agent.personality,
        color: agent.color,
        position: topOutcome.label,
        confidence: isConfident ? 80 : 40,
        reasoning: isConfident
          ? 'Clear consensus. Entering position.'
          : 'Insufficient edge. Minimal exposure.',
        betSize: isConfident ? 'medium' : 'small',
      };

    case 'chaotic':
      const goContrarian = Math.random() > 0.5;
      return {
        agent: agent.name,
        personality: agent.personality,
        color: agent.color,
        position: goContrarian ? bottomOutcome.label : topOutcome.label,
        confidence: Math.floor(Math.random() * 50) + 30,
        reasoning: goContrarian
          ? 'The crowd is wrong. Betting against the herd.'
          : 'Even chaos aligns with the trend sometimes.',
        betSize: goContrarian ? 'large' : 'small',
      };

    case 'balanced':
    default:
      return {
        agent: agent.name,
        personality: agent.personality,
        color: agent.color,
        position: topOutcome.label,
        confidence: Math.min(75, Math.abs(topOutcome.percent - 50) + 55),
        reasoning: `Data shows ${topOutcome.percent - 50}% edge for ${topOutcome.label}.`,
        betSize: 'medium',
      };
  }
}
