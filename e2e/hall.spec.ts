import { expect, test, type Page } from '@playwright/test';

// The hall is drawn at one hall pixel to two design pixels, and its height is set by the window alone:
// it never rescales, and the desk under it never jumps, when an applicant comes to the window, a page
// turns or the registry answers (notes/art-direction.md, "One grid"). Day 4 has every paper the desk
// holds: the rulebook's four pages, the registry's tab and its answers, and vouchers.
const game = (page: Page) => page.evaluate(() => window.__game!);

/** The hall's height in design pixels, and design pixels to a hall pixel. */
const measure = (page: Page) =>
  page.getByRole('img', { name: /The waiting hall/ }).evaluate((svg: SVGSVGElement) => ({
    height: svg.clientHeight,
    scale: svg.clientHeight / svg.viewBox.baseVal.height,
  }));

async function walkTheDay(page: Page, size: string) {
  await page.goto('/?seed=1&day=4');
  const heights = new Set<number>();
  const look = async (when: string) => {
    const { height, scale } = await measure(page);
    expect(scale, `${size}, ${when}`).toBe(2);
    heights.add(height);
  };
  await look('the morning');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const { queue } = await game(page);
  for (let i = 0; i < queue.length; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await expect.poll(async () => (await game(page)).called).toBe(i + 1);
    await look(`applicant ${i + 1}`);
    for (const key of ['2', '4', 'v', '1']) {
      await page.keyboard.press(key);
      await look(`applicant ${i + 1}, key ${key}`);
    }
    const before = (await game(page)).decided.length;
    await page.getByRole('button', { name: 'Accept' }).click();
    await expect.poll(async () => (await game(page)).decided.length).toBe(before + 1);
    if (i < queue.length - 1) await look(`applicant ${i + 1}, stamped`);
  }
  expect([...heights], size).toHaveLength(1);
}

for (const [width, height] of [
  [1240, 820],
  [1280, 700],
  [1366, 768],
  [1440, 900],
] as const) {
  test(`the hall keeps its height and its whole pixels all day at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await walkTheDay(page, `${width}×${height}`);
  });
}

test.describe('on a Retina screen', () => {
  test.use({ deviceScaleFactor: 2 });
  test('the hall keeps its height and its whole pixels all day in a 13-inch laptop’s browser window', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 790 });
    await walkTheDay(page, '1440×790 at 2×');
  });
});
