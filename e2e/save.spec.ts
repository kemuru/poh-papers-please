import { expect, test, type Page } from '@playwright/test';

// The week survives a reload: the desk comes back as it was left, the clock where it stopped.
// Escape is the clerk's break, and the two ways to start again are behind a question.

const game = (page: Page) => page.evaluate(() => window.__game!);
const saved = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('poh-save') ?? 'null'));
const menu = (page: Page) => page.getByRole('dialog');
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test('a reload finds the desk as it was left, behind a card that holds the queue', async ({ page }) => {
  // A plain address opens at the notice board (slice 6): on a first visit, with a vacancy and no week to continue.
  await page.goto('/');
  await expect(page.getByTestId('board-continue')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await page.getByRole('button', { name: 'Accept' }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(2);
  const before = await game(page);

  // The card is the notice board, which holds the week and says where it stands; Continue has the focus.
  await page.reload();
  await expect(page.getByTestId('board-continue')).toContainText('Day 1 · At the window');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeFocused();
  await shot(page, 'welcome-back.png');

  // Space, out of habit, takes the week up again, with the same person at the window.
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Profile card' }).getByTestId('name')).toHaveText(before.queue[1].name);
  const after = await game(page);
  expect(after.decided).toEqual(before.decided);
  expect(after.called).toBe(2);
});

test('the shift clock stops for the menu, and a reload picks it up where it stopped', async ({ page }) => {
  await page.clock.install();
  await page.goto('/?seed=3&day=2');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await page.clock.runFor(60_000);
  await expect.poll(async () => (await saved(page)).clock).toBeGreaterThanOrEqual(55);

  await page.keyboard.press('Escape');
  await expect(menu(page)).toContainText('Paused');
  await expect(menu(page)).toContainText(/Day 2 · At the window · 5:0\d left/);
  await shot(page, 'paused.png');
  // Nothing is read or stamped on a break.
  await page.keyboard.press('a');
  await page.clock.runFor(120_000);
  expect((await game(page)).decided).toHaveLength(0);
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  const clock = (await saved(page)).clock;
  expect(clock).toBeGreaterThanOrEqual(55);
  expect(clock).toBeLessThan(70);

  // A plain address opens at the notice board, where the saved week waits, the link's week included.
  await page.goto('/');
  await expect(page.getByTestId('board-continue')).toContainText(/Day 2 · At the window · 5:0\d left/);
  await page.getByRole('button', { name: 'Continue' }).click();
  expect((await game(page)).seed).toBe(3);
});

test('Escape leaves inspect mode first, then opens the menu; Escape closes it again', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  const inspect = page.getByRole('button', { name: 'Inspect', exact: true });
  await page.keyboard.press('i');
  await expect(inspect).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('Escape');
  await expect(inspect).toHaveAttribute('aria-pressed', 'false');
  await expect(menu(page)).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(menu(page)).toContainText('Paused');
  await page.keyboard.press('Escape');
  await expect(menu(page)).toBeHidden();
  // The corner button opens it too, and keeps no focus.
  await page.getByRole('button', { name: 'Menu' }).click();
  await expect(menu(page)).toBeVisible();
  await page.getByRole('button', { name: 'Back to the window' }).click();
  await expect(page.getByRole('button', { name: 'Menu' })).not.toBeFocused();
});

test('starting today again asks first, then lays out this morning’s paper as it was', async ({ page }) => {
  await page.goto('/?seed=1&day=2');
  const morning = await game(page);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await page.getByRole('button', { name: 'Challenge' }).click();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Start day 2 again' }).click();
  await expect(menu(page)).toContainText('Start day 2 again?');
  await expect(page.getByRole('button', { name: 'Keep playing' })).toBeFocused();
  await shot(page, 'confirm-day.png');
  // Escape backs out of the question, not out of the day.
  await page.keyboard.press('Escape');
  await expect(menu(page)).toContainText('Paused');
  await page.getByRole('button', { name: 'Start day 2 again' }).click();
  await menu(page).getByRole('button', { name: 'Start day 2 again' }).click();

  await expect(menu(page)).toBeHidden();
  await expect(page.getByTestId('gazette')).toBeVisible();
  await expect(page.getByRole('button', { name: /Open the window/ })).toBeVisible();
  const again = await game(page);
  expect(again).toMatchObject({ day: 2, opened: false, decided: [], savings: morning.savings });
  expect(again.gazette).toEqual(morning.gazette);
  // The link is behind us: a reload keeps this week, not the link's, one Continue away.
  expect(new URL(page.url()).search).toBe('');
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('gazette')).toBeVisible();
  expect((await game(page)).day).toBe(2);
});

test('a new week asks first, then begins on day 1 with the next seed', async ({ page }) => {
  await page.goto('/?seed=5&day=3');
  await expect(page.getByTestId('gazette')).toBeVisible();
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(menu(page)).toContainText('Start a new week?');
  await expect(menu(page)).toContainText('1 day at the window and 240 PNK');
  await page.getByRole('button', { name: 'Keep playing' }).click();
  await expect(menu(page)).toBeHidden();
  expect((await game(page)).seed).toBe(5);

  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await menu(page).getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  expect(await game(page)).toMatchObject({ seed: 6, day: 1 });
  await page.reload();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  expect((await game(page)).seed).toBe(6);
});

test('a save that cannot be kept is set aside with a word, and a new week begins', async ({ page }) => {
  // Planted where no desk is open, or the desk would save over it on the way out.
  await page.goto('/?portraits');
  await page.evaluate(() => localStorage.setItem('poh-save', '{"v":1,"seed":7,"startDay":1,"steps":["call"],"clock":0,"check":"x"}'));
  await page.goto('/');
  // The word is on the notice board, and the week it was begins again from the vacancy.
  await expect(page.getByRole('region', { name: 'Notice board' })).toContainText('revised its forms');
  await expect(page.getByTestId('board-continue')).toHaveCount(0);
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await expect(page.getByTestId('welcome')).toBeVisible();
  expect(await game(page)).toMatchObject({ seed: 7, day: 1, decided: [] });
});
