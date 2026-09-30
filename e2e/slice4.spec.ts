import { expect, test, type Locator, type Page } from '@playwright/test';
import { INSPECT_LINES } from '../src/content/desk';
import { RULEBOOK } from '../src/content/rulebook';
import { evidenceLine } from '../src/ui/evidence';
import { inspectFault } from './inspectFault';

// Slice 4 acceptance (notes/acceptance.md) in the browser: a hunch dismissed and appealed in place,
// a case with evidence that needs no jury, and a court that reads in under 30 seconds.
const game = (page: Page) => page.evaluate(() => window.__game!);
const shot = (page: Page, name: string) => page.screenshot({ path: test.info().outputPath(name), animations: 'disabled' });

let errors: string[];
test.beforeEach(({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
});
test.afterEach(() => expect(errors).toEqual([]));

async function open(page: Page, query: string) {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
}

/** Calls the next applicant and returns them, with where they are in the queue. */
async function callNext(page: Page) {
  const before = (await game(page)).called;
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(before + 1);
  const { queue, called } = await game(page);
  return { a: queue[called - 1], i: called - 1 };
}

/**
 * Stamps the applicant at the window by the rulebook: a fake is challenged with what Inspect found,
 * or on a hunch, with nothing looked at; anyone else is accepted.
 */
async function stamp(page: Page, how: 'evidence' | 'hunch' = 'evidence') {
  const { a, i } = await callNext(page);
  const fake = a.planted.length > 0;
  if (fake && how === 'evidence') await inspectFault(page, a);
  await page.getByRole('button', { name: fake ? 'Challenge' : 'Accept' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  return { a, i };
}

/** Resolves once every animation on the page has finished. An endless one fails the test instead of hanging it. */
async function settled(page: Page) {
  await page.evaluate(async () => {
    for (;;) {
      const running = document.getAnimations().filter((a) => a.playState !== 'finished');
      const endless = running.find((a) => a.effect?.getComputedTiming().endTime === Infinity);
      if (endless) throw new Error(`endless animation: ${(endless as CSSAnimation).animationName ?? endless.id}`);
      if (running.length === 0) return;
      await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
  });
}

const ruleNo = (rule: keyof typeof RULEBOOK) => RULEBOOK[rule].number;

test('a hunch dismissed by 3 jurors is appealed in place to 7, who uphold it; the accounts pay the appeal', async ({ page }) => {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  // Seed 1, day 2: the Likeness unit (third in the queue, its eyes shut and its lamp lit in frames 1
  // and 3) is the fake a hunch loses to the first jury and wins on appeal; Pat's mirrored photo is
  // the day's other fake.
  const unitAt = 2;
  expect(queue[unitAt].planted, 'seed 1 day 2 changed: pick another').toEqual([{ rule: 'face', mistake: 'machine' }]);
  expect(queue.flatMap((a, i) => (a.planted.length > 0 ? [i] : [])), 'seed 1 day 2 changed: pick another').toEqual([2, 3]);
  const unit = queue[unitAt];

  for (let i = 0; i < queue.length; i++) {
    await stamp(page, i === unitAt ? 'hunch' : 'evidence');
    const slip = page.getByTestId('filing-evidence');
    if (i === unitAt) {
      // Challenged on a hunch: the slip says the jury will look for itself.
      await expect(slip).toHaveText('No evidence filed. The jury will look for itself.');
      expect((await game(page)).decided[i].evidence).toBeUndefined();
      await shot(page, 'hunch-slip.png');
    } else if (queue[i].planted.length > 0) await expect(slip).toHaveText(/^Evidence: Rule 2, /);
  }
  await page.getByRole('button', { name: /End shift/ }).click();

  const court = page.getByRole('region', { name: 'Humanity Court' });
  const ruling = court.getByTestId('ruling').filter({ hasText: unit.name });
  await expect(ruling).toHaveAttribute('data-upheld', 'false');
  const heard = (await game(page)).rulings.find((r) => r.index === unitAt)!;
  expect(heard.upheld, 'seed 1 day 2 changed: pick another').toBe(false);
  await expect(ruling.getByTestId('round')).toHaveCount(1);
  await expect(ruling.getByTestId('round')).toHaveAttribute('data-size', '3');
  await expect(ruling.getByTestId('juror')).toHaveCount(3);
  await expect(ruling.getByTestId('evidence-line')).toHaveCount(0);
  await expect(ruling).toContainText('No evidence filed. The jury looked for itself.');
  await expect(ruling).toContainText('Challenge dismissed.');
  // The votes on the page are the court's.
  const votes = heard.court.rounds[0].seats.map((s) => s.vote);
  expect(await ruling.getByTestId('juror').evaluateAll((els) => els.map((el) => el.getAttribute('data-vote')))).toEqual(votes);
  const dismissedPay = (await game(page)).end!.pay;
  expect(dismissedPay).toMatchObject({ registrations: 5, upheld: 1, dismissed: 1 });
  expect(dismissedPay.wonOnAppeal).toBeUndefined();

  const appeal = ruling.getByTestId('appeal');
  await expect(appeal).toHaveText('Appeal to 7 jurors, 10 PNK');
  await settled(page);
  await shot(page, 'court.png');

  // APPEAL: the next jury sits in place at once; the press is never a dead click.
  await page.evaluate(() => {
    const w = window as unknown as { __appealed?: Promise<number> };
    w.__appealed = new Promise((resolve) => {
      let pressed = 0;
      document.addEventListener('click', () => (pressed = performance.now()), { capture: true, once: true });
      const watch = new MutationObserver(() => {
        if (!pressed || !document.querySelector('[data-testid="round"][data-size="7"]')) return;
        watch.disconnect();
        resolve(performance.now() - pressed);
      });
      watch.observe(document.body, { childList: true, subtree: true });
    });
  });
  await appeal.click();
  await expect(ruling.getByTestId('round')).toHaveCount(2, { timeout: 1000 });
  const appealMs = await page.evaluate(() => (window as unknown as { __appealed: Promise<number> }).__appealed);
  console.log(`the 7 jurors sat ${Math.round(appealMs)} ms after the press`);
  expect(appealMs).toBeLessThan(100);
  const seven = ruling.getByTestId('round').nth(1);
  await expect(seven).toHaveAttribute('data-size', '7');
  await expect(seven.getByTestId('juror')).toHaveCount(7);
  await expect(ruling.getByTestId('round').first().getByTestId('juror')).toHaveCount(3);

  // The final ruling: upheld, naming every rule the unit broke, and nothing left to appeal.
  await expect(ruling).toHaveAttribute('data-upheld', 'true');
  const final = (await game(page)).rulings.find((r) => r.index === unitAt)!;
  expect(final.upheld, 'seed 1 day 2 changed: pick another').toBe(true);
  await expect(ruling).toContainText('Challenge upheld.');
  expect(final.court.violations.length).toBeGreaterThan(0);
  for (const v of final.court.violations) await expect(ruling).toContainText(`Rule ${ruleNo(v.rule)}:`);
  await expect(ruling.getByTestId('appeal')).toHaveCount(0);
  await expect(court.getByTestId('appeal')).toHaveCount(0);
  expect(final.court.rounds.map((r) => ({ size: r.size, fee: r.fee }))).toEqual([
    { size: 3, fee: 0 },
    { size: 7, fee: 10 },
  ]);
  // Paid as the court ended it: the bounty instead of the deposit, the fee back and the bonus.
  const { end } = await game(page);
  expect(end!.pay).toMatchObject({ registrations: 5, upheld: 2, dismissed: 0, wonOnAppeal: 1, lostAt7: 0, lostAt15: 0 });
  expect(end!.pay.total).toBe(dismissedPay.total + 15 + 15 + 10);
  await settled(page);
  await shot(page, 'appeal.png');

  await page.getByRole('button', { name: /To the accounts/ }).click();
  const statement = page.getByRole('region', { name: 'Statement' });
  await expect(statement.locator('.row', { hasText: 'Appeal bonus, fees refunded, 1 × 10' })).toContainText('+10');
  await expect(statement).not.toContainText('Appeals lost');
  await expect(page.getByTestId('savings')).toHaveText(`${end!.after} PNK`);
  expect(end!.after).toBe(end!.before + end!.pay.total - end!.bills.reduce((sum, b) => sum + b.amount, 0));
});

test('a case filed with what Inspect found is a line in court: upheld, with no jury to watch and nothing to appeal', async ({ page }) => {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  // The same unit a hunch loses to the first jury (above), this time with what Inspect found.
  const unitAt = 2;
  expect(queue[unitAt].planted, 'seed 1 day 2 changed: pick another').toEqual([{ rule: 'face', mistake: 'machine' }]);
  for (let i = 0; i < queue.length; i++) {
    await stamp(page);
    if (i === unitAt) {
      await expect(page.getByTestId('filing-evidence')).toHaveText('Evidence: Rule 2, frame 1 against the rule.');
      expect((await game(page)).decided[i].evidence).toMatchObject({ rule: 'face' });
      await shot(page, 'evidence-slip.png');
    }
  }
  await page.getByRole('button', { name: /End shift/ }).click();

  const court = page.getByRole('region', { name: 'Humanity Court' });
  const ruling = court.getByTestId('ruling').filter({ hasText: queue[unitAt].name });
  await expect(ruling.getByTestId('evidence-line')).toHaveText('Evidence: Rule 2, frame 1 against the rule.');
  await expect(ruling).toHaveAttribute('data-upheld', 'true');
  await expect(ruling).toContainText('Challenge upheld.');
  await expect(ruling).toContainText(`Rule ${ruleNo('face')}:`);
  await expect(ruling.getByTestId('round')).toHaveCount(0);
  await expect(ruling.getByTestId('juror')).toHaveCount(0);
  await settled(page);
  await expect(ruling.getByTestId('appeal')).toHaveCount(0);
  // Every fake went in with evidence: the whole court is lines, and nothing is appealable.
  await expect(court.getByTestId('evidence-line')).toHaveCount(2);
  await expect(court.getByTestId('round')).toHaveCount(0);
  await expect(court.getByTestId('appeal')).toHaveCount(0);
  const { rulings } = await game(page);
  for (const r of rulings) {
    expect(r.upheld).toBe(true);
    expect(r.court.rounds).toHaveLength(1);
    expect(r.court.rounds[0].seats.map((s) => s.reason)).toEqual(['evidence', 'evidence', 'evidence']);
  }
});

test('evidence goes to court with the case it was found on: the next fake, challenged on a hunch, has none', async ({ page }) => {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  // Seed 1, day 2: the unit (third in the queue) is filed with what Inspect found; Pat, next, on a hunch.
  expect(queue.flatMap((a, i) => (a.planted.length > 0 ? [i] : [])), 'seed 1 day 2 changed: pick another').toEqual([2, 3]);
  for (let i = 0; i < 3; i++) await stamp(page);
  await expect(page.getByTestId('filing-evidence')).toHaveText('Evidence: Rule 2, frame 1 against the rule.');
  await stamp(page, 'hunch');
  const filing = page.getByTestId('filing');
  await expect(filing).toContainText(`The Registry v. ${queue[3].name}`);
  await expect(filing.getByTestId('filing-evidence')).toHaveText('No evidence filed. The jury will look for itself.');
  const { decided } = await game(page);
  expect(decided[2].evidence).toMatchObject({ rule: 'face' });
  expect(decided[3].evidence).toBeUndefined();
});

test('a discrepancy no rule in force covers yet is not evidence: the filtered photo on day 1 goes to court as a hunch', async ({ page }) => {
  await open(page, '?seed=1&day=1');
  const { queue } = await game(page);
  // Seed 1, day 1: the Influencer, fifth in the queue, broke nothing today; her photo is filtered, and Rule 2, the face, is tomorrow's.
  const at = 4;
  expect(queue[at].cast, 'seed 1 day 1 changed: pick another').toBe('influencer');
  expect(queue[at].planted).toEqual([]);
  for (let i = 0; i < at; i++) await stamp(page);
  await callNext(page);
  await page.getByRole('button', { name: 'Inspect', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect the photo', exact: true }).click();
  await page.getByRole('button', { name: 'Inspect frame 1', exact: true }).click();
  await expect(page.getByTestId('inspector')).toContainText(INSPECT_LINES.notInForce);
  await page.getByRole('button', { name: 'Challenge' }).click();
  await expect.poll(async () => (await game(page)).decided.length).toBe(at + 1);
  const filing = page.getByTestId('filing');
  await expect(filing).toContainText(`The Registry v. ${queue[at].name}`);
  await expect(filing.getByTestId('filing-evidence')).toHaveText('No evidence filed. The jury will look for itself.');
  expect((await game(page)).decided[at].evidence).toBeUndefined();
});

test('the busiest court, ten hunches and no appeals, reads in under 30 seconds', async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1280, height: 700 });
  await open(page, '?seed=1&day=6');
  for (let i = 0; i < 10; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.getByRole('button', { name: 'Challenge' }).click();
  }
  // From the court appearing until the last animation on the page has finished, on the page's clock.
  await page.evaluate(() => {
    const w = window as unknown as { __read?: Promise<number> };
    w.__read = new Promise((resolve, reject) => {
      const settle = async (sat: number) => {
        for (;;) {
          const running = document.getAnimations().filter((a) => a.playState !== 'finished');
          if (running.some((a) => a.effect?.getComputedTiming().endTime === Infinity)) return reject(new Error('an endless animation on the court screen'));
          if (running.length === 0) return resolve(performance.now() - sat);
          await Promise.all(running.map((a) => a.finished.catch(() => undefined)));
          await new Promise((next) => requestAnimationFrame(next));
        }
      };
      const watch = new MutationObserver(() => {
        if (!document.querySelector('section[aria-label="Humanity Court"]')) return;
        watch.disconnect();
        const sat = performance.now();
        requestAnimationFrame(() => settle(sat));
      });
      watch.observe(document.body, { childList: true, subtree: true });
    });
  });
  await page.getByRole('button', { name: /End shift/ }).click();
  await expect(page.getByTestId('ruling')).toHaveCount(10);
  const readMs = await page.evaluate(() => (window as unknown as { __read: Promise<number> }).__read);
  test.info().annotations.push({ type: 'court read', description: `${Math.round(readMs)} ms` });
  console.log(`ten hunches, no appeals: the court read in ${Math.round(readMs)} ms`);
  expect(readMs).toBeLessThan(30_000);
  const { rulings } = await game(page);
  expect(rulings).toHaveLength(10);
  expect(rulings.every((r) => r.court.rounds.length === 1 && r.court.evidence === null)).toBe(true);
  // Every card printed to its last line, the tenth as fully as the first.
  expect(await printedTo(page)).toEqual(Array(10).fill(true));
  await shot(page, 'court-day6.png');

  // One press moves on.
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
  expect((await game(page)).phase).toBe('statement');
});

/** Whether each card on the court has printed in full: no step of the print left over at the bottom. */
const printedTo = (page: Page) =>
  page.getByTestId('ruling').evaluateAll((cards) =>
    cards.map((card) => {
      const { transform, clipPath } = getComputedStyle(card);
      return ['none', 'matrix(1, 0, 0, 1, 0, 0)'].includes(transform) && !clipPath.includes('12.5%');
    }),
  );

/** Animations still running on the court screen. */
const sitting = (page: Page) =>
  page.evaluate(() => document.querySelector('section[aria-label="Humanity Court"]')!.getAnimations({ subtree: true }).filter((a) => a.playState !== 'finished').length);

/** Plays out, at once, whatever the court still has to show. */
const fastForward = (page: Page) => page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));

/** Seed 1, day 2 at the window: the unit on a hunch, Pat with what Inspect found, and anyone in `hunches` challenged on a hunch too. */
async function dayTwo(page: Page, hunches: number[] = []) {
  await open(page, '?seed=1&day=2');
  const { queue } = await game(page);
  expect(queue.flatMap((a, i) => (a.planted.length > 0 ? [i] : [])), 'seed 1 day 2 changed: pick another').toEqual([2, 3]);
  for (let i = 0; i < queue.length; i++) {
    const { a } = await callNext(page);
    if (i === 3) await inspectFault(page, a);
    await page.getByRole('button', { name: i === 2 || i === 3 || hunches.includes(i) ? 'Challenge' : 'Accept' }).click();
    await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  }
  return queue;
}

test('APPEAL by keyboard: the case keeps the focus, the next APPEAL takes it once stamped, and a press while the jury sits brings the stamp down', async ({ page }) => {
  // The first applicant broke nothing: a hunch against them is dismissed by every jury.
  const queue = await dayTwo(page, [0]);
  await page.getByRole('button', { name: /End shift/ }).click();
  const court = page.getByRole('region', { name: 'Humanity Court' });
  const valid = court.getByTestId('ruling').filter({ hasText: queue[0].name });
  const unit = court.getByTestId('ruling').filter({ hasText: queue[2].name });
  await settled(page);

  // Enter on APPEAL: the jury of 7 sits, and the focus stays on the case rather than falling to the page.
  await valid.getByTestId('appeal').focus();
  await page.keyboard.press('Enter');
  await expect(valid.getByTestId('round')).toHaveCount(2);
  await expect(valid).toBeFocused();
  // Once the new stamp is down, the next APPEAL has the focus: Enter again takes the case to 15.
  await expect(valid.getByTestId('appeal')).toHaveText('Appeal to 15 jurors, 20 PNK');
  await expect(valid.getByTestId('appeal')).toBeFocused();
  expect((await game(page)).phase).toBe('court');
  await page.keyboard.press('Enter');
  await expect(valid.getByTestId('round')).toHaveCount(3);
  await expect(valid).toBeFocused();
  // Enter while the 15 are still sitting brings their stamp down; it does not leave the court.
  expect(await sitting(page)).toBeGreaterThan(0);
  await page.keyboard.press('Enter');
  expect(await sitting(page)).toBe(0);
  expect((await game(page)).phase).toBe('court');
  await expect(valid).toHaveAttribute('data-upheld', 'false');
  await expect(valid.getByTestId('appeal')).toHaveCount(0);

  // Space on the unit's APPEAL does the same: the 7 uphold it, and the press after the jury moves on.
  await unit.getByTestId('appeal').focus();
  await page.keyboard.press('Space');
  await expect(unit.getByTestId('round')).toHaveCount(2);
  await expect(unit).toBeFocused();
  await page.keyboard.press('Space');
  expect(await sitting(page)).toBe(0);
  expect((await game(page)).phase).toBe('court');
  await expect(unit).toHaveAttribute('data-upheld', 'true');
  await shot(page, 'appeal-keyboard.png');
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
  const { rulings } = await game(page);
  expect(rulings.map((r) => [r.index, r.court.rounds.length, r.upheld])).toEqual([
    [0, 3, false],
    [2, 2, true],
    [3, 1, true],
  ]);
});

test('APPEAL clicked: the focus stays on the case, so a Space afterwards moves on and spends nothing more', async ({ page }) => {
  const queue = await dayTwo(page, [0]);
  await page.getByRole('button', { name: /End shift/ }).click();
  const valid = page.getByTestId('ruling').filter({ hasText: queue[0].name });
  await settled(page);
  await valid.getByTestId('appeal').click();
  await expect(valid.getByTestId('round')).toHaveCount(2);
  await expect(valid).toBeFocused();
  await settled(page);
  await expect(valid.getByTestId('appeal')).toHaveText('Appeal to 15 jurors, 20 PNK');
  await expect(valid).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
  expect((await game(page)).rulings.find((r) => r.index === 0)!.court.rounds).toHaveLength(2);
});

test('a Space carried over from the desk brings every stamp down; only the next one leaves the court', async ({ page }) => {
  await dayTwo(page);
  // The lever, by keyboard: Space ends the shift, and the clerk's thumb is still on it.
  await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
  await page.keyboard.press('Space');
  const court = page.getByRole('region', { name: 'Humanity Court' });
  await expect(court).toBeVisible();
  const accounts = page.getByRole('button', { name: /To the accounts/, includeHidden: true });
  // Not yet faded in, so not there to be pressed: a click where it will be finds something else.
  await expect(accounts).toBeHidden();
  expect(
    await accounts.evaluate((b) => {
      const r = b.getBoundingClientRect();
      return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2) === b;
    }),
  ).toBe(false);
  expect(await sitting(page)).toBeGreaterThan(0);

  await page.keyboard.press('Space');
  expect(await sitting(page)).toBe(0);
  expect((await game(page)).phase).toBe('court');
  // Every ruling is on the table: the stamps, the unit's APPEAL, and the way out.
  await expect(court.getByTestId('ruling')).toHaveCount(2);
  for (const stamp of await court.locator('.ruling-stamp').all()) await expect(stamp).toBeVisible();
  await expect(court.getByTestId('appeal')).toBeVisible();
  await expect(accounts).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByRole('region', { name: 'Statement' })).toBeVisible();
});

