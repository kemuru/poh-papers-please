import { expect, test, type Locator } from '@playwright/test';

/** Each drawn colour with its geometry: equal lists mean identical pictures. */
const picture = (figure: Locator) =>
  figure.locator('svg path').evaluateAll((paths) => paths.map((p) => `${p.getAttribute('fill')} ${p.getAttribute('d')}`));

test('the portrait lab draws the same face for the same seed', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/?portraits');
  await expect(page.getByRole('heading', { name: 'Portrait lab' })).toBeVisible();

  const grid = page.getByTestId('portrait-grid');
  await expect(grid.locator('svg')).toHaveCount(48);
  const seven = await picture(grid.locator('[data-seed="7"]'));
  expect(seven.length).toBeGreaterThan(5);
  expect(seven).not.toEqual(await picture(grid.locator('[data-seed="8"]')));

  await page.reload();
  expect(await picture(grid.locator('[data-seed="7"]'))).toEqual(seven);

  await grid.locator('[data-seed="7"]').click();
  await expect(page.getByRole('heading', { name: 'Seed 7', exact: true })).toBeVisible();
  expect(await picture(page.getByTestId('photo'))).toEqual(seven);

  await page.screenshot({ path: test.info().outputPath('portrait-lab.png'), fullPage: true });
  expect(errors).toEqual([]);
});

test('the video frames show speaking and blinking', async ({ page }) => {
  await page.goto('/?portraits');
  const frame1 = await picture(page.getByTestId('frame-1'));
  expect(await picture(page.getByTestId('frame-2'))).not.toEqual(frame1);
  expect(await picture(page.getByTestId('frame-3'))).not.toEqual(frame1);
});
