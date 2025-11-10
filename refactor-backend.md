# Backend Refactoring Suggestions

This document outlines a series of suggestions to improve the structure, readability, and maintainability of the backend codebase, focusing on the `GameManager.js` file.

## 1. `GameManager.js` Refactoring

The `backend/services/GameManager.js` file is currently over 2000 lines long and handles a wide range of responsibilities, making it difficult to maintain and understand. I propose a major refactoring of this file to improve its structure and separate its concerns.

### 1.1. Separation of Concerns

The `GameManager` class is currently a "god class" that handles everything related to the game. I suggest breaking it down into smaller, more focused modules:

-   **`GameManager`**: The core class that manages the game flow and orchestrates the other modules.
-   **`PhaseManager`**: A new class that will handle the logic for each game phase (night, resolution, task, voting). This will involve creating separate methods for each phase and moving the relevant logic from `GameManager` to this new class.
-   **`StakingManager`**: A new class that will handle all the staking-related logic, such as creating stakes, recording player stakes, and distributing rewards.
-   **`TaskManager`**: A new class that will handle the generation and validation of tasks.
-   **`GameRepository`**: A new class that will handle all the database interactions, such as creating, updating, and retrieving games.

### 1.2. Long Methods

The `GameManager` class has several long and complex methods. I suggest breaking them down into smaller, more manageable methods. This will improve readability and make the code easier to test.

The following methods are good candidates for refactoring:

-   `createGame`
-   `startGame`
-   `resolveNightPhase`
-   `resolveVotingPhase`
-   `endGame`

### Plan

1.  Create the new classes: `PhaseManager`, `StakingManager`, `TaskManager`, and `GameRepository`.
2.  Move the relevant logic from `GameManager` to the new classes.
3.  Refactor the long methods in `GameManager` into smaller, more focused methods.
4.  Update the `GameManager` class to use the new classes.
5.  Create new files for each of the new classes in the `backend/services` directory.
