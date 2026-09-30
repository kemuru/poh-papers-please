export const meta = {
  name: 'slice4-court',
  description: 'Slice 4 (the jury): engine and screen workers in worktrees from the CourtCase contract, then integrate on the court branch and pass the Slice 4 checks',
  phases: [
    { title: 'Build', detail: 'engine worker (src/court) and screen worker (src/ui) in parallel worktrees, 1 retry each' },
    { title: 'Integrate', detail: 'merge both into court, real engine, economy, content, tests, e2e, evidence' },
    { title: 'Verify', detail: 'adversarial check of every Slice 4 row and the design invariants' },
    { title: 'Fix', detail: 'one pass on confirmed blocking findings, if time remains' },
  ],
}

const REPO = '/Users/kemuru/repos/poh-papers-please'
const CONTRACT = '0f766eb'
const T = args.times

const WORKER_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
    branch: { type: 'string' },
    commit: { type: 'string' },
    changedFiles: { type: 'array', items: { type: 'string' } },
    checks: {
      type: 'array',
      items: {
        type: 'object',
        properties: { command: { type: 'string' }, result: { type: 'string' }, passed: { type: 'boolean' } },
        required: ['command', 'result', 'passed'],
      },
    },
    expectedFailures: { type: 'array', items: { type: 'string' } },
    openAssumptions: { type: 'array', items: { type: 'string' } },
    notesForIntegrator: { type: 'string' },
  },
  required: ['status', 'branch', 'commit', 'changedFiles', 'checks', 'expectedFailures', 'openAssumptions', 'notesForIntegrator'],
}

const COMMON = `
You are one of two parallel workers building slice 4 ("the jury") of a browser desk game in ${REPO}. You run in your own git worktree (your current directory), not in ${REPO}.

Read first: src/court/types.ts (the shared contract, committed as ${CONTRACT}); notes/game-design.md sections "The court (end of each shift)", "Economy", "Feedback" and "Writing the jokes"; notes/acceptance.md "Slice 4: the jury"; notes/brief.md slice 4.

Setup, in order:
1. Check \`git log -1 --format=%h\` is ${CONTRACT}. Create your branch: \`git checkout -b BRANCH\` (if HEAD is not ${CONTRACT}: \`git checkout -b BRANCH ${CONTRACT}\`). If BRANCH already exists, use BRANCH-2.
2. node_modules is not in the worktree. Clone it instantly on APFS: \`cp -Rc ${REPO}/node_modules ./node_modules\` (fallback: \`npm ci --prefer-offline --no-audit --no-fund\`). Never symlink it: a Vite server would share ${REPO}'s node_modules/.vite cache with the user's running dev server.
3. Port 5175 is the user's dev server for ${REPO}. Never use it, and never run \`npm run test:e2e\` here: playwright.config.ts would reuse that server and test the main checkout, not your worktree.

Rules:
- Edit only the files your scope allows (below). Never edit src/court/types.ts; if the contract is wrong or missing something, work around it inside your scope and say so in openAssumptions.
- Don't edit or delete existing tests or snapshots. You may add new test files.
- src/rules, src/gen, src/court, src/economy are pure: no React, no clock, no Math.random or Date.now (src/purity.test.ts greps for them). Randomness only through createRng from src/gen/rng.ts.
- Match the surrounding code: short doc comments in the codebase's dry voice, same naming and idiom.
- Deadline: run \`date +%H:%M\` now and then. First attempt: commit working, typechecked code by ${T.workerDone} at the latest, even if unfinished, and return. Do the must-haves first.
- Commit on your branch (end the message with the line "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"). Don't touch ${REPO}'s checkout, main or the court branch.

Return: status 'done' only if typecheck is clean and \`npx vitest run\` passes, apart from the expected failures you list with their reasons. Give branch, commit hash, changed files, every check you ran with its real result, open assumptions, and what the integrator must know.
`

