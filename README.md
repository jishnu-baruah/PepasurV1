# Pepasur 🐸

**An on-chain Mafia game powered by Aptos Blockchain**

Pepasur is a multiplayer Mafia-style social deduction game built entirely on the Aptos blockchain. Players take on mythological roles—**ASUR (Mafia)**, **DEV (Doctor)**, **MANAV (Villager)**, and **RISHI (Detective)**—and compete through staking, commit-reveal mechanics, and strategic gameplay. Each game requires players to stake APT tokens, creating real economic incentives for fair play, with winners receiving rewards distributed automatically through smart contracts.

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Next.js + React + TypeScript + Aptos Wallet Adapter        │
│              Real-time UI with Socket.IO                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ WebSocket + REST API
                     │
┌────────────────────▼────────────────────────────────────────┐
│                         Backend                             │
│    Node.js + Express + Socket.IO + Game Logic Engine        │
│         Commit-Reveal System + Aptos Integration            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Aptos TypeScript SDK
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    Aptos Blockchain                         │
│      Move Smart Contracts + On-chain Game State             │
│    Staking + Settlement + Reward Distribution System        │
└─────────────────────────────────────────────────────────────┘
```

The architecture follows a three-tier design:
- **Frontend**: Handles user interface, wallet connections, and real-time game updates
- **Backend**: Manages game logic, player actions, and blockchain interactions
- **Blockchain**: Stores game state, handles staking, and distributes rewards

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
- **[frontend/](./frontend/README.md)**: React-based UI with Aptos wallet integration and real-time gameplay
- **[backend/](./backend/README.md)**: Express server with Socket.IO for game management and blockchain interaction
- **[contract/](./contract/README.md)**: Move modules for on-chain game logic, staking, and settlements

---

## 🛠️ Tech Stack

### Blockchain
- **Aptos Blockchain**: Layer 1 blockchain with Move smart contracts
- **Aptos TypeScript SDK**: v1.39.0 (frontend), v5.1.1 (backend)

### Smart Contracts
- **Move Language**: Safe, resource-oriented programming for blockchain
- **Aptos CLI**: Contract compilation, testing, and deployment

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
- **Wallet Integration**: @aptos-labs/wallet-adapter-react 7.1.3
- **Real-time**: socket.io-client 4.8.1
- **Forms**: react-hook-form 7.60.0
- **Animations**: framer-motion 12.23.22
- **Audio**: howler 2.2.4

---

## 🚀 Quick Start

### Prerequisites

- **Node.js v18+**: JavaScript runtime for backend and frontend
- **Aptos Wallet**: Browser extension (Petra, Martian, or Pontem)
- **APT Tokens**: Devnet tokens for staking (get from [Aptos Faucet](https://aptoslabs.com/testnet-faucet))
- **Aptos CLI**: For smart contract deployment ([Installation Guide](https://aptos.dev/tools/aptos-cli/install-cli))

### Deployment Order

The project components must be deployed in the following order:

1. **Smart Contracts** → Deploy Move modules to Aptos blockchain
2. **Backend Server** → Configure with contract addresses and start game server
3. **Frontend Application** → Configure with contract and API endpoints

### Setup Overview

```bash
# 1. Deploy Smart Contracts
cd contract
aptos move publish --profile devnet
# Note the deployed module address

# 2. Start Backend Server
cd ../backend
npm install
# Configure .env with contract address
npm run dev

# 3. Start Frontend Application
cd ../frontend
npm install
# Configure .env.local with contract and API addresses
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

### 1. Get APT Tokens

The game runs on **Aptos Devnet**. Get free devnet tokens from the [Aptos Faucet](https://aptoslabs.com/testnet-faucet) to stake in games.

### 2. Create or Join a Game

- **Create Room**: Stake APT tokens to create a new game lobby with customizable settings
- **Join Room**: Enter a room code and stake the required APT amount to join an existing game

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

### Aptos Devnet

- **Network**: Devnet (testnet environment)
- **Chain ID**: 2
- **RPC URL**: `https://fullnode.devnet.aptoslabs.com/v1`
- **Block Explorer**: `https://explorer.aptoslabs.com/?network=devnet`
- **Faucet**: `https://aptoslabs.com/testnet-faucet`

**Note**: Devnet tokens have no real value and are used for testing purposes only.

---

## 📜 Smart Contracts

### Core Game Contract: `pepasur.move`

The Move smart contract handles all on-chain game logic and financial transactions:

**Key Features:**
- **Game Creation**: Initialize game lobbies with customizable stake amounts and player limits
- **Player Joining**: Secure stake deposits when players join games
- **Role Commits**: Store cryptographic commitments for role assignments
- **Settlement System**: Server-signed settlements with signature verification for reward distribution
- **Withdrawal Mechanism**: Two-step withdrawal pattern for security
- **Emergency Controls**: Pause mechanism for critical situations

**Entry Functions:**
- `initialize`: Configure contract with server signer and fee settings
- `create_game`: Create new game with stake and player requirements
- `join_game`: Join existing game with stake deposit
- `settle_game`: Settle completed game with winner payouts
- `withdraw`: Withdraw pending winnings to player account
- `cancel_game`: Cancel game in lobby state with refunds

For detailed contract documentation, deployment instructions, and security considerations, see [contract/README.md](./contract/README.md).

---

## 🔐 Security Features

- **Commit-Reveal Mechanism**: Prevents action manipulation by requiring cryptographic commitments
- **Server Signature Verification**: All settlements require authorized server signatures
- **Two-Step Withdrawals**: Prevents reentrancy attacks with queued withdrawal pattern
- **Role Secrecy**: Player roles never stored on-chain, only commitment hashes
- **Emergency Pause**: Contract can be paused in critical situations

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## 📄 License

MIT

---

## 🔗 Links

- **Aptos Documentation**: [https://aptos.dev/](https://aptos.dev/)
- **Move Language Guide**: [https://move-language.github.io/move/](https://move-language.github.io/move/)
- **Aptos Explorer**: [https://explorer.aptoslabs.com/](https://explorer.aptoslabs.com/)
- **Aptos Faucet**: [https://aptoslabs.com/testnet-faucet](https://aptoslabs.com/testnet-faucet)
