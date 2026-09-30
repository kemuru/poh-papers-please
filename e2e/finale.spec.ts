import { expect, test, type Page } from '@playwright/test';
import type { GeneratedApplicant } from '../src/gen/applicant';
import { judge, rulebookForDay } from '../src/rules/judge';
import { inspectFault } from './inspectFault';

// Six o'clock on Humanity Day (notes/game-design.md, Endings): after the accounts, every week but a fired clerk's
// goes to the hall for the first hour of the income, then to the letter. The lights go down and the units' lamps
// come on; the last queue says nine lines, a press each; the lever pays; the board answers; the letter closes on
// Monday. Escape skips to the letter, and a reload at six comes back to six.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name) });

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

/** Calls the next applicant and stamps them by the rulebook against the live registry, unless `decide` says otherwise; a fake is challenged with what Inspect found. */
async function stamp(page: Page, decide?: (a: GeneratedApplicant) => 'accept' | 'challenge' | undefined) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, day, registry } = await game(page);
  const a = queue[before];
  const [broken] = judge(a, rulebookForDay(day), registry).violations;
  const decision = decide?.(a) ?? (broken ? 'challenge' : 'accept');
  if (decision === 'challenge' && broken && a.planted.some((p) => p.rule === broken.rule)) await inspectFault(page, { ...a, planted: a.planted.filter((p) => p.rule === broken.rule) });
  await page.getByRole('button', { name: decision === 'accept' ? 'Accept' : 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(before + 1);
}

async function stampAll(page: Page, decide?: Parameters<typeof stamp>[1]) {
  const { queue } = await game(page);
  while ((await game(page)).called < queue.length) await stamp(page, decide);
}

/** Humanity Day by the rulebook, the clerk's own papers as `self` says, to the accounts' Continue, and six o'clock. */
async function toSix(page: Page, self: 'accept' | 'challenge' = 'challenge') {
  await page.goto('/?seed=1&day=7');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page, (a) => (a.cast === 'clerk' ? self : undefined));
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('finale')).toBeVisible();
}

const line = (page: Page) => page.getByTestId('six-line');

test('six o’clock: the lights go down, the units light up, the last queue says its nine lines, the lever pays, and the letter closes on Monday', async ({ page }) => {
  test.setTimeout(120_000);
  await toSix(page);
  expect(await game(page)).toMatchObject({ phase: 'finale', ending: 'reclassified' });
  // The hall fills the stage, and the PA says why it is about to go dark.
  await expect(line(page)).toContainText('The hall lights are on a timer.');
  await shot(page, 'six-lit.png');
  // After a camera's few seconds, every unit's lamp. This week began on Humanity Day, so the units of days 2 to 6 were
  // refused before it, and the clerk refused day 7's: all six sit on Window 2's bench, which the other Ministry registered.
  await expect(page.getByTestId('finale')).toHaveAttribute('data-moment', 'ready', { timeout: 12_000 });
  await expect(page.locator('[data-testid="lamp"][data-on="true"]')).toHaveCount(6);
  await shot(page, 'six-lamps.png');

  // Nine lines, a press each: the farm, those applying for someone else, the humans.
  const queue: [string, string][] = [
    ['terry', "One of us is registered, so the face gets one income. We're sharing it three ways."],
    ['kerry', "Twenty minutes each. I've got the middle twenty."],
    ['perry', 'Different hat.'],
    ['agent', "Good evening. I'm here for my principal's first hour. He isn't free until the second."],
    ['likeness', 'Please pay our units’ first hour to Likeness Robotics. We made them.'],
    ['robin', "Window 2 registered me as Robin Hale. I've come for Robin Hale's first hour."],
    ['ethel', "I don't need the money. I need it on paper."],
    ['hortense', "I've been removed with the clerk. I'd like to be first in the queue on Monday."],
    ['socrates', 'One last question. What is an hour of a human worth?'],
  ];
  for (const [n, [speaker, text]] of queue.entries()) {
    // The lever calls each one, as it called the queue all week; a click in the hall or Enter does too.
    if (n === 3) await page.getByTestId('finale').locator('.six-room').click({ position: { x: 700, y: 60 } });
    else if (n === 6) await page.getByRole('button', { name: 'Next in the queue' }).click();
    else await page.keyboard.press('Space');
    await expect(line(page)).toHaveAttribute('data-speaker', speaker);
    await expect(line(page)).toContainText(text);
    if (speaker === 'likeness') await shot(page, 'six-slot.png');
  }
  await shot(page, 'six-socrates.png');

  // Socrates has asked. The lever, relabelled, pays the first hour; the board keeps the last ticket through the silence.
  const pay = page.getByRole('button', { name: 'Pay the first hour' });
  await expect(pay).toContainText('Pay');
  await pay.click();
  await expect(page.getByTestId('six-board')).toHaveAttribute('data-shows', '055');
  await expect(page.getByTestId('six-board')).toHaveAttribute('data-shows', '0.0003', { timeout: 3000 });
  await expect(page.getByTestId('six-board-name')).toHaveText('Now serving: 0.0003 PNK');
  await shot(page, 'six-paid.png');
  // The lamps get up and leave, and Pat, on the bench since the morning, says one line; then the letter.
  await expect(page.getByTestId('finale')).toHaveAttribute('data-moment', 'leaving', { timeout: 3000 });
  await expect(line(page)).toContainText("It's come through. Fifth time lucky.", { timeout: 6000 });
  await shot(page, 'six-pat.png');
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', 'reclassified', { timeout: 6000 });
  expect((await game(page)).phase).toBe('ending');
  await expect(page.getByRole('article', { name: 'Notice' })).toContainText('Equipment is not eligible for the income.');
  await expect(page.getByTestId('letter-close')).toHaveText('Window 3 opens at nine on Monday.');
  // The paper reports what came after the first hour; the price was the board's to tell.
  await expect(page.getByTestId('special-headline')).toHaveText('FIRST HOUR PAID. HOME ROBOTS LEAVE THE HALL.');
  await expect(page.getByTestId('special')).not.toContainText('0.0003');
  await page.waitForTimeout(2600);
  await shot(page, 'six-letter.png');
});

