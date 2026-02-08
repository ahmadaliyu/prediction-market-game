import { NextRequest, NextResponse } from 'next/server';
import { MOCK_MARKETS } from '@/lib/constants';

// GET /api/markets - Fetch all markets
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'newest';

    let markets = [...MOCK_MARKETS];

    // Filter by category
    if (category && category !== 'all') {
      markets = markets.filter((m) => m.category === category);
    }

    // Filter by status
    if (status) {
      markets = markets.filter((m) => m.status === status);
    }

    // Sort
    switch (sort) {
      case 'volume':
        markets.sort((a, b) => parseFloat(b.totalPool) - parseFloat(a.totalPool));
        break;
      case 'ending':
        markets.sort((a, b) => a.endTime - b.endTime);
        break;
      case 'newest':
      default:
        markets.sort((a, b) => b.createdAt - a.createdAt);
        break;
    }

    return NextResponse.json({
      success: true,
      data: markets,
      total: markets.length,
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
