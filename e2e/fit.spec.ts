import { expect, test, type Locator, type Page } from '@playwright/test';

// Like any game, the Ministry fits the window it is given: nothing scrolls, and everything the
// clerk needs is on screen, from a small laptop to a big monitor.
const WINDOWS = [
  [1024, 768],
  [1280, 700],
  [1388, 757],
  [1920, 1080],
] as const;

async function fitsIn(page: Page, width: number, height: number, targets: Locator[]) {
  expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width, height]);
  for (const target of targets) {
    const box = (await target.boundingBox())!;
    expect(box.x, String(target)).toBeGreaterThanOrEqual(0);
    expect(box.y, String(target)).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, String(target)).toBeLessThanOrEqual(width + 0.5);
    expect(box.y + box.height, String(target)).toBeLessThanOrEqual(height + 0.5);
  }
}

for (const [width, height] of WINDOWS) {
  test(`the desk fits a ${width}×${height} window without scrolling`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?seed=1&day=6');
    await page.getByRole('button', { name: /Open the window/ }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await fitsIn(page, width, height, [
      page.getByRole('img', { name: /The waiting hall/ }),
      page.getByTestId('speech'),
      page.getByRole('button', { name: 'Call next applicant' }),
      page.getByRole('region', { name: 'Profile card' }),
      page.getByTestId('transcript'),
      page.getByRole('region', { name: 'Rulebook' }),
      page.getByRole('button', { name: 'Accept' }),
      page.getByRole('button', { name: 'Challenge' }),
    ]);
  });
}

test('a court that hears ten challenges still fits a small laptop window', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 700 });
  await page.goto('/?seed=1&day=6');
  await page.getByRole('button', { name: /Open the window/ }).click();
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.getByRole('button', { name: 'Challenge' }).click();
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  const rulings = page.getByTestId('ruling');
  await expect(rulings).toHaveCount(10);
  await fitsIn(page, 1280, 700, [...(await rulings.all()), page.getByRole('button', { name: /To the accounts/ })]);
});

// A 13-inch laptop's browser window, with and without the Dock, and a wide, short one: the
// hall gives way, and the desk keeps everything down to its bottom edge.
for (const [width, height] of [
  [1288, 704],
  [1470, 830],
  [1280, 640],
] as const) {
  test(`the tutorial desk, hint and supervisor's note included, fits a ${width}×${height} window`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?seed=1&day=1');
    await page.getByRole('button', { name: /Open the window/ }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.getByRole('button', { name: 'Accept' }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    const hint = page.getByText('This one needs a closer look. Press INSPECT.');
    await expect(hint).toBeVisible();
    await fitsIn(page, width, height, [
      page.getByRole('img', { name: /The waiting hall/ }),
      page.getByRole('button', { name: 'Call next applicant' }),
      page.getByRole('region', { name: 'Profile card' }),
      page.getByTestId('transcript'),
      hint,
      page.getByRole('button', { name: 'Inspect', exact: true }),
      page.getByRole('button', { name: 'Accept' }),
      page.getByRole('button', { name: 'Challenge' }),
      page.getByRole('region', { name: 'Rulebook' }),
      page.locator('.sticky'),
    ]);
  });
}
