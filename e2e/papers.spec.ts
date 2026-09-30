import { expect, test, type Page } from '@playwright/test';
import { litFrames } from '../src/rules/face';

// The papers as the desk draws them, frame by frame (reports/Desk papers and a comedy finale.md): each comes
// through the slot out of sight until it comes, moves in frames of 40ms on the 2px grid, and is heard on the frame
// it touches the blotter, on its own animation's clock; the stamp's ink, handle and thunk come down together; with
// motion reduced the timeline stays and only the frames between go. The frames are read by holding the papers'
// animations still and setting them to each moment in turn, so nothing here waits on a real clock; each moment is
// the middle of a 40ms frame, clear of the rounding at a frame's edge.
const game = (page: Page) => page.evaluate(() => window.__game!);

let errors: string[];
test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  // Every frequency the desk's sounds set, with whether the stamp's ink was down when it was set: 2600 is the
  // form's paper, 3400 the printout's rustle, 150 the stamp's thunk.
  await page.addInitScript(() => {
    const heard: { hz: number; ink: boolean }[] = [];
    (window as unknown as { heard: typeof heard }).heard = heard;
    const note = (hz: number) => heard.push({ hz: Math.round(hz), ink: !!document.querySelector('[data-testid="stamp"]') });
    const at = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (value, time) {
      note(value);
      return at.call(this, value, time);
    };
    const value = Object.getOwnPropertyDescriptor(AudioParam.prototype, 'value')!;
    Object.defineProperty(AudioParam.prototype, 'value', {
      get() {
        return value.get!.call(this);
      },
      set(v: number) {
        note(v);
        value.set!.call(this, v);
      },
    });
  });
});
test.afterEach(() => expect(errors).toEqual([]));

const heard = (page: Page) => page.evaluate(() => (window as unknown as { heard: { hz: number; ink: boolean }[] }).heard.map((h) => h.hz));
const forget = (page: Page) => page.evaluate(() => void ((window as unknown as { heard: unknown[] }).heard.length = 0));

type Sheet = { x: number; y: number; seen: boolean; shadow: number; flat: boolean };

/** Every animation on these things held still at `ms` after they started, and how each thing is drawn then. */
function frameAt(page: Page, selectors: string[], ms: number) {
  return page.evaluate(
    async ({ selectors, ms }) => {
      for (const selector of selectors)
        for (const el of document.querySelectorAll(selector))
          for (const a of el.getAnimations()) {
            a.pause();
            a.currentTime = ms;
          }
      // An animation that starts on this frame sends its start as the frame is drawn.
      await new Promise(requestAnimationFrame);
      return selectors.map((selector): Sheet => {
        const el = document.querySelector(selector)!;
        const style = getComputedStyle(el);
        const m = new DOMMatrixReadOnly(style.transform === 'none' ? undefined : style.transform);
        const shadow = getComputedStyle(el.firstElementChild ?? el).boxShadow.match(/(-?\d+)px -?\d+px 0px/);
        return { x: m.e, y: m.f, seen: style.visibility === 'visible', shadow: shadow ? Number(shadow[1]) : 0, flat: m.a === 1 && m.b === 0 && m.c === 0 && m.d === 1 };
      });
    },
    { selectors, ms },
  );
}

