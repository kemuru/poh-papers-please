import { expect, test, type Page } from '@playwright/test';

// Slice 2 acceptance (notes/acceptance.md): one full day. A seeded queue, the shift clock,
// the daily warning, challenges heard at the end of the shift, the statement, the next day.
const game = (page: Page) => page.evaluate(() => window.__game!);

const shot = (page: Page, name: string) =>
  page.screenshot({ path: test.info().outputPath(name), fullPage: true, animations: 'disabled' });

/** Calls the next applicant and stamps them; `wrong` stamps the opposite of what the rulebook says. */
async function stampNext(page: Page, wrong = false) {
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  const { queue, called } = await game(page);
  const valid = queue[called - 1].planted.length === 0;
  await page.getByRole('button', { name: valid !== wrong ? 'Accept' : 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(called);
}

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test('the same seed gives the same queue, with the day table’s count', async ({ page }) => {
  await page.goto('/?seed=5&day=3');
  await page.waitForFunction(() => window.__game !== undefined);
  const first = (await game(page)).queue;
  expect(first).toHaveLength(8);
  await expect(page.getByRole('img', { name: 'The waiting hall. 8 waiting.' })).toBeVisible();
  await page.reload();
  await page.waitForFunction(() => window.__game !== undefined);
  expect((await game(page)).queue).toEqual(first);
  await page.goto('/?seed=6&day=3');
  await page.waitForFunction(() => window.__game?.seed === 6);
  expect((await game(page)).queue).not.toEqual(first);
  await shot(page, 'morning.png');
});

test('a full day: the court hears the challenges, the statement adds up, savings carry to day 2', async ({ page }) => {
  await page.goto('/?seed=7&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  // Seed 7, day 1: a valid applicant first, then a fake. Challenge the first (a mistake) and
  // register the second (another), then do the rest by the rulebook.
  const { queue } = await game(page);
  expect(queue.map((a) => a.planted.length > 0)).toEqual([false, true, false, false, true]);
  await stampNext(page, true);
  await stampNext(page, true);
  await expect(page.getByTestId('citation')).toContainText('Warning only');
  for (let i = 2; i < queue.length; i++) await stampNext(page);
  await expect(page.getByRole('img', { name: 'The waiting hall. 0 waiting.' })).toBeVisible();
  await expect(page.getByTestId('speech')).toContainText('The Registry is closed for the day.');
  await shot(page, 'closed.png');

  await page.getByRole('button', { name: /End shift/ }).click();
  const court = page.getByRole('region', { name: 'Humanity Court' });
  const rulings = court.getByTestId('ruling');
  await expect(rulings).toHaveCount(2);
  await expect(rulings.nth(0)).toContainText('Challenge dismissed');
  await expect(rulings.nth(0)).toContainText(queue[0].name);
  await expect(rulings.nth(1)).toContainText('Challenge upheld');
  await expect(rulings.nth(1)).toContainText('Gary Mann');
  await shot(page, 'court.png');

  await page.getByRole('button', { name: /To the accounts/ }).click();
  const { end } = await game(page);
  // 2 registrations (+20), 1 upheld (+15), 1 dismissed (-15), 1 warning (0): 20 PNK at the desk.
  expect(end!.pay).toEqual({ registrations: 2, upheld: 1, dismissed: 1, warnings: 1, fines: 0, total: 20 });
  const bills = end!.bills.reduce((sum, b) => sum + b.amount, 0);
  expect(end!.after).toBe(end!.before + 20 - bills);
  const statement = page.getByRole('region', { name: 'Statement' });
  await expect(statement.getByTestId('savings')).toHaveText(`${end!.after} PNK`);
  for (const bill of end!.bills) await expect(statement).toContainText(bill.item);
  await shot(page, 'statement.png');

  await page.getByRole('button', { name: 'Begin day 2' }).click();
  await expect.poll(async () => (await game(page)).day).toBe(2);
  expect((await game(page)).savings).toBe(end!.after);
  expect((await game(page)).queue).toHaveLength(7);
  await expect(page.getByTestId('topbar-savings')).toHaveText(String(end!.after));
});

test('the first fake registered each day is a warning; the next is a fine', async ({ page }) => {
  await page.goto('/?seed=7&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampNext(page);
  await stampNext(page, true);
  await expect(page.getByTestId('citation')).toHaveAttribute('data-variant', 'warning');
  await stampNext(page);
  await stampNext(page);
  await stampNext(page, true);
  await expect(page.getByTestId('citation')).toHaveAttribute('data-variant', 'fine');
  await expect(page.getByTestId('citation')).toContainText('Fine: 20 PNK');
  await shot(page, 'citation-fine.png');
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await expect(page.getByRole('region', { name: 'Statement' })).toContainText('Citations: 1 warning, 1 fine');
  expect((await game(page)).end!.pay.total).toBe(3 * 10 - 20);
});

test('the keyboard runs the window: Space opens and calls, A and C stamp', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.waitForFunction(() => window.__game !== undefined);
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).opened).toBe(true);
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).called).toBe(1);
  await page.keyboard.press('a');
  await expect.poll(async () => (await game(page)).decided[0]?.decision).toBe('accept');
  await page.keyboard.press('Space');
  await page.keyboard.press('c');
  await expect.poll(async () => (await game(page)).decided[1]?.decision).toBe('challenge');
});

