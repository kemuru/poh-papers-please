# Slice 1 implementation evidence — 2026-09-25

Implemented one seeded application with a profile card, three procedural video frames, the transcript and blink observation, a visible day 1 rule, Accept/Challenge buttons, and decision receipts. Accept stamps the registration and plays a synthesized thunk. A wrong accept immediately prints a citation naming Rule 1 and comparing the received and required declarations; the first mistake is a warning without a fine. Challenge files the case and explicitly awaits a future hearing, as required by the design's feedback section. Replay reviews the same application.

Phrase matching checks words in order, ignoring case, punctuation and whitespace, following the user's “Words only” answer. Generated mistakes are the clear “hooman” substitution, a substantially shortened declaration, an added “Please”, or silence, following “Mostly clear”. Roughly 70% of generated applications are valid. This is a single-application generator; daily queue composition is not implemented. Dave may be costumed and valid; Gary's incorrect declaration, not his appearance, is the reason he fails.

## Try it

Run `npm run dev` and use Vite's printed local URL. The working tree currently sets the development port to 5174, an external edit that was preserved. `?seed=1` is valid Dave; `?seed=3` is Gary saying “hooman”; `?seed=2` adds words; `?seed=30` omits words; `?seed=36` is silent. The existing development portrait gallery remains at `?portraits`.

## Files changed by this implementation

| Area | Files |
|---|---|
| Shared data and decision state | `src/model.ts`, `src/game.ts` |
| Rule and generator | `src/rules/judge.ts`, `src/gen/applicant.ts` |
| Copy and phrase variants | `src/content/dayOne.ts` |
| Desk and feedback | `src/ui/App.tsx`, `src/ui/ApplicantDesk.tsx`, `src/ui/DecisionReceipt.tsx`, `src/ui/desk.css`, `src/ui/stampSound.ts`, `src/ui/useGameDebug.ts` |
| New unit tests and snapshots | `src/rules/judge.test.ts`, `src/gen/applicant.test.ts`, `src/game.test.ts`, `src/gen/__snapshots__/applicant.test.ts.snap`, `src/__snapshots__/game.test.ts.snap` |
| Browser coverage and isolated server | `e2e/slice1.spec.ts`, `playwright.config.ts` |
| Asset provenance | `public/assets/LICENSES.md` |
| Evidence | `notes/acceptance.md`, `notes/runlog.md`, `notes/slice-1.md`, `notes/evidence/slice-1-checks.txt`, the five `notes/evidence/slice-1-*.png` images linked below |

No dependencies were added. Existing tests and portrait snapshots were not edited or deleted. `vite.config.ts` was changed externally during this task; this implementation did not edit it.

## Commands actually run

[Captured results and command details](evidence/slice-1-checks.txt):

- `npm run typecheck`: passed, exit 0.
- `npm test`: 7 files and 58 tests passed, including the 500-applicant oracle, fair clues, repeatability, snapshots and module purity. The initial run created two new snapshots; the final run verified them.
- `npm run test:e2e`: 13 Chromium tests passed. Includes both buttons, all four invalid phrase variants, a valid costumed applicant, read-only debug state, keyboard decisions, mobile overflow, replay/reload, and no external browser requests during the valid-application flow.
- `npm run build`: passed; 44 modules transformed.
- `rg` across the four pure module directories: no React imports, unseeded randomness or clock reads.
- `rg -n '__game' dist/assets`: no matches; the debug hook is removed from the production bundle.
- `git diff --check`: passed.

The first browser start was blocked by sandbox port restrictions. After approved escalation, the original `reuseExistingServer` configuration connected to another implementation already on port 5173, producing 9 failures. Playwright now starts this checkout on port 5177 and refuses to reuse a server. All assertions passed with that configuration. Screenshots were recaptured with animations disabled so citation ink is shown at full opacity.

## Visual evidence

- [Desk, seed 1](evidence/slice-1-desk.png)
- [Accepted application, seed 1](evidence/slice-1-accepted.png)
- [Immediate Rule 1 citation, seed 3](evidence/slice-1-citation.png)
- [Filed challenge, seed 3](evidence/slice-1-filed.png)
- [Mobile desk at 390 px, seed 3](evidence/slice-1-mobile.png)

Desktop, citation and mobile screenshots were visually inspected. The UI uses system fonts, existing procedural portraits, CSS decoration and synthesized sound; there are no fetched assets.

## Untested and out of scope

No human playtest has established the target 90% day 1 accuracy or assessed the humor. Firefox, Safari, screen-reader behavior and physical audio output have not been tested. Chromium exercises the stamp sound code without a page error; audibility has not been checked. Production was built and inspected for debug-state removal, but was not browser-playtested separately.

Daily queues, timing, pay, fines, bills, court verdicts, appeals, rule progression and endings belong to later slices. Consequently, the Always true checks for court-result and day-total snapshots are not applicable yet. A filed challenge is intentionally pending; this slice does not simulate a court verdict.