async function openAndCall(page: Page, query = '?seed=1&day=1') {
  await page.goto(`/${query}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.keyboard.press('Space');
  await expect.poll(async () => (await game(page)).called).toBe(1);
}

const PAPERS = ['.paper-form', '.paper-video'];

test('the papers come in out of sight, then a frame at a time on the grid, each heard on the frame it lands', async ({ page }) => {
  await openAndCall(page);
  const hidden = { seen: false };
  const expected: [number, Partial<Sheet>, Partial<Sheet>][] = [
    [20, hidden, hidden],
    [260, hidden, hidden],
    // Form 1 from 0.28s in frames of 60ms, lifted (its shadow long), 112, 48, 16 and 4 pixels short; it overshoots by an
    // art pixel as it lands.
    [310, { x: -112, seen: true, shadow: 8 }, hidden],
    [370, { x: -48, shadow: 8 }, hidden],
    [430, { x: -16, shadow: 8 }, { x: -112, seen: true, shadow: 8 }],
    [490, { x: -4, shadow: 8 }, { x: -48, shadow: 8 }],
    [550, { x: 2, shadow: 4 }, { x: -16, shadow: 8 }],
    [610, { x: 0, shadow: 4 }, { x: -4, shadow: 8 }],
    // The printout two frames behind, with no overshoot: both down from 0.64s.
    [670, { x: 0, seen: true, shadow: 4 }, { x: 0, seen: true, shadow: 4 }],
    [2000, { x: 0, seen: true, shadow: 4 }, { x: 0, seen: true, shadow: 4 }],
  ];
  for (const [ms, form, video] of expected) {
    await forget(page);
    const [f, v] = await frameAt(page, PAPERS, ms);
    expect(f, `Form 1 at ${ms}ms`).toMatchObject(form);
    expect(v, `the printout at ${ms}ms`).toMatchObject(video);
    for (const sheet of [f, v]) {
      expect(sheet.flat, `${ms}ms: moved, never turned or scaled`).toBe(true);
      expect(Math.abs(sheet.x % 2), `${ms}ms: on the grid`).toBe(0);
    }
    // Each paper is heard as the frame it touches the blotter comes, and at no other frame.
    const sounds = await heard(page);
    expect(sounds.includes(2600), `Form 1 heard by ${ms}ms, and not before the frame before`).toBe(ms === 550);
    expect(sounds.includes(3400), `the printout heard by ${ms}ms, and not before the frame before`).toBe(ms === 670);
  }
});

test('the stamp lands in one frame with its thunk, the desk shakes on the grid, and the papers go under the booth', async ({ page }) => {
  await openAndCall(page);
  await expect.poll(() => page.evaluate(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect).target?.closest('.paper')).every((a) => a.playState === 'finished'))).toBe(true);
  await forget(page);
  await page.keyboard.press('a');
  // The thunk was played with the ink already on the form: one moment, before the frame that shows it.
  const thunk = await page.evaluate(() => (window as unknown as { heard: { hz: number; ink: boolean }[] }).heard.find((h) => h.hz === 150));
  expect(thunk).toEqual({ hz: 150, ink: true });
  const parts = ['.desk-papers', '.stamp-tool.used'];
  const handle = () => page.evaluate(() => getComputedStyle(document.querySelector('.stamp-tool.used')!).translate);
  const expected: [number, number, number, string][] = [
    // The blow and a frame's hold, the handle at its lowest; then an art pixel's shake, and back, the handle coming up.
    [20, 0, 0, '0px 12px'],
    [60, 0, 0, '0px 12px'],
    [100, 2, 2, '0px 6px'],
    [140, -2, 0, '0px 2px'],
    [180, 0, 0, 'none'],
  ];
  for (const [ms, x, y, lift] of expected) {
    const [blotter] = await frameAt(page, parts, ms);
    expect([blotter.x, blotter.y], `the desk at ${ms}ms`).toEqual([x, y]);
    expect(blotter.flat).toBe(true);
    expect(await handle(), `the stamp's handle at ${ms}ms`).toBe(lift);
  }
  await expect(page.getByTestId('stamp')).toHaveCSS('opacity', '0.88');
  // Handed back after the same wait: four frames, faster each, the fourth under the booth.
  for (const [ms, x, seen] of [
    [730, 0, true],
    [770, -8, true],
    [810, -32, true],
    [850, -96, true],
    [890, -96, false],
  ] as const) {
    for (const sheet of await frameAt(page, PAPERS, ms)) expect(sheet, `handed back, ${ms}ms`).toMatchObject({ x, seen });
  }
});

for (const how of ['the browser', 'the settings'] as const) {
  test.describe(`with motion reduced by ${how}`, () => {
    if (how === 'the browser') test.use({ reducedMotion: 'reduce' });

    test('the papers keep their timeline and lose only the frames between: each cuts in at its place with its sound', async ({ page }) => {
      if (how === 'the settings') {
        await page.goto('/');
        await page.getByRole('switch', { name: 'Reduce motion' }).click();
        await expect(page.locator('html')).toHaveClass(/motion-reduced/);
      }
      await openAndCall(page);
      for (const [ms, form, video] of [
        [20, false, false],
        [490, false, false],
        [550, true, false],
        [610, true, false],
        [670, true, true],
      ] as const) {
        await forget(page);
        const [f, v] = await frameAt(page, PAPERS, ms);
        expect([f.seen, v.seen], `${ms}ms`).toEqual([form, video]);
        for (const sheet of [f, v]) if (sheet.seen) expect(sheet, `${ms}ms: at its place, flat on the blotter`).toMatchObject({ x: 0, y: 0, shadow: 4 });
        const sounds = await heard(page);
        expect(sounds.includes(2600), `Form 1 heard by ${ms}ms`).toBe(ms === 550);
        expect(sounds.includes(3400), `the printout heard by ${ms}ms`).toBe(ms === 670);
      }
      // Stamped, the handle does not travel, and the papers stay in sight, still, until they would have gone under the booth.
      await page.keyboard.press('c');
      expect(await page.evaluate(() => getComputedStyle(document.querySelector('.stamp-tool.used')!).translate)).toBe('none');
      for (const [ms, seen] of [
        [20, true],
        [850, true],
        [890, false],
      ] as const) {
        for (const sheet of await frameAt(page, PAPERS, ms)) expect(sheet, `handed back, ${ms}ms`).toMatchObject({ x: 0, seen });
      }
    });
  });
}

