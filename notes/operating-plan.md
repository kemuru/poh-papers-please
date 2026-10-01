# My operating plan

My default process from now on, based on what the week showed (`notes/runlog.md`).

- **Plan:** Claude Max 5x ($100 a month) alone, no API credits. Why: Claude did all the building, and Max 5x never stopped work in six heavy days (over $1,100 at API prices), while Codex ran twice all week. The trade-off: Codex's one review found three bugs Claude had missed. Fresh Claude reviewers also caught real defects (runlog rows 19, 21, 25), so they take over reviewing, and I buy a second provider back when the hours its reviews save are worth more than $100 a month.
- **Upgrades:** to Max 20x ($200) only when the weekly limit stops work twice in a month and the lost hours are worth more than the extra $100. I check `/usage` every evening.
- **Primary model and reviewer:** Opus 5.5 in Claude Code builds; a fresh Claude session reviews, given the task, diff and acceptance criteria, and runs its own checks.
- **Routing:** max effort by default, xhigh for bounded tasks, ultracode only when no two agents need the same file. Comparing max with xhigh on one repeated task decides whether max stays the default.
- **Rules vs skills:** a short `AGENTS.md` (architecture, invariants, "Done means"); repeated procedures as skills (`add-applicant`); research in `reports/`, read when relevant.
- **When graphs help:** when the work splits into parts that never edit the same file, around a shared data shape committed first (slice 4); otherwise one agent. Each writer gets its own worktree and port; the full e2e suite runs only in the main session.
- **Acceptance evidence:** typecheck, unit and e2e runs with their exit codes read; each new check seen failing on a planted defect; screenshots I look at; a second review after every fix pass; and, per my R32 table, a fresh review and my own read of the rule engine, generator and court before the next release.
- **Concurrency:** at most two writing agents, and three in a browser (at five, two stalled). No new start while two results wait for my review; I clear them oldest first: run the checks, read the diff, then accept, send back or drop.
- **Weekly habit:** once a week, check my Claude usage, look back at what broke or got caught that week, and update `AGENTS.md`, the skills and memory so they don't tell agents outdated things (on 1 Oct the add-applicant skill still described a rule cut the day before).
- **Reassess** at each major model release and plan renewal, a second provider included. Next review: 30 Oct 2026, or sooner if a major model ships first (Gemini 4 is rumored for October).
