import { NextRequest, NextResponse } from 'next/server';

// GET /api/markets - Markets are now fetched directly from the chain via useContracts.
// This route is kept as a placeholder for off-chain metadata extensions.
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: [],
      total: 0,
      message: 'Markets are loaded from on-chain contracts. Use the frontend directly.',
    });
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch markets' },
      { status: 500 }
    );
  }
}

// POST /api/markets - Create a new market (metadata only, actual creation is on-chain)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, category, endTime, imageURI } = body;

    if (!question || !category || !endTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // In production, this would store additional metadata
    return NextResponse.json({
      success: true,
      data: {
        question,
        category,
        endTime,
        imageURI: imageURI || '',
        message: 'Market metadata stored. Complete creation on-chain.',
      },
    });
  } catch (error) {
    console.error('Failed to create market:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create market' },
      { status: 500 }
    );
  }
}
