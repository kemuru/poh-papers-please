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

// The desk's tallest states, on the shortest windows a small laptop gives: Rule 2's page under the registry's
// tab (day 4 on), and a voucher's form over a phone held up in the video (seed 1's day 4, second applicant).
// The stage takes no crisp scale that would cut them off (src/ui/room.ts): until 30 Sep 2026 these windows
// took scale 1 and lost up to 58px at the foot of the desk.
for (const [width, height] of [
  [1240, 760],
  [1280, 768],
] as const) {
  test(`the desk's tallest states fit a ${width}×${height} window`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/?seed=1&day=4');
    await page.getByRole('button', { name: /Open the window/ }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.keyboard.press('2');
    await expect(page.getByRole('tablist', { name: 'Rulebook pages' }).getByRole('tab', { selected: true })).toHaveText('2');
    await expect(page.getByRole('tab', { name: 'Registry' })).toBeVisible();
    await fitsIn(page, width, height, [
      page.getByRole('img', { name: /The waiting hall/ }),
      page.getByRole('region', { name: 'Rulebook' }),
      page.getByRole('region', { name: 'Profile card' }),
      page.getByTestId('transcript'),
      page.getByRole('button', { name: 'Accept' }),
      page.locator('.sticky'),
    ]);
    // Pat's voucher is not registered; the next applicant vouched for, holding a phone up to the camera.
    await page.getByRole('button', { name: 'Challenge' }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await expect(page.getByTestId('sign')).toContainText('Phone screen, enlarged');
    await expect(page.getByTestId('voucher')).not.toBeEmpty();
    await page.waitForFunction(() => document.querySelector('.paper-video')?.getAnimations().every((a) => a.playState === 'finished'));
    await fitsIn(page, width, height, [
      page.getByRole('region', { name: 'Profile card' }),
      page.getByRole('region', { name: 'Video strip' }),
      page.getByTestId('transcript'),
      page.getByRole('region', { name: 'Rulebook' }),
      page.getByRole('button', { name: 'Challenge' }),
    ]);
  });
}

// From day 3 about half the queue hold their address up on a phone, a case drawn around the screen:
// it must be no wider than a paper sign and fit the panel wherever a sign does. Seed 1, day 6: the
// first applicant holds paper, the third a phone.
test('a phone held up in the video is no wider than a paper sign and stays inside its panel at 1024×768', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/?seed=1&day=6');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const panel = page.getByTestId('sign');
  // The printout lands turned a few degrees, which widens every box on it until it settles.
  const landed = () => page.waitForFunction(() => document.querySelector('.paper-video')?.getAnimations().every((a) => a.playState === 'finished'));
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect(panel.getByText('Sign, enlarged')).toBeVisible();
  await landed();
  const paper = (await panel.locator('.sign-text').boundingBox())!;
  for (let i = 0; i < 2; i++) {
    await page.getByRole('button', { name: 'Challenge' }).click();
    await page.getByRole('button', { name: 'Call next applicant' }).click();
  }
  await expect(panel.getByText('Phone screen, enlarged')).toBeVisible();
  await landed();
  const [phone, still] = [(await panel.locator('.sign-text.phone').boundingBox())!, (await panel.boundingBox())!];
  expect(phone.width).toBeLessThanOrEqual(paper.width);
  expect(phone.x).toBeGreaterThanOrEqual(still.x);
  expect(phone.x + phone.width).toBeLessThanOrEqual(still.x + still.width);
  expect(phone.y + phone.height).toBeLessThanOrEqual(still.y + still.height);
  await fitsIn(page, 1024, 768, [panel]);
});
