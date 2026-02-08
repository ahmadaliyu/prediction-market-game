'use client';

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { PredictionMarketABI, MarketFactoryABI } from '@/lib/abis';
import { CONTRACTS, ACTIVE_CHAIN } from '@/lib/constants';
import { Market, MarketDisplay, BetDisplay } from '@/lib/types';
import { formatAVAX, formatTimeRemaining } from '@/lib/utils';

function getReadOnlyProvider() {
  return new ethers.JsonRpcProvider(ACTIVE_CHAIN.rpcUrls[0]);
}

export function useContracts(signer: ethers.JsonRpcSigner | null) {
  const getReadContract = useCallback(() => {
    if (!CONTRACTS.PREDICTION_MARKET) return null;
    const providerOrSigner = signer || getReadOnlyProvider();
    return new ethers.Contract(
      CONTRACTS.PREDICTION_MARKET,
      PredictionMarketABI,
      providerOrSigner
    );
  }, [signer]);

  const getWriteContract = useCallback(() => {
    if (!CONTRACTS.PREDICTION_MARKET) {
      throw new Error('Contract not deployed. Set NEXT_PUBLIC_PREDICTION_MARKET_ADDRESS in .env.local');
    }
    if (!signer) {
      throw new Error('Connect your wallet first');
    }
    return new ethers.Contract(
      CONTRACTS.PREDICTION_MARKET,
      PredictionMarketABI,
      signer
    );
  }, [signer]);

  const getMarketFactory = useCallback(() => {
    if (!CONTRACTS.MARKET_FACTORY) return null;
    const providerOrSigner = signer || getReadOnlyProvider();
    return new ethers.Contract(
      CONTRACTS.MARKET_FACTORY,
      MarketFactoryABI,
      providerOrSigner
    );
  }, [signer]);

  const createMarket = useCallback(
    async (question: string, imageURI: string, category: string, endTime: number) => {
      const contract = getWriteContract();
      const tx = await contract.createMarket(question, imageURI, category, endTime);
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  const placeBet = useCallback(
    async (marketId: number, position: boolean, amount: string) => {
      const contract = getWriteContract();
      const tx = await contract.placeBet(marketId, position, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  const claimWinnings = useCallback(
    async (marketId: number) => {
      const contract = getWriteContract();
      const tx = await contract.claimWinnings(marketId);
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  const resolveMarket = useCallback(
    async (marketId: number, outcome: boolean) => {
      const contract = getWriteContract();
      const tx = await contract.resolveMarket(marketId, outcome);
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  const parseMarket = useCallback((raw: Market, bettorCount: number = 0): MarketDisplay => {
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now >= Number(raw.endTime);
    const totalYes = typeof raw.totalYesAmount === 'bigint' ? raw.totalYesAmount : BigInt(String(raw.totalYesAmount));
    const totalNo = typeof raw.totalNoAmount === 'bigint' ? raw.totalNoAmount : BigInt(String(raw.totalNoAmount));
    const total = totalYes + totalNo;

    return {
      id: Number(raw.id),
      question: raw.question,
      imageURI: raw.imageURI,
      category: raw.category,
      endTime: Number(raw.endTime),
      totalYesAmount: formatAVAX(totalYes),
      totalNoAmount: formatAVAX(totalNo),
      totalPool: formatAVAX(total),
      yesPercent: total === BigInt(0) ? 50 : Number((totalYes * BigInt(100)) / total),
      noPercent: total === BigInt(0) ? 50 : 100 - Number((totalYes * BigInt(100)) / total),
      resolved: raw.resolved,
      outcome: raw.outcome,
      creator: raw.creator,
      createdAt: Number(raw.createdAt),
      timeRemaining: formatTimeRemaining(Number(raw.endTime)),
      isExpired,
      status: raw.resolved ? 'resolved' : isExpired ? 'expired' : 'active',
      bettorCount,
    };
  }, []);

  const getMarket = useCallback(
    async (marketId: number): Promise<MarketDisplay | null> => {
      const contract = getReadContract();
      if (!contract) return null;
      try {
        const raw: Market = await contract.getMarket(marketId);
        let bettorCount = 0;
        try {
          const bettors: string[] = await contract.getMarketBettors(marketId);
          bettorCount = bettors.length;
        } catch {
          // ignore if getMarketBettors fails
        }
        return parseMarket(raw, bettorCount);
      } catch {
        return null;
      }
    },
    [getReadContract, parseMarket]
  );

  const getAllMarkets = useCallback(async (): Promise<MarketDisplay[]> => {
    const contract = getReadContract();
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
  }, [getReadContract, getMarket]);

  const getUserBets = useCallback(
    async (userAddress: string): Promise<BetDisplay[]> => {
      const contract = getReadContract();
      if (!contract) return [];
      try {
        const marketIds: bigint[] = await contract.getUserMarkets(userAddress);
        const results: BetDisplay[] = [];
        for (const mid of marketIds) {
          const id = Number(mid);
          const bet = await contract.getBet(id, userAddress);
          const market = await getMarket(id);
          if (bet.amount > 0) {
            results.push({
              marketId: id,
              amount: formatAVAX(bet.amount),
              position: bet.position ? 'YES' : 'NO',
              claimed: bet.claimed,
              market: market || undefined,
            });
          }
        }
        return results;
      } catch {
        return [];
      }
    },
    [getReadContract, getMarket]
  );

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

  const getLeaderboard = useCallback(async (): Promise<{
    address: string;
    totalBet: string;
    totalWon: string;
    wins: number;
    losses: number;
    bets: number;
  }[]> => {
    const contract = getReadContract();
    if (!contract) return [];
    try {
      const count = await contract.marketCount();
      const playerMap = new Map<string, {
        totalBet: bigint;
        totalWon: bigint;
        wins: number;
        losses: number;
        bets: number;
      }>();

      for (let i = 0; i < Number(count); i++) {
        try {
          const market = await contract.getMarket(i);
          const bettors: string[] = await contract.getMarketBettors(i);

          for (const bettor of bettors) {
            const bet = await contract.getBet(i, bettor);
            if (bet.amount === BigInt(0)) continue;

            const stats = playerMap.get(bettor) || {
              totalBet: BigInt(0),
              totalWon: BigInt(0),
              wins: 0,
              losses: 0,
              bets: 0,
            };

            stats.totalBet += bet.amount;
            stats.bets += 1;

            if (market.resolved) {
              if (bet.position === market.outcome) {
                stats.wins += 1;
                // Calculate approximate payout
                const totalPool = market.totalYesAmount + market.totalNoAmount;
                const fee = (totalPool * BigInt(200)) / BigInt(10000);
                const distributable = totalPool - fee;
                const winningPool = market.outcome ? market.totalYesAmount : market.totalNoAmount;
                if (winningPool > BigInt(0)) {
                  stats.totalWon += (bet.amount * distributable) / winningPool;
                }
              } else {
                stats.losses += 1;
              }
            }

            playerMap.set(bettor, stats);
          }
        } catch {
          continue;
        }
      }

      const results = Array.from(playerMap.entries()).map(([address, stats]) => ({
        address,
        totalBet: formatAVAX(stats.totalBet),
        totalWon: formatAVAX(stats.totalWon),
        wins: stats.wins,
        losses: stats.losses,
        bets: stats.bets,
      }));

      // Sort by most wins, then by totalWon
      results.sort((a, b) => b.wins - a.wins || parseFloat(b.totalWon) - parseFloat(a.totalWon));
      return results;
    } catch {
      return [];
    }
  }, [getReadContract]);

  const contractsAvailable = !!CONTRACTS.PREDICTION_MARKET;

  return {
    createMarket,
    placeBet,
    claimWinnings,
    resolveMarket,
    getMarket,
    getAllMarkets,
    getUserBets,
    getPlayerStats,
    getLeaderboard,
    contractsAvailable,
  };
}
