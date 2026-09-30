export const meta = {
  name: 'slice4-court-finish',
  description: 'Finish slice 4: the court e2e spec and ruling test in parallel, three adversarial reviews, one fix pass',
  phases: [
    { title: 'Build', detail: 'e2e/slice4.spec.ts with real-engine screenshots; a render test that every ruling names every rule' },
    { title: 'Verify', detail: 'three adversarial reviewers: acceptance rows, invariants and correctness, the player' },
    { title: 'Fix', detail: 'one pass on confirmed blocking and major findings' },
  ],
}

const REPO = '/Users/kemuru/repos/poh-papers-please'

const CONTEXT = `
Project: a browser desk game in ${REPO}, branch "court" (HEAD 77e0b01). Slice 4, "the jury", is integrated; you are finishing it. Work directly in ${REPO}.
Read first: notes/acceptance.md "Slice 4: the jury"; notes/game-design.md "The court (end of each shift)"; src/court/types.ts, src/court/jury.ts, src/ui/week.ts (actions decide with evidence, appeal; rulings[].court), src/ui/Screens.tsx (Court, Hearing, Jury), src/ui/Slips.tsx (FilingSlip), e2e/inspectFault.ts (Inspect a fake's planted fault the way a careful clerk does) and e2e/slice3.spec.ts for how the specs are written.

Facts:
- A challenge made after Inspect found an in-force discrepancy on that applicant carries it as evidence. The slip prints it ("Evidence: Rule 3, the sign against the form."), and the first jury of 3 upholds it with every seat.
- Anything else is a hunch. Each seat finds a real fault with a chance by visibility tier.
- A dismissed hunch shows a button (testid 'appeal') "Appeal · 7 jurors · 10 PNK", then "Appeal · 15 jurors · 20 PNK"; the next round plays in place.
- Testids on the court screen: 'ruling' (data-upheld), 'round' (data-size), 'juror' (data-vote, data-juror), 'appeal', 'evidence-line'. On the desk: 'filing' and 'filing-evidence'. window.__game is a frozen copy of the state, rulings[n].court included.

Rules:
- The dev server on port 5175 is served from ${REPO}. Check it with \`lsof -nP -iTCP:5175 -sTCP:LISTEN\`, then \`lsof -p <pid> | grep cwd\`. Playwright reuses it.
- Run e2e only a spec or a test at a time (\`npx playwright test e2e/<file> -g "<name>" --reporter=line --retries=0\`). NEVER the whole suite: a long silent run gets the agent killed as stalled.
- Don't commit, don't touch git history, branches or main. The lead reviews and commits.
- Don't edit existing tests unless your task says so. src/rules, src/gen, src/court and src/economy stay pure (no React, clock or Math.random).
- Match the codebase's voice: dry doc comments, no jokes in logic files.
`

