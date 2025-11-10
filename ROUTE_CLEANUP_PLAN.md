# Backend Route Cleanup Plan

## Overview
This document identifies unused, broken, and mismatched routes between frontend and backend to reduce code redundancy and improve maintainability.

**Status:** 📋 Planned
**Priority:** Medium
**Created:** 2025-11-11

---

## Summary

### Issues Found
- ❌ **2 Broken Frontend Calls** - calling non-existent backend routes
- 🗑️ **6+ Unused Backend Routes** - implemented but never called
- ⚠️ **1 Confusing Route** - works but path is unclear

### Impact
- **Code Redundancy:** ~200+ lines of unused code
- **Maintenance Burden:** Routes that need testing/updating but aren't used
- **Confusion:** Developers unsure which routes to use
- **Security Risk:** Unused routes may have security holes

---

## ❌ Broken Frontend Calls (MUST FIX)

These frontend calls will **FAIL** because the backend routes don't exist:

### 1. `apiService.joinGame()` - Route Doesn't Exist

**Frontend Call:**
```typescript
// File: frontend/services/api.ts:184-193
async joinGame(gameId: string, data: JoinGameRequest) {
  return this.request<{
    success: boolean
    game: Game
    message: string
  }>(`/api/game/${gameId}/player/join`, {  // ❌ Route doesn't exist
    method: 'POST',
    body: JSON.stringify(data),
  })
}
```

**Used in:**
- `frontend/hooks/useGame.ts:495` - Called when joining a game
- `frontend/app/test/page.tsx:40` - Test page

**Backend Reality:**
- ❌ Route `POST /api/game/:gameId/player/join` **does NOT exist**
- ✅ Use `POST /api/game/join-by-code` instead (requires roomCode)

**Fix Options:**

**Option A: Delete Unused Method (Recommended)**
```typescript
// Remove apiService.joinGame() entirely
// It's only used in test page, not in actual game flow
```

**Option B: Create Missing Route**
```javascript
// backend/routes/game.js
router.post('/:gameId/player/join', async (req, res) => {
  const { gameId } = req.params;
  const { playerAddress } = req.body;

  const game = gameManager.joinGame(gameId, playerAddress);

  res.json({
    success: true,
    game: GameStateFormatter.getPublicGameState(game.gameId, game),
    message: 'Player joined successfully'
  });
});
```

**Recommendation:** **Option A** - Delete the method. The actual game flow uses `joinGameByRoomCode()` which works correctly.

---

### 2. `apiService.getPublicGames()` - Wrong Route Path

**Frontend Call:**
```typescript
// File: frontend/services/api.ts:211-224
async getPublicGames() {
  return this.request<{
    success: boolean
    games: Array<...>
  }>('/api/game/public')  // ❌ Route doesn't exist
}
```

**Used in:**
- Nowhere! Method exists but is never called

**Backend Reality:**
- ❌ Route `GET /api/game/public` **does NOT exist**
- ✅ Route `GET /api/game/public/lobbies` **EXISTS**

**Fix:** **Delete the method** - it's not used anywhere in the codebase.

---

## 🗑️ Unused Backend Routes (SHOULD DELETE)

These routes are implemented but **never called** by the frontend:

### 1. PATCH `/api/game/:gameId` - Update Game State

**Backend:**
```javascript
// File: backend/routes/game.js:162-183
router.patch('/:gameId', (req, res) => {
  const { gameId } = req.params;
  const updates = req.body;

  const game = gameManager.getGame(gameId);
  Object.assign(game, updates);  // ⚠️ Dangerous - allows arbitrary updates

  res.json({ success: true });
});
```

**Usage:** ❌ **Never called** - grep found no frontend usage

**Concerns:**
- Security risk (allows arbitrary game state modification)
- No validation of updates
- Admin/debug route left in production code

**Recommendation:** **DELETE** - No legitimate use case. Game state should only be modified through specific game actions (vote, action, etc.).

---

### 2. GET `/api/game/:gameId/win-probabilities` - Calculate Win Chances

**Backend:**
```javascript
// File: backend/routes/game.js:547-590
router.get('/:gameId/win-probabilities', (req, res) => {
  const game = gameManager.getGame(gameId);

  // Calculate pot and win percentages
  const totalPot = game.stakeAmount * game.players.length;
  // ... more calculations

  res.json({
    mafiaWinPercent,
    nonMafiaWinPercent,
    totalPot,
    netPot
  });
});
```

