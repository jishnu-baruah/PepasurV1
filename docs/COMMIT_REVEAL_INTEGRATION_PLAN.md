# Commit-Reveal Integration Plan

## Overview
This document outlines the plan for integrating the existing `backend/utils/commitReveal.js` utility into the game flow to improve security and action validation.

**Status:** 📋 Planned (Not Yet Implemented)
**Priority:** Medium
**Estimated Effort:** 2-4 hours
**Created:** 2025-11-11

---

## Current State Analysis

### What Exists
- ✅ `backend/utils/commitReveal.js` - Fully functional commit-reveal utility class
- ✅ Game state has `pendingActions` that stores both commit and action
- ✅ Frontend sends actions with optional commit field
- ⚠️ **Commits are stored but NEVER verified** (security theater)
- ❌ **No action validation** - invalid actions can be submitted

### Current Flow
```
Player selects action
  ↓
Frontend sends: { playerAddress, action, commit? }
  ↓
Backend stores both in game.pendingActions[playerAddress]
  ↓
Phase timer expires → resolvePhase() processes actions directly
  ↓
No verification, no validation
```

### Security Gaps
1. **No commit verification** - commits are accepted but never checked
2. **No action validation** - players can submit invalid actions (e.g., Villager trying to kill)
3. **No nonce tracking** - commits could potentially be reused
4. **Scattered logic** - commit handling spread across GameManager and PhaseManager

---

## Integration Options

### Option 1: Validation Only (Recommended First Step) ⭐
**Complexity:** Low
**Impact:** Medium security improvement
**Flow Changes:** None

Add action validation without changing the commit-reveal flow:

```javascript
// In GameManager.submitNightAction()
const { CommitReveal } = require('../utils/commitReveal');
const commitReveal = new CommitReveal();

// NEW: Validate action before storing
try {
  commitReveal.validateAction(game, playerAddress, action);
} catch (error) {
  throw new Error(`Invalid action: ${error.message}`);
}

// EXISTING: Store as before
game.pendingActions[playerAddress] = { commit, action };
```

**Benefits:**
- ✅ Prevents invalid actions (mafia can't save, villagers can't kill, etc.)
- ✅ No frontend changes required
- ✅ No game flow changes
- ✅ Easy to implement and test
- ✅ Can be done incrementally

**What Gets Validated:**
- Player role matches action type (mafia → kill, doctor → save, detective → investigate)
- Target exists and is a valid player
- Target is not eliminated
- Voter is not eliminated (for voting phase)
- Action structure is correct

---

### Option 2: Full Commit-Reveal (Future Enhancement) 🚀
**Complexity:** High
**Impact:** Maximum security
**Flow Changes:** Significant

Implement proper cryptographic commit-reveal scheme:

#### New Flow
```
PHASE 1: COMMIT (Night starts)
Player selects action
  ↓
Frontend generates nonce (crypto.randomBytes)
  ↓
Frontend computes commit = SHA256(action + nonce)
  ↓
Frontend sends: { playerAddress, commit } ONLY
  ↓
Backend stores commit hash only

PHASE 2: REVEAL (Before resolution)
Frontend sends: { playerAddress, action, nonce }
  ↓
Backend computes SHA256(action + nonce)
  ↓
Backend verifies: computed hash === stored commit
  ↓
If valid: process action | If invalid: reject/penalize
```

#### Required Changes

**Frontend Changes:**
```typescript
// frontend/utils/crypto.ts (NEW FILE)
export function generateNonce(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateCommitHash(action: any, nonce: string): string {
  const data = JSON.stringify({ action, nonce });
  return crypto.createHash('sha256').update(data).digest('hex');
}

// In gameplay-screen.tsx
const handleAction = async (action) => {
  const nonce = generateNonce();
  const commit = generateCommitHash(action, nonce);

  // Store nonce locally (localStorage or state)
  localStorage.setItem(`nonce_${game.gameId}_${player.address}`, nonce);

  // Send commit only
  await submitCommit({ playerAddress: player.address, commit });
};

// Later in reveal phase
const handleReveal = async () => {
  const nonce = localStorage.getItem(`nonce_${game.gameId}_${player.address}`);
  await submitReveal({ playerAddress: player.address, action, nonce });
};
```

