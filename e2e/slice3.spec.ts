import { expect, test, type Page } from '@playwright/test';
import { HEADLINES, ROBOT_STORY } from '../src/content/gazette';
import { RULEBOOK } from '../src/content/rulebook';
import { inspectFault } from './inspectFault';

// Slice 3 acceptance (notes/acceptance.md) in the browser: the rulebook's pages, inspect mode,
// challenges, the registry lookup, the registry that remembers and the morning Gazette.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });

/** Words that would give a rule's result away. None may be printed on the papers. */
const RESULTS = /blink|valid|fake|genuine|forged|verified|mismatch|duplicate|deceased|match(es)?\b|passed|failed|not human/i;

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

async function open(page: Page, query: string) {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
}

/** Calls the next applicant and returns them, with where they are in the queue. */
async function callNext(page: Page) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, called } = await game(page);
  return { a: queue[called - 1], i: called - 1 };
}

/** Stamps the applicant at the window by the rulebook, unless told otherwise. Checks their papers give no result away. */
async function stamp(page: Page, override?: 'accept' | 'challenge') {
  const { a, i } = await callNext(page);
  const papers = (await page.getByRole('region', { name: 'Profile card' }).innerText()) + (await page.getByRole('region', { name: 'Video strip' }).innerText());
  const labels = [a.video.transcript, a.name, a.address].reduce((text, own) => text.split(own).join(' '), papers);
  expect(labels, a.name).not.toMatch(RESULTS);
  const decision = override ?? (a.planted.length === 0 ? 'accept' : 'challenge');
  // A fake is challenged the way a careful clerk does, with what Inspect found (slice 4).
  if (decision === 'challenge' && a.planted.length > 0) await inspectFault(page, a);
  await page.getByRole('button', { name: decision === 'accept' ? 'Accept' : 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  return { a, i };
}

async function finishDay(page: Page) {
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: /Begin day/ }).click();
}

test('day 1: the first two applicants are scripted, and the second gets the one guided inspection', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await expect(page.getByTestId('welcome')).toContainText('Welcome to Window 3');
  await shot(page, 'day1-welcome.png');
  const firstTwo = (await game(page)).queue.slice(0, 2).map((a) => a.name);
  for (const seed of [2, 3]) {
    await page.goto(`/?seed=${seed}&day=1`);
    await page.waitForFunction((s) => window.__game?.seed === s, seed);
    expect((await game(page)).queue.slice(0, 2).map((a) => a.name)).toEqual(firstTwo);
  }

  await open(page, '?seed=1&day=1');
  const { a: first } = await stamp(page);
  expect(first.planted).toEqual([]);
  const { a: pat } = await callNext(page);
  expect(pat.planted).toEqual([{ rule: 'phrase', mistake: 'wrong-word' }]);
  const inspector = page.getByTestId('inspector');
  await expect(inspector).toContainText('Press INSPECT');

  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await expect(inspector).toContainText('Point at the transcript, then at Rule 1');
  await page.getByRole('button', { name: 'Inspect the transcript' }).click();
  await page.getByRole('button', { name: 'Inspect Rule 1' }).click();
  await expect(inspector).toContainText('Discrepancy under Rule 1: The phrase.');
  await expect(inspector).toContainText('“hooman”');
  await expect(page.locator('[data-inspect="transcript"]')).toHaveClass(/flagged/);
  await expect(page.locator('[data-inspect="rule-phrase"]')).toHaveClass(/flagged/);
  await shot(page, 'day1-guided-inspect.png');

  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect(page.getByTestId('filing')).toContainText('Case filed');
  expect((await game(page)).decided[1]).toMatchObject({ decision: 'challenge', outcome: { correct: true } });
});