const ENGINE = `${COMMON}
YOUR JOB: the court engine. BRANCH = court-engine. Scope: only files in src/court/.

1. src/court/jury.ts exports hearCase, appealCase, canAppeal, appealFee, isUpheld and settle, each checked with \`satisfies CourtEngine['name']\`, plus anything the tests and the integrator need (e.g. visibility(), the juror stakes).
2. Reproducible: a case's seed comes from the week's seed, the day and the index (a hash, not addition); round n is drawn from the case seed and n alone, so it doesn't depend on what else happened that day and the same week always gives the same court, appeals included.
3. Jurors: JUROR_POOL jurors with stakes (numbers only; names and faces are content's). Each seat is drawn in proportion to stake with replacement, so the same juror can sit in several seats of a round, with one vote per seat, and in a 15-seat round that must happen.
4. Evidence: when evidence.rule is among the violations, every seat of the first jury upholds with reason 'evidence'. Evidence naming a rule they didn't break is heard as a hunch.
5. Hunch: each seat looks for itself. Classify every Violation variant in src/rules/types.ts by how visible it is, anchored on the design: silence or a QR code (a square of dots) nearly always; a wrong word or a mirror often; a panel open in one frame or an ear that changes rarely. Use your judgment for the rest (e.g. no sign, nobody vouching, 470 BC or "v4" are plain; a year typo, no blink, someone else's face, a picture held up, the generator's mark are in between; two wrong characters on the sign, a voucher who is unregistered or already vouching, and a duplicate face need the registry or close comparison, so they're faint). A seat finds a real fault with a chance by tier and round, rising toward certainty in each appeal. With several faults, the chance of finding at least one, and 'found' names the fault it found. A valid applicant (no violations) is never upheld, whatever the rolls.
6. Upheld means more than half the seats voted uphold. Reasons are flavour, set after the tally: a seat that found says 'found' (sometimes 'follows' if its vote is the round's result); a seat that missed says 'missed', sometimes 'unopened', 'follows' (only if dismiss is the result) or 'refuses' (vote 'abstain'). Rare flavour, never changing a vote.
7. Fees: round n's fee is APPEALS.fees[n - 1] from src/economy/economy.ts (0 for the first jury). canAppeal: no evidence upheld it, the last round was dismissed, and a jury size is left. There is no fourth round; appealCase on anything else returns the case unchanged.
8. settle(registry, day, cases): like hearChallenges in court.ts, but with explicit upheld (upheld: voucher removed; dismissed: registered).
9. Keep src/court/court.ts working for its existing callers, unchanged in behaviour: src/court/court.test.ts, src/economy/*.test.ts and src/replay.test.ts must pass untouched. playDay may take an optional fifth argument for the balance bots (e.g. the week's seed, which challenges are hunches, and an appeal policy), returning the court cases in a new field. Without it, the result must deep-equal what it returns today (no new keys in hearings).
10. Tests in src/court/jury.test.ts, one per engine row of Slice 4 in notes/acceptance.md. Use real applicants: generate weeks (generateWeek from src/gen/day.ts) and judge their fakes against the registry at the window (planWeek().seen or morningRegistry/morning, as src/oracle.test.ts does), so every kind of fault is covered.
   - Jury sizes 3, 7, 15, and no fourth round.
   - Evidence is upheld by the first jury in every seed (thousands of cases, every fault kind).
   - On a hunch, measured first-round chance per tier is ordered plain > often > rare, and no seat ever upholds a valid applicant.
   - Fairness: a correct hunch appealed to the last round wins in at least 95% of seeds, for every fault kind; a wrong one never wins.
   - Same filed case deep-equals, appeals included.
   - Some case has a juror in two seats, with seats.length === size.
   - Fees come from APPEALS; canAppeal and appealFee behave as specified.
   Keep the suite fast (a few seconds).
11. Balance target the integrator will test with the economy: a clerk who never inspects decides like the perfect clerk, but every challenge is a hunch, and it appeals a dismissed hunch only when "sure", meaning the fault is in the plainest tier. That clerk must end the week behind a careful clerk (evidence on every challenge) and ahead of one who makes 2 random mistakes a day. Money: upheld pays the 15 bounty; upheld after appeals also refunds the fees and pays a 10 bonus; dismissed in the end loses the 15 deposit and keeps the fees. Tune the chances so this is likely to hold, and report in notesForIntegrator: the first-round uphold rate per tier, the share of correct hunches lost for good with and without appeals, and the tier table.
12. Run: npm run typecheck, npx vitest run (the whole suite).`

