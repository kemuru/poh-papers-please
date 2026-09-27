# Brief: Proof of Humanity: Papers, Please

## Goal (observable result)
A playable browser comedy game: the player reviews applicants at a registry desk in the week before Humanity Day, when every registered human starts receiving an income, so everything that can pass for a human is in the queue. The player accepts or challenges them under a rulebook that grows every day, sees challenged cases judged (and appealed) by a jury, pays end-of-day bills and reads the consequences in the next morning's Gazette. Seven days, several endings.

Most applicants are legitimate. The comedy comes from absurd applicants who may or may not break a rule, so the player must judge by the rulebook, never by appearance. The humor is satire of the real Proof of Humanity and Kleros, exaggerated one step, never random. Playing it should feel like doing a real job competently in a ridiculous world: not too hard, not too easy, with the difficulty targets in `notes/game-design.md`.

## Context
- New repo. Stack and architecture in `AGENTS.md`. Design, cast and rulebook in `notes/game-design.md`.
- Parody of Kleros Proof of Humanity; all characters fictional.

## Constraints
- Rules, generator, court and economy are pure and seeded, so every day is reproducible from its seed.
- React UI only; no game engine. Procedural portraits; CC0 assets only.
- Runs locally with `npm run dev`. No backend or runtime network calls.

## Slices
1. **One applicant.** Profile card, video strip and phrase, Accept or Challenge, verdict screen. Rule: day 1 phrase.
2. **One full day.** Seeded queue of applicants, shift clock, pay, penalties and daily warning, challenges filed for end of shift, bills screen, next day.
3. **Rulebook progression.** Days 1 to 6 rules (phrase, photo, the sign, one vouch, no duplicates, living), day 1 tutorial, the morning Gazette (yesterday's consequences and the day's rule with its reason), rulebook panel with a page per rule, inspect mode, challenges that carry their reason, registry lookup by name and by face, a registry that remembers, recurring cast (Gary one rule behind, Pat, the in-context cast), and the hall's announcements and notes rewritten for the Humanity Day week.
4. **The court.** End-of-shift hearings; APPEAL grows the jury 3, 7, 15; fair appeals; rulings that name the rule; costs and outcomes.
5. **Stretch.** Day 7 Humanity Day (Gary valid, the clerk's own renewal), the endings with their letters, save at the end of each day, a title card, polish.

## Acceptance
`notes/acceptance.md`. Each slice needs passing tests and a screenshot or short clip.

## Process
Inspect what matters, ask about high-impact ambiguity (at most five questions, one at a time), choose a proportionate plan, implement, run the checks.

## Stop
Stop after two failed attempts at the same problem and return a reproducible blocker. Always return changed files, commands actually run and unresolved risks.
