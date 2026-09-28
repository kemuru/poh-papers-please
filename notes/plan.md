# Week plan

Times follow the course PDF. Readings are the R-codes in the PDF's resource section. After every agent run, add a row to `notes/runlog.md` straight away.

Clément's guidance from Slack: the aim is to become 2 to 5 times faster afterwards, not to be productive this week. "Ambitious" means ambitious to vibecode. Failing is fine if it is diagnosed. The report can slip to Monday 5 October, so a second week is available for polish.

---

## Before Day 1 (10 minutes, before reading anything)
- Fill the baseline section of `notes/next.md`: how you work with agents today. This keeps the rediscovery experiment clean.
- Create the repo, add this kit, commit.

## Day 1: rediscover and set up (7h30)

| Time | Session | What you do |
|---|---|---|
| 1h30 | Orientation (R29, R30, R31, R01, R02, R03) | Read and watch. Fill the ambition note in `next.md`. Name one old habit to retest (R02 asks). |
| 45m | Quality and plans (R04, R05, R25) | Confirm your Claude and ChatGPT plans. Find both usage meters (session and weekly). Note them in the runlog. |
| 30m | Project and acceptance | Reread `brief.md` and `acceptance.md`. Adjust anything you disagree with. Commit. |
| 1h | Harness setup (R06, cmux reading) | Install and sign in to Claude Code and Codex through your subscriptions. Ask each to inspect the repo and run a harmless command. Have one agent create the scaffold (Vite, React, TypeScript, Vitest, Playwright, the four npm scripts) and commit it. Practise a handoff between the two agents. |
| 1h | Rediscovery experiment | **Task: the procedural portrait generator** (seed in, pixel face out; same seed gives the same face; accessories like mustache and monocle). Two git worktrees from the same commit, fresh sessions, same model and effort. Run A: your old approach from `next.md`. Run B: an outcome brief (template on PDF page 19) with acceptance checks. Compare. |
| 1h45 | First vertical slice | Slice 1: one applicant, phrase rule, Accept or Challenge, verdict. Write the phrase rule and its tests together with the agent, then let it build the card and video strip UI. |
| 1h | Second harness | Give Codex the same slice 1 brief in a separate worktree from the same commit. Keep your acceptance tests out of its copy; copy them in afterwards and run them. Record unique mistakes, shared misses and any test tampering. |

**Evidence to keep:** startup command, passing tests, a screenshot of the first applicant, the slice 1 diff, two filled comparisons in the runlog.

## Day 2: prompting, grilling, verification (7h)

| Time | Session | What you do |
|---|---|---|
| 1h30 | R07, R08, R09 | Watch the grilling excerpts. Look at Papers, Please screenshots and Refero for the desk's visual direction. |
| 45m | R10 (web track: Playwright), R11, R32 | Pick your R32 cells (below). |
| 45m | Three directions of grilling (prompts on PDF page 19) | Subject: slice 2, one full day. Let the agent interview you (shift length, number of applicants, what happens at day end). Let it challenge the design (does the shift need a real-time clock?). Then interrogate it. Save one decision it changed. |
| 1h30 | Implement slice 2 | Seeded queue, economy module, bills screen, next day. |
| 1h | Inject and diagnose a failure | Break the phrase rule so "hooman" passes. Confirm the unchanged oracle check fails. Restore. Then the economic adversarial scenario: can a player farm PNK by always challenging? Write the balance tests from `acceptance.md` (lazy bots lose, a 2-mistakes-per-day bot gets promoted, a 5-mistakes-per-day bot gets fired) and tune the numbers until they pass. |
| 1h | Interface alternatives | Ask for two or three desk layouts in isolation, with empty, loading and error states. Pick one yourself, integrate it, then have a fresh session review it. |
| 30m | Development mode and handoff (R32) | Record your R32 decisions and any unfinished checks in `next.md`. |

**R32, honestly classified:** it is a game, so nothing is critical in the real-world sense.
- Rule engine: not critical, defects hard to spot (they hide in rule combinations) → **vibecode then review**, protected by the oracle check.
- UI and content: not critical, easy to spot → **vibecode and use**.
- Optional: hand-write one rule yourself and let the AI hunt for bugs in it, to try the fourth cell.

## Day 3: skills and goal loops (7h)

