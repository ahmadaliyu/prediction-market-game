'use client';

import { ReactNode } from 'react';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { WalletProvider } from '@/contexts/WalletContext';
import MarketLoader from '@/components/MarketLoader';
import AIChatPanel from '@/components/ui/AIChatPanel';

const wallets = [new PetraWallet()];

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect>
      <WalletProvider>
        <MarketLoader />
        {children}
        <AIChatPanel />
      </WalletProvider>
    </AptosWalletAdapterProvider>
  );
}