const SCREEN = `${COMMON}
YOUR JOB: the court screen and the UI side of slice 4. BRANCH = court-screen. Scope: only files in src/ui/. Use a fake engine until the real one exists.

1. src/ui/fakeCourt.ts implements hearCase, appealCase, canAppeal, appealFee, isUpheld and settle with the CourtEngine types. Make it deterministic (createRng from src/gen/rng.ts), with realistic variety: evidence → 3 'evidence' uphold seats; a hunch on a fake is sometimes dismissed in round 1, so APPEAL shows; a hunch on a valid applicant is always dismissed; repeated jurors; every Reason. Put a header comment "Stand-in until src/court/jury.ts". Every UI use of the engine goes through one module (src/ui/court.ts re-exporting from ./fakeCourt), so integration changes one import line.
2. Wording: any line with flavour goes in src/ui/courtWords.ts, marked as a stand-in for src/content/court.ts: juror names for 0 to 11 (fictional, plain), each Reason's bubble lines, any court quips. Integration moves the file. Plain labels may stay in components, as they do today. Follow "Writing the jokes": deadpan, Kleros played straight ("Voting with the others.", a juror who did not open the file, a juror who refuses to arbitrate), never at a sincere applicant, never injustice. If unsure a line is funny, cut it.
3. Evidence at the desk (Shift.tsx): the evidence is the latest in-force finding Inspect made on the applicant at the window during this visit. A later comparison that agrees does not clear it, a finding not in force doesn't count, and each new applicant starts with none. The decide action carries it for challenges. Decided gets an \`evidence\` key only when the challenge has evidence, so toEqual checks on accepts stay as they are.
4. Case slip (FilingSlip in Slips.tsx). With evidence: "Evidence: Rule 3, the sign against the form.", with the items in words (the photo, frame 2, the transcript, the sign, the form, the voucher, Rule N, the registry's record of NAME, the face search). Without: one line saying there is no evidence and the jury will look for itself. Never the word "Grounds" (e2e/slice3 checks for it). Nothing on the slip may hint at validity.
5. week.ts:
   - decide takes \`evidence?: Evidence | null\`.
   - New action { type: 'appeal', index } in the court phase, only when canAppeal; it adds the next round.
   - 'close' hears every challenge with hearCase({ seed: s.seed, day, index, violations: d.outcome.violations, evidence }).
   - Ruling keeps index, upheld, removed and note (src/replay.test.ts reads them) and gains court: CourtCase.
   - After close and after every appeal, rulings (upheld, removed, note), registry (settle applied to the registry as it stood when the court sat; keep that in state) and end reflect the cases as they stand.
   - Court notes use the final upheld state and never repeat a line (the \`shown\` list, as at close).
   - For endDay, pass correct = isUpheld(case) for challenges, so the bounty and deposit follow the court. Appeal fees and the bonus are the economy's, which the integrator adds.
6. save.ts: record and replay a challenge with its evidence and an appeal of case n (JSON-safe steps); parse() validates them; old saves still parse. Add a new test file for the round trip.
7. The court screen (Screens.tsx, screens.css), per "The court" and its Pacing in game-design.md. One screen:
   - A case with evidence is one line plus the ruling, and no APPEAL.
   - A hunch shows its jurors (small pixel faces: generatePortrait with a seed per juror index, or your own) with speech bubbles, then the ruling.
   - A dismissed hunch with a round left shows APPEAL with the jury size and fee ("Appeal · 7 jurors · 10 PNK"). Pressing it (click or keyboard) answers at once and plays the next round in place, 7 then 15 jurors.
   - A juror in two seats shows twice, with one vote each.
   - Upheld names every rule broken with evidenceLine, plus "Removed from the registry with them: NAME, who vouched for them." when a voucher goes.
   - Dismissed keeps exactly "Challenge dismissed. No rule broken; registered." It is the court's finding, identical whether the applicant was valid or the jury missed, so it never reveals validity before the clerk decides to appeal.
   - Remove the old header line about the jury not being delivered yet.
   - Space or Enter still goes to the accounts unless a button has focus.
   - A court with no appeals reads in under 30 seconds (every animation finished and "To the accounts" usable), even with 10 hunches.
   - Ten cases on day 6 must fit 1280×700 (e2e/fit.spec.ts "a court that hears ten challenges"), so be compact (e.g. collapsed juror rows).
   - Grey, stamped, official; the game never winks.
   - Keep the testids 'ruling', the region "Humanity Court" and the "To the accounts" button. Add data-testid 'round', 'juror' (with data-vote), 'appeal' and 'evidence-line'.
8. Checks: npm run typecheck; npx vitest run. Expected failures are only tests pinned to the pre-jury court (at least the replay snapshot); list each with its reason. Anything else failing is yours to fix.
9. Look at it: start your own server with \`npx vite --port 5191 --strictPort\` in the background, and drive it with a small node script using chromium from @playwright/test. Reach the court with some evidence and some hunch challenges (e.g. ?seed=1&day=2, Space opens and calls, C challenges, I inspects; see e2e/slice3.spec.ts for how Inspect is driven), then press APPEAL. Also check ?seed=1&day=6 with 10 challenges at 1280×700. Save PNGs to notes/evidence/slice4/screen-*.png and look at them with the Read tool. Fix what looks wrong, and say in notesForIntegrator what a new player notices in the first five seconds. Kill the server when done.`

