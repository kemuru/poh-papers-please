# Slice 3 progress (goal: every Slice 3 + Always-true row in notes/acceptance.md passes)

Baseline at start: typecheck clean, 126 unit tests pass, commit f3c9721 (main).

## Forced by the design's numbers (decisions)
- Fakes per day are fixed by the 65-75% band: [2,2,2,2,3,3,2]. Gary + Pat fill days 1-4, so
  other offenders only get the extra slots on days 5-7. Day 5 extras = Sybil Farm cousins 2, 3
  (so the Farm is three cousins, not four). Day 6/7 extras come from a pool of offender kinds.
- Pat day 1 = the tutorial "hooman" (day 1 must stay 3 of 5 valid).
- Day 1 queue: [tutorial valid (cast null), Pat, Gary, 2 valid]. Gary at index 2 (first half).
- Regulars appear at most once a week (registry remembers + duplicates from day 5). Ethel on day 1.
- Socrates only days 1-5 in generated weeks; day-6 invalidity is tested on the rule.
- Doug (registered at Window 7) withdraws at start of day 6 so Gary day 6 breaks only Living.
- Challenge reason = inspect finding for this applicant, else the open rulebook page.
- Gazette lies on the blotter before the window opens (no extra phase: keeps e2e flows).

## Test edits needed (list in the report)
- oracle/fairClue/cast/balance: pass the correct-play registry instead of [].
- oracle "not vacuous": phrase mistakes only; cast set.
- day.test regulars filter; Gary videos no longer all phrase faults.
- slice1 seeds (CHATTY/HOOMAN/SILENT) re-pick; slice2 day-1 pattern + warning/fine order.

## Status
- [x] types + rules + registry + inspect (unit tests pending)
- [x] generator + content (oracle clean over 200 seeds)
- [x] court + week state
- [x] gazette
- [x] UI first pass (screens checked days 1-6)
- [x] unit tests: 21 files, all pass after labels fix (Duplicate Close street; face lookup reworded)
- [x] e2e: slice3.spec 6/6; slice2 two tests adjusted to scripted day 1; slice1 CHATTY=2155315 d3, SILENT=5 d7
- [ ] HOOMAN seed (day 7 only): search running in scratchpad/search, watcher bsdoifmu5
- [ ] screenshots, acceptance.md evidence
