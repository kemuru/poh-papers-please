# Day one rules and robot tells: what a "one new rule per day" restructure, and any change to Rule 0's lamp, would touch in the code

Scope note: all sources are repository files (links are relative to this notes file, so `../../src/...` is the repo's `src/`). Line numbers are as read on 30 Sep 2026. The working tree is on `main` at 8ccf4c6, the merge of `slice-6`. Source (`src/`) and tests (`e2e/`) are identical on `main` and `slice-6`. While I worked, the `slice-6` pointer moved (first seen one docs-only commit ahead, 5606d02; later at 0b74581, an ancestor of `main`). Its notes changes now sit uncommitted in `notes/`, and `git diff HEAD -- src e2e` is empty. Measured figures marked "probe" come from bundling `src/gen/day.ts` in memory with esbuild (`write: false`) and calling `planWeek`. No repository file was written.

## 1. The schedule and the checks: which rule is in force when, what each checks, and who breaks what on which day

### Takeaway
Rule 0 (`human`) has day 0 in `RULE_DAYS`, so day 1's rulebook has two pages (0 and 1), and every day after it adds one. Every week has the same fakes on days 1 to 5: Pat (the newest rule) plus the day's Likeness unit. Days 2 and 3 are the only days where a fake breaks an older rule, and that fake is always the unit caught by Rule 0's lamp. Day 6 adds two random extras, and day 7 has no new rule.

### Cited Findings
- `RULE_DAYS = { human: 0, phrase: 1, photo: 2, sign: 3, vouch: 4, duplicate: 5, living: 6 }`. `rulebookForDay(day)` keeps the rules whose day is `<= day`. The comment reads "Rule 0 was in force before the week began" — [src/rules/judge.ts:11-20](../../src/rules/judge.ts#L11). Tests pin this: `rules.test.ts` expects that exact object, page counts `[2, 3, 4, 5, 6, 7, 7]` for days 1 to 7, and `rulebookForDay(1)[0] === 'human'` — [src/rules/rules.test.ts:116-119](../../src/rules/rules.test.ts#L116). `judge.test.ts` expects `rulebookForDay(1)` to equal `['human', 'phrase']` — [src/rules/judge.test.ts:18-19](../../src/rules/judge.test.ts#L18).
- `judge()` runs every rule in force and returns every violation, not only the first. A challenge names no rule — [src/rules/judge.ts:22-73](../../src/rules/judge.ts#L22).
- What each check reads:
  - **Rule 0** `checkHuman`, in this order: any lit frame gives `machine` (the first lit frame, with the lamp size); a frame whose face differs gives `changes`; `still` gives `picture`; `generated` gives `generated` — [src/rules/human.ts:10-17](../../src/rules/human.ts#L10). Lit frames are every frame with the eyes shut, and only if `video.lamp` is set. Frame 1 is shut only for a `nervous` blinker; frame 3 is shut if the applicant blinked and is not a still — [src/rules/face.ts:16-27](../../src/rules/face.ts#L16).
  - **Rule 1** phrase: `checkPhrase(transcript)` — [src/rules/judge.ts:27-30](../../src/rules/judge.ts#L27).
  - **Rule 2** photo: a mirrored photo, or a photo that is not the face in a frame. It skips the glitch frame on purpose: "A frame where the face turns into another is Rule 0's business" — [src/rules/photo.ts:1-11](../../src/rules/photo.ts#L1).
  - **Rule 3** sign: no sign or a QR code, or more than one character wrong — [src/rules/sign.ts:12-19](../../src/rules/sign.ts#L12).
  - **Rule 4** vouch: none, self, unregistered, or busy — [src/rules/vouch.ts:7-16](../../src/rules/vouch.ts#L7).
  - **Rule 5** duplicate: the face is on file, with a twin exception — [src/rules/duplicate.ts:7-12](../../src/rules/duplicate.ts#L7).
  - **Rule 6** living: born 1900 to 2026, and blinked — [src/rules/living.ts:4-15](../../src/rules/living.ts#L4).
- The rule pages. Rule 0, "A real human", has:
  - the policy quote with the words that count in bold;
  - three checks ("In every frame, eyes open or shut: the same human face, giving off no light."; "Three identical frames: a picture held up."; "A video generator leaves its mark ✦ in a corner.");
  - Fig. 0, captioned `['Fig. 0-1','Eyes shut.','No light.']` and `['Fig. 0-2','A light:','a robot.']`;
  - a note that anything worn or carried does not count.

  Source: [src/content/rulebook.ts:24-41](../../src/content/rulebook.ts#L24). A caption has three lines at most, or the page costs the hall — [src/content/rulebook.ts:5](../../src/content/rulebook.ts#L5). The other pages are at [src/content/rulebook.ts:42-84](../../src/content/rulebook.ts#L42).
- Applicants and fakes per day: 5/2, 7/2, 8/2, 8/2, 9/3, 10/3, 7/3, with a clock on days 2 to 6 — [src/gen/day.ts:32-44](../../src/gen/day.ts#L32). `compose` throws unless the scripted fakes equal `plan.fakes` — [src/gen/day.ts:235-236](../../src/gen/day.ts#L235).
- Day 1's queue is hard-coded as `[first(), pat, unit, ...shuffle([Ethel, influencer ?? fillIns[0]])]` — [src/gen/day.ts:247-248](../../src/gen/day.ts#L247). The first applicant is Hortense Cobbold, who is valid — [src/gen/day.ts:447-451](../../src/gen/day.ts#L447). Pat's day 1 video says "a real hooman" — [src/content/cast.ts:300-303](../../src/content/cast.ts#L300). Probe over seeds 1 to 2000: the unit is third in every week, and only four day 1 orders occur — [src/gen/day.ts](../../src/gen/day.ts#L247).
- `unitOn(day)` builds the unit with:
  - face `UNIT_FACES[day-1]` and tell `UNIT_LAMPS[day-1]`;
  - the phrase word for word, and a blink;
  - `planted: human:machine` if the day has a lamp;
  - on day 4, its maker's vouch (`vouch:company`); on day 5, Wendell Binns vouching and `duplicate:unit`; on day 6, Vera Binns vouching.

  It is "Built without the week's random numbers, so nobody else changes" — [src/gen/day.ts:453-478](../../src/gen/day.ts#L453). `UNIT_LAMPS` is `bloom`, `glow` (with `nervous`), `glow`, `null`, `null`, `small`, `slit` — [src/content/portraits.ts:42-55](../../src/content/portraits.ts#L42).
- Pat's faults: day 1 `phrase:wrong-word`, day 2 `photo:mirrored`, day 3 `sign:two-wrong`, day 4 `vouch:unregistered` (Pat's mother), day 6 valid — [src/gen/day.ts:480-501](../../src/gen/day.ts#L480). Pat comes on days `[1,2,3,4,6]` — [src/gen/day.ts:49](../../src/gen/day.ts#L49).
- Every week's fakes, measured by the probe over seeds 1 to 2000 — [src/gen/day.ts](../../src/gen/day.ts#L126):
  - Day 1: Pat `phrase` (the day's new rule) and the unit `human:machine` (Rule 0, in force "before the week").
  - Day 2: Pat `photo:mirrored` (newest) and the unit `human:machine` (older rule).
  - Day 3: Pat `sign:two-wrong` (newest) and the unit `human:machine` (older rule).
  - Day 4: Pat `vouch:unregistered` and the unit `vouch:company`, both the newest rule.
  - Day 5: the unit `duplicate:unit` and two Farm cousins `duplicate:farm`, all the newest rule.
  - Day 6: the unit `human:machine` (older rule) plus two extras. Of 4,000 extras, 918 break Rule 6: the Cutout (439), the Agent born "v4" (148) and a typo in the year (331). The other 3,082 break older rules only.
  - Day 7: the unit (the slit, Rule 0), the clerk (`phrase`) and one fill-in with a phrase fault. There is no new rule.
- Testers: none on days 1, 4 and 7. On days 2 and 3 the tester is the unit, Pat or a fill-in; on day 5 the unit or the first cousin; on day 6 the unit, Nigel or a fill-in — [src/gen/day.ts:277-287](../../src/gen/day.ts#L277). Generated look-alikes exist only for photo, sign and living, with days hard-coded in `DAYS_OF = { photo: 2, sign: 3, living: 6 }` rather than read from `RULE_DAYS` — [src/gen/day.ts:689-717](../../src/gen/day.ts#L689).
- Design: "Most applicants are valid: about 65 to 75% on any day (day 1, the scripted tutorial, is 3 of 5 …)" — [notes/game-design.md:44](../../notes/game-design.md). The test requires day 1's valid share to be exactly 0.6, and every other day 0.65 to 0.75 — [src/gen/day.test.ts:28-41](../../src/gen/day.test.ts#L28).
- The design's day table: day 1 is "The phrase; Rule 0 is on the first page, as it has always been, and on day 1 the rulebook is open there at every call"; day 7 is "None: Humanity Day" — [notes/game-design.md:33-41](../../notes/game-design.md). The Rule 0 row of the rulebook table is at [notes/game-design.md:85-90](../../notes/game-design.md). "Each new rule comes with its reason, usually something that got registered the day before" — [notes/game-design.md:48](../../notes/game-design.md).

### Inferences
- On days 2 to 5, the only fake an older rule catches is the day 2 or day 3 unit. Every other fake on those days breaks the day's newest rule. So Rule 0 is what makes the player re-check an old rule before day 6.
- `RULE_DAYS` drives `judge`, Inspect's `inForce` and the rulebook's tabs. The generator, though, hard-codes days in `DAYS_OF`, `testerFor`, `patOn`, `unitOn`, `UNIT_LAMPS` and the day 1 queue. Moving a rule to another day is therefore more than a one-line change.

### Gaps
- The splits by day are from my own in-memory probe, not from a test in the repository. The method is described in the scope note.

## 2. Everything that depends on Rule 0, the `human` rule id, or the lamp

### Takeaway
A plain grep for "Rule 0 / Memo 0 / Fig. 0" finds 95 matches in 27 files. The count misses the welcome letter's two escaped `Rule 0` strings. The `human` rule id runs through the rule engine, the generator, the court, the Gazette's ordering, the save validator, the UI and the e2e helper. The lamp has its own rendering path, figure, citation reprint, jury tiers, ending still, content lines, tests and snapshots.

### Cited Findings
- **Grep counts** (`Rule 0|Memo 0|Fig. ?0` in `src` and `e2e`):

  | File | Matches |
  |---|---|
  | e2e/rule0.spec.ts | 14 |
  | src/content/verdicts.ts | 12 |
  | src/ui/rule0Figure.test.tsx | 10 |
  | rulebook.ts, slice5.spec.ts, slice3.spec.ts | 5 each |
  | desk.css, courtRuling.test.tsx, Slips.tsx, Documents.tsx, rules.test.ts, hall.ts, content/gazette.ts, slice4.spec.ts | 3 each |
  | citationFilm.test.tsx, Shift.tsx, inspect.test.ts, week.test.ts, day.ts, portraits.ts, cast.ts | 2 each |
  | photo.ts, judge.ts, inspect.ts, human.ts, day.test.ts, fairClue.test.ts | 1 each |

  The welcome letter writes `Rule 0` and `Fig. 0-2` as escapes, so a plain grep misses them — [src/content/gazette.ts:156-159](../../src/content/gazette.ts#L156).
- **The rule engine and its types**:
  - `RuleId` includes `'human'` — [src/rules/types.ts:51](../../src/rules/types.ts#L51).
  - The `human` violation has problems `machine | changes | picture | generated`, a frame and `lamp?` — [src/rules/types.ts:75-81](../../src/rules/types.ts#L75).
  - `Video.lamp` — [src/rules/types.ts:28-29](../../src/rules/types.ts#L28).
  - `CHECKS.human` — [src/rules/judge.ts:23-26](../../src/rules/judge.ts#L23).
  - Inspect returns `human` for a photo against a lit or changing frame, a lit frame against a dark one, and a frame against Rule 0 — [src/rules/inspect.ts:51-66](../../src/rules/inspect.ts#L51).
- **The generator**:
  - `Mistakes.human` has four kinds (machine, deepfake, printed, generated), and `LookAlikes.human = 'costume'` — [src/gen/applicant.ts:13-15](../../src/gen/applicant.ts#L13), [src/gen/applicant.ts:30-32](../../src/gen/applicant.ts#L30).
  - The unit's planted fault — [src/gen/day.ts:464](../../src/gen/day.ts#L464).
  - The Agent, Cutout and Deepfake — [src/gen/day.ts:589-622](../../src/gen/day.ts#L589).
  - Dave's look-alike — [src/gen/day.ts:548](../../src/gen/day.ts#L548).
- **The Gazette's ordering**: `notAPersonFirst` sorts cases that broke `human` first, both for registered fakes and for fakes the court missed — [src/gen/gazette.ts:108-113](../../src/gen/gazette.ts#L108).
- **The save validator**: `RULES` lists `'human'`, so saved evidence with any other rule id fails validation — [src/ui/save.ts:94](../../src/ui/save.ts#L94). A save that no longer replays is set aside with a line saying "the Ministry has revised its forms" — [notes/game-design.md:236](../../notes/game-design.md).
- **Lamp rendering**:
  - Units are `species: 'android'` — [src/content/portraits.ts:4](../../src/content/portraits.ts#L4), [src/content/portraits.ts:10-40](../../src/content/portraits.ts#L10).
  - `UNIT_LAMPS` — [src/content/portraits.ts:47-55](../../src/content/portraits.ts#L47).
  - `SPECIMEN`, the figure's face — [src/content/portraits.ts:62-71](../../src/content/portraits.ts#L62).
  - `figureLamp(day)` — [src/content/portraits.ts:78](../../src/content/portraits.ts#L78).
  - Lamp colours — [src/gen/portraitParts.ts:84-85](../../src/gen/portraitParts.ts#L84). Lamp art, `bloom`, `glow`, `small` and `slit` — [src/gen/portraitParts.ts:135-144](../../src/gen/portraitParts.ts#L135).
  - The lamp is drawn only with the eyes shut — [src/gen/drawPortrait.ts:521-533](../../src/gen/drawPortrait.ts#L521).
  - `LAMP_SIZES` and `Portrait.lamp` — [src/gen/portrait.ts:35-36](../../src/gen/portrait.ts#L35), [src/gen/portrait.ts:87-88](../../src/gen/portrait.ts#L87).
- **Content**:
  - **Welcome letter**: line 2 says "starting with Rule 0: the registry is for real humans". Line 3 says "Rule 0 is read in the video … home robots with human faces. Their eyes are cameras … a night lamp … infrared … (Fig. 0-2)" — [src/content/gazette.ts:151-163](../../src/content/gazette.ts#L151). The letter is at its height budget: e2e measures the hall at three desk sizes — [e2e/rule0.spec.ts:87-110](../../e2e/rule0.spec.ts#L87) — and "it fails, 149 px against 174 at 1240×820, with one sentence more" — [notes/acceptance.md:70](../../notes/acceptance.md).
  - **Sticky note, day 1**: "NEXT calls someone. Check Rule 0 first, every frame. Court at five." Day 2's note announces the photo rule — [src/content/hall.ts:55-57](../../src/content/hall.ts#L55).
  - **Posters**: "CHECK EVERY FRAME goes up with Rule 0 on day 1, and back up on day 4" (days 1, 4 and 5) — [src/content/hall.ts:65-78](../../src/content/hall.ts#L65).
  - **PA announcements**:
    - day 1, "the queue is for humans" — [src/content/hall.ts:12](../../src/content/hall.ts#L12);
    - day 5, "The pigeon has been processed under Rule 0" — [src/content/hall.ts:35](../../src/content/hall.ts#L35);
    - day 6, "the Ministry is not a robot" and "blink where the camera can see, and to be filmed, not generated" — [src/content/hall.ts:41-43](../../src/content/hall.ts#L41).
  - **Gazette threads**:
    - day 2, the lamp is "a night lamp, and a standard feature";
    - day 3, units blink;
    - day 4, "dimmed the night lamp";
    - day 6, "Window 7 has been sent a copy of Rule 0";
    - day 7, "all known issues … resolved".

    Source: [src/content/gazette.ts:89-96](../../src/content/gazette.ts#L89).
  - **Gazette notices and headlines**: the day 7 notice says "Rule 0 remains in force, as it always has" — [src/content/gazette.ts:85](../../src/content/gazette.ts#L85). The unit headlines include 'LIKENESS: OUR UNITS "GIVE OFF NO VISIBLE LIGHT"' — [src/content/gazette.ts:10-18](../../src/content/gazette.ts#L10).
  - **Citation memos**: `CITATION_MEMOS.human` has Memo 0-A to 0-E, and 0-E reads "Rule 0 has been in force since before the Ministry had a building" — [src/content/verdicts.ts:11-17](../../src/content/verdicts.ts#L11).
  - **Unit memos by day** — [src/content/verdicts.ts:53-62](../../src/content/verdicts.ts#L53); `UNIT_MEMOS[s.day - 1]`, [src/ui/week.ts:313-316](../../src/ui/week.ts#L313):
    - day 1, 0-L: "shut its eyes and lit up";
    - day 2, 0-M: "shut its eyes twice … switched on both times";
    - day 3, 0-N: "The light above it was not";
    - day 4, 4-L, and day 5, 5-L;
    - day 6, 0-P, and day 7, 0-Q.
  - **The court's lines for a unit**: upheld only, indexed by day. Day 7's is "keep its eyes open …" — [src/content/verdicts.ts:109-120](../../src/content/verdicts.ts#L109), [src/ui/week.ts:322-326](../../src/ui/week.ts#L322).
  - **Queue gossip**: day 2 "one of those home robots tried to register yesterday", day 3 the robot at the bus stop, day 4 "My uncle vouched for his home robot" — [src/content/applicants.ts:278-284](../../src/content/applicants.ts#L278).
  - **Inspect's lines**: the "not in force" line and the guided lines — [src/content/desk.ts:4-13](../../src/content/desk.ts#L4).
- **Rulebook figure and page (UI)**:
  - Day 1 opens at `'human'`, and every call resets the book there — [src/ui/Shift.tsx:91-95](../../src/ui/Shift.tsx#L91), [src/ui/Shift.tsx:113-114](../../src/ui/Shift.tsx#L113).
  - The guided Inspect turns the book to Rule 1 — [src/ui/Shift.tsx:41-42](../../src/ui/Shift.tsx#L41), [src/ui/Shift.tsx:142-143](../../src/ui/Shift.tsx#L142).
  - Tabs and pages exist only for rules in force — [src/ui/Documents.tsx:170-198](../../src/ui/Documents.tsx#L170).
  - The figure sits under the first check — [src/ui/Documents.tsx:220-227](../../src/ui/Documents.tsx#L220). `FIGURE_CROP` and `RuleFigure` — [src/ui/Documents.tsx:236-264](../../src/ui/Documents.tsx#L236). CSS — [src/ui/desk.css:1706-1781](../../src/ui/desk.css).
- **The day 7 slit**: `UNIT_LAMPS[6] = 'slit'`, drawn as four pixels on the brow line; Fig. 0-2 shows the slit on day 7 — [src/content/portraits.ts:54](../../src/content/portraits.ts#L54), [src/gen/portraitParts.ts:142-143](../../src/gen/portraitParts.ts#L142), [src/content/portraits.ts:78](../../src/content/portraits.ts#L78).
- **Citations that reprint the video**: every `human` violation reprints the film; the frame is outlined for `machine` or `changes` — [src/ui/Slips.tsx:128](../../src/ui/Slips.tsx#L128), [src/ui/Slips.tsx:135-152](../../src/ui/Slips.tsx#L135), CSS [src/ui/desk.css:1060-1061](../../src/ui/desk.css). Captions — [src/content/verdicts.ts:67-72](../../src/content/verdicts.ts#L67). The evidence lines — [src/ui/evidence.ts:54-63](../../src/ui/evidence.ts#L54), [src/ui/evidence.ts:70-76](../../src/ui/evidence.ts#L70).
- **The court's find-chance tiers**: `FIND` sets how likely a seat is to find a fault by tier: plain .95/.98/.99, often .70/.85/.95, sometimes .55/.75/.90, rare .45/.65/.85 — [src/court/jury.ts:28-33](../../src/court/jury.ts#L28). `LAMP_TIERS` sets a lamp's tier by its size: `bloom` often, `glow` sometimes, `small` and `slit` rare. A changing face is rare; a picture or the generator's mark is sometimes — [src/court/jury.ts:52-69](../../src/court/jury.ts#L52). The design's decision that "the lamp's size sets the tier" was made for the day 1 unit on a hunch — [notes/game-design.md:249](../../notes/game-design.md).
- **The endings' Replaced still**: `IN_YOUR_LIKENESS = { ...CLERK_PORTRAIT, species: 'android', lamp: 'glow' }`, drawn in an open frame and a shut frame — [src/ui/Screens.tsx:489-515](../../src/ui/Screens.tsx#L489). The blink animation — [src/ui/screens.css:861-939](../../src/ui/screens.css). Caption "Window 3, camera 2, 17:04" and the camera label "a light shows between its brows" — [src/content/gazette.ts:127](../../src/content/gazette.ts#L127), [src/content/gazette.ts:132-135](../../src/content/gazette.ts#L132).
- **Unit tests that encode Rule 0 or the lamp**:
  - `rules.test.ts`: "Rule human", "Rule 0, the lamp" and the day-by-day rulebook — [src/rules/rules.test.ts:51-70](../../src/rules/rules.test.ts#L51), [src/rules/rules.test.ts:116-137](../../src/rules/rules.test.ts#L116).
  - `judge.test.ts` — [src/rules/judge.test.ts:18-19](../../src/rules/judge.test.ts#L18).
  - `inspect.test.ts`: the `human` pairs, and the lamp found only under Rule 0 — [src/rules/inspect.test.ts:51-57](../../src/rules/inspect.test.ts#L51), [src/rules/inspect.test.ts:73-85](../../src/rules/inspect.test.ts#L73).
  - `week.test.ts`: one rule besides Rule 0; the units' planted faults by day, `human:machine` on days 1, 2, 3, 6 and 7; Pat on the newest rule; the tutorial — [src/gen/week.test.ts:21-83](../../src/gen/week.test.ts#L21).
  - `day.test.ts`: the valid share, and "never valid, with one fault" — [src/gen/day.test.ts:28-57](../../src/gen/day.test.ts#L28), [src/gen/day.test.ts:98-100](../../src/gen/day.test.ts#L98).
  - `fairClue.test.ts`: the drawn lamp is in exactly the frames `litFrames` names — [src/fairClue.test.ts:38-56](../../src/fairClue.test.ts#L38), [src/fairClue.test.ts:108-114](../../src/fairClue.test.ts#L108).
  - `jury.test.ts`: the lamp tiers by day, and each kind of fault — [src/court/jury.test.ts:62-66](../../src/court/jury.test.ts#L62), [src/court/jury.test.ts:147-177](../../src/court/jury.test.ts#L147).
  - `rule0Figure.test.tsx`, five tests. One asserts `figureLamp` for days 1 to 7 is `['bloom','glow','glow','small','small','small','slit']` — [src/ui/rule0Figure.test.tsx:57-185](../../src/ui/rule0Figure.test.tsx#L57).
  - `citationFilm.test.tsx` — [src/ui/citationFilm.test.tsx:18](../../src/ui/citationFilm.test.tsx#L18).
  - `courtRuling.test.tsx`: "the day 2 unit, filed with frame 3 against Rule 0" — [src/ui/courtRuling.test.tsx:403-427](../../src/ui/courtRuling.test.tsx#L403).
  - `portrait.test.ts`: the lamp on every skin, only with the eyes shut, between the brows; plus a snapshot of the day 1 unit's `bloom` — [src/gen/portrait.test.ts:117-204](../../src/gen/portrait.test.ts#L117).
  - `humanityDay.test.ts`: the slit — [src/gen/humanityDay.test.ts:36-44](../../src/gen/humanityDay.test.ts#L36).
  - `endings.test.ts`: Replaced with the day 1 to 3 units; the special edition naming Clara Voss (day 1); no fee for a day 1 unit — [src/endings.test.ts:130-138](../../src/endings.test.ts#L130), [src/endings.test.ts:253-263](../../src/endings.test.ts#L253), [src/endings.test.ts:302-306](../../src/endings.test.ts#L302).
- **Snapshots**:
  - [src/__snapshots__/replay.test.ts.snap](../../src/__snapshots__/replay.test.ts.snap), 367 lines: day 1 lists "Clara Voss !human:machine" for seed 1 (line 10) and seed 2 (line 208), and the day 2, 3 and 6 units likewise.
  - [src/__snapshots__/courtReplay.test.ts.snap](../../src/__snapshots__/courtReplay.test.ts.snap), 352 lines: five `"evidence": "human"` entries.
  - [src/gen/__snapshots__/portrait.test.ts.snap](../../src/gen/__snapshots__/portrait.test.ts.snap): the day 1 unit's `bloom` drawn in ASCII.
  - `src/gen/__snapshots__/applicant.test.ts.snap` has eight "human" hits, but they are species and transcripts, not the rule.
- **e2e specs**:
  - `rule0.spec.ts`: seven tests, all on seed 1 — [e2e/rule0.spec.ts:53-214](../../e2e/rule0.spec.ts#L53).
  - `inspectFault.ts`: `RULE_KEY.human = '0'`, plus the `human` branch — [e2e/inspectFault.ts:9](../../e2e/inspectFault.ts#L9), [e2e/inspectFault.ts:24-27](../../e2e/inspectFault.ts#L24).
  - `slice3.spec.ts`: "Discrepancy · Rule 0 …" on day 2's unit, and tabs `['0',…,'6']` — [e2e/slice3.spec.ts:120-133](../../e2e/slice3.spec.ts#L120), [e2e/slice3.spec.ts:316-328](../../e2e/slice3.spec.ts#L316).
  - `slice4.spec.ts`: "Evidence: Rule 0, frame 1 against the rule" — [e2e/slice4.spec.ts:169-181](../../e2e/slice4.spec.ts#L169), [e2e/slice4.spec.ts:204-210](../../e2e/slice4.spec.ts#L204).
  - `slice5.spec.ts`: the day 7 slit — [e2e/slice5.spec.ts:119-151](../../e2e/slice5.spec.ts#L119).
  - `slice6.spec.ts`: the slit in four colour visions — [e2e/slice6.spec.ts:300-333](../../e2e/slice6.spec.ts#L300).
  - `fit.spec.ts`: the tutorial desk, which measures Rule 0's page — [e2e/fit.spec.ts:63-84](../../e2e/fit.spec.ts#L63).
- **Acceptance rows that encode Rule 0 or the lamp**: 10, 55, 56, 63, 64, 65, 66, 69, 70, 89, 97 and 108 — [notes/acceptance.md](../../notes/acceptance.md).
- **Screenshot evidence**: 19 files in `notes/evidence/rule0/`, including `unit-day1.png`, `fig0-day1.png`, `welcome-letter-1240x820.png` and `citation-unit-day1.png` — [notes/evidence/rule0/](../../notes/evidence/rule0/).
- **"night"**: most matches are the night shift ("The Ministry never closes": Night.tsx 58, night.test.ts 33, slice6.spec.ts 16). Mentions of the night lamp are only in `types.ts:28`, `portraits.ts`, the Gazette at lines 90, 92 and 159, `rulebook.ts:36`, `Screens.tsx:489`, the portrait code and comments in `cast.ts` — [src/rules/types.ts:28](../../src/rules/types.ts#L28), [src/content/rulebook.ts:36](../../src/content/rulebook.ts#L36).
- **Design text that names Rule 0 or the lamp**: [notes/game-design.md](../../notes/game-design.md), lines 24, 26, 35, 45-47, 56, 65, 86, 90, 97, 115-116, 142, 151-152, 172, 219, 249 and 267.

### Inferences
- The lamp and Rule 0 overlap but can be separated. The lamp's code (rendering, `litFrames`, the figure, `LAMP_TIERS`, the film reprint, the Replaced still) works with any rule id that reads it. The words "Rule 0" live mostly in content, in `verdicts.ts`, and in e2e string assertions.
- Renaming or removing the `human` id is the widest change. It touches the typed `Record<RuleId, …>` tables (`CITATION_MEMOS`, `RULEBOOK`, `CHECKS`), the save validator, the Gazette's ordering, `inspectFault.ts` and both replay snapshots.

### Gaps
- I did not read `src/ui/PortraitGallery.tsx` (11 lamp matches; a dev gallery page), `Morning.tsx` or `Registry.tsx` in full.
- I did not count characters in each content line, so I cannot say which rewritten lines would fit their layout budgets.

## 3. Non-unit Rule 0 offenders, Rule 0 look-alikes, and applicants who break two rules

### Takeaway
The Deepfake, the Cutout and the Agent appear only on day 6 in the week, and in the night shift, which is built from day 6 queues. The Cutout and the Agent are the only applicants who break two rules, always Rule 0 plus one more. Rule 0's only generated look-alike is Dave, who never comes on day 1, so day 1 has no Rule 0 case besides the unit.

### Cited Findings
- **Extras come only on day 6**: `extras: day === 6 ? extras : []` — [src/gen/day.ts:155](../../src/gen/day.ts#L155). Two are picked by weight, never the same kind: Agent 2, Cutout 2, Deepfake 1.5, the clone 1.5, the Influencer 1.5, and fill-in faults — [src/gen/day.ts:107-111](../../src/gen/day.ts#L107), [src/gen/day.ts:175-180](../../src/gen/day.ts#L175).
- **How often they come**, probe over seeds 1 to 2000: the Agent in 458 weeks (22.9%), the Cutout in 439 (22.0%) and the Deepfake in 310 (15.5%). That is 1,207 appearances; two can come in the same week — [src/gen/day.ts](../../src/gen/day.ts#L585).
- **The night shift** is `NIGHT_DAY = 6`: "each shift is another week's day 6" with every rule in force — [src/ui/Night.tsx:15](../../src/ui/Night.tsx#L15), [notes/game-design.md:265](../../notes/game-design.md).
- **The Agent**: `human:generated` plus one of `phrase:missing-words` (154 of 2000 weeks), `sign:qr` (156) or `living:version` (148) — [src/gen/day.ts:589-605](../../src/gen/day.ts#L589).
- **The Cutout**: `human:printed` plus `living:no-blink`, "a picture, not a person (Rule 0), and a picture does not blink (Rule 6)" — [src/gen/day.ts:606-614](../../src/gen/day.ts#L606).
- **The Deepfake**: `human:deepfake` only. Rule 2 skips the frame where its face changes, so only Rule 0 catches it — [src/gen/day.ts:615-622](../../src/gen/day.ts#L615), [src/rules/photo.ts:1-2](../../src/rules/photo.ts#L1), [notes/game-design.md:115](../../notes/game-design.md).
- **The tests on two-rule applicants**: more than one planted fault is allowed only for `agent` and `cutout`, and only as Rule 0 plus one — [src/gen/week.test.ts:21-32](../../src/gen/week.test.ts#L21), [src/gen/day.test.ts:98-100](../../src/gen/day.test.ts#L98). The design names them as the two exceptions — [notes/game-design.md:45](../../notes/game-design.md).
- **Units never break two rules**: days 4 and 5 replace the planted fault — [src/gen/day.ts:464-476](../../src/gen/day.ts#L464).
- **Rule 0 look-alikes**. In the generator only Dave, `human:'costume'` — [src/gen/applicant.ts:30-32](../../src/gen/applicant.ts#L30), [src/gen/day.ts:548](../../src/gen/day.ts#L548). Regulars other than Ethel come only from day 2 — [src/gen/day.ts:131-142](../../src/gen/day.ts#L131). Probe, Dave by day over 2000 weeks: day 2 317, day 3 295, day 4 337, day 5 270, day 6 387, day 7 394, day 1 none. The design also lists:
  - the second Twin (days 5 or 6) — [src/gen/day.ts:50](../../src/gen/day.ts#L50);
  - Nigel's two blinks with no light;
  - phone signs from day 3.

  Source: [notes/game-design.md:90](../../notes/game-design.md). `rules.test.ts` has valid Rule 0 cases for Dave's costume, a twin filmed beside the applicant, and "Nigel's two blinks: the day 2 unit's pose, and no light" — [src/rules/rules.test.ts:51-63](../../src/rules/rules.test.ts#L51).
- **Nothing between the brows**: "Nothing point-like between the brows, on anyone" — [notes/game-design.md:47](../../notes/game-design.md).

### Inferences
- Moving Rule 0's checks to day 6 (option b) would not leave the Deepfake, the Cutout or the Agent without a rule on the days they appear, because they appear only on day 6.
- Day 1 teaches Rule 0 with one positive case, the unit, and no look-alike. Rule 0's valid look-alikes arrive from day 2 at the earliest.

### Gaps
- I did not measure how many weeks have at least one non-unit Rule 0 offender on day 6. The extras can overlap, so the three counts cannot simply be added.

## 4. Restructure options (a)–(d): what each touches, and what it improves or breaks

### Takeaway
Only option (d), presentation only, leaves the generator, the rule engine, the seeds and the replay snapshots alone. It keeps two rules in force on day 1. Options (a), (b) and (c) each give one new rule per day, but each changes the `RuleId` API, needs the owner's approval to edit tests, and takes a fake off day 1. (b) also takes a fake off days 2 and 3, and (c) needs a new fault for each unit plus a new home for the Deepfake and the day 7 unit.

### Cited Findings
- **Constraints common to (a), (b) and (c)**:
  - Process rules: "Ask before changing gameplay, the rulebook or a module's public API", and "Don't edit or delete tests unless asked" — [AGENTS.md:39](../../AGENTS.md), [AGENTS.md:35](../../AGENTS.md).
  - `RuleId` belongs to `src/rules`' types — [src/rules/types.ts:51](../../src/rules/types.ts#L51). It is persisted in saved evidence and checked there — [src/ui/save.ts:94](../../src/ui/save.ts#L94).
  - Day 1's page is hard-coded to `'human'`. With no `human` page in force, no page would be open — [src/ui/Shift.tsx:93-95](../../src/ui/Shift.tsx#L93), [src/ui/Shift.tsx:113-114](../../src/ui/Shift.tsx#L113), [src/ui/Documents.tsx:193-195](../../src/ui/Documents.tsx#L193).
  - The day 1 unit is scripted third and carries one of day 1's two fakes; the valid-share test wants exactly 0.6 — [src/gen/day.ts:37](../../src/gen/day.ts#L37), [src/gen/day.ts:247-248](../../src/gen/day.ts#L247), [src/gen/day.test.ts:34](../../src/gen/day.test.ts#L34).
  - Rule 0's page is at its height budget: on day 1 it must cost the hall no more than Rule 1's page (0.5 px), and on day 6 at most 10 px more than Rule 6's — [e2e/rule0.spec.ts:191-213](../../e2e/rule0.spec.ts#L191). Day 6 currently uses "9 px of the 10 allowed" — [notes/acceptance.md:65](../../notes/acceptance.md).
- **(a) Merge Rule 0 with Rule 2 into one "face" rule on day 2**:
  - Code:
    - `types.ts`: merge the `human` and `photo` violations — [src/rules/types.ts:81-84](../../src/rules/types.ts#L81);
    - `RULE_DAYS` and `CHECKS` in `judge.ts`;
    - fold `human.ts` and `photo.ts` together; the glitch exclusion becomes unnecessary — [src/rules/photo.ts:9](../../src/rules/photo.ts#L9);
    - Inspect's photo-against-frame and frame-against-Rule branches — [src/rules/inspect.ts:53-66](../../src/rules/inspect.ts#L53);
    - `visibility()` — [src/court/jury.ts:66-73](../../src/court/jury.ts#L66);
    - `evidenceLine` — [src/ui/evidence.ts:72-86](../../src/ui/evidence.ts#L72);
    - the film condition — [src/ui/Slips.tsx:128](../../src/ui/Slips.tsx#L128);
    - one rulebook entry instead of two (lines 24-41 and 50-56), with the figure moving to that page — [src/content/rulebook.ts:24-56](../../src/content/rulebook.ts#L24);
    - `save.ts` `RULES`, and `inspectFault` `RULE_KEY`.
  - Content:
    - every "Rule 0" and "Memo 0-x" line (Q2);
    - day 2's notice, now "a photograph of a more attractive man" — [src/content/gazette.ts:80](../../src/content/gazette.ts#L80);
    - the first two sticky notes — [src/content/hall.ts:56-57](../../src/content/hall.ts#L56);
    - the welcome letter's lamp paragraph, which could move to day 2 — [src/content/gazette.ts:157-159](../../src/content/gazette.ts#L157).
  - Day 2: the day 2 unit (`glow`, lit in frames 1 and 3) and Pat's mirrored photo would both break the new rule, and `testerFor` can already put the unit first on day 2 — [src/gen/day.ts:284-285](../../src/gen/day.ts#L284). The day 3, 6 and 7 units still break an older rule (the face rule).
  - One fault per applicant is unchanged: the Cutout still breaks two rules (face and living), and so does the Agent (face and one more).
  - Tests and pins: `rules.test.ts:116-119`, `judge.test.ts:19`, `inspect.test.ts`, `week.test.ts:47-49`, `jury.test.ts` fault kinds, the `fairClue` clues, `courtRuling`, `citationFilm`, `rule0Figure.test.tsx` (the figure only on Rule 0's page) and both replay snapshots (rule ids in strings). In e2e: all seven tests in `rule0.spec`, `slice3` (125, 130, 316-328), `slice4` (169, 178, 204), `slice5:145` and `fit.spec` (the tutorial desk). Sources as listed in Q2.
- **(b) Merge Rule 0 with Rule 6 (living) on day 6**:
  - The day 1 to 3 units have no fault but the lamp (flawless photo, the phrase, a blink, the right wallet), so they would be valid on days 1 to 3 — [src/gen/day.ts:457-466](../../src/gen/day.ts#L457), [src/content/portraits.ts:47-50](../../src/content/portraits.ts#L47).
  - Days 1, 2 and 3 would each drop to one fake (Pat), giving 4 of 5, 6 of 7 and 7 of 8 valid, against the 65 to 75% target — [src/gen/day.ts:36-44](../../src/gen/day.ts#L36), [notes/game-design.md:44](../../notes/game-design.md).
  - The first lamps a rule would read are day 6's `small` and day 7's `slit`, both rare to a juror — [src/court/jury.ts:56](../../src/court/jury.ts#L56). The Gazette's day 4 story of the dimmed lamp — [src/content/gazette.ts:92](../../src/content/gazette.ts#L92) — would describe a lamp no rule had checked yet.
  - Three valid units stamped in by day 3 count as `unitsStamped = 3`, which is the Replaced ending for a perfect clerk unless the count is filtered — [src/ui/week.ts:248-251](../../src/ui/week.ts#L248), [src/ui/week.ts:269-270](../../src/ui/week.ts#L269), [src/economy/endings.ts:13](../../src/economy/endings.ts#L13), [src/economy/endings.ts:36](../../src/economy/endings.ts#L36).
  - Day 6's newcomers are covered: the Cutout (picture and no blink) and the Agent born "v4" (148 of 2000 weeks) would each break the merged rule only; the Agent's phrase and sign variants would still break two rules (Q3).
  - Unused content: `UNIT_MEMOS` 0-L, 0-M and 0-N, and the court's lines for the day 1 to 3 units, would never print — [src/content/verdicts.ts:54-57](../../src/content/verdicts.ts#L54), [src/content/verdicts.ts:110-114](../../src/content/verdicts.ts#L110).
  - Tests: as for (a), plus the valid share on days 1 to 3 — [src/gen/day.test.ts:28-41](../../src/gen/day.test.ts#L28) — and the Replaced test built from the day 1 to 3 units — [src/endings.test.ts:130-138](../../src/endings.test.ts#L130).
  - The seed 127 week test lets the day 3 unit (Joanna Pike) in and expects a Rule 0 warning, then expects her named as a day 6 voucher. Neither would happen if she were valid — [e2e/slice3.spec.ts:237-243](../../e2e/slice3.spec.ts#L237), [e2e/slice3.spec.ts:282-286](../../e2e/slice3.spec.ts#L282).
- **(c) Drop Rule 0, and catch each unit by the day's newest rule (Jorji Costava style)**:
  - Days 4 and 5 already work this way (the maker's vouch, the factory face) — [src/gen/day.ts:467-475](../../src/gen/day.ts#L467), [notes/game-design.md:24](../../notes/game-design.md).
  - Units need new faults on days 1, 2, 3, 6 and 7:
    - Day 1 (phrase): the design says a unit "says the phrase word for word" — [notes/game-design.md:24](../../notes/game-design.md), [src/content/cast.ts:204-217](../../src/content/cast.ts#L204) — and Pat already carries day 1's phrase fault.
    - Day 6 (living): units blink — [src/content/cast.ts:208-209](../../src/content/cast.ts#L208) — and the Agent already uses a version number for a year — [src/gen/day.ts:594](../../src/gen/day.ts#L594).
    - Day 7: no new rule, and today only Rule 0 catches the last unit ("the hardest catch of the week") — [src/gen/humanityDay.test.ts:36-44](../../src/gen/humanityDay.test.ts#L36), [notes/game-design.md:24](../../notes/game-design.md).
  - The non-unit Rule 0 offenders need new homes:
    - the Deepfake loses its only rule (Rule 2 skips its glitch frame) — [src/rules/photo.ts:1-2](../../src/rules/photo.ts#L1);
    - the Cutout keeps only Rule 6, and the Agent only its second fault.
  - The design's invariants say "Only the evidence reveals validity. Never appearance …" — [AGENTS.md:18](../../AGENTS.md), [notes/game-design.md:46](../../notes/game-design.md). A lamp or a ✦ left on screen with no rule reading it would coincide with a fake every time.
  - Removed or dead code and tests: the lamp art and drawing, `litFrames`, Fig. 0, the film reprint, `LAMP_TIERS`, `rule0Figure.test.tsx`, `rule0.spec.ts`, the slit's colour-vision spec, and the lamp tests and snapshot in `portrait.test` (Q2). The `Record<RuleId, …>` tables would drop `human` — [src/content/verdicts.ts:8](../../src/content/verdicts.ts#L8), [src/content/rulebook.ts:23](../../src/content/rulebook.ts#L23).
  - The night shift's day 6 queues would lose Rule 0 — [src/ui/Night.tsx:15](../../src/ui/Night.tsx#L15).
  - A unit fault planted through the sign draws from the week's stream (`miswrite`) — [src/gen/day.ts:314-334](../../src/gen/day.ts#L314), [src/gen/day.ts:392-398](../../src/gen/day.ts#L392).
- **(d) Keep Rule 0; change only the rulebook's presentation**:
  - What it touches: the page state — [src/ui/Shift.tsx:91-95](../../src/ui/Shift.tsx#L91), [src/ui/Shift.tsx:113-114](../../src/ui/Shift.tsx#L113), [src/ui/Shift.tsx:142-143](../../src/ui/Shift.tsx#L142); the rulebook card and pages — [src/ui/Documents.tsx:170-234](../../src/ui/Documents.tsx#L170); `rulebook.ts`; `desk.css`.
  - Tests to change:
    - `rule0.spec.ts` test 1, the book open at Rule 0 "and every call puts it back" — [e2e/rule0.spec.ts:53-85](../../e2e/rule0.spec.ts#L53);
    - `rule0.spec.ts` test 7, the page's cost to the hall — [e2e/rule0.spec.ts:191-213](../../e2e/rule0.spec.ts#L191);
    - `fit.spec` — [e2e/fit.spec.ts:63-84](../../e2e/fit.spec.ts#L63);
    - `slice3`'s tab list — [e2e/slice3.spec.ts:316](../../e2e/slice3.spec.ts#L316).
  - Acceptance rows 10 ("on day 1 the book turns only at a call and at the guided Inspect"), 65 and 69 — [notes/acceptance.md](../../notes/acceptance.md) — and the design's lines 35, 56 and 65 — [notes/game-design.md](../../notes/game-design.md).
  - Untouched: the replay tests run through the reducer, not the UI, and the generator does not change — [src/replay.test.ts:9-37](../../src/replay.test.ts#L9).
  - History: the day 1 reset to Rule 0 was a fix from the owner's playtest on 29 Sep. The owner's notes read "the book opened at Rule 1, not Rule 0; what the light is for" and the fix reads "day 1 opens at Rule 0 with Fig. 0, and the welcome letter explains the lamp (81c4c17)" — [notes/acceptance.md:119](../../notes/acceptance.md) (in the working tree; from the slice-6 docs commit). Commit 81c4c17, 2026-09-29: "feat(rule0): day 1 opens at Rule 0, Fig. 0 shows the light, a missed unit's citation reprints its video".

### Inferences
- (a) fits the design's own pattern best: "Each new rule comes with its reason, usually something that got registered the day before" — [notes/game-design.md:48](../../notes/game-design.md). A day 1 unit that is registered would give day 2's rule its cause, and the day 2 unit would test that rule on day 2. The main cost is the merged page's height, since Rule 0's page is already at its budget, plus the ending counters (Q5).
- (b) looks weakest on balance. Days 1 to 3 each lose a fake, the brightest lamps become non-events, and three valid units reach Replaced by day 3 unless the counting changes. Its one gain is that the Cutout, and the Agent born "v4", would each break only one rule.
- Under (c), every fake on days 1 to 5 breaks the newest rule (Q1), so older rules would never catch anyone before day 6. That hollows out the design's claim that "later days are harder because … there is more to check" — [notes/game-design.md:44](../../notes/game-design.md). It also removes the week's hardest catch on day 7.
- (d) is the cheapest and risks no seeds, but it does not deliver "one new rule per day", because day 1 still has two rules. It also runs against the owner's own fix of 29 Sep; any banner or all-rules page has to fit the same height budget.

### Gaps
- I did not prototype the merged pages, so the height overruns in (a) and (b) are inferred from the existing budgets, not measured.
- I did not model a replacement fake for day 1 (to keep 3 of 5 valid) under any option, so its effect on the random stream is not measured (see Q6).

## 5. If the day-1 unit became valid and the humanity check arrived on day 2 because of it

### Takeaway
On day 1, Inspect would answer "These disagree, but no rule in force covers it. Yet." and attach no evidence. The day 2 Gazette would not run a unit headline. As the code stands, a correctly stamped valid unit would still count toward Replaced and would appear in the Humanity Day special. The generator can never pick it as a voucher. A wrong challenge of it on day 1 costs the 15 PNK deposit, with no first-mistake warning.

### Cited Findings
- **What Inspect says on day 1** (Rule 0 not in force):
  - A photo against a lit frame, or a lit frame against a dark one, returns `human` — [src/rules/inspect.ts:53-54](../../src/rules/inspect.ts#L53), [src/rules/inspect.ts:59-61](../../src/rules/inspect.ts#L59).
  - `inForce` is `rulebook.includes(rule)` — [src/rules/inspect.ts:38-41](../../src/rules/inspect.ts#L38).
  - The desk then shows `INSPECT_LINES.notInForce`: "These disagree, but no rule in force covers it. Yet." — [src/ui/Shift.tsx:377-379](../../src/ui/Shift.tsx#L377), [src/content/desk.ts:6](../../src/content/desk.ts#L6).
  - The sound is the not-in-force blip, and no evidence is set — [src/ui/Shift.tsx:129-131](../../src/ui/Shift.tsx#L129).
  - A frame against Rule 0 is impossible: the page is not in the book, and `turnTo` ignores rules not in force — [src/ui/Documents.tsx:178-194](../../src/ui/Documents.tsx#L178), [src/ui/Shift.tsx:134-136](../../src/ui/Shift.tsx#L134). Fig. 0 would not be shown on day 1.
  - The same flow already exists and is tested for the Influencer's filtered photo on day 1: the line appears, and her challenge goes to court as a hunch — [e2e/slice4.spec.ts:214-233](../../e2e/slice4.spec.ts#L214).
- **The day 2 Gazette headline**:
  - `story()` chooses the `unit` pool only among accepted cases with `broke.length > 0` — [src/gen/gazette.ts:106-111](../../src/gen/gazette.ts#L106).
  - `broke` comes from the stamp's violations — [src/ui/week.ts:329-342](../../src/ui/week.ts#L329). A valid unit has `broke = []`, so no unit headline.
  - The paper would lead with, in order: a fake registered (Pat, if accepted), a fake the court registered, a human challenged, time up, or clean (for example "REGISTRY GROWS BY {COUNT} HUMANS, ALL HUMAN") — [src/gen/gazette.ts:112-119](../../src/gen/gazette.ts#L112), [src/content/gazette.ts:54-61](../../src/content/gazette.ts#L54).
  - If the clerk challenged the valid unit and the court dismissed it, the `human` pool leads, for example "WINDOW 3 FINDS {NAME} NOT HUMAN. {NAME} SURPRISED." — [src/gen/gazette.ts:115-117](../../src/gen/gazette.ts#L115), [src/content/gazette.ts:29-36](../../src/content/gazette.ts#L29).
  - The day's report welcomes the last person registered by name — [src/gen/gazette.ts:122-136](../../src/gen/gazette.ts#L122). The day 1 unit is third of five.
  - Day 2's notice is fixed text about the photo — [src/content/gazette.ts:80](../../src/content/gazette.ts#L80).
- **The Replaced ending, the second notes, and Likeness's offer**:
  - `dayLog` records every accept with `unit: queue[i].cast === 'unit'` and a separate `broke` flag — [src/ui/week.ts:248-251](../../src/ui/week.ts#L248). `unitsStamped` filters only on `unit && by === 'stamp'` and ignores `broke` — [src/ui/week.ts:268-270](../../src/ui/week.ts#L268).
  - So a valid day 1 unit stamped in, which would be the correct decision, counts toward:
    - Replaced (`REPLACED_AT = 3`) — [src/economy/endings.ts:13](../../src/economy/endings.ts#L13), [src/economy/endings.ts:33-39](../../src/economy/endings.ts#L33), [src/ui/week.ts:193-199](../../src/ui/week.ts#L193);
    - the second note, "Two home robots this week …", after one more unit — [src/ui/Shift.tsx:316-324](../../src/ui/Shift.tsx#L316);
    - the Replaced letter's list — [src/gen/letters.ts:43-52](../../src/gen/letters.ts#L43);
    - the special edition's "Home robots registered at Window 3 this week: Clara Voss (day 1)" — [src/gen/gazette.ts:83-87](../../src/gen/gazette.ts#L83), [src/ui/week.ts:300](../../src/ui/week.ts#L300).
  - It would earn no Likeness fee and no job letter. Fees count only units stamped in after signing (the offer comes on day 3), and a unit let in on day 1 is already tested to earn nothing — [src/ui/week.ts:203-204](../../src/ui/week.ts#L203), [src/economy/endings.ts:48-50](../../src/economy/endings.ts#L48), [src/endings.test.ts:302-306](../../src/endings.test.ts#L302).
- **Whether the registered unit could vouch later**:
  - In the generator, no. `chooseVoucher` picks from registrants with `face.species === 'human'` — [src/gen/day.ts:379](../../src/gen/day.ts#L379) — and every unit face is `android` — [src/content/portraits.ts:4-40](../../src/content/portraits.ts#L4). The `busy` fault picks only someone already vouching, and `back-in-a-hat` excludes cast names (units included) and androids — [src/gen/day.ts:361-364](../../src/gen/day.ts#L361), [src/gen/day.ts:667-668](../../src/gen/day.ts#L667).
  - Today, though, the refused day 1 unit's name can be chosen as an unregistered voucher on day 6. That comes from the `refused` list — [src/gen/day.ts:354-358](../../src/gen/day.ts#L354) — and the probe found Clara Voss in 21 of 2000 weeks.
  - Once the unit is valid, the generator registers it (it registers everyone with nothing planted) and drops it from `refused` — [src/gen/day.ts:163-166](../../src/gen/day.ts#L163). That moves day 6 voucher picks (Q6).
- **What a wrong challenge of a valid applicant costs on day 1**:
  - Citations, and the day's first-mistake warning, apply only to wrong accepts — [src/economy/economy.ts:55-60](../../src/economy/economy.ts#L55).
  - Jurors never find a fault that is not there — [src/court/jury.ts:1-4](../../src/court/jury.ts#L1), [src/court/jury.ts:129-132](../../src/court/jury.ts#L129) — so the challenge is dismissed and the 15 PNK deposit is lost — [src/economy/economy.ts:8-17](../../src/economy/economy.ts#L8), [src/economy/economy.ts:127](../../src/economy/economy.ts#L127). The clerk also forgoes the 10 PNK paid for a registration.
  - A dismissed case can be appealed at 10 and then 20 PNK, and a wrong appeal never wins — [src/court/jury.ts:154-158](../../src/court/jury.ts#L154), [src/economy/economy.ts:24](../../src/economy/economy.ts#L24).
  - Nobody can be fired on day 1 — [src/economy/economy.ts:171](../../src/economy/economy.ts#L171), [src/gen/week.test.ts:85-91](../../src/gen/week.test.ts#L85). Savings start at 240, and day 1's bills are 30 rent, 3 to 7 gas and 5 for the odd item — [src/economy/economy.ts:26](../../src/economy/economy.ts#L26), [src/economy/economy.ts:42-44](../../src/economy/economy.ts#L42).
  - The court has no `dismissed` line for units, so a general dismissed note prints, for example "The applicant would like it noted that they were right." — [src/content/verdicts.ts:96-120](../../src/content/verdicts.ts#L96), [src/ui/week.ts:322-326](../../src/ui/week.ts#L322).
- **Probe of the smallest version of this change**. `day.ts` was patched in memory only: `DAYS[0].fakes` 2 → 1, and the unit's `planted` emptied on day 1. The result:
  - day 1 becomes 4 of 5 valid, which breaks the test's 0.6 — [src/gen/day.test.ts:34](../../src/gen/day.test.ts#L34);
  - `compose`'s fake check then passes — [src/gen/day.ts:235-236](../../src/gen/day.ts#L235).
  - Without the `fakes` change, `compose` throws "Day 1: 1 fakes, the day table says 2".

### Inferences
- The "Yet." line already exists and teases a rule coming later. A valid day 1 unit would give it a strong moment, and the day 2 notice could name the unit as the reason for the new rule.
- To keep the endings honest, `unitsStamped` (ui/week.ts:269-270) would have to count only units that broke a rule (`r.broke`). Otherwise a perfect clerk starts the week one of three toward Replaced, and the special edition lists a correct stamp as a home robot registered.
- The `unit` headline pool would need an "accepted unit, whatever it broke" branch if the day 2 paper is to report the registered robot. The Gazette's rules say it reports only "yesterday, from the player's actual decisions".

### Gaps
- I did not look at how the registry lookup (`Registry.tsx`) would show an android registered on day 1. I also did not check whether any content says "all registered are human".

## 6. Seed pins: which e2e specs and snapshots a change to the day-1 queue would break

### Takeaway
A change that keeps the week's random draws the same leaves the exact-transcript pins intact. The in-memory probe confirmed this for the smallest change: the day 1 unit made valid, with day 1's fake count cut to 1. That change still breaks every test that pins day 1's make-up, the seed 127 week test, day 1 of both replay snapshots, and day 6 vouchers in about 6% of weeks. A change that adds or removes random draws on day 1, such as a replacement fake or a reordered shuffle, risks every seed pin in the suite. Re-picking the transcript pins takes searches of millions of seeds.

### Cited Findings
- **The memory note**:
  - Generator changes break `slice1`'s CHATTY, HOOMAN and SILENT pins and `slice2`'s pins. The exact CHATTY and HOOMAN transcripts come up "about once per 500k seeds"; HOOMAN took about 3.6M seeds, about 20 minutes on 7 processes.
  - "Only days 1 to 3 are safe from later-day changes". The random stream runs from day 1, so a change on day 1 reaches every later day.
  - "Changing which registrants may vouch (a `reserved` name) moves voucher picks, not the RNG's draw count, so the pins held."
  - It advises checking pins "with a days-1-to-6 hash against a `main` worktree".

  Source: [memory/e2e-seed-repick-cost.md:11-20](/Users/kemuru/.claude/projects/-Users-kemuru-repos-poh-papers-please/memory/e2e-seed-repick-cost.md).
- **The pins**: CHATTY `?seed=2155315&day=3`, HOOMAN `?seed=4880500&day=7` and SILENT `?seed=55&day=7`. Each asserts the first applicant's `planted` and transcript, "changed: pick another" — [e2e/slice1.spec.ts:9-27](../../e2e/slice1.spec.ts#L9).
- **Probe of the smallest change**:
  - CHATTY, HOOMAN and SILENT are all unchanged.
  - Across seeds 1 to 600, days 2 to 7 are identical in names, transcripts, faults and remarks.
  - Day 6 vouchers differ in 35 of 600 weeks (5.8%): Clara Voss leaves the `refused` list, which shifts `rng.pick(refused)` without changing the number of draws — [src/gen/day.ts:354-358](../../src/gen/day.ts#L354), [src/gen/rng.ts:22-25](../../src/gen/rng.ts#L22).
  - In seed 127, the day 6 applicant vouched for by Joanna Pike is gone (1 before, 0 after).
- **Specs that pin day 1's make-up** (they break under any day 1 change that makes the unit valid, removes it, or moves it):
  - `e2e/rule0.spec.ts`, seed 1: `toTheUnit` expects the third applicant to be the unit with `bloom`; five more tests use the day 1 unit, Rule 0's page and the letter — [e2e/rule0.spec.ts:39-147](../../e2e/rule0.spec.ts#L39), [e2e/rule0.spec.ts:191-213](../../e2e/rule0.spec.ts#L191).
  - `e2e/slice2.spec.ts`, seed 7 day 1:
    - the pattern `[false,true,true,false,false]` — [e2e/slice2.spec.ts:53](../../e2e/slice2.spec.ts#L53);
    - 'Clara Voss' upheld in court — [e2e/slice2.spec.ts:69](../../e2e/slice2.spec.ts#L69);
    - exact pay of 20 PNK — [e2e/slice2.spec.ts:75](../../e2e/slice2.spec.ts#L75);
    - "Register Pat (the warning), then the robot (the fine)" — [e2e/slice2.spec.ts:90-107](../../e2e/slice2.spec.ts#L90).
  - `e2e/slice3.spec.ts`, seed 127: "Day 1 at Window 3: 3 registered, 2 challenged, 2 upheld in court." — [e2e/slice3.spec.ts:228](../../e2e/slice3.spec.ts#L228); and the day 6 applicant vouched for by Joanna Pike — [e2e/slice3.spec.ts:285-286](../../e2e/slice3.spec.ts#L285). The memory note says seed 127 was found in a 3,000-seed probe, "common".
  - `e2e/slice4.spec.ts`, seed 1 day 1: the Influencer at index 3 — [e2e/slice4.spec.ts:214-220](../../e2e/slice4.spec.ts#L214).
  - `e2e/fit.spec.ts`, seed 1 day 1: the tutorial desk measures the rulebook region — [e2e/fit.spec.ts:63-84](../../e2e/fit.spec.ts#L63).
  - `e2e/slice3.spec.ts:54-86` (day 1, seeds 1 to 3: the first two applicants are the same every week) and `e2e/slice6.spec.ts:150-175` (seed 1 day 1, going back to a morning) do not depend on the unit's validity.
- **Specs that pin later days of seed 1 and other seeds** (at risk only if the change alters random draws, and any added draw on day 1 moves every later day):
  - `slice4`, seed 1 day 2: the unit at index 2, fakes at `[2, 3]`, dismissed by 3 jurors and then upheld by 7 — [e2e/slice4.spec.ts:62-158](../../e2e/slice4.spec.ts#L62), [e2e/slice4.spec.ts:199-212](../../e2e/slice4.spec.ts#L199), [e2e/slice4.spec.ts:300-320](../../e2e/slice4.spec.ts#L300). A case's jury seed comes from the week's seed, the day and the place in the queue — [src/court/jury.ts:99-100](../../src/court/jury.ts#L99).
  - `slice3`, seed 1 days 2, 4, 5 and 6 — [e2e/slice3.spec.ts:88-138](../../e2e/slice3.spec.ts#L88).
  - `slice5`, seed 29 day 6 (the clone), and seed 1 days 3 and 5 to 7 — [e2e/slice5.spec.ts:230-269](../../e2e/slice5.spec.ts#L230).
  - `fit.spec`, seed 1 day 6 (paper first, a phone third) — [e2e/fit.spec.ts:87-95](../../e2e/fit.spec.ts#L87).
  - `save.spec`, seeds 1, 3, 5, 6 and 7 — [e2e/save.spec.ts:46-158](../../e2e/save.spec.ts#L46).
  - `rule0.spec`, seed 1 day 2 (Pat fourth) — [e2e/rule0.spec.ts:149-165](../../e2e/rule0.spec.ts#L149).
- **Unit-test snapshots**: `replay.test.ts.snap` records whole weeks for seeds 1 and 2, with day 1 as "Clara Voss !human:machine", decisions, court results and totals — [src/replay.test.ts:54-68](../../src/replay.test.ts#L54), [src/__snapshots__/replay.test.ts.snap](../../src/__snapshots__/replay.test.ts.snap). `courtReplay.test.ts.snap` does the same with the jury — [src/courtReplay.test.ts:22-47](../../src/courtReplay.test.ts#L22). Both change under any change to day 1's validity or to rule ids.
- **Why draws matter**: `unitOn` uses no random numbers — [src/gen/day.ts:453-456](../../src/gen/day.ts#L453) — but `fillIn` takes a draw from the week's stream for each applicant — [src/gen/day.ts:429-437](../../src/gen/day.ts#L429), and the day 1 `shuffle` uses it too — [src/gen/day.ts:248](../../src/gen/day.ts#L248). The phone draw for the sign is separate and seeded by (seed, day, place) — [src/gen/day.ts:336-341](../../src/gen/day.ts#L336).

### Inferences
- The cheapest route to a valid day 1 unit is to flip its `planted` and set `DAYS[0].fakes` to 1. It needs no transcript re-pick, but it does need:
  - a new seed for the seed 127 week test;
  - edits to `slice2`'s seed 7 tests;
  - rewrites of `rule0.spec`;
  - re-recorded replay snapshots;
  - a decision on the valid-share test, since 4 of 5 is outside the design's range and the test expects 3 of 5.
- Keeping day 1 at 3 of 5 with a replacement fake from the week's stream (for example a phrase fill-in) would probably shift days 2 to 7. That risks CHATTY, HOOMAN, SILENT and every later-day seed pin, which the memory note says cost multi-million-seed searches to re-pick.

### Gaps
- I did not model a replacement fake for day 1, or options (a) to (c) in full, so their effect on the random stream is inferred from the code, not measured.
- I ran no tests (unit or e2e). The breakages listed are read from the assertions, not observed.
