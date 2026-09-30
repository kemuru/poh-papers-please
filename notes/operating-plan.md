# My operating plan

My default process, from the week's evidence (`notes/runlog.md`, `notes/report.md`).

- **Plans:** Claude Max 5x ($100 a month) builds; ChatGPT Pro, which Codex reports as `prolite` ($100 a month), reviews. One plan from each provider: nothing this week showed one provider strictly better, and Codex's one review found three bugs Claude had missed.
- **Primary model and reviewer:** Opus 5.5 in Claude Code builds; GPT 6 Astra in Codex reviews, in a fresh session.
- **Routing:** max effort by default, as all week. xhigh for bounded tasks (a skill, one slice as a `/goal`), and an ultracode workflow only when the work splits into disjoint files. Before keeping max as the default, compare it with xhigh on one repeated task: accepted result, review time and usage (not measured this week).
- **Project rules vs skills:** `AGENTS.md` keeps the architecture, the design invariants and "Done means", short. Repeated procedures become skills (`add-applicant`). Research reports and style sheets stay in `reports/` and `notes/`, linked from `AGENTS.md` and read when relevant.
- **When graphs help:** when the work splits into disjoint files around a contract committed first (slice 4, the 30 Sep passes); otherwise one agent. Every writer gets its own files or worktree, port and output folder.
- **Acceptance evidence:** typecheck, unit and e2e tests run, with their exit codes read; a planted defect that each new check catches; screenshots I look at for any UI change. The rule engine, the generator and the court get a fresh review by Codex before a release.
- **Budget:** stay within the two plans and read `/usage` at the end of every day. Ask for more only if the weekly limit stops work twice in a month and an extra plan costs less than the hours it would save times their value.
- **Concurrency:** at most two writing agents at once, plus research agents that write nothing. No new start while two results wait for my review.
- **Weekly habit:** every Friday, read failed runs, the reviewer's unique findings, shared misses and usage; delete stale instructions from `AGENTS.md` and memory.
- **Reassess** after each major model release and at each plan renewal. Next review: 30 Oct 2026, or the next major release if sooner.
