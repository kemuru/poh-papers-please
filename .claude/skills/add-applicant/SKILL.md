---
name: add-applicant
description: Adds one new character to the applicant cast of this game (Proof of Humanity, Papers Please), end to end - content lines, a generator variant, a portrait accessory, a rule test, the checks, screenshots and a commit. Use when asked to add, create or bring back an applicant, character or cast member, e.g. "add a sentient toaster that can't blink" or "add an applicant who looks like a sybil but is valid". Asks first when the idea or its validity is missing. Not for bug fixes, the shift timer, UI work, new rules or changes to existing characters.
argument-hint: "<idea> [valid | breaks <rule> | valid until <rule>]"
---

# Add an applicant

One new character in the cast, from idea to commit. The request: $ARGUMENTS (if empty, it is the user's last message).

Read first: `AGENTS.md`, and in `notes/game-design.md` the sections "Funny is not the same as fake", "Daily rulebook", "Recurring cast" and "Writing the jokes".

## 1. Have both inputs, or ask
You need:
- **The idea:** who they are, and what they want from the registry (the income, or only the stamp).
- **Their validity**, one of:
  - *invalid*: breaks exactly one rule, named, or described by a fault that belongs to one rule in the rulebook table ("can't blink" is Living, day 6);
  - *valid*: breaks nothing; an absurd look that punishes a paranoid clerk;
  - *valid until a rule catches them*: valid before that rule's day, invalid from it (like Socrates).

If either is missing or ambiguous, ask (AskUserQuestion) and stop. Never invent the idea or choose the validity yourself. Offer the validity options with the numbers from step 2.

Also stop and ask, in the same question where you can, when:
- **The rule is not in the code yet** (`RuleId` in `src/rules/types.ts`). A new rule changes the rulebook: that is slice work, and AGENTS.md says to ask. Offer: wait for the rule, or break a rule already in force.
- **The fault cannot be seen at the desk:** in the transcript, the video frames (a blink is closed eyes in a frame; no label says so), the form, the sign, the voucher or a registry match. The window remark does not count; no rule reads it.
- **They need a new species or body.** Only human faces are drawn (an `android` is drawn exactly as a human); this skill adds one accessory, not a species or a body.
- **The joke does not resolve:** a rule, a real registry or Kleros fact, or the character's want must explain it. Characters cut on 26 Sep 2026 (the Toaster and others) come back only on those terms. No real people.

## 2. Decide validity against the ratios
Run `node ${CLAUDE_SKILL_DIR}/scripts/week.mjs`. Over the 20 seeds the tests use, it prints each day's valid share, the cast's valid share and each cast member's appearances.

The targets (game-design.md):
- Each day is 65 to 75% valid; day 1, the scripted tutorial, is 4 of 6, and day 7 is 4 of the 6 in the queue before the clerk's own renewal. The counts are fixed in `DAYS` (`src/gen/day.ts`) and a character never changes them: they take a fill-in's place, a fake's if invalid, a valid one's if valid.
- Roughly half of the absurd cast appearances are valid (the test's floor is 40%). Appearance never gives the answer.
- An invalid applicant has exactly one fault, on every day they appear, under every rule in force that day. A non-human (a machine, a generated person or avatar, a picture) is caught only by what its video shows: a light of its own (a Likeness unit's lamp between the brows, lit in the frames where its eyes are shut) or a face that changes between frames breaks Rule 2, the face; a generator's mark ✦, or three identical frames with no blink (a picture held up), breaks Rule 6, living. Before Rule 2 arrives on day 2 a light breaks nothing: day 1's unit is legal. Only the Agent breaks a second rule; the Cutout breaks Rule 6 alone. Anything worn, painted or carried never counts: a costume is how they look, not what they are.
- Each rule wants three kinds of offender and one valid look-alike. Say which this character is.

If the requested validity would take the cast share under about 50% or a day out of its band, ask, with the numbers and the alternative (the other validity, or fewer appearances). Otherwise state the decision in one line before editing, e.g. "Toaster: invalid on day 6, breaks Living (no blink: no frame shows closed eyes). Cast valid 66% to 62%."

## 3. Content (`src/content/`)
All humor lives here. Logic files get none.
- **Form and lines** in `cast.ts`. A valid character is a `REGULARS` entry shaped like Brenda's: name, address, birth year, portrait, `videos`, seven `remarks` (a regular comes once a week, and the seed picks which one they say) and both `exits`. An invalid character sits beside the other invalid cast's content (`UNITS`, `UNIT_EXITS`, `AGENT`, `DEEPFAKE`, `CUTOUT`, `CLONE`): the lines for the days they appear, with the fault in the evidence, never in the lines.
- **Portrait** in `portraits.ts` (`CAST_PORTRAITS`), built from existing parts plus the new accessory. Add the id to `CastId` in `cast.ts`, and to `RegularId` (a written-out list) only if the character is valid.
- **Court line** in `verdicts.ts` (`CAST_RULINGS`, which the typecheck demands): why they were right if valid, what the court found if invalid.
- **UI hooks:** follow the typecheck. `Shift.tsx` picks exit lines by cast id and `src/ui/week.ts` (`courtNote`) court lines; every place that special-cases `'unit'` is a place to check.
- **What the tests enforce:** every video fits two lines of 60 characters; a valid video passes every rule in force (it says the phrase word for word); no remark repeats within a week; nobody's name or address clashes with a fill-in's (a character outside `REGULARS` goes into `CAST_NAMES` in `day.ts`, which `planWeek` reserves).
- Don't add `REMARKS.accessory` lines for the new accessory. Fill-ins never wear it, so the "can all come up" test would fail. The character's own remarks may mention it.
- **Tone:** deadpan and sincere. They want the income or the stamp and never do a bit. No memes, crypto slang or chatbot phrasing. Check each line against the seven tests in "Writing the jokes".

## 4. Generator variant (`src/gen/`)
- **Valid:** the `REGULARS` entry is the variant. `generateWeek` already rotates regulars through the week.
- **Invalid:** a function beside `unitOn` in `day.ts` that builds them on their day or days, with `planted: [{ rule, mistake }]` naming exactly the fault and the clue in visible data (e.g. `video.blinked: false`). They replace one of the day's fake fill-ins (the day's fixed fakes are counted against `plan.fakes`), so the day's ratio holds. Scripted appearances belong in the first half of the queue.
- The units, Pat, the Influencer, the Agent, the Cutout, the Deepfake and the Clone (`day.ts`) are the patterns. If `Planted` cannot describe the fault, the generator's API changes: show the smallest change and ask before writing it (AGENTS.md).
- Pure and seeded: no `Math.random`, `Date.now` or `performance.now` (the purity test checks).
- If the code has moved on since this skill was written, follow the pattern it uses now. The constraints still hold.

## 5. Portrait accessory (`src/gen/`)
- Append the name to `ACCESSORIES` in `portrait.ts`. `generatePortrait` never rolls it (fill-ins wear only glasses, earrings and pearls).
- Colours go in `PROPS` in `portraitParts.ts`, with a stamp there if it is pixel art.
- Draw it in `drawAccessories` (`drawPortrait.ts`), placed from the anchors (`eyeY`, `browY`, `mouthY`, `chin`, `head`, `neckHalf`) so it fits any head. The test wants at least 4 visible pixels on 60 random heads and on the unit faces.
- Never cover the eyes or the mouth: every cast portrait must still show a blink and an open mouth (tested).
- Nothing point-like between the brows (a bindi, a gem, a sticker): that is where a unit's lamp shows (game-design.md, "Funny is not the same as fake").
- Self-made only. Anything external must be CC0 and listed in `public/assets/LICENSES.md`.
- The accessory is how they look, not the proof. Unless the rule is about the photo, it is not the clue.

## 6. Rule test
Add, never modify (AGENTS.md): append one `describe('<Name>')` block to `src/cast.test.ts`, beside `oracle.test.ts` (Dawn Hollis's block is the pattern). Over seeds 1 to 20:
- they come in at least once, so the other checks are not vacuous about them;
- on every appearance, `judge()` finds exactly the planted rules, given the applicant without `planted` and `cast`, the rulebook of that day and the registry as the oracle check builds it; `valid` is `planted.length === 0`;
- invalid: exactly one planted violation, and the same applicant with only the clue repaired (e.g. `blinked: true`) is valid, so the clue is the whole fault;
- valid until a rule: valid on every day before that rule's day, invalid from it for that rule alone.

## 7. Run the checks
1. `npm run typecheck`, then `npm test`.
2. `npm run test:e2e`. First check who owns port 5175: `lsof -nP -iTCP:5175 -sTCP:LISTEN`, then `lsof -p <pid> | grep cwd`. Playwright reuses any server there, which may be another worktree's. If it isn't this worktree, stop and ask.
3. `node ${CLAUDE_SKILL_DIR}/scripts/week.mjs <castId>`: the ratios are still in their bands and the character turns up.

Expect one kind of failure. A new character shifts every seeded week, since the generator draws once per cast member, so tests pinned to a seed can fail with nothing broken: `e2e/slice1.spec.ts` says so ("changed: pick another"), and `e2e/slice2.spec.ts` expects a particular queue on seed 7, day 1. Don't edit them. Find seeds that recreate each situation (a few lines using `generateWeek`), then ask before changing the tests, listing each change.

Any other failure, balance bots included, is the character's: fix the character, never the test. If a test looks wrong, stop and explain.

## 8. Screenshot
Run `node ${CLAUDE_SKILL_DIR}/scripts/screenshot.mjs <castId>`. It runs its own dev server on a free port, finds the character's earliest place in seeds 1 to 50, stamps everyone before them by the rulebook, and writes to `notes/evidence/applicants/<castId>/`:
- `desk.png`: the character at the window;
- `citation.png` (invalid only): the clerk accepted them and the slip names the rule;
- `lab.png`: the portrait lab, with the accessory on a random face and the cast.

Open the images and look: the accessory shows, the clue can be read at the desk, and nothing overlaps or is cut off.

## 9. Report and commit
- Report as AGENTS.md asks: files changed, commands run with a summary of their output, what is untested, and the validity decision with the ratios before and after. No new dependency is expected; justify any.
- Commit only when every check passes and no question is open. Stage only this character's files and its evidence folder (never `git add -A`). Message: `feat(cast): add <Name>`, one body line on their validity and clue, and the attribution trailer your harness asks for.
