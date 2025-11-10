# Screen Header Refactoring Guide

## Overview
Created a unified `ScreenHeader` component to replace duplicate header code across all game screens. This component provides consistent styling, eliminated player indicator, and integrated tips.

**Component Location:** `frontend/components/common/screen-header.tsx`

---

## Features

### ✅ Unified Header Design
- Consistent title, timer, and subtitle styling across all screens
- Pixel art styling with 3D text effects
- Responsive design (mobile to desktop)

### ✅ Eliminated Player Indicator
- **Animated skull badge** when player is eliminated
- Prominent red styling with pulsing animation
- Shows message: "YOU ARE ELIMINATED - You can still watch the game unfold"

### ✅ Integrated Tips System
- Optional tips bar for each phase
- Supports custom tips or phase-based tips
- Clean, integrated design

### ✅ Flexible Customization
- Optional timer display
- Customizable subtitle (string or React node)
- Custom CSS classes for all elements
- Conditional rendering based on props

---

## Props API

```typescript
interface ScreenHeaderProps {
  title: string                    // Screen title (e.g., "VOTING PHASE")
  timer?: number                   // Optional countdown timer
  subtitle?: string | React.ReactNode  // Instruction/status message
  isEliminated?: boolean           // Show eliminated indicator
  showTips?: boolean               // Show tips bar
  tipPhase?: "lobby" | "night" | "resolution" | "task" | "voting" | "discussion"
  customTips?: string[]            // Custom tips array
  className?: string               // Custom class for container
  titleClassName?: string          // Custom class for title
  timerClassName?: string          // Custom class for timer
  subtitleClassName?: string       // Custom class for subtitle
}
```

---

## Usage Examples

### Example 1: Voting Screen (✅ Already Refactored)

**Before:**
```tsx
<div className="w-full max-w-7xl text-center">
  <h1 className="text-4xl md:text-5xl font-bold pixel-text-3d-white pixel-text-3d-float-long">
    VOTING PHASE
  </h1>
  <div className="text-5xl md:text-7xl font-bold pixel-text-3d-blue my-2">
    {timeLeft}
  </div>
  <div className="w-full bg-black/50 border-2 p-3 text-lg md:text-xl">
    {submitted ? "Vote confirmed..." : "Click a player to cast your vote."}
  </div>
  <TipBar phase="voting" tips={[...]} />
</div>
```

**After:**
```tsx
<ScreenHeader
  title="VOTING PHASE"
  timer={timeLeft}
  subtitle={
    submitted
      ? "Vote confirmed. Waiting for others..."
      : "Click a player to cast your vote."
  }
  isEliminated={isEliminated}
  showTips={true}
  tipPhase="voting"
  customTips={[
    "Click a player to select, <strong>double-click to confirm</strong>.",
    "Vote to eliminate who you suspect is ASUR",
    "Most votes = eliminated"
  ]}
/>
```

---

### Example 2: Night Phase / Gameplay Screen

```tsx
<ScreenHeader
  title="NIGHT PHASE"
  timer={game?.timeLeft}
  subtitle={
    actionTaken
      ? "Action submitted. Waiting for others..."
      : currentPlayer?.role === "ASUR"
        ? "Select a player to eliminate"
        : currentPlayer?.role === "HEALER"
          ? "Select a player to protect"
          : "Select a player to investigate"
  }
  isEliminated={isCurrentPlayerEliminated}
  showTips={true}
  tipPhase="night"
/>
```

---

### Example 3: Discussion/Task Phase

```tsx
<ScreenHeader
  title="DISCUSSION PHASE"
  timer={timeLeft}
  subtitle="Complete tasks and discuss who might be the ASUR"
  isEliminated={isEliminated}
  showTips={true}
  tipPhase="discussion"
  customTips={[
    "Complete tasks to help NON-ASURS win",
    "Share information in chat",
    "Watch for suspicious behavior"
  ]}
/>
```

---

### Example 4: Lobby Screen (No Timer, No Elimination)

```tsx
<ScreenHeader
  title="LOBBY"
  subtitle={`Waiting for players... ${game.players.length}/${game.minPlayers}`}
  showTips={true}
  tipPhase="lobby"
/>
```

---

### Example 5: Resolution Screen (Dynamic Subtitle)

```tsx
<ScreenHeader
  title="NIGHT RESOLUTION"
  timer={timeLeft}
  subtitle={
    <div className="space-y-1">
      <div>A player was eliminated during the night...</div>
      {killedPlayer && <div className="text-red-400">{killedPlayer.name}</div>}
    </div>
  }
  isEliminated={isEliminated}
  showTips={false}
/>
```

---

## Screens to Refactor

### ✅ Completed
- [x] `voting-screen.tsx` - Refactored with eliminated indicator

### 🔲 To Do
- [ ] `gameplay-screen.tsx` (Night Phase)
- [ ] `discussion-phase-screen.tsx`
- [ ] `lobby-screen.tsx`
- [ ] `night-resolution-screen.tsx`
- [ ] `role-assignment-screen.tsx`
- [ ] `staking-screen.tsx`
- [ ] `public-lobbies-screen.tsx`

---

## Implementation Checklist

For each screen:

1. **Import the component**
   ```tsx
   import ScreenHeader from "@/components/common/screen-header"
   ```

2. **Identify eliminated status**
   ```tsx
   const isEliminated = game?.eliminated?.includes(currentPlayer?.address) || !currentPlayer?.isAlive
   ```

