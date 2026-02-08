'use client';

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { PredictionMarketABI, MarketFactoryABI } from '@/lib/abis';
import { CONTRACTS } from '@/lib/constants';
import { Market, MarketDisplay } from '@/lib/types';
import { formatAVAX, formatTimeRemaining } from '@/lib/utils';

export function useContracts(signer: ethers.JsonRpcSigner | null) {
  const getPredictionMarket = useCallback(() => {
    if (!signer || !CONTRACTS.PREDICTION_MARKET) return null;
    return new ethers.Contract(
      CONTRACTS.PREDICTION_MARKET,
      PredictionMarketABI,
      signer
    );
  }, [signer]);

  const getMarketFactory = useCallback(() => {
    if (!signer || !CONTRACTS.MARKET_FACTORY) return null;
    return new ethers.Contract(
      CONTRACTS.MARKET_FACTORY,
      MarketFactoryABI,
      signer
    );
  }, [signer]);

  const createMarket = useCallback(
    async (question: string, imageURI: string, category: string, endTime: number) => {
      const contract = getPredictionMarket();
      if (!contract) throw new Error('Contract not available');
      const tx = await contract.createMarket(question, imageURI, category, endTime);
      const receipt = await tx.wait();
      return receipt;
    },
    [getPredictionMarket]
  );

  const placeBet = useCallback(
    async (marketId: number, position: boolean, amount: string) => {
      const contract = getPredictionMarket();
      if (!contract) throw new Error('Contract not available');
      const tx = await contract.placeBet(marketId, position, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt;
    },
    [getPredictionMarket]
  );

  const claimWinnings = useCallback(
    async (marketId: number) => {
      const contract = getPredictionMarket();
      if (!contract) throw new Error('Contract not available');
      const tx = await contract.claimWinnings(marketId);
      const receipt = await tx.wait();
      return receipt;
    },
    [getPredictionMarket]
  );

  const getMarket = useCallback(
    async (marketId: number): Promise<MarketDisplay | null> => {
      const contract = getPredictionMarket();
      if (!contract) return null;

      try {
        const raw: Market = await contract.getMarket(marketId);
        const now = Math.floor(Date.now() / 1000);
        const isExpired = now >= Number(raw.endTime);

        return {
          id: Number(raw.id),
          question: raw.question,
          imageURI: raw.imageURI,
          category: raw.category,
          endTime: Number(raw.endTime),
          totalYesAmount: formatAVAX(raw.totalYesAmount),
          totalNoAmount: formatAVAX(raw.totalNoAmount),
          totalPool: formatAVAX(raw.totalYesAmount + raw.totalNoAmount),
          yesPercent:
            raw.totalYesAmount + raw.totalNoAmount === BigInt(0)
              ? 50
              : Number((raw.totalYesAmount * BigInt(100)) / (raw.totalYesAmount + raw.totalNoAmount)),
          noPercent:
            raw.totalYesAmount + raw.totalNoAmount === BigInt(0)
              ? 50
              : 100 -
                Number((raw.totalYesAmount * BigInt(100)) / (raw.totalYesAmount + raw.totalNoAmount)),
          resolved: raw.resolved,
          outcome: raw.outcome,
          creator: raw.creator,
          createdAt: Number(raw.createdAt),
          timeRemaining: formatTimeRemaining(Number(raw.endTime)),
          isExpired,
          status: raw.resolved ? 'resolved' : isExpired ? 'expired' : 'active',
        };
      } catch {
        return null;
      }
    },
    [getPredictionMarket]
  );

  const getAllMarkets = useCallback(async (): Promise<MarketDisplay[]> => {
    const contract = getPredictionMarket();
    if (!contract) return [];

    try {
      const count = await contract.marketCount();
      const markets: MarketDisplay[] = [];

      for (let i = 0; i < Number(count); i++) {
        const market = await getMarket(i);
        if (market) markets.push(market);
      }

      return markets;
    } catch {
      return [];
    }
  }, [getPredictionMarket, getMarket]);

  const getPlayerStats = useCallback(
    async (address: string) => {
      const contract = getMarketFactory();
      if (!contract) return null;

      try {
        return await contract.getPlayerStats(address);
      } catch {
        return null;
      }
    },
    [getMarketFactory]
  );

  return {
    createMarket,
    placeBet,
    claimWinnings,
    getMarket,
    getAllMarkets,
    getPlayerStats,
    getPredictionMarket,
    getMarketFactory,
  };
}