test('inspect mode: two things that disagree are marked and the rule is named; two that agree mark nothing', async ({ page }) => {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  const validAt = queue.findIndex((a) => a.planted.length === 0);
  const patAt = queue.findIndex((a) => a.cast === 'pat');
  const unitAt = queue.findIndex((a) => a.cast === 'unit');
  expect(queue[patAt].planted[0]).toMatchObject({ rule: 'face', mistake: 'mirrored' });
  expect(queue[unitAt].video).toMatchObject({ lamp: 'glow', nervous: true });
  const inspector = page.getByTestId('inspector');
  for (let i = 0; i < queue.length; i++) {
    if (i !== validAt && i !== patAt && i !== unitAt) {
      await stamp(page);
      continue;
    }
    await callNext(page);
    await page.keyboard.press('i');
    if (i === validAt) {
      await page.getByRole('button', { name: 'Inspect the photo' }).click();
      await page.getByRole('button', { name: 'Inspect frame 1' }).click();
      await expect(inspector).toHaveText('No discrepancy.');
      await expect(page.locator('.flagged')).toHaveCount(0);
      await page.getByRole('button', { name: 'Accept' }).click();
    } else if (i === patAt) {
      await page.getByRole('button', { name: 'Inspect the photo' }).click();
      await page.getByRole('button', { name: 'Inspect frame 1' }).click();
      await expect(inspector).toContainText('Discrepancy under Rule 2: The face. The photo is a mirror image of the face in the video.');
      await expect(page.locator('[data-inspect="photo"]')).toHaveClass(/flagged/);
      await expect(page.locator('[data-inspect="frame-1"]')).toHaveClass(/flagged/);
      await expect(page.locator('.flagged')).toHaveCount(2);
      await shot(page, 'inspect-photo.png');
      await page.getByRole('button', { name: 'Challenge' }).click();
    } else {
      // The unit looks like anyone, at the window and in its photo; in frame 1 its eyes are shut
      // and its lamp is on. The book is open at Rule 2, the day's new rule.
      await page.getByRole('button', { name: 'Inspect frame 1' }).click();
      await page.getByRole('button', { name: 'Inspect Rule 2' }).click();
      await expect(inspector).toContainText('Discrepancy under Rule 2: The face. In frame 1 the eyes are shut, and there is a light between the brows.');
      await shot(page, 'inspect-lamp.png');
      // Its eyes are shut in frame 3 too: pointed at, frame 3 is the frame Inspect names.
      await page.getByRole('button', { name: 'Inspect frame 3' }).click();
      await page.getByRole('button', { name: 'Inspect Rule 2' }).click();
      await expect(inspector).toContainText('Discrepancy under Rule 2: The face. In frame 3 the eyes are shut, and there is a light between the brows.');
      await expect(page.locator('[data-inspect="frame-3"]')).toHaveClass(/flagged/);
      await expect(page.locator('[data-inspect="rule-face"]')).toHaveClass(/flagged/);
      await expect(page.locator('.flagged')).toHaveCount(2);
      await page.getByRole('button', { name: 'Challenge' }).click();
    }
    await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  }
});

