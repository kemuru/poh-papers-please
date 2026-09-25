import { APPLICANT_CONTENT, PHRASE_VARIANTS } from '../content/dayOne';
import { GARY } from '../content/portraits';
import type { Applicant, Violation } from '../model';
import { generatePortrait, type Portrait } from './portrait';
import { createRng } from './rng';

/** One day-one application. Truth is planted by construction, independently of judge(). */
export function generateApplicant(seed: number): Applicant {
  const rng = createRng(seed);
  const valid = rng.next() < 0.7;
  const costumed = rng.next() < 0.2;
  const portraitSeed = rng.int(0, 0xffffffff);
  const portrait: Portrait = costumed
    ? { ...GARY, face: { ...GARY.face }, accessories: valid ? [] : ['fake-mustache'] }
    : generatePortrait(portraitSeed);
  const character = valid ? APPLICANT_CONTENT.dave : APPLICANT_CONTENT.gary;
  const name = costumed
    ? character.name
    : `${rng.pick(APPLICANT_CONTENT.firstNames)} ${rng.pick(APPLICANT_CONTENT.lastNames)}`;
  const transcript = valid
    ? rng.pick(PHRASE_VARIANTS.valid)
    : rng.pick([PHRASE_VARIANTS.typo, PHRASE_VARIANTS.missing, PHRASE_VARIANTS.extra, PHRASE_VARIANTS.silence]);
  const planted: Violation[] = valid ? [] : ['day-1-phrase'];

  return {
    id: `H1-${seed >>> 0}`,
    name,
    address: `${rng.int(1, 99)} ${rng.pick(APPLICANT_CONTENT.streets)}`,
    birthYear: rng.int(1940, 2004),
    portrait,
    remark: rng.pick(costumed ? character.remarks : APPLICANT_CONTENT.remarks),
    video: {
      frames: [
        { portrait, pose: { eyes: 'open', mouth: 'closed' } },
        { portrait, pose: { eyes: 'open', mouth: transcript ? 'open' : 'closed' } },
        { portrait, pose: { eyes: 'closed', mouth: 'closed' } },
      ],
      transcript,
      blinked: true,
    },
    planted,
  };
}
