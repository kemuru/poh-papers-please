import { expect, test, type Locator, type Page } from '@playwright/test';

// The notice board fits the window it opens in, frame and all, on the laptop windows most players have:
// on a first visit, once letters are found (the night shift open, the record filled in), and with a week
// under way beside them (Continue at the top, the vacancy down the side), the board's tallest state.
const WINDOWS = [
  { width: 1366, height: 768, deviceScaleFactor: 1 },
  { width: 1280, height: 720, deviceScaleFactor: 1 },
  { width: 1440, height: 790, deviceScaleFactor: 2 },
] as const;

/** A clerk three weeks in: three letters found, a best night, the record filled in. */
const RECORD = { v: 1, weeks: 3, letters: ['reclassified', 'promoted', 'fired'], bestSavings: 400, bestGrade: 'First', today: null, endless: 12, counted: null };

async function withLetters(page: Page) {
  await page.goto('/');
  await page.evaluate((record) => localStorage.setItem('poh-record', JSON.stringify(record)), RECORD);
  await page.reload();
  await expect(page.getByTestId('letters')).toContainText('3 of 6');
}

/** A week begun, one applicant stamped, and back to the board through the menu. */
async function weekUnderWay(page: Page) {
  await page.getByRole('button', { name: 'Start a new week' }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await page.getByRole('button', { name: 'Accept' }).click();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Notice board' }).click();
  await expect(page.getByTestId('board-continue')).toContainText('Day 1, at the window');
}

async function inside(target: Locator, width: number, height: number) {
  const box = (await target.boundingBox())!;
  expect(box, String(target)).not.toBeNull();
  expect(box.x, String(target)).toBeGreaterThanOrEqual(0);
  expect(box.y, String(target)).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width, String(target)).toBeLessThanOrEqual(width + 0.5);
  expect(box.y + box.height, String(target)).toBeLessThanOrEqual(height + 0.5);
}

/** The whole board, its frame included, and every letter slip down to the last row, inside the window. */
async function boardFits(page: Page, width: number, height: number) {
  const board = page.getByRole('region', { name: 'Notice board' });
  await expect(board).toBeVisible();
  await inside(board, width, height);
  const slips = await page.getByTestId('letters').locator('li').all();
  expect(slips).toHaveLength(6);
  for (const slip of slips.slice(-3)) await inside(slip, width, height);
  // Everything the clerk may need from the board is in the window with it.
  for (const target of [
    page.getByTestId('record'),
    page.getByRole('switch', { name: /Reduce motion/ }),
    page.getByRole('slider', { name: /Music/ }),
    page.getByRole('button', { name: 'Start a new week' }),
  ]) {
    await inside(target, width, height);
  }
}

for (const { width, height, deviceScaleFactor } of WINDOWS) {
  test.describe(`the notice board in a ${width}×${height} window at ${deviceScaleFactor}x`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor });

    test('fits on a first visit', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByTestId('letters')).toContainText('0 of 6');
      await boardFits(page, width, height);
    });

    test('fits once letters are found', async ({ page }) => {
      await withLetters(page);
      await expect(page.getByTestId('board-night').getByRole('button', { name: 'Take the night shift' })).toBeVisible();
      await boardFits(page, width, height);
      await inside(page.getByRole('button', { name: 'Take the night shift' }), width, height);
    });

    test('fits once letters are found, with a week under way', async ({ page }) => {
      await withLetters(page);
      await weekUnderWay(page);
      await boardFits(page, width, height);
      await inside(page.getByRole('button', { name: 'Continue', exact: true }), width, height);
    });
  });
}