test('a challenge names no rule: the court upholds it for whatever was broken, and dismisses it only when nothing was', async ({ page }) => {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  const fakes = queue.flatMap((a, i) => (a.planted.length > 0 ? [i] : []));
  const human = queue.findIndex((a) => a.planted.length === 0);
  for (let i = 0; i < queue.length; i++) {
    const challenge = fakes.includes(i) || i === human;
    await stamp(page, challenge ? 'challenge' : 'accept');
    // The case slip names no rule: the court finds what is wrong.
    if (challenge) await expect(page.getByTestId('filing')).not.toContainText('Grounds');
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  const court = page.getByRole('region', { name: 'Humanity Court' });
  for (const i of fakes) {
    const ruling = court.getByTestId('ruling').filter({ hasText: queue[i].name });
    await expect(ruling).toContainText('Challenge upheld.');
    // Every rule they broke, with its evidence.
    for (const p of queue[i].planted) await expect(ruling).toContainText(`Rule ${{ phrase: 1, face: 2, sign: 3, vouch: 4, duplicate: 5, living: 6 }[p.rule]}:`);
  }
  await expect(court.getByTestId('ruling').filter({ hasText: queue[human].name })).toContainText('Challenge dismissed. No rule broken; registered.');
  await expect(court).not.toContainText('Grounds');
  await shot(page, 'court.png');
  const { decided } = await game(page);
  for (const i of fakes) expect(decided[i]).toMatchObject({ decision: 'challenge', outcome: { correct: true } });
  expect(decided[human]).toMatchObject({ decision: 'challenge', outcome: { correct: false } });
});

test('the registry lookup finds a voucher by name, whether they are vouching already, and a duplicate by face', async ({ page }) => {
  await open(page, '?seed=1&day=4');
  // Pat opens the day, vouched for by Pat's mother, who is three places behind and not registered yet.
  const { a: pat } = await callNext(page);
  expect(pat.name).toBe('Pat Oakes');
  await page.getByRole('tab', { name: 'Registry' }).click();
  await page.getByRole('button', { name: 'Look up the voucher' }).click();
  const result = page.getByTestId('lookup-result');
  await expect(result).toContainText('Searched “Maureen Oakes”. No registered human by that name.');
  await page.keyboard.press('i');
  await page.getByRole('button', { name: 'Inspect the voucher' }).click();
  await page.getByRole('button', { name: /Inspect the registry's answer for Maureen Oakes/ }).click();
  await expect(page.getByTestId('inspector')).toContainText('Discrepancy under Rule 4: One vouch. Maureen Oakes is not registered.');
  await shot(page, 'registry-voucher.png');
  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect(page.getByTestId('filing')).toContainText('Case filed');

  await stamp(page);
  await stamp(page);
  // The mother: vouched for by Ethel, who is registered and vouching for nobody yet today.
  const { a: mother } = await callNext(page);
  expect(mother.name).toBe('Maureen Oakes');
  await page.getByRole('tab', { name: 'Registry' }).click();
  await page.getByRole('button', { name: 'Look up the voucher' }).click();
  await expect(result.getByTestId('record-name')).toHaveText('Ethel Pargeter');
  await expect(result.getByTestId('vouching')).toHaveText('nobody');
  await page.getByRole('button', { name: 'Accept' }).click();
  // Now Ethel's vouch is in use, and the lookup says for whom.
  await callNext(page);
  await page.getByRole('tab', { name: 'Registry' }).click();
  await page.getByRole('textbox', { name: 'Name to look up' }).fill('ethel pargeter');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(result.getByTestId('vouching')).toHaveText('Maureen Oakes');
  // Typing into the registry is not stamping.
  expect((await game(page)).decided).toHaveLength(4);

  // Day 5: the unit's face is on file already: Window 7 registered another unit with it last month.
  await open(page, '?seed=1&day=5');
  const { queue } = await game(page);
  const unitAt = queue.findIndex((a) => a.cast === 'unit');
  for (let i = 0; i < unitAt; i++) await stamp(page);
  await callNext(page);
  await page.getByRole('button', { name: /Search this face/ }).click();
  await expect(result).toContainText('On file with this face: 1.');
  await expect(result.getByTestId('record-name')).toHaveText('Nina Penrose');
  await expect(result).toContainText('at Window 7');
  await shot(page, 'registry-face.png');
});

test('a week at the desk: the Gazette reports yesterday, the registry remembers, and the desk judges by it', async ({ page }) => {
  test.setTimeout(240_000);
  // Seed 8: on day 3 a unit is in the queue, under the name the week drew for it, and on day 6 someone names it as
  // their voucher.
  await page.goto('/?seed=8&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const day1 = (await game(page)).queue;
  for (let i = 0; i < day1.length; i++) await stamp(page);
  await finishDay(page);

  // Day 2's Gazette: day 1's unit, which the clerk rightly registered, was a home robot; Rule 2 is in the
  // book because of it, its reason at the foot of its page.
  const gazette = page.getByTestId('gazette');
  await expect(gazette).toContainText('Day 2');
  expect(day1[2].cast).toBe('unit');
  await expect(page.getByTestId('headline')).toHaveText(ROBOT_STORY.headline);
  await expect(page.getByTestId('report')).toContainText(day1[2].name);
  await expect(page.getByTestId('rule-cause').filter({ visible: true })).toHaveText(RULEBOOK.face.cause);
  await shot(page, 'gazette-day2.png');
  await page.getByRole('button', { name: /Open the window/ }).click();
  for (let i = 0; i < 7; i++) await stamp(page);
  await finishDay(page);

  // Day 3: the clerk lets the unit in.
  await page.getByRole('button', { name: /Open the window/ }).click();
  const day3 = (await game(page)).queue;
  const unitAt = day3.findIndex((a) => a.cast === 'unit');
  const unit3 = day3[unitAt].name;
  for (let i = 0; i < day3.length; i++) await stamp(page, i === unitAt ? 'accept' : undefined);
  expect((await game(page)).decided[unitAt]).toMatchObject({ outcome: { correct: false }, citation: 'warning' });
  await finishDay(page);

  // Day 4: the Gazette leads with it, and the registry remembers him, and day 1.
  expect(HEADLINES.unit).toContain((await game(page)).gazette!.headlineLine);
  await expect(page.getByTestId('headline')).toHaveText((await game(page)).gazette!.headline);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await callNext(page);
  await page.getByRole('tab', { name: 'Registry' }).click();
  const result = page.getByTestId('lookup-result');
  for (const [name, when] of [
    [day1[0].name, 'on day 1 at Window 3'],
    [unit3, 'on day 3 at Window 3'],
  ]) {
    await page.getByRole('textbox', { name: 'Name to look up' }).fill(name);
    await page.getByRole('button', { name: 'Search', exact: true }).click();
    await expect(result.getByTestId('record-name')).toHaveText(name);
    await expect(result).toContainText(when);
  }
  await shot(page, 'registry-remembers.png');
  await page.getByRole('tab', { name: 'Rulebook' }).click();
  const first4 = (await game(page)).queue[0];
  if (first4.planted.length > 0) await inspectFault(page, first4);
  await page.getByRole('button', { name: first4.planted.length === 0 ? 'Accept' : 'Challenge' }).click();
  for (let i = 1; i < 8; i++) await stamp(page);
  await finishDay(page);

  // Day 5: another unit, vouched for by its owner. Upheld, the owner goes with it.
  await page.getByRole('button', { name: /Open the window/ }).click();
  const day5 = (await game(page)).queue;
  const unit5 = day5.findIndex((a) => a.cast === 'unit');
  expect(day5[unit5].voucher).toBe('Wendell Binns');
  for (let i = 0; i < day5.length; i++) await stamp(page);
  await page.getByRole('button', { name: /End shift/ }).click();
  await expect(page.getByTestId('ruling').filter({ hasText: day5[unit5].name })).toContainText('Removed from the registry with them: Wendell Binns, who vouched for them.');
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: /Begin day/ }).click();
  // The front page's photo of yesterday: the unit refused, and its owner removed with it.
  const wall = page.getByTestId('wall');
  await expect(wall.locator(`[aria-label="${day5[unit5].name}: Refused"]`)).toHaveCount(1);
  await expect(wall.locator('[aria-label="Wendell Binns: Removed"]')).toHaveCount(1);

  // Day 6: Wendell Binns is no longer registered; the applicant vouched for by the day 3 unit, registered on day 3, is valid.
  await page.getByRole('button', { name: /Open the window/ }).click();
  const day6 = (await game(page)).queue;
  const vouched = day6.findIndex((a) => a.voucher === unit3);
  expect(vouched, 'seed 8 changed: pick another').toBeGreaterThan(0);
  expect(day6[vouched].planted).toEqual([{ rule: 'vouch', mistake: 'unregistered' }]);
  for (let i = 0; i < day6.length; i++) {
    if (i === 0) {
      await callNext(page);
      await page.getByRole('tab', { name: 'Registry' }).click();
      await page.getByRole('textbox', { name: 'Name to look up' }).fill('Wendell Binns');
      await page.getByRole('button', { name: 'Search', exact: true }).click();
      await expect(result).toContainText('No registered human by that name.');
      await page.getByRole('tab', { name: 'Rulebook' }).click();
      const a = day6[0];
      if (a.planted.length > 0) await inspectFault(page, a);
      await page.getByRole('button', { name: a.planted.length === 0 ? 'Accept' : 'Challenge' }).click();
      await expect.poll(async () => (await game(page)).decided.length).toBe(1);
    } else if (i === vouched) {
      await callNext(page);
      await expect(page.getByTestId('voucher')).toHaveText(unit3);
      await shot(page, 'live-registry-vouch.png');
      await page.getByRole('button', { name: 'Accept' }).click();
      await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
      await expect(page.getByTestId('citation')).toHaveCount(0);
    } else await stamp(page);
  }
  expect((await game(page)).decided[vouched]).toEqual({ decision: 'accept', outcome: { correct: true, violations: [] }, citation: null });
});

test('the rulebook has a page per rule in force, today’s open, and fits the window', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await open(page, '?seed=1&day=6');
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  const tabs = page.getByRole('tablist', { name: 'Rulebook pages' }).getByRole('tab');
  await expect(tabs).toHaveText(['1', '2', '3', '4', '5', '6']);
  await expect(tabs.nth(5)).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toContainText('Rule 6: Living');
  await page.keyboard.press('3');
  await expect(page.getByRole('tabpanel')).toContainText('Rule 3: The sign');
  const box = (await page.getByRole('region', { name: 'Rulebook' }).boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(700);
  await page.keyboard.press('1');
  await expect(page.getByRole('tabpanel')).toContainText('Rule 1: The phrase');
  const phrase = (await page.getByRole('region', { name: 'Rulebook' }).boundingBox())!;
  expect(phrase.y + phrase.height).toBeLessThanOrEqual(700);
  await page.keyboard.press('2');
  await expect(page.getByRole('tabpanel')).toContainText('Rule 2: The face');
  const faceRule = (await page.getByRole('region', { name: 'Rulebook' }).boundingBox())!;
  expect(faceRule.y + faceRule.height).toBeLessThanOrEqual(700);
  await shot(page, 'day6-desk.png');
});

test('the voucher is one click, or one key, from the registry the day Rule 4 arrives; the face search waits for Rule 5', async ({ page }) => {
  await open(page, '?seed=1&day=4');
  const { a: pat } = await callNext(page);
  const result = page.getByTestId('lookup-result');
  // The day the registry opens, the first applicant comes with a tip on how to use it, and nothing more:
  // Inspect does not light up, and the tip goes once the tool has been used.
  const inspector = page.getByTestId('inspector');
  await expect(inspector).toContainText('New today: the registry. Press V');
  await expect(page.getByRole('button', { name: 'Inspect', exact: true })).not.toHaveClass(/hint/);
  await shot(page, 'day4-tip.png');
  // V: the voucher on the form, looked up, with the registry tab open and the name in its search box.
  await page.keyboard.press('v');
  await expect(inspector).toHaveCount(0);
  await expect(page.getByRole('tab', { name: 'Registry' })).toHaveAttribute('aria-selected', 'true');
  await expect(result).toContainText(`Searched “${pat.voucher}”.`);
  await expect(page.getByRole('textbox', { name: 'Name to look up' })).toHaveValue(pat.voucher!);
  // No face search before its rule: no button for it, and F does nothing.
  await expect(page.getByRole('button', { name: /Search this face|Search the face/ })).toHaveCount(0);
  await page.keyboard.press('f');
  await expect(result).toContainText(`Searched “${pat.voucher}”.`);
  // The button beside the papers does the same as V, and keeps no focus: Space still pulls the lever.
  await page.getByRole('tab', { name: 'Rulebook' }).click();
  await page.getByRole('button', { name: /^Look up/ }).click();
  await expect(result).toContainText(`Searched “${pat.voucher}”.`);
  await expect(page.locator('.lookup-chip', { hasText: 'Look up' })).not.toBeFocused();
  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).called).toBe(2);
});

