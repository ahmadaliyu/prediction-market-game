'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useMarketStore } from '@/store';

export default function MarketLoader() {
  const { contracts } = useWalletContext();
  const setMarkets = useMarketStore((s) => s.setMarkets);
  const loaded = useRef(false);

  const loadMarkets = useCallback(async () => {
    if (!contracts.contractsAvailable) {
      console.warn('Contracts not deployed — showing empty state');
      setMarkets([]);
      return;
    }

    try {
      const markets = await contracts.getAllMarkets();
      setMarkets(markets);
    } catch (err) {
      console.error('Failed to load markets from chain:', err);
      setMarkets([]);
    }
  }, [contracts, setMarkets]);

  // Initial load
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadMarkets();
  }, [loadMarkets]);

  // Auto-refresh every 15 seconds
  useEffect(() => {
    if (!contracts.contractsAvailable) return;
    const interval = setInterval(loadMarkets, 15000);
    return () => clearInterval(interval);
  }, [contracts.contractsAvailable, loadMarkets]);

  return null;
}
