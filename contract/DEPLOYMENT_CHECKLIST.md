# PepAsur Devnet Deployment Checklist

Complete these steps in order to deploy to Aptos Devnet.

## Pre-Deployment

- [X] Aptos CLI installed and working (`aptos --version`)
- [X] Code reviewed and audited
- [X] All tests passing (`aptos move test --dev`)
- [X] Contract compiles without errors (`aptos move compile --dev`)

## Step 1: Account Setup

```bash
# Initialize Aptos account for devnet
aptos init --network devnet
```

**Action Items:**
- [X] Save the generated account address
- [X] Backup the private key from `.aptos/config.yaml` securely
- [x] Copy `.env.example` to `.env` and fill in your admin address

## Step 2: Fund Account

Visit: https://aptos.dev/en/network/faucet

OR use CLI:
```bash
aptos account fund-with-faucet --profile default \
  --url https://fullnode.devnet.aptoslabs.com \
  --faucet-url https://faucet.devnet.aptoslabs.com
```

**Action Items:**
- [ ] Account funded with devnet APT (check balance with `aptos account list`)
- [ ] Wait for transaction confirmation (check on https://explorer.aptoslabs.com)

## Step 3: Generate Server Keys

```bash
# Generate server signing key
aptos key generate --output-file server-key.json
```

**Action Items:**
- [ ] Save `server-key.json` securely (DO NOT COMMIT)
- [ ] Copy the public key hex from output
- [ ] Store public key in `.env` as `SERVER_SIGNER_PUBKEY`
- [ ] Deploy `server-key.json` to your game server (keep secure!)

## Step 4: Final Pre-Deploy Checks

```bash
# Compile one more time
aptos move compile --dev

# Run tests one more time
aptos move test --dev
```

**Action Items:**
- [ ] Compilation successful
- [ ] All 9 tests passing

## Step 5: Deploy Contract

```bash
aptos move deploy-object --address-name pepasur --assume-yes
```

**Action Items:**
- [ ] Deployment transaction confirmed
- [ ] **SAVE THE CODE OBJECT ADDRESS** from output (critical!)
- [ ] Add object address to `.env` as `CONTRACT_ADDRESS`
- [ ] Verify deployment on explorer: https://explorer.aptoslabs.com/?network=devnet

## Step 6: Configure Contract

Replace `<OBJECT_ADDRESS>` with your deployed contract address:

### 6a. Set Server Signer Public Key

```bash
aptos move run \
  --function-id '<OBJECT_ADDRESS>::pepasur::update_server_signer' \
  --args 'hex:<SERVER_PUBLIC_KEY_FROM_STEP_3>'
```

**Action Items:**
- [ ] Server signer updated successfully
- [ ] Transaction confirmed on explorer

### 6b. Update Fee Recipient (Optional)

```bash
# Only if you want fees to go to a different address
aptos move run \
  --function-id '<OBJECT_ADDRESS>::pepasur::update_fee_recipient' \
  --args 'address:<FEE_RECIPIENT_ADDRESS>'
```

**Action Items:**
- [ ] Fee recipient updated (if needed)
- [ ] Transaction confirmed

### 6c. Update House Cut (Optional)

```bash
# Only if you want different than 2% (default is 200 bps)
aptos move run \
  --function-id '<OBJECT_ADDRESS>::pepasur::update_house_cut' \
  --args 'u16:<HOUSE_CUT_BPS>'
```

**Action Items:**
- [ ] House cut updated (if needed)
- [ ] Transaction confirmed

## Step 7: Verify Deployment

### Test View Functions

```bash
# Get config
aptos move view \
  --function-id '<OBJECT_ADDRESS>::pepasur::get_config'

# Get next game ID (should be 1)
aptos move view \
  --function-id '<OBJECT_ADDRESS>::pepasur::get_next_game_id'
```

**Action Items:**
- [ ] View functions return expected values
- [ ] Config shows correct admin, fee recipient, house cut
- [ ] Next game ID is 1

## Step 8: Integration Test (Optional)

Create a test game to verify everything works:

```bash
# Create a test game with 0.01 APT stake (1000000 octas), min 2 players
aptos move run \
  --function-id '<OBJECT_ADDRESS>::pepasur::create_game' \
  --args 'u64:1000000' 'u8:2'
```

**Action Items:**
- [ ] Game created successfully
- [ ] Can view game with `get_game` function
- [ ] Game shows up in explorer events

## Post-Deployment

**Action Items:**
- [ ] Update backend `.env` with `CONTRACT_ADDRESS`
- [ ] Update frontend with contract address
- [ ] Deploy server-key.json to backend server
- [ ] Update backend signature logic to use server private key
- [ ] Test full flow: create game → join → settle → withdraw
- [ ] Document contract address in project README

## Important Addresses to Save

```
Network: Devnet
Admin Address: _________________
Contract Object Address: _________________
Fee Recipient: _________________
Server Signer Public Key: _________________
```

## Troubleshooting

### "Insufficient balance" error
- Fund account again from faucet
- Check balance: `aptos account list`

### "Module not found" error
- Double-check object address
- Verify deployment succeeded on explorer

### "Invalid signature" errors
- Ensure server public key matches the private key being used
- Verify BCS encoding format matches contract expectations

### View function fails
- Wait a few seconds for indexer to catch up
- Try again with full node URL: `--url https://fullnode.devnet.aptoslabs.com`

## Next Steps

After successful deployment:

1. **Update Backend**: Configure AptosService with contract address
2. **Update Frontend**: Add contract address to environment variables
3. **Test Flow**: End-to-end test with real transactions
4. **Monitor**: Watch contract on explorer for activity
5. **Document**: Update project docs with deployment info

## Mainnet Deployment

⚠️ **Do not deploy to mainnet without:**
- [ ] Full security audit
- [ ] Extensive testing on devnet
- [ ] Real APT tokens for gas fees
- [ ] Understanding that mainnet deployment is permanent

For mainnet, change `--network devnet` to `--network mainnet` in all commands.
