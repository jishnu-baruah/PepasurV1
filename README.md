# Pepasur 🐸

**An on-chain Mafia game powered by EVM-compatible blockchains**

Pepasur is a multiplayer Mafia-style social deduction game built on EVM-compatible blockchains (U2U Network and Celo). Players take on mythological roles—**ASUR (Mafia)**, **DEV (Doctor)**, **MANAV (Villager)**, and **RISHI (Detective)**—and compete through staking, commit-reveal mechanics, and strategic gameplay. Each game requires players to stake native tokens (U2U or CELO), creating real economic incentives for fair play, with winners receiving rewards distributed automatically through smart contracts.

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Next.js + React + TypeScript + wagmi + viem                │
│         Real-time UI with Socket.IO                         │
│         MetaMask / WalletConnect Integration                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ WebSocket + REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                             │
│    Node.js + Express + Socket.IO + Game Logic Engine        │
│         Commit-Reveal System + ethers.js Integration        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ ethers.js JSON-RPC
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    EVM Blockchain                           │
│      Solidity Smart Contracts + On-chain Game State         │
│    Staking + Settlement + Reward Distribution System        │
│                                                             │
│    ┌──────────────┐              ┌──────────────┐           │
│    │  U2U Network │              │ Celo Network │           │
│    │  Chain: 39   │              │ Chain: 42220 │           │
│    └──────────────┘              └──────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

The architecture follows a three-tier design:
- **Frontend**: Handles user interface, EVM wallet connections (MetaMask, WalletConnect), and real-time game updates
- **Backend**: Manages game logic, player actions, and blockchain interactions via ethers.js
- **Blockchain**: EVM-compatible chains (U2U and Celo) store game state, handle staking, and distribute rewards

---

## 📂 Repository Structure

```
pepasur/
├── frontend/          # Next.js frontend application
│   └── README.md     # Frontend setup and documentation
├── backend/           # Node.js backend server
│   └── README.md     # Backend API and game logic documentation
├── contract/          # Move smart contracts
│   └── README.md     # Contract deployment and documentation
├── marketplace/       # NFT marketplace (future feature)
├── pepasur-ens-minimal/  # ENS integration utilities
└── README.md         # This file
```

**Key Directories:**
- **[frontend/](./frontend/README.md)**: React-based UI with EVM wallet integration (wagmi/viem) and real-time gameplay
- **[backend/](./backend/README.md)**: Express server with Socket.IO for game management and EVM blockchain interaction
- **[contract/](./contract/README.md)**: Solidity smart contracts for on-chain game logic, staking, and settlements

---

## 🛠️ Tech Stack

### Blockchain
- **U2U Network**: EVM-compatible Layer 1 blockchain (Chain ID: 39)
- **Celo Network**: Mobile-first EVM-compatible blockchain (Chain ID: 42220)
- **ethers.js v6.8.1**: Ethereum library for blockchain interactions

### Smart Contracts
- **Solidity ^0.8.20**: Smart contract programming language for EVM
- **Hardhat**: Development environment for compiling, testing, and deploying contracts
- **OpenZeppelin Contracts**: Secure, audited contract libraries

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express 4.18.2
- **Real-time**: Socket.IO 4.7.4
- **Database**: Mongoose 8.19.2 (MongoDB)
- **Utilities**: dotenv, uuid, cors

### Frontend
- **Framework**: Next.js 15.5.4
- **Language**: TypeScript 5
- **UI Library**: React 18.2.0
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS 4.1.9
- **State Management**: React Hooks & Context API
- **Wallet Integration**: wagmi 2.x + viem 2.x (EVM wallet support)
- **Wallet Connectors**: MetaMask, WalletConnect, and other EVM wallets
- **Real-time**: socket.io-client 4.8.1
- **Forms**: react-hook-form 7.60.0
- **Animations**: framer-motion 12.23.22
- **Audio**: howler 2.2.4

---

## 🚀 Quick Start

### Prerequisites

- **Node.js v18+**: JavaScript runtime for backend and frontend
- **EVM Wallet**: Browser extension (MetaMask, Coinbase Wallet, or WalletConnect-compatible wallet)
- **Native Tokens**: U2U or CELO tokens for staking (testnet tokens available from faucets)
- **Hardhat**: For smart contract deployment (installed via npm)

### Deployment Order

The project components must be deployed in the following order:

1. **Smart Contracts** → Deploy Move modules to Aptos blockchain
2. **Backend Server** → Configure with contract addresses and start game server
3. **Frontend Application** → Configure with contract and API endpoints

### Setup Overview

```bash
# 1. Deploy Smart Contracts
cd contract
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network u2u
# Note the deployed contract address

# 2. Initialize Contract
npx hardhat run scripts/initialize.js --network u2u

# 3. Start Backend Server
cd ../backend
npm install
# Configure .env with contract address and network settings
npm run dev

# 4. Start Frontend Application
cd ../frontend
npm install
# Configure .env.local with contract address and network settings
npm run dev
```

