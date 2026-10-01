import { expect, test, type Page } from '@playwright/test';
import type { GeneratedApplicant } from '../src/gen/applicant';
import { judge, rulebookForDay } from '../src/rules/judge';
import { inspectFault } from './inspectFault';

// Slice 5 acceptance (notes/acceptance.md): Humanity Day and the endings. Likeness's letter on day 3,
// the last unit and the clerk's own renewal on day 7, and a scripted run to every letter the week
// can end with.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

/** Calls the next applicant and returns them, with where they are in the queue. */
async function callNext(page: Page) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, called } = await game(page);
  return { a: queue[called - 1], i: called - 1 };
}

/**
 * Calls the next applicant and stamps them as `decide` says, or else by the rulebook against the live
 * registry: these runs let robots and clones in on purpose, and the registry remembers. A fake is
 * challenged the way a careful clerk does, with what Inspect finds.
 */
async function stamp(page: Page, decide?: (a: GeneratedApplicant) => 'accept' | 'challenge' | undefined) {
  const { a, i } = await callNext(page);
  const { day, registry } = await game(page);
  const [broken] = judge(a, rulebookForDay(day), registry).violations;
  const decision = decide?.(a) ?? (broken ? 'challenge' : 'accept');
  if (decision === 'challenge' && broken) {
    // The fault the live registry finds, which is the planted one unless an earlier stamp changed it.
    const planted = a.planted.find((p) => p.rule === broken.rule);
    const mistake = broken.rule === 'living' ? (broken.problem === 'blink' ? 'no-blink' : 'year-typo') : 'live';
    await inspectFault(page, { ...a, planted: [planted ?? ({ rule: broken.rule, mistake } as GeneratedApplicant['planted'][number])] });
  }
  await page.getByRole('button', { name: decision === 'accept' ? 'Accept' : 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  return { a, i };
}

/** Stamps the rest of the day's queue. */
async function stampAll(page: Page, decide?: Parameters<typeof stamp>[1]) {
  const { queue } = await game(page);
  while ((await game(page)).called < queue.length) await stamp(page, decide);
}

/** From the last stamp to the statement: the court sits, the accounts are read. */
async function toTheAccounts(page: Page) {
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
}

async function nextMorning(page: Page) {
  const day = (await game(page)).day;
  await page.getByRole('button', { name: `Begin day ${day + 1}` }).click();
  await expect.poll(async () => (await game(page)).day).toBe(day + 1);
}

/**
 * The accounts' Continue on the evening the week ends, to its letter. Every letter but Fired's comes after six
 * o'clock in the hall (e2e/finale.spec.ts plays it through); these runs skip it, as a second week would.
 */
async function toTheLetter(page: Page, ending: string) {
  await page.getByRole('button', { name: 'Continue' }).click();
  if (ending !== 'fired') {
    await expect(page.getByTestId('finale')).toBeVisible();
    await page.keyboard.press('Escape');
  }
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', ending);
  expect((await game(page)).ending).toBe(ending);
  // The letter lands, is stamped, and the paper follows it.
  await page.waitForTimeout(2600);
}

test('day 3: handed in, Likeness’s letter earns a commendation that evening, and the day 4 Gazette reports Likeness fined', async ({ page }) => {
  await page.goto('/?seed=1&day=3');
  const letter = page.getByTestId('offer-letter');
  await expect(letter).toContainText('For every unit Window 3 registers, we will leave 40 PNK on your desk the next morning');
  await expect(page.getByTestId('gazette')).toBeVisible();
  await shot(page, 'offer-letter.png');
  await letter.getByRole('button', { name: 'Hand it in' }).click();
  await expect(letter).toHaveCount(0);
  await expect(page.getByTestId('second-note')).toContainText('Thank you for the letter. Legal has it.');
  expect((await game(page)).offer).toBe('handed-in');
  await shot(page, 'offer-handed-in.png');

  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page);
  await toTheAccounts(page);
  const statement = page.getByRole('region', { name: 'Statement' });
  await expect(statement).toContainText('Commendation: a letter handed in');
  const { end } = await game(page);
  expect(end!.credits).toEqual([{ kind: 'commendation', count: 1, each: 30 }]);
  expect(end!.after).toBe(end!.before + end!.pay.total + 30 - end!.bills.reduce((sum, b) => sum + b.amount, 0));

  await nextMorning(page);
  await expect(page.getByTestId('headline')).toHaveText('LIKENESS ROBOTICS FINED FOR WRITING TO A CLERK');
  await expect(page.getByTestId('gazette')).toContainText('It has written to the clerk to apologise.');
  // Likeness's patch to its lamps is still the day's news.
  await expect(page.getByTestId('gazette')).toContainText('Likeness has taught its current units to wait out a blink');
  await shot(page, 'gazette-day4-fined.png');
});

test('day 3: left on the desk, the letter goes in the drawer unsigned, and nothing comes of it', async ({ page }) => {
  await page.goto('/?seed=1&day=3');
  await expect(page.getByTestId('offer-letter')).toBeVisible();
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).opened).toBe(true);
  await expect(page.getByTestId('offer-letter')).toHaveCount(0);
  await expect(page.getByTestId('inspector')).toHaveText('The letter goes in the drawer, unsigned.');
  expect((await game(page)).offer).toBeNull();
  // The morning's steps are done: the letter cannot be signed now.
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect(page.getByTestId('inspector')).toHaveCount(0);
});

