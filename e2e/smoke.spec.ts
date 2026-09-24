import { expect, test } from '@playwright/test';

test('the page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Proof of Humanity: Papers, Please');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
