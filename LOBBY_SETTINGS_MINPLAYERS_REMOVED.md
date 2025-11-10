# minPlayers Removed from Lobby Settings

## Summary

Removed the `minPlayers` setting from the lobby settings dialog as it cannot be changed after on-chain game creation. The minimum player count is now fixed at 4 players and set during game creation only.

## Changes Made

### Frontend

#### 1. **lobby-settings-dialog.tsx**
- ✅ Removed `minPlayers` from `FullGameSettings` interface
- ✅ Removed `minPlayers` from `DEFAULT_GAME_SETTINGS`
- ✅ Removed "PLAYER SETTINGS" section from UI
- ✅ Updated dialog description: "Configure game phase durations" (removed "and player count")
- ✅ Increased dialog width: `max-w-lg` and added `w-full` for better responsiveness
- ✅ Added `w-full` class to all inputs to prevent width issues
- ✅ Added `max-h-[70vh] overflow-y-auto` for better mobile experience

#### 2. **lobby-screen.tsx**
- ✅ Removed `minPlayers` from settings initialization in `useEffect`
- ✅ Settings now only include phase durations

#### 3. **staking-screen.tsx**
- ✅ Changed from `minPlayers: gameSettings.minPlayers` to `minPlayers: 4`
- ✅ Added comment explaining it's not customizable

#### 4. **api.ts (services)**
- ✅ Removed `minPlayers?: number` from `GameSettings` interface
- ✅ `minPlayers` remains as a separate property on `CreateGameRequest` (default: 4)

### Backend

#### 5. **GameManager.js**
- ✅ Removed `minPlayers` from `defaultSettings` object
- ✅ `minPlayers` handled separately as a direct game property (not part of settings)
- ✅ Removed `minPlayers` update logic from `updateGameSettings()` method
- ✅ Added comment explaining minPlayers is not part of settings

#### 6. **Game.js (model)**
- ✅ Removed `minPlayers` field from `settings` schema
- ✅ `minPlayers` remains as top-level game property (unchangeable after creation)

#### 7. **game.js (routes)**
- ✅ Updated to use `settings.minPlayers` OR fallback to param OR default to 4
- ✅ No changes needed - already handles `settings` object flexibly

## Why This Change?

### Problem
The smart contract's `min_players` field is **immutable** once the game is created on-chain. Allowing users to change it in the lobby was misleading because:
1. The on-chain value couldn't actually be updated
2. Backend value could become out of sync with contract
3. Game start logic depends on the on-chain value

### Solution
- **minPlayers is now fixed at 4** for all games
- Can only be set during initial game creation (hardcoded to 4)
- Removed from settings UI to avoid confusion
- Phase durations remain fully customizable (backend-only feature)

## UI Changes

**Before:**
- Dialog showed 5 settings (4 phase durations + minPlayers)
- "PLAYER SETTINGS" section at bottom
- Narrower dialog width
- Input width issues (scrollbar visible)

**After:**
- Dialog shows only 4 phase duration settings
- No player settings section
- Wider dialog (`max-w-lg` instead of `max-w-md`)
- All inputs full width (`w-full` class)
- Better mobile responsiveness with max height

## Data Flow

### Game Creation
```
Frontend: gameSettings = { nightPhaseDuration, resolutionPhaseDuration, taskPhaseDuration, votingPhaseDuration }
    ↓
POST /api/game/create-and-join
  - minPlayers: 4 (hardcoded)
  - settings: { phase durations only }
    ↓
aptosService.createGame(stakeAmount, 4)
    ↓
Contract: Game { min_players: 4, ... }
```

### Settings Update (Lobby)
```
Frontend: Update phase durations only
    ↓
PATCH /api/game/:gameId/settings
  - settings: { phase durations only }
    ↓
GameManager: game.settings = { ...settings } (no minPlayers)
    ↓
Backend + Database updated
minPlayers unchanged (still 4)
```

## Benefits

1. ✅ **No Confusion**: Users can't try to change something that's immutable
2. ✅ **Backend-Contract Sync**: minPlayers always matches on-chain value
3. ✅ **Simpler UI**: Cleaner settings dialog focused on what's actually configurable
4. ✅ **Better Responsiveness**: Wider dialog and full-width inputs
5. ✅ **No Width Issues**: Fixed input scrollbar/width problems from screenshot

## Testing Checklist

- [ ] Settings dialog displays only phase durations
- [ ] Dialog width is appropriate (not too narrow)
- [ ] Input fields don't show scrollbars
- [ ] Settings can be saved and updated
- [ ] Game creation uses minPlayers=4
- [ ] On-chain game has min_players=4
- [ ] Backend game has minPlayers=4
- [ ] Settings update doesn't affect minPlayers

## Files Modified

### Frontend
1. ✅ `frontend/components/lobby-settings-dialog.tsx`
2. ✅ `frontend/components/lobby-screen.tsx`
3. ✅ `frontend/components/staking-screen.tsx`
4. ✅ `frontend/services/api.ts`

### Backend
5. ✅ `backend/services/GameManager.js`
6. ✅ `backend/models/Game.js`
7. ✅ `backend/routes/game.js` (no changes needed)

## Future Considerations

If you want to allow custom minimum players in the future:

### Option 1: Make it a Creation-Time Setting
- Add minPlayers selector to staking screen (before game creation)
- Pass to contract during `create_game()`
- **Pro**: Contract supports this already
- **Con**: Can't change after creation

### Option 2: Update Contract
Add an `update_min_players()` function to the contract:
```move
public entry fun update_min_players(creator: &signer, game_id: u64, new_min_players: u8) {
    // Only in LOBBY phase
    // Only by creator
    // Update min_players field
}
```
- **Pro**: True flexibility
- **Con**: Requires contract update and redeployment

### Recommendation
Keep it at 4 for now. If you want flexibility, implement Option 1 (creation-time setting) since the contract already supports it without any changes.

## Notes

- Phase durations remain fully customizable (they're backend-only)
- The contract never sees or uses phase durations
- minPlayers = 4 is a good default for your game mechanics
- Players can still create private games with 4+ players