test('when the clock runs out, whoever is left goes home: no penalty, only lost income', async ({ page }) => {
  // Six simulated minutes of timers (the clock, the music) take a while to run through.
  test.setTimeout(90_000);
  await page.clock.install();
  await page.goto('/?seed=3&day=2');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampNext(page);
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect(page.getByTestId('clock')).toHaveText('09:00');

  // Day 2 has a six-minute shift: 09:00 to 17:00.
  await page.clock.runFor(6 * 60 * 1000);
  await expect(page.getByTestId('clock')).toHaveText('17:00');
  await expect.poll(async () => (await game(page)).timeUp).toBe(true);
  await expect(page.getByRole('button', { name: 'Accept' })).toBeDisabled();
  await expect(page.getByTestId('speech')).toContainText('come back another day');
  await shot(page, 'time-up.png');

  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  const { end, decided, queue } = await game(page);
  expect(decided).toHaveLength(1);
  // Six went home unprocessed: they cost nothing but the pay they would have brought.
  expect(end!.pay.total).toBe(queue[0].planted.length === 0 ? 10 : 15);
  await expect(page.getByRole('region', { name: 'Statement' })).toContainText('Sent home unprocessed: 6');
});

test('if anything breaks, the window closes politely instead of going blank', async ({ page }) => {
  // Break the snapshot the game takes after every render, from outside the app.
  await page.addInitScript(() => {
    window.structuredClone = () => {
      throw new Error('The printer is on fire.');
    };
  });
  await page.goto('/?seed=1&day=1');
  await expect(page.getByRole('alert')).toContainText('Window 3 is out of order');
  await expect(page.getByRole('alert')).toContainText('The printer is on fire.');
  await shot(page, 'error.png');
});

test('mouse and keyboard mix: the sound button keeps no focus, and the stamps rest outside the shift', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  // Clicking Sound must not leave it focused, or Space would toggle it instead of calling someone.
  await page.getByRole('button', { name: 'Sound' }).click();
  await expect(page.getByRole('button', { name: 'Sound' })).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).called).toBe(1);
  await expect(page.getByRole('button', { name: 'Sound' })).toHaveAttribute('aria-pressed', 'true');

  // The stamp that comes down is the one used, by key or by mouse.
  await page.keyboard.press('c');
  await expect(page.getByRole('button', { name: 'Challenge' })).toHaveClass(/used/);
  await expect(page.getByRole('button', { name: 'Accept' })).not.toHaveClass(/used/);
  for (let i = 1; i < 5; i++) {
    await page.keyboard.press('Space');
    await expect.poll(async () => (await game(page)).called).toBe(i + 1);
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect(page.getByRole('button', { name: 'Accept' })).toHaveClass(/used/);
  }

  await page.getByRole('button', { name: /End shift/ }).click();
  await expect(page.getByRole('region', { name: 'Humanity Court' })).toBeVisible();
  const before = await game(page);
  await page.keyboard.press('a');
  await page.keyboard.press('c');
  expect(await game(page)).toEqual(before);
});

test('a sheet dragged over the printer lies on top of it, while held and once dropped', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  const form = page.getByRole('region', { name: 'Profile card' });
  await expect.poll(() => form.evaluate((el) => el.getAnimations().every((a) => a.playState === 'finished'))).toBe(true);
  /** What is on top at the middle of the printer, which is drawn by the blotter's ::before. */
  const onPrinter = () =>
    page.evaluate(() => {
      const blotter = document.querySelector<HTMLElement>('.desk-papers')!;
      const box = blotter.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + box.width / 2, box.top - 2 * (box.width / blotter.offsetWidth));
      return hit === blotter ? 'printer' : hit?.closest('section[aria-label]')?.getAttribute('aria-label');
    });
  expect(await onPrinter()).toBe('printer');

  const box = (await form.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.6);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.1, { steps: 5 });
  expect(await onPrinter()).toBe('Profile card');
  await page.mouse.up();
  expect(await onPrinter()).toBe('Profile card');
});
