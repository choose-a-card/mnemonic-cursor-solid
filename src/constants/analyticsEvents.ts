/**
 * Analytics Event Constants
 *
 * Single source of truth for all custom GA4 event names and their expected parameters.
 * Keeping them here prevents typos and makes it easy to audit what we track.
 *
 * GA4 naming convention: snake_case, max 40 chars, no spaces.
 * Parameter values: strings/numbers only, no PII.
 */

// ─── Practice ────────────────────────────────────────────────────────────────
// Mode selection/exit is tracked via automatic page views on route change
// (e.g. /practice/one-ahead, /practice) — no custom events needed.

/** User submits an answer in any practice mode */
export const PRACTICE_ANSWER_SUBMITTED = 'practice_answer_submitted'

/** User leaves a practice mode — includes duration and answer count for that session */
export const PRACTICE_SESSION_ENDED = 'practice_session_ended'

// ─── Stack ───────────────────────────────────────────────────────────────────

/** User switches to a different stack type (Tamariz, Aronson, Faro, Custom) */
export const STACK_TYPE_CHANGED = 'stack_type_changed'

/** User changes the practice card interval range */
export const CARD_INTERVAL_CHANGED = 'card_interval_changed'

// ─── Custom Stacks ───────────────────────────────────────────────────────────

/** User creates a new custom stack */
export const CUSTOM_STACK_CREATED = 'custom_stack_created'

/** User edits an existing custom stack */
export const CUSTOM_STACK_EDITED = 'custom_stack_edited'

/** User deletes a custom stack */
export const CUSTOM_STACK_DELETED = 'custom_stack_deleted'

// ─── PWA ─────────────────────────────────────────────────────────────────────

/** User clicks the PWA install button */
export const PWA_INSTALL_CLICKED = 'pwa_install_clicked'

/** PWA installation succeeded */
export const PWA_INSTALL_SUCCESS = 'pwa_install_success'

/** PWA installation was dismissed by the user */
export const PWA_INSTALL_DISMISSED = 'pwa_install_dismissed'

// ─── Settings ────────────────────────────────────────────────────────────────

/** User toggles dark mode */
export const SETTING_DARK_MODE_CHANGED = 'setting_dark_mode'

/** User toggles sound */
export const SETTING_SOUND_CHANGED = 'setting_sound'

// ─── Support ─────────────────────────────────────────────────────────────────

/** User clicks the Buy Me a Coffee button */
export const SUPPORT_CLICKED = 'support_clicked'

// ─── Consent ─────────────────────────────────────────────────────────────────

/** User accepts analytics cookies (fired once on the first session with consent) */
export const CONSENT_GRANTED = 'consent_granted'

// ─── Engagement ──────────────────────────────────────────────────────────────

/** User resets their stats */
export const STATS_RESET = 'stats_reset'
