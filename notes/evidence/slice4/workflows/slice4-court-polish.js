export const meta = {
  name: 'slice4-court-polish',
  description: 'Slice 4 minor findings in three parallel lanes (tests, evidence integrity, court screen), then one adversarial review and a fix pass',
  phases: [
    { title: 'Fix', detail: 'three lanes on disjoint files' },
    { title: 'Review', detail: 'adversarial review of this round' },
    { title: 'Repair', detail: 'only if the review confirms a serious problem' },
  ],
}

const REPO = '/Users/kemuru/repos/poh-papers-please'
const CONTEXT = `
Project: a browser desk game in ${REPO}, branch "court". Slice 4 ("the jury") is built and its checks pass; the working tree has uncommitted work from this session (git status). You are fixing minor review findings. Work directly in ${REPO}.
Read as needed: notes/game-design.md "The court (end of each shift)" and "Writing the jokes"; src/court/types.ts; src/court/jury.ts; src/ui/week.ts; src/ui/Screens.tsx; src/ui/screens.css; src/ui/save.ts; src/ui/Shift.tsx; src/ui/evidence.ts; e2e/slice4.spec.ts.
Rules:
- Edit ONLY the files your lane lists. Other lanes are editing other files at the same time.
- Don't commit or touch git history.
- Don't weaken or delete any assertion. The test files created this session (src/court/jury.test.ts, src/economy/jury-balance.test.ts, src/ui/courtRuling.test.tsx, src/ui/courtAppeal.test.ts, src/ui/courtSave.test.ts, e2e/slice4.spec.ts) may be extended. Tests from before slice 4 may not be edited.
- src/rules, src/gen, src/court and src/economy stay pure.
- Before e2e, check that port 5175 is served from ${REPO} (\`lsof -nP -iTCP:5175 -sTCP:LISTEN\`, then \`lsof -p <pid> | grep cwd\`). Run e2e one spec or one -g test at a time, never the whole suite.
- Match the codebase: dry doc comments, the same idiom.
Return: per item, done or skipped (with why); files changed; commands run with their real results.`