**Usage:** ❌ **Never called** - grep found no frontend usage

**Notes:**
- Interesting feature but not implemented in UI
- Similar calculations done client-side in public lobbies screen
- ~40 lines of code

**Recommendation:**
- **Option A:** DELETE if not planned for use
- **Option B:** Keep if planned feature, add TODO comment

---

### 3. All Detective Routes - `/api/detective/*`

**Backend File:** `backend/routes/detective.js` (157 lines)

**Routes:**
```javascript
POST   /api/detective/reveal         // Store detective reveal
GET    /api/detective/reveals/:gameId // Get all reveals for game
POST   /api/detective/verify          // Verify reveal signature
GET    /api/detective/info/:gameId    // Get detective info
```

**Usage:** ❌ **Never called** - None of these are used by frontend

**Current Implementation:**
- Detective investigations work differently
- Frontend fetches game state directly to see investigation results
- Backend stores reveals in `PhaseManager` but doesn't use these routes

**Frontend Detective Flow:**
```typescript
// frontend/components/screens/gameplay-screen.tsx:284
// When detective investigates, frontend just fetches game state:
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/game/${game.gameId}?playerAddress=${currentPlayer.address}`
)
const data = await response.json()
const targetRole = data.game.roles[playerId]  // Role revealed directly
```

**Recommendation:** **DELETE ENTIRE FILE** - The detective reveal/verification system was implemented but not used. Current flow works fine without it.

---

### 4. Potentially Unused Staking Routes

**Need to verify usage:**

```javascript
// backend/routes/staking.js
GET /api/staking            // Get all staked games
GET /api/staking/:gameId    // Get staking info for game
```

**Check if used:** Need to search frontend more thoroughly.

---

## ⚠️ Confusing Routes (CLARIFY)

### 1. GET `/api/game` vs GET `/api/game/`

**Backend:**
```javascript
// backend/routes/game.js:445
router.get('/', (req, res) => {
  // Returns all active games
});
```

**Frontend:**
```typescript
// frontend/services/api.ts:195-209
async getActiveGames() {
  return this.request('/api/game')  // Works but confusing path
}
```

**Issue:** The path `/api/game` looks like it should return a specific game, not all games.

**Recommendation:** Rename route to `/api/game/active` or `/api/game/list` for clarity.

---

## 📊 Cleanup Checklist

### Phase 1: Fix Broken Calls (IMMEDIATE - Prevents Runtime Errors)

- [ ] **Delete** `apiService.joinGame()` in `frontend/services/api.ts:184-193`
  - [ ] Remove from `frontend/app/test/page.tsx` test (or update to use `joinGameByRoomCode`)
  - [ ] Remove type `JoinGameRequest` if no longer used

- [ ] **Delete** `apiService.getPublicGames()` in `frontend/services/api.ts:211-224`
  - [ ] Verify no usage with grep
  - [ ] Remove return type if no longer used

### Phase 2: Delete Unused Backend Routes (MEDIUM - Reduces Code)

- [ ] **Delete** PATCH `/api/game/:gameId` route in `backend/routes/game.js:162-183`
  - [ ] Remove entire route handler
  - [ ] Test that nothing breaks

- [ ] **Decide** on GET `/api/game/:gameId/win-probabilities`
  - [ ] If keeping: Add TODO comment explaining future use
  - [ ] If deleting: Remove route in `backend/routes/game.js:547-590`

- [ ] **Delete** entire `backend/routes/detective.js` file
  - [ ] Remove file (157 lines)
  - [ ] Remove from `backend/server.js` route registration
  - [ ] Remove detective route tests if they exist

### Phase 3: Cleanup & Clarify (LOW - Improves Clarity)

- [ ] **Rename** GET `/api/game/` to GET `/api/game/active` or `/api/game/list`
  - [ ] Update route in `backend/routes/game.js`
  - [ ] Update frontend call in `api.ts`
  - [ ] Update tests

- [ ] **Audit** staking routes for usage
  - [ ] Search frontend for all staking API calls
  - [ ] Document which routes are actually used
  - [ ] Delete unused staking routes if any

### Phase 4: Documentation (LOW - Prevents Future Issues)

- [ ] **Create** API documentation
  - [ ] List all active routes
  - [ ] Document request/response formats
  - [ ] Mark deprecated routes

- [ ] **Add** JSDoc comments to route handlers
  - [ ] Explain what each route does
  - [ ] Document parameters
  - [ ] Add usage examples

---

## Implementation Guide

### Deleting Frontend Methods

```typescript
// frontend/services/api.ts

