import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { planWeek } from '../gen/day';
import { judge, rulebookForDay } from '../rules/judge';
import { FRAME_TIMES } from './Documents';
import { CitationSlip } from './Slips';

// A Rule 0 fake registered by mistake comes back on its citation with its video: the papers have gone
// back through the slot, so the evidence is reprinted, the frame it names outlined. Nothing on the
// reprint can be pointed at: the desk's own frames are still in the DOM while they leave.

/** Each frame of a film: "frame", "frame pair", "frame named"; not "frame-picture". */
const FRAME = /<figure class="frame(?: [^"]*)?">/g;
/** The caption of each named frame. */
const NAMED = /<figure class="frame[^"]* named">[\s\S]*?<figcaption>([^<]*)<\/figcaption>/g;

describe('the citation slip', () => {
  it('a Rule 0 citation reprints the video, outlining the frame its evidence names, with nothing on it to point at', () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 10; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          const { violations } = judge(a, rulebookForDay(d + 1), week.seen[d][n]);
          if (violations.length === 0) return;
          const html = renderToStaticMarkup(
            <CitationSlip decided={{ decision: 'accept', outcome: { correct: false, violations }, citation: 'warning' }} caseNo={`${d + 1}-001`} video={a.video} />,
          );
          const where = `seed ${seed}, day ${d + 1}, ${a.name}`;
          const human = violations.find((v) => v.rule === 'human');
          if (!human) {
            expect(html, where).not.toContain('citation-film');
            return;
          }
          kinds.add(human.problem);
          expect(html.match(FRAME), where).toHaveLength(3);
          const named = [...html.matchAll(NAMED)].map((m) => m[1]);
          if (human.problem === 'machine' || human.problem === 'changes') expect(named, where).toEqual([`Frame ${human.frame} · ${FRAME_TIMES[human.frame - 1]}`]);
          else expect(named, where).toEqual([]);
          expect(html, where).not.toContain('data-inspect');
          expect(html, where).not.toContain('data-testid="frame-');
          expect(html, where).not.toContain('aria-label="Frame ');
        }),
      );
    }
    // Units on days 1, 2, 3 and 6, the Deepfake, the Cutout and the Agent.
    expect([...kinds].sort()).toEqual(['changes', 'generated', 'machine', 'picture']);
  }, 60_000);
});