**Backend Changes:**
```javascript
// In GameManager.js
const CommitReveal = require('../utils/commitReveal');

class GameManager {
  constructor() {
    this.commitReveal = new CommitReveal();
  }

  // NEW: Commit phase
  submitActionCommit(gameId, { playerAddress, commit }) {
    const game = this.getGame(gameId);

    // Store commit hash only (no action yet)
    this.commitReveal.storeCommit(gameId, playerAddress, commit);
  }

  // NEW: Reveal phase
  submitActionReveal(gameId, { playerAddress, action, nonce }) {
    const game = this.getGame(gameId);

    // Verify commit
    const result = this.commitReveal.revealAction(gameId, playerAddress, action, nonce);

    if (result.valid) {
      // Validate action
      this.commitReveal.validateAction(game, playerAddress, action);

      // Store verified action
      game.pendingActions[playerAddress] = { action, verified: true };
    } else {
      throw new Error('Commit verification failed - action rejected');
    }
  }
}
```

**Game Flow Changes:**
```javascript
// In PhaseManager.js - resolveNightPhase()

async resolveNightPhase(gameId) {
  const game = this.gameManager.getGame(gameId);

  // NEW: Check if all reveals received
  const activePlayers = game.players.filter(p => !game.eliminated.includes(p));
  const allRevealed = this.gameManager.commitReveal.allRevealed(gameId, activePlayers);

  if (!allRevealed) {
    console.warn(`⚠️ Not all players revealed - auto-failing AFK players`);
    // Penalize players who didn't reveal
  }

  // Get verified actions only
  const actions = this.gameManager.commitReveal.getRevealedActions(gameId);

  // Process actions...
}
```

**Benefits:**
- ✅ Maximum security - commits are cryptographically verifiable
- ✅ Prevents action changes after submission
- ✅ Prevents front-running (can't see others' actions before submitting)
- ✅ Provably fair gameplay

**Drawbacks:**
- ❌ Requires major frontend rewrite
- ❌ More complex UX (2-phase submission)
- ❌ Need to handle reveal phase timing
- ❌ Players must keep nonce (risk of loss)
- ❌ More points of failure

---

## Implementation Roadmap

### Phase 1: Validation Only (Immediate) ✅
**Timeline:** 1-2 hours
**Risk:** Low

1. Import `CommitReveal` into `GameManager.js`
2. Add validation calls in:
   - `submitNightAction()` - validate before storing
   - `submitVote()` (via PhaseManager) - validate before storing
3. Add error handling for validation failures
4. Test all roles and action types
5. Deploy and monitor

**Files to Modify:**
- `backend/services/game/GameManager.js` (add validation to submitNightAction)
- `backend/services/game/PhaseManager.js` (add validation to submitVote)

**Testing Checklist:**
- [ ] Mafia can only submit kill actions
- [ ] Doctor can only submit save actions
- [ ] Detective can only submit investigate actions
- [ ] Villagers cannot submit night actions
- [ ] Cannot vote for eliminated players
- [ ] Eliminated players cannot vote
- [ ] Invalid action structures are rejected

---

### Phase 2: Prepare for Full Commit-Reveal (Future)
**Timeline:** TBD
**Risk:** Medium

1. **Frontend Preparation:**
   - Add crypto utilities for nonce generation and hashing
   - Update action submission flow to support 2-phase
   - Add nonce storage mechanism
   - Update UI to show commit/reveal phases

2. **Backend Preparation:**
   - Add new routes: `/game/:gameId/action/commit` and `/game/:gameId/action/reveal`
   - Update phase timing to accommodate reveal window
   - Add commit cleanup after phase resolution
   - Add penalties for non-revealing players

3. **Game Design Decisions:**
   - When does reveal phase occur? (before timer expires? separate phase?)
   - How long is reveal window?
   - What happens to players who don't reveal? (auto-skip? elimination? stake penalty?)
   - Should we keep backward compatibility?

---

## Validation Logic Details

### Night Phase Validation

```javascript
validateNightAction(playerRole, action) {
  switch (playerRole) {
    case 'Mafia':
      // Must have target and type='kill'
      if (!action.target || action.type !== 'kill') {
        throw new Error('Invalid mafia action: must target a player to kill');
      }
      break;

    case 'Doctor':
      // Must have target and type='save'
      if (!action.target || action.type !== 'save') {
        throw new Error('Invalid doctor action: must target a player to save');
      }
      break;

    case 'Detective':
      // Must have target and type='investigate'
      if (!action.target || action.type !== 'investigate') {
        throw new Error('Invalid detective action: must target a player to investigate');
      }
      break;

    case 'Villager':
      // Villagers have no night actions
      throw new Error('Villagers cannot perform night actions');

    default:
      throw new Error('Unknown player role');
  }

  return true;
}
```

### Voting Phase Validation

```javascript
validateVoteAction(game, playerAddress, action) {
  // Must have target and type='vote'
  if (!action.target || action.type !== 'vote') {
    throw new Error('Invalid vote: must specify a target player');
  }

  // Target must be in game
  if (!game.players.includes(action.target)) {
    throw new Error('Invalid vote target: player not in game');
  }

  // Cannot vote for eliminated players
  if (game.eliminated.includes(action.target)) {
    throw new Error('Cannot vote for eliminated player');
  }

  // Voter must not be eliminated
  if (game.eliminated.includes(playerAddress)) {
    throw new Error('Eliminated players cannot vote');
  }

  return true;
}
```

