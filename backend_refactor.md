# Backend Refactoring Log

This file tracks the refactoring efforts for the backend services.

## Previous Session Summary:
- Refactoring of `GameManager.js` was completed, including moving timer-related methods to `PhaseManager.js` and reward distribution logic to `GameRewardService.js`.
- A subdirectory system was created within `backend/services` to organize related service files.
- Files were moved into their respective new subdirectories (`aptos`, `game`, `staking`, `core`).
- All affected `require` paths in the backend were updated to reflect the new file locations.

## Current Goals:
- Identify long service files in the `backend/services` directory.
- Propose and implement refactoring strategies to reduce file length and improve modularity.
- Ensure all changes adhere to existing project conventions.
- Add unit tests for refactored components where appropriate.

## Proposed Refactoring Plan (Initial Draft - 2025-11-10):

### 1. Refactor `backend/services/AptosService.js`
   - **Objective:** Break down the large `AptosService.js` into smaller, more focused modules to improve modularity, readability, and maintainability.
   - **Proposed Modules:**
     - `AptosClientManager.js`: Handles Aptos client and account initialization and management.
     - `AptosGameTransactions.js`: Contains all game-related transaction methods (e.g., `createGame`, `joinGame`, `submitSettlement`).
     - `AptosGameQueries.js`: Contains all read-only game-related methods (e.g., `getGameInfo`, `getGamePlayers`, `getContractInfo`).
     - `AptosSerializationUtils.js`: Extracts BCS serialization logic, especially from `submitSettlement`.
     - `aptosTransactionUtils.js`: Utility for common transaction building, signing, and submission patterns.
   - **Action:** Update `AptosService.js` to act as a facade, orchestrating calls to these new modules.

### 2. Refactor `backend/services/FaucetService.js`
   - **Objective:** Improve cohesion by extracting generic utility functions and centralizing constants.
   - **Proposed Changes:**
     - Move `formatTimeRemaining` function to `backend/utils/timeFormatter.js`.
     - Consider moving faucet-related constants (e.g., `FAUCET_AMOUNT_APT`, `COOLDOWN_HOURS`) to a `backend/config/faucetConfig.js` if they are accessed by other services or need centralized management.

### 3. Refactor `backend/services/GameManager.js`
   - **Objective:** Reduce complexity and improve modularity by extracting timer management and reward distribution logic.
   - **Proposed Changes:**
     - Move timer-related methods (`startTimer`, `startTimerWhenReady`, `startActualTimer`, `handleTimerExpired`) from `GameManager.js` to `PhaseManager.js`.
     - Extract `_handleRewardDistribution` into a new `GameRewardService.js`.

## Progress:
- [x] Initial analysis of `AptosService.js` completed.
- [x] Initial analysis of `FaucetService.js` completed.
- [x] Proposed refactoring plan drafted and documented.
- [x] `AptosClientManager.js` created and integrated.
- [x] `AptosGameTransactions.js` created and integrated.
- [x] `AptosGameQueries.js` created and integrated.
- [x] `AptosSerializationUtils.js` created and integrated.
- [x] `aptosTransactionUtils.js` created and integrated.
- [x] `AptosService.js` updated to use new modules and proxy methods.
- [x] `formatTimeRemaining` moved to `backend/utils/timeFormatter.js` and integrated into `FaucetService.js`.
- [ ] Faucet-related constants remain in `FaucetService.js` as they are not currently accessed by other services.
- [x] Timer-related methods moved from `GameManager.js` to `PhaseManager.js` and integrated.
- [x] `GameRewardService.js` created and integrated.
- [x] `GameManager.js` updated to use new modules.
- [x] Created `backend/services/aptos` subdirectory.
- [x] Created `backend/services/game` subdirectory.
- [x] Created `backend/services/staking` subdirectory.
- [x] Created `backend/services/core` subdirectory.
- [x] Moved `AptosClientManager.js`, `AptosGameQueries.js`, `AptosGameTransactions.js`, `AptosSerializationUtils.js`, `AptosService.js` to `backend/services/aptos`.
- [x] Moved `GameManager.js`, `GameRepository.js`, `GameRewardService.js`, `GameStateFormatter.js`, `PhaseManager.js` to `backend/services/game`.
- [x] Moved `StakingManager.js`, `StakingService.js` to `backend/services/staking`.
- [x] Moved `FaucetService.js`, `SocketManager.js`, `TaskManager.js` to `backend/services/core`.
- [x] Updated all affected `require` paths in `backend` directory.