test('day 7: the last unit passes every other rule, and only the slit in frame 3 catches it, under Rule 2', async ({ page }) => {
  await page.goto('/?seed=1&day=7');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const { queue } = await game(page);
  const unitAt = queue.findIndex((a) => a.cast === 'unit');
  for (let i = 0; i < unitAt; i++) await stamp(page);
  const { a: unit } = await callNext(page);
  expect(unit.video.lamp).toBe('slit');
  await page.waitForTimeout(1200);
  const inspector = page.getByTestId('inspector');
  const point = (label: string) => page.getByRole('button', { name: `Inspect ${label}`, exact: true }).click();
  await page.keyboard.press('i');
  // Everything a clerk checks agrees: the photo and a frame with its eyes open, the sign and the form, the voucher.
  await point('the photo');
  await point('frame 1');
  await expect(inspector).toHaveText('No discrepancy.');
  await point('the sign');
  await point('the wallet');
  await expect(inspector).toHaveText('No discrepancy.');
  await page.keyboard.press('2');
  await point('frame 1');
  await point('Rule 2');
  await expect(inspector).toHaveText('No discrepancy.');
  // Frame 3, its one blink: a slit of light between the brows, as in Fig. 2-2 today.
  await point('frame 3');
  await point('Rule 2');
  await expect(inspector).toContainText('Discrepancy under Rule 2: The face. In frame 3 the eyes are shut, and there is a light between the brows.');
  await shot(page, 'unit-day7-inspect.png');
  // Let in, it comes back on a citation with its memo.
  await page.getByRole('button', { name: 'Accept' }).click();
  await expect(page.getByTestId('citation')).toContainText('Memo 2-Q: Likeness Robotics had resolved all known issues. This was not one of the known ones.');
  await page.waitForTimeout(1500);
  await shot(page, 'unit-day7-citation.png');
});

test('day 7: the last applicant is the clerk, whose video says "a real clerk"', async ({ page }) => {
  await page.goto('/?seed=1&day=7');
  await expect(page.getByTestId('gazette')).toContainText('Registrations made two years ago expire today, clerks’ included.');
  await expect(page.locator('.sticky').first()).toContainText('Your registration ran out at nine, so you are last in the queue.');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const { queue } = await game(page);
  // Six in the queue, and the clerk is not one of them: nobody behind the railing is you.
  await expect(page.getByRole('img', { name: 'The waiting hall. 6 waiting.' })).toBeVisible();
  for (let i = 0; i < queue.length - 1; i++) await stamp(page);
  const { a: clerk } = await callNext(page);
  expect(clerk).toMatchObject({ name: 'Robin Hale', cast: 'clerk' });
  await expect(page.getByTestId('clerk')).toHaveText('Robin Hale');
  const card = page.getByRole('region', { name: 'Profile card' });
  await expect(card.getByTestId('name')).toHaveText('Robin Hale');
  await expect(page.getByTestId('transcript')).toHaveText('I certify that I am a real clerk and that I am not already registered in this registry.');
  // Nobody at the window: the glass holds a reflection, and nobody speaks.
  await expect(page.getByRole('img', { name: 'Your reflection in the glass' })).toBeVisible();
  await expect(page.getByTestId('speech')).toContainText('Nobody comes to the window.');
  await page.waitForTimeout(1500);
  await shot(page, 'clerk-at-the-window.png');
  await inspectFault(page, clerk);
  await expect(page.getByTestId('inspector')).toContainText('Said “clerk”, not “human”.');
  await shot(page, 'clerk-inspect.png');
  // Five o'clock: the last stamp is the clerk's own.
  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect(page.getByTestId('clock')).toHaveText('17:00');
  await expect(page.getByTestId('speech')).toContainText('Five o’clock. The Universal Basic Income is open. Nothing else happens.', { timeout: 6000 });
  await expect(page.getByRole('status', { name: 'Announcements' })).toContainText('The Universal Basic Income is now open.');
  await shot(page, 'five-oclock.png');
});

