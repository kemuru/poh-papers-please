import { expect, test, type Locator, type Page } from '@playwright/test';

// Slice 1 acceptance (notes/acceptance.md) on the slice 2 desk: one applicant at the window,
// the phrase rule, Accept or Challenge. Fixed seeds; each test first checks that its seed still
// gives the applicant it expects.
const PHRASE = 'I certify that I am a real human and that I am not already registered in this registry.';
const CHATTY = '?seed=5467&day=2'; // first up: "Ahem.", an aside, and "I'm" for "I am": all fine
const CHATTY_SAYS = "Ahem. I certify that I am a real human and, one second, that I'm not already registered in this registry.";
const HOOMAN = '?seed=4573&day=2'; // first up: "Is the red light on?" then the phrase with "hang on" in it, and "hooman"
const HOOMAN_SAYS = 'Is the red light on? I certify that I am a real hooman and, hang on, that I am not already registered in this registry.';
const SILENT = '?seed=18&day=2'; // first up: says nothing

const game = (page: Page) => page.evaluate(() => window.__game!);

/** Opens the window and calls the first applicant of the day. */
async function firstApplicant(page: Page, query: string, expected: { planted: string[]; transcript: string }) {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(1);
  const applicant = (await game(page)).queue[0];
  expect(applicant.planted.map((p) => p.mistake), `${query} changed: pick another`).toEqual(expected.planted);
  expect(applicant.video.transcript, `${query} changed: pick another`).toBe(expected.transcript);
  return applicant;
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

test('the desk shows the profile card, the video strip, the rulebook and both stamps', async ({ page }) => {
  const applicant = await firstApplicant(page, CHATTY, { planted: [], transcript: CHATTY_SAYS });

  const card = page.getByRole('region', { name: 'Profile card' });
  await expect(card.getByTestId('name')).toHaveText(applicant.name);
  await expect(card).toContainText(applicant.address);
  await expect(card).toContainText(String(applicant.birthYear));
  await expect(card.getByRole('img', { name: `Photo of ${applicant.name}` })).toBeVisible();
  // The remark is said at the window, not written on the form.
  await expect(page.getByTestId('speech')).toContainText(applicant.remark);

  const video = page.getByRole('region', { name: 'Video strip' });
  await expect(video.locator('svg')).toHaveCount(3);
  await expect(video.getByTestId('transcript')).toHaveText(applicant.video.transcript);
  const still = await picture(video.getByTestId('frame-1'));
  expect(await picture(video.getByTestId('frame-2')), 'frame 2 shows speech').not.toEqual(still);
  expect(await picture(video.getByTestId('frame-3')), 'frame 3 shows the blink').not.toEqual(still);

  await expect(page.getByRole('region', { name: 'Rulebook' })).toContainText(PHRASE);
  await expect(page.getByRole('button', { name: 'Accept' })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Challenge' })).toBeEnabled();
  await shot(page, 'desk.png');

  // Same seed, same applicant; and the exposed state is read-only.
  await page.reload();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect(card.getByTestId('name')).toHaveText(applicant.name);
  expect(await page.evaluate(() => Object.isFrozen(window.__game) && Object.isFrozen(window.__game!.queue[0].video))).toBe(true);
});

test('accepting a valid applicant stamps the card and prints no citation, whatever else they said', async ({ page }) => {
  await firstApplicant(page, CHATTY, { planted: [], transcript: CHATTY_SAYS });
  await page.getByRole('button', { name: 'Accept' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Registered');
  await expect(page.getByTestId('citation')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Accept' })).toBeDisabled();
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  expect((await game(page)).decided[0]).toEqual({ decision: 'accept', outcome: { correct: true, violations: [] }, citation: null });
  await shot(page, 'accept-valid.png');
});

test('accepting an invalid applicant prints a citation that names the rule and marks only the wrong word', async ({ page }) => {
  await firstApplicant(page, HOOMAN, { planted: ['wrong-word'], transcript: HOOMAN_SAYS });
  await page.getByRole('button', { name: 'Accept' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Registered');
  const citation = page.getByTestId('citation');
  await expect(citation).toContainText('Rule 1: Certification phrase');
  // The first of the day is a warning.
  await expect(citation).toContainText('Warning only');
  await expect(citation.locator('mark', { hasText: 'hooman' })).toBeVisible();
  await expect(citation.locator('mark', { hasText: 'human' })).toBeVisible();
  // Whatever else was said, before or in between, is not assessed, so it is not marked.
  await expect(citation.locator('mark', { hasText: /Is|red|light|hang/ })).toHaveCount(0);
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  const [decided] = (await game(page)).decided;
  expect(decided.outcome.correct).toBe(false);
  expect(decided.outcome.violations.map((v) => v.rule)).toEqual(['phrase']);
  expect(decided.citation).toBe('warning');
  await shot(page, 'accept-invalid.png');
});

test('challenging files the case for the court at the end of the shift', async ({ page }) => {
  await firstApplicant(page, HOOMAN, { planted: ['wrong-word'], transcript: HOOMAN_SAYS });
  await page.getByRole('button', { name: 'Challenge' }).click();

  await expect(page.getByTestId('stamp')).toHaveText('Challenged');
  await expect(page.getByTestId('filing')).toContainText('Case filed');
  await expect(page.getByTestId('citation')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Desk' }).getByLabel('Court tray: 1 case')).toBeVisible();
  await expect.poll(async () => (await game(page)).decided.length).toBe(1);
  expect((await game(page)).decided[0]).toMatchObject({ decision: 'challenge', outcome: { correct: true }, citation: null });
  await shot(page, 'challenge-invalid.png');
});

test('a silent applicant shows no speech in the transcript or the frames', async ({ page }) => {
  await firstApplicant(page, SILENT, { planted: ['silence'], transcript: '' });
  const video = page.getByRole('region', { name: 'Video strip' });
  await expect(video.getByTestId('transcript')).toHaveText('(no speech detected)');
  expect(await picture(video.getByTestId('frame-2')), 'mouth stays shut').toEqual(await picture(video.getByTestId('frame-1')));

  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByTestId('citation')).toContainText('(no speech)');
  await shot(page, 'accept-silent.png');
});