function retryPrompt(first, name, branch) {
  return `${name === 'engine' ? ENGINE : SCREEN}

THIS IS YOUR ONE RETRY. The first attempt returned:
${JSON.stringify(first, null, 2)}

Continue from its work: after setup, if branch ${first && first.branch ? first.branch : branch} exists, run \`git checkout -b ${branch}-retry ${first && first.branch ? first.branch : branch}\` and finish what is missing or failing (the setup steps still apply). If the branch doesn't exist or has no commits beyond ${CONTRACT}, start from ${CONTRACT} on ${branch}-retry. Hard deadline for the retry: ${T.retryDone}.`
}

async function build(name, prompt, branch) {
  const first = await agent(prompt, { label: `${name} worker`, phase: 'Build', isolation: 'worktree', schema: WORKER_SCHEMA })
  if (first && first.status === 'done') return { name, attempts: 1, result: first }
  log(`${name} worker returned ${first ? first.status : 'nothing'}; running its one retry`)
  const second = await agent(retryPrompt(first, name, branch), { label: `${name} retry`, phase: 'Build', isolation: 'worktree', schema: WORKER_SCHEMA })
  return { name, attempts: 2, result: second || first, first }
}

phase('Build')
const [engine, screen] = await parallel([
  () => build('engine', ENGINE, 'court-engine'),
  () => build('screen', SCREEN, 'court-screen'),
])
log(`engine: ${engine && engine.result ? engine.result.status + ' on ' + engine.result.branch : 'failed'}; screen: ${screen && screen.result ? screen.result.status + ' on ' + screen.result.branch : 'failed'}`)

const INTEGRATE_SCHEMA = {
  type: 'object',
  properties: {
    status: { type: 'string', enum: ['done', 'partial', 'blocked'] },
    commit: { type: 'string' },
    changedFiles: { type: 'array', items: { type: 'string' } },
    checks: WORKER_SCHEMA.properties.checks,
    acceptanceRows: {
      type: 'array',
      items: {
        type: 'object',
        properties: { row: { type: 'string' }, passing: { type: 'boolean' }, evidence: { type: 'string' } },
        required: ['row', 'passing', 'evidence'],
      },
    },
    testChanges: { type: 'array', items: { type: 'string' } },
    decisions: { type: 'array', items: { type: 'string' } },
    untested: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    firstFiveSeconds: { type: 'string' },
  },
  required: ['status', 'commit', 'changedFiles', 'checks', 'acceptanceRows', 'testChanges', 'decisions', 'untested', 'risks', 'firstFiveSeconds'],
}

