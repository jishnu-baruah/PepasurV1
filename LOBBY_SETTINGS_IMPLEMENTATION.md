# Lobby Settings Implementation

## Overview
This implementation adds customizable lobby settings for game creators, allowing them to configure phase times and player requirements before and during the lobby phase.

## Features Implemented

### 1. **Lobby Settings Dialog Component**
**File:** `frontend/components/lobby-settings-dialog.tsx`

A reusable dialog component that allows the creator to configure:
- **Night Phase Duration** (10-120 seconds, default: 30s)
- **Resolution Phase Duration** (5-60 seconds, default: 10s)
- **Task/Discussion Phase Duration** (15-180 seconds, default: 30s)
- **Voting Phase Duration** (5-60 seconds, default: 10s)
- **Minimum Players** (4-10 players, default: 4)

Features:
- Input validation with min/max limits
- Reset to defaults button
- Retro-styled UI matching the game theme

### 2. **Staking Screen Integration**
**File:** `frontend/components/staking-screen.tsx`

For **create mode** only:
- Added "Game Settings" configuration panel
- Settings can be configured before creating the lobby
- Settings are passed to backend during game creation
- Located between "Room Visibility" and "Gasless Mode" toggles

### 3. **Lobby Screen Integration**
**File:** `frontend/components/lobby-screen.tsx`

For **creator** only:
- Added "⚙️ SETTINGS" button in the lobby controls
- Creator can modify settings even after lobby creation
- Settings updates are sent to backend via API
- Updates dynamically reflect minimum player count in lobby instructions

### 4. **API Service Updates**
**File:** `frontend/services/api.ts`

Updated interfaces:
```typescript
export interface GameSettings {
  nightPhaseDuration?: number
  resolutionPhaseDuration?: number
  taskPhaseDuration?: number
  votingPhaseDuration?: number
  minPlayers?: number
}

export interface Game {
  // ... existing fields
  settings?: GameSettings
  isPublic?: boolean
  roomCode?: string
  // ... additional fields for completeness
}

export interface CreateGameRequest {
  creatorAddress: string
  stakeAmount?: number
  minPlayers?: number
  settings?: GameSettings
}
```

## How It Works

### Game Creation Flow
1. **Staking Screen**: Creator configures settings before creating game
2. Settings passed to `/api/game/create-and-join` endpoint with:
   ```json
   {
     "creatorAddress": "0x...",
     "stakeAmount": 100000000,
     "minPlayers": 4,
     "isPublic": false,
     "settings": {
       "nightPhaseDuration": 30,
       "resolutionPhaseDuration": 10,
       "taskPhaseDuration": 30,
       "votingPhaseDuration": 10,
       "minPlayers": 4
     }
   }
   ```

### Lobby Settings Update Flow
1. **Lobby Screen**: Creator clicks "⚙️ SETTINGS" button
2. Settings dialog opens with current values
3. Creator modifies settings and saves
4. PATCH request sent to `/api/game/${gameId}/settings`:
   ```json
   {
     "creatorAddress": "0x...",
     "settings": { /* updated settings */ }
   }
   ```

## Backend Integration Completed

The following backend updates have been implemented:

### 1. **Updated GameManager.js** ✅
The `createGame` method now accepts a `settings` parameter and stores it in the game object:
- Default settings are applied if none provided
- All phase transitions now use `game.settings?.{phase}Duration || defaultValue`
- Updated phases: night, resolution, task, voting
- Settings are persisted in both memory and database

**Modified Files:**
- `backend/services/GameManager.js:42` - createGame signature
- `backend/services/GameManager.js:587` - Night phase timer
- `backend/services/GameManager.js:920` - Resolution phase timer
- `backend/services/GameManager.js:987` - Task phase timer
- `backend/services/GameManager.js:1021` - Voting phase timer
- `backend/services/GameManager.js:1111` - Night phase after voting
- `backend/services/GameManager.js:1310` - Emergency voting phase

### 2. **Added Settings Update Endpoint** ✅
**Endpoint:** `PATCH /api/game/:gameId/settings`

**Location:** `backend/routes/game.js:520`

**Features:**
- Validates creator authorization
- Only allows updates during lobby phase
- Merges new settings with existing ones
- Updates both in-memory game and database
- Broadcasts changes to all players via socket
- Handles database timeouts gracefully

