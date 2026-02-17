'use client';

import { ReactNode } from 'react';
import { WalletProvider } from '@/contexts/WalletContext';
import MarketLoader from '@/components/MarketLoader';
import AIChatPanel from '@/components/ui/AIChatPanel';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <WalletProvider>
      <MarketLoader />
      {children}
      <AIChatPanel />
    </WalletProvider>
  );
}