test('the face is one click, or one key, from the registry the day Rule 5 arrives; its tip waits for the face search itself, on the first applicant only', async ({ page }) => {
  await open(page, '?seed=1&day=5');
  const { a } = await callNext(page);
  const result = page.getByTestId('lookup-result');
  const inspector = page.getByTestId('inspector');
  await expect(inspector).toContainText('New today: the face search. Press F');
  await shot(page, 'day5-tip.png');
  // Yesterday's tool is not today's: looking up the voucher leaves the tip where it is.
  await page.keyboard.press('v');
  await expect(result).toContainText(a.voucher!);
  await expect(inspector).toContainText('New today: the face search');
  // F: the face in the video, shown beside what the registry has, and the tip is done.
  await page.keyboard.press('f');
  await expect(inspector).toHaveCount(0);
  await expect(result).toContainText('Searched the face in the video.');
  await expect(result.getByRole('img', { name: 'The face searched' })).toBeVisible();
  // The button on the printout does the same, and keeps no focus.
  await page.getByRole('tab', { name: 'Rulebook' }).click();
  await page.getByRole('button', { name: /Search this face/ }).click();
  await expect(result).toContainText('On file with this face');
  await expect(page.getByRole('button', { name: /Search this face/ })).not.toBeFocused();
  await shot(page, 'lookup-buttons.png');

  // Once the first applicant has gone, the tip does not come back, used or not.
  await open(page, '?seed=1&day=5');
  await callNext(page);
  await expect(inspector).toContainText('New today: the face search');
  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  const { a: second } = await callNext(page);
  await expect(page.getByRole('region', { name: 'Profile card' })).toContainText(second.name);
  await expect(inspector).toHaveCount(0);
});
