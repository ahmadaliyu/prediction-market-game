'use client';

import { useCallback } from 'react';
import { ethers } from 'ethers';
import { PredictionMarketABI, MarketFactoryABI } from '@/lib/abis';
import { CONTRACTS, ACTIVE_CHAIN } from '@/lib/constants';
import { MarketRaw, MarketDisplay, BetDisplay, OutcomeDisplay } from '@/lib/types';
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

  // ─── Create Market ───────────────────────────────────────────

  const createMarket = useCallback(
    async (
      question: string,
      rules: string,
      imageURI: string,
      category: string,
      outcomes: string[],
      startTime: number,
      endTime: number,
      isPrivate: boolean,
      accessCode: string,
      resolutionType: number,
      initialLiquidity: string
    ) => {
      const contract = getWriteContract();
      const value = initialLiquidity && parseFloat(initialLiquidity) > 0
        ? ethers.parseEther(initialLiquidity)
        : BigInt(0);
      const tx = await contract.createMarket(
        question, rules, imageURI, category, outcomes,
        startTime, endTime, isPrivate, accessCode, resolutionType,
        { value }
      );
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  // ─── Place Bet ───────────────────────────────────────────────

  const placeBet = useCallback(
    async (marketId: number, outcomeIndex: number, amount: string, accessCode: string = '') => {
      const contract = getWriteContract();
      const tx = await contract.placeBet(marketId, outcomeIndex, accessCode, {
        value: ethers.parseEther(amount),
      });
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  // ─── Claim Winnings ──────────────────────────────────────────

  const claimWinnings = useCallback(
    async (marketId: number) => {
      const contract = getWriteContract();
      const tx = await contract.claimWinnings(marketId);
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  // ─── Resolve Market ──────────────────────────────────────────

  const resolveMarket = useCallback(
    async (marketId: number, winningOutcome: number) => {
      const contract = getWriteContract();
      const tx = await contract.resolveMarket(marketId, winningOutcome);
      const receipt = await tx.wait();
      return receipt;
    },
    [getWriteContract]
  );

  // ─── Parse Market ────────────────────────────────────────────

  const parseMarket = useCallback((raw: MarketRaw, bettorCount: number = 0): MarketDisplay => {
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(raw.endTime);
    const startTime = Number(raw.startTime);
    const isExpired = now >= endTime;
    const isStarted = now >= startTime;
    const totalPool = typeof raw.totalPool === 'bigint' ? raw.totalPool : BigInt(String(raw.totalPool));
    const outcomeCount = Number(raw.outcomeCount);

    // Build outcomes array
    const outcomes: OutcomeDisplay[] = [];
    for (let i = 0; i < outcomeCount; i++) {
      const pool = typeof raw.outcomePools[i] === 'bigint'
        ? raw.outcomePools[i]
        : BigInt(String(raw.outcomePools[i]));
      const percent = totalPool === BigInt(0)
        ? Math.floor(100 / outcomeCount)
        : Number((pool * BigInt(100)) / totalPool);
      outcomes.push({
        label: raw.outcomeLabels[i],
        pool: formatAVAX(pool),
        percent,
        index: i,
      });
    }

    // Fix rounding so percents sum to 100
    const sumPercent = outcomes.reduce((s, o) => s + o.percent, 0);
    if (sumPercent < 100 && outcomes.length > 0) {
      outcomes[0].percent += 100 - sumPercent;
    }

    let status: 'upcoming' | 'active' | 'expired' | 'resolved';
    if (raw.resolved) status = 'resolved';
    else if (isExpired) status = 'expired';
    else if (!isStarted) status = 'upcoming';
    else status = 'active';

    return {
      id: Number(raw.id),
      question: raw.question,
      rules: raw.rules,
      imageURI: raw.imageURI,
      category: (raw.category || 'other') as MarketDisplay['category'],
      outcomes,
      outcomeCount,
      endTime,
      startTime,
      totalPool: formatAVAX(totalPool),
      resolved: raw.resolved,
      winningOutcome: Number(raw.winningOutcome),
      creator: raw.creator,
      createdAt: Number(raw.createdAt),
      isPrivate: raw.isPrivate,
      resolutionType: Number(raw.resolutionType),
      timeRemaining: formatTimeRemaining(endTime),
      isExpired,
      isStarted,
      status,
      bettorCount,
    };
  }, []);

  // ─── Get Single Market ──────────────────────────────────────

  const getMarket = useCallback(
    async (marketId: number): Promise<MarketDisplay | null> => {
      const contract = getReadContract();
      if (!contract) return null;
      try {
        const raw = await contract.getMarket(marketId);
        // getMarket returns a tuple, map to MarketRaw
        const marketRaw: MarketRaw = {
          id: raw[0],
          question: raw[1],
          rules: raw[2],
          imageURI: raw[3],
          category: raw[4],
          outcomeLabels: raw[5],
          outcomePools: raw[6],
          outcomeCount: raw[7],
          endTime: raw[8],
          startTime: raw[9],
          totalPool: raw[10],
          resolved: raw[11],
          winningOutcome: raw[12],
          creator: raw[13],
          createdAt: raw[14],
          isPrivate: raw[15],
          resolutionType: Number(raw[16]),
        };
        let bettorCount = 0;
        try {
          const bettors: string[] = await contract.getMarketBettors(marketId);
          bettorCount = bettors.length;
        } catch { /* ignore */ }
        return parseMarket(marketRaw, bettorCount);
      } catch (err) {
        console.error('[getMarket] error:', err);
        return null;
      }
    },
    [getReadContract, parseMarket]
  );

  // ─── Get All Markets ────────────────────────────────────────

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

  // ─── Get User Bets ──────────────────────────────────────────

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
            const outcomeIdx = Number(bet.outcomeIndex);
            results.push({
              marketId: id,
              amount: formatAVAX(bet.amount),
              outcomeLabel: market?.outcomes[outcomeIdx]?.label || `Outcome ${outcomeIdx}`,
              outcomeIndex: outcomeIdx,
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

  // ─── Leaderboard ─────────────────────────────────────────────

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
          const raw = await contract.getMarket(i);
          const resolved = raw[11];
          const winningOutcome = Number(raw[12]);
          const totalPool = raw[10];
          const outcomePools: bigint[] = raw[6];

          const bettors: string[] = await contract.getMarketBettors(i);

          for (const bettor of bettors) {
            const bet = await contract.getBet(i, bettor);
            if (bet.amount === BigInt(0)) continue;

            const stats = playerMap.get(bettor) || {
              totalBet: BigInt(0), totalWon: BigInt(0),
              wins: 0, losses: 0, bets: 0,
            };

            stats.totalBet += bet.amount;
            stats.bets += 1;

            if (resolved) {
              if (Number(bet.outcomeIndex) === winningOutcome) {
                stats.wins += 1;
                const totalFees = (totalPool * BigInt(200)) / BigInt(10000);
                const distributable = totalPool - totalFees;
                const winPool = outcomePools[winningOutcome];
                if (winPool > BigInt(0)) {
                  stats.totalWon += (bet.amount * distributable) / winPool;
                }
              } else {
                stats.losses += 1;
              }
            }

            playerMap.set(bettor, stats);
          }
        } catch { continue; }
      }

      const results = Array.from(playerMap.entries()).map(([addr, stats]) => ({
        address: addr,
        totalBet: formatAVAX(stats.totalBet),
        totalWon: formatAVAX(stats.totalWon),
        wins: stats.wins,
        losses: stats.losses,
        bets: stats.bets,
      }));

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