test('a paper grabbed as it comes in stops in the hand, lands, and can be moved', async ({ page }) => {
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.keyboard.press('Space');
  const form = page.getByRole('region', { name: 'Profile card' });
  // Taken on its first frame in sight.
  await frameAt(page, PAPERS, 300);
  const box = (await form.boundingBox())!;
  await forget(page);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 40, box.y + box.height / 2 + 20, { steps: 4 });
  await page.mouse.up();
  expect(await heard(page), 'it lands in the hand').toEqual(expect.arrayContaining([2600]));
  // It stays where it was taken (as far out from under the booth as the desk lets it), and went where it was moved.
  const moved = (await form.boundingBox())!;
  expect(moved.x).toBeGreaterThan(box.x);
  expect(await form.evaluate((el) => el.getAnimations().every((a) => a.playState === 'finished'))).toBe(true);
  await expect(form).toBeVisible();
});

// The magnifier's lens: the still (or the photo) the clerk points at, three times as big as the desk draws it, laid
// where it covers none of what it is held against. The day 7 unit's lamp is two portrait pixels wide.
async function toTheLastUnit(page: Page) {
  await page.goto('/?seed=1&day=7');
  await page.getByRole('button', { name: /Open the window/ }).click();
  const { queue } = await game(page);
  const unitAt = queue.findIndex((a) => a.cast === 'unit');
  for (let i = 0; i < unitAt; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await expect.poll(async () => (await game(page)).called).toBe(i + 1);
    await page.getByRole('button', { name: queue[i].planted.length ? 'Challenge' : 'Accept' }).click();
    await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
  }
  await page.getByRole('button', { name: 'Call next applicant' }).click();
  await expect.poll(async () => (await game(page)).called).toBe(unitAt + 1);
  const unit = queue[unitAt];
  expect(unit.video.lamp).toBe('slit');
  return unit;
}

/** Where the lens lies, and how much of what it must not cover it covers (CSS pixels). */
const lensOver = (page: Page) =>
  page.evaluate(() => {
    const box = (el: Element) => el.getBoundingClientRect();
    const lens = document.querySelector('[data-testid="loupe"]')!;
    const l = box(lens);
    const kept = [...document.querySelectorAll('.paper [data-inspect="photo"], .paper [data-inspect^="frame-"], .rule-figure, .record-face')].map(box).filter((b) => b.width > 0);
    const covered = kept.reduce((sum, k) => sum + Math.max(0, Math.min(l.right, k.right) - Math.max(l.left, k.left)) * Math.max(0, Math.min(l.bottom, k.bottom) - Math.max(l.top, k.top)), 0);
    const picture = lens.querySelector('svg')!.getBoundingClientRect();
    const booth = box(document.querySelector('.booth')!);
    return { covered, picture: [picture.width, picture.height], overBooth: l.left < booth.right, hidden: lens.getAttribute('aria-hidden') };
  });

for (const [width, height, dpr] of [
  [1440, 789, 2],
  [1240, 820, 1],
] as const) {
  test.describe(`at ${width}×${height}, ${dpr}×`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor: dpr });

    test('Inspect’s lens shows the still pointed at three times as big, beside what it is held against, and goes when the pointer does', async ({ page }) => {
      const unit = await toTheLastUnit(page);
      const lit = litFrames(unit.video)[0];
      const lens = page.getByTestId('loupe');
      // Rule 2's page, with its figure, open beside the papers.
      await page.keyboard.press('2');
      // Not while Inspect is down.
      await page.getByTestId(`frame-${lit}`).hover();
      await expect(lens).toHaveCount(0);
      await page.keyboard.press('i');
      const still = page.getByRole('button', { name: `Inspect frame ${lit}`, exact: true });
      await still.hover();
      await expect(lens).toBeVisible();
      const scale = await page.evaluate(() => document.querySelector('.stage')!.getBoundingClientRect().width / (document.querySelector('.stage') as HTMLElement).offsetWidth);
      const over = await lensOver(page);
      expect(over.picture.map((px) => Math.round(px / scale))).toEqual([240, 288]);
      expect(over.covered, 'the lens covers no still, the photo nor the figure').toBe(0);
      expect(over.overBooth).toBe(false);
      expect(over.hidden, 'the lens is not read out; the still keeps its own name').toBe('true');
      await expect(still).toBeVisible();
      // Pointing works through it as before: the lit still against Rule 2.
      await still.click();
      await page.getByRole('button', { name: 'Inspect Rule 2', exact: true }).click();
      await expect(page.getByTestId('inspector')).toContainText('Discrepancy under Rule 2');
      // Off the still, the lens goes.
      await page.getByRole('region', { name: 'Window' }).hover();
      await expect(lens).toHaveCount(0);
      // The photo, by the keyboard's focus.
      await page.getByRole('button', { name: 'Inspect the photo', exact: true }).focus();
      await expect(lens).toBeVisible();
      expect((await lensOver(page)).covered).toBe(0);
      // Inspect put down, the lens goes with it.
      await page.keyboard.press('Escape');
      await expect(page.getByRole('button', { name: 'Inspect', exact: true })).toHaveAttribute('aria-pressed', 'false');
      await expect(lens).toHaveCount(0);
    });
  });
}

