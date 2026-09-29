import { describe, expect, it } from 'vitest';
import { PHRASE_MISTAKES } from './content/applicants';
import { planWeek } from './gen/day';
import { drawPortrait } from './gen/drawPortrait';
import type { Portrait, Pose } from './gen/portrait';
import { framePoses, litFrames } from './rules/face';
import { judge, rulebookForDay } from './rules/judge';
import { PHRASE } from './rules/phrase';
import type { Applicant, Registry, RuleId } from './rules/types';

// acceptance.md, fair clue check: every planted violation shows as a difference in data the
// player can see, so every mistake is the player's fault, never the game's.
// A new rule without a clue here fails the typecheck.
const words = (text: string) => text.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean);
/** The words the rulebook prints in bold: the phrase without its small words. */
const BOLD = words(PHRASE).filter((word) => !['that', 'a', 'and', 'already', 'in', 'this'].includes(word));
/** Every bold word turns up in the transcript, in the rulebook's order ("I'm" being "I am"). */
const saysBoldWords = (transcript: string) => {
  let next = 0;
  for (const word of words(transcript).flatMap((w) => (w === "i'm" ? ['i', 'am'] : [w]))) if (word === BOLD[next]) next++;
  return next === BOLD.length;
};
/** The face alone, as drawn: hair, beard, clothes and anything worn or held taken off. */
const bare = (p: Portrait, pose: Partial<Pose>) =>
  drawPortrait({ ...p, hair: 'bald', facialHair: 'none', outfit: 'tshirt', outfitColor: 'grey', accessories: [], board: undefined }, pose);
const drawn = new Map<string, string>();
const pixels = (p: Portrait, mirrored = false, pose: Partial<Pose> = {}) => {
  const key = `${mirrored}${JSON.stringify(pose)}${JSON.stringify(p)}`;
  if (!drawn.has(key)) {
    const { width, height, pixels } = bare(p, pose);
    const rows = Array.from({ length: height }, (_, y) => pixels.slice(y * width, (y + 1) * width));
    drawn.set(key, rows.map((row) => (mirrored ? [...row].reverse() : row).join(',')).join(';'));
  }
  return drawn.get(key)!;
};
/** The face in each of the three frames, as the video strip draws them. */
const frames = (a: Applicant) => [1, 2, 3].map((n) => (a.video.glitch?.frame === n ? a.video.glitch.face : a.video.face));
/** The frames drawn with a light between the brows: each frame in its pose, as the video strip draws it, with and without the lamp. */
const drawnLit = (a: Applicant) => {
  const faces = frames(a);
  const poses = framePoses(a.video);
  return [1, 2, 3].filter((n) => pixels({ ...faces[n - 1], lamp: a.video.lamp }, false, poses[n - 1]) !== pixels(faces[n - 1], false, poses[n - 1]));
};
/** The characters of an address the form shows: 0x3F9A…C21E. */
const shown = (address: string) => (address.slice(0, 6) + address.slice(-4)).toUpperCase();

const CLUES: Record<RuleId, (a: Applicant, registry: Registry) => boolean> = {
  // A word printed in bold in the rulebook is missing from the transcript under the video strip.
  phrase: (a) => !saysBoldWords(a.video.transcript),
  // The photo, as printed on the form (the right way round or not), is not the face drawn in a frame; or a frame
  // with the eyes shut is drawn with a light between the brows; or a frame's face is not the face in the others.
  face: (a) => {
    const faces = frames(a);
    const lamp = drawnLit(a).length > 0;
    const changes = new Set(faces.map((face) => pixels(face))).size > 1;
    return lamp || changes || faces.some((face) => pixels(a.photo, a.mirrored) !== pixels(face));
  },
  // The enlarged sign shows no address, a shortened one, or two of the characters the form shows differ.
  sign: (a) => {
    const sign = a.video.sign;
    if (!sign || sign.kind === 'qr' || sign.text.length !== (a.wallet ?? '').length) return true;
    return [...shown(sign.text)].filter((c, i) => c !== shown(a.wallet!)[i]).length >= 2;
  },
  // The voucher on the form is missing, is the applicant, or the registry lookup of that name shows nobody, or someone vouching for another.
  vouch: (a, registry) => {
    if (!a.voucher || a.voucher === a.name) return true;
    const on = registry.find((r) => r.name === a.voucher);
    return !on || (on.vouching !== null && on.vouching !== a.name);
  },
  // The registry lookup of the face in the video shows it on file, and no twin with that face stands beside them in the frames.
  duplicate: (a, registry) => {
    const face = pixels(a.video.face);
    const onFile = registry.filter((r) => pixels(r.face) === face);
    const twin = a.video.with && pixels(a.video.with) === face ? 1 : 0;
    return onFile.length > twin;
  },
  // The year printed on the form is not a year from 1900 to 2026; or no frame is drawn with closed eyes (a picture
  // held up draws all three the same, no mouth moving, no blink); or a generator's mark is in the corner.
  living: (a) => {
    const year = a.birthYear;
    const blinks = a.video.nervous || (a.video.blinked && !a.video.still);
    const marked = a.video.generated === true && pixels({ ...a.video.face, mark: true }) !== pixels(a.video.face);
    return typeof year !== 'number' || year < 1900 || year > 2026 || !blinks || marked;
  },
};

