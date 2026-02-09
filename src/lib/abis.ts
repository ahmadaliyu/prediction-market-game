export const PredictionMarketABI = [
  // ─── createMarket ────────────────────────────────────────────
  {
    inputs: [
      { name: "_question", type: "string" },
      { name: "_rules", type: "string" },
      { name: "_imageURI", type: "string" },
      { name: "_category", type: "string" },
      { name: "_outcomes", type: "string[]" },
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
      { name: "_isPrivate", type: "bool" },
      { name: "_accessCode", type: "string" },
      { name: "_resolutionType", type: "uint8" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "payable",
    type: "function",
  },

  // ─── placeBet ────────────────────────────────────────────────
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcomeIndex", type: "uint256" },
      { name: "_accessCode", type: "string" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },

  // ─── resolveMarket ──────────────────────────────────────────
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_winningOutcome", type: "uint256" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ─── claimWinnings ──────────────────────────────────────────
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // ─── getMarket ──────────────────────────────────────────────
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "question", type: "string" },
      { name: "rules", type: "string" },
      { name: "imageURI", type: "string" },
      { name: "category", type: "string" },
      { name: "outcomeLabels", type: "string[]" },
      { name: "outcomePools", type: "uint256[]" },
      { name: "outcomeCount", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "totalPool", type: "uint256" },
      { name: "resolved", type: "bool" },
      { name: "winningOutcome", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "createdAt", type: "uint256" },
      { name: "isPrivate", type: "bool" },
      { name: "resolutionType", type: "uint8" },
    ],
    stateMutability: "view",
    type: "function",
  },

  // ─── getBet ─────────────────────────────────────────────────
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_bettor", type: "address" },
    ],
    name: "getBet",
    outputs: [
      {
        components: [
          { name: "amount", type: "uint256" },
          { name: "outcomeIndex", type: "uint256" },
          { name: "claimed", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },

  // ─── getOutcomeOdds ─────────────────────────────────────────
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getOutcomeOdds",
    outputs: [{ name: "percents", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },

  // ─── getMarketBettors ───────────────────────────────────────
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarketBettors",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },

  // ─── getUserMarkets ─────────────────────────────────────────
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserMarkets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },

  // ─── marketCount ────────────────────────────────────────────
  {
    inputs: [],
    name: "marketCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // ─── Events ─────────────────────────────────────────────────
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "question", type: "string" },
      { indexed: false, name: "category", type: "string" },
      { indexed: false, name: "outcomeCount", type: "uint256" },
      { indexed: false, name: "startTime", type: "uint256" },
      { indexed: false, name: "endTime", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
      { indexed: false, name: "isPrivate", type: "bool" },
      { indexed: false, name: "resolutionType", type: "uint8" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "bettor", type: "address" },
      { indexed: false, name: "outcomeIndex", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BetPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "winningOutcome", type: "uint256" },
      { indexed: false, name: "winningLabel", type: "string" },
      { indexed: false, name: "totalPool", type: "uint256" },
    ],
    name: "MarketResolved",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "bettor", type: "address" },
      { indexed: false, name: "payout", type: "uint256" },
    ],
    name: "WinningsClaimed",
    type: "event",
  },
] as const;

export const MarketFactoryABI = [
  {
    inputs: [{ name: "_predictionMarket", type: "address" }],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "registerPlayer",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_player", type: "address" },
      { name: "_amount", type: "uint256" },
      { name: "_won", type: "bool" },
      { name: "_winnings", type: "uint256" },
    ],
    name: "recordBetResult",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_player", type: "address" }],
    name: "getPlayerStats",
    outputs: [
      {
        components: [
          { name: "totalBets", type: "uint256" },
          { name: "totalWins", type: "uint256" },
          { name: "totalAmountBet", type: "uint256" },
          { name: "totalWinnings", type: "uint256" },
          { name: "currentStreak", type: "uint256" },
          { name: "bestStreak", type: "uint256" },
          { name: "gamesPlayed", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllPlayers",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getPlayerCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_limit", type: "uint256" }],
    name: "getLeaderboard",
    outputs: [
      { name: "", type: "address[]" },
      {
        components: [
          { name: "totalBets", type: "uint256" },
          { name: "totalWins", type: "uint256" },
          { name: "totalAmountBet", type: "uint256" },
          { name: "totalWinnings", type: "uint256" },
          { name: "currentStreak", type: "uint256" },
          { name: "bestStreak", type: "uint256" },
          { name: "gamesPlayed", type: "uint256" },
        ],
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_agent", type: "address" }],
    name: "getAIAgent",
    outputs: [
      {
        components: [
          { name: "name", type: "string" },
          { name: "personality", type: "string" },
          { name: "avatarURI", type: "string" },
          { name: "agentAddress", type: "address" },
          { name: "isActive", type: "bool" },
          { name: "totalPredictions", type: "uint256" },
          { name: "correctPredictions", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getAllAIAgents",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
] as const;
