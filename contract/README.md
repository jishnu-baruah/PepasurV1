# Pepasur Move Smart Contract

On-chain game logic for Pepasur, an Aptos blockchain-based Mafia game with server-signed settlements, staking mechanics, and secure withdrawal patterns.

## 🚀 Features

### Entry Functions (Transactions)
- **`initialize`**: One-time post-deployment setup to configure admin, server signer, and fee recipient
- **`create_game`**: Create new game lobby with customizable stake amount and minimum player requirements
- **`join_game`**: Join existing game with automatic stake deposit and game start when minimum players reached
- **`settle_game`**: Settle completed game with server-signed winner payouts and house fee distribution
- **`withdraw`**: Withdraw pending winnings to player account using two-step withdrawal pattern
- **`cancel_game`**: Cancel game in lobby or in-progress state with automatic refunds to all players
- **`update_server_signer`**: Admin function to update server's ED25519 public key
- **`update_fee_recipient`**: Admin function to change house fee recipient address
- **`update_house_cut`**: Admin function to adjust house cut percentage (max 20%)

### View Functions (Read-Only)
- **`get_game`**: Retrieve complete game information by ID (creator, stake, players, status, pool)
- **`get_pending_withdrawal`**: Check pending withdrawal balance for any player address
- **`get_config`**: Get contract configuration (admin, fee recipient, house cut, initialization status)
- **`get_next_game_id`**: Get next game ID to be created

## 🏗️ Module Structures

### Config Resource
Stores global contract configuration at module address:
- **`admin`**: Address with administrative privileges
- **`server_signer`**: ED25519 public key (32 bytes) for settlement signature verification
- **`fee_recipient`**: Address receiving house cut from game settlements
- **`house_cut_bps`**: House fee in basis points (100 = 1%, max 2000 = 20%)
- **`initialized`**: Flag indicating post-deployment initialization completion

### Game Resource
Stores individual game state within GameStore:
- **`id`**: Unique game identifier (sequential)
- **`creator`**: Game creator's address
- **`stake_amount`**: Required stake in Octas (1 APT = 100,000,000 Octas)
- **`min_players`**: Minimum players required to start game
- **`players`**: Vector of player addresses who joined
- **`deposits`**: Vector of stake amounts deposited by each player
- **`status`**: Game state (0=Lobby, 1=InProgress, 2=Settled, 3=Cancelled)
- **`total_pool`**: Total staked amount from all players
- **`created_at`**: Unix timestamp of game creation

### GameStore Resource
Central storage for all games and vault:
- **`games`**: Vector of all Game structs
- **`next_game_id`**: Counter for next game ID
- **`vault`**: Coin vault holding all staked and pending funds

### PendingWithdrawals Resource
Tracks queued withdrawals for players:
- **`balances`**: SimpleMap of player addresses to withdrawal amounts

## 🛠️ How to Build & Deploy

