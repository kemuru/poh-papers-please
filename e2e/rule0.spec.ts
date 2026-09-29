import { expect, test, type Page } from '@playwright/test';
import { RULEBOOK } from '../src/content/rulebook';

// Rule 0 first: on day 1 the rulebook is open where the welcome letter and the sticky note start,
// the letter says what a unit is and why it lights up, Rule 0's page shows the light it asks about
// (Fig. 0) and what it means, and a unit registered by mistake comes back on its citation with its
// video, the frame that gave it away outlined.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });
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
  // Seed 1's day 1: the third applicant is the week's first unit, with the week's biggest lamp.
  expect(unit.cast).toBe('unit');
  expect(unit.video.lamp).toBe('bloom');
  return unit;
}

test('day 1: the book is open at Rule 0, with its figure, and every call puts it back; the guided Inspect turns it to Rule 1', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/?seed=1&day=1');
  await expect(openTab(page)).toHaveText('0');
  await expect(page.getByRole('region', { name: 'Rulebook' }).getByRole('img', { name: RULEBOOK.human.figure!.label })).toBeVisible();
  await expect(page.getByTestId('welcome')).toContainText('Rule 0 is read in the video');
  await shot(page, 'day1-morning.png');

  await page.getByRole('button', { name: /Open the window/ }).click();
  await callNext(page);
  await expect(openTab(page)).toHaveText('0');
  await page.keyboard.press('1');
  await expect(openTab(page)).toHaveText('1');
  await stamp(page, 'Accept');

  // Pat: the book is back at Rule 0 until Inspect, which turns it to the page its hint names.
  const pat = await callNext(page);
  expect(pat.cast).toBe('pat');
  await expect(openTab(page)).toHaveText('0');
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await expect(openTab(page)).toHaveText('1');
  await expect(page.getByRole('button', { name: 'Inspect Rule 1' })).toBeVisible();
  await page.getByRole('button', { name: 'Inspect the transcript' }).click();
  await page.getByRole('button', { name: 'Inspect Rule 1' }).click();
  await expect(page.getByTestId('inspector')).toContainText('Discrepancy · Rule 1');
  await stamp(page, 'Challenge');

  const next = await callNext(page);
  expect((await game(page)).queue[2].cast).toBe('unit');
  expect(next.cast).toBe('unit');
  await expect(openTab(page)).toHaveText('0');
  await shot(page, 'day1-unit-at-window.png');
});

test('before the first unit, the letter and the book say what it is and why it lights up, and the letter costs the hall nothing', async ({ page }) => {
  const letter = page.getByTestId('welcome');
  const hall = page.getByRole('img', { name: /The waiting hall/ });
  await page.goto('/?seed=1&day=1');
  for (const words of ['home robots', 'eyes are cameras', 'night lamp', 'infrared', 'Fig. 0-2']) await expect(letter).toContainText(words);
  await expect(page.getByRole('region', { name: 'Rulebook' }).locator('.rule-figure')).toContainText('Fig. 0-2 A light: a robot.', { useInnerText: true });

  // A letter longer than the blotter shrinks the hall until the window opens. 1240×820 is the narrowest
  // desk at full height, where the letter runs longest; 1440×900 a common laptop; 1280×640 the widest short one.
  for (const [width, height] of [
    [1240, 820],
    [1440, 900],
    [1280, 640],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto('/?seed=1&day=1');
    await letter.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
    const morning = (await hall.boundingBox())!.height;
    await shot(page, `welcome-letter-${width}x${height}.png`);
    await page.getByRole('button', { name: /Open the window/ }).click();
    await expect(letter).toHaveCount(0);
    await expect.poll(async () => (await hall.boundingBox())!.height, `${width}×${height}`).toBeCloseTo(morning, 0);
  }
});

test('at the first unit, frame 3 against the page the book is open at finds the light', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await toTheUnit(page);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect frame 3' }).click();
  // No page turned: the book is still where the call left it.
  await page.getByRole('button', { name: 'Inspect Rule 0' }).click();
  const found = 'Discrepancy · Rule 0: A real human. In frame 3 the eyes are shut, and there is a light between the brows.';
  await expect(page.getByTestId('inspector')).toHaveText(found);
  await shot(page, 'day1-frame3-against-rule0.png');

  // Stamped anyway: while the papers leave, the strip still says what it found on them, as the citation does.
  await stamp(page, 'Accept');
  await expect(page.getByTestId('citation')).toContainText('In frame 3 the eyes are shut');
  await expect(page.getByTestId('inspector')).toHaveText(found);
});

