// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PredictionMarket
 * @notice Core prediction market contract for the Avalanche Prediction Arena
 * @dev Supports binary outcome markets with AVAX betting, fee collection, and resolution
 */
contract PredictionMarket {
    // ═══════════════════════════════════════════════════════════════
    //                          STRUCTS
    // ═══════════════════════════════════════════════════════════════

    struct Market {
        uint256 id;
        string question;
        string imageURI;
        string category;
        uint256 endTime;
        uint256 totalYesAmount;
        uint256 totalNoAmount;
        bool resolved;
        bool outcome; // true = YES won, false = NO won
        address creator;
        uint256 createdAt;
    }

    struct Bet {
        uint256 amount;
        bool position; // true = YES, false = NO
        bool claimed;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    address public owner;
    address public resolver; // authorized resolver (can be DAO or oracle)
    uint256 public marketCount;
    uint256 public platformFeePercent = 200; // 2% in basis points
    uint256 public constant MAX_FEE = 1000; // 10% max
    uint256 public totalFeesCollected;

    mapping(uint256 => Market) public markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;
    mapping(address => uint256[]) public userMarkets;
    mapping(address => uint256) public userTotalWinnings;
    mapping(address => uint256) public userTotalBets;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string category,
        uint256 endTime,
        address indexed creator
    );
    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        bool position,
        uint256 amount
    );
    event MarketResolved(
        uint256 indexed marketId,
        bool outcome,
        uint256 totalPool
    );
    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed bettor,
        uint256 amount
    );
    event FeesWithdrawn(address indexed to, uint256 amount);

    // ═══════════════════════════════════════════════════════════════
    //                         MODIFIERS
    // ═══════════════════════════════════════════════════════════════

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyResolver() {
        require(
            msg.sender == resolver || msg.sender == owner,
            "Not authorized to resolve"
        );
        _;
    }

    modifier marketExists(uint256 _marketId) {
        require(_marketId < marketCount, "Market does not exist");
        _;
    }

    // ═══════════════════════════════════════════════════════════════
    //                        CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor() {
        owner = msg.sender;
        resolver = msg.sender;
    }

    // ═══════════════════════════════════════════════════════════════
    //                      MARKET MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    /**
     * @notice Create a new prediction market
     * @param _question The question for the market
     * @param _imageURI Optional image URI for the market
     * @param _category Category tag (e.g., "crypto", "sports", "politics")
     * @param _endTime Unix timestamp when betting closes
     */
    function createMarket(
        string calldata _question,
        string calldata _imageURI,
        string calldata _category,
        uint256 _endTime
    ) external returns (uint256) {
        require(_endTime > block.timestamp, "End time must be in the future");
        require(bytes(_question).length > 0, "Question cannot be empty");

        uint256 marketId = marketCount;
        markets[marketId] = Market({
            id: marketId,
            question: _question,
            imageURI: _imageURI,
            category: _category,
            endTime: _endTime,
            totalYesAmount: 0,
            totalNoAmount: 0,
            resolved: false,
            outcome: false,
            creator: msg.sender,
            createdAt: block.timestamp
        });

        marketCount++;

        emit MarketCreated(marketId, _question, _category, _endTime, msg.sender);
        return marketId;
    }

    /**
     * @notice Place a bet on a market
     * @param _marketId The market to bet on
     * @param _position true for YES, false for NO
     */
    function placeBet(
        uint256 _marketId,
        bool _position
    ) external payable marketExists(_marketId) {
        Market storage market = markets[_marketId];
        require(block.timestamp < market.endTime, "Market has ended");
        require(!market.resolved, "Market already resolved");
        require(msg.value > 0, "Bet amount must be > 0");
        require(bets[_marketId][msg.sender].amount == 0, "Already bet on this market");

        bets[_marketId][msg.sender] = Bet({
            amount: msg.value,
            position: _position,
            claimed: false
        });

        if (_position) {
            market.totalYesAmount += msg.value;
        } else {
            market.totalNoAmount += msg.value;
        }

        marketBettors[_marketId].push(msg.sender);
        userMarkets[msg.sender].push(_marketId);
        userTotalBets[msg.sender] += msg.value;

        emit BetPlaced(_marketId, msg.sender, _position, msg.value);
    }

    /**
     * @notice Resolve a market with the final outcome
     * @param _marketId The market to resolve
     * @param _outcome true = YES won, false = NO won
     */
    function resolveMarket(
        uint256 _marketId,
        bool _outcome
    ) external onlyResolver marketExists(_marketId) {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Already resolved");
        require(block.timestamp >= market.endTime, "Market not ended yet");

        market.resolved = true;
        market.outcome = _outcome;

        uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
        uint256 fee = (totalPool * platformFeePercent) / 10000;
        totalFeesCollected += fee;

        emit MarketResolved(
            _marketId,
            _outcome,
            totalPool
        );
    }

    /**
     * @notice Claim winnings from a resolved market
     * @param _marketId The market to claim from
     */
    function claimWinnings(
        uint256 _marketId
    ) external marketExists(_marketId) {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");

        Bet storage bet = bets[_marketId][msg.sender];
        require(bet.amount > 0, "No bet placed");
        require(!bet.claimed, "Already claimed");
        require(bet.position == market.outcome, "Did not win");

        bet.claimed = true;

        uint256 totalPool = market.totalYesAmount + market.totalNoAmount;
        uint256 fee = (totalPool * platformFeePercent) / 10000;
        uint256 distributablePool = totalPool - fee;

        uint256 winningPool = market.outcome
            ? market.totalYesAmount
            : market.totalNoAmount;

        uint256 payout = (bet.amount * distributablePool) / winningPool;
        userTotalWinnings[msg.sender] += payout;

        (bool success, ) = payable(msg.sender).call{value: payout}("");
        require(success, "Transfer failed");

        emit WinningsClaimed(_marketId, msg.sender, payout);
    }

    // ═══════════════════════════════════════════════════════════════
    //                        VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getMarket(uint256 _marketId) external view returns (Market memory) {
        return markets[_marketId];
    }

    function getBet(
        uint256 _marketId,
        address _bettor
    ) external view returns (Bet memory) {
        return bets[_marketId][_bettor];
    }

    function getMarketBettors(
        uint256 _marketId
    ) external view returns (address[] memory) {
        return marketBettors[_marketId];
    }

    function getUserMarkets(
        address _user
    ) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    function getMarketOdds(
        uint256 _marketId
    ) external view returns (uint256 yesPercent, uint256 noPercent) {
        Market storage market = markets[_marketId];
        uint256 total = market.totalYesAmount + market.totalNoAmount;
        if (total == 0) return (50, 50);
        yesPercent = (market.totalYesAmount * 100) / total;
        noPercent = 100 - yesPercent;
    }

    function getTotalPool(uint256 _marketId) external view returns (uint256) {
        Market storage market = markets[_marketId];
        return market.totalYesAmount + market.totalNoAmount;
    }

    // ═══════════════════════════════════════════════════════════════
    //                      ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function setResolver(address _resolver) external onlyOwner {
        resolver = _resolver;
    }

    function setFeePercent(uint256 _feePercent) external onlyOwner {
        require(_feePercent <= MAX_FEE, "Fee too high");
        platformFeePercent = _feePercent;
    }

    function withdrawFees(address _to) external onlyOwner {
        uint256 amount = totalFeesCollected;
        require(amount > 0, "No fees to withdraw");
        totalFeesCollected = 0;
        (bool success, ) = payable(_to).call{value: amount}("");
        require(success, "Transfer failed");
        emit FeesWithdrawn(_to, amount);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    receive() external payable {}
}
