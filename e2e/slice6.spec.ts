import { expect, test, type Page } from '@playwright/test';
import type { GeneratedApplicant } from '../src/gen/applicant';
import { seedForDate } from '../src/gen/today';
import { judge, rulebookForDay } from '../src/rules/judge';
import { inspectFault } from './inspectFault';

// Slice 6 acceptance (notes/acceptance.md): coming back. The notice board, today's week and its card,
// any earlier morning, the clerk's record, the night shift, the settings, and the last unit's slit in
// four colour visions.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });
const record = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('poh-record') ?? 'null'));
const menu = (page: Page) => page.getByRole('dialog');

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

/** Calls the next applicant and stamps them by the rulebook against the live registry, unless `decide` says otherwise; a fake is challenged with what Inspect found. */
async function stamp(page: Page, decide?: (a: GeneratedApplicant) => 'accept' | 'challenge' | undefined) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, day, registry } = await game(page);
  const a = queue[before];
  const [broken] = judge(a, rulebookForDay(day), registry).violations;
  const decision = decide?.(a) ?? (broken ? 'challenge' : 'accept');
  if (decision === 'challenge' && broken && a.planted.some((p) => p.rule === broken.rule)) await inspectFault(page, { ...a, planted: a.planted.filter((p) => p.rule === broken.rule) });
  await page.getByRole('button', { name: decision === 'accept' ? 'Accept' : 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(before + 1);
}

async function stampAll(page: Page, decide?: Parameters<typeof stamp>[1]) {
  const { queue } = await game(page);
  while ((await game(page)).called < queue.length) await stamp(page, decide);
}

async function closeTheDay(page: Page) {
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
}

/** Humanity Day by the rulebook, the clerk's own papers as `self` says, to the letter. */
async function humanityDay(page: Page, query: string, self: 'accept' | 'challenge') {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page, (a) => (a.cast === 'clerk' ? self : undefined));
  await closeTheDay(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  // Six o'clock in the hall comes first (e2e/finale.spec.ts plays it through): skipped, as a second week would.
  await expect(page.getByTestId('finale')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('ending')).toBeVisible();
}

test('the notice board: a first visit has one way in, the vacancy, and every letter blank but for a hint', async ({ page }) => {
  await page.goto('/');
  const board = page.getByRole('region', { name: 'Notice board' });
  await expect(board.getByRole('heading', { level: 1 })).toHaveText('Proof of Humanity');
  await expect(page.getByTestId('board-continue')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Start a new week' })).toBeFocused();
  // One key begins a week; today's week is pinned up from the second visit.
  await expect(page.getByTestId('board-today')).toHaveCount(0);
  await expect(board.getByRole('button', { name: /week/i })).toHaveCount(1);
  // Nothing on it yet that is not the way in: no record, no night shift, no daily week; the letters hint at the endings.
  await expect(page.getByTestId('record')).toHaveCount(0);
  await expect(page.getByTestId('board-night')).toHaveCount(0);
  await expect(page.getByTestId('letters')).toContainText('0 of 6');
  await expect(page.getByTestId('letters').locator('[data-found="false"]')).toHaveCount(6);
  await expect(page.getByTestId('letters')).toContainText('A letter on day 3, signed.');
  await shot(page, 'board-first-visit.png');
  // Enter takes the focused notice: the first week there is, from its first morning.
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('welcome')).toBeVisible();
  expect(await game(page)).toMatchObject({ seed: 1, day: 1 });
});

test('today’s week: the same date is the same week, another date another, and the board knows it is under way', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 8, 29, 10, 0));
  await page.goto('/');
  // A clerk back for another week: a first visit has the vacancy alone, and no calendar leaf yet.
  await page.evaluate(() =>
    localStorage.setItem('poh-record', JSON.stringify({ v: 1, weeks: 1, letters: [], bestSavings: 300, bestGrade: null, today: null, endless: null, counted: null })),
  );
  await page.reload();
  await expect(page.getByTestId('board-today')).toContainText('Tuesday 29 September 2026');
  await page.getByRole('button', { name: 'Play the daily week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  const today = seedForDate({ year: 2026, month: 9, day: 29 });
  expect((await game(page)).seed).toBe(today);
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Continue the daily week' })).toBeVisible();
  await shot(page, 'board-today-underway.png');
  // The next day: another week, and beginning it asks first, since yesterday's is under way.
  await page.clock.setFixedTime(new Date(2026, 8, 30, 10, 0));
  await page.reload();
  await expect(page.getByTestId('board-today')).toContainText('Wednesday 30 September 2026');
  await page.getByRole('button', { name: 'Play the daily week' }).click();
  await expect(page.getByRole('heading', { name: 'Start another week?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Keep my week' })).toBeFocused();
  await page.getByRole('button', { name: 'Start another week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  const tomorrow = seedForDate({ year: 2026, month: 9, day: 30 });
  expect(tomorrow).not.toBe(today);
  expect((await game(page)).seed).toBe(tomorrow);
});

test('where the browser keeps nothing, the board still holds the week the desk left, and the record lasts the page', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Refused', 'SecurityError');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stamp(page);
  await page.getByRole('button', { name: 'Menu' }).click();
  await menu(page).getByRole('button', { name: 'Notice board' }).click();
  await expect(page.getByTestId('board-continue')).toContainText('Day 1, at the window');
  // Another week asks first, and Escape keeps this one.
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByRole('dialog', { name: 'Start another week?' })).toContainText('1 day at the window');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Continue' }).click();
  expect(await game(page)).toMatchObject({ day: 1, called: 1 });
  expect((await game(page)).decided).toHaveLength(1);
  // A letter reached here is on the board until the page is closed.
  await humanityDay(page, '?seed=1&day=7', 'challenge');
  await page.getByRole('button', { name: 'Notice board' }).click();
  await expect(page.getByTestId('record')).toContainText('Weeks finished1');
  await expect(page.getByTestId('letters')).toContainText('1 of 6');
  await expect(page.getByTestId('board-night').getByRole('button', { name: 'Take the night shift' })).toBeVisible();
});

