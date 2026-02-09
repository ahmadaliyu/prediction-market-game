// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title PredictionMarket
 * @notice Multi-outcome prediction market with creator fees, public/private markets,
 *         and manual or AI-oracle resolution.
 *
 * Each market has N custom outcomes + 1 mandatory "Unclassified" fallback.
 * - Creator earns 1.2% of total volume.
 * - Platform earns 0.8% of total volume.
 * - Anyone who bets receives shares proportional to their stake in an outcome.
 * - Winners split the distributable pool proportionally.
 */
contract PredictionMarket {

    // ─── Structs ───────────────────────────────────────────────

    struct Market {
        uint256 id;
        string question;
        string rules;
        string imageURI;
        string category;
        string[] outcomeLabels;          // includes "Unclassified" as last element
        uint256[] outcomePools;           // total AVAX staked per outcome
        uint256 outcomeCount;             // length of outcomeLabels
        uint256 endTime;
        uint256 startTime;
        uint256 totalPool;
        bool resolved;
        uint256 winningOutcome;           // index into outcomeLabels
        address creator;
        uint256 createdAt;
        bool isPrivate;
        bytes32 accessCodeHash;           // keccak256 of access code (0 for public)
        uint8 resolutionType;             // 0 = manual (creator), 1 = AI oracle
    }

    struct Bet {
        uint256 amount;
        uint256 outcomeIndex;
        bool claimed;
    }

    // ─── State ─────────────────────────────────────────────────

    address public owner;
    uint256 public marketCount;

    uint256 public constant CREATOR_FEE_BPS  = 120;   // 1.2%
    uint256 public constant PLATFORM_FEE_BPS = 80;    // 0.8%
    uint256 public constant BPS_DENOM        = 10000;

    uint256 public totalPlatformFees;

    mapping(uint256 => Market) internal _markets;
    mapping(uint256 => mapping(address => Bet)) public bets;
    mapping(uint256 => address[]) public marketBettors;
    mapping(address => uint256[]) public userMarkets;

    // ─── Events ────────────────────────────────────────────────

    event MarketCreated(
        uint256 indexed marketId,
        string question,
        string category,
        uint256 outcomeCount,
        uint256 startTime,
        uint256 endTime,
        address indexed creator,
        bool isPrivate,
        uint8 resolutionType
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed bettor,
        uint256 outcomeIndex,
        uint256 amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        uint256 winningOutcome,
        string winningLabel,
        uint256 totalPool
    );

    event WinningsClaimed(
        uint256 indexed marketId,
        address indexed bettor,
        uint256 payout
    );

    event FeesWithdrawn(address indexed to, uint256 amount);

    // ─── Modifiers ─────────────────────────────────────────────

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier marketExists(uint256 _id) {
        require(_id < marketCount, "Market does not exist");
        _;
    }

    // ─── Constructor ───────────────────────────────────────────

    constructor() {
        owner = msg.sender;
    }

    // ─── Market Creation ───────────────────────────────────────

    /**
     * @param _question     The prediction question (max 150 chars enforced on frontend)
     * @param _rules        Resolution rules/criteria
     * @param _imageURI     Optional image URL
     * @param _category     Category tag (crypto, sports, etc.)
     * @param _outcomes     Array of outcome labels (WITHOUT "Unclassified" – it is appended automatically)
     * @param _startTime    Unix timestamp when betting opens (0 = now)
     * @param _endTime      Unix timestamp when betting closes
     * @param _isPrivate    Whether the market requires an access code
     * @param _accessCode   Plain-text access code (hashed on-chain). Pass "" for public.
     * @param _resolutionType  0 = manual (creator resolves), 1 = AI oracle
     */
    function createMarket(
        string calldata _question,
        string calldata _rules,
        string calldata _imageURI,
        string calldata _category,
        string[] calldata _outcomes,
        uint256 _startTime,
        uint256 _endTime,
        bool _isPrivate,
        string calldata _accessCode,
        uint8 _resolutionType
    ) external payable returns (uint256) {
        require(bytes(_question).length > 0, "Question required");
        require(_outcomes.length >= 2, "Need at least 2 outcomes");
        require(_outcomes.length <= 10, "Max 10 outcomes");
        require(_endTime > block.timestamp, "End time must be future");

        uint256 startTime = _startTime == 0 ? block.timestamp : _startTime;
        require(_endTime > startTime, "End must be after start");

        // Build outcome arrays (user outcomes + "Unclassified")
        uint256 totalOutcomes = _outcomes.length + 1;
        string[] memory labels = new string[](totalOutcomes);
        uint256[] memory pools = new uint256[](totalOutcomes);

        for (uint256 i = 0; i < _outcomes.length; i++) {
            require(bytes(_outcomes[i]).length > 0, "Empty outcome label");
            labels[i] = _outcomes[i];
            pools[i] = 0;
        }
        labels[totalOutcomes - 1] = "Unclassified";
        pools[totalOutcomes - 1] = 0;

        bytes32 codeHash = bytes(_accessCode).length > 0
            ? keccak256(abi.encodePacked(_accessCode))
            : bytes32(0);

        uint256 marketId = marketCount;

        Market storage m = _markets[marketId];
        m.id = marketId;
        m.question = _question;
        m.rules = _rules;
        m.imageURI = _imageURI;
        m.category = _category;
        m.outcomeCount = totalOutcomes;
        m.endTime = _endTime;
        m.startTime = startTime;
        m.totalPool = 0;
        m.resolved = false;
        m.winningOutcome = 0;
        m.creator = msg.sender;
        m.createdAt = block.timestamp;
        m.isPrivate = _isPrivate;
        m.accessCodeHash = codeHash;
        m.resolutionType = _resolutionType;

        // Copy arrays into storage
        for (uint256 i = 0; i < totalOutcomes; i++) {
            m.outcomeLabels.push(labels[i]);
            m.outcomePools.push(pools[i]);
        }

        marketCount++;

        // If creator sends initial liquidity, split across outcomes
        if (msg.value > 0) {
            uint256 perOutcome = msg.value / totalOutcomes;
            uint256 remainder = msg.value - (perOutcome * totalOutcomes);
            for (uint256 i = 0; i < totalOutcomes; i++) {
                uint256 amt = perOutcome;
                if (i == 0) amt += remainder; // give remainder to first outcome
                m.outcomePools[i] += amt;
            }
            m.totalPool += msg.value;
        }

        emit MarketCreated(
            marketId, _question, _category, totalOutcomes,
            startTime, _endTime, msg.sender, _isPrivate, _resolutionType
        );

        return marketId;
    }

    // ─── Betting ───────────────────────────────────────────────

    function placeBet(
        uint256 _marketId,
        uint256 _outcomeIndex,
        string calldata _accessCode
    ) external payable marketExists(_marketId) {
        Market storage m = _markets[_marketId];
        require(block.timestamp >= m.startTime, "Market not started");
        require(block.timestamp < m.endTime, "Market ended");
        require(!m.resolved, "Already resolved");
        require(msg.value > 0, "Amount must be > 0");
        require(_outcomeIndex < m.outcomeCount, "Invalid outcome");
        require(bets[_marketId][msg.sender].amount == 0, "Already bet");

        // Private market access check
        if (m.isPrivate) {
            require(
                keccak256(abi.encodePacked(_accessCode)) == m.accessCodeHash,
                "Invalid access code"
            );
        }

        bets[_marketId][msg.sender] = Bet({
            amount: msg.value,
            outcomeIndex: _outcomeIndex,
            claimed: false
        });

        m.outcomePools[_outcomeIndex] += msg.value;
        m.totalPool += msg.value;

        marketBettors[_marketId].push(msg.sender);
        userMarkets[msg.sender].push(_marketId);

        emit BetPlaced(_marketId, msg.sender, _outcomeIndex, msg.value);
    }

    // ─── Resolution ────────────────────────────────────────────

    function resolveMarket(
        uint256 _marketId,
        uint256 _winningOutcome
    ) external marketExists(_marketId) {
        Market storage m = _markets[_marketId];
        require(!m.resolved, "Already resolved");
        require(block.timestamp >= m.endTime, "Market not ended");
        require(_winningOutcome < m.outcomeCount, "Invalid outcome");

        // Authorization: creator for manual, owner for AI oracle
        if (m.resolutionType == 0) {
            require(msg.sender == m.creator, "Only creator can resolve");
        } else {
            require(msg.sender == owner, "Only oracle/owner can resolve");
        }

        m.resolved = true;
        m.winningOutcome = _winningOutcome;

        // Calculate fees
        uint256 creatorFee  = (m.totalPool * CREATOR_FEE_BPS) / BPS_DENOM;
        uint256 platformFee = (m.totalPool * PLATFORM_FEE_BPS) / BPS_DENOM;
        totalPlatformFees += platformFee;

        // Pay creator fee
        if (creatorFee > 0) {
            (bool ok, ) = payable(m.creator).call{value: creatorFee}("");
            require(ok, "Creator fee transfer failed");
        }

        emit MarketResolved(
            _marketId,
            _winningOutcome,
            m.outcomeLabels[_winningOutcome],
            m.totalPool
        );
    }

    // ─── Claiming ──────────────────────────────────────────────

    function claimWinnings(uint256 _marketId) external marketExists(_marketId) {
        Market storage m = _markets[_marketId];
        require(m.resolved, "Not resolved");

        Bet storage bet = bets[_marketId][msg.sender];
        require(bet.amount > 0, "No bet");
        require(!bet.claimed, "Already claimed");
        require(bet.outcomeIndex == m.winningOutcome, "Did not win");

        bet.claimed = true;

        uint256 totalFees = ((CREATOR_FEE_BPS + PLATFORM_FEE_BPS) * m.totalPool) / BPS_DENOM;
        uint256 distributable = m.totalPool - totalFees;
        uint256 winPool = m.outcomePools[m.winningOutcome];

        uint256 payout = 0;
        if (winPool > 0) {
            payout = (bet.amount * distributable) / winPool;
        }

        if (payout > 0) {
            (bool ok, ) = payable(msg.sender).call{value: payout}("");
            require(ok, "Payout failed");
        }

        emit WinningsClaimed(_marketId, msg.sender, payout);
    }

    // ─── View Functions ────────────────────────────────────────

    function getMarket(uint256 _marketId) external view returns (
        uint256 id,
        string memory question,
        string memory rules,
        string memory imageURI,
        string memory category,
        string[] memory outcomeLabels,
        uint256[] memory outcomePools,
        uint256 outcomeCount,
        uint256 endTime,
        uint256 startTime,
        uint256 totalPool,
        bool resolved,
        uint256 winningOutcome,
        address creator,
        uint256 createdAt,
        bool isPrivate,
        uint8 resolutionType
    ) {
        Market storage m = _markets[_marketId];
        return (
            m.id, m.question, m.rules, m.imageURI, m.category,
            m.outcomeLabels, m.outcomePools, m.outcomeCount,
            m.endTime, m.startTime, m.totalPool,
            m.resolved, m.winningOutcome, m.creator, m.createdAt,
            m.isPrivate, m.resolutionType
        );
    }

    function getBet(uint256 _marketId, address _bettor) external view returns (Bet memory) {
        return bets[_marketId][_bettor];
    }

    function getMarketBettors(uint256 _marketId) external view returns (address[] memory) {
        return marketBettors[_marketId];
    }

    function getUserMarkets(address _user) external view returns (uint256[] memory) {
        return userMarkets[_user];
    }

    function getOutcomeOdds(uint256 _marketId) external view returns (uint256[] memory percents) {
        Market storage m = _markets[_marketId];
        percents = new uint256[](m.outcomeCount);
        if (m.totalPool == 0) {
            uint256 equal = 100 / m.outcomeCount;
            for (uint256 i = 0; i < m.outcomeCount; i++) {
                percents[i] = equal;
            }
            // give remainder to first
            percents[0] += 100 - (equal * m.outcomeCount);
        } else {
            uint256 assigned = 0;
            for (uint256 i = 0; i < m.outcomeCount; i++) {
                percents[i] = (m.outcomePools[i] * 100) / m.totalPool;
                assigned += percents[i];
            }
            // give rounding remainder to largest pool
            if (assigned < 100) {
                uint256 maxIdx = 0;
                for (uint256 i = 1; i < m.outcomeCount; i++) {
                    if (m.outcomePools[i] > m.outcomePools[maxIdx]) maxIdx = i;
                }
                percents[maxIdx] += 100 - assigned;
            }
        }
    }

    // ─── Admin ─────────────────────────────────────────────────

    function withdrawPlatformFees(address _to) external onlyOwner {
        uint256 amount = totalPlatformFees;
        require(amount > 0, "No fees");
        totalPlatformFees = 0;
        (bool ok, ) = payable(_to).call{value: amount}("");
        require(ok, "Transfer failed");
        emit FeesWithdrawn(_to, amount);
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid");
        owner = _newOwner;
    }

    receive() external payable {}
}