### Prerequisites
- Aptos CLI installed ([Installation Guide](https://aptos.dev/tools/aptos-cli/install-cli))
- Aptos account with devnet/testnet APT tokens
- Node.js v18+ (for backend integration)

### Initialize Aptos Profile
```bash
cd contract
aptos init --profile devnet
```

This creates a new account and saves credentials to `.aptos/config.yaml`. Note the generated address for later use.

### Build the Module
```bash
aptos move compile --named-addresses pepasur=default
```

This compiles the Move modules and checks for syntax/type errors. Fix any issues before proceeding.

### Run Tests
```bash
aptos move test
```

Executes all unit tests defined in the `tests/` directory. Ensure all tests pass before deployment.

### Deploy to Devnet
```bash
aptos move publish --profile devnet --named-addresses pepasur=default
```

**After successful deployment:**
1. Copy the deployed module address from the output (look for "Code was successfully deployed")
2. Update `PEPASUR_APTOS_CONTRACT_ADDRESS` in `backend/.env`
3. Update `NEXT_PUBLIC_MODULE_ADDRESS` in `frontend/.env.local`

### Deploy to Testnet
```bash
# First initialize testnet profile
aptos init --profile testnet

# Then deploy
aptos move publish --profile testnet --named-addresses pepasur=default
```

### Verify Deployment
Visit Aptos Explorer to verify your deployment:
```
https://explorer.aptoslabs.com/account/[MODULE_ADDRESS]?network=devnet
```

Replace `[MODULE_ADDRESS]` with your deployed address and change network parameter for testnet.

## 🔧 Post-Deployment Configuration

After deploying the contract, you **must** initialize it with configuration. This can only be done once.

### Step 1: Generate Server Signing Key
```bash
# Generate ED25519 key pair for server
aptos key generate --key-type ed25519 --output-file server-key.json
```

This creates `server-key.json` with public and private keys. Store the private key securely in backend `.env`.

### Step 2: Initialize Contract
```bash
aptos move run \
  --function-id '[MODULE_ADDRESS]::pepasur::initialize' \
  --args hex:[SERVER_PUBLIC_KEY] \
  --args address:[FEE_RECIPIENT_ADDRESS] \
  --profile devnet
```

**Parameters:**
- `[MODULE_ADDRESS]`: Your deployed contract address
- `[SERVER_PUBLIC_KEY]`: Hex-encoded ED25519 public key (64 characters, no 0x prefix)
- `[FEE_RECIPIENT_ADDRESS]`: Address to receive house cut (can be admin address)

**Example:**
```bash
aptos move run \
  --function-id '0xabc123::pepasur::initialize' \
  --args hex:a1b2c3d4e5f6... \
  --args address:0xabc123 \
  --profile devnet
```

### Step 3: Verify Configuration
```bash
aptos move view \
  --function-id '[MODULE_ADDRESS]::pepasur::get_config' \
  --profile devnet
```

This should return your admin address, fee recipient, house cut (200 = 2%), and initialized=true.

## 📍 Module Address

**Devnet Module Address**: `[To be deployed]`

**Testnet Module Address**: `[To be deployed]`

View on Explorer:
- Devnet: `https://explorer.aptoslabs.com/account/[ADDRESS]?network=devnet`
- Testnet: `https://explorer.aptoslabs.com/account/[ADDRESS]?network=testnet`

## 🔐 Security Considerations

### Server Key Management
The server's private key must be kept secure. A compromised key would allow submission of fraudulent game results with valid signatures. Store the key in a secure environment variable and never commit it to version control. Consider using hardware security modules (HSM) or key management services for production deployments.

### Signature Verification
All game settlements require ED25519 signature verification. The contract constructs a message from `game_id || winners || payouts` and verifies it against the configured server public key. Only the authorized server (configured during initialization) can submit valid settlement transactions.

### Withdrawal Pattern
The contract uses a two-step withdrawal pattern:
1. **Settlement Phase**: Winnings are queued to player's pending balance in PendingWithdrawals
2. **Withdrawal Phase**: Player explicitly calls `withdraw()` to transfer funds to their account

This pattern prevents reentrancy attacks and provides a clear audit trail. Players can accumulate winnings from multiple games before withdrawing.

### Role Secrecy
Player roles are never stored on-chain, preserving game secrecy. Only commitment hashes are stored on-chain (if needed), which are revealed off-chain during gameplay. The blockchain only handles financial transactions and game lifecycle, not game logic.

### Emergency Controls
The contract includes admin functions for emergency situations:
- **`update_server_signer`**: Rotate compromised server keys
- **`update_fee_recipient`**: Change fee destination if needed
- **`cancel_game`**: Creators can cancel games with automatic refunds

### House Cut Limits
The house cut is capped at 2000 basis points (20%) to prevent excessive fees. The `update_house_cut` function enforces this limit.

## 🧪 Testing

The contract includes comprehensive unit tests covering:
- Game creation with various stake amounts and player limits
- Player joining and automatic game start
- Settlement with multiple winner configurations
- Withdrawal mechanism and balance tracking
- Signature verification (valid and invalid signatures)
- Access control and admin permissions
- Game cancellation and refund logic
- Edge cases (invalid game IDs, wrong status, insufficient funds)

### Run Tests
```bash
aptos move test
```

### Run Tests with Coverage
```bash
aptos move test --coverage
```

Coverage reports show which code paths are tested. Aim for >90% coverage on critical functions.

### Run Specific Test
```bash
aptos move test --filter test_create_game
```

## 📚 Additional Resources
- [Aptos Documentation](https://aptos.dev/)
- [Move Language Guide](https://move-language.github.io/move/)
- [Aptos TypeScript SDK](https://aptos.dev/sdks/ts-sdk/)
- [Aptos CLI Reference](https://aptos.dev/tools/aptos-cli/)
- [ED25519 Signatures](https://ed25519.cr.yp.to/)
