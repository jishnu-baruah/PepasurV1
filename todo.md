# Code Logic Analysis TODO

This file outlines the steps for a deep dive analysis of the codebase to create a detailed `rules.md` file.

## Backend Analysis

- [x] **`GameManager.js`**
    - [x] Analyze `createGame`: Understand the initial game state, default values for stake amount, min/max players, and the distinction between public and private games.
    - [x] Analyze `assignRoles`: Determine the exact role distribution logic based on the number of players.
    - [x] Analyze `startGame` and `startTimer`: Investigate the timers for each phase (night, resolution, task, voting) and the logic for phase transitions.
    - [x] Analyze `resolveNightPhase`: Detail the order of operations for night actions (e.g., does the DEVA's save happen before or after the ASUR's kill?).
    - [x] Analyze `resolveVotingPhase`: Understand the voting mechanism, how ties are handled, and the duration of the voting results display.
    - [x] Analyze `checkWinConditions`: Pinpoint the exact conditions under which the ASURs or DEVAs win.
    - [x] Analyze `endGame`: Examine the reward distribution process and how the game state is cleaned up.

- [x] **`AptosService.js` & `StakingService.js`**
    - [x] Analyze `createGame` (on-chain): Understand how a new game is registered on the Aptos blockchain.
    - [x] Analyze `stakeForGame`: Detail the process of a player staking APT and how the backend verifies the transaction.
    - [x] Analyze `distributeRewards`: Investigate the technical details of how the prize pool is distributed to the winners' wallets.

- [x] **`pepasur.move`**
    - [x] Analyze the `Game` struct: Understand what game state is stored on-chain.
    - [x] Analyze the `create_game` function: Note the arguments required and the initial state of the on-chain game.
    - [x] Analyze the `join_game` function: Understand the requirements for a player to join a game on-chain.
    - [x] Analyze the `end_game` function: Examine the on-chain logic for distributing rewards.

## Frontend Analysis

- [x] **`useGame.ts`**
    - [x] Analyze how the frontend listens for and processes game state updates from the backend via websockets.
    - [x] Analyze how player actions (night actions, votes, task answers) are formatted and sent to the backend.

- [x] **`staking-screen.tsx`**
    - [x] Analyze the UI logic for setting the stake amount and creating a public or private game.
    - [x] Analyze the UI flow for joining a game with a room code or from the public lobbies list.

- [x] **`gameplay-screen.tsx`**
    - [x] Analyze the UI for submitting night actions for each role.

- [x] **`discussion-phase-screen.tsx`**
    - [x] Analyze the different types of tasks and how the UI presents them to the players.

- [x] **`voting-screen.tsx`**
    - [x] Analyze the UI for casting votes and how the voting results are displayed.