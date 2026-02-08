'use client';

import { ReactNode } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import MarketLoader from '@/components/MarketLoader';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <MarketLoader />
      {children}
    </WalletProvider>
  );
}