test('copy my week: one row per day of stamps, the letter, the grade and the savings, and nobody’s name', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.clock.setFixedTime(new Date(2026, 8, 29, 10, 0));
  const seed = seedForDate({ year: 2026, month: 9, day: 29 });
  await humanityDay(page, `?seed=${seed}&day=7`, 'challenge');
  const { queue, savings } = await game(page);
  await page.getByRole('button', { name: 'Copy my week' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Copied.' })).toBeVisible();
  const card = await page.evaluate(() => navigator.clipboard.readText());
  expect(card.split('\n')).toEqual([
    'Registry Window 3 · Today’s week, Tuesday 29 September 2026',
    'Day 7 🟩🟩🟩🟩🟩🟩🟩',
    `Reclassified · Equipment, First Class · ${savings} PNK`,
  ]);
  for (const a of queue) expect(card).not.toContain(a.name);
  // The notice board keeps today's card, to copy again, and the letter it ended with.
  await page.getByRole('button', { name: 'Notice board' }).click();
  await expect(page.getByTestId('board-today')).toContainText(`Finished: Reclassified, ${savings} PNK.`);
  await expect(page.getByTestId('board-today').getByRole('button', { name: 'Copy my week' })).toBeVisible();
  await shot(page, 'board-today-finished.png');
});

test('go back to any earlier morning of the week, from the menu or from the letter; the week plays on from there', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page);
  await closeTheDay(page);
  await page.getByRole('button', { name: 'Begin day 2' }).click();
  await expect(page.getByTestId('gazette')).toBeVisible();
  const day2 = await game(page);

  // From the menu: an earlier morning asks first.
  await page.keyboard.press('Escape');
  await expect(menu(page)).toContainText('Go back to the morning of');
  await menu(page).getByRole('button', { name: 'day 1', exact: true }).click();
  await expect(menu(page)).toContainText('Go back to the morning of day 1?');
  await expect(menu(page)).toContainText('2 days at the window');
  await expect(page.getByRole('button', { name: 'Keep playing' })).toBeFocused();
  await shot(page, 'confirm-morning.png');
  await menu(page).getByRole('button', { name: 'Go back to day 1' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  expect(await game(page)).toMatchObject({ day: 1, savings: 240, decided: [], opened: false });

  // The week plays on from there, to the same second morning.
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page);
  await closeTheDay(page);
  await page.getByRole('button', { name: 'Begin day 2' }).click();
  expect((await game(page)).savings).toBe(day2.savings);

  // From the letter at the end, with nothing left to lose, a morning is one click, and asks nothing.
  await humanityDay(page, '?seed=1&day=7', 'accept');
  await page.getByTestId('ending').getByRole('button', { name: 'day 7', exact: true }).click();
  await expect(page.getByTestId('gazette')).toBeVisible();
  expect(await game(page)).toMatchObject({ day: 7, phase: 'shift', opened: false, decided: [] });
});

