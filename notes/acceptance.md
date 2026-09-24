# Acceptance and evidence

Fill Evidence with a commit hash, test output, screenshot path or clip. "The agent said so" is not evidence.

## Always true
| Check | Evidence |
|---|---|
| `npm run typecheck` and `npm test` pass | |
| Same seed produces identical applicants, court results and day totals (snapshot test) | |
| `src/rules`, `src/gen`, `src/court`, `src/economy` never import React or use `Math.random`/`Date.now` (grep check) | |
| **Oracle check:** for 500 seeded applicants, `judge()` finds exactly the `planted` violations, no more, no fewer | |

The oracle check matters most: the generator knows the truth by construction, so it tests the rule engine without trusting the engine's own logic.

## Slice 1: one applicant
| Check | Evidence |
|---|---|
| Exact phrase is valid; typo, missing words, extra words and silence are each invalid | |
| Accepting a valid applicant and challenging an invalid one both show "correct" | |
| Browser: card, video strip and both buttons render; clicking shows the verdict | |
| Playwright: with a fixed seed, `window.__game` records the decision and outcome | |

## Slice 2: one full day
| Check | Evidence |
|---|---|
| A day's queue is fully determined by its seed | |
| Pay and penalties match `game-design.md` for each of the four outcomes | |
| Balance: over 20 seeded days, an always-accept bot and an always-challenge bot both end below zero; a perfect bot ends above zero | |
| Bills screen totals match the economy module; savings carry to the next day | |
| Empty queue, loading and error states render (screenshots) | |

## Slice 3: rulebook
| Check | Evidence |
|---|---|
| Each day's rule is active from its day onward, never before | |
| Each rule has a test with one valid and at least two invalid applicants | |
| Registry lookup finds duplicates by face and by address | |
| Gary appears once per day with a different disguise | |
| Rules combine: an applicant can have several violations and all are reported | |

## Slice 4: court
| Check | Evidence |
|---|---|
| Jury sizes are 3, 7, 15; there is no fourth round | |
| Court results are reproducible from the seed | |
| Appeal fees and refunds match the economy config | |
| Playwright: challenge, see jury, appeal once, see 7 jurors, see final ruling | |

## Failure-injection record (Day 2)
| Defect injected | Which unchanged check caught it | Evidence |
|---|---|---|
| | | |