**Request Body:**
```json
{
  "creatorAddress": "0x...",
  "settings": {
    "nightPhaseDuration": 45,
    "resolutionPhaseDuration": 15,
    "taskPhaseDuration": 60,
    "votingPhaseDuration": 20,
    "minPlayers": 6
  }
}
```

**Response:**
```json
{
  "success": true,
  "settings": { /* updated settings */ }
}
```

### 3. **Updated Database Schema** ✅
**File:** `backend/models/Game.js:78`

**Added Field:**
```javascript
settings: {
  type: {
    nightPhaseDuration: { type: Number, default: 30, min: 10, max: 120 },
    resolutionPhaseDuration: { type: Number, default: 10, min: 5, max: 60 },
    taskPhaseDuration: { type: Number, default: 30, min: 15, max: 180 },
    votingPhaseDuration: { type: Number, default: 10, min: 5, max: 60 },
    minPlayers: { type: Number, default: 4, min: 4, max: 10 }
  },
  default: {}
}
```

**Features:**
- Validation with min/max constraints
- Default values match frontend defaults
- Automatic persistence on save

## UI/UX Benefits

1. **Flexibility**: Game creators can customize game pace
2. **Accessibility**: Longer times for new players, shorter for experienced ones
3. **Non-intrusive**: Only creator sees settings button
4. **Intuitive**: Clear labels and validation
5. **Consistent**: Matches existing UI styling

## Testing Checklist

### Frontend
- [ ] Settings dialog opens and closes correctly
- [ ] Default values populate correctly (30, 10, 30, 10, 4)
- [ ] Input validation works (min/max limits)
- [ ] Reset button restores defaults
- [ ] Settings sent to backend on game creation
- [ ] Creator can update settings in lobby
- [ ] Non-creators don't see settings button
- [ ] Settings dialog displays current values

### Backend
- [x] Settings accepted in `/create` endpoint
- [x] Settings accepted in `/create-and-join` endpoint
- [x] Settings stored in database with validation
- [x] Settings update endpoint validates creator
- [x] Settings update endpoint validates lobby phase
- [x] Phase transitions use custom durations
- [x] Settings broadcast to all players

### Integration
- [ ] Create game with custom settings
- [ ] Settings reflect in database
- [ ] Game phases use correct timings
- [ ] Update settings from lobby
- [ ] Changes broadcast to all players
- [ ] Minimum players affects game start

## Files Modified

### Frontend
1. ✅ `frontend/components/lobby-settings-dialog.tsx` (new)
2. ✅ `frontend/components/staking-screen.tsx`
3. ✅ `frontend/components/lobby-screen.tsx`
4. ✅ `frontend/services/api.ts`

### Backend
5. ✅ `backend/services/GameManager.js`
6. ✅ `backend/routes/game.js`
7. ✅ `backend/models/Game.js`

## Screenshots / Demo

The UI follows the existing retro pixel art theme with:
- Press Start 2P font for headers
- Pixel-style borders and buttons
- Consistent color scheme
- Responsive design for mobile/desktop

## Notes

- Settings are **only modifiable in lobby phase** to prevent mid-game changes
- Backend validation enforces min/max limits matching frontend
- Settings are optional in API - backend uses defaults if not provided
- Phase timings are in **seconds** for consistency
- Settings persist across game restarts (stored in database)
- All phase transitions updated to use custom settings
- Backward compatible: games without settings use defaults

## API Summary

### Create Game with Settings
```bash
POST /api/game/create-and-join
{
  "creatorAddress": "0x123...",
  "stakeAmount": 100000000,
  "minPlayers": 4,
  "isPublic": true,
  "settings": {
    "nightPhaseDuration": 45,
    "resolutionPhaseDuration": 15,
    "taskPhaseDuration": 60,
    "votingPhaseDuration": 20,
    "minPlayers": 6
  }
}
```

### Update Settings in Lobby
```bash
PATCH /api/game/:gameId/settings
{
  "creatorAddress": "0x123...",
  "settings": {
    "nightPhaseDuration": 60,
    "votingPhaseDuration": 15
  }
}
```

## Implementation Complete!

All frontend and backend changes have been implemented:
- ✅ Frontend components with settings UI
- ✅ Backend API endpoints for settings
- ✅ Database schema with validation
- ✅ Phase transitions using custom durations
- ✅ Settings persistence and broadcasting

Ready for testing!