test('a reload at six comes back to six; Escape, or the key in the corner, goes straight to the letter', async ({ page }) => {
  test.setTimeout(120_000);
  await toSix(page, 'accept');
  // The week is saved at six: the board says so, and Continue comes back to the hall, from the top. (A link begins its
  // week afresh on a reload, as links always have; the plain address is the player's own.)
  await page.goto('/');
  await expect(page.getByTestId('board-continue')).toContainText('Day 7, six o’clock');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('finale')).toHaveAttribute('data-moment', 'lit');
  expect((await game(page)).phase).toBe('finale');
  // Escape: the letter, at once, whatever the hall is doing.
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', 'promoted');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByTestId('letter-close')).toHaveText('Window 3 opens at nine on Monday.');
  // Back to Humanity Day's morning, through the day again, and this time the steel key in the corner.
  await page.getByTestId('ending').getByRole('button', { name: 'day 7', exact: true }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await stampAll(page, (a) => (a.cast === 'clerk' ? 'accept' : undefined));
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'To the letter' }).click();
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', 'promoted');
});

test('with motion reduced, the same beats: the lamps go off where they sit instead of walking out', async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await toSix(page);
  await expect(page.getByTestId('finale')).toHaveAttribute('data-moment', 'ready', { timeout: 12_000 });
  for (let n = 0; n < 9; n++) await page.keyboard.press('Space');
  await expect(line(page)).toHaveAttribute('data-speaker', 'socrates');
  const lamps = page.locator('[data-testid="lamp"]');
  const where = await lamps.evaluateAll((all) => all.map((l) => getComputedStyle(l).transform));
  await page.keyboard.press('Space');
  await expect(page.getByTestId('six-board')).toHaveAttribute('data-shows', '0.0003', { timeout: 3000 });
  await expect(line(page)).toContainText("It's come through.", { timeout: 6000 });
  // Every lamp has gone out, and nobody has moved.
  expect(await lamps.evaluateAll((all) => all.map((l) => getComputedStyle(l).opacity))).toEqual(where.map(() => '0'));
  expect(await lamps.evaluateAll((all) => all.map((l) => getComputedStyle(l).transform))).toEqual(where);
  await page.keyboard.press('Space');
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', 'reclassified');
});

test('a fired clerk never reaches six o’clock: the letter comes that evening', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?seed=1&day=2');
  for (;;) {
    await page.getByRole('button', { name: /Open the window/ }).click();
    // Everyone challenged, on a hunch: the humans' deposits are lost.
    await stampAll(page, () => 'challenge');
    await page.getByRole('button', { name: /End shift/ }).click();
    await page.getByRole('button', { name: /To the accounts/ }).click();
    if ((await game(page)).end!.fired) break;
    const day = (await game(page)).day;
    await page.getByRole('button', { name: `Begin day ${day + 1}` }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByTestId('ending')).toHaveAttribute('data-ending', 'fired');
  await expect(page.getByTestId('finale')).toHaveCount(0);
  expect((await game(page)).phase).toBe('ending');
  // Its letter asks for the stamps back, and has no Monday.
  await expect(page.getByTestId('letter-close')).toHaveCount(0);
});