/** The docket needs no scrolling, and every card, every APPEAL and the way out are inside the window. */
async function courtFits(page: Page, width: number, height: number) {
  const docket = await page.locator('.docket').evaluate((d) => [d.scrollHeight, d.clientHeight]);
  expect(docket[0], 'the docket scrolls').toBeLessThanOrEqual(docket[1]);
  const targets: Locator[] = [
    ...(await page.getByTestId('ruling').all()),
    ...(await page.getByTestId('appeal').all()),
    page.getByRole('button', { name: /To the accounts/ }),
  ];
  for (const target of targets) {
    const box = (await target.boundingBox())!;
    expect(box.y, String(target)).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height, String(target)).toBeLessThanOrEqual(height + 0.5);
    expect(box.x + box.width, String(target)).toBeLessThanOrEqual(width + 0.5);
  }
}

/** Seed 1, day 6: the first `hunches` applicants challenged on a hunch, the rest accepted, and the shift ended. */
async function daySix(page: Page, hunches: number) {
  await open(page, '?seed=1&day=6');
  const { queue } = await game(page);
  for (let i = 0; i < queue.length; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.getByRole('button', { name: i < hunches ? 'Challenge' : 'Accept' }).click();
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  await expect(page.getByTestId('ruling')).toHaveCount(hunches);
}

for (const [width, height] of [
  [1280, 700],
  [1470, 830],
] as const) {
  test(`a court of five or six challenges sits three to a row and fits a ${width}×${height} window`, async ({ page }) => {
    test.setTimeout(90_000);
    await page.setViewportSize({ width, height });
    for (const hunches of [5, 6]) {
      await daySix(page, hunches);
      await settled(page);
      await courtFits(page, width, height);
      expect(await printedTo(page)).toEqual(Array(hunches).fill(true));
      // Room for every juror's bubble.
      await expect(page.locator('.bubble')).toHaveCount(hunches * 3);
      for (const bubble of await page.locator('.bubble').all()) await expect(bubble).toBeVisible();
      if (width === 1280 && hunches === 6) await shot(page, 'court-six.png');
    }
  });

  test(`appeals to 15 jurors in both rows still fit a ${width}×${height} window, every ruling in full`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    for (const hunches of [4, 6, 10]) {
      await daySix(page, hunches);
      await fastForward(page);
      // Every dismissal appealed, to the last jury.
      let appeals = 0;
      for (;;) {
        const appeal = page.getByTestId('appeal');
        if ((await appeal.count()) === 0) break;
        await appeal.first().click();
        appeals++;
        await fastForward(page);
      }
      const { rulings } = await game(page);
      expect(rulings.filter((r) => r.court.rounds.length === 3).length, `${hunches} hunches`).toBeGreaterThanOrEqual(2);
      expect(appeals).toBe(rulings.reduce((n, r) => n + r.court.rounds.length - 1, 0));
      await courtFits(page, width, height);
      // Every rule an upheld ruling names is printed in full, not cut to fit.
      const cards = page.getByTestId('ruling');
      for (const [n, r] of rulings.entries()) {
        for (const v of r.upheld ? r.court.violations : []) {
          const line = cards.nth(n).locator('.hearing-evidence', { hasText: `Rule ${ruleNo(v.rule)}:` });
          await expect(line).toHaveText(`Rule ${ruleNo(v.rule)}: ${evidenceLine(v, 'court')}`);
          expect(await line.evaluate((p) => p.scrollHeight <= p.clientHeight && p.getBoundingClientRect().bottom <= p.closest('article')!.getBoundingClientRect().bottom)).toBe(true);
        }
      }
      expect(rulings.some((r) => r.upheld && r.court.rounds.length > 1)).toBe(true);
      if (width === 1280 && hunches === 10) await shot(page, 'court-day6-appealed.png');
    }
  });
}
