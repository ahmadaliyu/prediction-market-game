// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PredictionMarket.sol";

/**
 * @title MarketFactory
 * @notice Factory contract to deploy and manage multiple PredictionMarket instances
 * @dev Tracks all deployed markets and provides global leaderboard data
 */
contract MarketFactory {
    // ═══════════════════════════════════════════════════════════════
    //                        STATE VARIABLES
    // ═══════════════════════════════════════════════════════════════

    address public owner;
    PredictionMarket public predictionMarket;

    // Leaderboard tracking
    struct PlayerStats {
        uint256 totalBets;
        uint256 totalWins;
        uint256 totalAmountBet;
        uint256 totalWinnings;
        uint256 currentStreak;
        uint256 bestStreak;
        uint256 gamesPlayed;
    }

    mapping(address => PlayerStats) public playerStats;
    address[] public allPlayers;
    mapping(address => bool) public isRegistered;

    // AI Agent tracking
    struct AIAgent {
        string name;
        string personality; // "aggressive", "conservative", "balanced", "chaotic"
        string avatarURI;
        address agentAddress;
        bool isActive;
        uint256 totalPredictions;
        uint256 correctPredictions;
    }

    mapping(address => AIAgent) public aiAgents;
    address[] public aiAgentAddresses;

    // ═══════════════════════════════════════════════════════════════
    //                          EVENTS
    // ═══════════════════════════════════════════════════════════════

    event PlayerRegistered(address indexed player);
    event StatsUpdated(address indexed player, uint256 totalWins, uint256 totalBets);
    event AIAgentRegistered(address indexed agent, string name, string personality);

    // ═══════════════════════════════════════════════════════════════
    //                        CONSTRUCTOR
    // ═══════════════════════════════════════════════════════════════

    constructor(address _predictionMarket) {
        owner = msg.sender;
        predictionMarket = PredictionMarket(payable(_predictionMarket));
    }

    // ═══════════════════════════════════════════════════════════════
    //                     PLAYER MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    function registerPlayer() external {
        require(!isRegistered[msg.sender], "Already registered");
        isRegistered[msg.sender] = true;
        allPlayers.push(msg.sender);
        emit PlayerRegistered(msg.sender);
    }

    function recordBetResult(
        address _player,
        uint256 _amount,
        bool _won,
        uint256 _winnings
    ) external {
        require(msg.sender == owner || msg.sender == address(predictionMarket), "Not authorized");

        if (!isRegistered[_player]) {
            isRegistered[_player] = true;
            allPlayers.push(_player);
        }

        PlayerStats storage stats = playerStats[_player];
        stats.totalBets++;
        stats.totalAmountBet += _amount;
        stats.gamesPlayed++;

        if (_won) {
            stats.totalWins++;
            stats.totalWinnings += _winnings;
            stats.currentStreak++;
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
        } else {
            stats.currentStreak = 0;
        }

        emit StatsUpdated(_player, stats.totalWins, stats.totalBets);
    }

    // ═══════════════════════════════════════════════════════════════
    //                     AI AGENT MANAGEMENT
    // ═══════════════════════════════════════════════════════════════

    function registerAIAgent(
        address _agentAddress,
        string calldata _name,
        string calldata _personality,
        string calldata _avatarURI
    ) external {
        require(msg.sender == owner, "Only owner");
        require(!aiAgents[_agentAddress].isActive, "Agent already registered");

        aiAgents[_agentAddress] = AIAgent({
            name: _name,
            personality: _personality,
            avatarURI: _avatarURI,
            agentAddress: _agentAddress,
            isActive: true,
            totalPredictions: 0,
            correctPredictions: 0
        });

        aiAgentAddresses.push(_agentAddress);
        emit AIAgentRegistered(_agentAddress, _name, _personality);
    }

    function updateAIAgentStats(
        address _agentAddress,
        bool _correct
    ) external {
        require(msg.sender == owner, "Only owner");
        AIAgent storage agent = aiAgents[_agentAddress];
        require(agent.isActive, "Agent not active");

        agent.totalPredictions++;
        if (_correct) {
            agent.correctPredictions++;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    //                      VIEW FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function getPlayerStats(address _player) external view returns (PlayerStats memory) {
        return playerStats[_player];
    }

    function getAllPlayers() external view returns (address[] memory) {
        return allPlayers;
    }

    function getPlayerCount() external view returns (uint256) {
        return allPlayers.length;
    }

    function getAIAgent(address _agent) external view returns (AIAgent memory) {
        return aiAgents[_agent];
    }

    function getAllAIAgents() external view returns (address[] memory) {
        return aiAgentAddresses;
    }

    function getLeaderboard(
        uint256 _limit
    ) external view returns (address[] memory, PlayerStats[] memory) {
        uint256 count = _limit > allPlayers.length ? allPlayers.length : _limit;
        address[] memory topPlayers = new address[](count);
        PlayerStats[] memory topStats = new PlayerStats[](count);

        // Simple copy first N (frontend sorts)
        for (uint256 i = 0; i < count; i++) {
            topPlayers[i] = allPlayers[i];
            topStats[i] = playerStats[allPlayers[i]];
        }

        return (topPlayers, topStats);
    }

    // ═══════════════════════════════════════════════════════════════
    //                      ADMIN FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function setPredictionMarket(address _market) external {
        require(msg.sender == owner, "Only owner");
        predictionMarket = PredictionMarket(payable(_market));
    }

    function transferOwnership(address _newOwner) external {
        require(msg.sender == owner, "Only owner");
        owner = _newOwner;
    }
}
