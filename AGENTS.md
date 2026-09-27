# Proof of Humanity: Papers, Please

A comedy desk game in the browser. The player is a registry clerk for a parody of Kleros's Proof of Humanity. In the week before Humanity Day, when every registered human starts receiving an income, absurd applicants (three raccoons in a trench coat, an AI agent with a wallet, a sybil farm, Socrates) try to register as humans; the player accepts or challenges them against a rulebook that gets stricter every day. Challenges go to a jury that can be appealed. Training project for an AI-driven-development course. Local only, no wallet, no chain, no network calls at runtime.

Game design and cast: `notes/game-design.md`. Scope: `notes/brief.md`.

## Stack
TypeScript, React, Vite. No game engine. Vitest for logic, Playwright for the browser.

## Architecture rules (most important)
- `src/rules/`: the rule engine. `judge(applicant, rulebook, registry)` returns `{ valid, violations[] }`. Pure, no React, no randomness, no clock.
- `src/gen/`: the seeded applicant generator. Every generated applicant carries `planted`, the list of violations it was built with. Pure and deterministic: same seed, same applicants.
- `src/court/`: jury and appeal resolution. Pure and seeded.
- `src/economy/`: pay, penalties, bills. Pure.
- `src/ui/`: React components. They read state and send player actions. They contain no game rules.
- Never use `Math.random`, `Date.now` or `performance.now` outside `src/ui/` animation code. Use the seeded RNG from `src/gen/rng.ts`.
- Portraits are drawn procedurally from a seed (SVG or canvas). Assets: CC0 or self-made only, sources listed in `public/assets/LICENSES.md`.
- In dev and test builds, expose read-only game state as `window.__game`.

## Commands
(Created in the first scaffold. Keep these names.)
- `npm run dev`, `npm test`, `npm run test:e2e`, `npm run typecheck`

## Definition of done for any task
- Run `npm run typecheck` and `npm test`; also `npm run test:e2e` if the UI changed.
- Report: files changed, commands actually run with a summary of their output, and what is untested.
- Never claim completion without that evidence.

## Rules
- Do not edit or delete existing tests unless the task explicitly asks. If a test looks wrong, stop and explain.
- New dependency: justify it in one line in your report.
- Keep code simple. No speculative abstractions, plugin systems or compatibility layers.
- Humor lives in content files (`src/content/`), not in logic. Keep the tone deadpan and bureaucratic. It is satire of the real Proof of Humanity and Kleros, never random: every joke must be explained by a rule, a real fact or a character's want (see "Writing the jokes" in `notes/game-design.md`).
- Characters are fictional. No real people.
- If a choice changes gameplay, the rulebook or a module's public API, ask before implementing.
