# Environment Configuration Guide

This guide explains how to configure the backend for different EVM networks.

## Quick Start

1. Copy the appropriate example file for your target network:

```bash
# For U2U Network
cp .env.u2u.example .env

# For Celo Network
cp .env.celo.example .env

# For Celo Sepolia Testnet
cp .env.celo-sepolia.example .env
```

2. Update the following required variables in your `.env` file:
   - `CONTRACT_ADDRESS`: Your deployed Pepasur contract address
   - `SERVER_PRIVATE_KEY`: Your server wallet private key (64 hex characters)
   - `ADMIN_PRIVATE_KEY`: Your admin wallet private key (64 hex characters)

3. (Optional) Update `ALLOWED_ORIGINS` if deploying to custom domains

## Environment Variables Reference

### Network Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `NETWORK_NAME` | Network identifier | `u2u`, `celo`, `celo-sepolia` |
| `CHAIN_ID` | EVM chain ID | `39` (U2U), `42220` (Celo), `44787` (Celo Sepolia) |
| `RPC_URL` | HTTP RPC endpoint | `https://rpc-mainnet.uniultra.xyz` |
| `WS_URL` | WebSocket endpoint | `wss://ws-mainnet.uniultra.xyz` |

### Contract Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `CONTRACT_ADDRESS` | Deployed contract address | `0x1234...abcd` |
| `CONTRACT_ABI_PATH` | Path to contract ABI JSON | `./contracts/PepasurABI.json` |

### Wallet Configuration

| Variable | Description | Security |
|----------|-------------|----------|
| `SERVER_PRIVATE_KEY` | Server wallet private key | **CRITICAL - Never commit!** |
| `ADMIN_PRIVATE_KEY` | Admin wallet private key | **CRITICAL - Never commit!** |

**Generating Private Keys:**
```bash
# Generate a random private key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### API Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `ALLOWED_ORIGINS` | CORS allowed origins (comma-separated) | `https://u2u.pepasur.xyz,http://localhost:3000` |

### Game Settings

| Variable | Description | Default |
|----------|-------------|---------|
| `DEFAULT_NIGHT_PHASE_DURATION` | Night phase duration (seconds) | `30` |
| `DEFAULT_RESOLUTION_PHASE_DURATION` | Resolution phase duration (seconds) | `10` |
| `DEFAULT_TASK_PHASE_DURATION` | Task phase duration (seconds) | `30` |
| `DEFAULT_VOTING_PHASE_DURATION` | Voting phase duration (seconds) | `10` |
| `DEFAULT_MAX_TASK_COUNT` | Maximum task count | `4` |

### Faucet Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `FAUCET_AMOUNT` | Amount to send per faucet request | `0.01` |
| `FAUCET_COOLDOWN_HOURS` | Hours between faucet requests | `24` |

## Network-Specific Configurations

### U2U Network (Mainnet)

```bash
NETWORK_NAME=u2u
CHAIN_ID=39
RPC_URL=https://rpc-mainnet.uniultra.xyz
WS_URL=wss://ws-mainnet.uniultra.xyz
ALLOWED_ORIGINS=https://u2u.pepasur.xyz
```

**Resources:**
- Explorer: https://u2uscan.xyz
- Native Token: U2U
- Decimals: 18

### Celo Network (Mainnet)

```bash
NETWORK_NAME=celo
CHAIN_ID=42220
RPC_URL=https://forno.celo.org
WS_URL=wss://forno.celo.org/ws
ALLOWED_ORIGINS=https://celo.pepasur.xyz
```

**Resources:**
- Explorer: https://explorer.celo.org
- Native Token: CELO
- Decimals: 18

### Celo Sepolia (Testnet)

```bash
NETWORK_NAME=celo-sepolia
CHAIN_ID=44787
RPC_URL=https://alfajores-forno.celo-testnet.org
WS_URL=wss://alfajores-forno.celo-testnet.org/ws
ALLOWED_ORIGINS=http://localhost:3000
```

**Resources:**
- Explorer: https://celo-sepolia.blockscout.com
- Faucet: https://faucet.celo.org
- Native Token: CELO (testnet)
- Decimals: 18

## Security Best Practices

1. **Never commit `.env` files** - They contain sensitive private keys
2. **Use different keys for different environments** - Don't reuse production keys in testnet
3. **Rotate keys regularly** - Especially if they may have been compromised
4. **Limit key access** - Only authorized personnel should have access to production keys
5. **Use environment-specific keys** - Separate keys for U2U and Celo deployments
6. **Monitor wallet balances** - Ensure server and admin wallets have sufficient funds

## Deployment Checklist

- [ ] Copy appropriate `.env.*.example` file to `.env`
- [ ] Deploy Pepasur contract to target network
- [ ] Update `CONTRACT_ADDRESS` with deployed address
- [ ] Generate and set `SERVER_PRIVATE_KEY`
- [ ] Generate and set `ADMIN_PRIVATE_KEY`
- [ ] Fund server wallet with native tokens (for faucet and gas)
- [ ] Update `ALLOWED_ORIGINS` with production domain
- [ ] Verify RPC and WebSocket URLs are correct
- [ ] Test connection with `npm start`
- [ ] Verify contract interactions work correctly

## Troubleshooting

### Connection Issues

**Problem:** Cannot connect to RPC endpoint

**Solutions:**
- Verify `RPC_URL` is correct for your network
- Check if RPC endpoint is accessible (try in browser)
- Try alternative RPC endpoints if available
- Check firewall/network restrictions

### Transaction Failures

**Problem:** Transactions fail with "insufficient funds"

**Solutions:**
- Check server wallet balance: `cast balance <address> --rpc-url $RPC_URL`
- Fund the wallet with native tokens
- Verify gas price settings

### Contract Interaction Errors

**Problem:** Contract calls fail

**Solutions:**
- Verify `CONTRACT_ADDRESS` is correct
- Ensure contract is deployed on the configured network
- Check `CONTRACT_ABI_PATH` points to correct ABI file
- Verify `CHAIN_ID` matches the network

### CORS Errors

**Problem:** Frontend cannot connect to backend

**Solutions:**
- Add frontend domain to `ALLOWED_ORIGINS`
- Ensure origins are comma-separated with no spaces
- Include protocol (http:// or https://)
- Restart backend after changing CORS settings

## Support

For additional help:
- Check the main README.md
- Review the MIGRATION_GUIDE.md
- Consult network-specific documentation
