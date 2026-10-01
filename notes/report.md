# Training report: Proof of Humanity: Papers, Please

## Project and accepted result
A browser desk game about Kleros's Proof of Humanity: a clerk accepts or challenges applicants under a rulebook that grows daily, and a jury hears challenges. All six slices were built by 29 Sep; after my playtest came a pixel-art redesign, a played finale and a review of every screen. At the last commit, typecheck, 412 unit and 118 browser tests all pass ([acceptance](acceptance.md)). Unfinished: playtests with others, the [R32](next.md) review of the rule engine, generator and court, and a bug left from Codex's review.
[Play it](https://kemuru.github.io/poh-papers-please/). Commits: slice 2 [5d755d9](https://github.com/kemuru/poh-papers-please/commit/5d755d9), slice 3 [2ad6087](https://github.com/kemuru/poh-papers-please/commit/2ad6087), slice 4 [356193f](https://github.com/kemuru/poh-papers-please/commit/356193f), slices 5 and 6 [8ccf4c6](https://github.com/kemuru/poh-papers-please/commit/8ccf4c6), redesign [62c3015](https://github.com/kemuru/poh-papers-please/commit/62c3015), last review [b632c59](https://github.com/kemuru/poh-papers-please/commit/b632c59).

What became possible: the whole game in six days, which my ambition note said would never happen. What still needed me: taste, in the jokes and the game's feel, visuals, music, and animations, which were corrected and refined by playing it.

## One rediscovery
I expected an outcome brief to beat my usual short prompt, and ran both on the portrait generator, same commit and model. My short prompt ("read the docs, figure it out") did far more: it read the design doc and drew the whole cast. The brief did what it specified and no more: it over-specified the design. I changed my mind: for creative tasks I'll specify the outcome and checks, and let the repo docs carry the context.
Evidence: [runlog](runlog.md) rows 2 and 3 (A: 48 minutes, $8.86; B: 15 minutes, $4.33).

## My setup
Opus 5.5 in Claude Code 2.1 built everything, mostly at max effort. GPT 6 Astra in Codex (xhigh) built a second slice 1 and reviewed slice 2, on 1 to 2% of a weekly limit. Actual spend: Claude Max 5x and ChatGPT Pro (`prolite`), $100 a month each, no API credits. API-price equivalent: about $660 for 25 to 29 Sep, at least $530 on 30 Sep. I never read Claude's quota in `/usage`, but no session hit a limit. From now on I keep only Claude ([plan](operating-plan.md)): it carried the whole build, though Codex's one review, the last by a second model, found three bugs Claude missed.

## Process evidence
- **Grilling:** slice 1's agent asked how strictly the phrase must match; I chose words only. Playing it, I failed an applicant for "the registry" instead of "this registry", so I loosened the rule to the key words in order ([runlog](runlog.md) row 4).
- **Skill:** [add-applicant](../.claude/skills/add-applicant/SKILL.md) loaded for "add a sentient toaster that can't blink" and asked about validity, stayed out of "fix the shift timer", and loaded for "add a new applicant" (stopped early) ([runlog](runlog.md) row 9).
- **Goal or recovery:** slice 3 as a `/goal` stalled overnight on a command waiting for input. In the morning its check refused to call it done (a failing test, no e2e run); 28 minutes later all checks passed ([runlog](runlog.md), "Day 3").
- **Graph or Ultra:** slice 4 as an ultracode workflow: a contract committed first, two workers in their own worktrees, an integrator, a 90-minute limit. It stopped at the limit, "not done", and was finished next morning. Decision: workflows only when no two agents need the same file, with the full browser suite in the main session, as an agent running it was twice restarted as stalled. I never forced a branch failure to see what a relaunch replays ([runlog](runlog.md), "Day 4").
- **Routine:** not done, nor the CLI wrapper or a held-back capstone ([runlog](runlog.md), "Day 5").
- **Multitasking:** on 30 Sep at most two agents wrote at once, each on its own files and port; their one collision, a renamed animation, passed every test and was caught in the diff. Time saved: not measured.

## A failure I caught, and what I'll change
A test said applicants' subtitles fit in two lines; Codex showed some take three in a 1024×768 window. My day 2 note said Claude had fixed it, but on 29 Sep a browser check found nothing had changed: 123 of 1,052 subtitles still took three lines ([runlog](runlog.md), "Day 2"). Next month I break a feature on purpose to see each new test fail before trusting it, and I read the test tool's own result, since an extra command once hid a failure. Already in use: the last review's title-screen test failed 8 of 9 on the old layout.