test('the clerk’s record and the letters found survive a reload and a new week', async ({ page }) => {
  await humanityDay(page, '?seed=1&day=7', 'accept');
  await page.getByRole('button', { name: 'Notice board' }).click();
  const letters = page.getByTestId('letters');
  await expect(letters).toContainText('1 of 6');
  await expect(letters.locator('[data-letter="promoted"]')).toHaveAttribute('data-found', 'true');
  await expect(page.getByTestId('record')).toContainText('Weeks finished1');
  await page.reload();
  await expect(letters.locator('[data-letter="promoted"]')).toHaveAttribute('data-found', 'true');
  // The letter's desk comes back with the save, and is not counted twice.
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('ending')).toBeVisible();
  expect((await record(page)).weeks).toBe(1);
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  await page.keyboard.press('Escape');
  await menu(page).getByRole('button', { name: 'Notice board' }).click();
  await expect(letters.locator('[data-letter="promoted"]')).toHaveAttribute('data-found', 'true');
  expect(await record(page)).toMatchObject({ weeks: 1, letters: ['promoted'] });
  // Back to the letter, the other way: a second letter found, a second week counted.
  await humanityDay(page, '?seed=1&day=7', 'challenge');
  await page.getByRole('button', { name: 'Notice board' }).click();
  await expect(letters).toContainText('2 of 6');
  expect(await record(page)).toMatchObject({ weeks: 2, letters: ['promoted', 'reclassified'], bestGrade: 'First' });
  await shot(page, 'board-two-letters.png');
});

test('the night shift: opened by a letter, every stamp judged at once, and the third citation ends it; the best is kept', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem('poh-record', JSON.stringify({ v: 1, weeks: 1, letters: ['reclassified'], bestSavings: 400, bestGrade: 'First', today: null, endless: null, counted: null })),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Take the night shift' }).click();
  await expect(page.getByTestId('night-card')).toContainText('Night shift 1');
  await expect(page.getByTestId('night-card')).toContainText('the day before Humanity Day, as it always is now');
  await page.getByRole('button', { name: /Open the window/ }).click();
  // Right, then wrong three times over: a fake stamped in and humans challenged.
  let wrong = 0;
  while (wrong < 3) {
    const { called, queue, registry, day } = await game(page);
    const a = queue[called];
    const valid = judge(a, rulebookForDay(day), registry).valid;
    const miss = called > 0;
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await expect.poll(async () => (await game(page)).called).toBe(called + 1);
    await page.getByRole('button', { name: valid !== miss ? 'Accept' : 'Challenge' }).click();
    await expect.poll(async () => (await game(page)).decided.length).toBe(called + 1);
    if (miss) {
      wrong++;
      await expect(page.getByTestId('citation')).toContainText(`Citation ${wrong} of 3`);
      if (wrong === 1) await shot(page, 'night-citation.png');
    }
    await expect(page.getByTestId('night-citations')).toHaveText(`${wrong} of 3`);
  }
  await expect(page.getByTestId('night-end')).toContainText('The Ministry never closes. Window 3, however, has.');
  await expect(page.getByTestId('night-end')).toContainText('You stamped 1 right, over 1 shift.');
  await shot(page, 'night-end.png');
  expect((await record(page)).endless).toBe(1);
  await page.getByRole('button', { name: 'Notice board' }).click();
  await expect(page.getByTestId('board-night')).toContainText('Best: 1 stamped right.');
});

