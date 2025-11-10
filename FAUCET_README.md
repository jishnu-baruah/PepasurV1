# Pepasur Aptos Faucet

A server-side faucet system that allows users to claim test APT tokens for playing the game.

## Features

- **Amount**: 0.01 APT per claim
- **Rate Limit**: Once every 24 hours per wallet address
- **Server-Signed**: Transactions are signed by the server, so users don't need gas for the claim
- **MongoDB Tracking**: All requests are logged with timestamps for rate limiting

## Setup

### 1. Backend Configuration

1. **Check Faucet Setup (Recommended)**

   Run the setup checker to verify your configuration:

   ```bash
   cd backend
   node scripts/check-faucet-setup.js
   ```

   This will check:
   - Environment variables are set
   - Server wallet is initialized
   - Server wallet has sufficient balance
   - Display funding instructions if needed

2. **Fund the Server Wallet**

   The faucet uses the `SERVER_PRIVATE_KEY` account to send funds. Make sure this account has sufficient APT balance.

   ```bash
   # Check server wallet address and balance
   curl http://localhost:3001/api/faucet/server-info

   # Fund it using Aptos CLI
   aptos account fund-with-faucet --account <SERVER_ADDRESS>

   # Or use the web faucet
   # Visit: https://faucet.devnet.aptoslabs.com
   # Paste your server address shown in the check-faucet-setup.js output
   ```

3. **Environment Variables**

   The faucet uses existing environment variables from `.env`:

   ```env
   # Server Private Key (must have APT balance)
   SERVER_PRIVATE_KEY=your_server_private_key_here

   # Network (devnet, testnet, or mainnet)
   NETWORK=devnet

   # Aptos Node URL
   APTOS_NODE_URL=https://fullnode.devnet.aptoslabs.com/v1
   ```

4. **Start the Backend**

   ```bash
   cd backend
   npm install
   npm start
   ```

### 2. Frontend Integration

The faucet button component is already created at `frontend/components/faucet-button.tsx`.

To add it to your UI:

```tsx
import FaucetButton from "@/components/faucet-button"

// In your component
<FaucetButton
  walletAddress={walletAddress}
  onSuccess={() => {
    console.log("Faucet claim successful!")
  }}
/>
```

## API Endpoints

### POST `/api/faucet/claim`

Claim faucet funds.

**Request:**
```json
{
  "userAddress": "0x..."
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "transactionHash": "0x...",
    "amount": 0.01,
    "amountOctas": 1000000,
    "recipient": "0x...",
    "nextClaimTime": "2024-01-02T00:00:00.000Z",
    "message": "Successfully sent 0.01 APT"
  }
}
```

**Response (Rate Limited):**
```json
{
  "success": false,
  "error": "Rate limit exceeded. You can only claim once every 24 hours.",
  "nextRequestTime": "2024-01-02T00:00:00.000Z",
  "timeRemaining": 43200000
}
```

### GET `/api/faucet/info/:userAddress`

Check claim eligibility for a user.

**Response:**
```json
{
  "success": true,
  "data": {
    "faucetAmount": 0.01,
    "cooldownHours": 24,
    "canClaim": true,
    "lastClaimTime": null,
    "nextClaimTime": null,
    "timeRemaining": "Available now"
  }
}
```

### GET `/api/faucet/stats`

Get faucet statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRequests": 150,
    "last24Hours": 45,
    "last7Days": 120,
    "totalDistributed": 1.5,
    "faucetAmount": 0.01,
    "cooldownHours": 24,
    "server": {
      "address": "0x...",
      "balance": 100.5,
      "balanceAPT": 100.5,
      "status": "Active"
    }
  }
}
```

### GET `/api/faucet/server-info`

Get server wallet information.

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "0x...",
    "balance": 100.5,
    "balanceAPT": 100.5,
    "status": "Active"
  }
}
```

## Database Schema

### FaucetRequest Model

```javascript
{
  address: String,         // User wallet address
  amount: Number,          // Amount sent (in APT)
  transactionHash: String, // On-chain transaction hash
  requestedAt: Date,       // Timestamp of request
  ipAddress: String        // IP address (optional)
}
```

Indexes:
- `{ address: 1, requestedAt: -1 }` - For efficient rate limiting queries

## Rate Limiting

- **Cooldown Period**: 24 hours
- **Tracking**: MongoDB stores all requests with timestamps
- **Check Method**: Queries for any request from the address in the last 24 hours
- **IP Tracking**: Optional IP address logging for additional security

## Security Considerations

1. **Server Private Key**: Keep the `SERVER_PRIVATE_KEY` secure and never commit it to version control
2. **Rate Limiting**: 24-hour cooldown prevents abuse
3. **Address Validation**: Validates Aptos address format before processing
4. **Transaction Tracking**: All transactions are logged for audit purposes
5. **Balance Monitoring**: Monitor server wallet balance to ensure faucet availability

## Monitoring

### Check Server Balance

```bash
curl http://localhost:3001/api/faucet/server-info
```

### View Statistics

```bash
curl http://localhost:3001/api/faucet/stats
```

### Alert Thresholds

Set up monitoring for:
- Server wallet balance < 1 APT
- Unusual request patterns (many requests in short time)
- Failed transactions

## Troubleshooting

### "Aptos client or account not initialized"

- Check that `SERVER_PRIVATE_KEY` is set in `.env`
- Verify the private key format is correct
- Restart the backend server

### "Insufficient balance"

- Fund the server wallet with more APT
- Check balance: `aptos account balance --account <SERVER_ADDRESS>`

### "Rate limit exceeded"

- This is expected behavior
- User must wait 24 hours from their last claim
- Check last claim time in the error response

## Production Considerations

For production deployment:

1. **Increase Security**:
   - Add CAPTCHA to prevent bot abuse
   - Implement IP-based rate limiting
   - Add wallet verification (prove ownership)

2. **Adjust Amounts**:
   - Modify `FAUCET_AMOUNT_APT` in `FaucetService.js`
   - Consider network (testnet vs mainnet)

3. **Monitoring**:
   - Set up alerts for low balance
   - Track abuse patterns
   - Log analytics

4. **Scalability**:
   - Consider using Redis for rate limiting (faster than MongoDB)
   - Implement request queuing for high traffic
