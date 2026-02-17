import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, SYSTEM_PROMPTS, MarketContext, AIInsight } from '@/lib/ai';

// POST /api/ai/insights — Generate AI insights for a specific market
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

    const prompt = `Analyze this prediction market and provide your insight:

**Question:** ${market.question}
**Category:** ${market.category}
**Status:** ${market.status}
**Total Pool:** ${market.totalPool} AVAX
**Time Remaining:** ${market.timeRemaining}

**Outcomes:**
${outcomesDescription}

Respond in valid JSON format with exactly these fields:
{
  "summary": "One-line market summary (max 20 words)",
  "sentiment": "bullish" | "bearish" | "neutral",
  "confidence": number between 0-100,
  "recommendation": "Which outcome looks strongest and why (max 30 words)",
  "reasoning": "Brief analysis of odds and market dynamics (max 50 words)"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPTS.marketAnalyst },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    const insight: AIInsight = JSON.parse(content);

    return NextResponse.json({ success: true, data: insight });
  } catch (error) {
    console.error('AI Insights error:', error);

    // Return a fallback insight if OpenAI fails (e.g., no API key)
    const fallback: AIInsight = {
      summary: 'Market analysis temporarily unavailable',
      sentiment: 'neutral',
      confidence: 50,
      recommendation: 'Review the odds and make your own assessment',
      reasoning: 'AI analysis is currently unavailable. Check back later.',
    };

    return NextResponse.json({ success: true, data: fallback });
  }
}
