import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { planWeek } from '../gen/day';
import { ProfileCard, VideoStrip } from './Documents';
import { RegistryLookup } from './Registry';

// acceptance.md, always true: no label on the papers says what the rulebook would conclude. The
// clerk has to find it in the evidence: "Blink detected: No" was such a label, and is gone.
const RESULTS = /blink|valid|fake|genuine|forged|verified|mismatch|duplicate|deceased|sybil detected|match(es)?\b|passed|failed|not human/i;

/**
 * The text a clerk reads on the papers, less what the applicant wrote and said: their name,
 * address and words are evidence, not labels ("174 Duplicate Close" is a street).
 */
const labels = (html: string, own: string[]) =>
  own.reduce((text, value) => text.split(value).join(' '), html.replace(/<[^>]*>/g, ' ').replace(/&[a-z#0-9]+;/g, ' '));

describe('the papers on the desk', () => {
  it('state no rule result: the form, the video printout and the registry’s answers only show evidence', () => {
    let checked = 0;
    for (let seed = 1; seed <= 10; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          const html = [
            renderToStaticMarkup(<ProfileCard applicant={a} caseNo="1-001" />),
            renderToStaticMarkup(<VideoStrip video={a.video} />),
            ...(d >= 3 && a.voucher
              ? [
                  renderToStaticMarkup(<RegistryLookup registry={week.seen[d][n]} voucher={a.voucher} face={a.video.face} lookup={{ by: 'name', name: a.voucher }} onLookup={() => {}} />),
                  renderToStaticMarkup(<RegistryLookup registry={week.seen[d][n]} voucher={a.voucher} face={a.video.face} lookup={{ by: 'face' }} onLookup={() => {}} />),
                ]
              : []),
          ].join(' ');
          const text = labels(html, [a.video.transcript, a.name, a.address]);
          expect(text, `${a.name}, day ${d + 1}`).not.toMatch(RESULTS);
          checked++;
        }),
      );
    }
    // Ten weeks of 5, 7, 8, 8, 9, 10 and 7 (Humanity Day's six and the clerk).
    expect(checked).toBe(540);
  }, 60_000);

  it('shows the blink only as closed eyes in a frame', () => {
    const [first] = planWeek(1).queues[0];
    const html = renderToStaticMarkup(<VideoStrip video={first.video} />);
    expect(html).not.toMatch(/blink/i);
    expect(html.match(/<svg/g)).toHaveLength(3);
  });
});
