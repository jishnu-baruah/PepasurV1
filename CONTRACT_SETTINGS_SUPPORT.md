# Smart Contract Settings Support

## Overview

The Pepasur smart contract has **partial support** for custom game settings. Here's what is and isn't supported:

## ✅ Supported by Contract

### 1. **Minimum Players** (`minPlayers`)

**Contract Field:** `min_players: u8` (line 45 in pepasur.move)

**How it works:**
- Passed to contract during `create_game(stake_amount, min_players)`
- Stored in the on-chain Game struct
- Used to automatically transition game from LOBBY → IN_PROGRESS when enough players stake
- Contract enforces: `assert!(min_players >= 2, EMIN_PLAYERS_NOT_MET)`

**Contract Code (line 241):**
```move
// Start game if minimum players reached
if (vector::length(&game.players) >= (game.min_players as u64)) {
    game.status = STATUS_IN_PROGRESS;
    event::emit(GameStarted {
        game_id,
        player_count: vector::length(&game.players),
    });
};
```

**Backend Integration:**
- ✅ `backend/services/AptosService.js:50` - Accepts minPlayers parameter
- ✅ `backend/routes/game.js:25,95` - Uses settings.minPlayers if provided
- ✅ `backend/services/GameManager.js:66` - Stores in game object
- ✅ `backend/models/Game.js:41` - Persists to database

**Validation:**
- Contract minimum: 2 players
- Frontend default: 4 players
- Frontend range: 4-10 players

### 2. **Stake Amount** (`stakeAmount`)

**Contract Field:** `stake_amount: u64`

**How it works:**
- Defines how much APT each player must stake to join
- Enforced on-chain when players call `join_game()`
- Used to calculate total pool and payouts

## ❌ NOT Supported by Contract

The following settings are **backend-only** and don't require contract changes:

### 1. **Phase Durations**
- `nightPhaseDuration`
- `resolutionPhaseDuration`
- `taskPhaseDuration`
- `votingPhaseDuration`

**Why not needed:**
- The contract doesn't manage game phases or timers
- Phase progression is entirely handled by the backend GameManager
- Contract only cares about final settlement, not intermediate phases

**Backend-Only Implementation:**
- ✅ Stored in backend game state
- ✅ Used by GameManager to control phase transitions
- ✅ Applied to `game.timeLeft` for each phase
- ❌ Not stored on-chain (not needed)

## Settings Flow

### Creation Flow
```
Frontend Settings Dialog
    ↓
POST /api/game/create-and-join { settings }
    ↓
aptosService.createGame(stakeAmount, settings.minPlayers)
    ↓
Contract: create_game(stake_amount, min_players)
    ↓
On-chain Game created with min_players
    ↓
Backend GameManager stores full settings (including durations)
```

### Update Flow (Lobby Only)
```
Frontend Settings Dialog (in lobby)
    ↓
PATCH /api/game/:gameId/settings { settings }
    ↓
GameManager.updateGameSettings()
    ↓
✅ Updates backend game.settings
✅ Updates database
✅ Broadcasts to players via socket
❌ Does NOT update on-chain (minPlayers is immutable after creation)
```

## Important Notes

### 1. **minPlayers is Immutable On-Chain**

Once a game is created on-chain, the `min_players` value **cannot be changed**. This is because:
- The contract has no `update_game` function
- Changing it mid-game could break the LOBBY → IN_PROGRESS logic
- Players may have already staked based on original value

**Implication:**
- Settings updates in lobby can change backend minPlayers
- But the on-chain game will still use the original value
- Consider blocking minPlayers updates after on-chain creation

### 2. **Phase Durations Are Backend-Only**

The contract never sees or uses phase durations. This is actually **good design** because:
- Off-chain timing is more flexible
- No gas costs for timer updates
- Backend can adapt timing dynamically
- Contract stays simple and focused on money handling

### 3. **On-Chain vs Backend Sync**

**On-Chain Game:**
- Tracks: players, stakes, total pool, status
- Controls: staking, settlement, fund distribution
- Immutable once created (except status)

**Backend Game:**
- Tracks: everything on-chain PLUS phases, roles, actions, chat
- Controls: game logic, phase transitions, task generation
- Mutable during lobby phase

## Testing Checklist

### Contract Integration
- [x] minPlayers passed to contract on creation
- [x] Contract enforces minPlayers for IN_PROGRESS transition
- [x] Game starts on-chain when enough players stake
- [ ] Test with various minPlayers values (4, 6, 8, 10)

### Backend Settings
- [x] Phase durations stored in backend
- [x] Phase durations applied to game timer
- [x] Settings persist in database
- [x] Settings update endpoint works

### Edge Cases
- [ ] What if backend minPlayers > on-chain minPlayers?
- [ ] What if game starts backend-side before reaching on-chain minPlayers?
- [ ] What if settings are updated after some players stake?

## Recommendations

### Short Term
1. ✅ Use settings.minPlayers for contract creation (implemented)
2. ⚠️ Consider blocking minPlayers updates after on-chain creation
3. Add validation: settings.minPlayers must match on-chain value if game exists

### Medium Term
1. Add UI warning: "minPlayers cannot be changed after creation"
2. Fetch and display on-chain minPlayers in lobby
3. Validate backend minPlayers matches on-chain before game start

### Long Term
1. Consider adding `update_min_players` to contract (for lobby phase only)
2. Add contract events subscription for real-time sync
3. Store phase duration preferences per-player (not per-game)

## Code References

**Contract:**
- `contract/sources/pepasur.move:45` - min_players field
- `contract/sources/pepasur.move:185` - create_game function
- `contract/sources/pepasur.move:241` - min_players check

**Backend:**
- `backend/services/AptosService.js:40` - createGame(stakeAmount, minPlayers)
- `backend/routes/game.js:25,95` - Uses settings.minPlayers
- `backend/services/GameManager.js:66` - Stores minPlayers from settings
- `backend/services/GameManager.js:587-1310` - Uses phase durations from settings

## Summary

| Setting | Contract Support | Backend Support | Updatable in Lobby |
|---------|-----------------|-----------------|-------------------|
| `minPlayers` | ✅ Yes | ✅ Yes | ⚠️ Backend only* |
| `nightPhaseDuration` | ❌ No | ✅ Yes | ✅ Yes |
| `resolutionPhaseDuration` | ❌ No | ✅ Yes | ✅ Yes |
| `taskPhaseDuration` | ❌ No | ✅ Yes | ✅ Yes |
| `votingPhaseDuration` | ❌ No | ✅ Yes | ✅ Yes |

*minPlayers update only affects backend; on-chain value remains unchanged

**Conclusion:** The contract handles what it needs to (player count, stakes, settlement). Everything else is appropriately handled backend-side for flexibility and cost efficiency.