phase('Integrate')
const integrated = await agent(`
You are the integrator for slice 4 ("the jury") of the browser desk game in ${REPO}. Work directly in ${REPO}, which has the branch "court" checked out (HEAD ${CONTRACT}, the CourtCase contract). Two workers built in parallel worktrees:

ENGINE WORKER (src/court only):
${JSON.stringify(engine, null, 2)}

SCREEN WORKER (src/ui only, with a fake engine):
${JSON.stringify(screen, null, 2)}

Read src/court/types.ts, notes/game-design.md ("The court", "Economy", "Writing the jokes"), notes/acceptance.md (Slice 4 and "Always true") and AGENTS.md's "Done means".

Deadline: run \`date +%H:%M\` often. Everything committed by ${T.integrateDone}. Do the must-haves in this order and commit after each milestone, so a stop leaves a working branch.

1. Merge. Run \`git merge --no-ff <engine branch>\` then the screen branch (use the branch each worker reported, and if one failed, integrate what exists and say so). End merge commit messages with "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".
2. The real engine. Point the UI's one court module at src/court/jury.ts and delete the fake. Move src/ui/courtWords.ts to src/content/court.ts, and edit the lines per "Writing the jokes"; cut any that aren't clearly funny.
3. Economy (src/economy/economy.ts). The Case for a challenge carries the court's result, e.g. an optional court: { upheld, appeals }. Upheld pays the bounty, and after appeals also refunds the fees and pays APPEALS.bonus. Dismissed loses the deposit and keeps the fees. A Case without it falls back to \`correct\`. economy.test.ts must pass untouched: it pins PAY with toEqual, payShift([]) with exactly its six keys, and payLines with exactly four lines, so add fields and lines only when an appeal happened. The reducer passes the court results, and the Statement shows the appeal lines.
4. The balance row, as a new test file. The hunch clerk decides like the perfect bot, never inspects (every challenge a hunch) and appeals a dismissed hunch only when the fault is in the plainest tier. It must end the week behind a careful clerk (evidence on every challenge; the old perfect bot) and ahead of the 2-mistakes-a-day bot, over the same 20 seeds, on average and in at least 18 of 20. If it fails, tune the jury chances in src/court/jury.ts (not the fees) and rerun the engine's fairness tests. Also test the fees, refunds and bonus against APPEALS. The existing balance tests must still pass.
5. e2e/slice4.spec.ts (new), for the Playwright row:
   (a) A hunch dismissed, appealed once, 7 jurors, the final ruling. Find a seed/day/queue index where a hunch on a fake is dismissed in round 1 with a quick vitest probe using the real engine. Pin it with a guard that says "changed: pick another", as the other specs do.
   (b) A case with evidence (Inspect finds the fault, then Challenge) prints the evidence on the slip and shows no APPEAL in court.
   (c) A court with no appeals reads in under 30 seconds: measure from the court appearing until every animation has finished and "To the accounts" is usable, on a day with many hunches.
   Take screenshots and copy the useful ones to notes/evidence/slice4/.
   Also cover "Every ruling names every rule broken and the things that disagree" (e2e, or a render test like src/ui/labels.test.tsx).
6. Existing tests that fail only because they pin the pre-jury court (challenge a fake without Inspect and expect upheld): update them minimally, keeping their intent. The e2e helpers should Inspect the fault before challenging a fake they expect upheld, so it carries evidence; don't weaken assertions. Regenerate src/__snapshots__/replay.test.ts.snap only after checking the diff changes only court results and totals. List every test change. Any other failing test means the code is wrong: fix the code, not the test.
7. Run everything: npm run typecheck, npm test, and npm run test:e2e. Before e2e, check that port 5175 is served from ${REPO}: \`lsof -nP -iTCP:5175 -sTCP:LISTEN\`, then \`lsof -p <pid> | grep cwd\`. If nothing is listening, Playwright starts its own server. Look at the new screenshots with the Read tool, and say what a new player notices in the first five seconds of the court.
8. Evidence: fill the Evidence column of "Slice 4: the jury" in notes/acceptance.md (test names, measured numbers, screenshot paths; leave a row empty rather than overclaim) and refresh the counts in the first "Always true" row. If you tuned the court's chances, add a one-line "Measured" note to "The court" in notes/game-design.md, like the economy's.
9. Commit on court. Never merge into main, never push.

Return: status, final commit, changed files, every command run with its real result, each Slice 4 row with passing true/false and its evidence, test changes, decisions you made, what is untested, risks, and the first five seconds.`, { label: 'integrator', phase: 'Integrate', schema: INTEGRATE_SCHEMA })

