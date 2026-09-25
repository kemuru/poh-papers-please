# Acceptance and evidence

Fill Evidence with a commit hash, test output, screenshot path or clip. "The agent said so" is not evidence.

## Always true
| Check | Evidence |
|---|---|
| `npm run typecheck` and `npm test` pass | [Run output](evidence/slice-1-checks.txt): typecheck exit 0; 7 test files, 58 tests pass. |
| Same seed produces identical applicants, court results and day totals (snapshot test) | [Applicant snapshot](../src/gen/__snapshots__/applicant.test.ts.snap), [decision snapshot](../src/__snapshots__/game.test.ts.snap); 500-seed repeatability test in `src/gen/applicant.test.ts`. Court and day totals are outside Slice 1. |
| `src/rules`, `src/gen`, `src/court`, `src/economy` never import React or use `Math.random`/`Date.now` (grep check) | `src/purity.test.ts` passes; [rg command and empty result](evidence/slice-1-checks.txt), including `performance.now`. Court/economy have no implementation yet. |
| **Oracle check:** for 500 seeded applicants, `judge()` finds exactly the `planted` violations, no more, no fewer | `src/gen/applicant.test.ts`: “oracle: judge finds exactly the planted violations in 500 seeded applicants”; [passing output](evidence/slice-1-checks.txt). |
| **Fair clue check:** every planted violation type maps to a visible difference in the UI data (for example photo vs video frame, transcript text, vouch names, registry match) | `src/gen/applicant.test.ts`: fair-clue test over 500 seeds; `e2e/slice1.spec.ts` checks the visible transcript for typo, missing words, extra words and silence; [citation screenshot](evidence/slice-1-citation.png). |

The oracle check matters most: the generator knows the truth by construction, so it tests the rule engine without trusting the engine's own logic. The fair clue check keeps every mistake the player's fault, never the game's.

## Slice 1: one applicant
| Check | Evidence |
|---|---|
| Exact phrase is valid; typo, missing words, extra words and silence are each invalid | `src/rules/judge.test.ts`: exact declaration and all four invalid cases; case, punctuation and spacing ignored per user decision. [58 passing unit tests](evidence/slice-1-checks.txt). |
| Accepting a valid applicant shows a stamp; accepting an invalid one prints a citation that names the broken rule | `e2e/slice1.spec.ts`: seed 1 accepted, seeds 2/3/30/36 cited; [registered](evidence/slice-1-accepted.png), [Rule 1 warning](evidence/slice-1-citation.png). |
| Browser: card, video strip and both buttons render; clicking shows the result | [Desk](evidence/slice-1-desk.png), [mobile](evidence/slice-1-mobile.png), [filed challenge](evidence/slice-1-filed.png); 13 Chromium tests pass in [run output](evidence/slice-1-checks.txt). |
| Playwright: with a fixed seed, `window.__game` records the decision and outcome | `e2e/slice1.spec.ts` asserts seed, decision and outcome, repeatability after reload/replay, and deeply frozen state; [run output](evidence/slice-1-checks.txt). Production bundle has no `__game`. |

## Slice 2: one full day
| Check | Evidence |
|---|---|
| A day's queue is fully determined by its seed, with the applicant counts from the day table | |
| Every seeded day has 65 to 75% valid applicants (test over 20 seeds) | |
| Across a full run, at least 40% of absurd cast appearances are valid (test) | |
| Pay and penalties match `game-design.md`; the first mistake of each day is a warning with no fine | |
| When the shift clock runs out, unprocessed applicants cost income but no penalty | |
| Challenges are filed and resolved at the end of the shift (until slice 4, resolved by the truth) | |
| Bills screen totals match the economy module; savings carry to the next day | |
| Empty queue, loading and error states render (screenshots) | |

**Balance tests (20 seeded runs each):**
| Bot | Must | Evidence |
|---|---|---|
| Perfect | Ends every day with more savings than it started | |
| 2 random mistakes per day | Reaches the Promoted ending in most runs | |
| 5 random mistakes per day | Is Fired by day 5 in most runs | |
| Always accept | Ends below zero | |
| Always challenge | Ends below zero | |
| Judge by looks (challenges every cast character, accepts every fill-in) | Earns at most half of the perfect bot | |

## Slice 3: rulebook
| Check | Evidence |
|---|---|
| Each day's rule is active from its day onward, never before | |
| Each rule has a test with one valid and at least two invalid applicants | |
| Invalid applicants break one rule on days 1 to 3 and at most two on days 4 to 6 | |
| Inspect mode: selecting two disagreeing items highlights the discrepancy and names the rule; two agreeing items highlight nothing | |
| Registry lookup finds duplicates by face and by address | |
| Gary appears once per day with a different disguise | |
| Rules are rules: Socrates valid on day 2, invalid on day 6; Dave always valid | |
| Day 1 tutorial: the first two applicants are scripted and no ending can trigger on day 1 | |

## Slice 4: court
| Check | Evidence |
|---|---|
| Jury sizes are 3, 7, 15; there is no fourth round | |
| Court results are reproducible from the seed | |
| Fairness: when the player's challenge is correct, appealing to the last round wins in at least 95% of seeds | |
| Appeal fees and refunds match the economy config | |
| Playwright: challenge, reach the court at shift end, appeal once, see 7 jurors, see the final ruling | |

## Playtest log (people, not bots)
| Date | Who | Days played | Mistakes per day | Laughed at | Confused by | Change made |
|---|---|---|---|---|---|---|
| | | | | | | |

## Failure-injection record (Day 2)
| Defect injected | Which unchanged check caught it | Evidence |
|---|---|---|
| | | |
