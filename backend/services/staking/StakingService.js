const crypto = require('crypto');

class StakingService {
  constructor() {
    this.stakeAmount = 100000; // 0.001 token (in smallest unit)
    this.minPlayers = 4;
    this.totalPool = 400000; // 0.004 token (4 players x 0.001 token)
    this.stakedGames = new Map(); // Track staked games
    this.playerStakes = new Map(); // Track individual player stakes
    console.log('💰 Staking service initialized successfully');
    console.log(`💰 Stake amount: ${this.stakeAmount} (smallest unit) per player`);
    console.log(`💰 Total pool: ${this.totalPool} (smallest unit) for 4 players`);
  }

  async checkBalance(playerAddress) {
    // Balance checking is now handled by the wallet on the frontend
    // This method is kept for backward compatibility but returns mock data
    console.log('⚠️ Balance checking should be done on frontend with wallet integration');
    return {
      balance: "1000000000000000000", // 1 token (18 decimals)
      balanceInToken: "1.0",
      sufficient: true,
      mock: true
    };
  }

  async stakeForGame(gameId, playerAddress, roomCode) {
    try {
      console.log(`💰 Player ${playerAddress} staking ${this.stakeAmount} tokens for game ${gameId}`);

      if (!this.validateRoomCode(roomCode)) {
        throw new Error('Invalid room code');
      }

      if (!this.stakedGames.has(gameId)) {
        this.stakedGames.set(gameId, {
          roomCode: roomCode,
          players: [],
          totalStaked: 0,
          status: 'waiting',
          createdAt: Date.now()
        });
      }

      const game = this.stakedGames.get(gameId);

      if (game.players.includes(playerAddress)) {
        throw new Error('Player already staked for this game');
      }

      if (game.players.length >= this.minPlayers) {
        throw new Error('Game is full');
      }

      if (game.status !== 'waiting') {
        throw new Error('Game has already started');
      }

      // Note: Actual staking happens on the frontend via wallet interaction
      // This backend method just tracks the game state
      const txHash = `mock-tx-${Date.now()}`; // Mock transaction hash for tracking

      game.players.push(playerAddress);
      game.totalStaked += this.stakeAmount;

      this.playerStakes.set(`${gameId}-${playerAddress}`, {
        gameId: gameId,
        playerAddress: playerAddress,
        amount: this.stakeAmount,
        txHash: txHash,
        timestamp: Date.now(),
        status: 'staked'
      });

      console.log(`💰 Stake successful! Game ${gameId} now has ${game.players.length}/${this.minPlayers} players`);
      console.log(`💰 Total staked: ${game.totalStaked} tokens`);

      if (game.players.length === this.minPlayers) {
        game.status = 'full';
        console.log(`🎮 Game ${gameId} is ready to start with full stake pool!`);
      }

      return {
        success: true,
        txHash: txHash,
        amount: this.stakeAmount.toString(),
        gameStatus: game.status,
        playersCount: game.players.length,
        totalStaked: game.totalStaked.toString()
      };
    } catch (error) {
      console.error('❌ Error staking for game:', error);
      throw error;
    }
  }

  getGameStakingInfo(gameId) {
    const game = this.stakedGames.get(gameId);
    if (!game) {
      return null;
    }

    return {
      gameId: gameId,
      roomCode: game.roomCode,
      players: game.players,
      playersCount: game.players.length,
      minPlayers: this.minPlayers,
      totalStaked: game.totalStaked.toString(),
      totalStakedInToken: (game.totalStaked / 1000000000000000000).toString(),
      status: game.status,
      createdAt: game.createdAt,
      isReady: game.players.length === this.minPlayers
    };
  }

  // Get player's stake info
  getPlayerStakeInfo(gameId, playerAddress) {
    const stakeKey = `${gameId}-${playerAddress}`;
    const stake = this.playerStakes.get(stakeKey);

    if (!stake) {
      return null;
    }

    return {
      gameId: stake.gameId,
      playerAddress: stake.playerAddress,
      amount: stake.amount.toString(),
      txHash: stake.txHash,
      timestamp: stake.timestamp,
      status: stake.status
    };
  }