const VERIFY_SCHEMA = {
  type: 'object',
  properties: {
    skipped: { type: 'boolean' },
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
    rowsChecked: { type: 'array', items: { type: 'string' } },
  },
  required: ['skipped', 'findings', 'rowsChecked'],
}

phase('Verify')
const verdict = await agent(`
Adversarially verify slice 4 ("the jury") as integrated on the "court" branch of ${REPO} (read-only: change no files and make no commits). The integrator reported:
${JSON.stringify(integrated, null, 2)}

Time box: run \`date +%H:%M\`. If it is past ${T.verifyStart}, return { skipped: true, findings: [], rowsChecked: [] } at once. Otherwise stop by ${T.verifyDone}.

Try to break the claims, don't confirm them:
- Every row of "Slice 4: the jury" in notes/acceptance.md: is the cited test real, and does it test the row, not a weaker version?
- Design invariants from AGENTS.md and "The court" in notes/game-design.md:
  - A case with evidence is always upheld and shows no appeal.
  - Nothing on the court screen, the case slip or \`window.__game\`-free UI text reveals whether a dismissed hunch's applicant was valid before the clerk chooses to appeal.
  - Jurors never uphold a valid applicant.
  - Pure modules stay pure.
  - Same seed gives the same court, appeals included, also through save and reload (src/ui/save.ts replays appeal steps).
  - No dead clicks: APPEAL answers at once.
  - Money follows APPEALS in src/economy/economy.ts.
  - Tests edited by the integrator kept their intent.
Run \`npm run typecheck\` and \`npx vitest run\`. Run e2e only if you need a specific test, with \`npx playwright test e2e/<file> -g "<name>"\`, after checking port 5175 is served from ${REPO}.
Report only findings with concrete evidence (file:line, command output, a failing input). 'blocking' means a Slice 4 row is not actually met, a check fails, or an invariant is broken.`, { label: 'verifier', phase: 'Verify', schema: VERIFY_SCHEMA })

const blocking = verdict && !verdict.skipped ? verdict.findings.filter((f) => f.severity !== 'minor') : []
let fixed = null
if (blocking.length) {
  phase('Fix')
  log(`${blocking.length} blocking/major findings; one fix pass`)
  fixed = await agent(`
Fix these verified findings on the "court" branch of ${REPO} (slice 4, the jury), then rerun the checks and commit (never main, never push). End commit messages with "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>".

Findings:
${JSON.stringify(blocking, null, 2)}

Integrator's report, for context:
${JSON.stringify(integrated, null, 2)}

Hard deadline: run \`date +%H:%M\`. Commit by ${T.fixDone}, and skip any fix that won't fit. Don't weaken tests to make them pass. Before e2e, check that port 5175 is served from ${REPO}. Update the Evidence column in notes/acceptance.md if a row's evidence changed.
Return: which findings you fixed and which you skipped (and why), commands run with results, final commit hash.`, { label: 'fixer', phase: 'Fix' })
} else if (verdict && verdict.findings.length) {
  log(`verifier found only minor issues (${verdict.findings.length}); no fix pass`)
}

return { engine, screen, integrated, verdict, fixed }
