import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import {
  CAST_PORTRAITS,
  CATALOGUE_GENTLEMAN,
  CLERK_PORTRAIT,
  CLONE_PORTRAIT,
  DEEPFAKE_SLIP,
  figureLamp,
  FIRST_APPLICANT_PORTRAIT,
  INFLUENCER_PHOTO,
  SPECIMEN,
  TWIN_TWO,
  UNIT_FACES,
  UNIT_ON_FILE,
} from '../content/portraits';
import { RULEBOOK } from '../content/rulebook';
import { planWeek } from '../gen/day';
import { drawPortrait, PORTRAIT_WIDTH, type PixelImage } from '../gen/drawPortrait';
import { LAMP_SIZES, type Portrait } from '../gen/portrait';
import { LAMPS, PROPS } from '../gen/portraitParts';
import { sameFace } from '../rules/face';
import { rulebookForDay } from '../rules/judge';
import type { Applicant, RuleId } from '../rules/types';
import { FIGURE_CROP, RulebookCard } from './Documents';
import { PixelPortrait } from './PixelPortrait';

// Rule 0's page shows what its lamp check means: Fig. 0, one specimen face with its eyes shut, without
// and with a light as big as the day's unit's. The figure shows what to look for, never who.

const inCrop = (x: number, y: number) =>
  x >= FIGURE_CROP.x && x < FIGURE_CROP.x + FIGURE_CROP.width && y >= FIGURE_CROP.y && y < FIGURE_CROP.y + FIGURE_CROP.height;

/** Every pixel where two drawings of the same size differ. */
const differences = (a: PixelImage, b: PixelImage) =>
  a.pixels.flatMap((pixel, i) => (pixel === b.pixels[i] ? [] : [{ x: i % PORTRAIT_WIDTH, y: Math.floor(i / PORTRAIT_WIDTH) }]));

/** The part of a drawing Fig. 0 prints. */
const cropped = (img: PixelImage) => {
  const out: (string | null)[] = [];
  for (let y = FIGURE_CROP.y; y < FIGURE_CROP.y + FIGURE_CROP.height; y++)
    for (let x = FIGURE_CROP.x; x < FIGURE_CROP.x + FIGURE_CROP.width; x++) out.push(img.pixels[y * img.width + x]);
  return out.join(',');
};

const LAMP_COLOURS: readonly string[] = [PROPS.lamp.core, PROPS.lamp.ring, PROPS.lamp.spill];

/** Every portrait an applicant shows the clerk: the photo, the face in the video, a glitch's other face, a twin beside them. */
const shown = (a: Applicant) => [a.photo, a.video.face, a.video.glitch?.face, a.video.with].filter((p): p is Portrait => p !== undefined);

/** How many pixels of one colour an SVG from PixelPortrait paints: each run is "M x y h n v1 h -n z". */
const painted = (svg: string, colour: string) => {
  const d = new RegExp(`<path fill="${colour}" d="([^"]*)"`).exec(svg)?.[1] ?? '';
  return [...d.matchAll(/M\d+ \d+h(\d+)/g)].reduce((sum, m) => sum + Number(m[1]), 0);
};