3. **Replace header section**
   - Find the title, timer, and subtitle section
   - Replace with `<ScreenHeader />` component
   - Pass appropriate props

4. **Remove duplicate code**
   - Remove old header div
   - Remove standalone `<TipBar />` if moved to header

5. **Test functionality**
   - Verify timer updates
   - Check eliminated indicator appears when player is eliminated
   - Confirm tips display correctly
   - Test responsive design

---

## Benefits

### Code Reduction
- **~50 lines** removed per screen (title, timer, subtitle, tips)
- **Estimated total:** ~400-500 lines across all screens

### Maintainability
- Single source of truth for header styling
- Consistent eliminated indicator across all screens
- Easier to update styling globally

### User Experience
- **Clear eliminated status** - Players know they're out immediately
- Consistent UI patterns across all phases
- Better visual hierarchy

### Accessibility
- Semantic HTML structure
- Consistent focus states
- Screen reader friendly

---

## Eliminated Indicator Details

### Visual Design
```tsx
{isEliminated && (
  <Badge variant="destructive" className="...">
    <Skull className="w-5 h-5 mr-2" />
    YOU ARE ELIMINATED
    <Skull className="w-5 h-5 ml-2" />
  </Badge>
  <div className="text-sm">You can still watch the game unfold</div>
)}
```

### Styling
- **Background:** Red (`bg-red-600/90`)
- **Border:** Red (`border-red-400`)
- **Animation:** Bouncing (`animate-bounce`)
- **Shadow:** Red glow (`shadow-red-500/50`)
- **Font:** Press Start 2P (pixel font)

### Behavior
- Shows when `isEliminated={true}`
- Appears above the title
- Always visible when eliminated (no auto-hide)
- Persists across all game screens

---

## Advanced Customization Examples

### Custom Timer Color
```tsx
<ScreenHeader
  title="URGENT VOTING"
  timer={timeLeft}
  timerClassName="text-red-500 animate-pulse"  // Red, pulsing timer
/>
```

### Animated Subtitle
```tsx
<ScreenHeader
  title="NIGHT PHASE"
  subtitle="Take your action..."
  subtitleClassName="animate-pulse border-yellow-400"
/>
```

### No Border Subtitle
```tsx
<ScreenHeader
  title="RESULTS"
  subtitle="Game Over"
  subtitleClassName="border-0 bg-transparent"
/>
```

---

## Testing the Eliminated Indicator

### Manual Test Steps

1. **Join a game** as a player
2. **Get eliminated** (either by voting or night kill)
3. **Check all screens:**
   - Voting screen → Should show eliminated badge
   - Night phase → Should show eliminated badge
   - Discussion phase → Should show eliminated badge
   - Task phase → Should show eliminated badge

### Expected Behavior

**When Eliminated:**
- ✅ Red skull badge appears at top
- ✅ Badge says "YOU ARE ELIMINATED"
- ✅ Message says "You can still watch the game unfold"
- ✅ Badge animates with bounce effect
- ✅ Badge is visible on all screens

**When Not Eliminated:**
- ✅ No badge appears
- ✅ Header looks normal

---

## Migration Priority

### High Priority (Core Gameplay Screens)
1. `gameplay-screen.tsx` - Night phase actions
2. `discussion-phase-screen.tsx` - Task completion
3. `voting-screen.tsx` - ✅ Already done

### Medium Priority (Secondary Screens)
4. `night-resolution-screen.tsx` - Results display
5. `role-assignment-screen.tsx` - Role reveal

### Low Priority (Pre-game Screens)
6. `lobby-screen.tsx` - Waiting room
7. `staking-screen.tsx` - Staking phase
8. `public-lobbies-screen.tsx` - Lobby browser

---

## Common Pitfalls

### ❌ Wrong Eliminated Check
```tsx
// BAD - might not work
isEliminated={currentPlayer?.isAlive === false}
```

### ✅ Correct Eliminated Check
```tsx
// GOOD - comprehensive check
isEliminated={
  game?.eliminated?.includes(currentPlayer?.address) ||
  !currentPlayer?.isAlive
}
```

### ❌ Missing Import
```tsx
// Will cause compile error
<ScreenHeader title="..." />
```

### ✅ Add Import
```tsx
import ScreenHeader from "@/components/common/screen-header"
```

---

## Future Enhancements

### Potential Features
- [ ] **Role indicator** in header (show player's role)
- [ ] **Score display** (tasks completed, etc.)
- [ ] **Phase progress bar** (visual timer)
- [ ] **Player count indicator** (alive/total)
- [ ] **Mute/unmute button** in header
- [ ] **Connection status** integrated in header

### Accessibility Improvements
- [ ] Screen reader announcements for timer
- [ ] ARIA labels for eliminated status
- [ ] Keyboard shortcuts display
- [ ] High contrast mode support

---

## Related Documentation

- `frontend/components/common/screen-header.tsx` - Component source code
- `frontend/components/common/tip-bar.tsx` - Tips system
- `frontend/hooks/useGame.ts` - Game state management
- `COMMIT_REVEAL_INTEGRATION_PLAN.md` - Backend game logic
- `ROUTE_CLEANUP_PLAN.md` - API cleanup

---

**Last Updated:** 2025-11-11
**Status:** In Progress (1/8 screens refactored)
**Next Steps:** Refactor `gameplay-screen.tsx` and `discussion-phase-screen.tsx`
