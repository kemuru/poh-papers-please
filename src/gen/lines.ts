// Lines from the content pools are said once a run: memos, court notes and the Gazette's items.
// Pure: which line comes out depends only on the pool, where to start, and what has been shown.

/** The first line of the pool not shown yet this run, starting from `from`; null once the pool is spent. */
export function freshLine(pool: readonly string[], shown: readonly string[], from: number): string | null {
  const seen = new Set(shown);
  for (let k = 0; k < pool.length; k++) {
    const line = pool[(((from + k) % pool.length) + pool.length) % pool.length];
    if (!seen.has(line)) return line;
  }
  return null;
}
