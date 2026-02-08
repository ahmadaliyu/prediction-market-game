'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContracts } from '@/hooks/useContracts';
import { ethers } from 'ethers';

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string;
  isCorrectChain: boolean;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
  connect: () => Promise<string | undefined>;
  disconnect: () => void;
  switchChain: () => Promise<void>;
  contracts: ReturnType<typeof useContracts>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet();
  const contracts = useContracts(wallet.signer);

  return (
    <WalletContext.Provider value={{ ...wallet, contracts }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWalletContext() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWalletContext must be used within WalletProvider');
  return ctx;
}
