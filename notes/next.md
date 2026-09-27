# Notes and next steps

## Fill this BEFORE reading any course resource
So the rediscovery baseline is not shaped by what the course teaches.

**How I currently work with AI agents (honest and specific):**
- Tools and models I use: Only frontier models (Fable, Opus...) on Thinking Mode, Max Effort.
- How I start a task (one prompt, back and forth, plan first): One prompt, I explain what I need specifically, giving all the necessary context. Then review what it did, and iterate it if necessary with follow-up prompts.
- Skills, memory or custom setup I rely on: I repeat certain useful prompts, but I currently have no setup outside of that. "“deep research”, “only when you truly understand, execute”. “audit the changes”. “are you sure this would not produce any unwanted side effects? actually confirm this, critical, if yes, why? if no, fix the side effects”, “make sure there are no instances left of the same type of change we’re doing in the codebase/repo” “only make the proposed change if it’s a genuine improvement over not doing it.”
- How I check the result: If it's a frontend, I manually verify going through the flow. If it's a script/bot, I run the scripts, see if we get the intended behavior/correct data, or I make it go through the flow to test all the scenarios to see if it's really robust or if it breaks somewhere. Then I ask it to audit the code multiple times (on same terminal and also on different terminals so they don't have the context of the other terminal, sometimes it catches things in a less biased way).
- What usually goes wrong: Not much goes wrong usually. I get the impression you can code almost anything with AI, even if challenging, and if there's something wrong, it's easy to fix with prompts.

## Ambition note (PDF page 2)
**Three ideas I postponed and what stopped me:**
1. Videogames: I saw them as too time-intensive to code, same for making the visuals.
2. 
3. 

**Chosen:** Proof of Humanity: Papers, Please.
**Old obstacle:** a narrative comedy game needs lots of content, art and UI; far too much work for a side project. Would've taken too much time, would've never been done otherwise.
**Hypothesis:** agents can produce the UI, content variants and procedural art, even the humor (reviewed by me).
**Smallest useful demo:** slice 1, one applicant.
**Stretch goal:** all seven days, endings and sound.

## R32 decisions (Day 2)
| Component | Critical? | Defects easy to spot? | Mode | Who writes it | How it is checked |
|---|---|---|---|---|---|
| Rule engine | No | No: bugs hide in rule combinations and edge cases (phrase inside noise, rules by day) | Vibecode then review | AI | Oracle check + one test per rule; I review `judge()` once after slice 3, when the rules are stable |
| Generator | No | No: a mislabeled applicant looks fine while playing | Vibecode then review | AI | Oracle check, valid-ratio tests, fair clue check; I review it together with the rule engine after slice 3 |
| Court | No | No: fairness is statistical, you can't see it in one game | Vibecode then review | AI | Fairness test (≥95%), jury sizes, same-seed replay; I review the vote logic once after slice 4 |
| Economy | No | Yes: the balance bots measure the difficulty targets directly | Vibecode and use | AI | Payout tests + the six balance bots; no code review |
| UI and content | No | Yes: I see it when I play | Vibecode and use | AI (jokes curated by me) | Playing, screenshots, Playwright; for jokes, I pick the best from generated batches |

**Hidden failures that could change my choice:**
- Rule engine + generator: both could misunderstand a rule *the same way* (e.g. the new "contains" phrase rule). The oracle check compares them against each other, so it would still pass. That's why they get a human review, not just tests.
- Court: if appeals felt unfair in playtests even with the fairness test passing, I'd review the court code earlier.
- Economy: if playtesters' results didn't match the bots (e.g. real players get fired far more often), the bots are measuring the wrong thing, and it moves to "vibecode then review."

## Running notes
(date: what happened, what I decided, what's next)
End of day 1: we have the initial game screen, still a simple prototype but I feel like it has a lot of potential, I'll have to tweak a lot of details.
End of day 2: claude coded it, codex reviewed it: found 1 test was a false positive, which claude later fixed.
End of day 3: 

## For the final report
- What became possible:
- What still needed my judgment: taste. the jokes were kinda odd, the "feel" of the game much improvable, I iteratively had to improve small things related to the "feel" of the game along the way.
- What I'll try next:
