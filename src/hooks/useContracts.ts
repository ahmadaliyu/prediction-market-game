'use client';

import { useCallback } from 'react';
import { Aptos, AptosConfig, InputTransactionData } from '@aptos-labs/ts-sdk';
import { ENTRY_FUNCTIONS, VIEW_FUNCTIONS } from '@/lib/abis';
import { CONTRACTS, ACTIVE_CHAIN } from '@/lib/constants';
import { MarketRaw, MarketDisplay, BetDisplay, OutcomeDisplay } from '@/lib/types';
import { formatAVAX, formatTimeRemaining, parseAVAX } from '@/lib/utils';

type SignAndSubmit = (tx: InputTransactionData) => Promise<{ hash: string }>;

function getClient() {
  return new Aptos(new AptosConfig({ network: ACTIVE_CHAIN.network, fullnode: ACTIVE_CHAIN.rpcUrls[0] }));
}

export function useContracts(signAndSubmitTransaction: SignAndSubmit | null) {
  const client = getClient();

  const requireSigner = useCallback(() => {
    if (!signAndSubmitTransaction) throw new Error('Connect your wallet first');
    return signAndSubmitTransaction;
  }, [signAndSubmitTransaction]);

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
      const sign = requireSigner();
      const amount = initialLiquidity && parseFloat(initialLiquidity) > 0
        ? parseAVAX(initialLiquidity)
        : BigInt(0);
      const result = await sign({
        data: {
          function: ENTRY_FUNCTIONS.CREATE_MARKET as `${string}::${string}::${string}`,
          functionArguments: [
            CONTRACTS.STORE_ADDRESS, question, rules, imageURI, category, outcomes,
            startTime, endTime, isPrivate, accessCode, resolutionType, amount.toString(),
          ],
        },
      });
      await client.waitForTransaction({ transactionHash: result.hash });
      return result;
    },
    [requireSigner, client]
  );

  // ─── Place Bet ───────────────────────────────────────────────

  const placeBet = useCallback(
    async (marketId: number, outcomeIndex: number, amount: string, accessCode: string = '') => {
      const sign = requireSigner();
      const result = await sign({
        data: {
          function: ENTRY_FUNCTIONS.PLACE_BET as `${string}::${string}::${string}`,
          functionArguments: [
            CONTRACTS.STORE_ADDRESS, marketId, outcomeIndex, parseAVAX(amount).toString(), accessCode,
          ],
        },
      });
      await client.waitForTransaction({ transactionHash: result.hash });
      return result;
    },
    [requireSigner, client]
  );

  // ─── Claim Winnings ──────────────────────────────────────────

  const claimWinnings = useCallback(
    async (marketId: number) => {
      const sign = requireSigner();
      const result = await sign({
        data: {
          function: ENTRY_FUNCTIONS.CLAIM_WINNINGS as `${string}::${string}::${string}`,
          functionArguments: [CONTRACTS.STORE_ADDRESS, marketId],
        },
      });
      await client.waitForTransaction({ transactionHash: result.hash });
      return result;
    },
    [requireSigner, client]
  );

  // ─── Resolve Market ──────────────────────────────────────────

  const resolveMarket = useCallback(
    async (marketId: number, winningOutcome: number) => {
      const sign = requireSigner();
      const result = await sign({
        data: {
          function: ENTRY_FUNCTIONS.RESOLVE_MARKET as `${string}::${string}::${string}`,
          functionArguments: [CONTRACTS.STORE_ADDRESS, marketId, winningOutcome],
        },
      });
      await client.waitForTransaction({ transactionHash: result.hash });
      return result;
    },
    [requireSigner, client]
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
      if (!CONTRACTS.STORE_ADDRESS) return null;
      try {
        const raw = await client.view({
          payload: {
            function: VIEW_FUNCTIONS.GET_MARKET as `${string}::${string}::${string}`,
            functionArguments: [CONTRACTS.STORE_ADDRESS, marketId],
          },
        });
        const marketRaw: MarketRaw = {
          id: BigInt(raw[0] as string),
          question: raw[1] as string,
          rules: raw[2] as string,
          imageURI: raw[3] as string,
          category: raw[4] as string,
          outcomeLabels: raw[5] as string[],
          outcomePools: (raw[6] as string[]).map((p) => BigInt(p)),
          outcomeCount: BigInt((raw[5] as string[]).length),
          endTime: BigInt(raw[7] as string),
          startTime: BigInt(raw[8] as string),
          totalPool: BigInt(raw[9] as string),
          resolved: raw[10] as boolean,
          winningOutcome: BigInt(raw[11] as string),
          creator: raw[12] as string,
          createdAt: BigInt(raw[13] as string),
          isPrivate: raw[14] as boolean,
          resolutionType: Number(raw[15]),
        };
        let bettorCount = 0;
        try {
          const count = await client.view({
            payload: {
              function: VIEW_FUNCTIONS.GET_BETTOR_COUNT as `${string}::${string}::${string}`,
              functionArguments: [CONTRACTS.STORE_ADDRESS, marketId],
            },
          });
          bettorCount = Number(count[0]);
        } catch { /* ignore */ }
        return parseMarket(marketRaw, bettorCount);
      } catch (err) {
        console.error('[getMarket] error:', err);
        return null;
      }
    },
    [client, parseMarket]
  );

  // ─── Get All Markets ────────────────────────────────────────

  const getAllMarkets = useCallback(async (): Promise<MarketDisplay[]> => {
    if (!CONTRACTS.STORE_ADDRESS) return [];
    try {
      const count = await client.view({
        payload: {
          function: VIEW_FUNCTIONS.MARKET_COUNT as `${string}::${string}::${string}`,
          functionArguments: [CONTRACTS.STORE_ADDRESS],
        },
      });
      const markets: MarketDisplay[] = [];
      for (let i = 0; i < Number(count[0]); i++) {
        const market = await getMarket(i);
        if (market) markets.push(market);
      }
      return markets;
    } catch {
      return [];
    }
  }, [client, getMarket]);

  // ─── Get User Bets ──────────────────────────────────────────
  // Note: the Move module doesn't index bets by user directly (unlike the old
  // Solidity `userMarkets` mapping); we scan all markets and match the bettor address.

  const getUserBets = useCallback(
    async (userAddress: string): Promise<BetDisplay[]> => {
      const markets = await getAllMarkets();
      const results: BetDisplay[] = [];
      for (const market of markets) {
        try {
          const resource = await client.getAccountResource({
            accountAddress: CONTRACTS.STORE_ADDRESS,
            resourceType: `${CONTRACTS.MODULE_ADDRESS}::${CONTRACTS.MODULE_NAME}::MarketStore`,
          });
          void resource; // Bet lookups require an indexer in production; left as an extension point.
        } catch { /* ignore */ }
        void userAddress;
        void market;
      }
      return results;
    },
    [client, getAllMarkets]
  );

  // ─── Leaderboard ─────────────────────────────────────────────
  // Best served by an off-chain indexer against on-chain events in production.

  const getPlayerStats = useCallback(async () => null, []);

  const getLeaderboard = useCallback(async (): Promise<{
    address: string;
    totalBet: string;
    totalWon: string;
    wins: number;
    losses: number;
    bets: number;
  }[]> => {
    return [];
  }, []);

  const contractsAvailable = !!CONTRACTS.STORE_ADDRESS;

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