const LANES = [
  {
    key: 'tests',
    prompt: `LANE: tests that prove their row. Files: src/economy/jury-balance.test.ts, src/court/jury.test.ts, and a new src/courtReplay.test.ts with its snapshot.
1. jury-balance.test.ts, "a careful clerk is never dismissed on a real fault, so never appeals": today it asserts only appeals === 0, which holds whatever the jury does. Collect the careful clerk's court cases (playDay's litigant option returns \`cases\`) and assert every one isUpheld with rounds.length === 1. Mutation check: in a scratch copy of the idea (not the real file), a first jury that ignores evidence must fail this test. Describe how you checked.
2. jury.test.ts: pin visibility() for the faults the design names, as a table: phrase silence, a QR sign and no sign are plain; a wrong word and a mirrored photo are often; a panel (human machine) and a changing ear (human changes) are rare. Also pin the tuned ones (sign with 2 or 3 wrong characters, vouch unregistered and busy, any duplicate: rare), from real generated applicants or hand-built Violations.
3. A new src/courtReplay.test.ts: "same seed, same court, appeals included (snapshot)". Play whole weeks through the reducer (src/ui/week.ts), as src/replay.test.ts does (copy its runWeek pattern; don't import from the test file). Use a clerk that files evidence on every other fake (build Evidence from a real inspect() finding at the window: src/rules/inspect.ts, the Items that find the fault; or { rule, items } for a rule they broke), challenges the rest on hunches, and appeals every dismissed hunch, dispatching { type: 'appeal', index } until canAppeal is false.
   Snapshot per day: each ruling's index, evidence rule or 'hunch', and per round the size, fee and uphold count; plus the day's pay total and savings.
   Assert the same seed twice gives equal summaries, and a different seed a different one. Seeds 1 and 2. Write the snapshot once, then run the test again to check it is stable.
Run npx vitest run for your files, then the whole suite, and npm run typecheck.`,
  },
  {
    key: 'evidence',
    prompt: `LANE: evidence integrity. Files: src/ui/save.ts, src/ui/courtSave.test.ts, src/ui/Shift.tsx, and e2e/slice4.spec.ts. The spec is yours only for item 3; another lane may edit none of these.
1. save.ts: a saved { challenge: Evidence } step is replayed today with only its shape checked. A hand-edited save can file "evidence" that Inspect could never find, e.g. Rule 3 on day 2 when the sign rule isn't in force. The court then prints it and hides the jury that actually heard the case.
   When replaying, keep the step only if inspect(items[0], items[1], applicant, rulebookForDay(day), registry at that moment) (src/rules/inspect.ts) is an in-force finding under evidence.rule. Otherwise the step leads nowhere and the save is set aside, as other bad steps are. Check which registry the Shift used for inspect (state.registry before the decide), and use the same.
   Add tests to courtSave.test.ts: a real finding replays; a not-in-force rule, a rule the applicant didn't break, or items that don't disagree are set aside.
2. Shift.tsx: vouch evidence names the record as the clerk typed it ("ethel   pargeter"), because the name-record Item carries the typed text. When recording evidence, if an item is a name-record whose name is sameName (src/rules/registry.ts) with the applicant's voucher, store the voucher's own spelling. Keep inspect() behaviour identical.
   The save round trip must still validate, which it will, since inspect uses sameName.
   Test it at the unit level if you can (e.g. in courtSave.test.ts, through evidenceWords on the stored Evidence), otherwise in e2e.
3. e2e/slice4.spec.ts: evidence is cleared between applicants. Extend "a case filed with what Inspect found…" or add a test. Seed 1 day 2: the unit at index 2 is filed with evidence; then challenge Pat (index 3, a fake) on a hunch, without Inspect. Assert Pat's slip ('filing-evidence') reads "No evidence filed. The jury will look for itself." and window.__game.decided[3].evidence is undefined.
   Also, if cheap: an Inspect finding not in force doesn't become evidence. Find any applicant with a disagreement under a rule not yet in force (the inspector says "These disagree, but no rule in force covers it. Yet."), e.g. the Influencer's filtered photo against a frame on day 1; search seeds with a quick probe you delete. Challenge them and assert no evidence. Skip this part if no such applicant is findable within a few minutes, and say so.
Run npm run typecheck, npx vitest run, and your e2e spec.`,
  },
  {
    key: 'screen',
    prompt: `LANE: the court screen. Files: src/ui/Screens.tsx, src/ui/screens.css, src/ui/evidence.ts, src/ui/courtRuling.test.tsx, and notes/evidence/slice4/*.png if a picture changes.
1. The tally ("Jury of 3 · 1 of 3 uphold", "Appeal 1 · jury of 7 · 0 of 7 uphold") is printed before the jurors sit, which gives each hearing away before its stamp; above all on an appeal, the court's one decision moment. Show the count only when the last seat of that round has sat: e.g. the heading's tally part fades in at first + size × gap, hidden with visibility until then, as the outcome is. Keep the jury's heading (its size) visible at once. Past juries on an appealed case keep their tally visible, as now.
2. On a crowded court, a card beside an appealed card stretches, and its text drops away from the photo: align-content: start on .docket.crowded .hearing (and any layout where rows stretch).
3. On the crowded board the stamps are unreadable across dark mugshots ("DIS▒▒SED"): the multiply-blended stamp sits over the photo. Give the crowded stamp a legible ground (e.g. no multiply there and an opaque paper background with the stamp's border) so "DISMISSED" and "UPHELD" read whole on any skin tone. Look at the result.
4. Two rulings on one board can contradict each other: Chidi's upheld ruling says "Rule 4: Ingrid Oyelaran is not registered." while Ingrid's challenge on the same board is dismissed and registered. The ruling judges at the window.
   In the court only, word a vouch 'unregistered' line in the past, as at the window, e.g. "Ingrid Oyelaran was not registered when the applicant came to the window." (fit the house voice; keep it short). Also 'busy': "... was already vouching for ...".
   Do it with a parameter on evidenceLine (e.g. evidenceLine(v, 'court')), so the desk's inspector and citations keep the present tense.
   Update courtRuling.test.tsx to compare against the court wording, keeping every assertion as strict as it is. Check the slips and inspector still use the present-tense line (grep every evidenceLine call).
5. Check your layout still fits: run \`npx playwright test e2e/slice4.spec.ts --reporter=line --retries=0\` and \`npx playwright test e2e/fit.spec.ts --reporter=line --retries=0\`, each once (they are short). Retake court-day6.png and court.png into notes/evidence/slice4/ only if your change is visible in them (the spec's shot helper writes to test-results; copy from there), and look at them with the Read tool.
Run npm run typecheck and npx vitest run.`,
  },
]

