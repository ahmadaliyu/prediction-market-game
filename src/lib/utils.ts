import { MarketDisplay } from './types';

/**
 * Shorten an Aptos address for display
 */
export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

const OCTAS_PER_APT = 100_000_000; // 1 APT = 1e8 octas

/**
 * Format APT amount from octas to display string
 */
export function formatAVAX(octas: bigint | string, decimals = 4): string {
  const value = typeof octas === 'string' ? BigInt(octas) : octas;
  const num = Number(value) / OCTAS_PER_APT;
  if (num === 0) return '0';
  const fixed = num.toFixed(decimals);
  // Remove unnecessary trailing zeros: "2.0000" -> "2.0", "1.2500" -> "1.25"
  return fixed.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '.0');
}

/**
 * Parse APT display string to octas
 */
export function parseAVAX(apt: string): bigint {
  return BigInt(Math.round(parseFloat(apt || '0') * OCTAS_PER_APT));
}


/**
 * Format time remaining from unix timestamp
 */
export function formatTimeRemaining(endTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = endTime - now;

  if (diff <= 0) return 'Ended';

  const days = Math.floor(diff / 86400);
  const hours = Math.floor((diff % 86400) / 3600);
  const minutes = Math.floor((diff % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Format percentage
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Get category config by ID
 */
export function getCategoryConfig(categoryId: string) {
  const categories: Record<string, { emoji: string; color: string; label: string }> = {
    crypto: { emoji: '₿', color: '#F7931A', label: 'Crypto' },
    sports: { emoji: '⚽', color: '#00FF88', label: 'Sports' },
    politics: { emoji: '🏛️', color: '#7B61FF', label: 'Politics' },
    entertainment: { emoji: '🎬', color: '#FF00E5', label: 'Entertainment' },
    technology: { emoji: '🤖', color: '#00F0FF', label: 'Technology' },
    science: { emoji: '🔬', color: '#FFD700', label: 'Science' },
    gaming: { emoji: '🎮', color: '#E84142', label: 'Gaming' },
    other: { emoji: '🌐', color: '#888888', label: 'Other' },
  };
  return categories[categoryId] || categories.other;
}

/**
 * Calculate potential payout for multi-outcome market
 */
export function calculatePayout(
  betAmount: string,
  outcomeIndex: number,
  market: MarketDisplay
): string {
  const amount = parseFloat(betAmount);
  if (isNaN(amount) || amount <= 0) return '0';
  if (outcomeIndex < 0 || outcomeIndex >= market.outcomes.length) return '0';

  // Parse outcome pools
  const outcomePools = market.outcomes.map(o => parseFloat(o.pool));
  const currentOutcomePool = outcomePools[outcomeIndex];
  const totalPool = outcomePools.reduce((sum, pool) => sum + pool, 0) + amount;
  const newOutcomePool = currentOutcomePool + amount;

  // Apply 2% total fee (1.2% creator + 0.8% platform)
  const fee = totalPool * 0.02;
  const distributable = totalPool - fee;

  // Payout = (user's share of winning pool) * distributable pool
  const payout = (amount / newOutcomePool) * distributable;

  return payout.toFixed(4);
}

/**
 * Generate a deterministic color from a string
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
}

/**
 * clsx alternative - combine class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Delay helper
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random position for 3D scene
 */
export function randomPosition(
  range: number = 10
): [number, number, number] {
  return [
    (Math.random() - 0.5) * range,
    (Math.random() - 0.5) * range * 0.5 + 2,
    (Math.random() - 0.5) * range,
  ];
}
