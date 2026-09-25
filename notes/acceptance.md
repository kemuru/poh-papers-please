# Acceptance and evidence

Fill Evidence with a commit hash, test output, screenshot path or clip. "The agent said so" is not evidence.

## Always true
| Check | Evidence |
|---|---|
| `npm run typecheck` and `npm test` pass | |
| Same seed produces identical applicants, court results and day totals (snapshot test) | |
| `src/rules`, `src/gen`, `src/court`, `src/economy` never import React or use `Math.random`/`Date.now` (grep check) | |
| **Oracle check:** for 500 seeded applicants, `judge()` finds exactly the `planted` violations, no more, no fewer | |
| **Fair clue check:** every planted violation type maps to a visible difference in the UI data (for example photo vs video frame, transcript text, vouch names, registry match) | |

The oracle check matters most: the generator knows the truth by construction, so it tests the rule engine without trusting the engine's own logic. The fair clue check keeps every mistake the player's fault, never the game's.

## Slice 1: one applicant
| Check | Evidence |
|---|---|
| Exact phrase is valid; typo, missing words, extra words and silence are each invalid | |
| Accepting a valid applicant shows a stamp; accepting an invalid one prints a citation that names the broken rule | |
| Browser: card, video strip and both buttons render; clicking shows the result | |
| Playwright: with a fixed seed, `window.__game` records the decision and outcome | |

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
