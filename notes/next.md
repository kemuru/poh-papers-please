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
1. Videogames: I saw them as too time-intensive to code, same for making the visuals/soundtracks.
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

**Status on 29 Sep:** neither planned review has happened yet: `judge()` and the generator (due after slice 3) and the court's vote logic (due after slice 4).
**Status on 1 Oct:** no session records either review.

## Running notes
(date: what happened, what I decided, what's next)
End of day 1: we have the initial game screen, still a simple prototype but I feel like it has a lot of potential, I'll have to tweak a lot of details.
End of day 2: Claude coded slice 2. Codex's fresh review listed six issues; asked to verify them, it confirmed three and one latent, among them a test that passes while real transcripts wrap to three lines. I noted that Claude had fixed it, but on 29 Sep the code showed none of the fixes had landed (`notes/runlog.md`, "Day 2").
End of day 3: made the add-applicant skill and smoke-tested it (3 of 3 as intended, the third stopped before it asked), trimmed AGENTS.md, ran the habit comparison (B merged). Ran slice 3 as a `/goal`: it stalled overnight, the goal's check refused it once, and it was met at 10:08. The rest of the day went on the music, save and restart, phone signs, the lookup buttons and a review of slices 4 to 6. Merged as 2ad6087.
End of day 4: slice 4 as an ultracode workflow. It stopped at its 90-minute limit with 3 e2e tests failing and was finished in the morning with three adversarial reviewers (merged 356193f). Then, from playing it: the chip became the night lamp, day 1 teaches Rule 0, and phones hold about half the signs. In the evening slices 5 and 6 were built on `slice-6` at max effort and merged into main at 23:46.
End of day 5 (30 Sep): from my playtest, a redesign in one session: one rule a day, the first robot let in on day 1 and explained by the next morning's paper, the paper as one front page, the hall's PA, and the whole game in pixel art with its own pixel fonts, reviewed twice by agents that built none of it (merged as 62c3015). Then volume faders, bigger evidence and an Inspect loupe, papers that land in about half a second, a played finale at six o'clock, tilted stamps, and the game published on GitHub Pages. The Day 5 routine, wrapper and capstone were not done (`notes/runlog.md`, "Day 5"). That night, to 00:50, a whole-game review: five agents that changed nothing went through every screen, the session fixed what was clearly better fixed (the notice board on laptop windows, the four-case court, a Space mash that skipped the accounts, six o'clock's key), and an agent that made none of the fixes reviewed them. Pushed and deployed as b632c59 (`notes/runlog.md`, row 25).
1 Oct: report and operating plan done. From now on I keep only Claude Max 5x, upgrading only when the work needs it (`notes/operating-plan.md`). The title screen's first visit now has one way in, and the Superseded letter's hint says the clone comes only in some weeks (`notes/runlog.md`, row 26).

## For the final report
- What became possible: the whole game (seven days, a jury, six endings, music, pixel art and a played finale) in six days. My ambition note said it would never have been done otherwise.
- What still needed my judgment: taste. the jokes were kinda odd, the "feel" of the game much improvable, I iteratively had to improve small things related to the "feel" of the game along the way.
- What I'll try next: the Day 5 exercises I skipped (a routine, a CLI wrapper, a capstone reviewed by a fresh Claude session); reading `/usage` every day; playtests with people who have never seen the game (`notes/playtest-checklist.md`).
