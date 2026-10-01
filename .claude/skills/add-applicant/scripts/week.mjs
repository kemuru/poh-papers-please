// The week's ratios over the 20 seeds the tests use, and where one cast member turns up.
// Usage: node .claude/skills/add-applicant/scripts/week.mjs [castId]
import { createServer } from 'vite';

const SEEDS = Array.from({ length: 20 }, (_, i) => i + 1);

const vite = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'silent' });
try {
  const { generateWeek, DAYS } = await vite.ssrLoadModule('/src/gen/day.ts');
  const weeks = SEEDS.map((seed) => generateWeek(seed));
  const valid = (a) => a.planted.length === 0;
  const pct = (n) => `${Math.round(n * 100)}%`;

  console.log('Valid share by day, lowest to highest over 20 seeds (target 65-75%; day 1: 67%, 4 of 6; day 7: the six before the clerk):');
  DAYS.forEach((_, d) => {
    // The clerk's own renewal ends Humanity Day, and is not the public's queue (src/gen/day.test.ts).
    const queue = (week) => week[d].filter((a) => a.cast !== 'clerk');
    const shares = weeks.map((week) => queue(week).filter(valid).length / queue(week).length);
    console.log(`  day ${d + 1}: ${pct(Math.min(...shares))} to ${pct(Math.max(...shares))}`);
  });

  const cast = weeks.flat(2).filter((a) => a.cast !== null);
  const share = cast.filter(valid).length / cast.length;
  console.log(`\nCast appearances valid: ${cast.filter(valid).length} of ${cast.length} (${pct(share)}; design: roughly half, test floor 40%)`);
  console.log('  if one more invalid appearance a week:', pct(cast.filter(valid).length / (cast.length + SEEDS.length)));
  console.log('  if one more valid appearance a week:  ', pct((cast.filter(valid).length + SEEDS.length) / (cast.length + SEEDS.length)));

  console.log('\nPer cast member, per week on average (invalid appearances and the rules planted):');
  for (const id of [...new Set(cast.map((a) => a.cast))].sort()) {
    const mine = weeks.flatMap((week) => week.flatMap((queue, d) => queue.filter((a) => a.cast === id).map((a) => ({ a, day: d + 1 }))));
    const days = [...new Set(mine.map((m) => m.day))].sort().join(',');
    const rules = [...new Set(mine.flatMap((m) => m.a.planted.map((p) => p.rule)))].join(', ') || 'none';
    const invalid = mine.filter((m) => !valid(m.a)).length;
    console.log(`  ${id}: ${(mine.length / SEEDS.length).toFixed(1)} a week, days ${days}, invalid ${invalid} of ${mine.length}, rules: ${rules}`);
  }

  const id = process.argv[2];
  if (id) {
    const found = [];
    for (let seed = 1; seed <= 50 && found.length < 5; seed++) {
      generateWeek(seed).forEach((queue, d) =>
        queue.forEach((a, i) => a.cast === id && found.push(`/?seed=${seed}&day=${d + 1}, place ${i + 1} of ${queue.length}`)),
      );
    }
    console.log(`\n${id} at the window:`, found.length ? `\n  ${found.slice(0, 5).join('\n  ')}` : 'not in seeds 1 to 50: the generator does not bring them in');
  }
} finally {
  await vite.close();
}