test('Reclassified: the clerk challenges their own renewal with what Inspect found, and the court upholds it', async ({ page }) => {
  await page.goto('/?seed=1&day=7');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page);
  await page.getByRole('button', { name: /End shift/ }).click();
  const own = page.getByTestId('ruling').filter({ hasText: 'The Registry v. Robin Hale' });
  await expect(own).toContainText('Challenge upheld.');
  await expect(own).toContainText('Rule 1: said “clerk”, not “human”.');
  await page.waitForTimeout(2500);
  await shot(page, 'court-the-registry-v-robin-hale.png');
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await toTheLetter(page, 'reclassified');
  const notice = page.getByRole('article', { name: 'Notice' });
  await expect(notice).toContainText('Notice of reclassification');
  await expect(notice).toContainText('You have been reclassified as registry equipment');
  // Upheld, the challenge takes the clerk's voucher with it, as it would anyone's. This week began on day 7,
  // so the letter does not claim she was the first the clerk registered (src/endings.test.ts has that week).
  await expect(notice).toContainText('Hortense Cobbold, who vouched for you, has been removed from the registry with you, as the rulebook says.');
  await expect(notice).not.toContainText('first person you registered');
  await expect(page.getByTestId('grade')).toHaveText('Grade: Equipment, First Class.');
  // Every letter after six o'clock closes on the same Ministry line.
  await expect(page.getByTestId('letter-close')).toHaveText('Window 3 opens at nine on Monday.');
  const special = page.getByTestId('special');
  // The price was told once, in the hall at six: the paper reports what came after it.
  await expect(page.getByTestId('special-headline')).toHaveText('FIRST HOUR PAID. HOME ROBOTS LEAVE THE HALL.');
  await expect(special).toContainText('No home robots were registered at Window 3 this week.');
  await expect(special).toContainText('Registry equipment, Window 3: item 3-0417, a clerk.');
  await shot(page, 'ending-reclassified.png');
});

test('Promoted: the clerk stamps their own renewal in, and it is the week’s last citation', async ({ page }) => {
  await page.goto('/?seed=1&day=7');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page, (a) => (a.cast === 'clerk' ? 'accept' : undefined));
  await expect(page.getByTestId('citation')).toContainText('Memo 1-Z: You registered a clerk.');
  await toTheAccounts(page);
  await toTheLetter(page, 'promoted');
  const notice = page.getByRole('article', { name: 'Notice' });
  await expect(notice).toContainText('Notice of promotion');
  await expect(notice).toContainText('A note has been placed on your file: “Registered a clerk.”');
  await expect(notice).toContainText('Window 2 has left the Ministry. The promotion stands.');
  await expect(page.getByTestId('grade')).toHaveText(/^Grade: Clerk, (First|Second) Class\.$/);
  await expect(page.getByTestId('special')).toContainText('Robin Hale, of Window 3, promoted to Window 2.');
  await shot(page, 'ending-promoted.png');
});

test('Superseded: the clone let in on day 6 is the Robin Hale the registry keeps', async ({ page }) => {
  // Seed 29, day 6: the clone is second in the queue.
  await page.goto('/?seed=29&day=6');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page, (a) => (a.cast === 'clone' ? 'accept' : undefined));
  expect((await game(page)).queue.some((a) => a.cast === 'clone')).toBe(true);
  await toTheAccounts(page);
  await nextMorning(page);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page);
  // The clerk's own renewal is a face on file as well as a clerk.
  const own = (await game(page)).decided[6];
  expect(own.outcome.violations.map((v) => v.rule)).toEqual(['phrase', 'duplicate']);
  await toTheAccounts(page);
  await toTheLetter(page, 'superseded');
  const notice = page.getByRole('article', { name: 'Notice' });
  await expect(notice).toContainText('Notice of duplication');
  await expect(notice).toContainText('who has your name, your face and a better haircut');
  await expect(notice).toContainText('At five o’clock you challenged your own renewal, and the court agreed.');
  await expect(page.getByTestId('grade')).toContainText('awarded to Robin Hale');
  await expect(page.getByTestId('special')).toContainText('Robin Hale, who starts at Window 3 on Monday.');
  await shot(page, 'ending-superseded.png');
});