const BUILD_SCHEMA = {
  type: 'object',
  properties: {
    changedFiles: { type: 'array', items: { type: 'string' } },
    checks: { type: 'array', items: { type: 'object', properties: { command: { type: 'string' }, result: { type: 'string' }, passed: { type: 'boolean' } }, required: ['command', 'result', 'passed'] } },
    evidence: { type: 'array', items: { type: 'object', properties: { row: { type: 'string' }, test: { type: 'string' }, measured: { type: 'string' } }, required: ['row', 'test', 'measured'] } },
    screenshots: { type: 'array', items: { type: 'string' } },
    bugsFound: { type: 'array', items: { type: 'string' } },
    firstFiveSeconds: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['changedFiles', 'checks', 'evidence', 'screenshots', 'bugsFound', 'firstFiveSeconds', 'notes'],
}

phase('Build')
const [spec, render] = await parallel([
  () => agent(`${CONTEXT}
YOUR TASK: write e2e/slice4.spec.ts, the Playwright row of Slice 4: "a hunch dismissed, appealed once, 7 jurors, the final ruling; a case with evidence shows no appeal; a court with no appeals reads in under 30 seconds". Also retake the court screenshots with the real engine. Your files: e2e/slice4.spec.ts (new), notes/evidence/slice4/*.png, and a throwaway probe that you delete.

1. Find the seeds with a probe. Put a throwaway vitest file under src/ (vitest only runs src/**/*.test.ts) that plays days through the reducer, as src/replay.test.ts does: startWeek(seed, day), then open, then call and decide by planted, challenging fakes with no evidence, then close. Look for a ruling on a fake with upheld false where appealCase(court) upholds at 7. Search seeds 1 to 300, days 2 to 6. Print with console.log (vitest shows it), or fail an expect with the answer. Delete the probe afterwards, so typecheck and the suite stay clean.
2. Tests, each pinning its seed with a guard assertion that says what changed ("changed: pick another"), as the other specs do. Collect page errors as slice3.spec.ts does.
   (a) Play the day by the rulebook: challenge that fake on a hunch; challenge other fakes with inspectFault first, or stamp them by planted. End the shift. Then assert:
       - its ruling is dismissed, with one 'round' of size 3 and 3 'juror's;
       - the slip said no evidence;
       - pressing APPEAL adds a round of size 7 at once (no dead click), with 7 jurors;
       - the final ruling reads "Challenge upheld." with every rule the applicant broke ("Rule N:");
       - no APPEAL is left;
       - window.__game shows 2 rounds with fees 0 and 10, and end.pay shows the appeal outcome.
       Then go to the accounts and check the statement's savings line against window.__game.end.after.
   (b) A case with evidence: Inspect a fake with inspectFault, challenge, check that the slip ('filing-evidence') says "Evidence: Rule N, ...". In court, its ruling has 'evidence-line', is upheld, has no 'round' and no 'appeal'.
   (c) A court with no appeals reads in under 30 seconds. On the busiest court (e.g. ?seed=1&day=6, challenging all ten on hunches, as e2e/fit.spec.ts does), measure from the court region appearing until every animation on the page has finished: \`document.getAnimations()\` all with playState 'finished', or await their \`finished\` promises, timed with performance.now() in the page. Assert under 30 000 ms and report the measured time. Then check "To the accounts" works on the first click.
3. Screenshots with the real engine. Take them in the spec (the shot helper) and copy the best to notes/evidence/slice4/:
   - court.png: a mixed court with evidence and hunches;
   - appeal.png: after an appeal played in place;
   - evidence-slip.png and hunch-slip.png: the two case slips;
   - court-day6.png: ten hunches at 1280×700.
   Delete the old screen-*.png files there: they were taken with the stand-in engine. Look at each PNG with the Read tool. Report what a new player notices in the first five seconds, and anything that looks wrong as bugsFound; don't fix source.
4. Run your spec at least twice to check it isn't flaky, then run \`npm run typecheck\`.
Return: the files you changed, checks with their real results, the evidence per row (test name plus measured numbers), screenshots, bugs found, the first five seconds, and notes.`, { label: 'court e2e spec', phase: 'Build', schema: BUILD_SCHEMA }),

  () => agent(`${CONTEXT}
YOUR TASK: the unit-level evidence for two Slice 4 rows, and a look at the court's words. Your files: a new test file src/ui/courtRuling.test.tsx, plus fixes to src/ui or src/content only for real bugs you prove with a failing test.

1. "Every ruling names every rule broken and the things that disagree". Render the Court component (src/ui/Screens.tsx) to static markup with react-dom/server, as src/ui/labels.test.tsx renders its components (check how it avoids browser-only APIs; stub what you must). Use rulings from real weeks: play days through the reducer (src/ui/week.ts) as src/replay.test.ts does, over enough seeds and days to cover every rule. Challenge every fake with evidence (for the test you may build Evidence as { rule, items } for a rule it broke) and some on hunches, appealing hunches through the reducer until they are upheld or out of rounds.
   For every upheld ruling, the markup must contain "Rule N:" followed by evidenceLine(v) (src/ui/evidence.ts) for every violation in ruling.court.violations. Those are the things that disagree.
   For every dismissed ruling, the markup must contain "Challenge dismissed. No rule broken; registered.", and it must be identical in wording whether the applicant was valid or the jury missed a fake. The court must not reveal validity through its ruling text; the vote tally is a known, accepted exception, so don't test it.
2. "A juror can be drawn more than once in a case, with one vote per draw". Render a case where a juror sits twice, and check the markup shows one 'juror' element per seat (count === round.size) and that juror's face twice.
3. The evidence wording: evidenceWords (src/ui/evidence.ts) for a pair with a rule reads "Rule 1, the transcript against the rule."; for two desk things, "Rule 3, the sign against the wallet." or whatever the item words are. Check that every Item kind has words, and that none says anything about the result.
4. Read src/content/court.ts, and the dismissed notes and CAST_RULINGS 'dismissed' lines in src/content/verdicts.ts, against "Writing the jokes" in notes/game-design.md.
   - A dismissed hunch on a fake the jury missed prints the same notes as one on a valid applicant, so a note may state the court's finding but must not claim a fact that is false for a missed fake.
   - If a line fails, rewrite or cut it in the house style, which is dry, specific and resolves.
   - Report every change with before and after.
5. Run npm run typecheck and npx vitest run.
Return: the files you changed, checks with their real results, the evidence per row (test name, what it covers, counts), bugs found, content changes (in notes), and the first five seconds as "n/a".`, { label: 'ruling render test', phase: 'Build', schema: BUILD_SCHEMA }),
])

const FINDINGS = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['blocking', 'major', 'minor'] },
          title: { type: 'string' },
          file: { type: 'string' },
          evidence: { type: 'string' },
          fix: { type: 'string' },
        },
        required: ['severity', 'title', 'file', 'evidence', 'fix'],
      },
    },
    checked: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'checked'],
}

const BUILT = `Build results so far (not yet committed; \`git diff\` and \`git status\` show them):
E2E SPEC AGENT: ${JSON.stringify(spec)}
RENDER TEST AGENT: ${JSON.stringify(render)}`

