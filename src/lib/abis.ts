export const PredictionMarketABI = [
  // Market Management
  {
    inputs: [
      { name: "_question", type: "string" },
      { name: "_imageURI", type: "string" },
      { name: "_category", type: "string" },
      { name: "_endTime", type: "uint256" },
    ],
    name: "createMarket",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_position", type: "bool" },
    ],
    name: "placeBet",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      { name: "_marketId", type: "uint256" },
      { name: "_outcome", type: "bool" },
    ],
    name: "resolveMarket",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "claimWinnings",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },

  // View Functions
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarket",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "question", type: "string" },
          { name: "imageURI", type: "string" },
          { name: "category", type: "string" },
          { name: "endTime", type: "uint256" },
          { name: "totalYesAmount", type: "uint256" },
          { name: "totalNoAmount", type: "uint256" },
          { name: "resolved", type: "bool" },
          { name: "outcome", type: "bool" },
          { name: "creator", type: "address" },
          { name: "createdAt", type: "uint256" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
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
          { name: "position", type: "bool" },
          { name: "claimed", type: "bool" },
        ],
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarketOdds",
    outputs: [
      { name: "yesPercent", type: "uint256" },
      { name: "noPercent", type: "uint256" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getTotalPool",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_marketId", type: "uint256" }],
    name: "getMarketBettors",
    outputs: [{ name: "", type: "address[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ name: "_user", type: "address" }],
    name: "getUserMarkets",
    outputs: [{ name: "", type: "uint256[]" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketCount",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "platformFeePercent",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },

  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "question", type: "string" },
      { indexed: false, name: "category", type: "string" },
      { indexed: false, name: "endTime", type: "uint256" },
      { indexed: true, name: "creator", type: "address" },
    ],
    name: "MarketCreated",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: true, name: "bettor", type: "address" },
      { indexed: false, name: "position", type: "bool" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
    name: "BetPlaced",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "marketId", type: "uint256" },
      { indexed: false, name: "outcome", type: "bool" },
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
      { indexed: false, name: "amount", type: "uint256" },
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
