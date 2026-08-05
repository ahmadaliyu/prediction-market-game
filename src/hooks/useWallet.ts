'use client';

import { useCallback, useEffect, useState } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { Aptos, AptosConfig } from '@aptos-labs/ts-sdk';
import { ACTIVE_CHAIN } from '@/lib/constants';
import { WalletState } from '@/lib/types';

const initialState: WalletState = {
  address: null,
  isConnected: false,
  chainId: null,
  balance: '0',
  isCorrectChain: true, // Aptos wallet adapter enforces the configured network directly
};

function getAptosClient() {
  return new Aptos(new AptosConfig({ network: ACTIVE_CHAIN.network, fullnode: ACTIVE_CHAIN.rpcUrls[0] }));
}

export function useWallet() {
  const {
    account,
    connected,
    connect: adapterConnect,
    disconnect: adapterDisconnect,
    wallets,
    signAndSubmitTransaction,
  } = useAptosWallet();

  const [wallet, setWallet] = useState<WalletState>(initialState);

  const refreshBalance = useCallback(async (address: string) => {
    try {
      const client = getAptosClient();
      const octas = await client.getAccountAPTAmount({ accountAddress: address });
      return (octas / 100_000_000).toString();
    } catch {
      return '0';
    }
  }, []);

  useEffect(() => {
    if (connected && account?.address) {
      const address = account.address.toString();
      refreshBalance(address).then((balance) => {
        setWallet({
          address,
          isConnected: true,
          chainId: null,
          balance,
          isCorrectChain: true,
        });
      });
    } else {
      setWallet(initialState);
    }
  }, [connected, account, refreshBalance]);

  const connect = useCallback(async () => {
    const preferred = wallets?.find((w) => w.name === 'Petra') || wallets?.[0];
    if (!preferred) {
      throw new Error('No Aptos wallet found. Please install Petra or another Aptos wallet.');
    }
    await adapterConnect(preferred.name);
    return account?.address?.toString();
  }, [adapterConnect, wallets, account]);

  const disconnect = useCallback(() => {
    adapterDisconnect();
    setWallet(initialState);
  }, [adapterDisconnect]);

  // Aptos wallets are always on the network configured in the adapter provider,
  // so there's no separate "switch chain" RPC call like EVM's wallet_switchEthereumChain.
  const switchChain = useCallback(async () => {}, []);

  return {
    ...wallet,
    provider: null,
    signer: signAndSubmitTransaction,
    connect,
    disconnect,
    switchChain,
  };
}
