# Celo Sepolia Quick Start Guide

## Why Celo Sepolia?

Celo Sepolia is the **new testnet** replacing Alfajores (which sunsets Sept 30, 2025). Deploy here for future-proof testing!

## Quick Deploy (3 Steps)

### 1️⃣ Get Testnet Tokens

Visit one of these faucets:
- https://faucet.celo.org/celo-sepolia
- https://cloud.google.com/application/web3/faucet/celo/sepolia

Request ~1 CELO to your wallet address.

### 2️⃣ Run Deployment Script

```bash
# Windows
deploy-celo-sepolia.bat

# Linux/Mac
chmod +x deploy-celo-sepolia.sh
./deploy-celo-sepolia.sh
```

The script will:
- Deploy smart contract to Celo Sepolia
- Configure backend
- Build frontend

### 3️⃣ Configure & Start

**Edit these files with your values:**

`contract/.env`:
```bash
DEPLOYER_PRIVATE_KEY=0xYOUR_KEY
SERVER_SIGNER_ADDRESS=0xYOUR_ADDRESS
FEE_RECIPIENT_ADDRESS=0xYOUR_ADDRESS
CONTRACT_ADDRESS=0xDEPLOYED_ADDRESS  # After deployment
```

`backend/.env`:
```bash
SERVER_PRIVATE_KEY=0xYOUR_KEY
CONTRACT_ADDRESS=0xDEPLOYED_ADDRESS  # From contract deployment
```

`frontend/.env.local`:
```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=0xDEPLOYED_ADDRESS  # From contract deployment
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id  # From cloud.walletconnect.com
```

**Start services:**
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

## Test Your Deployment

1. **Add Celo Sepolia to MetaMask**
   - Network: Celo Sepolia Testnet
   - RPC: https://forno.celo-sepolia.celo-testnet.org
   - Chain ID: 11142220
   - Symbol: CELO
   - Explorer: https://celo-sepolia.blockscout.com

2. **Open App**
   - Visit: http://localhost:3000
   - Connect wallet
   - Create a game
   - Test with friends!

## Key Information

| Item | Value |
|------|-------|
| Chain ID | 11142220 |
| RPC URL | https://forno.celo-sepolia.celo-testnet.org |
| Explorer | https://celo-sepolia.blockscout.com |
| Faucet | https://faucet.celo.org/celo-sepolia |
| Network | celoSepolia |

## Need Help?

- **Full Guide**: See `CELO_SEPOLIA_DEPLOYMENT.md`
- **Discord**: https://chat.celo.org (#celo-L2-support)
- **Docs**: https://docs.celo.org/

## Manual Deployment

If you prefer manual deployment:

```bash
# 1. Deploy Contract
cd contract
cp .env.celo-sepolia .env
# Edit .env with your keys
npx hardhat compile
npx hardhat run scripts/deploy.js --network celoSepolia
npx hardhat run scripts/initialize.js --network celoSepolia

# 2. Setup Backend
cd ../backend
cp .env.celo-sepolia .env
# Edit .env with contract address
cp ../contract/artifacts/contracts/Pepasur.sol/Pepasur.json ./contracts/PepasurABI.json
npm install
npm run dev

# 3. Setup Frontend
cd ../frontend
cp .env.celo-sepolia .env.local
# Edit .env.local with contract address and WalletConnect ID
npm install
npm run build
npm start
```

## Troubleshooting

**"Insufficient funds"**
→ Get more testnet CELO from faucets

**"Wrong network"**
→ Switch MetaMask to Celo Sepolia (Chain ID: 11142220)

**"Contract not found"**
→ Verify contract address in all .env files

**"ABI not found"**
→ Copy ABI: `cp ../contract/artifacts/contracts/Pepasur.sol/Pepasur.json ./contracts/PepasurABI.json`

---

**Ready to deploy? Let's go! 🚀**