For detailed setup instructions, see the README files in each directory:
- **Smart Contracts**: [contract/README.md](./contract/README.md)
- **Backend**: [backend/README.md](./backend/README.md)
- **Frontend**: [frontend/README.md](./frontend/README.md)

---

## 🎮 How to Play

### Game Roles

- **ASUR (Mafia)**: Eliminate other players during night phase to win
- **DEV (Doctor)**: Protect one player each night from elimination
- **MANAV (Villager)**: Vote during day phase to identify and eliminate Mafia
- **RISHI (Detective)**: Investigate players to discover their roles

### 1. Get Native Tokens

The game runs on **U2U Network** and **Celo Network**. For testing:
- **U2U Testnet**: Get testnet U2U tokens from the U2U faucet
- **Celo Sepolia**: Get testnet CELO from [Celo Faucet](https://faucet.celo.org/alfajores)

For mainnet, acquire U2U or CELO tokens from exchanges or DEXs.

### 2. Create or Join a Game

- **Create Room**: Stake native tokens (U2U or CELO) to create a new game lobby with customizable settings
- **Join Room**: Enter a room code and stake the required amount to join an existing game

### 3. Play the Game

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

### 4. Win Rewards

**Victory Conditions:**
- **Mafia Wins**: When ASUR players equal or outnumber remaining players
- **Non-Mafia Wins**: When all ASUR players are eliminated

**Reward Distribution:**
- **Mafia Victory**: Mafia players split the entire reward pool
- **Non-Mafia Victory**: All surviving non-Mafia players split the reward pool equally
- **House Cut**: 2% platform fee for maintenance and development

All rewards are distributed automatically through smart contracts and can be withdrawn immediately after game completion.

---

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

---

## 📜 Smart Contracts

### Core Game Contract: `Pepasur.sol`

The Solidity smart contract handles all on-chain game logic and financial transactions on EVM-compatible chains:

**Key Features:**
- **Game Creation**: Initialize game lobbies with customizable stake amounts and player limits
- **Player Joining**: Secure stake deposits when players join games (payable function)
- **Settlement System**: Server-signed settlements with ECDSA signature verification for reward distribution
- **Withdrawal Mechanism**: Two-step withdrawal pattern with reentrancy protection
- **Game Cancellation**: Cancel games with automatic refunds to all players
- **Admin Controls**: Update server signer, fee recipient, and house cut percentage

**Main Functions:**
- `initialize(address _serverSigner, address _feeRecipient)`: Configure contract post-deployment
- `createGame(uint256 stakeAmount, uint8 minPlayers)`: Create new game with stake requirements
- `joinGame(uint64 gameId) payable`: Join existing game with native token stake
- `settleGame(uint64 gameId, address[] winners, uint256[] payouts, bytes signature)`: Settle game with server signature
- `withdraw()`: Withdraw pending winnings to player account
- `cancelGame(uint64 gameId)`: Cancel game and refund all players

**View Functions:**
- `games(uint64 gameId)`: Get game information
- `pendingWithdrawals(address player)`: Check pending withdrawal balance
- `getContractInfo()`: Get contract configuration

For detailed contract documentation, deployment instructions, and security considerations, see [contract/README.md](./contract/README.md).

---

## 🔐 Security Features

- **Commit-Reveal Mechanism**: Prevents action manipulation by requiring cryptographic commitments (off-chain)
- **ECDSA Signature Verification**: All settlements require authorized server signatures using ecrecover
- **Reentrancy Protection**: Checks-effects-interactions pattern prevents reentrancy attacks
- **Two-Step Withdrawals**: Prevents reentrancy with queued withdrawal pattern
- **Role Secrecy**: Player roles never stored on-chain, maintained off-chain by backend
- **Access Control**: Admin-only functions for critical operations
- **House Cut Limits**: Maximum 20% house fee enforced at contract level

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📄 License

MIT

---

## 🔗 Links

### Networks
- **U2U Network**: [https://uniultra.xyz/](https://uniultra.xyz/)
- **U2U Explorer**: [https://u2uscan.xyz](https://u2uscan.xyz)
- **Celo Network**: [https://celo.org/](https://celo.org/)
- **Celo Explorer**: [https://explorer.celo.org/](https://explorer.celo.org/)
- **Celo Sepolia Explorer**: [https://celo-sepolia.blockscout.com/](https://celo-sepolia.blockscout.com/)

### Documentation
- **Hardhat**: [https://hardhat.org/docs](https://hardhat.org/docs)
- **Solidity**: [https://docs.soliditylang.org/](https://docs.soliditylang.org/)
- **ethers.js**: [https://docs.ethers.org/](https://docs.ethers.org/)
- **wagmi**: [https://wagmi.sh/](https://wagmi.sh/)
- **viem**: [https://viem.sh/](https://viem.sh/)
- **OpenZeppelin**: [https://docs.openzeppelin.com/](https://docs.openzeppelin.com/)
