# Training report: Proof of Humanity: Papers, Please

## Project and accepted result
A browser desk game satirizing Kleros's Proof of Humanity: a clerk accepts or challenges applicants against a rulebook that gains one rule a day, a jury hears the challenges, and the week ends on Humanity Day. All six slices were built by 29 Sep; on 30 Sep, after my playtest, came a redesign (one rule a day, pixel art on every screen), volume faders and a played finale. Checks: typecheck, 411 unit tests (including an oracle check of the rules against planted faults) and 109 browser tests, all passing ([acceptance](acceptance.md)). Unfinished: playtests with other people, a bug from Codex's review, and a cross-provider review of the 30 Sep work.
[Play it](https://kemuru.github.io/poh-papers-please/). Commits: slice 2 [5d755d9](https://github.com/kemuru/poh-papers-please/commit/5d755d9), slice 3 [2ad6087](https://github.com/kemuru/poh-papers-please/commit/2ad6087), slice 4 [356193f](https://github.com/kemuru/poh-papers-please/commit/356193f), slices 5 and 6 [8ccf4c6](https://github.com/kemuru/poh-papers-please/commit/8ccf4c6), redesign [62c3015](https://github.com/kemuru/poh-papers-please/commit/62c3015).

## One rediscovery
I expected a detailed outcome brief to beat my usual short prompt. For the portrait generator, I ran both from the same commit with the same model. My short prompt ("read the docs, figure it out") produced a much richer result: it read the game design doc and built the cast, Gary's disguises and blink frames. The detailed brief did exactly what it specified and no more, because it over-specified the design. I changed my mind: for creative tasks I'll specify the outcome and checks, and let the repo docs carry the context.
Evidence: [runlog](runlog.md) rows 2 and 3. A took 48 agent minutes and $8.86 at API prices, B 15 minutes and $4.33.

## My setup
Claude Code 2.1 with Opus 5.5 built everything, mostly at max effort (xhigh for smaller tasks, ultracode workflows for slice 4). Codex with GPT 6 Astra at xhigh built slice 1 alongside it and reviewed slice 2. Plans: Claude Max 5x and ChatGPT Pro (Codex reports `prolite`), $100 a month each. Spend at API prices: about $660 for 25 to 29 Sep ($744 by the CLI's own figure) and at least $450 on 30 Sep. I never read Claude's quota from `/usage`; Codex used 1 to 2% of a weekly limit. Why it fits: max effort carried a creative build I couldn't have done by hand, and Codex's review found three bugs Claude missed.

## Process evidence
- **Grilling:** slice 1's agent asked how strictly the phrase must match; I chose words only. Playing it, I failed an applicant for "the registry" instead of "this registry", so I loosened the rule to the key words in order ([runlog](runlog.md) row 4).
- **Skill:** [add-applicant](../.claude/skills/add-applicant/SKILL.md) loaded for "add a sentient toaster that can't blink" and asked about validity, stayed out of "fix the shift timer", and loaded for "add a new applicant", stopped before it could ask for the idea ([runlog](runlog.md) row 9).
- **Goal or recovery:** slice 3 as a `/goal` stalled overnight on a command waiting for input. When I checked, the goal's check refused to call it done (a failing test, no e2e run); it finished 28 minutes later, 195 unit and 27 e2e tests passing ([runlog](runlog.md), "Day 3").
- **Graph or Ultra:** slice 4 as an ultracode workflow: the shared contract first, two workers in their own worktrees, an integrator, a 90-minute limit. It stopped at the limit reporting "not done"; three adversarial reviewers finished it next morning ([runlog](runlog.md), "Day 4").
- **Routine:** not done; the routine and the CLI wrapper are still plans ([runlog](runlog.md), "Day 5").
- **Multitasking:** on 30 Sep at most two agents wrote at once, each on its own files and port; their one collision (a renamed animation) passed every test and was caught reading the diff. Time saved: not measured.

## A failure I caught, and what I'll change
Codex's review of slice 2 confirmed three issues and one latent. My day 2 note said the false-positive test was fixed. On 29 Sep the code showed nothing had changed: at 1024×768, 123 of 1,052 transcripts took three lines while the two-line test passed ([runlog](runlog.md), "Day 2"). Next month: a new check must first fail on a planted defect (on 30 Sep two style tests passed on stylesheets they could not read), and I read a test run's own exit code, since an `echo` once hid a failure.
