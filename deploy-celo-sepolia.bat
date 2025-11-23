@echo off
REM Celo Sepolia Testnet Deployment Script for Windows
REM This script deploys Pepasur to Celo Sepolia testnet

echo ========================================
echo Pepasur - Celo Sepolia Deployment
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "contract" (
    echo ERROR: contract directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo Step 1: Deploy Smart Contract
echo ========================================
cd contract

REM Check if .env exists, if not copy from template
if not exist ".env" (
    echo Copying .env.celo-sepolia to .env...
    copy .env.celo-sepolia .env
    echo.
    echo IMPORTANT: Please edit contract/.env with your private keys!
    echo Press any key when ready to continue...
    pause
)

echo Checking deployer balance...
call npx hardhat run scripts/check-balance.js --network celoSepolia
if errorlevel 1 (
    echo.
    echo ERROR: Failed to check balance. Please ensure:
    echo 1. You have testnet CELO tokens
    echo 2. Your .env file is configured correctly
    echo.
    echo Get testnet CELO from:
    echo - https://faucet.celo.org/celo-sepolia
    echo - https://cloud.google.com/application/web3/faucet/celo/sepolia
    pause
    exit /b 1
)

echo.
echo Compiling contracts...
call npx hardhat compile
if errorlevel 1 (
    echo ERROR: Contract compilation failed!
    pause
    exit /b 1
)

echo.
echo Deploying contract to Celo Sepolia...
call npx hardhat run scripts/deploy.js --network celoSepolia
if errorlevel 1 (
    echo ERROR: Contract deployment failed!
    pause
    exit /b 1
)

echo.
echo IMPORTANT: Please update CONTRACT_ADDRESS in contract/.env
echo Press any key when ready to continue...
pause

echo.
echo Initializing contract...
call npx hardhat run scripts/initialize.js --network celoSepolia
if errorlevel 1 (
    echo ERROR: Contract initialization failed!
    pause
    exit /b 1
)

echo.
echo Testing game creation...
call npx hardhat run scripts/test-game-creation.js --network celoSepolia
if errorlevel 1 (
    echo WARNING: Game creation test failed!
    echo You may need to check the contract configuration.
)

cd ..

echo.
echo ========================================
echo Step 2: Deploy Backend
echo ========================================
cd backend

REM Check if .env exists, if not copy from template
if not exist ".env" (
    echo Copying .env.celo-sepolia to .env...
    copy .env.celo-sepolia .env
    echo.
    echo IMPORTANT: Please edit backend/.env with:
    echo 1. SERVER_PRIVATE_KEY
    echo 2. CONTRACT_ADDRESS (from Step 1)
    echo Press any key when ready to continue...
    pause
)

echo Copying contract ABI...
if exist "..\contract\artifacts\contracts\Pepasur.sol\Pepasur.json" (
    if not exist "contracts" mkdir contracts
    copy "..\contract\artifacts\contracts\Pepasur.sol\Pepasur.json" ".\contracts\PepasurABI.json"
    echo ABI copied successfully!
) else (
    echo WARNING: Contract ABI not found. Please compile the contract first.
)

echo.
echo Installing backend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo.
echo Backend is ready to start!
echo Run: npm run dev
echo.

cd ..

echo.
echo ========================================
echo Step 3: Deploy Frontend
echo ========================================
cd frontend

REM Check if .env.local exists, if not copy from template
if not exist ".env.local" (
    echo Copying .env.celo-sepolia to .env.local...
    copy .env.celo-sepolia .env.local
    echo.
    echo IMPORTANT: Please edit frontend/.env.local with:
    echo 1. NEXT_PUBLIC_CONTRACT_ADDRESS (from Step 1)
    echo 2. NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    echo Press any key when ready to continue...
    pause
)

echo.
echo Installing frontend dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo.
echo Building frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Frontend build failed!
    pause
    exit /b 1
)

echo.
echo Frontend is ready to start!
echo Run: npm start
echo.

cd ..

echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Start backend: cd backend ^&^& npm run dev
echo 2. Start frontend: cd frontend ^&^& npm start
echo 3. Open http://localhost:3000
echo 4. Connect MetaMask to Celo Sepolia (Chain ID: 11142220)
echo 5. Test the application!
echo.
echo Block Explorer: https://celo-sepolia.blockscout.com
echo.
pause
