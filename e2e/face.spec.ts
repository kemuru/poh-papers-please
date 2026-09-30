import { expect, test, type Page } from '@playwright/test';
import { FIRST_SLIP, UNITS } from '../src/content/cast';
import { ROBOT_STORY, WELCOME } from '../src/content/gazette';
import { RULEBOOK } from '../src/content/rulebook';
import { FIRST_UNIT_DISMISSED } from '../src/content/verdicts';
import { INSPECT_LINES } from '../src/content/desk';

// One rule a day, Rule N on day N. Day 1's book has one page, the phrase. Day 1's unit says the phrase
// word for word and breaks no rule in force: its light shows, and nothing reads it yet. The next morning
// the paper reprints the frame it lit up in, and Rule 2, the face, comes into the book because of it,
// with the light it asks about drawn on its page (Fig. 2) and its reason at the foot.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });
const tabs = (page: Page) => page.getByRole('tablist', { name: 'Rulebook pages' }).getByRole('tab');
const openTab = (page: Page) => page.getByRole('tablist', { name: 'Rulebook pages' }).getByRole('tab', { selected: true });

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

/** Calls the next applicant and returns them. */
async function callNext(page: Page) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, called } = await game(page);
  return queue[called - 1];
}

async function stamp(page: Page, decision: 'Accept' | 'Challenge') {
  const before = (await game(page)).decided.length;
  await page.getByRole('button', { name: decision }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(before + 1);
}

/** Day 1 up to the unit at the window: the first applicant accepted, Pat challenged. */
async function toTheUnit(page: Page) {
  await open(page, '?seed=1&day=1');
  await callNext(page);
  await stamp(page, 'Accept');
  await callNext(page);
  await stamp(page, 'Challenge');
  const unit = await callNext(page);
  // Every week's day 1: the third applicant is the week's first unit, with the week's biggest lamp, and legal.
  expect(unit.cast).toBe('unit');
  expect(unit.video.lamp).toBe('bloom');
  expect(unit.planted).toEqual([]);
  return unit;
}

test('day 1: one rule, one page, open all day; the letter says a rule comes each morning, and nothing about robots', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/?seed=1&day=1');
  await expect(tabs(page)).toHaveText(['1']);
  await expect(openTab(page)).toHaveText('1');
  await expect(page.getByTestId('rule-cause')).toHaveText(RULEBOOK.phrase.cause);
  const letter = page.getByTestId('welcome');
  await expect(letter).toContainText('one rule today, one more each morning');
  for (const words of ['robot', 'night lamp', 'infrared', 'Rule 0', 'Fig.']) await expect(letter).not.toContainText(words);
  await expect(page.locator('.rule-figure')).toHaveCount(0);
  await shot(page, 'day1-morning.png');

  await page.getByRole('button', { name: /Open the window/ }).click();
  await callNext(page);
  await expect(openTab(page)).toHaveText('1');
  await stamp(page, 'Accept');

  // Pat: the guided Inspect, on the book's one page.
  const pat = await callNext(page);
  expect(pat.cast).toBe('pat');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect the transcript' }).click();
  await page.getByRole('button', { name: 'Inspect Rule 1' }).click();
  await expect(page.getByTestId('inspector')).toContainText('Discrepancy under Rule 1');
  await stamp(page, 'Challenge');
  await expect(openTab(page)).toHaveText('1');
});

test("day 1's unit: its light shows in frame 3, and no rule in force reads it yet; registering it is right", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await toTheUnit(page);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect frame 3' }).click();
  await page.getByRole('button', { name: 'Inspect frame 1' }).click();
  await expect(page.getByTestId('inspector')).toHaveText(INSPECT_LINES.notInForce);
  await shot(page, 'day1-unit-light-no-rule.png');
  await page.keyboard.press('Escape');
  await stamp(page, 'Accept');
  await page.waitForTimeout(2500);
  await expect(page.getByTestId('citation')).toHaveCount(0);
  expect((await game(page)).decided.at(-1)!.outcome.correct).toBe(true);

  // Then Gordon Pim, whom the clerk checks alone: "in this ministry".
  const slip = await callNext(page);
  expect(slip.name).toBe(FIRST_SLIP.name);
  await expect(page.getByTestId('transcript')).toContainText('ministry');
});

test("a hunch on day 1's unit is dismissed, and the court says why; the next morning's paper says what it was", async ({ page }) => {
  await toTheUnit(page);
  await stamp(page, 'Challenge');
  const { queue } = await game(page);
  while ((await game(page)).called < queue.length) {
    const a = await callNext(page);
    await stamp(page, a.planted.length ? 'Challenge' : 'Accept');
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  const court = page.getByRole('region', { name: 'Humanity Court' });
  await expect(court.locator('article', { hasText: `The Registry v. ${UNITS[0].name}` })).toContainText(FIRST_UNIT_DISMISSED);
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: 'Begin day 2' }).click();
  await expect(page.getByTestId('headline')).toHaveText(ROBOT_STORY.challenged);
  await expect(page.getByTestId('gazette-still')).toBeVisible();
});

