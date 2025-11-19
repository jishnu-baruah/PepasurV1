@echo off
REM Pepasur Complete Deployment Script for Windows
REM This script helps automate the deployment process

setlocal enabledelayedexpansion

echo.
echo ========================================
echo Pepasur Deployment Script
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js v18 or higher.
    exit /b 1
)

where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm is not installed. Please install npm.
    exit /b 1
)

echo SUCCESS: Prerequisites check passed
echo.

REM Get deployment target
echo Select deployment target:
echo 1^) U2U Nebulas Testnet
echo 2^) U2U Mainnet
echo 3^) Celo Alfajores Testnet
echo 4^) Celo Mainnet
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    set NETWORK=u2uTestnet
    set ENV_FILE=u2u-testnet
    set NETWORK_NAME=U2U Nebulas Testnet
) else if "%choice%"=="2" (
    set NETWORK=u2u
    set ENV_FILE=u2u-mainnet
    set NETWORK_NAME=U2U Mainnet
    echo.
    echo WARNING: You are deploying to MAINNET. This will use real funds!
    set /p confirm="Are you sure? (yes/no): "
    if not "!confirm!"=="yes" (
        echo Deployment cancelled
        exit /b 0
    )
) else if "%choice%"=="3" (
    set NETWORK=celoAlfajores
    set ENV_FILE=celo-testnet
    set NETWORK_NAME=Celo Alfajores Testnet
) else if "%choice%"=="4" (
    set NETWORK=celo
    set ENV_FILE=celo-mainnet
    set NETWORK_NAME=Celo Mainnet
    echo.
    echo WARNING: You are deploying to MAINNET. This will use real funds!
    set /p confirm="Are you sure? (yes/no): "
    if not "!confirm!"=="yes" (
        echo Deployment cancelled
        exit /b 0
    )
) else (
    echo ERROR: Invalid choice
    exit /b 1
)

echo.
echo Deploying to: %NETWORK_NAME%
echo.

REM Step 1: Deploy Smart Contract
echo ========================================
echo Step 1: Deploying Smart Contract
echo ========================================
cd contract

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found. Copying from template...
    if exist .env.%ENV_FILE% (
        copy .env.%ENV_FILE% .env
        echo Please edit contract\.env with your values and run this script again
        exit /b 1
    ) else (
        echo ERROR: Template file .env.%ENV_FILE% not found
        exit /b 1
    )
)

REM Install dependencies
echo Installing contract dependencies...
call npm install

REM Compile contracts
echo Compiling contracts...
call npx hardhat compile

REM Check balance
echo Checking deployer balance...
call npx hardhat run scripts/check-balance.js --network %NETWORK%

REM Deploy contract
echo Deploying contract...
call npx hardhat run scripts/deploy.js --network %NETWORK%

REM Ask for contract address
echo.
set /p CONTRACT_ADDRESS="Enter the deployed contract address: "

if "%CONTRACT_ADDRESS%"=="" (
    echo ERROR: Contract address is required
    exit /b 1
)

REM Update .env with contract address
echo CONTRACT_ADDRESS=%CONTRACT_ADDRESS% >> .env
echo SUCCESS: Contract address saved to .env

REM Initialize contract
echo Initializing contract...
call npx hardhat run scripts/initialize.js --network %NETWORK%

echo SUCCESS: Contract deployment complete!

REM Ask if user wants to verify
set /p verify="Do you want to verify the contract on block explorer? (yes/no): "
if "%verify%"=="yes" (
    echo Verifying contract...
    call npx hardhat verify --network %NETWORK% %CONTRACT_ADDRESS%
)

cd ..

REM Step 2: Configure Backend
echo.
echo ========================================
echo Step 2: Configuring Backend
echo ========================================
cd backend

REM Check if .env exists
if not exist .env (
    echo WARNING: .env file not found. Copying from template...
    if exist .env.%ENV_FILE% (
        copy .env.%ENV_FILE% .env
        echo CONTRACT_ADDRESS=%CONTRACT_ADDRESS% >> .env
        echo SUCCESS: Backend .env created with contract address
    ) else (
        echo ERROR: Template file .env.%ENV_FILE% not found
        exit /b 1
    )
) else (
    REM Update existing .env with contract address
    echo CONTRACT_ADDRESS=%CONTRACT_ADDRESS% >> .env
    echo SUCCESS: Backend .env updated with contract address
)

REM Copy ABI
echo Copying contract ABI...
if not exist contracts mkdir contracts
copy ..\contract\contracts\PepasurABI.json .\contracts\
echo SUCCESS: ABI copied

REM Install dependencies
echo Installing backend dependencies...
call npm install

echo SUCCESS: Backend configuration complete!
echo To start backend: cd backend ^&^& npm run dev

cd ..

REM Step 3: Configure Frontend
echo.
echo ========================================
echo Step 3: Configuring Frontend
echo ========================================
cd frontend

REM Check if .env.local exists
if not exist .env.local (
    echo WARNING: .env.local file not found. Copying from template...
    if exist .env.%ENV_FILE% (
        copy .env.%ENV_FILE% .env.local
        echo NEXT_PUBLIC_CONTRACT_ADDRESS=%CONTRACT_ADDRESS% >> .env.local
        echo SUCCESS: Frontend .env.local created with contract address
    ) else (
        echo ERROR: Template file .env.%ENV_FILE% not found
        exit /b 1
    )
) else (
    REM Update existing .env.local with contract address
    echo NEXT_PUBLIC_CONTRACT_ADDRESS=%CONTRACT_ADDRESS% >> .env.local
    echo SUCCESS: Frontend .env.local updated with contract address
)

REM Install dependencies
echo Installing frontend dependencies...
call npm install

echo SUCCESS: Frontend configuration complete!
echo To start frontend: cd frontend ^&^& npm run dev

cd ..

REM Summary
echo.
echo ========================================
echo Deployment Complete!
echo ========================================
echo.
echo Network: %NETWORK_NAME%
echo Contract Address: %CONTRACT_ADDRESS%
echo.
echo Next Steps:
echo   1. Review and update environment variables if needed
echo   2. Start backend: cd backend ^&^& npm run dev
echo   3. Start frontend: cd frontend ^&^& npm run dev
echo   4. Test the complete flow
echo.
echo For production deployment, see DEPLOYMENT_ORCHESTRATION.md
echo.

pause