  calculateRewards(gameId, winners, losers, gameRoles, eliminatedPlayers) {
    try {
      const game = this.stakedGames.get(gameId);
      if (!game) {
        console.error(`❌ Game ${gameId} not found in stakedGames`);
        console.error(`   Available games:`, Array.from(this.stakedGames.keys()));
        throw new Error(`Game not found in staking service (gameId: ${gameId})`);
      }

      const totalPool = game.totalStaked;
      const houseCutBps = 200; // 2%
      const houseCut = Math.floor((totalPool * houseCutBps) / 10000);
      const rewardPool = totalPool - houseCut;

      // Calculate actual stake per player from the total pool
      const playerCount = game.players.length;
      const stakePerPlayer = playerCount > 0 ? Math.floor(totalPool / playerCount) : 0;

      const rewards = [];
      const mafiaWon = winners.some((player) => gameRoles[player] === 'Mafia');

      if (mafiaWon) {
        const mafiaPlayers = winners.filter((player) => gameRoles[player] === 'Mafia');
        const mafiaRewardPerPlayer = mafiaPlayers.length > 0 ? Math.floor(rewardPool / mafiaPlayers.length) : 0;

        mafiaPlayers.forEach((playerAddress) => {
          rewards.push({
            playerAddress: playerAddress,
            role: 'ASUR',
            stakeAmount: stakePerPlayer.toString(),
            rewardAmount: mafiaRewardPerPlayer.toString(),
            totalReceived: mafiaRewardPerPlayer.toString(), // Winner only gets reward, not stake back
          });
        });

        losers.forEach((playerAddress) => {
          rewards.push({
            playerAddress: playerAddress,
            role: gameRoles[playerAddress] === 'Doctor' ? 'DEVA' : gameRoles[playerAddress] === 'Detective' ? 'RISHI' : 'MANAV',
            stakeAmount: stakePerPlayer.toString(),
            rewardAmount: '0',
            totalReceived: '0',
          });
        });
      } else {
        const allPlayers = Object.keys(gameRoles);
        const nonMafiaPlayers = allPlayers.filter((player) => gameRoles[player] !== 'Mafia');
        const nonMafiaRewardPerPlayer = nonMafiaPlayers.length > 0 ? Math.floor(rewardPool / nonMafiaPlayers.length) : 0;

        nonMafiaPlayers.forEach((playerAddress) => {
          rewards.push({
            playerAddress: playerAddress,
            role: gameRoles[playerAddress] === 'Doctor' ? 'DEVA' : gameRoles[playerAddress] === 'Detective' ? 'RISHI' : 'MANAV',
            stakeAmount: stakePerPlayer.toString(),
            rewardAmount: nonMafiaRewardPerPlayer.toString(),
            totalReceived: nonMafiaRewardPerPlayer.toString(), // Winner only gets reward, not stake back
          });
        });

        losers.forEach((playerAddress) => {
          if (gameRoles[playerAddress] === 'Mafia') {
            rewards.push({
              playerAddress: playerAddress,
              role: 'ASUR',
              stakeAmount: stakePerPlayer.toString(),
              rewardAmount: '0',
              totalReceived: '0',
            });
          }
        });
      }

      return {
        gameId: gameId,
        totalPool: totalPool.toString(),
        houseCut: houseCut.toString(),
        rewardPool: rewardPool.toString(),
        rewards: rewards,
      };
    } catch (error) {
      console.error('❌ Error calculating rewards:', error);
      throw error;
    }
  }

  async distributeRewards(gameId, rewards, blockchainService = null) {
    try {
      // Use provided blockchain service (EVMService)
      let txHash;
      const winners = rewards.rewards.map((r) => r.playerAddress);
      const payoutAmounts = rewards.rewards.map((r) => BigInt(r.totalReceived));

      if (blockchainService) {
        // Use the provided blockchain service (EVMService)
        console.log(`💰 Using provided blockchain service for settlement`);

        // Check if it's EVMService (has settleGame)
        if (typeof blockchainService.settleGame === 'function') {
          // EVMService - uses ECDSA signatures
          console.log(`💰 Settling game ${gameId} with EVMService using ECDSA signatures`);
          txHash = await blockchainService.settleGame(gameId, winners, payoutAmounts);
        } else {
          throw new Error('Blockchain service does not support settlement operations');
        }
      } else {
        throw new Error('No blockchain service provided for settlement');
      }

      const game = this.stakedGames.get(gameId);
      if (game) {
        game.status = 'completed';
        game.completedAt = Date.now();
      }

      // Use EVM token decimals (18)
      const decimals = 1e18;
      const tokenSymbol = process.env.NATIVE_TOKEN_SYMBOL || 'ETH';

      // Format distributions for frontend with proper decimal conversion
      const distributions = rewards.rewards.map((r) => ({
        playerAddress: r.playerAddress,
        role: r.role,
        stakeAmount: r.stakeAmount,
        rewardAmount: r.rewardAmount,
        totalReceived: r.totalReceived,
        // Add token-formatted values for display
        stakeAmountInToken: (parseInt(r.stakeAmount) / decimals).toFixed(4),
        rewardInToken: (parseInt(r.rewardAmount) / decimals).toFixed(4),
        totalReceivedInToken: (parseInt(r.totalReceived) / decimals).toFixed(4),
        tokenSymbol: tokenSymbol,
      }));

      return {
        success: true,
        gameId: gameId,
        settlementTxHash: txHash,
        distributions: distributions, // Include detailed breakdown for frontend
        totalPool: rewards.totalPool,
        houseCut: rewards.houseCut,
        rewardPool: rewards.rewardPool,
      };
    } catch (error) {
      console.error('❌ Error distributing rewards:', error);
      throw error;
    }
  }

  // Validate room code format
  validateRoomCode(roomCode) {
    // Room code should be 6 characters, alphanumeric
    return /^[A-Z0-9]{6}$/.test(roomCode);
  }

  // Get all staked games
  getAllStakedGames() {
    const games = [];
    for (const [gameId, game] of this.stakedGames) {
      games.push({
        gameId: gameId,
        roomCode: game.roomCode,
        players: game.players,
        playersCount: game.players.length,
        minPlayers: this.minPlayers,
        totalStaked: game.totalStaked.toString(),
        status: game.status,
        createdAt: game.createdAt,
        isReady: game.players.length === this.minPlayers
      });
    }
    return games;
  }

  // Clean up completed games (optional)
  cleanupCompletedGames() {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000; // 24 hours

    for (const [gameId, game] of this.stakedGames) {
      if (game.status === 'completed' && (now - game.completedAt) > oneDayMs) {
        this.stakedGames.delete(gameId);
        console.log(`🧹 Cleaned up completed game ${gameId}`);
      }
    }
  }
}

module.exports = StakingService;
