'use client';

import { useEffect, useRef } from 'react';
import { useWalletContext } from '@/contexts/WalletContext';
import { useMarketStore } from '@/store';

export default function MarketLoader() {
  const { contracts } = useWalletContext();
  const setMarkets = useMarketStore((s) => s.setMarkets);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    async function load() {
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
    }

    load();
  }, [contracts, setMarkets]);

  return null;
}
