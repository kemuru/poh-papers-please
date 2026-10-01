# Proof of Humanity: Papers, Please

A deadpan desk game in the browser that satirizes Kleros's Proof of Humanity. It is the week before Humanity Day, when every registered human starts receiving an income. You are the registry's newest clerk: accept or challenge each applicant against a rulebook that gains one rule a day, while everything that can pass for a human queues for the money.

**Play it:** https://kemuru.github.io/poh-papers-please/

Runs entirely in the browser: no wallet, no chain, no network calls. A week is designed to take about 45 minutes.

## Run it locally

```sh
npm install
npm run dev        # the game
npm test           # unit tests (Vitest)
npm run test:e2e   # browser tests (Playwright)
npm run typecheck
npm run deploy     # build and publish to GitHub Pages (scripts/deploy-web.sh)
```

## How it was made

Built in one week during a course on AI-driven development, with Claude Code (Opus 5.5) building it and Codex (GPT 6 Astra) for one comparison build and one review. The process is documented in the repo:

- `AGENTS.md`: the rules every agent follows.
- `notes/`: the brief, the game design, the art direction, the acceptance checklist with its evidence, the run and cost log, the training report and the operating plan.
- `reports/` and `research_notes/`: the research behind the design decisions.

Art, fonts and sound are self-made or CC0 (`public/assets/LICENSES.md`); every character is fictional.
