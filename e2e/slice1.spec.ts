import { expect, test, type Locator, type Page } from '@playwright/test';

// Fixed seeds. Each test first checks that its seed still gives the applicant it expects.
const VALID = 2; // says the phrase word for word
const HOOMAN = 22; // "I certify I am a real hooman."
const SILENT = 6; // says nothing

const game = (page: Page) => page.evaluate(() => window.__game!);

async function open(page: Page, seed: number, planted: string[]) {
  await page.goto(`/?seed=${seed}`);
  await expect.poll(async () => (await page.evaluate(() => window.__game?.seed))).toBe(seed);
  expect((await game(page)).applicant.planted.map((p) => p.mistake), `seed ${seed} changed: pick another`).toEqual(planted);
}

/** Each drawn colour with its geometry: equal lists mean identical pictures. */
const picture = (frame: Locator) =>
  frame.locator('svg path').evaluateAll((paths) => paths.map((p) => `${p.getAttribute('fill')} ${p.getAttribute('d')}`));

const shot = (page: Page, name: string) =>
  page.screenshot({ path: test.info().outputPath(name), fullPage: true, animations: 'disabled' });

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

test('the desk shows the profile card, the video strip, the rulebook and both buttons', async ({ page }) => {
  await open(page, VALID, []);
  const { applicant, decision, outcome } = await game(page);
  expect(decision).toBeNull();
  expect(outcome).toBeNull();

  const card = page.getByRole('region', { name: 'Profile card' });
  await expect(card.getByTestId('name')).toHaveText(applicant.name);
  await expect(card).toContainText(applicant.address);
  await expect(card).toContainText(String(applicant.birthYear));
  await expect(card).toContainText(applicant.remark);
  await expect(card.getByRole('img', { name: `Photo of ${applicant.name}` })).toBeVisible();

  const video = page.getByRole('region', { name: 'Video strip' });
  await expect(video.locator('svg')).toHaveCount(3);
  await expect(video.getByTestId('transcript')).toHaveText(applicant.video.transcript);
  const still = await picture(video.getByTestId('frame-1'));
  expect(await picture(video.getByTestId('frame-2')), 'frame 2 shows speech').not.toEqual(still);
  expect(await picture(video.getByTestId('frame-3')), 'frame 3 shows the blink').not.toEqual(still);

  await expect(page.getByRole('region', { name: 'Rulebook' })).toContainText(
    'I certify that I am a real human and that I am not already registered in this registry.',
  );
  await expect(page.getByRole('button', { name: 'Accept' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Challenge' })).toBeVisible();

  // Same seed, same applicant; and the exposed state is read-only.
  await page.reload();
  await expect(card.getByTestId('name')).toHaveText(applicant.name);
  await page.waitForFunction(() => window.__game !== undefined);
  expect(await page.evaluate(() => Object.isFrozen(window.__game) && Object.isFrozen(window.__game!.applicant.video))).toBe(true);
  await shot(page, 'desk.png');
});

test('accepting a valid applicant stamps the card, prints no citation and records the outcome', async ({ page }) => {
  await open(page, VALID, []);
  await page.getByRole('button', { name: 'Accept' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Registered');
  await expect(page.getByTestId('note')).toBeVisible();
  await expect(page.getByTestId('citation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accept' })).toHaveCount(0);
  await expect.poll(async () => (await game(page)).decision).toBe('accept');
  expect((await game(page)).outcome).toEqual({ correct: true, violations: [] });
  await shot(page, 'accept-valid.png');

  await page.getByRole('link', { name: 'Next applicant' }).click();
  await expect.poll(async () => (await page.evaluate(() => window.__game?.seed))).toBe(VALID + 1);
  expect((await game(page)).decision).toBeNull();
});

test('accepting an invalid applicant prints a citation that names the broken rule', async ({ page }) => {
  await open(page, HOOMAN, ['missing-words']);
  await page.getByRole('button', { name: 'Accept' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Registered');
  const citation = page.getByTestId('citation');
  await expect(citation).toContainText('Rule 1: Exact certification phrase');
  await expect(citation.locator('mark', { hasText: 'hooman' })).toBeVisible();
  await expect.poll(async () => (await game(page)).decision).toBe('accept');
  const { outcome } = await game(page);
  expect(outcome?.correct).toBe(false);
  expect(outcome?.violations.map((v) => v.rule)).toEqual(['phrase']);
  await shot(page, 'accept-invalid.png');
});

test('challenging an invalid applicant files the case and the court upholds it', async ({ page }) => {
  await open(page, HOOMAN, ['missing-words']);
  await page.getByRole('button', { name: 'Challenge' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Challenged');
  await expect(page.getByTestId('filing')).toContainText('Case filed');
  const ruling = page.getByTestId('ruling');
  await expect(ruling).toContainText('Challenge upheld');
  await expect(ruling).toContainText('Rule 1: Exact certification phrase');
  await expect.poll(async () => (await game(page)).decision).toBe('challenge');
  const { outcome } = await game(page);
  expect(outcome?.correct).toBe(true);
  expect(outcome?.violations.map((v) => v.rule)).toEqual(['phrase']);
  await shot(page, 'challenge-invalid.png');
});

test('challenging a valid applicant is dismissed', async ({ page }) => {
  await open(page, VALID, []);
  await page.getByRole('button', { name: 'Challenge' }).click();

  await expect(page.getByTestId('ruling')).toContainText('Challenge dismissed');
  await expect.poll(async () => (await game(page)).decision).toBe('challenge');
  expect((await game(page)).outcome).toEqual({ correct: false, violations: [] });
  await shot(page, 'challenge-valid.png');
});

test('a silent applicant shows no speech in the transcript or the frames', async ({ page }) => {
  await open(page, SILENT, ['silence']);
  const video = page.getByRole('region', { name: 'Video strip' });
  await expect(video.getByTestId('transcript')).toHaveText('(no speech detected)');
  expect(await picture(video.getByTestId('frame-2')), 'mouth stays shut').toEqual(await picture(video.getByTestId('frame-1')));

  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByTestId('citation')).toContainText('(no speech)');
  await shot(page, 'accept-silent.png');
});