describe("Rule 0's Fig. 0", () => {
  it("lights Fig. 0-2 as the day's unit is lit, and with the smallest lamp on a day without one", () => {
    expect([1, 2, 3, 4, 5, 6, 7].map(figureLamp)).toEqual(['bloom', 'glow', 'glow', 'small', 'small', 'small', 'slit']);
  });

  it('differs between its plates by the lamp alone, all of it inside the crop, whatever the size', () => {
    const dark = drawPortrait(SPECIMEN, { eyes: 'closed' });
    expect(dark.pixels.filter((p) => p !== null && LAMP_COLOURS.includes(p))).toEqual([]);

    // The eyes are shut on both plates: the open-eyed face is another picture, and the difference is in the crop.
    const open = differences(drawPortrait(SPECIMEN), dark);
    expect(open.length).toBeGreaterThan(0);
    expect(open.filter(({ x, y }) => !inCrop(x, y))).toEqual([]);

    const counts: Record<string, number> = {};
    for (const lamp of LAMP_SIZES) {
      const lit = drawPortrait({ ...SPECIMEN, lamp }, { eyes: 'closed' });
      const changed = differences(lit, dark);
      expect(changed.filter(({ x, y }) => !inCrop(x, y)), lamp).toEqual([]);
      const xs = changed.map((p) => p.x);
      const ys = changed.map((p) => p.y);
      // One lamp, in one 8×6 box: the light between the brows, nothing anywhere else.
      expect(Math.max(...xs) - Math.min(...xs) + 1, lamp).toBeLessThanOrEqual(8);
      expect(Math.max(...ys) - Math.min(...ys) + 1, lamp).toBeLessThanOrEqual(6);
      expect(lit.pixels, lamp).toContain(PROPS.lamp.core);
      counts[lamp] = changed.length;
    }
    expect(counts).toEqual({ bloom: 36, glow: 36, small: 8, slit: 4 });
  });

  // The first specimen proposed was Brenda's face: the valid trap who is so normal she is suspicious,
  // on the ✗ plate. The specimen must be nobody's.
  it('is nobody', () => {
    const cast: Portrait[] = [
      ...Object.values(CAST_PORTRAITS),
      ...UNIT_FACES,
      UNIT_ON_FILE,
      CATALOGUE_GENTLEMAN,
      CLERK_PORTRAIT,
      CLONE_PORTRAIT,
      INFLUENCER_PHOTO,
      DEEPFAKE_SLIP,
      TWIN_TWO,
      FIRST_APPLICANT_PORTRAIT,
    ];
    const queued: Portrait[] = [];
    // The registry's faces too: from day 5 the face search shows them.
    const onFile: Portrait[] = [];
    for (let seed = 1; seed <= 50; seed++) {
      const week = planWeek(seed);
      for (const queue of week.queues) for (const a of queue) queued.push(...shown(a));
      const names = new Set<string>();
      for (const r of week.mornings.flat()) if (!names.has(r.name) && names.add(r.name)) onFile.push(r.face);
    }
    expect(onFile.length).toBeGreaterThan(1000);

    const plate = cropped(drawPortrait(SPECIMEN, { eyes: 'closed' }));
    let checked = 0;
    for (const face of [...cast, ...queued, ...onFile]) {
      expect(sameFace(face, SPECIMEN), JSON.stringify(face.face)).toBe(false);
      // Drawn as Fig. 0 draws it: eyes shut, nothing held up, no generator's mark and no lamp.
      const shut = drawPortrait({ ...face, board: undefined, mark: undefined, lamp: undefined }, { eyes: 'closed' });
      expect(cropped(shut) === plate, JSON.stringify(face)).toBe(false);
      checked++;
    }
    expect(checked).toBeGreaterThan(5000);
  }, 60_000);

  // Hair is not the face (sameFace leaves it out), but it is most of what the plate shows. The specimen had
  // short dark-brown hair, and so has every week's day 2 unit: on day 2 the only applicant who looked like
  // Fig. 0 was the fake. Both plates wear the hair, but a clerk who thinks "that is the man in Fig. 0"
  // must not be pointed at anyone by it.
  it("wears no fake's hair: no unit or scripted fake shares it, and a look-alike is no likelier a fake than anyone", () => {
    const look = (p: Portrait) => `${p.hair} ${p.hairColor}`;
    const specimen = look(SPECIMEN);
    for (const unit of [...UNIT_FACES, UNIT_ON_FILE]) expect(look(unit), JSON.stringify(unit.face)).not.toBe(specimen);

    let everyone = 0;
    let fakes = 0;
    let alike = 0;
    let alikeFakes = 0;
    for (let seed = 1; seed <= 50; seed++)
      for (const [d, queue] of planWeek(seed).queues.entries())
        for (const a of queue) {
          const fake = a.planted.length > 0;
          everyone++;
          if (fake) fakes++;
          if (!shown(a).some((p) => look(p) === specimen)) continue;
          alike++;
          if (!fake) continue;
          alikeFakes++;
          // A scripted fake comes every week with the same look, so the look would point at it every week.
          expect(a.cast, `${a.name}, seed ${seed}, day ${d + 1}`).toBeNull();
        }
    expect(alike).toBeGreaterThan(20);
    expect(alikeFakes / alike).toBeLessThanOrEqual(fakes / everyone);
  }, 60_000);

  it("is printed on Rule 0's page only, inside its first check and its inspect target, dark and then lit as the day's unit", () => {
    for (const day of [1, 2, 6]) {
      const html = renderToStaticMarkup(<RulebookCard rulebook={rulebookForDay(day)} day={day} page="human" onPage={() => {}} />);
      expect(html.match(/class="rule-figure"/g), `day ${day}`).toHaveLength(1);

      const page = html.slice(html.indexOf('data-inspect="rule-human"'), html.indexOf('data-inspect="rule-phrase"'));
      const first = page.slice(page.indexOf('<li>'), page.indexOf('</li>') + '</li>'.length);
      const figure = RULEBOOK.human.figure!;
      expect(first).toContain(RULEBOOK.human.checks![0]);
      expect(first).toContain(`<figure class="rule-figure" role="img" aria-label="${figure.label}">`);
      expect(first.match(/viewBox="9 7 22 22"/g)).toHaveLength(2);
      expect(first).toContain('rule-mark-ok');
      expect(first).toContain('rule-mark-not');

      // What the stills draw: the specimen with its eyes shut, as the renderer draws it on the film's grey,
      // dark on ✓ and lit on ✗ with the day's lamp. Not the eyes open, not another face, not another lamp.
      const stills = first.match(/<svg viewBox="9 7 22 22"[\s\S]*?<\/svg>/g)!;
      const still = (portrait: Portrait) =>
        renderToStaticMarkup(<PixelPortrait portrait={portrait} eyes="closed" scale={2} background="#8f9b9e" crop={FIGURE_CROP} />);
      const lamp = figureLamp(day);
      expect(stills, `day ${day}`).toEqual([still(SPECIMEN), still({ ...SPECIMEN, lamp })]);
      // Said without the specimen: no light on ✓; on ✗, the lamp's core and ring, as many pixels as the day's lamp has.
      const [dark, lit] = stills;
      expect(painted(dark, PROPS.lamp.core) + painted(dark, PROPS.lamp.ring), `day ${day}`).toBe(0);
      const art = LAMPS[lamp].art.join('');
      expect(painted(lit, PROPS.lamp.core), `day ${day}`).toBe(art.split('c').length - 1);
      expect(painted(lit, PROPS.lamp.ring), `day ${day}`).toBe(art.split('r').length - 1);
    }

    const others = (Object.keys(RULEBOOK) as RuleId[]).filter((id) => id !== 'human');
    expect(others.map((id) => RULEBOOK[id].figure)).toEqual(others.map(() => undefined));
  });
});