test('single-key shortcuts can be turned off, and only the focused button answers; the choice is kept', async ({ page }) => {
  await page.goto('/');
  const shortcuts = page.getByRole('switch', { name: /Single-key shortcuts/ });
  await expect(shortcuts).toHaveAttribute('aria-checked', 'true');
  await shortcuts.click();
  await expect(shortcuts).toHaveAttribute('aria-checked', 'false');
  await page.reload();
  await expect(shortcuts).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  // Space does not open the window, and A does not stamp.
  await page.locator('body').press('Space');
  await page.waitForTimeout(300);
  expect((await game(page)).opened).toBe(false);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await page.locator('body').press('a');
  await page.waitForTimeout(300);
  expect((await game(page)).decided).toHaveLength(0);
  // The focused button still answers its key.
  await page.getByRole('button', { name: 'Accept' }).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  // Escape is not a character: it still opens the menu, where the switch is too.
  await page.keyboard.press('Escape');
  await expect(menu(page).getByRole('switch', { name: /Single-key shortcuts/ })).toHaveAttribute('aria-checked', 'false');
});

test('with single-key shortcuts off, the desk shows no key caps and the sound switch names no key', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('switch', { name: 'Single-key shortcuts' }).click();
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect(page.getByRole('button', { name: 'Accept' })).toBeEnabled();
  const caps = await page.locator('kbd').all();
  expect(caps.length).toBeGreaterThan(0);
  for (const cap of caps) await expect(cap).toBeHidden();
  await expect(page.getByRole('button', { name: 'Sound' })).toHaveAttribute('title', 'Sound on or off');
});

test('reduced motion can be asked for in the settings, and is kept', async ({ page }) => {
  await page.goto('/');
  const motion = page.getByRole('switch', { name: 'Reduce motion' });
  await expect(motion).toHaveAttribute('aria-checked', 'false');
  await motion.click();
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/motion-reduced/);
  await expect(motion).toHaveAttribute('aria-checked', 'true');
});

test.describe('the day 7 unit, close up', () => {
  // Four screen pixels to a desk pixel, so the evidence can be read.
  test.use({ deviceScaleFactor: 4 });

  test('the last unit’s slit reads in four colour visions (screenshots)', async ({ page }) => {
    await page.goto('/?seed=1&day=7');
    await page.getByRole('button', { name: /Open the window/ }).click();
    const unitAt = (await game(page)).queue.findIndex((a) => a.cast === 'unit');
    for (let i = 0; i < unitAt; i++) await stamp(page);
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.waitForTimeout(1500);
    // Colour-vision matrices (Machado et al. 2009, severity 1.0) and full achromatopsia.
    const MATRICES = {
      protan: '0.152 1.053 -0.205 0 0 0.115 0.786 0.099 0 0 -0.004 -0.048 1.052 0 0 0 0 0 1 0',
      deutan: '0.367 0.861 -0.228 0 0 0.280 0.673 0.047 0 0 -0.012 0.043 0.969 0 0 0 0 0 1 0',
      tritan: '1.256 -0.077 -0.179 0 0 -0.078 0.931 0.148 0 0 0.005 0.691 0.304 0 0 0 0 0 1 0',
      achroma: '0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0.299 0.587 0.114 0 0 0 0 0 1 0',
    };
    await page.evaluate((matrices) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.innerHTML = Object.entries(matrices)
        .map(([id, values]) => `<filter id="cv-${id}"><feColorMatrix type="matrix" values="${values}"/></filter>`)
        .join('');
      document.body.append(svg);
    }, MATRICES);
    const frame = page.getByTestId('frame-3');
    for (const id of ['none', ...Object.keys(MATRICES)]) {
      await frame.evaluate((el, f) => ((el as HTMLElement).style.filter = f === 'none' ? '' : `url(#cv-${f})`), id);
      await frame.screenshot({ path: test.info().outputPath(`slit-${id}.png`), scale: 'device' });
    }
  });
});
