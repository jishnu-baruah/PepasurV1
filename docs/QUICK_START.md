# Pepasur EVM - Quick Start Guide

This guide will help you get Pepasur up and running quickly on EVM-compatible networks (U2U and Celo).

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js v18+**: JavaScript runtime for backend and frontend
- **EVM Wallet**: Browser extension (MetaMask, Coinbase Wallet, or WalletConnect-compatible wallet)
- **Native Tokens**: U2U or CELO tokens for staking (testnet tokens available from faucets)
- **Hardhat**: For smart contract deployment (installed via npm)

## 🚀 Deployment Order

The project components must be deployed in the following order:

1. **Smart Contracts** → Deploy Solidity contracts to EVM blockchain
2. **Backend Server** → Configure with contract addresses and start game server
3. **Frontend Application** → Configure with contract and API endpoints

## ⚡ Setup Overview

### 1. Deploy Smart Contracts

```bash
cd contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network u2u
# Note the deployed contract address
```

### 2. Initialize Contract

```bash
npx hardhat run scripts/initialize.js --network u2u
```

### 3. Start Backend Server

```bash
cd ../backend
npm install
# Configure .env with contract address and network settings
npm run dev
```

### 4. Start Frontend Application

```bash
cd ../frontend
npm install
# Configure .env.local with contract address and network settings
npm run dev
```

## 📚 Detailed Setup Instructions

For comprehensive setup instructions, see the README files in each directory:
- **Smart Contracts**: [contract/README.md](../contract/README.md)
- **Backend**: [backend/README.md](../backend/README.md)
- **Frontend**: [frontend/README.md](../frontend/README.md)

## 🎮 How to Play

### Game Roles

- **ASUR (Mafia)**: Eliminate other players during night phase to win
- **DEV (Doctor)**: Protect one player each night from elimination
- **MANAV (Villager)**: Vote during day phase to identify and eliminate Mafia
- **RISHI (Detective)**: Investigate players to discover their roles

### Step 1: Get Native Tokens

The game runs on **U2U Network** and **Celo Network**. For testing:
- **U2U Testnet**: Get testnet U2U tokens from the U2U faucet
- **Celo Sepolia**: Get testnet CELO from [Celo Faucet](https://faucet.celo.org/alfajores)

For mainnet, acquire U2U or CELO tokens from exchanges or DEXs.

### Step 2: Create or Join a Game

- **Create Room**: Stake native tokens (U2U or CELO) to create a new game lobby with customizable settings
- **Join Room**: Enter a room code and stake the required amount to join an existing game

### Step 3: Play the Game

**Night Phase**: 
- ASUR players choose a target to eliminate
- DEV protects one player from elimination
- RISHI investigates a player to learn their role

**Task Phase**: 
- Complete mini-games to earn bonus rewards
- Tasks test reaction time and problem-solving skills

**Voting Phase**: 
- All players vote to eliminate a suspected ASUR
- Player with most votes is eliminated from the game

**Resolution**: 
- Game continues until either all ASUR are eliminated or ASUR equal remaining players

### Step 4: Win Rewards

**Victory Conditions:**
- **Mafia Wins**: When ASUR players equal or outnumber remaining players
- **Non-Mafia Wins**: When all ASUR players are eliminated

**Reward Distribution:**
- **Mafia Victory**: Mafia players split the entire reward pool
- **Non-Mafia Victory**: All surviving non-Mafia players split the reward pool equally
- **House Cut**: 2% platform fee for maintenance and development

All rewards are distributed automatically through smart contracts and can be withdrawn immediately after game completion.

## 🌐 Network Configuration

### U2U Network

- **Network**: U2U Mainnet
- **Chain ID**: 39
- **RPC URL**: `https://rpc-mainnet.uniultra.xyz`
- **Block Explorer**: `https://u2uscan.xyz`
- **Native Token**: U2U

### Celo Network

- **Network**: Celo Mainnet
- **Chain ID**: 42220
- **RPC URL**: `https://forno.celo.org`
- **Block Explorer**: `https://explorer.celo.org`
- **Native Token**: CELO

**Note**: For testing, use Celo Sepolia testnet (Chain ID: 11142220).

## 🔗 Next Steps

- **Detailed Deployment**: [CELO_SEPOLIA_DEPLOYMENT.md](./CELO_SEPOLIA_DEPLOYMENT.md)
- **Environment Setup**: [ENV_SETUP.md](./ENV_SETUP.md)
- **Troubleshooting**: [RPC_TIMEOUT_TROUBLESHOOTING.md](./RPC_TIMEOUT_TROUBLESHOOTING.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

## 🆘 Need Help?

If you encounter issues:
1. Check the [troubleshooting guide](./RPC_TIMEOUT_TROUBLESHOOTING.md)
2. Review component-specific README files
3. Ensure all environment variables are properly configured
4. Verify network connectivity and RPC endpoints