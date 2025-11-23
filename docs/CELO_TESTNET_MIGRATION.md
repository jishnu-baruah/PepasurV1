# ⚠️ Celo Testnet Migration Notice

## Important: Alfajores → Celo Sepolia

**Celo Alfajores testnet will sunset on September 30, 2025.**

All Pepasur deployment scripts and configuration files have been updated to use **Celo Sepolia** as the default Celo testnet.

---

## What Changed?

### Configuration Files Updated

All `.env.celo-testnet` files now point to Celo Sepolia:

| Component | File | Changes |
|-----------|------|---------|
| Contract | `contract/.env.celo-testnet` | Chain ID: 44787 → 11142220<br>RPC: Alfajores → Sepolia |
| Backend | `backend/.env.celo-testnet` | Chain ID: 44787 → 11142220<br>RPC: Alfajores → Sepolia |
| Frontend | `frontend/.env.celo-testnet` | Chain ID: 44787 → 11142220<br>RPC: Alfajores → Sepolia |

### Deployment Scripts Updated

- `deploy-all.bat` (Windows)
- `deploy-all.sh` (Linux/Mac)
- `deploy-celo-sepolia.bat` (Windows)
- `deploy-celo-sepolia.sh` (Linux/Mac)

All scripts now deploy to Celo Sepolia by default when selecting "Celo Testnet".

---

## Key Differences

| Aspect | Alfajores (Old) | Celo Sepolia (New) |
|--------|-----------------|-------------------|
| **Chain ID** | 44787 | 11142220 |
| **RPC URL** | https://alfajores-forno.celo-testnet.org | https://forno.celo-sepolia.celo-testnet.org |
| **Explorer** | https://alfajores.celoscan.io | https://celo-sepolia.blockscout.com |
| **Faucet** | https://faucet.celo.org/alfajores | https://faucet.celo.org/celo-sepolia |
| **Status** | Sunset Sept 30, 2025 | Active, long-term testnet |
| **L1 Foundation** | Ethereum Holesky | Ethereum Sepolia |

---

## Migration Steps

### If You're Starting Fresh

No action needed! Just follow the deployment guides:
- `CELO_SEPOLIA_DEPLOYMENT.md` - Full deployment guide
- `CELO_SEPOLIA_QUICK_START.md` - Quick start guide

### If You Have Existing Alfajores Deployment

1. **Deploy new contracts to Celo Sepolia**
   ```bash
   cd contract
   cp .env.celo-sepolia .env
   # Edit .env with your keys
   npx hardhat run scripts/deploy.js --network celoSepolia
   npx hardhat run scripts/initialize.js --network celoSepolia
   ```

2. **Update backend configuration**
   ```bash
   cd ../backend
   cp .env.celo-sepolia .env
   # Update CONTRACT_ADDRESS with new deployment
   npm run dev
   ```

3. **Update frontend configuration**
   ```bash
   cd ../frontend
   cp .env.celo-sepolia .env.local
   # Update NEXT_PUBLIC_CONTRACT_ADDRESS
   npm run build
   npm start
   ```

4. **Update MetaMask**
   - Add Celo Sepolia network (Chain ID: 11142220)
   - Get testnet tokens from faucet

---

## Getting Celo Sepolia Testnet Tokens

**Option 1: Celo Faucet**
```
https://faucet.celo.org/celo-sepolia
```

**Option 2: Google Cloud Faucet**
```
https://cloud.google.com/application/web3/faucet/celo/sepolia
```

**Option 3: Bridge from Ethereum Sepolia**
```
https://testnets.superbridge.app/?fromChainId=11155111&toChainId=11142220
```

---

## Timeline

- **July 23, 2025**: Celo Sepolia launched ✅
- **August 14 - September 14, 2025**: Transition period (current) 🔄
- **September 30, 2025**: Alfajores sunset 🌅

---

## Need Help?

- **Full Deployment Guide**: See `CELO_SEPOLIA_DEPLOYMENT.md`
- **Quick Start**: See `CELO_SEPOLIA_QUICK_START.md`
- **Discord Support**: https://chat.celo.org (#celo-L2-support)
- **Celo Docs**: https://docs.celo.org/

---

## Hardhat Network Configuration

The `hardhat.config.js` already includes Celo Sepolia configuration:

```javascript
celoSepolia: {
    url: process.env.CELO_SEPOLIA_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org",
    chainId: 11142220,
    accounts: process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [],
    gasPrice: "auto",
}
```

Use with: `--network celoSepolia`

---

## FAQ

**Q: Can I still use Alfajores?**
A: Yes, until September 30, 2025. However, we recommend migrating to Celo Sepolia now.

**Q: Will my Alfajores contracts stop working?**
A: Yes, after September 30, 2025, when Alfajores sunsets.

**Q: Do I need to redeploy everything?**
A: Yes, Celo Sepolia starts with a clean slate. No state is carried over from Alfajores.

**Q: What about my testnet tokens?**
A: You'll need to get new testnet CELO from the Celo Sepolia faucets.

**Q: Is the contract code compatible?**
A: Yes! The same Solidity contracts work on both networks. Just redeploy.

---

**Ready to migrate? Follow the guides and deploy to Celo Sepolia today! 🚀**
