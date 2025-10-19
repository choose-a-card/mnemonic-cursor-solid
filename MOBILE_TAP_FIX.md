# Mobile Tap State Fix

## Problem
Buttons and interactive elements in the mobile view were staying in the "pressed" or "active" state after being tapped, creating a poor user experience.

## Root Causes
1. **Persistent Focus**: On touch devices, buttons retain focus after being clicked, causing hover/active styles to persist
2. **Default Tap Highlights**: Mobile browsers show default tap highlights that can interfere with custom styling
3. **CSS Pseudo-classes**: `:hover`, `:active`, and `:focus` states were being triggered and not properly cleared on touch devices

## Solutions Implemented

### 1. JavaScript: Explicit Focus Removal
Added `.blur()` calls on touch devices to remove focus after button interactions:

**Pattern for Regular Buttons:**
```typescript
const handleClick = (e: MouseEvent) => {
  // Remove focus on touch devices to prevent stuck hover state
  if ('ontouchstart' in window) {
    const target = e.currentTarget as HTMLButtonElement
    target.blur()
  }
  // ... rest of click handler
}
```

**Pattern for Form Submissions:**
```typescript
function handleSubmit(e: Event): void {
  e.preventDefault()
  
  // Remove focus on touch devices to prevent stuck hover state
  if ('ontouchstart' in window) {
    const target = e.target as HTMLFormElement
    const submitBtn = target.querySelector('button[type="submit"]') as HTMLButtonElement
    if (submitBtn) submitBtn.blur()
  }
  
  // ... rest of submit handler
}
```

### 2. CSS: Prevent Tap Highlights
Added WebKit-specific properties to prevent default mobile tap behaviors:

```css
.btn {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}
```

### 3. CSS: Keyboard-Only Focus Styles
Updated focus styles to only show for keyboard navigation:

```css
/* Only show focus outline for keyboard navigation */
.btn:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}

/* Prevent focus styles on touch devices */
.btn:focus:not(:focus-visible) {
  outline: none;
}
```

## Files Modified

### Shared Components
- `src/components/shared/Button.tsx` - Reusable button component
- `src/components/shared/Button.css`
- `src/components/shared/CardKeyboard.tsx` - Card selection keyboard (rank & suit buttons)
- `src/components/shared/CardKeyboard.css`

### Practice Components
- `src/components/Practice/PracticeModeSelector.tsx` - Mode selection cards
- `src/components/Practice/PracticeModeSelector.css`
- `src/components/Practice/PracticeHeader.tsx` - Back button
- `src/components/Practice/PracticeHeader.css`
- `src/components/Practice/FirstOrSecondHalf.tsx` - Answer buttons
- `src/components/Practice/ClassicQuiz.tsx` - Submit button
- `src/components/Practice/CuttingEstimation.tsx` - Submit button
- `src/components/Practice/QuartetPosition.tsx` - Submit button
- `src/components/Practice/PracticeView.css` - Shared styles (`.answer-btn`, `.submit-btn`, `.back-button`)

### Settings Components
- `src/components/Settings/StackConfigCard.tsx` - Stack selection buttons
- `src/components/Settings/StackConfigCard.css`

### Navigation
- `src/components/Navigation/Navigation.tsx` - Navigation links
- `src/components/Navigation/Navigation.css`

### Stats Components
- `src/components/Stats/BadgeDisplay.tsx` - Badge items
- `src/components/Stats/BadgeDisplay.css`

## CSS Classes Fixed

The following CSS classes received the mobile tap fix:

1. `.btn` - Shared button component
2. `.mode-card` - Practice mode selection cards
3. `.back-button` - Back button in practice header
4. `.answer-btn` - Answer buttons in FirstOrSecondHalf
5. `.submit-btn` - Submit buttons in quiz modes
6. `.nav-item` - Navigation tab links
7. `.rank-btn` and `.suit-btn` - Card keyboard buttons
8. `.badge-item` - Badge display items
9. Custom buttons in StackConfigCard

## Pattern Applied
The fix follows a consistent pattern across all interactive elements:

1. **TypeScript/JSX**: Add event parameter to handlers and implement blur logic
2. **CSS**: Add tap highlight prevention properties
3. **CSS**: Replace `:focus` with `:focus-visible` and add `:focus:not(:focus-visible)` rule

## Testing Checklist
- ✅ Practice mode selection cards
- ✅ Practice mode buttons (First/Second Half, etc.)
- ✅ Submit buttons in quiz modes
- ✅ Back button navigation
- ✅ Navigation tabs
- ✅ Settings stack buttons
- ✅ Card keyboard (rank and suit buttons)
- ✅ Badge display items
- ✅ Keyboard navigation still works
- ✅ Accessibility features intact

## Browser Compatibility
- Modern iOS Safari (12+)
- Chrome Mobile (60+)
- Firefox Mobile (60+)
- Samsung Internet (8+)

## Notes
- The `'ontouchstart' in window` check ensures the fix only applies to touch-capable devices
- Desktop keyboard navigation remains fully functional with `:focus-visible`
- Accessibility is preserved with proper ARIA labels and keyboard handlers
- Form submissions use a different pattern to find and blur the submit button
- Navigation links use a `setTimeout` to ensure blur happens after navigation