---

## Benefits Summary

### Immediate (Phase 1: Validation Only)
- 🛡️ **Security:** Prevent invalid actions from breaking game logic
- 🐛 **Bug Prevention:** Catch action submission errors early
- 📊 **Better Logging:** Clear error messages for debugging
- 🎮 **Fair Play:** Ensure all players follow the rules
- 🧹 **Clean Code:** Centralized validation logic

### Future (Phase 2: Full Commit-Reveal)
- 🔐 **Maximum Security:** Cryptographic proof of action submission
- 🚫 **Anti-Cheat:** Prevent action modification after seeing others' moves
- ⚖️ **Provably Fair:** Players can verify game integrity
- 🎯 **Professional Grade:** Industry-standard commit-reveal pattern
- 🏆 **Competitive Ready:** Suitable for tournaments/ranked play

---

## Migration Notes

### Breaking Changes (Phase 2 Only)
- Frontend must generate and store nonces
- 2-phase action submission required
- Additional network round-trip
- Game phases may need timing adjustments

### Backward Compatibility
For Phase 1 (validation only), no breaking changes - fully backward compatible.

For Phase 2, consider:
- Feature flag to enable/disable commit-reveal per game
- Allow "casual mode" (current flow) vs "ranked mode" (commit-reveal)
- Gradual rollout with A/B testing

---

## Testing Strategy

### Unit Tests
```javascript
// Test validation logic
describe('CommitReveal.validateAction', () => {
  test('rejects villager night actions', () => {
    const game = createMockGame();
    expect(() => {
      commitReveal.validateAction(game, villagerAddress, { type: 'kill' });
    }).toThrow('Villagers cannot perform night actions');
  });

  test('accepts valid mafia kill action', () => {
    const game = createMockGame();
    expect(() => {
      commitReveal.validateAction(game, mafiaAddress, { type: 'kill', target: doctorAddress });
    }).not.toThrow();
  });
});
```

### Integration Tests
```javascript
// Test full flow
describe('Night Action Submission', () => {
  test('rejects invalid actions', async () => {
    const response = await request(app)
      .post(`/api/game/${gameId}/action/night`)
      .send({
        playerAddress: villagerAddress,
        action: { type: 'kill', target: mafiaAddress }
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Villagers cannot perform night actions');
  });
});
```

---

## Related Files

### Current Implementation
- `backend/utils/commitReveal.js` - Commit-reveal utility (ready but unused)
- `backend/services/game/GameManager.js` - Game logic, submitNightAction()
- `backend/services/game/PhaseManager.js` - Phase resolution, submitVote()
- `frontend/hooks/useGame.ts` - Frontend game logic
- `frontend/components/screens/gameplay-screen.tsx` - Action submission UI

### Future Files (Phase 2)
- `frontend/utils/crypto.ts` - Client-side crypto utilities (NEW)
- `backend/routes/game.js` - Add commit/reveal endpoints (MODIFY)
- `backend/services/game/CommitRevealManager.js` - Wrapper service (NEW)

---

## Decision Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2025-11-11 | Postpone full commit-reveal integration | Current flow works; validation-only provides good security/complexity balance |
| 2025-11-11 | Document integration plan | Preserve knowledge for future enhancement |
| 2025-11-11 | Keep commitReveal.js in repo | Well-written utility, ready for future use |

---

## Questions to Resolve (Before Phase 2)

1. **UX Design:** How do we explain commit-reveal to players?
2. **Timing:** When exactly does reveal phase happen?
3. **Penalties:** What if a player loses their nonce?
4. **Fallback:** Should we support both modes (casual vs ranked)?
5. **Mobile:** Does crypto work on all mobile browsers?
6. **Testing:** How do we test 2-phase flow end-to-end?

---

## References

- [Commit-Reveal Scheme (Wikipedia)](https://en.wikipedia.org/wiki/Commitment_scheme)
- [Blockchain Commit-Reveal Pattern](https://medium.com/swlh/exploring-commit-reveal-schemes-on-ethereum-c4ff5a777db8)
- Current implementation: `backend/utils/commitReveal.js`
- Related refactoring docs: `backend_refactor.md`

---

## Contact

For questions about this integration plan, see:
- Implementation details: `backend/utils/commitReveal.js`
- Current game flow: `backend/services/game/GameManager.js`
- Refactoring history: `backend_refactor.md`

---

**Last Updated:** 2025-11-11
**Next Review:** When implementing ranked/tournament mode
