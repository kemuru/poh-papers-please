# Training report: Proof of Humanity: Papers, Please

## Project and accepted result
A browser desk game about Kleros's Proof of Humanity: a clerk accepts or challenges applicants under a rulebook that grows daily, and a jury hears challenges. It is now a complete, public game: six slices by 29 Sep, then, after my playtest, a pixel-art redesign, a played finale and a full review. At the last commit, typecheck, 412 unit and 118 browser tests all pass ([acceptance](acceptance.md)).
[Play it](https://kemuru.github.io/poh-papers-please/). Commits: slice 2 [5d755d9](https://github.com/kemuru/poh-papers-please/commit/5d755d9), slice 3 [2ad6087](https://github.com/kemuru/poh-papers-please/commit/2ad6087), slice 4 [356193f](https://github.com/kemuru/poh-papers-please/commit/356193f), slices 5 and 6 [8ccf4c6](https://github.com/kemuru/poh-papers-please/commit/8ccf4c6), redesign [62c3015](https://github.com/kemuru/poh-papers-please/commit/62c3015), last review [b632c59](https://github.com/kemuru/poh-papers-please/commit/b632c59).

What became possible: the whole game in six days, which my ambition note said would never happen. What still needed me: taste, in the jokes and the game's feel, visuals, music, and animations, which were corrected and refined by playing it.

## One rediscovery
I expected a detailed outcome brief to beat my usual short prompt, so I ran each once on the portrait generator, same commit and model. My short prompt ("read the docs, figure it out") did far more: it read the design doc and drew the whole cast. The brief did exactly what it specified and no more: it had over-specified the design. I changed my mind: for creative work I give the outcome and checks and let the repo's docs carry the context.
Evidence: [runlog](runlog.md) rows 2 and 3 (A: 48 minutes, $8.86; B: 15 minutes, $4.33).

## My setup
Opus 5.5 in Claude Code 2.1 built everything, mostly at max effort; GPT 6 Astra in Codex (xhigh) built a comparison slice 1 and reviewed slice 2, on 1 to 2% of a weekly limit. Plans: Claude Max 5x and ChatGPT Pro, $100 a month each, no API credits. Over $1,100 of work at API prices in six days fit the Claude plan without hitting a usage limit, so I keep Claude alone ([plan](operating-plan.md)). The trade-off: Codex's one review found three bugs Claude missed, plus a latent fourth. Fresh Claude reviewers caught real defects too (rows 19, 21, 25).

## Process evidence
- **Grilling:** the slice 1 agent asked how strictly the spoken phrase must match; I took its default, word for word. Playing it, failing an applicant for "the registry" instead of "this registry" felt too harsh, so I loosened it to the key words in order ([runlog](runlog.md) rows 4 and 6).
- **Skill:** [add-applicant](../.claude/skills/add-applicant/SKILL.md) passed a three-prompt trigger test (row 9), then added a character end to end in two fresh sessions, checks passing; one merged ([fadb7fb](https://github.com/kemuru/poh-papers-please/commit/fadb7fb); rows 11 and 12).
- **Goal or recovery:** slice 3 as a `/goal` stalled overnight on a command waiting for input. Next morning its check refused to call it done (a failing test, no e2e run); 28 minutes later every check passed ([runlog](runlog.md), "Day 3").
- **Graph or Ultra:** slice 4 as an ultracode workflow: a contract committed first, two isolated workers, an integrator, a 90-minute limit. At the limit it reported "not done" instead of claiming success; a follow-up with three adversarial reviewers finished it. Decision: workflows only when no two agents need the same file ([runlog](runlog.md), "Day 4").
- **Routine:** not done; Day 5 went into the game itself (the redesign, the finale and the public deploy).
- **Multitasking:** on 30 Sep at most two agents wrote at once, each with its own files and port; their one collision, a renamed animation that passed every test, was caught in the diff.

## A failure I caught, and what I'll change
On 30 Sep I noticed a thin green line around the new tilted stamps and asked about it. The agent changed the ink texture, every test passed, and I could still see the line, so I asked it to fix the root cause: a leftover border that no test looked at ([runlog](runlog.md) row 24). Passing tests said nothing about what was on the screen. My adjustment: I check every visual change on screen myself before accepting it, and anything I care about seeing gets a test; the stamp's frame now has one (`src/ui/stampImpression.test.ts`).
