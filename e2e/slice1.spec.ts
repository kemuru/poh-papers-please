import { expect, test } from '@playwright/test';

test('the desk exposes all evidence and accepts a valid fixed-seed applicant', async ({ page }) => {
  const errors: string[] = [];
  const externalRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (new URL(request.url()).hostname !== 'localhost') externalRequests.push(request.url());
  });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.goto('/?seed=1');
  await expect(page.getByRole('heading', { name: 'Proof of Humanity', exact: true })).toBeVisible();
  const profile = page.getByTestId('profile-card');
  await expect(profile).toContainText('Dave');
  await expect(profile).toContainText('Residential address');
  await expect(profile).toContainText('Year of birth');
  await expect(profile.getByRole('img', { name: 'Profile photograph' })).toBeVisible();
  await expect(page.getByTestId('video-strip').getByRole('img')).toHaveCount(3);
  await expect(page.getByText('Blink recorded', { exact: true })).toBeVisible();
  await expect(page.getByTestId('transcript')).toHaveText('I certify that I am a real human, and that I am not already registered in this registry!');
  await expect(page.getByRole('heading', { name: 'Clerk’s rulebook' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Challenge', exact: true })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__game?.phase)).toBe('review');
  await page.screenshot({ path: test.info().outputPath('slice-1-desk.png'), fullPage: true, animations: 'disabled' });

  const applicant = await page.evaluate(() => window.__game?.applicant);
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.getByTestId('result-stamp')).toHaveText('Registered');
  await expect(page.getByRole('heading', { name: 'Application approved' })).toBeFocused();
  await expect(page.getByTestId('citation')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => ({ decision: window.__game?.decision, outcome: window.__game?.outcome }))).toEqual({ decision: 'accept', outcome: { kind: 'registered' } });
  await page.screenshot({ path: test.info().outputPath('slice-1-accepted.png'), fullPage: true, animations: 'disabled' });

  await page.getByRole('button', { name: 'Review this application again' }).click();
  await expect(page.getByTestId('profile-card')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.applicant)).toEqual(applicant);
  await expect.poll(() => page.evaluate(() => window.__game?.decision)).toBeNull();
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__game?.applicant)).toEqual(applicant);
  expect(errors).toEqual([]);
  expect(externalRequests).toEqual([]);
});

for (const [seed, clue] of [
  [2, 'I certify that I am a real human and that I am not already registered in this registry. Please.'],
  [3, 'I certify that I am a real hooman and that I am not already registered in this registry.'],
  [30, 'I certify that I am a real human.'],
  [36, '[No speech recorded]'],
] as const) {
  test(`seed ${seed}: the visible mistake prints a Rule 1 warning immediately on accept`, async ({ page }) => {
    await page.goto(`/?seed=${seed}`);
    await expect(page.getByTestId('transcript')).toHaveText(clue);
    await page.getByRole('button', { name: 'Accept', exact: true }).click();
    await expect(page.getByTestId('result-stamp')).toHaveText('Registered');
    const citation = page.getByTestId('citation');
    await expect(citation.getByRole('heading', { name: 'Rule 1 · Certification phrase' })).toBeVisible();
    await expect(citation).toContainText(clue);
    await expect(citation).toContainText('First mistake · Warning only. No fine.');
    await expect.poll(() => page.evaluate(() => ({ seed: window.__game?.seed, decision: window.__game?.decision, outcome: window.__game?.outcome }))).toEqual({
      seed,
      decision: 'accept',
      outcome: { kind: 'citation', violations: ['day-1-phrase'], warning: true },
    });
    if (seed === 3) await page.screenshot({ path: test.info().outputPath('slice-1-citation.png'), fullPage: true, animations: 'disabled' });
  });
}

for (const seed of [1, 3]) {
  test(`seed ${seed}: Challenge files the case without a premature ruling`, async ({ page }) => {
    await page.goto(`/?seed=${seed}`);
    await page.getByRole('button', { name: 'Challenge', exact: true }).click();
    await expect(page.getByTestId('result-stamp')).toHaveText('Case filed');
    await expect(page.getByRole('heading', { name: 'Awaiting hearing' })).toBeFocused();
    await expect(page.getByTestId('citation')).toHaveCount(0);
    await expect(page.getByTestId('decision-receipt')).toContainText('No ruling has been made.');
    await expect.poll(() => page.evaluate(() => ({ decision: window.__game?.decision, outcome: window.__game?.outcome }))).toEqual({ decision: 'challenge', outcome: { kind: 'filed' } });
    if (seed === 3) await page.screenshot({ path: test.info().outputPath('slice-1-filed.png'), fullPage: true, animations: 'disabled' });
  });
}

test('the debug snapshot is deeply read-only and cannot alter the application', async ({ page }) => {
  await page.goto('/?seed=1');
  await expect.poll(() => page.evaluate(() => Boolean(window.__game))).toBe(true);
  expect(await page.evaluate(() => {
    const state = window.__game!;
    return {
      root: Object.isFrozen(state),
      nested: Object.isFrozen(state.applicant.video.frames[0].portrait.face),
      truth: Object.isFrozen(state.applicant.planted),
      replace: Reflect.set(window, '__game', {}),
      name: Reflect.set(state.applicant, 'name', 'Changed'),
      transcript: Reflect.set(state.applicant.video, 'transcript', ''),
    };
  })).toEqual({ root: true, nested: true, truth: true, replace: false, name: false, transcript: false });
  await page.getByRole('button', { name: 'Accept', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Application approved' })).toBeVisible();
});

test('mobile layout keeps the rule and declaration readable and supports a keyboard decision', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?seed=3');
  await expect(page.getByRole('heading', { name: 'Clerk’s rulebook' })).toBeVisible();
  await expect(page.getByTestId('transcript')).toContainText('hooman');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: test.info().outputPath('slice-1-mobile.png'), fullPage: true, animations: 'disabled' });
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Accept', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Challenge', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Awaiting hearing' })).toBeFocused();
});

test('seed zero is supported and malformed seeds fall back to the default applicant', async ({ page }) => {
  await page.goto('/?seed=0');
  await expect.poll(() => page.evaluate(() => window.__game?.seed)).toBe(0);
  for (const input of ['abc', '-1', '1.5', '4294967296', '']) {
    await page.goto(`/?seed=${input}`);
    await expect.poll(() => page.evaluate(() => window.__game?.seed)).toBe(1);
  }
});