test('Replaced: three units stamped in, a second note after the second, and a unit in the clerk’s chair at five', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?seed=1&day=5');
  // The units' names, as the week drew them.
  const units: string[] = [];
  for (let day = 5; day <= 7; day++) {
    if (day === 7) await expect(page.getByTestId('second-note')).toContainText('Two home robots this week. One more and Likeness will want your chair.');
    await page.getByRole('button', { name: /Open the window/ }).click();
    units.push((await game(page)).queue.find((a) => a.cast === 'unit')!.name);
    await stampAll(page, (a) => (a.cast === 'unit' ? 'accept' : undefined));
    await toTheAccounts(page);
    if (day < 7) await nextMorning(page);
  }
  await toTheLetter(page, 'replaced');
  const notice = page.getByRole('article', { name: 'Notice' });
  await expect(notice).toContainText('Notice of replacement');
  await expect(notice).toContainText(`This week you stamped three home robots into the registry: ${units[0]} (day 5), ${units[1]} (day 6) and ${units[2]} (day 7).`);
  await expect(notice).toContainText('A unit in your likeness takes your chair. Its papers are in order.');
  await expect(page.getByRole('img', { name: /The hall camera over Window 3/ })).toBeVisible();
  await shot(page, 'ending-replaced.png');
});

test('Fired: savings below zero at the end of a day, and the letter says what cost them', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?seed=1&day=2');
  for (;;) {
    await page.getByRole('button', { name: /Open the window/ }).click();
    // Everyone challenged, on a hunch: the humans' deposits are lost.
    await stampAll(page, () => 'challenge');
    await toTheAccounts(page);
    if ((await game(page)).end!.fired) break;
    await nextMorning(page);
  }
  await toTheLetter(page, 'fired');
  const { day, savings } = await game(page);
  const notice = page.getByRole('article', { name: 'Notice' });
  await expect(notice).toContainText(`Your savings fell below zero at the end of day ${day}: ${savings} PNK.`);
  // Everyone was challenged: nobody was registered who broke a rule, so the letter names only the humans.
  await expect(notice).toContainText(/This week you challenged \d+ applicants who broke no rule\./);
  await expect(page.locator('.classified')).toContainText('Vacancy: clerk, Registry Window 3.');
  await expect(page.getByTestId('special')).toHaveCount(0);
  await shot(page, 'ending-fired.png');
});

test('Headhunted: the letter signed and a unit stamped in, Likeness pays by envelope and offers a job at the end of the week', async ({ page }) => {
  test.setTimeout(420_000);
  await page.goto('/?seed=1&day=3');
  await page.getByTestId('offer-letter').getByRole('button', { name: 'Sign it' }).click();
  await expect(page.getByTestId('inspector')).toHaveText('Signed. The letter is in the drawer.');
  expect((await game(page)).offer).toBe('signed');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const unit = (await game(page)).queue.find((a) => a.cast === 'unit')!;
  await stampAll(page, (a) => (a.cast === 'unit' ? 'accept' : undefined));
  await toTheAccounts(page);
  await nextMorning(page);
  // Day 4's morning: an envelope on the paper, counted on tonight's statement.
  await expect(page.getByTestId('envelope')).toContainText(`Enclosed: 40 PNK, for ${unit.name}.`);
  expect((await game(page)).credits).toEqual([{ kind: 'fee', count: 1, each: 40, for: [unit.name] }]);
  await shot(page, 'envelope.png');
  for (let day = 4; day <= 7; day++) {
    await page.getByRole('button', { name: /Open the window/ }).click();
    await stampAll(page, (a) => (a.cast === 'clerk' ? 'accept' : undefined));
    await toTheAccounts(page);
    if (day === 4) await expect(page.getByRole('region', { name: 'Statement' })).toContainText('Partner fee, Likeness Robotics, 1 × 40');
    if (day < 7) await nextMorning(page);
  }
  await toTheLetter(page, 'promoted');
  const clip = page.getByTestId('headhunted');
  await expect(clip).toContainText(`Thank you for your partnership this week: ${unit.name} (day 3).`);
  await expect(clip).toContainText('Head of Human Relations');
  await expect(page.getByTestId('special')).toContainText(`Home robots registered at Window 3 this week: ${unit.name} (day 3).`);
  await shot(page, 'ending-headhunted.png');
  // The busiest letter there is, clipped letter and all, fits a small laptop's window without scrolling.
  for (const [width, height] of [[1280, 700], [1024, 768]] as const) {
    await page.setViewportSize({ width, height });
    // The stage rescales on the next render after the window changes: measure once it has.
    await expect.poll(async () => { const b = (await page.getByTestId('special').boundingBox())!; return b.x + b.width; }).toBeLessThanOrEqual(width + 0.5);
    expect(await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight])).toEqual([width, height]);
    for (const target of [page.getByRole('article', { name: 'Notice' }), clip, page.getByTestId('special'), page.getByRole('button', { name: 'Start a new week' })]) {
      const box = (await target.boundingBox())!;
      expect(box.y, String(target)).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height, String(target)).toBeLessThanOrEqual(height + 0.5);
      expect(box.x + box.width, String(target)).toBeLessThanOrEqual(width + 0.5);
    }
  }
  await shot(page, 'ending-headhunted-1024x768.png');
});
