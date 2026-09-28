import { expect, test, type Page } from '@playwright/test';

// The music as it is heard: rendered offline in the browser, or counted while the game is played.

test('the open window never goes quiet, and the music stays well under the stamp', async ({ page }) => {
  await page.goto('/?portraits');
  const { peak, quietest } = await page.evaluate(async () => {
    // Imported inside the page, from the dev server.
    const path: string = '/src/ui/music.ts';
    const music = await import(/* @vite-ignore */ path);
    const sr = 44100;
    const seconds = 60;
    const ctx = new OfflineAudioContext(2, sr * seconds, sr);
    const player = music.startPlayer(ctx, ctx.destination, 'open', 1);
    for (let t = 0; t < seconds - 0.1; t += 0.25) {
      void ctx.suspend(t).then(() => {
        player.book(1.5);
        void ctx.resume();
      });
    }
    const buffer = await ctx.startRendering();
    const [l, r] = [buffer.getChannelData(0), buffer.getChannelData(1)];
    let max = 0;
    const perSecond: number[] = [];
    for (let s = 0; s < seconds; s++) {
      let e = 0;
      for (let i = s * sr; i < (s + 1) * sr; i++) {
        max = Math.max(max, Math.abs(l[i]), Math.abs(r[i]));
        e += (l[i] * l[i] + r[i] * r[i]) / 2;
      }
      perSecond.push(10 * Math.log10(e / sr));
    }
    return { peak: 20 * Math.log10(max), quietest: Math.min(...perSecond.slice(3)) };
  });
  // The stamp's thud peaks near -6 dBFS; the music stays at least 10 dB under it.
  expect(peak).toBeLessThan(-16);
  // With the pulse, no second of the open window drops away to near silence (without it, -56 dBFS).
  expect(quietest).toBeGreaterThan(-50);
});

test('one band plays from the first morning into day 2, never two at once', async ({ page }) => {
  // Each band has one hall echo: count them as they are made.
  await page.addInitScript(() => {
    const w = window as unknown as { bands: number };
    w.bands = 0;
    const make = BaseAudioContext.prototype.createConvolver;
    BaseAudioContext.prototype.createConvolver = function () {
      w.bands++;
      return make.call(this);
    };
  });
  const bands = (p: Page) => p.evaluate(() => (window as unknown as { bands: number }).bands);
  await page.goto('/?seed=1&day=1');
  await page.getByRole('button', { name: /Open the window/ }).click();
  await expect.poll(() => bands(page)).toBe(1);
  for (let i = 0; i < 5; i++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await page.getByRole('button', { name: 'Accept' }).click();
  }
  await page.getByRole('button', { name: /End shift/ }).click();
  await page.getByRole('button', { name: /To the accounts/ }).click();
  await page.getByRole('button', { name: 'Begin day 2' }).click();
  await page.getByRole('button', { name: /Open the window/ }).click();
  await page.waitForTimeout(1000);
  expect(await bands(page)).toBe(1);
});

test('while the window is open, every note starts on the pulse’s grid: the band keeps one time', async ({ page }) => {
  await page.goto('/?portraits');
  const { notes, offGrid } = await page.evaluate(async () => {
    const path: string = '/src/ui/music.ts';
    const music = await import(/* @vite-ignore */ path);
    const sr = 44100;
    const ctx = new OfflineAudioContext(2, sr * 60, sr);
    // Every note is made of oscillators: note when each one starts.
    const starts: number[] = [];
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (when = 0) {
      starts.push(when);
      return start.call(this, when);
    };
    // The music's clock starts a tenth of a second in (music.ts: t0).
    const t0 = ctx.currentTime + 0.1;
    const player = music.startPlayer(ctx, ctx.destination, 'open', 1);
    for (let t = 0; t < 59.9; t += 0.25) {
      void ctx.suspend(t).then(() => {
        player.book(1.5);
        void ctx.resume();
      });
    }
    await ctx.startRendering();
    OscillatorNode.prototype.start = start;
    const eighth = 30 / music.PULSE_BPM;
    // The tape's wobble and the murmur start at once; the notes come after.
    const noteStarts = starts.filter((when) => when > t0 + 0.01);
    return {
      notes: noteStarts.length,
      offGrid: noteStarts.filter((when) => Math.abs((when - t0) / eighth - Math.round((when - t0) / eighth)) * eighth > 0.001).length,
    };
  });
  expect(notes).toBeGreaterThan(400);
  expect(offGrid).toBe(0);
});
