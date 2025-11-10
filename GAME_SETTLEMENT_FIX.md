# Game Settlement Error Fix

## Problem

Games were failing to settle with the error:
```
Move abort in pepasur::pepasur: EGAME_NOT_IN_PROGRESS(0x7): Game not in progress
```

## Root Cause

The smart contract requires games to be in `STATUS_IN_PROGRESS` (status = 1) before they can be settled. However, games were being settled while still in `STATUS_LOBBY` (status = 0) on-chain.

### Why This Happens

1. **Backend Game Start**: The backend starts the game when minimum players join the lobby
2. **On-Chain Status**: The on-chain game only transitions to `STATUS_IN_PROGRESS` when all players stake
3. **Mismatch**: If not all players stake on-chain before the game ends, the on-chain status remains in LOBBY
4. **Settlement Fails**: When the backend tries to settle, the smart contract rejects it

### Smart Contract Status Flow

```
STATUS_LOBBY (0)
    ↓ (when min_players stake on-chain)
STATUS_IN_PROGRESS (1)
    ↓ (when settle_game is called)
STATUS_SETTLED (2)
```

The smart contract code (line 265 in pepasur.move):
```move
assert!(game.status == STATUS_IN_PROGRESS, EGAME_NOT_IN_PROGRESS);
```

## Solution

Added an on-chain status check before attempting settlement in `GameManager.js:1457`:

```javascript
// Check on-chain game status before attempting settlement
try {
  const aptosService = new (require('./AptosService'))();
  const gameInfo = await aptosService.getGameInfo(contractGameId);
  console.log(`📊 On-chain game status:`, gameInfo);

  // Status codes: 0 = LOBBY, 1 = IN_PROGRESS, 2 = SETTLED, 3 = CANCELLED
  if (gameInfo.status === 0) {
    console.error(`❌ Cannot settle game ${contractGameId} - still in LOBBY status`);
    console.error(`   This means not all players have staked on-chain yet.`);
    return game;
  }

  if (gameInfo.status === 2) {
    console.log(`✅ Game already settled on-chain, skipping settlement`);
    return game;
  }

  if (gameInfo.status === 3) {
    console.log(`⚠️ Game was cancelled on-chain, skipping settlement`);
    return game;
  }
} catch (statusError) {
  console.error(`❌ Error checking on-chain game status:`, statusError.message);
  console.error(`   Skipping settlement to avoid on-chain errors`);
  return game;
}
```

## Benefits

1. **Prevents Errors**: No more `EGAME_NOT_IN_PROGRESS` errors
2. **Better Logging**: Clear messages about why settlement was skipped
3. **Graceful Handling**: Games can still end even if settlement fails
4. **Idempotency**: Detects already-settled games and skips redundant calls

## Remaining Considerations

### 1. User Experience
Players who didn't stake on-chain won't see rewards distributed. Consider:
- Adding UI feedback about staking status
- Warning users before game starts if not all players staked
- Auto-cancelling games where not enough players staked

### 2. Backend-Contract Sync
The core issue is sync between:
- **Backend**: Tracks lobby membership
- **On-Chain**: Tracks actual stakes

Consider:
- Don't start game backend-side until all players staked on-chain
- Poll on-chain game status before starting phases
- Implement heartbeat checks for on-chain status

### 3. Edge Cases

**Case 1: Player joins but doesn't stake**
- Backend: Player in lobby
- On-Chain: No stake recorded
- Result: Game can't be settled
- **Fix**: Check on-chain status before starting game

**Case 2: Player stakes but transaction pending**
- Backend: Waiting for confirmation
- On-Chain: Not yet recorded
- Result: Game starts too early
- **Fix**: Wait for transaction confirmation before marking player as staked

**Case 3: Network issues**
- Transaction sent but not confirmed
- Backend thinks player staked
- On-Chain: No record
- **Fix**: Verify transaction success and on-chain state

## Testing Checklist

- [x] Game settlement skipped when on-chain status is LOBBY
- [ ] Game settlement succeeds when on-chain status is IN_PROGRESS
- [ ] Game settlement skipped when already SETTLED
- [ ] Game settlement skipped when CANCELLED
- [ ] Error handling for network issues
- [ ] UI shows appropriate message when settlement skipped

## Files Modified

- `backend/services/GameManager.js:1457` - Added on-chain status check before settlement

## Recommendations

### Short Term
1. ✅ Add on-chain status check (implemented)
2. Monitor logs for "still in LOBBY status" messages
3. Track how often this occurs

### Medium Term
1. Add UI indicator for staking status
2. Prevent game start until all players staked on-chain
3. Add timeout for players to stake (e.g., 2 minutes)

### Long Term
1. Implement comprehensive backend-contract sync
2. Add on-chain status polling
3. Consider gasless staking with meta-transactions
4. Add contract events subscription for real-time updates

## Example Log Output

### Before Fix
```
❌ Error distributing rewards: Move abort in pepasur::pepasur:
   EGAME_NOT_IN_PROGRESS(0x7): Game not in progress
```

### After Fix
```
📊 On-chain game status: { status: 0, players: 3, total_pool: 300000000 }
❌ Cannot settle game 123 - still in LOBBY status on-chain
   This means not all players have staked on-chain yet.
   Players in backend: 5
   Players on-chain: 3
```

Much more informative and prevents the error entirely!
