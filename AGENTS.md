# Proof of Humanity: Papers, Please

A deadpan comedy desk game in the browser, satirizing Kleros's Proof of Humanity. In the week before Humanity Day, when every registered human starts receiving an income, the player is a registry clerk who accepts or challenges applicants against a rulebook that grows every day. Local only: no wallet, no chain, no network calls at runtime.

Before any gameplay or content work, read `notes/game-design.md`. Scope: `notes/brief.md`. Checks: `notes/acceptance.md`.

## Architecture (hard rules)
- `src/rules/`: `judge(applicant, rulebook, registry)` returns `{ valid, violations[] }`.
- `src/gen/`: seeded generator. Every applicant carries `planted`, the violations it was built with.
- `src/court/`: jury and appeals. `src/economy/`: pay, penalties, bills.
- These four are pure: no React, no clock, no `Math.random`. Randomness only through `src/gen/rng.ts`. Real time only in `src/ui/` animation code.
- `src/ui/` renders state and sends player actions. No game rules in the UI.
- `src/content/` holds all text: remarks, memos, rulings, Gazette. No jokes inside logic files.
- Dev and test builds expose read-only state as `window.__game`.

## Design invariants (never break)
- Every invalid applicant has one clue the player can see and check on screen, tied to one active rule.
- Only the evidence reveals validity. Never appearance, remarks, names or UI labels.
- Most applicants are valid (ratios in `notes/game-design.md`).
- Same seed, same week.

## Quality bar
- Player experience first: when tidy code and a better-feeling game conflict within these rules, choose the game.
- Every player action gets immediate feedback. No dead clicks.
- For UI changes, take a Playwright screenshot and look at it before calling the work done. Say what a new player notices in the first five seconds.
- Writing follows "Writing the jokes" in `notes/game-design.md`. If unsure a line is funny, cut it.

## Commands
`npm run dev` · `npm test` · `npm run test:e2e` · `npm run typecheck`

## Done means
Typecheck and tests pass (plus e2e if the UI changed). Report files changed, commands run with their results, and what is untested. No evidence, not done.

## Rules
- Don't edit or delete tests unless asked. If one looks wrong, stop and explain.
- New dependency: justify it in one line.
- No speculative abstractions, plugin systems or compatibility layers.
- Assets: CC0 or self-made, listed in `public/assets/LICENSES.md`. Fictional characters only.
- Ask before changing gameplay, the rulebook or a module's public API.