test('a unit registered on day 1 comes back on the citation: its film, frame 3 marked, on a slip that fits', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 640 });
  await toTheUnit(page);
  await stamp(page, 'Accept');
  const citation = page.getByTestId('citation');
  await expect(citation.getByRole('img', { name: 'The video, as submitted, frame 3 marked.' })).toHaveCount(1);
  await expect(citation).toContainText('Frame 3 · 00:05');
  // The reprint is nothing to point at: the desk's own frame 3 is still the only one.
  await expect(page.locator('[data-inspect="frame-3"]')).toHaveCount(1);
  await expect(page.getByTestId('frame-3')).toHaveCount(1);
  await expect(citation.locator('[data-inspect]')).toHaveCount(0);

  await citation.evaluate((el) => Promise.all(el.getAnimations().map((a) => a.finished)));
  const slip = (await citation.boundingBox())!;
  const blotter = (await page.locator('.desk-papers').boundingBox())!;
  expect(slip.y + slip.height).toBeLessThanOrEqual(blotter.y + blotter.height);
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([1280, 640]);
  await shot(page, 'citation-unit-day1.png');
});

test('a citation under another rule prints no film, though its evidence is a line as Rule 0’s is', async ({ page }) => {
  // Seed 1's day 2: two valid applicants, the unit, then Pat with a mirrored photo (Rule 2). Rule 2's
  // evidence is a line, printed where Rule 0's is, so only the rule decides whether the film comes too.
  await open(page, '?seed=1&day=2');
  for (const decision of ['Accept', 'Accept', 'Challenge'] as const) {
    await callNext(page);
    await stamp(page, decision);
  }
  const pat = await callNext(page);
  expect(pat.cast).toBe('pat');
  expect(pat.planted).toEqual([{ rule: 'photo', mistake: 'mirrored' }]);
  await stamp(page, 'Accept');
  const citation = page.getByTestId('citation');
  await expect(citation).toContainText('Rule 2: Photo');
  await expect(citation.locator('.evidence-line')).toHaveCount(1);
  await expect(citation.getByRole('img')).toHaveCount(0);
});

test('from day 2 the book opens at the day’s new rule, Inspect turns no page, and the Gazette names the night lamp', async ({ page }) => {
  await page.goto('/?seed=1&day=2');
  await expect(page.getByTestId('gazette')).toContainText('night lamp');
  await expect(openTab(page)).toHaveText('2');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const inspect = page.getByRole('button', { name: 'Inspect', exact: true });
  await callNext(page);
  await expect(openTab(page)).toHaveText('2');
  await page.keyboard.press('i');
  await expect(inspect).toHaveAttribute('aria-pressed', 'true');
  await expect(openTab(page)).toHaveText('2');
  await page.keyboard.press('i');
  await expect(inspect).toHaveAttribute('aria-pressed', 'false');
  await stamp(page, 'Accept');

  // The second applicant: on day 1 the guided one, whose Inspect turns the book to Rule 1. Not on day 2.
  await callNext(page);
  expect((await game(page)).called).toBe(2);
  await expect(openTab(page)).toHaveText('2');
  await page.keyboard.press('i');
  await expect(inspect).toHaveAttribute('aria-pressed', 'true');
  await expect(openTab(page)).toHaveText('2');
});

test('Rule 0’s page, figure and all, costs the hall no more than it did', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  const hall = page.getByRole('img', { name: /The waiting hall/ });
  const rulebook = page.getByRole('region', { name: 'Rulebook' });
  for (const [day, own] of [
    [1, '1'],
    [6, '6'],
  ] as const) {
    await open(page, `?seed=1&day=${day}`);
    await callNext(page);
    await page.keyboard.press(own);
    await expect(openTab(page)).toHaveText(own);
    const withOwn = (await hall.boundingBox())!.height;
    await page.keyboard.press('0');
    await expect(openTab(page)).toHaveText('0');
    await expect(rulebook.getByRole('img', { name: RULEBOOK.human.figure!.label })).toBeVisible();
    const withRule0 = (await hall.boundingBox())!.height;
    // Day 1's Rule 1 and Rule 0 cost the hall the same; day 6's short Rule 6 leaves it a little more.
    if (day === 1) expect(Math.abs(withOwn - withRule0), `day ${day}`).toBeLessThanOrEqual(0.5);
    else expect(withOwn - withRule0, `day ${day}`).toBeLessThanOrEqual(10);
    const box = (await rulebook.boundingBox())!;
    expect(box.y + box.height, `day ${day}`).toBeLessThanOrEqual(700);
  }
});
