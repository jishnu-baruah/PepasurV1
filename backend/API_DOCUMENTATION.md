# Backend API Documentation (After Cleanup)

This document lists all active and clarified backend API routes after the cleanup process.

## Game Routes (`/api/game/*`)

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
| GET | `/active` | Get active games | ✅ Active |
| GET | `/public/lobbies` | Get public lobbies | ✅ Active |
| PATCH | `/:gameId/settings` | Update settings | ✅ Active |

## Faucet Routes (`/api/faucet/*`)

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| POST | `/claim` | Claim faucet | ✅ Active |
| GET | `/info/:userAddress` | Get faucet info | ✅ Active |
| GET | `/stats` | Get faucet stats | ✅ Active |
| GET | `/server-info` | Get server info | ⚠️ Verify |
| GET | `/status` | Get faucet status | ⚠️ Verify |

## Health Check

| Method | Path | Purpose | Status |
|--------|------|---------|--------|
| GET | `/api/health` | Check API health | ✅ Active |