| Time | Session | What you do |
|---|---|---|
| 1h | R12, R13, R14 | |
| 1h | R15, R16, R17 | |
| 1h15 | Create one skill | **Skill: add-applicant.** Input: character idea plus which rule it breaks. Steps: add content, add generator variant with `planted` violation, add portrait accessory, add rule test, run checks, take a screenshot. Smoke test with three prompts: "add a sentient toaster that can't blink" (should activate), "fix the shift timer" (should not), "add a new applicant" with no violation named (should ask). Fix what misbehaves. |
| 45m | Clean context | Trim `AGENTS.md`. Retest the old habit you named on Day 1: remove it, compare on a small task, keep it only if it still prevents a real failure. |
| 1h45 | Longer goal | Slice 3 with `/goal`. Done means: days 1 to 6 rules active, morning memo, rulebook panel, registry lookup, the recurring cast, all tests passing with outputs shown. Set a deadline and a retry limit. |
| 1h15 | Interrupt and recover | Write a progress note, stop, resume from the note. Force a failing test, fix the cause, and check that the test run was not empty. Start a read-only `/loop` watching test output, observe two iterations, stop it. |

## Day 4: graphs and parallel work (8h)

| Time | Session | What you do |
|---|---|---|
| 1h45 | R18 to R22 | |
| 30m | Draw the graph | Shared contract: the `CourtCase` type (applicant, evidence or hunch, rounds, jurors, votes, fees). Commit it first. |
| 2h | Parallel workflow (slice 4) | Worker A: court engine (seeded votes, 3/7/15 appeal rounds, fees) in `src/court/`. Worker B: court screen (jurors, speech bubbles, the APPEAL button filling the screen). Integrator: Playwright test for challenge, jury, appeal, final ruling. Limits: 2 workers, 1 retry each, 90-minute deadline. |
| 1h | Force a branch failure | Break worker A's output, relaunch, record which workers reran. |
| 1h | Effort comparison | Same bounded task (the endings screen) at two effort levels, or ultracode vs high. Optional substitute: have an isolated agent reimplement `judge()` from the rulebook text alone and compare it with yours on 500 seeded applicants. Disagreements are questions to investigate. |
| 1h | Multitasking (R26, R27, R28) | Two independent workstreams in separate worktrees: (a) the bills screen jokes and styling, (b) five new applicants via the add-applicant skill. Keep a small task list (owner, state, next action, evidence). |
| 45m | Save and review provenance | |

## Day 5: routine, wrapper, capstone, report (7h)

| Time | Session | What you do |
|---|---|---|
| 1h | R23, R24 | |
| 1h15 | Routine | **Balance report:** plays 20 seeded runs with every balance bot from `acceptance.md` and writes `reports/balance-<content-hash>.md` (earnings per bot, which rules fired, which applicants were hardest). Run twice on the same input: identical file, no duplicate. Add one applicant and run again: the report changes. Disable any schedule at the end. |
| 45m | CLI wrapper | `scripts/new-applicant`: takes a joke idea, calls `claude -p` with JSON output (subscription login, not `--bare`) under an outer timeout, validates the JSON, runs `judge()` to confirm the planted violation is detected, then writes `src/content/applicants/<id>.json`. Show one success and one malformed result being rejected. |
| 2h30 | Capstone | The held-back feature, from a fresh brief to an accepted change. Implement with one provider, review with the other in a fresh session given only the task, diff and acceptance criteria. Then inspect it yourself. |
| 1h | Report and operating plan | See below. |
| 30m | Cleanup | Stop routines and loops, remove temporary credentials and worktrees, check actual usage and spend. |

## Second week (optional, until Monday 5 October)
Day 7 finale and endings (slice 5), coming back (slice 6), visual polish, and a playtest with colleagues. Log what they found funny and what confused them. Try one method from the course you skipped or want to repeat.

---

## Report map (400 to 700 words, PDF page 20)
| Report item | Comes from |
|---|---|
| Project and accepted result | Capstone plus the playable build |
| One rediscovery | Day 1 portrait generator comparison |
| Current setup and spend | Day 1 plans plus the runlog |
| Grilling decision | Day 2 |
| Tested skill | Day 3 add-applicant |
| Goal or recovery | Day 3 |
| Graph or Ultra decision | Day 4 |
| Routine result | Day 5 balance report |
| Multitasking decision | Day 4 |
| Failure caught and next step | Oracle check or balance test catches, plus Day 2 injection |

## Operating plan (half page)
Your two plans and which one reviews, model and effort routing by task type, what goes in `AGENTS.md` versus skills, when a graph helped, what evidence you require before accepting, your concurrency limit, a weekly maintenance habit and the next review date.