// ❌ REMOVE THESE METHODS:
async joinGame(gameId: string, data: JoinGameRequest) { ... }
async getPublicGames() { ... }

// ✅ KEEP THESE (they work correctly):
async joinGameByRoomCode(data: JoinGameByRoomCodeRequest) { ... }
async getGame(gameId: string, playerAddress?: string) { ... }
```

### Deleting Backend Routes

```javascript
// backend/routes/game.js

// ❌ DELETE THIS ENTIRE BLOCK:
router.patch('/:gameId', (req, res) => {
  // ... update game state logic
});

// ❌ DELETE OR KEEP WITH TODO:
router.get('/:gameId/win-probabilities', (req, res) => {
  // TODO: Implement this feature in frontend or remove
  // ... win probability calculation
});
```

### Deleting Detective Routes

```javascript
// backend/server.js

// ❌ REMOVE THIS LINE:
app.use('/api/detective', detectiveRoutes);

// And delete the entire file:
// backend/routes/detective.js
```

---

## Testing After Cleanup

### Manual Testing Checklist

After removing routes, test these core flows:

1. **Create Game Flow:**
   - [ ] Create public game
   - [ ] Create private game
   - [ ] Game appears in public lobbies

2. **Join Game Flow:**
   - [ ] Join by room code (frontend/services/api.ts:joinGameByRoomCode)
   - [ ] Join from public lobbies
   - [ ] Player appears in lobby

3. **Gameplay Flow:**
   - [ ] Submit night actions
   - [ ] Submit task answers
   - [ ] Submit votes
   - [ ] Game phases transition correctly

4. **Detective Flow:**
   - [ ] Detective can investigate
   - [ ] Investigation result appears
   - [ ] Verify no errors in console

5. **Staking Flow:**
   - [ ] Record stake
   - [ ] Check staking status
   - [ ] Game starts when all staked

### Automated Tests

```bash
# Run backend tests
cd backend
npm test

# Run frontend tests
cd frontend
npm test

# Integration tests
npm run test:e2e
```

---

## Risk Assessment

### Low Risk (Safe to Delete)

- ✅ `apiService.joinGame()` - Only used in test page
- ✅ `apiService.getPublicGames()` - Never called
- ✅ `backend/routes/detective.js` - Feature not implemented in frontend

### Medium Risk (Test Thoroughly)

- ⚠️ PATCH `/api/game/:gameId` - Could be used by admin tools
- ⚠️ GET `/api/game/:gameId/win-probabilities` - Might be planned feature

### Zero Risk (Just Clarifying)

- ✅ Renaming `/api/game/` to `/api/game/active` - Just a path change

---

## Code Savings

### Lines of Code Removed

| File | Lines | Type |
|------|-------|------|
| `backend/routes/detective.js` | ~157 | Backend route |
| `backend/routes/game.js` PATCH /:gameId | ~22 | Backend route |
| `backend/routes/game.js` GET win-probabilities | ~45 | Backend route |
| `frontend/services/api.ts` joinGame() | ~10 | Frontend method |
| `frontend/services/api.ts` getPublicGames() | ~15 | Frontend method |
| **TOTAL** | **~249 lines** | |

### Maintenance Savings

- **Fewer routes to test:** 6 fewer routes to maintain
- **Clearer API surface:** Developers know exactly what's available
- **Reduced security risk:** No unused routes that might have vulnerabilities
- **Faster onboarding:** New developers see only active code

---

## Alternative: Deprecation Strategy

If you're unsure about deleting routes immediately, use deprecation:

### Backend Route Deprecation

```javascript
// backend/routes/game.js
router.patch('/:gameId', (req, res) => {
  console.warn('⚠️ DEPRECATED: PATCH /api/game/:gameId is deprecated and will be removed in v2.0');
  console.warn('⚠️ This route is not used by the frontend and may be removed soon');

  // ... existing logic
});
```

### Frontend Method Deprecation

```typescript
// frontend/services/api.ts
/**
 * @deprecated This method calls a non-existent backend route.
 * Use joinGameByRoomCode() instead.
 */