const LENSES = [
  {
    key: 'rows',
    prompt: `LENS: the acceptance rows. For every row of "Slice 4: the jury" in notes/acceptance.md, find the test that is meant to prove it: src/court/jury.test.ts, src/economy/jury-balance.test.ts, src/ui/courtSave.test.ts, src/ui/courtRuling.test.tsx, e2e/slice4.spec.ts, and the replay snapshot for reproducibility. Try to show that it proves a weaker claim than the row:
- a loop that never runs, or an assertion that can't fail;
- a sample too small for the percentages;
- evidence built in a way the game never builds it;
- a threshold looser than the row ("behind a careful one AND ahead of 2 mistakes a day"; "in at least 95% of seeds"; "in every seed"; "no fourth round"; "fees (10, 20), refunds and the 10 PNK bonus match the economy config").
Mutation-test at least three key assertions: break the code in your head or in a scratch copy, never in the real files, and check the test would fail. Run the tests you rely on.`,
  },
  {
    key: 'invariants',
    prompt: `LENS: invariants and correctness. Hunt for real bugs:
- The reducer (src/ui/week.ts): appeal outside the court phase, appeal of a case that can't appeal, a double click on APPEAL, appeal then statement, registry and \`removed\` after an appeal flips a ruling, court notes never repeating (\`shown\`), end and savings after appeals.
- Save and reload (src/ui/save.ts): a reload in court after an appeal plays back to the same rounds; a save with a bad appeal step is set aside; old saves still load.
- Determinism: the same seed gives the same court, appeals included, whatever else was heard.
- Evidence capture in src/ui/Shift.tsx: only in-force findings, reset per applicant, a later agreeing pair doesn't clear it. Could evidence ever name a rule the applicant didn't break (e.g. with a live registry that differs from planted), and what happens then?
- Economy (src/economy/economy.ts): fees kept on a loss, refunded with the bonus on a win, and economy.test.ts's pinned shapes unchanged.
- Purity (src/purity.test.ts) and the import cycle jury.ts → economy.ts → gen/day.ts → court.ts → jury.ts: is anything read at module top level?
- Anything on the desk or the slip that reveals validity.
Prove each finding with a failing input, command output or file:line. Write any scratch tests under src/ only temporarily and delete them.`,
  },
  {
    key: 'player',
    prompt: `LENS: the player. Drive the game in the browser (a node script using chromium from @playwright/test against http://localhost:5175, or a scratch spec you delete afterwards). Play a day with some Inspect-backed challenges and some hunches, reach the court and appeal, at 1280×700 and at 1470×830. Check:
- No dead clicks: APPEAL answers at once, with a sound or visual thunk.
- The keyboard works: Tab to APPEAL, Enter, then Space to the accounts.
- Nothing overlaps or is cut off; the court with ten cases fits.
- The appeal plays in place.
- The statement shows the appeal lines and adds up.
- A reload mid-court comes back to the same court.
- Nothing states a rule result on the desk.
Look at your screenshots with the Read tool. Judge the court against "The court" and "Writing the jokes" in notes/game-design.md: deadpan, Kleros played straight, never injustice, a proven case never lost. Report what a new player notices in the first five seconds, and every concrete problem with a screenshot path.`,
  },
]

phase('Verify')
const reviews = await parallel(LENSES.map((l) => () =>
  agent(`${CONTEXT}
You are an adversarial reviewer. Read-only: change no tracked file, and delete any scratch file you create. Your job is to find what is wrong, not to confirm what is right.
${BUILT}

${l.prompt}

Report only findings with concrete evidence. Severity:
- 'blocking': a Slice 4 row isn't really met, a check fails, or a design invariant is broken.
- 'major': a real bug or a clear player-facing problem.
- 'minor': polish.
Known and accepted, don't report: jurors never uphold a valid applicant, so a dismissed hunch with any uphold vote reveals a fake (the vote tally is Kleros played straight); and a clerk who is always right, hunches and always appeals out-earns a careful one, because of the 10 PNK bonus. Both are recorded as open design decisions for the owner.`, { label: `review: ${l.key}`, phase: 'Verify', schema: FINDINGS })
))

const all = reviews.filter(Boolean).flatMap((r, i) => r.findings.map((f) => ({ ...f, lens: LENSES[i].key })))
const serious = all.filter((f) => f.severity !== 'minor')
log(`${all.length} findings, ${serious.length} blocking or major`)

let fixed = null
if (serious.length) {
  phase('Fix')
  fixed = await agent(`${CONTEXT}
Fix these findings from three adversarial reviewers, where they hold. First check each one yourself, and skip any that doesn't reproduce, saying why. Prove each fix with a test: new tests in new files, or in the files the build step created this session (e2e/slice4.spec.ts, src/ui/courtRuling.test.tsx). Don't weaken any test.
FINDINGS:
${JSON.stringify(serious, null, 2)}

${BUILT}

Then run npm run typecheck, npx vitest run, and the e2e specs you touched, one at a time.
Return: per finding, fixed, skipped or not reproduced, with evidence; the files changed; the commands run and their results.`, { label: 'fixer', phase: 'Fix' })
}

return { spec, render, findings: all, fixed }
