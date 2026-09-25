# Run and cost log

One row per agent run. Fill it right after the run; it is hard to reconstruct later.

| # | Date | Task / slice | Start commit | Model · harness · effort | Skills / workers / memory on? | Elapsed min | My intervention + review min | Quota used (session % / weekly %) | Checks actually run | Result (accepted / rejected / partial) | Failure caught / rework | Next adjustment |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 2026-09-25 | Slice 1: one applicant | d1ed356 | GPT-6 · Codex · effort not recorded | Repo instructions; no skills or workers | Not measured | Words-only phrase and mostly-clear fakes confirmed; local server escalation approved; review time not measured | Not measured | typecheck; 58 unit tests; 13 Chromium tests; build; purity/debug rg checks; diff check | Automated checks pass; human playtest pending | Original Playwright server reuse tested another checkout on port 5173; isolated port 5177 fixed the run. Screenshot animations disabled for evidence. | [Implementation and evidence](slice-1.md); next: human playtest, then Slice 2 |

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

### Day 4: effort levels
- Task:
- Effort A vs B: accepted? complexity? review time? usage?
