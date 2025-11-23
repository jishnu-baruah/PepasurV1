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

Ready to get started? Follow our comprehensive setup guide:

**👉 [Quick Start Guide](./docs/QUICK_START.md)**

### TL;DR Setup
1. **Deploy Contracts** → `cd contract && npm run deploy`
2. **Start Backend** → `cd backend && npm run dev` 
3. **Start Frontend** → `cd frontend && npm run dev`
4. **Play Game** → Connect wallet, stake tokens, and enjoy!

For detailed instructions, network configuration, and gameplay guide, see the [complete quick start documentation](./docs/QUICK_START.md).

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

## 📚 Documentation

For detailed technical documentation, deployment guides, and troubleshooting:

### 📖 Main Documentation
- **[docs/](./docs/)** - Complete technical documentation and guides
- **[docs/README.md](./docs/README.md)** - Documentation index and navigation

### 🚀 Quick Access
- **[Quick Start Guide](./docs/QUICK_START.md)** - ⭐ **New users start here!**
- **[Celo Sepolia Deployment](./docs/CELO_SEPOLIA_DEPLOYMENT.md)** - Complete deployment guide
- **[Migration Guide](./docs/MIGRATION_GUIDE.md)** - Network migration instructions  
- **[Troubleshooting](./docs/RPC_TIMEOUT_TROUBLESHOOTING.md)** - Common issues and solutions

### 📋 Component Documentation
- **[Backend API](./backend/README.md)** - Server setup and API documentation
- **[Frontend App](./frontend/README.md)** - UI setup and configuration
- **[Smart Contracts](./contract/README.md)** - Contract deployment and usage

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
