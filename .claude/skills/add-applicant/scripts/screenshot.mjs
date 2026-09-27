// Screenshots one cast member at the window, their citation if they are invalid, and the portrait lab.
// Usage: node .claude/skills/add-applicant/scripts/screenshot.mjs <castId> [outDir]
// Starts its own dev server on a free port, so it never tests another worktree's server on 5175.
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { createServer } from 'vite';

const id = process.argv[2];
if (!id) throw new Error('Usage: screenshot.mjs <castId> [outDir]');
const out = process.argv[3] ?? `notes/evidence/applicants/${id}`;
mkdirSync(out, { recursive: true });

const vite = await createServer({ server: { port: 5190, strictPort: false }, logLevel: 'error' });
await vite.listen();
const browser = await chromium.launch();
try {
  // The earliest place in any queue of seeds 1 to 50, so the fewest stamps come first.
  const { generateWeek } = await vite.ssrLoadModule('/src/gen/day.ts');
  let at = null;
  for (let seed = 1; seed <= 50; seed++) {
    generateWeek(seed).forEach((queue, d) => {
      const i = queue.findIndex((a) => a.cast === id);
      if (i >= 0 && (!at || i < at.i)) at = { seed, day: d + 1, i, invalid: queue[i].planted.length > 0 };
    });
  }
  if (!at) throw new Error(`${id} is not in any queue of seeds 1 to 50: the generator does not bring them in`);

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const game = () => page.evaluate(() => window.__game);
  const shot = (name) => page.screenshot({ path: `${out}/${name}`, fullPage: true, animations: 'disabled' });
  const until = async (test) => {
    for (let tries = 0; tries < 100 && !test(await game()); tries++) await page.waitForTimeout(50);
  };

  await page.goto(`${vite.resolvedUrls.local[0]}?seed=${at.seed}&day=${at.day}`);
  await page.getByRole('button', { name: /Open the window/ }).click();
  for (let n = 1; n <= at.i + 1; n++) {
    await page.getByRole('button', { name: 'Call next applicant' }).click();
    await until((g) => g.called === n);
    if (n === at.i + 1) break;
    // Everyone before them is stamped by the rulebook, so no warning or citation is on the desk.
    const valid = (await game()).queue[n - 1].planted.length === 0;
    await page.getByRole('button', { name: valid ? 'Accept' : 'Challenge' }).click();
    await until((g) => g.decided.length === n);
  }
  await page.waitForTimeout(1500); // the papers slide across the counter
  await shot('desk.png');
  if (at.invalid) {
    await page.getByRole('button', { name: 'Accept' }).click();
    await page.getByTestId('citation').waitFor();
    await page.waitForTimeout(1500); // the slip prints
    await shot('citation.png');
  }

  await page.goto(`${vite.resolvedUrls.local[0]}?portraits`);
  await page.locator('main').screenshot({ path: `${out}/lab.png`, animations: 'disabled' });

  console.log(`${id}: /?seed=${at.seed}&day=${at.day}, place ${at.i + 1}${at.invalid ? ', invalid' : ', valid'}`);
  console.log(`Wrote ${out}/desk.png${at.invalid ? `, ${out}/citation.png` : ''} and ${out}/lab.png`);
  if (errors.length) throw new Error(`Page errors:\n${errors.join('\n')}`);
} finally {
  await browser.close();
  await vite.close();
}