// Where the stage has the room (room.ts, evidenceX2), the stills and the form's photo are drawn at twice the art
// scale; everywhere else at the art scale. A 1080p monitor's browser window has it, and a 1080p laptop's at 125%;
// a 13-inch MacBook's does not. Day 4 has every paper the desk holds, the registry's answers and vouchers included.
for (const [width, height, dpr, doubled] of [
  [1920, 955, 1, true],
  [1536, 740, 1.25, true],
  [1440, 789, 2, false],
] as const) {
  test.describe(`in a ${width}×${height} window at ${dpr}×`, () => {
    test.use({ viewport: { width, height }, deviceScaleFactor: dpr });

    test(`the evidence is drawn ${doubled ? 'at twice' : 'at'} the art scale, and the day's tallest papers fit`, async ({ page }) => {
      await page.goto('/?seed=1&day=4');
      await page.getByRole('button', { name: /Open the window/ }).click();
      await expect(page.locator('.stage')).toHaveClass(doubled ? /evidence-x2/ : /^stage$/);
      const { queue } = await game(page);
      // The hall gives way for the doubled papers once, for the whole day: it never changes height as they come and go.
      const halls = new Set<number>();
      for (let i = 0; i < queue.length; i++) {
        await page.getByRole('button', { name: 'Call next applicant' }).click();
        await expect.poll(async () => (await game(page)).called).toBe(i + 1);
        await page.waitForFunction(() => document.getAnimations().filter((a) => (a.effect as KeyframeEffect).target?.closest('.paper')).every((a) => a.playState === 'finished'));
        // In design pixels: four to a portrait pixel, or two.
        const pictures = await page.evaluate(() => {
          const stage = document.querySelector('.stage') as HTMLElement;
          const scale = stage.getBoundingClientRect().width / stage.offsetWidth;
          return [...document.querySelectorAll('.paper-form .photo svg, .paper-video .frame:not(.pair) svg')].map((el) => [Math.round(el.getBoundingClientRect().width / scale), Math.round(el.getBoundingClientRect().height / scale)]);
        });
        expect(pictures.length, `applicant ${i + 1}`).toBeGreaterThan(0);
        for (const picture of pictures) expect(picture, `applicant ${i + 1}`).toEqual(doubled ? [160, 192] : [80, 96]);
        for (const key of ['2', 'v']) {
          await page.keyboard.press(key);
          // The booth and the desk end inside the window, nothing scrolls, and no paper runs off the blotter.
          const fit = await page.evaluate(() => {
            const foot = document.querySelector('.station')!.getBoundingClientRect().bottom;
            const hall = document.querySelector('[aria-label^="The waiting hall"]')!.getBoundingClientRect().height;
            const blotter = document.querySelector('.desk-papers')!.getBoundingClientRect();
            const papers = [...document.querySelectorAll('.paper-form, .paper-video')].map((el) => el.getBoundingClientRect());
            return {
              foot,
              hall,
              scroll: [document.documentElement.scrollWidth, document.documentElement.scrollHeight],
              inside: papers.every((p) => p.right <= blotter.right + 0.5 && p.bottom <= blotter.bottom + 0.5),
              sign: [...document.querySelectorAll('.paper-video .sign-holder')].every((s) => (s.firstElementChild as HTMLElement).scrollWidth <= s.clientWidth + 2),
            };
          });
          expect(fit.foot, `applicant ${i + 1}, key ${key}`).toBeLessThanOrEqual(height + 0.5);
          expect(fit.scroll).toEqual([width, height]);
          expect(fit.inside, `applicant ${i + 1}: the papers on the blotter`).toBe(true);
          expect(fit.sign, `applicant ${i + 1}: the sign beside the stills`).toBe(true);
          halls.add(Math.round(fit.hall));
        }
        await page.getByRole('button', { name: queue[i].planted.length ? 'Challenge' : 'Accept' }).click();
        await expect.poll(async () => (await game(page)).decided.length).toBe(i + 1);
      }
      expect([...halls]).toHaveLength(1);
    });
  });
}
