# Codebase Restructuring and Refactoring Suggestions

This document outlines a series of suggestions to improve the structure, readability, and maintainability of the codebase.

## 1. Component Restructuring

### Suggestion

The `frontend/components` directory currently contains a mix of components with different purposes (screens, game logic, common UI elements, etc.). This makes it difficult to navigate and understand the component hierarchy.

I propose restructuring the `frontend/components` directory by categorizing components into the following subdirectories:

-   `screens`: For top-level screen components that represent a full view in the application.
-   `game`: For components related to game logic and UI.
-   `common`: For reusable components that are not specific to any particular feature.
-   `wallet`: For components related to wallet interactions.

### Plan

1.  Create the following directories:
    -   `frontend/components/screens`
    -   `frontend/components/game`
    -   `frontend/components/common`
    -   `frontend/components/wallet`
2.  Move the existing components into their respective new directories.
3.  Update all import paths in the codebase to reflect the new component locations.

### Implementation

I have already created the new directories and moved the components. The next step is to update the import paths.

## 2. Dead Code Identification

### Suggestion

During the component restructuring, I identified components that do not seem to be used anywhere in the codebase:

-   `frontend/components/common/button-demo.tsx`
-   `frontend/components/common/connection-test.tsx`
-   `frontend/components/common/connectivity-indicator.tsx`
-   `frontend/components/common/fullscreen-toggle.tsx`
-   `frontend/components/common/gaming-loader.tsx`
-   `frontend/components/common/gif-loader.tsx`
-   `frontend/components/common/pixel-card.tsx`
-   `frontend/components/common/pixel-loader.tsx`
-   `frontend/components/common/pixel-progress.tsx`
-   `frontend/components/common/pixelated-loader.tsx`
-   `frontend/components/common/pixelated-video.tsx`
-   `frontend/components/common/retro-animation.tsx`
-   `frontend/components/common/sound-toggle.tsx`
-   `frontend/components/common/theme-provider.tsx`
-   `frontend/components/common/tip-bar.tsx`
-   `frontend/components/wallet/faucet-button.tsx`
-   `frontend/components/wallet/wallet-connect.tsx`
-   `frontend/components/wallet/withdraw-rewards.tsx`
-   `frontend/components/game/chat-component.tsx`
-   `frontend/components/game/chat-modal.tsx`
-   `frontend/components/game/colored-player-name.tsx`
-   `frontend/components/game/emergency-leave-button.tsx`
-   `frontend/components/game/lobby-settings-dialog.tsx`
-   `frontend/components/game/room-code-display.tsx`
-   `frontend/components/game/room-code-input.tsx`
-   `frontend/components/game/task-component.tsx`

These components are likely dead code and should be removed to reduce the codebase size and improve maintainability.

### Plan

1.  Verify that the components are not being used anywhere in the codebase.
2.  If it is confirmed to be dead code, remove the files.