async joinGame(gameId: string, data: JoinGameRequest) {
  throw new Error('joinGame() is deprecated - use joinGameByRoomCode()');
}
```

---

## Migration Timeline

### Week 1: Analysis & Documentation
- [ ] Complete route audit
- [ ] Document all findings
- [ ] Get team approval for deletions

### Week 2: Fix Broken Calls
- [ ] Fix/delete broken frontend methods
- [ ] Update tests
- [ ] Deploy and monitor

### Week 3: Delete Unused Routes
- [ ] Delete detective routes
- [ ] Delete unused game routes
- [ ] Update server.js registrations

### Week 4: Cleanup & Documentation
- [ ] Rename confusing routes
- [ ] Add API documentation
- [ ] Create route inventory

---

## Route Inventory (After Cleanup)

### Game Routes (`/api/game/*`)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/create` | Create new game | ✅ Active |
| POST | `/create-and-join` | Create game and join | ✅ Active |
| GET | `/:gameId` | Get game state | ✅ Active |
| POST | `/join-by-code` | Join by room code | ✅ Active |
| POST | `/leave` | Leave game | ✅ Active |
| POST | `/record-stake` | Record player stake | ✅ Active |
| GET | `/room/:roomCode` | Get game by room code | ✅ Active |
| POST | `/:gameId/player/eliminate` | Eliminate player | ✅ Active |
| POST | `/:gameId/ready` | Signal ready | ✅ Active |
| POST | `/:gameId/action/night` | Submit night action | ✅ Active |
| POST | `/:gameId/task/submit` | Submit task answer | ✅ Active |
| POST | `/:gameId/vote/submit` | Submit vote | ✅ Active |
| GET | `/:gameId/history` | Get game history | ✅ Active |
| GET | `/` → `/active` | Get active games | ⚠️ Rename |
| GET | `/public/lobbies` | Get public lobbies | ✅ Active |
| PATCH | `/:gameId/settings` | Update settings | ✅ Active |
| ~~PATCH~~ | ~~`/:gameId`~~ | ~~Update game~~ | ❌ Delete |
| ~~GET~~ | ~~`/:gameId/win-probabilities`~~ | ~~Win chances~~ | ❌ Delete |

### Staking Routes (`/api/staking/*`)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/stake` | Stake for game | ✅ Active |
| GET | `/:gameId` | Get staking info | ⚠️ Verify |
| GET | `/:gameId/:playerAddress` | Get player stake | ⚠️ Verify |
| GET | `/balance/:playerAddress` | Get player balance | ✅ Active |
| GET | `/` | Get all staked games | ⚠️ Verify |

### Faucet Routes (`/api/faucet/*`)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/claim` | Claim faucet | ✅ Active |
| GET | `/info/:userAddress` | Get faucet info | ✅ Active |
| GET | `/stats` | Get faucet stats | ✅ Active |
| GET | `/server-info` | Get server info | ⚠️ Verify |
| GET | `/status` | Get faucet status | ⚠️ Verify |

### Detective Routes (`/api/detective/*`)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| ~~POST~~ | ~~`/reveal`~~ | ~~Store reveal~~ | ❌ Delete |
| ~~GET~~ | ~~`/reveals/:gameId`~~ | ~~Get reveals~~ | ❌ Delete |
| ~~POST~~ | ~~`/verify`~~ | ~~Verify signature~~ | ❌ Delete |
| ~~GET~~ | ~~`/info/:gameId`~~ | ~~Get detective info~~ | ❌ Delete |

---

## Questions to Resolve

1. **Win Probabilities:** Do we plan to show win percentages in the UI? If yes, when?
2. **Detective API:** Was this intended for blockchain-based reveal verification?
3. **Staking Routes:** Are all staking routes actually used? Need thorough audit.
4. **Admin Routes:** Do we need admin routes for game management?

---

## Related Documents

- `backend_refactor.md` - Backend refactoring history
- `COMMIT_REVEAL_INTEGRATION_PLAN.md` - Commit-reveal feature plan
- API documentation (TODO: create)

---

**Last Updated:** 2025-11-11
**Next Review:** After Phase 1 completion
**Owner:** Backend Team
