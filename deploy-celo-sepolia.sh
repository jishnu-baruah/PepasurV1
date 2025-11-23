#!/bin/bash
# Celo Sepolia Testnet Deployment Script for Linux/Mac
# This script deploys Pepasur to Celo Sepolia testnet

set -e  # Exit on error

echo "========================================"
echo "Pepasur - Celo Sepolia Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -d "contract" ]; then
    echo "ERROR: contract directory not found!"
    echo "Please run this script from the project root directory."
    exit 1
fi

echo "Step 1: Deploy Smart Contract"
echo "========================================"
cd contract

# Check if .env exists, if not copy from template
if [ ! -f ".env" ]; then
    echo "Copying .env.celo-sepolia to .env..."
    cp .env.celo-sepolia .env
    echo ""
    echo "IMPORTANT: Please edit contract/.env with your private keys!"
    read -p "Press Enter when ready to continue..."
fi

echo "Checking deployer balance..."
if ! npx hardhat run scripts/check-balance.js --network celoSepolia; then
    echo ""
    echo "ERROR: Failed to check balance. Please ensure:"
    echo "1. You have testnet CELO tokens"
    echo "2. Your .env file is configured correctly"
    echo ""
    echo "Get testnet CELO from:"
    echo "- https://faucet.celo.org/celo-sepolia"
    echo "- https://cloud.google.com/application/web3/faucet/celo/sepolia"
    exit 1
fi

echo ""
echo "Compiling contracts..."
if ! npx hardhat compile; then
    echo "ERROR: Contract compilation failed!"
    exit 1
fi

echo ""
echo "Deploying contract to Celo Sepolia..."
if ! npx hardhat run scripts/deploy.js --network celoSepolia; then
    echo "ERROR: Contract deployment failed!"
    exit 1
fi

echo ""
echo "IMPORTANT: Please update CONTRACT_ADDRESS in contract/.env"
read -p "Press Enter when ready to continue..."

echo ""
echo "Initializing contract..."
if ! npx hardhat run scripts/initialize.js --network celoSepolia; then
    echo "ERROR: Contract initialization failed!"
    exit 1
fi

echo ""
echo "Testing game creation..."
if ! npx hardhat run scripts/test-game-creation.js --network celoSepolia; then
    echo "WARNING: Game creation test failed!"
    echo "You may need to check the contract configuration."
fi

cd ..

echo ""
echo "========================================"
echo "Step 2: Deploy Backend"
echo "========================================"
cd backend

# Check if .env exists, if not copy from template
if [ ! -f ".env" ]; then
    echo "Copying .env.celo-sepolia to .env..."
    cp .env.celo-sepolia .env
    echo ""
    echo "IMPORTANT: Please edit backend/.env with:"
    echo "1. SERVER_PRIVATE_KEY"
    echo "2. CONTRACT_ADDRESS (from Step 1)"
    read -p "Press Enter when ready to continue..."
fi

echo "Copying contract ABI..."
if [ -f "../contract/artifacts/contracts/Pepasur.sol/Pepasur.json" ]; then
    mkdir -p contracts
    cp "../contract/artifacts/contracts/Pepasur.sol/Pepasur.json" "./contracts/PepasurABI.json"
    echo "ABI copied successfully!"
else
    echo "WARNING: Contract ABI not found. Please compile the contract first."
fi

echo ""
echo "Installing backend dependencies..."
if ! npm install; then
    echo "ERROR: Failed to install backend dependencies!"
    exit 1
fi

echo ""
echo "Backend is ready to start!"
echo "Run: npm run dev"
echo ""

cd ..

echo ""
echo "========================================"
echo "Step 3: Deploy Frontend"
echo "========================================"
cd frontend

# Check if .env.local exists, if not copy from template
if [ ! -f ".env.local" ]; then
    echo "Copying .env.celo-sepolia to .env.local..."
    cp .env.celo-sepolia .env.local
    echo ""
    echo "IMPORTANT: Please edit frontend/.env.local with:"
    echo "1. NEXT_PUBLIC_CONTRACT_ADDRESS (from Step 1)"
    echo "2. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID"
    read -p "Press Enter when ready to continue..."
fi

echo ""
echo "Installing frontend dependencies..."
if ! npm install; then
    echo "ERROR: Failed to install frontend dependencies!"
    exit 1
fi

echo ""
echo "Building frontend..."
if ! npm run build; then
    echo "ERROR: Frontend build failed!"
    exit 1
fi

echo ""
echo "Frontend is ready to start!"
echo "Run: npm start"
echo ""

cd ..

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && npm run dev"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Open http://localhost:3000"
echo "4. Connect MetaMask to Celo Sepolia (Chain ID: 11142220)"
echo "5. Test the application!"
echo ""
echo "Block Explorer: https://celo-sepolia.blockscout.com"
echo ""