// Ten seeded weeks, each applicant with the registry they would find at the window under correct play.
const applicants = Array.from({ length: 10 }, (_, i) => planWeek(i + 1)).flatMap((week) =>
  week.queues.flatMap((queue, i) => queue.map((a, n) => ({ ...a, day: i + 1, registry: week.seen[i][n] }))),
);

describe('fair clue check', () => {
  it('shows every planted violation in the UI data', () => {
    for (const a of applicants) {
      for (const p of a.planted) expect(CLUES[p.rule](a, a.registry), `${a.name}: ${p.mistake}`).toBe(true);
    }
  });

  it('shows no clue when nothing was planted', () => {
    // Under the rules in force that day: before the sign rule, nobody holds up a sign.
    for (const a of applicants.filter((x) => x.planted.length === 0)) {
      for (const rule of rulebookForDay(a.day)) expect(CLUES[rule](a, a.registry), `${a.name}, day ${a.day}: ${rule}`).toBe(false);
    }
  });

  it("lights a unit's lamp in exactly the frames litFrames names, the frames Rule 2 and Inspect read", () => {
    const units = applicants.filter((a) => a.video.lamp);
    expect(units.length).toBeGreaterThanOrEqual(40);
    for (const a of units) expect(drawnLit(a), a.name).toEqual(litFrames(a.video));
    // The day 2 unit shuts its eyes twice: lit at 00:01 and at 00:05, dark between.
    expect(new Set(units.map((a) => drawnLit(a).join(',')))).toEqual(new Set(['3', '1,3']));
    for (const a of applicants.filter((x) => !x.video.lamp)) expect(litFrames(a.video), a.name).toEqual([]);
  });

  it('gives a clue for every line the generator can plant', () => {
    const [template] = applicants;
    for (const line of Object.values(PHRASE_MISTAKES).flat()) {
      expect(CLUES.phrase({ ...template, video: { ...template.video, transcript: line } }, []), line).toBe(true);
    }
  });

  it('highlights at least one word in every citation', () => {
    for (const a of applicants) {
      for (const v of judge(a, rulebookForDay(a.day), a.registry).violations) {
        if (v.rule === 'phrase') expect([...v.heard, ...v.expected].some((m) => !m.ok)).toBe(true);
      }
    }
  });

  it('shows a clue for every kind of fault the generator plants, over 300 weeks', () => {
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 300; seed++) {
      const week = planWeek(seed);
      week.queues.forEach((queue, d) =>
        queue.forEach((a, n) => {
          for (const p of a.planted) {
            kinds.add(`${p.rule}:${p.mistake}`);
            expect(CLUES[p.rule](a, week.seen[d][n]), `seed ${seed}, ${a.name}: ${p.mistake}`).toBe(true);
          }
        }),
      );
    }
    // Every kind the generator can plant came up, except Socrates's, who never comes on day 6.
    expect([...kinds].sort()).toEqual([
      'duplicate:back-in-a-hat', 'duplicate:clone', 'duplicate:farm', 'duplicate:unit',
      'face:another-face', 'face:deepfake', 'face:filter', 'face:machine', 'face:mirrored',
      'living:generated', 'living:printed', 'living:version', 'living:year-typo',
      'phrase:missing-words', 'phrase:quiet-word', 'phrase:silence', 'phrase:wrong-word',
      'sign:no-sign', 'sign:qr', 'sign:two-wrong', 'sign:wrong-address',
      'vouch:busy', 'vouch:company', 'vouch:unregistered',
    ]);
  }, 60_000);
});
