#!/bin/bash

# Pepasur Complete Deployment Script
# This script helps automate the deployment process

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_info "Checking prerequisites..."

if ! command_exists node; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_success "Prerequisites check passed"

# Get deployment target
echo ""
print_info "Select deployment target:"
echo "1) U2U Nebulas Testnet"
echo "2) U2U Mainnet"
echo "3) Celo Sepolia Testnet"
echo "4) Celo Mainnet"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        NETWORK="u2uTestnet"
        ENV_FILE="u2u-testnet"
        NETWORK_NAME="U2U Nebulas Testnet"
        ;;
    2)
        NETWORK="u2u"
        ENV_FILE="u2u-mainnet"
        NETWORK_NAME="U2U Mainnet"
        print_warning "You are deploying to MAINNET. This will use real funds!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Deployment cancelled"
            exit 0
        fi
        ;;
    3)
        NETWORK="celoSepolia"
        ENV_FILE="celo-sepolia"
        NETWORK_NAME="Celo Sepolia Testnet"
        ;;
    4)
        NETWORK="celo"
        ENV_FILE="celo-mainnet"
        NETWORK_NAME="Celo Mainnet"
        print_warning "You are deploying to MAINNET. This will use real funds!"
        read -p "Are you sure? (yes/no): " confirm
        if [ "$confirm" != "yes" ]; then
            print_info "Deployment cancelled"
            exit 0
        fi
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
print_info "Deploying to: $NETWORK_NAME"
echo ""

# Step 1: Deploy Smart Contract
print_info "Step 1: Deploying Smart Contract"
cd contract

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Copying from template..."
    if [ -f ".env.$ENV_FILE" ]; then
        cp ".env.$ENV_FILE" .env
        print_warning "Please edit contract/.env with your values and run this script again"
        exit 1
    else
        print_error "Template file .env.$ENV_FILE not found"
        exit 1
    fi
fi

# Install dependencies
print_info "Installing contract dependencies..."
npm install

# Compile contracts
print_info "Compiling contracts..."
npx hardhat compile

# Check balance
print_info "Checking deployer balance..."
npx hardhat run scripts/check-balance.js --network $NETWORK

# Deploy contract
print_info "Deploying contract..."
npx hardhat run scripts/deploy.js --network $NETWORK

# Ask for contract address
echo ""
read -p "Enter the deployed contract address: " CONTRACT_ADDRESS

if [ -z "$CONTRACT_ADDRESS" ]; then
    print_error "Contract address is required"
    exit 1
fi

# Update .env with contract address
echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
print_success "Contract address saved to .env"

# Initialize contract
print_info "Initializing contract..."
npx hardhat run scripts/initialize.js --network $NETWORK

print_success "Contract deployment complete!"

# Ask if user wants to verify
read -p "Do you want to verify the contract on block explorer? (yes/no): " verify
if [ "$verify" = "yes" ]; then
    print_info "Verifying contract..."
    npx hardhat verify --network $NETWORK $CONTRACT_ADDRESS || print_warning "Verification failed or not supported"
fi

cd ..

# Step 2: Configure Backend
echo ""
print_info "Step 2: Configuring Backend"
cd backend

# Check if .env exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Copying from template..."
    if [ -f ".env.$ENV_FILE" ]; then
        cp ".env.$ENV_FILE" .env
        # Update contract address in backend .env
        echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
        print_success "Backend .env created with contract address"
    else
        print_error "Template file .env.$ENV_FILE not found"
        exit 1
    fi
else
    # Update existing .env with contract address
    if grep -q "CONTRACT_ADDRESS=" .env; then
        sed -i "s|CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env
    else
        echo "CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env
    fi
    print_success "Backend .env updated with contract address"
fi

# Copy ABI
print_info "Copying contract ABI..."
mkdir -p contracts
cp ../contract/contracts/PepasurABI.json ./contracts/
print_success "ABI copied"

# Install dependencies
print_info "Installing backend dependencies..."
npm install

print_success "Backend configuration complete!"
print_info "To start backend: cd backend && npm run dev"

cd ..

# Step 3: Configure Frontend
echo ""
print_info "Step 3: Configuring Frontend"
cd frontend

# Check if .env.local exists
if [ ! -f .env.local ]; then
    print_warning ".env.local file not found. Copying from template..."
    if [ -f ".env.$ENV_FILE" ]; then
        cp ".env.$ENV_FILE" .env.local
        # Update contract address in frontend .env.local
        sed -i "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env.local
        print_success "Frontend .env.local created with contract address"
    else
        print_error "Template file .env.$ENV_FILE not found"
        exit 1
    fi
else
    # Update existing .env.local with contract address
    if grep -q "NEXT_PUBLIC_CONTRACT_ADDRESS=" .env.local; then
        sed -i "s|NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS|" .env.local
    else
        echo "NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDRESS" >> .env.local
    fi
    print_success "Frontend .env.local updated with contract address"
fi

# Install dependencies
print_info "Installing frontend dependencies..."
npm install

print_success "Frontend configuration complete!"
print_info "To start frontend: cd frontend && npm run dev"

cd ..

# Summary
echo ""
echo "═══════════════════════════════════════════════════════════"
print_success "Deployment Complete!"
echo "═══════════════════════════════════════════════════════════"
echo ""
print_info "Network: $NETWORK_NAME"
print_info "Contract Address: $CONTRACT_ADDRESS"
echo ""
print_info "Next Steps:"
echo "  1. Review and update environment variables if needed"
echo "  2. Start backend: cd backend && npm run dev"
echo "  3. Start frontend: cd frontend && npm run dev"
echo "  4. Test the complete flow"
echo ""
print_info "For production deployment, see DEPLOYMENT_ORCHESTRATION.md"
echo ""
