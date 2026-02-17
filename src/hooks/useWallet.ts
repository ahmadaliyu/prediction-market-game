'use client';

import { useState, useCallback, useEffect } from 'react';
import { ethers } from 'ethers';
import { ACTIVE_CHAIN } from '@/lib/constants';
import { WalletState } from '@/lib/types';

declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider & {
      on: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener: (event: string, callback: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  balance: '0',
  isCorrectChain: false,
};

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>(initialState);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  const updateBalance = useCallback(async (provider: ethers.BrowserProvider, address: string) => {
    try {
      const balance = await provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch {
      return '0';
    }
  }, []);

  const connect = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('Please install MetaMask or another Web3 wallet');
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[];

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const network = await browserProvider.getNetwork();
      const chainId = Number(network.chainId);
      const isCorrectChain = chainId === ACTIVE_CHAIN.chainId;
      const jsonRpcSigner = await browserProvider.getSigner();
      const balance = await updateBalance(browserProvider, accounts[0]);

      setProvider(browserProvider);
      setSigner(jsonRpcSigner);
      setWallet({
        address: accounts[0],
        isConnected: true,
        chainId,
        balance,
        isCorrectChain,
      });

      return accounts[0];
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  }, [updateBalance]);

  const disconnect = useCallback(async () => {
    try {
      // Clear all wallet state
      setWallet(initialState);
      setProvider(null);
      setSigner(null);

      // Try to revoke permissions if the wallet supports it
      // This allows connecting to a fresh wallet without page refresh
      if (window.ethereum?.request) {
        try {
          await window.ethereum.request({
            method: 'wallet_revokePermissions',
            params: [{ eth_accounts: {} }],
          });
        } catch (revokeError) {
          // Ignore errors - not all wallets support this method
          // The important part is clearing our local state
          console.debug('wallet_revokePermissions not supported or failed:', revokeError);
        }
      }
    } catch (error) {
      console.error('Error during disconnect:', error);
      // Still clear state even if revoke fails
      setWallet(initialState);
      setProvider(null);
      setSigner(null);
    }
  }, []);

  const switchChain = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ACTIVE_CHAIN.chainIdHex }],
      });
    } catch (switchError: unknown) {
      const error = switchError as { code?: number };
      // Chain not added, add it
      if (error?.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: ACTIVE_CHAIN.chainIdHex,
              chainName: ACTIVE_CHAIN.chainName,
              rpcUrls: ACTIVE_CHAIN.rpcUrls,
              nativeCurrency: ACTIVE_CHAIN.nativeCurrency,
              blockExplorerUrls: ACTIVE_CHAIN.blockExplorerUrls,
            },
          ],
        });
      }
    }
  }, []);

  // Listen for account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accs = accounts as string[];
      if (accs.length === 0) {
        disconnect();
      } else if (accs[0] !== wallet.address) {
        connect();
      }
    };

    const handleChainChanged = () => {
      connect();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, [wallet.address, connect, disconnect]);

  // Auto-connect on mount if previously connected
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then((accounts) => {
          const accs = accounts as string[];
          if (accs && accs.length > 0) {
            connect();
          }
        })
        .catch(console.error);
    }
  }, [connect]);

  return {
    ...wallet,
    provider,
    signer,
    connect,
    disconnect,
    switchChain,
  };
}
