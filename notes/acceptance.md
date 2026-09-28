# Acceptance and evidence

Fill Evidence with a commit hash, test output, screenshot path or clip. "The agent said so" is not evidence.

## Always true
| Check | Evidence |
|---|---|
| `npm run typecheck` and `npm test` pass | 2026-09-28, slice 3, after the robots, the lookups, the polish pass and the audit: typecheck clean; `npm test` 22 files, 223 tests passed; `npm run test:e2e` 43 passed |
| No UI label states a rule result (e.g. "Blink detected"); the player must find it in the evidence | "Blink detected" removed from the video strip. `src/ui/labels.test.tsx`: the rendered form, video printout and registry answers of all 530 applicants of 10 weeks contain no result word; `e2e/slice3.spec.ts` checks the papers of every applicant its `stamp` helper stamps in the browser |
| Nothing but the evidence tells: a unit's address is on the same streets as everyone's, and a voucher registered before the week or during it says nothing about the papers | `src/gen/day.test.ts` "gives the units ordinary addresses…" and "lets no voucher say whether the papers are good…" (300 weeks: the valid share with a town voucher and with a week's registrant within 10 points); `src/gen/portrait.test.ts` "opens each day's unit on bare skin, whole…" (no panel on hair, eyes, nose, mouth or clothing, where it could pass for something worn) |
| Scoring uses judge() against the live registry: an applicant vouched for by a fake the player accepted earlier is valid | `src/replay.test.ts` "scoring against the live registry" (through the UI reducer, both ways, plus a face registered earlier coming back as a duplicate); `e2e/slice3.spec.ts` "a week at the desk": the day 3 unit let in, and on day 6 the applicant it vouches for is accepted with no citation. `notes/evidence/slice3/live-registry-vouch.png` |
| Same seed produces identical applicants, court results and day totals (snapshot test) | `src/replay.test.ts` "same seed, same week": two whole runs (seeds 1 and 2) through the UI reducer, snapshot in `src/__snapshots__/replay.test.ts.snap` |
| `src/rules`, `src/gen`, `src/court`, `src/economy` never import React or use `Math.random`/`Date.now` (grep check) | `src/purity.test.ts` covers every source file there, including slice 3's new ones (`src/rules/*`, `src/court/court.ts`, `src/gen/gazette.ts`, `src/gen/lines.ts`) |
| **Oracle check:** for 500 seeded applicants, `judge()` finds exactly the `planted` violations, no more, no fewer | `src/oracle.test.ts`: 530 applicants, each judged against the registry it finds at the window under correct play (`planWeek().seen`) |
| **Fair clue check:** every planted violation type maps to a visible difference in the UI data (for example photo vs video frame, transcript text, the sign vs the form, the voucher, a registry match) | `src/fairClue.test.ts`: a clue per rule from what the desk draws (bare-face pixels photo vs frame, mirrored included; the visible characters of the sign vs the form; the registry lookup of the voucher and of the face; the printed year and closed eyes in a frame); every kind over 300 weeks. `src/rules/inspect.test.ts`: every fault is catchable with two things on the desk |
| No line from a content pool is shown twice in one run: remarks, names and addresses (slice 2); memos, rulings and Gazette items (from slice 3) | `src/replay.test.ts` "no line from a content pool twice in one run": four clerks (careful, sloppy, always accept, always challenge) over 8 seeds each; `src/gen/lines.ts` draws pools without replacement |

The oracle check matters most: the generator knows the truth by construction, so it tests the rule engine without trusting the engine's own logic. The fair clue check keeps every mistake the player's fault, never the game's.

## Slice 1: one applicant
| Check | Evidence |
|---|---|
| The key words of the phrase, in order, are valid, whatever else is said before, after or in between and whatever small words are swapped or left out; a missing or swapped key word, a typo in one, and silence are each invalid | `src/rules/phrase.test.ts` (key words in order; small words swapped or left out; asides, typos, a swapped or missing key word, silence) and `src/oracle.test.ts` (every phrase mistake the generator plants) |
| Accepting a valid applicant shows a stamp; accepting an invalid one prints a citation that names the broken rule | `e2e/slice1.spec.ts` "accepting a valid applicant stamps the card and prints no citation…" and "accepting an invalid applicant prints a citation that names the rule and marks only the wrong word". `notes/evidence/slice2/accept-valid.png`, `accept-invalid.png` |
| Browser: card, video strip and both buttons render; clicking shows the result | `e2e/slice1.spec.ts` "the desk shows the profile card, the video strip, the rulebook and both stamps"; `e2e/slice2.spec.ts` "a stamp comes down when pressed, not when let go, once; a focused stamp still answers Enter" and "the lever pulled straight after a wrong stamp is kept until the citation is out…" (a citation is never cleared unseen; the pull still goes through). `notes/evidence/slice2/desk.png` |
| Playwright: with a fixed seed, `window.__game` records the decision and outcome | `e2e/slice1.spec.ts`: every test pins a seed and reads the decision and outcome from `window.__game` (read-only: the exposed state is frozen) |

## Slice 2: one full day
| Check | Evidence |
|---|---|
| A day's queue is fully determined by its seed, with the applicant counts from the day table | `src/gen/day.test.ts` "gives the same week for the same seed…" and "has the applicant counts of the day table: 5, 7, 8, 8, 9, 10, 6"; `e2e/slice2.spec.ts` "the same seed gives the same queue…" |
| Every seeded day from day 2 has 65 to 75% valid applicants (test over 20 seeds); day 1, the scripted tutorial, has 3 of 5 | `src/gen/day.test.ts` "keeps 65 to 75% of each day valid (day 1: 3 of 5…)" |
| Across a full run, at least 40% of absurd cast appearances are valid (test) | `src/gen/day.test.ts` "makes at least 40% of the absurd cast appearances valid, across full weeks" |
| Pay and penalties match `game-design.md`; the first mistake of each day is a warning with no fine | `src/economy/economy.test.ts` "pay and penalties"; `e2e/slice2.spec.ts` "the first fake registered each day is a warning; the next is a fine". `notes/evidence/slice2/citation-fine.png` |
| When the shift clock runs out, unprocessed applicants cost income but no penalty | `e2e/slice2.spec.ts` "when the clock runs out, whoever is left goes home: no penalty, only lost income"; `src/economy/economy.test.ts` "charges nothing for applicants who went home unprocessed". `notes/evidence/slice2/time-up.png` |
| Challenges are filed and resolved at the end of the shift (until slice 4, resolved by the truth) | `e2e/slice1.spec.ts` "challenging files the case for the court at the end of the shift"; `e2e/slice2.spec.ts` "a full day…"; `src/court/court.test.ts`. `notes/evidence/slice2/court.png` |
| Bills screen totals match the economy module; savings carry to the next day | `src/economy/economy.test.ts` "bills" and "endDay"; `e2e/slice2.spec.ts` "a full day: the court hears the challenges, the statement adds up, savings carry to day 2". `notes/evidence/slice2/statement.png` |
| Empty queue, loading and error states render (screenshots) | `e2e/slice2.spec.ts` "if anything breaks, the window closes politely instead of going blank". `notes/evidence/slice2/closed.png` (window closed, nobody waiting), `error.png`. No loading state: the week is generated before the first frame |

**Balance tests (20 seeded runs each):**
| Bot | Must | Evidence |
|---|---|---|
| Perfect | Ends every day with more savings than it started | `src/economy/balance.test.ts`. Measured 2026-09-28: every evening above the one before; the week ends at 390 to 406 from 240 |
| 2 random mistakes per day | Reaches the Promoted ending in most runs | `src/economy/balance.test.ts`. Measured 2026-09-28: 19 of 20 promoted, ending about 60 on average |
| 5 random mistakes per day | Is Fired by day 5 in most runs | `src/economy/balance.test.ts`. Measured 2026-09-28: fired on day 3 in 20 of 20 |
| Always accept | Ends below zero | `src/economy/balance.test.ts`. Measured 2026-09-28: fired on day 6 or 7 in 20 of 20 |
| Always challenge | Ends below zero | `src/economy/balance.test.ts`. Measured 2026-09-28: fired on day 3 in 20 of 20 |
| Judge by looks (challenges every cast character, accepts every fill-in) | Earns at most half of the perfect bot | `src/economy/balance.test.ts`. Measured 2026-09-28: fired on day 6 or 7 in 20 of 20 |

## Slice 3: rulebook
| Check | Evidence |
|---|---|
| Each day's rule is active from its day onward, never before | `src/rules/rules.test.ts` "the rulebook, day by day" |
| Each rule has a test with one valid and at least two invalid applicants | `src/rules/rules.test.ts`: per rule, a valid applicant plus look-alikes, and 2 to 4 offenders each breaking only that rule under the whole rulebook |
| Each rule has at least three kinds of offender and one valid look-alike in the content (test) | `src/gen/week.test.ts` over 200 weeks: human 4, phrase 4, photo 3, sign 4, vouch 3, duplicate 4, living 3 kinds; look-alikes for every rule, all judged valid |
| Every invalid applicant breaks exactly one rule, on every day (the Agent and the Cutout break Rule 0 as well) | `src/gen/week.test.ts` "has every invalid applicant break exactly one rule, and a non-human Rule 0 as well" (20 weeks, judged against the registry at the window) |
| Inspect mode: selecting two disagreeing items highlights the discrepancy and names the rule; two agreeing items highlight nothing | `src/rules/inspect.test.ts` (17 disagreeing pairs, two frames of a picture held up among them; every agreeing pair; and over 40 weeks, every fault on every fake found by some pair and nothing else); `e2e/slice3.spec.ts` "inspect mode" (Pat's mirror selfie under Rule 2, the day 2 unit's open jaw under Rule 0) and the day 1 guided inspect. `notes/evidence/slice3/inspect-photo.png`, `inspect-machine.png`, `day1-guided-inspect.png` |
| A challenge names no rule: it is upheld when the applicant broke any rule in force, with every rule broken in the ruling, and dismissed when they broke none | `src/court/court.test.ts` "a challenge names no rule"; `e2e/slice3.spec.ts` "a challenge names no rule…" (seed 1, day 2: both fakes upheld with their rules, a valid applicant dismissed; no grounds anywhere). `notes/evidence/slice3/court.png` |
| Registry lookup finds a voucher by name (and whether they are already vouching for someone) and a duplicate by face | `src/court/court.test.ts` "registry lookup"; `e2e/slice3.spec.ts` "the registry lookup…" (Pat's mother not registered; Ethel vouching for Maureen Oakes; the day 5 unit's face on file as Nina Penrose, at Window 7) and each tool the day its rule arrives: "the voucher is one click, or one key, from the registry the day Rule 4 arrives…" (V and the button beside the voucher, the name in the search box, the button keeping no focus, no face search yet) and "the face is one click, or one key, from the registry the day Rule 5 arrives…" (F and the button on the printout). On the first applicant of those days a line under the papers names the new tool and its key, Inspect does not glow, and the line goes when that tool is used: V leaves day 5's line, F clears it, and the second applicant never gets it. `notes/evidence/slice3/registry-voucher.png`, `registry-face.png`, `lookup-buttons.png`, `day4-tip.png`, `day5-tip.png` |
| The registry remembers: an applicant accepted earlier in the week is found by the lookup; an upheld challenge removes the applicant's voucher | `src/court/court.test.ts` "the registry remembers"; `e2e/slice3.spec.ts` "a week at the desk" (day 1 and day 3 registrants found on day 4; Wendell Binns removed with his unit on day 5, gone on day 6). `notes/evidence/slice3/registry-remembers.png` |
| From day 2, the morning Gazette reports at least one of yesterday's actual decisions and gives the reason for the day's new rule | `src/replay.test.ts` "the morning Gazette" (6 whole runs); `e2e/slice3.spec.ts` "a week at the desk" (day 2 names a day 1 registrant, gives Rule 2's reason; day 4 leads with the unit let in on day 3). `notes/evidence/slice3/gazette-day2.png` |
| Scripted appearances (the unit, Pat, the day's set piece) come in the first half of the queue | `src/gen/week.test.ts` "brings the unit, Pat and the day’s set piece in the first half" |
| A Likeness unit comes once a day on days 1 to 6, with a new face each day and a flawless photo, and breaks one rule: skin open onto machinery in one frame (Rule 0), its maker's vouch on day 4, its factory face on file on day 5 | `src/gen/week.test.ts` "sends a Likeness unit once a day…", `src/gen/day.test.ts`, `src/gen/portrait.test.ts` (an android is drawn exactly as a human; every panel visible); `e2e/slice3.spec.ts` "inspect mode" (day 2) and "the registry lookup…" (day 5). `notes/evidence/rule0/unit-day1.png`, `unit-day3.png` |
| Rule 0, a real human, is in force from day 1: skin open onto machinery, a face that changes between frames, a picture held up, or a video generator's mark in the video breaks it; anything worn, painted or carried does not | `src/rules/rules.test.ts` "Rule human" (skin open onto machinery, ears that change, a generated video, a printed face held up; Dave's costume robot head and a twin filmed beside them valid) and "the rulebook, day by day"; `src/gen/portrait.test.ts` "draws a unit's open panel that reads on every skin tone, in any colour vision" (3:1 contrast on every skin); `src/rules/inspect.test.ts`; `src/fairClue.test.ts`; `e2e/slice3.spec.ts` "the rulebook has a page per rule in force" (Rule 0's page, key 0, fits). `notes/evidence/rule0/` |
| Pat breaks the newest rule on each visit on days 1 to 4 and is valid on day 6 | `src/gen/week.test.ts` "sends Pat on days 1 to 4…" (and Pat's mother three places behind on day 4) |
| Rules are rules: Socrates valid on days 1 to 5, invalid on day 6; Dave always valid; the second Twin valid only when filmed with the first | `src/rules/rules.test.ts` "rules are rules" |
| Day 1 tutorial: the first two applicants are scripted and no ending can trigger on day 1 | `src/gen/week.test.ts` (same two every week; no ending on day 1); `e2e/slice3.spec.ts` "day 1…" with the guided inspect. `notes/evidence/slice3/day1-welcome.png`, `day1-guided-inspect.png` |

## Slice 4: the jury
| Check | Evidence |
|---|---|
| Jury sizes are 3, 7, 15; there is no fourth round | |
| A challenge made right after Inspect found a discrepancy on that applicant carries it as evidence (the case slip names it) and the first jury upholds it, in every seed | |
| On a hunch, jurors find a real fault with a chance set by how visible it is; no juror ever finds a fault in a valid applicant | |
| Fairness: a correct hunch appealed to the last round wins in at least 95% of seeds; a wrong one never wins | |
| Court results, appeals included, are reproducible from the seed | |
| Appeal fees (10, 20), refunds and the 10 PNK bonus match the economy config | |
| Balance: a clerk who never inspects (hunches only, appealing when sure) ends the week behind a careful one and ahead of 2 mistakes a day | |
| Every ruling names every rule broken and the things that disagree | |
| A juror can be drawn more than once in a case, with one vote per draw | |
| Playwright: a hunch dismissed, appealed once, 7 jurors, the final ruling; a case with evidence shows no appeal; a court with no appeals reads in under 30 seconds | |

## Slice 5: Humanity Day and the endings
| Check | Evidence |
|---|---|
| Day 7: the last unit's papers pass Rules 1 to 6, and only one small opening in one frame catches it | |
| Day 7: the last applicant is the clerk, whose video says "a real clerk" | |
| Day 3: Likeness's offer is on the desk with the Gazette; signed, each unit registered pays 40 PNK the next morning; handed in, a 30 PNK commendation and a different day 4 Gazette | |
| Replaced: three units registered in one week, signed or not | |
| Each ending (Fired, Replaced, Promoted, Reclassified) is reachable by a scripted run (Playwright) | |
| The Promoted letter reports Window 3's week from the run's own decisions (humans registered, fakes registered, Pat) and grades the clerk; a signed offer adds Likeness's job letter | |
| The game saves at the end of each day and continues after a reload | `e2e/save.spec.ts` (saves after every step, not only each evening: a reload mid-shift, the clock stopped by the menu and picked up after a reload, start today again, a new week, a save that can't be kept) and `src/ui/save.test.ts` |

## Slice 6: coming back
| Check | Evidence |
|---|---|
| Title card: Continue (with where the save is), New week, Today's week, endings found | |
| Today's week: the same date always gives the same seed, and different dates different weeks (test) | |
| "Copy my week": one row per day, the ending and the savings, and no applicant's name (test) | |
| Go back to any earlier morning of the week from the menu; the week plays on from there | |
| The clerk's record and the endings found survive a reload and a new week | |
| Endless shift (if built): unlocked by an ending; three citations end it; the best count is kept | |
| The open panels read through a colour-blind filter (screenshots); single-key shortcuts can be turned off | |

## Playtest log (people, not bots)
| Date | Who | Days played | Mistakes per day | Laughed at | Confused by | Change made |
|---|---|---|---|---|---|---|
| | | | | | | |

## Failure-injection record (Day 2)
| Defect injected | Which unchanged check caught it | Evidence |
|---|---|---|
| | | |
