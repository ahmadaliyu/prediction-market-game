import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, SYSTEM_PROMPTS, ChatMessage, MarketContext } from '@/lib/ai';

// POST /api/ai/chat — AI-powered chat about prediction markets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, market }: { messages: ChatMessage[]; market?: MarketContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Messages array is required' },
        { status: 400 }
      );
    }

    const openai = getOpenAI();

    // Build system prompt with optional market context
    let systemPrompt = SYSTEM_PROMPTS.marketAnalyst;

    if (market) {
      const outcomesDescription = market.outcomes
        .map((o) => `${o.label}: ${o.percent}% (${o.pool} AVAX)`)
        .join(', ');

      systemPrompt += `\n\nThe user is currently viewing this market:
Question: "${market.question}"
Category: ${market.category}
Status: ${market.status}
Total Pool: ${market.totalPool} AVAX
Time Remaining: ${market.timeRemaining}
Outcomes: ${outcomesDescription}

Use this context to provide specific, relevant answers. Reference the actual odds and data in your responses.`;
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map((m) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content;
    if (!reply) {
      return NextResponse.json(
        { success: false, error: 'No response from AI' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { role: 'assistant', content: reply },
    });
  } catch (error) {
    console.error('AI Chat error:', error);

    const isApiKeyMissing =
      error instanceof Error && error.message.includes('OPENAI_API_KEY');

    return NextResponse.json(
      {
        success: false,
        error: isApiKeyMissing
          ? 'AI is not configured. Add OPENAI_API_KEY to your environment variables.'
          : 'AI chat is temporarily unavailable. Please try again.',
      },
      { status: 500 }
    );
  }
}
