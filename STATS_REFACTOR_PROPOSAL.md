# 📊 Stats View Refactor Proposal

## Current Problems

### 1. Useless Global Failure Tracking
- `cardFails` and `posFails` are tracked globally but never displayed
- They mix failures from different game modes
- Example: Failing "A♠" in "Card → Position" is tracked the same as "A♠" in "One Ahead"
- **These test completely different skills and shouldn't overlap!**

### 2. Redundant Metrics
- "Last 5" and "Last 10" are both shown (one is enough)
- Trend calculation is basic and could be more nuanced

### 3. Missing Useful Information
- No per-mode performance breakdown
- No indication which modes need work
- No way to identify actual problem areas per mode

---

## Proposed Changes

### Phase 1: Remove Global Failures ✂️

**Remove from `Stats` interface:**
```typescript
export interface Stats {
  // REMOVE: cardFails: Record<string, number>;
  // REMOVE: posFails: Record<string, number>;
  total: number;
  correct: number;
  history: AttemptHistory[];
  modeStats: Record<string, ModeStats>; // Keep this - it's useful!
}
```

**Benefits:**
- Cleaner data model
- No misleading mixed-context data
- Reduced localStorage footprint

---

### Phase 2: Enhanced Per-Mode Stats 📈

**Update `ModeStats` to include failures:**
```typescript
export interface ModeStats {
  total: number;
  correct: number;
  accuracy: number;
  // NEW: Track failures per mode
  cardFails?: Record<string, number>;  // Optional for card-based modes
  posFails?: Record<string, number>;    // Optional for position-based modes
  recentAttempts: number; // Number of recent attempts (useful for staleness)
}
```

**Benefits:**
- Context-aware failure tracking
- Each mode tracks its own problem areas
- Can identify which cards are hard in specific contexts

---

### Phase 3: Cleaner Stats View 🎨

**Remove redundant metrics:**
- ❌ Remove "Last 5" (redundant with "Last 10")
- ✅ Keep "Last 10" and "Current Streak"
- ✅ Keep "Last 20 visualization" (visual feedback is valuable)
- ✅ Improve "Trend" to show emoji + text

**Add new "Mode Performance" card:**
```
┌─────────────────────────────────────┐
│ 🎯 Mode Performance                 │
├─────────────────────────────────────┤
│ Card → Position      85%  (120 tries)│
│ Position → Card      72%  (95 tries) │
│ One Ahead            90%  (150 tries)│
│ Stack Context        78%  (80 tries) │
│ Cutting Estimation   65%  (45 tries) │
│ ...                                  │
└─────────────────────────────────────┘
```

**Benefits:**
- See which modes need work at a glance
- Identify underutilized modes
- No information overload

---

### Phase 4 (Optional): Problem Cards Per Mode 🔍

Only show if a mode has 20+ attempts:

```
┌─────────────────────────────────────┐
│ 🎯 Card → Position - Problem Cards  │
├─────────────────────────────────────┤
│ 7♦  (5 misses)                      │
│ Q♠  (4 misses)                      │
│ 3♥  (3 misses)                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🔍 One Ahead - Problem Cards        │
├─────────────────────────────────────┤
│ K♣ → A♠  (6 misses)                 │
│ 5♦ → 7♦  (4 misses)                 │
└─────────────────────────────────────┘
```

**Show as expandable/collapsible sections to avoid clutter**

---

## Implementation Priority

### Must-Have (Clean & Simple)
1. ✅ Remove global cardFails/posFails
2. ✅ Add Mode Performance card
3. ✅ Remove "Last 5" metric
4. ✅ Keep existing Overall Accuracy and Recent Performance cards

### Nice-to-Have (If Not Cluttered)
1. ⚠️ Per-mode problem areas (only with 20+ attempts)
2. ⚠️ Show only top 3 problem items per mode
3. ⚠️ Make expandable to reduce visual noise

---

## Recommended Final Layout

```
┌────────────────────────────────────────────────────────┐
│                     Stats View                          │
├────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐  ┌──────────────────┐           │
│  │ Overall Accuracy │  │ Mode Performance │           │
│  │                  │  │                  │           │
│  │     85%          │  │ Card→Pos   85%   │           │
│  │   1,250/1,470    │  │ Pos→Card   72%   │           │
│  │                  │  │ One Ahead  90%   │           │
│  └──────────────────┘  │ ...              │           │
│                        └──────────────────┘           │
│                                                         │
│  ┌──────────────────────────────────────────────────┐ │
│  │ Recent Performance                               │ │
│  │                                                  │ │
│  │  Last 10: 80%    Streak: 5    Trend: 📈         │ │
│  │  ●●●○●●○●●●●●●●●●●●●● (Last 20)                 │ │
│  └──────────────────────────────────────────────────┘ │
│                                                         │
└────────────────────────────────────────────────────────┘
```

**Clean, focused, actionable!**

---

## Migration Notes

Since localStorage structure is changing:
1. Add migration logic to handle old data format
2. Default `modeStats[mode].cardFails` to `{}` if missing
3. Ignore old global `cardFails`/`posFails` on load

```typescript
// In StatsContext onMount:
const savedStats = loadFromLocalStorage<Stats>('mnemonic-stats', defaultStats)

// Migration: Remove old fields
if ('cardFails' in savedStats) {
  delete savedStats.cardFails;
  delete savedStats.posFails;
}
```

