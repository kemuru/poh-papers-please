# Run and cost log

One row per agent run. Fill it right after the run; it is hard to reconstruct later.

| # | Date | Task / slice | Start commit | Model · harness · effort | Skills / workers / memory on? | Elapsed min | My intervention + review min | Quota used (session % / weekly %) | Checks actually run | Result (accepted / rejected / partial) | Failure caught / rework | Next adjustment |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-28 | Habit A: add a fill-in who works nights and says the phrase mid-yawn, add-applicant skill, then my audit prompt | 83f8477 | Opus 5.5 · Claude Code 2.1.283 headless (`claude -p`, auto mode) · xhigh | add-applicant skill; no workers | 13.0 build + 5.5 audit = 18.5 | 2 replies (validity, OK to re-pin seeds), same text as B | not measured headless; $4.71 API cost ($3.63 build + $1.08 audit) | typecheck, 126 unit, 21/21 e2e (agent, then rerun by me) | accepted, not merged (B won) | audit: 1 stale seed line in the skill doc; no code defect | see "Habit comparison" |
| 2 | 2026-09-28 | Habit B: same task, no audit prompt | 83f8477 | same as #1 | same as #1 | 13.7 | same 2 replies as #1 | not measured headless; $3.60 API cost | typecheck, 126 unit, 21/21 e2e (agent, then rerun by me) | accepted, merged | none caught; 2 small misses found in review (see below) | see "Habit comparison" |

## Comparisons
Record each comparison separately so the report can link to it.

### Day 1: rediscovery (old approach vs outcome brief)
- Same commit, same model and effort, fresh sessions, separate worktrees.
- Run A (old approach):
- Run B (outcome brief):
- What differed:
- Did I change my mind?

### Day 1: Claude Code vs Codex (setup comparison, not a pure model comparison)
- Unique mistakes (Claude):
- Unique mistakes (Codex):
- Shared misses:
- Test tampering or leaked answers seen?

### Habit comparison: my audit prompt vs none (2026-09-28)
- Same commit (83f8477), same model and effort, fresh sessions, separate worktrees, run one after the other (both e2e suites need port 5175). Both got the same task sentence and the same two replies. A then got my habit prompt, word for word: "audit the changes. are you sure this would not produce any unwanted side effects? actually confirm this, critical, if yes, why? if no, fix the side effects".
- Run A (with habit): built Denise Dozier (valid, hi-vis vest) in 13.0 min for $3.63. The audit added 5.5 min and $1.08 (+42% time, +30% cost).
- Run B (without): built Dawn Hollis (valid, sleep mask) in 13.7 min for $3.60.
- Did the habit catch anything real? One thing, and it was small: the skill doc still named seed 1 for the slice2 test after the seeds moved. B left that line stale too. Everything else was a check that came back clean or an expected effect:
  - The portrait refactor was pixel-identical over 64k renders.
  - The default week reshuffles (seed 1 changes).
  - The other regulars come in less often.
  - "(yawns)" appears only on a valid character. The audit said that isn't new, since every regular is valid.
- What the audit missed in A:
  - `cast.test.ts` passes an empty registry to `judge()`, not the oracle's. This is harmless while only the phrase rule exists.
  - The e2e edits rewrote two expected lines and moved HOOMAN from day 6 to day 2. The audit called them equivalent.
- What review found in B, with no audit to catch it:
  - The `slice2.spec.ts` comment still says "Seed 1, day 1".
  - Video 2 yawns inside a word ("regis... (yawns) Sorry. Registered"), against its own "never inside one" comment. It is still valid, because the whole word follows.
- B's test edits were the smaller ones: seed numbers only, with the exact lines kept.
- Outside git: B saved a memory note (`e2e-seed-repick-cost.md`) into this project's shared memory. It is accurate, so I kept it.
- Caveats: one sample of each, and the two runs built different characters. They ran headless, so the time is the CLI's own measure and quota % wasn't visible. The cost is the CLI's API-price figure. A first attempt on Sonnet 4.5 (the old nvm `claude` 2.0.24 default) was stopped and discarded.
- Did I change my mind?

### Day 4: effort levels
- Task:
- Effort A vs B: accepted? complexity? review time? usage?
