# Pepasur Deployment Orchestration Guide

This guide provides step-by-step instructions for deploying the complete Pepasur application (contracts, backend, and frontend) to testnets and mainnets.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Testnet Deployment (U2U Nebulas)](#testnet-deployment-u2u-nebulas)
4. [Testnet Deployment (Celo Sepolia)](#testnet-deployment-celo-sepolia)
5. [Mainnet Deployment (U2U)](#mainnet-deployment-u2u)
6. [Mainnet Deployment (Celo)](#mainnet-deployment-celo)
7. [Verification & Testing](#verification--testing)
8. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Overview

### Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Deployment Flow                          │
└─────────────────────────────────────────────────────────────┘

1. Smart Contract Deployment
   ├── Deploy Pepasur.sol to network
   ├── Initialize contract with server signer
   └── Verify on block explorer

2. Backend Deployment
   ├── Configure environment for network
   ├── Update contract address
   ├── Deploy to server infrastructure
   └── Test API endpoints

3. Frontend Deployment
   ├── Configure environment for network
   ├── Update contract address
   ├── Build production bundle
   └── Deploy to hosting (Vercel/Netlify/custom)

4. Integration Testing
   ├── Test wallet connection
   ├── Test game creation
   ├── Test player joining
   ├── Test settlement flow
   └── Test withdrawal
```

---

## Prerequisites

### Required Accounts & Keys

1. **Deployer Wallet**:
   - Private key for contract deployment
   - Funded with native tokens (U2U/CELO)

2. **Server Wallet**:
   - Private key for backend operations
   - Address used as server signer in contract
   - Funded with native tokens for gas

3. **Admin Wallet** (optional, can be same as deployer):
   - Private key for admin functions
   - Funded with native tokens

### Required Services

1. **WalletConnect Project ID**:
   - Sign up at https://cloud.walletconnect.com/
   - Create a new project
   - Copy the Project ID

2. **Hosting Infrastructure**:
   - Backend: VPS, AWS, DigitalOcean, etc.
   - Frontend: Vercel, Netlify, or custom hosting

3. **Domain Names** (for production):
   - `u2u.pepasur.xyz` → U2U frontend
   - `api.u2u.pepasur.xyz` → U2U backend
   - `celo.pepasur.xyz` → Celo frontend
   - `api.celo.pepasur.xyz` → Celo backend

### Required Tokens

| Network | Token | Amount Needed | Purpose |
|---------|-------|---------------|---------|
| U2U Nebulas Testnet | U2U | ~1 U2U | Deployment + testing |
| U2U Mainnet | U2U | ~5 U2U | Deployment + operations |
| Celo Sepolia | CELO | ~1 CELO | Deployment + testing |
| Celo Mainnet | CELO | ~5 CELO | Deployment + operations |

---

## Testnet Deployment (U2U Nebulas)

### Step 1: Deploy Smart Contract

```bash
# Navigate to contract directory
cd contract

# Configure environment
cp .env.u2u-testnet .env

# Edit .env with your values
# DEPLOYER_PRIVATE_KEY=0x...
# SERVER_SIGNER_ADDRESS=0x...
# FEE_RECIPIENT_ADDRESS=0x...

# Check deployer balance
npx hardhat run scripts/check-balance.js --network u2uTestnet

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy contract
npx hardhat run scripts/deploy.js --network u2uTestnet

# Save the deployed contract address!
# CONTRACT_ADDRESS=0x...

# Update .env with contract address
echo "CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS" >> .env

# Initialize contract
npx hardhat run scripts/initialize.js --network u2uTestnet

# Verify contract (optional)
npx hardhat verify --network u2uTestnet 0xYOUR_CONTRACT_ADDRESS

# Test game creation
npx hardhat run scripts/test-game-creation.js --network u2uTestnet
```

**Expected Output**:
```
✅ Pepasur deployed to: 0x1234...
✅ Contract Initialized
✅ Game creation test successful!
```

### Step 2: Deploy Backend

```bash
# Navigate to backend directory
cd ../backend

# Configure environment
cp .env.u2u-testnet .env

# Edit .env with your values
# SERVER_PRIVATE_KEY=0x...
# CONTRACT_ADDRESS=0x... (from step 1)

# Install dependencies
npm install

# Copy contract ABI
cp ../contract/contracts/PepasurABI.json ./contracts/

# Test backend locally
npm run dev

# In another terminal, test API
curl http://localhost:3001/api/health

# Deploy to server (example using PM2)
npm install -g pm2
pm2 start server.js --name pepasur-u2u-testnet
pm2 save
```

### Step 3: Deploy Frontend

```bash
# Navigate to frontend directory
cd ../frontend

# Configure environment
cp .env.u2u-testnet .env.local

# Edit .env.local with your values
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x... (from step 1)
# NEXT_PUBLIC_API_URL=http://your-backend-url:3001
# NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...

# Install dependencies
npm install

# Build production bundle
npm run build

# Test locally
npm start

# Deploy to Vercel (example)
npm install -g vercel
vercel --prod

# Or deploy to custom server
# Copy .next folder and run: npm start
```

### Step 4: Verify Deployment

```bash
# Test complete flow
# 1. Open frontend URL
# 2. Connect MetaMask to U2U Nebulas Testnet
# 3. Create a game
# 4. Join game with another wallet
# 5. Complete game and test settlement
```

---

## Testnet Deployment (Celo Sepolia)

Celo Sepolia is the new testnet replacing Alfajores (sunset Sept 30, 2025).

Follow the same steps as U2U Nebulas, but use:
- Network: `celoSepolia`
- Environment files: `.env.celo-sepolia`
- RPC URL: `https://forno.celo-sepolia.celo-testnet.org`
- Chain ID: `11142220`

```bash
# Contract deployment
cd contract
cp .env.celo-sepolia .env
npx hardhat run scripts/deploy.js --network celoSepolia
npx hardhat run scripts/initialize.js --network celoSepolia

# Backend deployment
cd ../backend
cp .env.celo-sepolia .env
npm run dev

# Frontend deployment
cd ../frontend
cp .env.celo-sepolia .env.local
npm run build
npm start
```

**Get Testnet Tokens:**
- https://faucet.celo.org/celo-sepolia
- https://cloud.google.com/application/web3/faucet/celo/sepolia

**Block Explorer:**
- https://celo-sepolia.blockscout.com

**For detailed Celo Sepolia deployment guide, see:** `CELO_SEPOLIA_DEPLOYMENT.md`

---

## Mainnet Deployment (U2U)

**⚠️ WARNING**: This uses real funds. Ensure everything is tested on testnet first.

### Pre-Mainnet Checklist

- [ ] All testnet deployments successful
- [ ] Complete game flow tested on testnet
- [ ] Security audit completed (recommended)
- [ ] Backup of all private keys
- [ ] Sufficient U2U tokens for deployment
- [ ] Domain names configured
- [ ] SSL certificates ready
- [ ] Monitoring tools set up

### Step 1: Deploy Smart Contract

```bash
cd contract

# Configure for mainnet
cp .env.u2u-mainnet .env

# CRITICAL: Double-check all values
cat .env

# Check balance
npx hardhat run scripts/check-balance.js --network u2u

# Deploy
npx hardhat run scripts/deploy.js --network u2u

# Initialize
npx hardhat run scripts/initialize.js --network u2u

# Verify
npx hardhat verify --network u2u 0xYOUR_CONTRACT_ADDRESS

# Test
npx hardhat run scripts/test-game-creation.js --network u2u
```

### Step 2: Deploy Backend

```bash
cd ../backend

# Configure for mainnet
cp .env.u2u-mainnet .env

# Update contract address
# Edit .env: CONTRACT_ADDRESS=0x...

# Copy ABI
cp ../contract/contracts/PepasurABI.json ./contracts/

# Deploy to production server
# Example using PM2 on VPS:
ssh user@api.u2u.pepasur.xyz
cd /var/www/pepasur-backend
git pull
npm install
cp .env.u2u-mainnet .env
pm2 restart pepasur-u2u
pm2 logs pepasur-u2u

# Configure nginx reverse proxy
# /etc/nginx/sites-available/pepasur-u2u
```

**Nginx Configuration Example**:
```nginx
server {
    listen 80;
    server_name api.u2u.pepasur.xyz;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Step 3: Deploy Frontend

```bash
cd ../frontend

# Configure for mainnet
cp .env.u2u-mainnet .env.local

# Update values
# NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
# NEXT_PUBLIC_API_URL=https://api.u2u.pepasur.xyz

# Build
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to custom server
scp -r .next package.json user@u2u.pepasur.xyz:/var/www/pepasur-frontend/
ssh user@u2u.pepasur.xyz
cd /var/www/pepasur-frontend
npm install --production
pm2 start npm --name pepasur-u2u-frontend -- start
```

### Step 4: Configure DNS

```
# Add DNS records
u2u.pepasur.xyz        A     YOUR_FRONTEND_IP
api.u2u.pepasur.xyz    A     YOUR_BACKEND_IP
```

### Step 5: Enable SSL

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificates
sudo certbot --nginx -d u2u.pepasur.xyz
sudo certbot --nginx -d api.u2u.pepasur.xyz
```

---

## Mainnet Deployment (Celo)

Follow the same steps as U2U Mainnet, but use:
- Network: `celo`
- Environment files: `.env.celo-mainnet`
- Domains: `celo.pepasur.xyz`, `api.celo.pepasur.xyz`

```bash
# Contract
cd contract
cp .env.celo-mainnet .env
npx hardhat run scripts/deploy.js --network celo
npx hardhat run scripts/initialize.js --network celo

# Backend
cd ../backend
cp .env.celo-mainnet .env
# Deploy to api.celo.pepasur.xyz

# Frontend
cd ../frontend
cp .env.celo-mainnet .env.local
# Deploy to celo.pepasur.xyz
```

---

## Verification & Testing

### Contract Verification

1. **Check Block Explorer**:
   - U2U Testnet: https://testnet.u2uscan.xyz/address/YOUR_ADDRESS
   - U2U Mainnet: https://u2uscan.xyz/address/YOUR_ADDRESS
   - Celo Sepolia: https://celo-sepolia.blockscout.com/address/YOUR_ADDRESS
   - Celo Mainnet: https://explorer.celo.org/address/YOUR_ADDRESS

2. **Verify Contract State**:
```bash
npx hardhat run scripts/interact.js --network <network>
```

### Backend Verification

```bash
# Health check
curl https://api.u2u.pepasur.xyz/api/health

# Expected response:
# {"status":"ok","network":"u2u","chainId":39}
```

### Frontend Verification

1. Open frontend URL
2. Check console for errors
3. Verify network detection
4. Test wallet connection

### End-to-End Testing

1. **Connect Wallet**:
   - Open frontend
   - Click "Connect Wallet"
   - Connect MetaMask
   - Verify correct network

2. **Create Game**:
   - Click "Create Lobby"
   - Set stake amount
   - Create game
   - Verify transaction on explorer

3. **Join Game**:
   - Use second wallet
   - Join game with room code
   - Verify stake transaction

4. **Complete Game**:
   - Play through game phases
   - Verify settlement
   - Test withdrawal

---

## Monitoring & Maintenance

### Contract Monitoring

```bash
# Monitor contract events
npx hardhat run scripts/monitor-events.js --network <network>
```

### Backend Monitoring

```bash
# Check logs
pm2 logs pepasur-u2u

# Monitor resources
pm2 monit

# Check status
pm2 status
```

### Frontend Monitoring

- Set up Vercel Analytics (if using Vercel)
- Monitor error logs
- Track user metrics

### Regular Maintenance Tasks

1. **Daily**:
   - Check backend logs for errors
   - Monitor gas prices
   - Verify API uptime

2. **Weekly**:
   - Review game statistics
   - Check contract balance
   - Update dependencies (if needed)

3. **Monthly**:
   - Security audit
   - Performance optimization
   - Backup database

### Emergency Procedures

**If Contract Needs Update**:
1. Deploy new contract
2. Update backend/frontend configs
3. Migrate any pending withdrawals
4. Announce to users

**If Server Signer Compromised**:
```bash
# Update server signer immediately
npx hardhat run scripts/update-config.js --network <network>
# Set NEW_SERVER_SIGNER_ADDRESS in .env
```

**If Backend Down**:
1. Check PM2 status
2. Restart service
3. Check logs for errors
4. Verify RPC connection

---

## Deployment Checklist

### Contract Deployment
- [ ] Environment configured
- [ ] Deployer wallet funded
- [ ] Contract compiled
- [ ] Tests passing
- [ ] Contract deployed
- [ ] Contract initialized
- [ ] Contract verified on explorer
- [ ] Test game created successfully

### Backend Deployment
- [ ] Environment configured
- [ ] Contract ABI copied
- [ ] Dependencies installed
- [ ] Server started
- [ ] API health check passing
- [ ] CORS configured
- [ ] SSL enabled (production)

### Frontend Deployment
- [ ] Environment configured
- [ ] Dependencies installed
- [ ] Build successful
- [ ] Deployed to hosting
- [ ] DNS configured
- [ ] SSL enabled (production)
- [ ] Wallet connection working

### Integration Testing
- [ ] Wallet connects successfully
- [ ] Game creation works
- [ ] Player joining works
- [ ] Game phases work
- [ ] Settlement works
- [ ] Withdrawal works
- [ ] All transactions visible on explorer

---

## Quick Reference

### Network Commands

```bash
# U2U Nebulas Testnet
--network u2uTestnet

# U2U Mainnet
--network u2u

# Celo Sepolia Testnet
--network celoSepolia

# Celo Mainnet
--network celo
```

### Important URLs

| Network | RPC | Explorer | Faucet |
|---------|-----|----------|--------|
| U2U Nebulas Testnet | https://rpc-nebulas-testnet.u2u.xyz | https://testnet.u2uscan.xyz | Contact U2U team |
| U2U Mainnet | https://rpc-mainnet.uniultra.xyz | https://u2uscan.xyz | - |
| Celo Sepolia | https://forno.celo-sepolia.celo-testnet.org | https://celo-sepolia.blockscout.com | https://faucet.celo.org/celo-sepolia |
| Celo Mainnet | https://forno.celo.org | https://explorer.celo.org | - |

---

## Support & Resources

- [Contract Deployment Guide](./contract/DEPLOYMENT_GUIDE.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Hardhat Documentation](https://hardhat.org/docs)
- [U2U Documentation](https://docs.uniultra.xyz/)
- [Celo Documentation](https://docs.celo.org/)

---

**Happy Deploying! 🚀**
