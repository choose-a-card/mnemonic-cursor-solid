# Layout Shift Fix - Submit Button Movement

## Problem
When submitting an answer in practice modes, the submit button or answer buttons would move down when the feedback message (correct/wrong) appeared, causing a jarring layout shift.

## Root Cause
The `.feedback-area` had a `min-height: 3rem`, but when the feedback message appeared with its padding (1rem top/bottom) and border, it exceeded that height and pushed elements below it downward.

## Solution
Reserved adequate space for the feedback area to prevent layout shifts when feedback appears.

## Changes Made

### Desktop (Default)
**File**: `src/components/Practice/PracticeView.css`

1. **Feedback Area**:
   - Increased `min-height` from `3rem` to `4rem`
   - Added fixed margin: `1rem 0`
   - Ensures enough space for feedback message with all padding and borders

2. **Feedback Message**:
   - Reduced padding from `1rem 1.5rem` to `0.75rem 1.5rem`
   - Reduced font-size from `1.1rem` to `1rem`
   - Better fits within the reserved space

3. **Answer Buttons**:
   - Changed margin from `1.5rem 0 0.5rem 0` to `1.5rem 0 0 0`
   - Removed bottom margin to rely on feedback-area's fixed margin
   - Ensures consistent spacing

### Mobile (≤640px)
**Responsive Adjustments**:

1. **Feedback Area**:
   - `min-height: 3.5rem` (slightly smaller for mobile screens)
   - `margin: 0.75rem 0`

2. **Feedback Message**:
   - `font-size: 0.95rem`
   - `padding: 0.625rem 1rem`

## Technical Details

### Before
```css
.feedback-area {
  min-height: 3rem;
  /* No fixed margin */
}

.feedback-message {
  padding: 1rem 1.5rem; /* 2rem total height + borders */
  font-size: 1.1rem;
}

.answer-buttons {
  margin: 1.5rem 0 0.5rem 0; /* Variable bottom margin */
}
```

**Issue**: Feedback message height (2rem padding + borders + content) > reserved space (3rem) = layout shift

### After
```css
.feedback-area {
  min-height: 4rem; /* Accommodates feedback message */
  margin: 1rem 0; /* Fixed consistent spacing */
}

.feedback-message {
  padding: 0.75rem 1.5rem; /* 1.5rem total height + borders */
  font-size: 1rem;
}

.answer-buttons {
  margin: 1.5rem 0 0 0; /* Relies on feedback-area margin */
}
```

**Result**: Reserved space (4rem) > feedback message height = no layout shift

## Affected Components

All practice mode components that use `.feedback-area`:
- ✅ `ClassicQuiz.tsx` (Card → Position)
- ✅ `PositionToCard.tsx` (Position → Card)
- ✅ `FirstOrSecondHalf.tsx` (First/Second Half)
- ✅ `CuttingEstimation.tsx` (Cutting Estimation)
- ✅ `QuartetPosition.tsx` (Quartet Position)
- ✅ `StackContext.tsx` (Stack Context)
- ✅ `CutToPosition.tsx` (Cut to Position)
- ✅ `OneAhead.tsx` (One Ahead)

## Testing Checklist

### Desktop
- ✅ Submit button doesn't move when feedback appears
- ✅ Feedback message displays correctly
- ✅ Spacing is consistent between questions
- ✅ No layout jumps during answer transitions

### Mobile
- ✅ Answer buttons don't move when feedback appears
- ✅ Feedback message fits on screen
- ✅ Touch targets remain stable
- ✅ Responsive sizing works correctly

## Benefits

1. **Better UX**: Stable layout prevents disorientation
2. **Professional Feel**: Smooth transitions without jumps
3. **Accessibility**: Predictable button positions for all users
4. **Performance**: No unnecessary reflows/repaints

## Browser Compatibility

- Works on all modern browsers (Chrome, Safari, Firefox, Edge)
- Responsive design tested on various screen sizes
- Touch devices benefit from stable touch targets

