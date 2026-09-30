import { expect, test, type Page } from '@playwright/test';

// On the statement the accounts are settled: the desk rail's tally says what the roll carries forward,
// never the morning's figure beside it (until 30 Sep 2026 the rail kept the morning's until the next day).
const game = (page: Page) => page.evaluate(() => window.__game!);

test('the rail and the statement show one figure for the savings', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const { queue } = await game(page);
  for (let i = 0; i < queue.length; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await expect.poll(async () => (await game(page)).called).toBe(i + 1);
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  const { end, savings } = await game(page);
  expect(end!.after).not.toBe(savings);
  await expect(page.getByRole('region', { name: 'Statement' }).getByTestId('savings')).toHaveText(`${end!.after} PNK`);
  await expect(page.getByTestId('topbar-savings')).toHaveText(String(end!.after));
});
