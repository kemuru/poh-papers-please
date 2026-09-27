// A week at Window 3: every day's queue, from one seed. The week is generated in one go so that
// nobody says the same thing twice and the regulars take turns. Nothing here depends on what the
// clerk decides, so a day's queue is the same however the days before it went.
import { GARY_DAYS, GARY_FORM, REGULARS, type RegularId } from '../content/cast';
import { GARY, GARY_DISGUISES } from '../content/portraits';
import { generateApplicant, type GeneratedApplicant } from './applicant';
import { createRng, type Rng } from './rng';

export type DayPlan = {
  applicants: number;
  /** How many of them break a rule: about 30%, as near as the queue's length allows. */
  fakes: number;
  /** How long the shift lasts, in real seconds. Null: no clock. */
  shiftSeconds: number | null;
};

/** The day table in notes/game-design.md. Day 1 is 3 valid out of 5: its tutorial needs a fake besides Gary. */
export const DAYS: readonly DayPlan[] = [
  { applicants: 5, fakes: 2, shiftSeconds: null },
  { applicants: 7, fakes: 2, shiftSeconds: 360 },
  { applicants: 8, fakes: 2, shiftSeconds: 360 },
  { applicants: 8, fakes: 2, shiftSeconds: 360 },
  { applicants: 9, fakes: 3, shiftSeconds: 360 },
  { applicants: 10, fakes: 3, shiftSeconds: 360 },
  { applicants: 6, fakes: 2, shiftSeconds: null },
];

export const LAST_DAY = DAYS.length;

const REGULAR_IDS = Object.keys(REGULARS) as RegularId[];

/** The week's queues, day 1 first. */
export function generateWeek(seed: number): GeneratedApplicant[][] {
  const rng = createRng(seed);
  // The cast's names and addresses are taken: no ordinary applicant lives at Brenda's.
  const used = new Set<string>([GARY_FORM.address, ...Object.values(REGULARS).flatMap((r) => [r.name, r.address])]);
  const appearances = new Map(REGULAR_IDS.map((id) => [id, 0]));
  // Each regular starts the week at a different line, then works through them in order.
  const start = new Map(REGULAR_IDS.map((id) => [id, rng.int(0, 99)]));

  return DAYS.map((plan, i) => {
    const day = i + 1;
    const gary = day <= GARY_DAYS.length ? [garyOn(day)] : [];
    // One or two regulars a day, whoever has been in least; two a day in the second half of the week.
    const count = day === 1 ? 1 : day >= 5 ? 2 : rng.int(1, 2);
    const regulars = shuffle(rng, REGULAR_IDS)
      .sort((a, b) => appearances.get(a)! - appearances.get(b)!)
      .slice(0, count)
      .map((id) => {
        const n = appearances.get(id)!;
        appearances.set(id, n + 1);
        return regular(id, start.get(id)! + n);
      });
    const fillIn = (fake: boolean) => generateApplicant(rng.int(0, 0xffffffff), { fake, day, used });
    const fakes = Array.from({ length: plan.fakes - gary.length }, () => fillIn(true));
    const valid = Array.from({ length: plan.applicants - plan.fakes - regulars.length }, () => fillIn(false));

    const queue = shuffle(rng, [...gary, ...regulars, ...fakes, ...valid]);
    if (day === 1) {
      // The very first applicant of the week is an ordinary person with nothing wrong.
      const first = queue.findIndex((a) => a.cast === null && a.planted.length === 0);
      [queue[0], queue[first]] = [queue[first], queue[0]];
    }
    return queue;
  });
}

/** One day's queue from the week's seed. */
export const generateDay = (seed: number, day: number): GeneratedApplicant[] => generateWeek(seed)[day - 1];

/** Gary in the day's disguise, getting the phrase wrong in the day's way. */
function garyOn(day: number): GeneratedApplicant {
  const { name, remark, video, mistake } = GARY_DAYS[day - 1];
  const photo = { ...GARY, ...GARY_DISGUISES[day - 1] };
  return {
    name,
    address: `${GARY_FORM.where}, ${GARY_FORM.address}`,
    birthYear: GARY_FORM.birthYear,
    photo,
    video: { face: photo, transcript: video, blinked: true },
    remark,
    planted: [{ rule: 'phrase', mistake }],
    cast: 'gary',
  };
}

/** A regular on their n-th line: always valid, never the same remark twice in a week. */
function regular(id: RegularId, n: number): GeneratedApplicant {
  const r = REGULARS[id];
  return {
    name: r.name,
    address: r.address,
    birthYear: r.birthYear,
    photo: r.portrait,
    video: { face: r.portrait, transcript: r.videos[n % r.videos.length], blinked: true },
    remark: r.remarks[n % r.remarks.length],
    planted: [],
    cast: id,
  };
}

function shuffle<T>(rng: Rng, items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = rng.int(0, i);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
