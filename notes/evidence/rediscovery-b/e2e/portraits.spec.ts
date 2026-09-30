import { expect, test } from '@playwright/test';

test('the portraits dev page shows a grid of 24 distinct portraits', async ({ page }) => {
  await page.goto('/dev/portraits.html');
  const portraits = page.getByTestId('portrait-grid').getByRole('img');
  await expect(portraits).toHaveCount(24);
  // A malformed SVG fails to decode and reports a natural width of 0.
  await expect
    .poll(() => portraits.evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).naturalWidth)))
    .toEqual(Array(24).fill(32));
  const sources = await portraits.evaluateAll((imgs) => imgs.map((img) => img.getAttribute('src')));
  expect(new Set(sources).size).toBe(24);
});
