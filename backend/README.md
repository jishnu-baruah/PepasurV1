# Pepasur Backend

Real-time Mafia gameplay backend with Aptos blockchain integration for staking, role commit-reveal, and final settlements.

## ✨ Features

- **Real-time Gameplay**: Socket.IO for live game updates and player interactions
- **Aptos Blockchain Integration**: On-chain staking, settlements, and payouts
- **Game State Management**: In-memory game state with optional MongoDB persistence
- **Commit-Reveal Mechanism**: Cryptographic security for action submission
- **Detective Role Features**: Role revelation and verification system
- **Game Phase Management**: Night, Task, Resolution, and Voting phases
- **Mini-game System**: Sequence rebuild, memory puzzles, hash reconstruction
- **Faucet Service**: Testnet token distribution for new players
- **RESTful API**: Comprehensive endpoints for game management

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Real-time**: Socket.IO 4.7.4
- **Blockchain**: @aptos-labs/ts-sdk 5.1.1
- **Database**: Mongoose 8.19.2 (MongoDB)
- **Utilities**: dotenv, uuid, cors, ethers 6.8.1

## 🚀 Getting Started

### Prerequisites

- Node.js v18 or higher
- MongoDB (optional, for persistent storage)
- Aptos account with private key
- APT tokens on devnet/testnet

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

```bash
copy .env.example .env
```

Edit `.env` with your configuration:

```env
# Network Configuration
NETWORK=devnet
APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1

# Server Configuration
PORT=3001
SERVER_PRIVATE_KEY=0x... # Server wallet private key
ADMIN_PRIVATE_KEY=0x...  # Admin wallet private key

# Contract Configuration
PEPASUR_APTOS_CONTRACT_ADDRESS=0x... # Deployed contract address

# Game Settings
DEFAULT_NIGHT_PHASE_DURATION=30
DEFAULT_RESOLUTION_PHASE_DURATION=10
DEFAULT_TASK_PHASE_DURATION=30
DEFAULT_VOTING_PHASE_DURATION=10
DEFAULT_MAX_TASK_COUNT=4
DEFAULT_STAKE_AMOUNT=100000000  # In Octas (0.1 APT)
DEFAULT_MIN_PLAYERS=4
DEFAULT_MAX_PLAYERS=10
GAME_TIMEOUT_SECONDS=300
```

### Step 3: Start the Server

```bash
npm run dev  # Development with nodemon
# or
npm start    # Production
```

The server will run on http://localhost:3001

## 📂 Project Structure

```
backend/
├── config/              # Configuration files
│   └── database.js     # MongoDB connection setup
├── models/              # Data models (Mongoose schemas)
│   ├── Game.js         # Game state model
│   └── FaucetRequest.js # Faucet request tracking
├── routes/              # API route handlers
│   ├── game.js         # Game management endpoints
│   └── faucet.js       # Faucet endpoints
├── services/            # Business logic layer
│   ├── aptos/          # Aptos blockchain services
│   │   ├── AptosService.js           # Main Aptos service
│   │   ├── AptosClientManager.js     # Client connection management
│   │   ├── AptosGameQueries.js       # On-chain data queries
│   │   ├── AptosGameTransactions.js  # Transaction builders
│   │   └── AptosSerializationUtils.js # Data serialization
│   ├── core/           # Core services
│   │   ├── FaucetService.js   # Faucet token distribution
│   │   ├── SocketManager.js   # Socket.IO event handling
│   │   └── TaskManager.js     # Mini-game task management
│   ├── game/           # Game logic services
│   │   ├── GameManager.js         # Game state management
│   │   ├── GameRepository.js      # Game data access
│   │   ├── GameRewardService.js   # Reward calculation
│   │   ├── GameStateFormatter.js  # State formatting
│   │   └── PhaseManager.js        # Game phase transitions
│   └── staking/        # Staking services
│       ├── StakingManager.js  # Staking coordination
│       └── StakingService.js  # Staking operations
├── utils/               # Utility functions
│   ├── commitReveal.js           # Commit-reveal cryptography
│   ├── aptosTransactionUtils.js  # Transaction helpers
│   ├── dbUtils.js                # Database utilities
│   └── timeFormatter.js          # Time formatting
├── scripts/             # Utility scripts
│   ├── initialize-contract.js    # Contract initialization
│   ├── update-server-signer.js   # Update server signer
│   └── check-faucet-setup.js     # Faucet setup verification
├── .env                 # Environment variables
├── package.json         # Dependencies
└── server.js            # Application entry point
```

## 🔌 API Endpoints

### Game Management

- `POST /api/game/create` - Create a new game lobby
- `GET /api/game/:gameId` - Get game state
- `PATCH /api/game/:gameId` - Update game state (admin)
- `POST /api/game/:gameId/player/join` - Join game
- `POST /api/game/:gameId/player/eliminate` - Eliminate player
- `GET /api/game` - Get list of active games
- `GET /api/game/:gameId/history` - Get game history

### Game Actions

- `POST /api/game/:gameId/action/night` - Submit night phase action
- `POST /api/game/:gameId/task/submit` - Submit task answer
- `POST /api/game/:gameId/vote/submit` - Submit elimination vote

### Detective Features

- `POST /api/detective/reveal` - Store detective role reveal
- `GET /api/detective/reveals/:gameId` - Get detective reveals for game
- `POST /api/detective/verify` - Verify detective reveal signature
- `GET /api/detective/info/:gameId` - Get detective information

### Faucet

