# Acceptance and evidence

Fill Evidence with a commit hash, test output, screenshot path or clip. "The agent said so" is not evidence.

## Always true
| Check | Evidence |
|---|---|
| `npm run typecheck` and `npm test` pass | |
| Same seed produces identical applicants, court results and day totals (snapshot test) | |
| `src/rules`, `src/gen`, `src/court`, `src/economy` never import React or use `Math.random`/`Date.now` (grep check) | |
| **Oracle check:** for 500 seeded applicants, `judge()` finds exactly the `planted` violations, no more, no fewer | |
| **Fair clue check:** every planted violation type maps to a visible difference in the UI data (for example photo vs video frame, transcript text, the sign vs the form, the voucher, a registry match) | |
| No line from a content pool is shown twice in one run: remarks, names and addresses (slice 2); memos, rulings and Gazette items (from slice 3) | |

The oracle check matters most: the generator knows the truth by construction, so it tests the rule engine without trusting the engine's own logic. The fair clue check keeps every mistake the player's fault, never the game's.

## Slice 1: one applicant
| Check | Evidence |
|---|---|
| The key words of the phrase, in order, are valid, whatever else is said before, after or in between and whatever small words are swapped or left out; a missing or swapped key word, a typo in one, and silence are each invalid | |
| Accepting a valid applicant shows a stamp; accepting an invalid one prints a citation that names the broken rule | |
| Browser: card, video strip and both buttons render; clicking shows the result | |
| Playwright: with a fixed seed, `window.__game` records the decision and outcome | |

## Slice 2: one full day
| Check | Evidence |
|---|---|
| A day's queue is fully determined by its seed, with the applicant counts from the day table | |
| Every seeded day from day 2 has 65 to 75% valid applicants (test over 20 seeds); day 1, the scripted tutorial, has 3 of 5 | |
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
| Each rule has at least three kinds of offender and one valid look-alike in the content (test) | |
| Every invalid applicant breaks exactly one rule, on every day | |
| Inspect mode: selecting two disagreeing items highlights the discrepancy and names the rule; two agreeing items highlight nothing | |
| A challenge carries its reason; it is upheld only when the applicant broke that rule | |
| Registry lookup finds a voucher by name (and whether they are already vouching for someone) and a duplicate by face | |
| The registry remembers: an applicant accepted earlier in the week is found by the lookup; an upheld challenge removes the applicant's voucher | |
| From day 2, the morning Gazette reports at least one of yesterday's actual decisions and gives the reason for the day's new rule | |
| Scripted appearances (Gary, Pat, the day's set piece) come in the first half of the queue | |
| Gary appears once per day on days 1 to 6, with a different disguise, and breaks that day's new rule | |
| Pat breaks the newest rule on each visit on days 1 to 4 and is valid on day 6 | |
| Rules are rules: Socrates valid on days 1 to 5, invalid on day 6; Dave always valid; the second Twin valid only when filmed with the first | |
| Day 1 tutorial: the first two applicants are scripted and no ending can trigger on day 1 | |

## Slice 4: court
| Check | Evidence |
|---|---|
| Jury sizes are 3, 7, 15; there is no fourth round | |
| Court results are reproducible from the seed | |
| Fairness: when the player's challenge is correct, appealing to the last round wins in at least 95% of seeds | |
| Appeal fees and refunds match the economy config | |
| Playwright: challenge, reach the court at shift end, appeal once, see 7 jurors, see the final ruling | |
| Every ruling names the rule and the two things that disagree | |
| A juror can be drawn more than once in a case, with one vote per draw | |

## Slice 5: Humanity Day and endings
| Check | Evidence |
|---|---|
| Day 7: Gary's application is valid under every rule in force | |
| Day 7: the last applicant is the clerk, whose video says "a real clerk" | |
| Each ending (Fired, Replaced, Promoted, Reclassified) is reachable by a scripted run (Playwright) | |
| The Promoted letter reports Window 3's week from the run's own decisions: humans registered, fakes registered, Pat | |
| The game saves at the end of each day and continues after a reload | |

## Playtest log (people, not bots)
| Date | Who | Days played | Mistakes per day | Laughed at | Confused by | Change made |
|---|---|---|---|---|---|---|
| | | | | | | |

## Failure-injection record (Day 2)
| Defect injected | Which unchanged check caught it | Evidence |
|---|---|---|
| | | |