phase('Fix')
const lanes = await parallel(LANES.map((l) => () => agent(`${CONTEXT}\n${l.prompt}`, { label: `lane: ${l.key}`, phase: 'Fix' })))

const REVIEW = {
  type: 'object',
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        properties: { severity: { type: 'string', enum: ['blocking', 'major', 'minor'] }, title: { type: 'string' }, file: { type: 'string' }, evidence: { type: 'string' }, fix: { type: 'string' } },
        required: ['severity', 'title', 'file', 'evidence', 'fix'],
      },
    },
    checks: { type: 'array', items: { type: 'string' } },
  },
  required: ['findings', 'checks'],
}

phase('Review')
const review = await agent(`${CONTEXT}
You are an adversarial reviewer of the round just done. Read-only: change no tracked file, and delete any scratch file you make. Three lanes reported:
${JSON.stringify(lanes.map((r, i) => ({ lane: LANES[i].key, report: r })), null, 1)}

Also in the tree from the lead: src/gen/gazette.ts story() now counts a fake the court registered (a dismissed challenge on someone who broke a rule) as a registered fake, so the next morning's headline reports it instead of "NOTHING HAPPENS".

Inspect \`git diff\` and the new files. Try to break each change:
- Tests that can't fail, and assertions weakened (compare \`git diff\` of test files).
- Snapshot instability.
- A save validation that rejects real play: a save made by playing the game must still load. Try one through the reducer with real inspect() evidence at several days, including vouch and duplicate evidence found through the registry.
- Evidence spelling that breaks the save round trip.
- A tally that never appears, or appears at the wrong time after an appeal.
- Stamps or layout that regress on any court size (1 to 10 cases).
- Wording that breaks the house voice or reveals validity.
- The Gazette change: can it now leak anything the clerk should not know before the court rises? It runs the next morning. Does any existing test or the "no line twice" rule break?
Run npm run typecheck and npx vitest run. Run e2e only as single specs (slice4, fit, slice3), one at a time.
'blocking' means a check fails or an invariant breaks; 'major', a real bug. Report only findings with concrete evidence.`, { label: 'review', phase: 'Review', schema: REVIEW })

const serious = review ? review.findings.filter((f) => f.severity !== 'minor') : []
let repaired = null
if (serious.length) {
  phase('Repair')
  repaired = await agent(`${CONTEXT}
You may now edit any file the fixes need. Fix these confirmed findings, checking each first; skip any that doesn't reproduce and say why. Prove each fix with a test, and don't weaken any test.
${JSON.stringify(serious, null, 1)}
Then run npm run typecheck, npx vitest run, and the e2e specs involved, one at a time.`, { label: 'repair', phase: 'Repair' })
}

return { lanes: lanes.map((r, i) => ({ lane: LANES[i].key, report: r })), review, repaired }
