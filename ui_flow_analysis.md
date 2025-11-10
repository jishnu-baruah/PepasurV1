# UI Flow and Phase Change Analysis

## 1. UI Flow

The UI flow is controlled by the `gameState` variable in `frontend/app/page.tsx`. The `Home` component renders different screen components based on the value of `gameState`.

The main UI flow is as follows:

1.  **`loader`:** The `LoaderScreen` is displayed for 3 seconds.
2.  **`wallet`:** The `WalletConnect` component is displayed, allowing the user to connect their Aptos wallet.
3.  **`public-lobby` / `room-code-input` / `staking`:** After connecting the wallet, the user can choose to:
    *   Join a public game from the `PublicLobbyScreen`.
    *   Join a private game by entering a room code in the `RoomCodeInput` component (which is part of the `StakingScreen`).
    *   Create a new game from the `StakingScreen`.
4.  **`lobby`:** The `LobbyScreen` is displayed, showing the players who have joined the game.
5.  **`role-assignment`:** The `RoleAssignmentScreen` is displayed, showing the player their assigned role.
6.  **`night`:** The `GameplayScreen` is displayed for the night phase, where players perform their night actions.
7.  **`resolution`:** The `NightResolutionScreen` is displayed, showing the results of the night phase.
8.  **`task`:** The `DiscussionPhaseScreen` is displayed, where players discuss and complete a task.
9.  **`voting`:** The `VotingScreen` is displayed, where players vote to eliminate a player.
10. **`ended`:** The `GameResultsScreen` is displayed, showing the game results and the winners.

## 2. Phase Changes

The game phase is controlled by the backend and synced to the frontend via Socket.IO. The `useEffect` hook in `page.tsx` listens for `game_state` events from the socket and updates the `gameState` variable accordingly.

The main phase transitions are as follows:

*   `lobby` -> `night`: When the minimum number of players have joined the game, the backend starts the game and sets the phase to `night`.
*   `night` -> `resolution`: After the night phase timer expires, the backend resolves the night actions and sets the phase to `resolution`.
*   `resolution` -> `task`: After the resolution phase timer expires, the backend sets the phase to `task`.
*   `task` -> `voting`: After the task phase timer expires, the backend sets the phase to `voting`.
*   `voting` -> `night`: After the voting phase, if the win conditions are not met, the backend sets the phase to `night` for the next day.
*   `any` -> `ended`: When the win conditions are met, the backend sets the phase to `ended`.

## 3. Potential Race Conditions and Issues

*   **Duplicate `useEffect` hooks:** There are multiple `useEffect` hooks in `page.tsx` that handle game state updates. This could lead to race conditions and unexpected behavior. It would be better to consolidate the game state update logic into a single `useEffect` hook.
*   **Backup polling:** The `page.tsx` component has a backup polling mechanism that refreshes the game state every 10 seconds. This is a good fallback in case the Socket.IO connection fails, but it can also cause unnecessary network requests.
*   **Client-side phase changes:** The `handleRoleAcknowledged` function in `page.tsx` sets the `gameState` to `night` directly. This is a potential race condition, as the backend might not have finished processing the role acknowledgment yet. It would be better to let the backend control all phase changes.
*   **Missing error handling:** The code has some basic error handling, but it could be improved. For example, the `joinGame` function in `useGame.ts` does not handle the case where the game is full or has already started.

## 4. Business Logic Execution (4 players)

With 4 players, the roles are assigned as follows: 1 Mafia, 1 Doctor, 1 Detective, 1 Villager.

The game proceeds as follows:

1.  **Night 1:**
    *   The Mafia chooses a player to kill.
    *   The Doctor chooses a player to save.
    *   The Detective chooses a player to investigate.
2.  **Day 1:**
    *   The results of the night phase are announced.
    *   The players discuss and vote to eliminate a player.
3.  **Night 2:**
    *   The game continues with the remaining players.

The game ends when either the Mafia is eliminated or the number of Mafia players is equal to or greater than the number of non-Mafia players.

The business logic seems to be correctly implemented for a 4-player game.