test('day 2: the paper reprints the frame, the book opens at Rule 2 with its figure and reason, and frame 3 against Rule 2 finds the light', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/?seed=1&day=2');
  await expect(page.getByTestId('headline')).toHaveText(ROBOT_STORY.headline);
  await expect(page.getByTestId('gazette-still').getByRole('img', { name: `${UNITS[0].name}, frame 3` })).toBeVisible();
  await expect(page.getByTestId('gazette')).toContainText('television remote');
  await expect(tabs(page)).toHaveText(['1', '2']);
  await expect(openTab(page)).toHaveText('2');
  const rulebook = page.getByRole('region', { name: 'Rulebook' });
  await expect(rulebook.getByRole('img', { name: RULEBOOK.face.figure!.label })).toBeVisible();
  await expect(rulebook.locator('.rule-figure')).toContainText('Fig. 2-2 A light: not human.', { useInnerText: true });
  await expect(rulebook.getByTestId('rule-cause').filter({ visible: true })).toHaveText(RULEBOOK.face.cause);
  await shot(page, 'day2-morning.png');

  // Seed 1's day 2: two valid applicants, then the unit, lit in frames 1 and 3.
  await page.getByRole('button', { name: /Open the window/ }).click();
  for (const decision of ['Accept', 'Accept'] as const) {
    await callNext(page);
    await stamp(page, decision);
  }
  const unit = await callNext(page);
  expect(unit.cast).toBe('unit');
  expect(unit.planted).toEqual([{ rule: 'face', mistake: 'machine' }]);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect frame 3' }).click();
  await page.getByRole('button', { name: 'Inspect Rule 2' }).click();
  const found = 'Discrepancy under Rule 2: The face. In frame 3 the eyes are shut, and there is a light between the brows.';
  await expect(page.getByTestId('inspector')).toHaveText(found);
  await shot(page, 'day2-frame3-against-rule2.png');

  // Stamped anyway: the citation reprints the film, the frame judge() names marked.
  await stamp(page, 'Accept');
  const citation = page.getByTestId('citation');
  await expect(citation).toContainText('In frame 1 the eyes are shut');
  await expect(citation.getByRole('img', { name: 'The video, as submitted, frame 1 marked.' })).toHaveCount(1);
  await expect(citation.locator('[data-inspect]')).toHaveCount(0);
  await expect(page.getByTestId('inspector')).toHaveText(found);
});

test('a citation under Rule 2 for a mirror prints the evidence line and no film', async ({ page }) => {
  // Seed 1's day 2: two valid applicants, the unit, then Pat with a mirrored photo.
  await open(page, '?seed=1&day=2');
  for (const decision of ['Accept', 'Accept', 'Challenge'] as const) {
    await callNext(page);
    await stamp(page, decision);
  }
  const pat = await callNext(page);
  expect(pat.cast).toBe('pat');
  expect(pat.planted).toEqual([{ rule: 'face', mistake: 'mirrored' }]);
  await stamp(page, 'Accept');
  const citation = page.getByTestId('citation');
  await expect(citation).toContainText('Rule 2: The face');
  await expect(citation.locator('.evidence-line')).toHaveCount(1);
  await expect(citation.getByRole('img')).toHaveCount(0);
});

test('from day 3 the book opens at the day’s new rule, and Inspect turns no page', async ({ page }) => {
  await page.goto('/?seed=1&day=3');
  await expect(tabs(page)).toHaveText(['1', '2', '3']);
  await expect(openTab(page)).toHaveText('3');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const inspect = page.getByRole('button', { name: 'Inspect', exact: true });
  await callNext(page);
  await expect(openTab(page)).toHaveText('3');
  await page.keyboard.press('i');
  await expect(inspect).toHaveAttribute('aria-pressed', 'true');
  await expect(openTab(page)).toHaveText('3');
  await page.keyboard.press('i');
  await page.keyboard.press('2');
  await expect(openTab(page)).toHaveText('2');
});

test('the welcome letter and Rule 2’s page, figure and reason, fit the desk', async ({ page }) => {
  const letter = page.getByTestId('welcome');
  const hall = page.getByRole('img', { name: /The waiting hall/ });
  // A letter longer than the blotter shrinks the hall until the window opens. 1240×820 is the narrowest
  // desk at full height; 1440×900 a common laptop; 1280×640 the widest short one.
  for (const [width, height] of [
    [1240, 820],
    [1440, 900],
    [1280, 640],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/?seed=1&day=1');
    await letter.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    for (const line of WELCOME.lines) await expect(letter).toContainText(line);
    const morning = (await hall.boundingBox())!.height;
    await shot(page, `welcome-letter-${width}x${height}.png`);
    await page.getByRole('button', { name: /Open the window/ }).click();
    await expect(letter).toHaveCount(0);
    await expect.poll(async () => (await hall.boundingBox())!.height, `${width}×${height}`).toBeCloseTo(morning, 0);
  }
  await page.setViewportSize({ width: 1280, height: 700 });
  const rulebook = page.getByRole('region', { name: 'Rulebook' });
  for (const day of [2, 6]) {
    await open(page, `?seed=1&day=${day}`);
    await callNext(page);
    await page.keyboard.press('2');
    await expect(openTab(page)).toHaveText('2');
    await expect(rulebook.getByRole('img', { name: RULEBOOK.face.figure!.label })).toBeVisible();
    const box = (await rulebook.boundingBox())!;
    expect(box.y + box.height, `day ${day}`).toBeLessThanOrEqual(700);
  }
});