- `POST /api/faucet/claim` - Claim testnet tokens (once per 24 hours)
- `GET /api/faucet/status/:address` - Check faucet eligibility

### Health Check

- `GET /api/health` - Backend health status

## 🔄 Socket.IO Events

### Client → Server

- `join_game` - Join game channel
  - Payload: `{ gameId, playerId }`
- `submit_action` - Submit game action (night phase)
  - Payload: `{ gameId, playerId, action, target }`
- `submit_task` - Submit task answer
  - Payload: `{ gameId, playerId, taskId, answer }`
- `submit_vote` - Submit elimination vote
  - Payload: `{ gameId, playerId, targetId }`
- `chat_message` - Send chat message
  - Payload: `{ gameId, playerId, message }`

### Server → Client

- `game_state` - Full game state update
  - Payload: Complete game state object
- `game_update` - Incremental game state changes
  - Payload: `{ type, data }`
- `task_update` - Task submission updates
  - Payload: `{ taskId, playerId, status }`
- `task_result` - Task completion results
  - Payload: `{ taskId, success, rewards }`
- `detective_reveal` - Detective action notifications
  - Payload: `{ playerId, revealedRole }`
- `chat_message` - Chat messages
  - Payload: `{ playerId, message, timestamp }`
- `error` - Error notifications
  - Payload: `{ message, code }`

## 🎮 Game Flow

1. **Lobby Phase**: Players join and wait for minimum player count
2. **Night Phase**: Mafia eliminates, Doctor protects, Detective investigates
3. **Resolution Phase**: Night actions are resolved and results announced
4. **Task Phase**: Players complete mini-games for rewards
5. **Voting Phase**: Players vote to eliminate suspected Mafia
6. **Repeat**: Cycle continues until win condition is met

## 🎭 Game Roles

- **Mafia**: Eliminate villagers at night
- **Doctor**: Save players from mafia attacks
- **Detective**: Investigate and reveal player roles
- **Villagers**: Complete tasks and vote to eliminate mafia

## 🔐 Commit-Reveal Mechanism

The backend implements a cryptographic commit-reveal system for secure action submission:

1. **Commit Phase**: Players submit hashed actions with nonce
   ```javascript
   commit = hash(action + nonce + playerId)
   ```

2. **Reveal Phase**: Players reveal action + nonce for verification
   ```javascript
   revealedAction = { action, nonce, playerId }
   ```

3. **Validation**: Server verifies commit hash matches reveal
   ```javascript
   isValid = (commit === hash(action + nonce + playerId))
   ```

4. **Execution**: Actions are processed after all reveals validated

This ensures players cannot change actions after seeing others' moves, maintaining game integrity.

## ⛓️ Aptos Integration

- **Game Creation**: On-chain game initialization with stake deposits
  - Creates game resource on blockchain
  - Locks creator's stake in contract

- **Player Joining**: On-chain stake deposits when joining games
  - Validates player eligibility
  - Locks player stake in game pool

- **Role Commits**: On-chain storage of role commitment hashes
  - Stores encrypted role assignments
  - Prevents role manipulation

- **Settlements**: On-chain reward distribution to winners
  - Calculates winner payouts
  - Distributes pool to winning team
  - Applies house cut

- **Withdrawals**: On-chain fund withdrawal mechanism
  - Players claim winnings
  - Secure withdrawal pattern

## 🔒 Security Considerations

- **Commit-Reveal**: All game actions use commit-reveal mechanism to prevent cheating
- **Role Encryption**: Role information encrypted and stored off-chain
- **Signature Verification**: Detective reveals require signature verification
- **Input Validation**: All API endpoints validate input parameters
- **Private Key Security**: Server private key must be kept secure and never committed to version control
- **Rate Limiting**: Faucet includes rate limiting (once per 24 hours per address)

## 🧪 Development

### Running Tests

```bash
npm test
```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `NETWORK` | Aptos network (devnet/testnet/mainnet) | devnet |
| `APTOS_NODE_URL` | Aptos RPC endpoint | - |
| `PORT` | Server port | 3001 |
| `SERVER_PRIVATE_KEY` | Server wallet private key | - |
| `ADMIN_PRIVATE_KEY` | Admin wallet private key | - |
| `PEPASUR_APTOS_CONTRACT_ADDRESS` | Deployed contract address | - |
| `DEFAULT_NIGHT_PHASE_DURATION` | Night phase duration (seconds) | 30 |
| `DEFAULT_RESOLUTION_PHASE_DURATION` | Resolution phase duration (seconds) | 10 |
| `DEFAULT_TASK_PHASE_DURATION` | Task phase duration (seconds) | 30 |
| `DEFAULT_VOTING_PHASE_DURATION` | Voting phase duration (seconds) | 10 |
| `DEFAULT_MAX_TASK_COUNT` | Maximum tasks per game | 4 |
| `DEFAULT_STAKE_AMOUNT` | Default stake in Octas | 100000000 |
| `DEFAULT_MIN_PLAYERS` | Minimum players to start | 4 |
| `DEFAULT_MAX_PLAYERS` | Maximum players per game | 10 |
| `GAME_TIMEOUT_SECONDS` | Game timeout duration | 300 |

### Utility Scripts

Initialize the deployed contract:
```bash
node scripts/initialize-contract.js
```

Update server signer address:
```bash
node scripts/update-server-signer.js
```

Check faucet setup:
```bash
node scripts/check-faucet-setup.js
```

## 📜 License

MIT
