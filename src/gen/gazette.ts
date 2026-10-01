// The morning Gazette, written from what the clerk actually did yesterday. Pure: the same day,
// the same yesterday and the same lines already printed give the same newspaper.
import { FIRST_UNIT } from '../content/cast';
import { CAPTION, countdown, HEADLINES, LIKENESS_FINED, ROBOT_STORY, SMALL_NOTICES, SPECIAL, THREAD, type WALL_STAMPS } from '../content/gazette';
import type { EndingId } from '../economy/endings';
import { RULEBOOK } from '../content/rulebook';
import { RULE_DAYS, type Decision } from '../rules/judge';
import type { RuleId } from '../rules/types';
import { listOf } from './letters';
import { freshLine } from './lines';
import type { Portrait } from './portrait';

/** One case from yesterday, as the Gazette's reporter heard it. */
export type CaseReport = {
  name: string;
  /** The photo on their form: the front page prints it. */
  face: Portrait;
  /** A Likeness unit. */
  unit: boolean;
  decision: Decision;
  /** The rules they broke, judged against the registry as it stood at the window. */
  broke: RuleId[];
  /** For a challenge: whether the court upheld it, and whose vouch went with them (and the face on file). */
  upheld?: boolean;
  removed?: string | null;
  removedFace?: Portrait | null;
};

/** Yesterday at Window 3: everyone stamped, in queue order, and everyone the clock sent home. */
export type Yesterday = { day: number; cases: CaseReport[]; sentHome: { name: string; face: Portrait }[] };

/** One face on the front page's photo of yesterday, stamped with how it left the window. */
export type WallEntry = { name: string; face: Portrait; stamp: keyof typeof WALL_STAMPS };

/**
 * The morning paper's front page: a headline about yesterday at Window 3, a photo of it (yesterday's
 * faces, each stamped as it left), one line of the week's running story and one small notice. The day's
 * new rule is not in it: it is a new page in the rulebook, with its reason at the foot.
 */
export type Gazette = {
  day: number;
  countdown: string;
  headline: string;
  /** The pool line the headline was made from: it is not printed again this run. */
  headlineLine: string;
  /** Day 2: the photo is the frame yesterday's unit lit up in, reprinted, instead of the faces. */
  robot: boolean;
  wall: WallEntry[];
  /** Under the photo: yesterday in figures, or who the frame is of. */
  caption: string;
  /** Whose face on the photo the headline is about, ringed as papers ring them; null when it is about no one. */
  subject: string | null;
  thread: string;
  small: string;
};

/**
 * The morning paper. `handedIn`: yesterday the clerk handed Likeness's letter to the supervisor, and this
 * morning Likeness has been fined for it, which leads the paper unless a unit was registered.
 */
export function writeGazette(day: number, yesterday: Yesterday | null, shown: readonly string[], { handedIn = false } = {}): Gazette {
  const thread = [handedIn ? LIKENESS_FINED.thread : '', THREAD[day] ?? ''].filter(Boolean).join(' ');
  const base = { day, countdown: countdown(day), thread, small: SMALL_NOTICES[day] ?? '' };
  // The morning Rule 2 comes in: day 1's unit, legal yesterday, was a home robot.
  if (day === RULE_DAYS.face) {
    const challenged = yesterday?.cases.some((c) => c.unit && c.decision === 'challenge') ?? false;
    const headline = challenged ? ROBOT_STORY.challenged : ROBOT_STORY.headline;
    const caption = ROBOT_STORY.caption.replace('{name}', FIRST_UNIT.name);
    return { ...base, headline, headlineLine: headline, robot: true, wall: [], caption, subject: FIRST_UNIT.name };
  }
  const { pool, name, rule, count } = story(yesterday);
  const fined = handedIn && pool !== 'unit';
  // A pool spent before the week is (a long week of one kind of story) says one of its own lines again
  // rather than borrow another's: a "clean" line after a fake got in would be news that is not true.
  const lines = HEADLINES[pool];
  const line = fined ? LIKENESS_FINED.headline : (freshLine(lines, shown, day) ?? lines[day % lines.length]);
  const headline = line
    .replaceAll('{NAME}', name.toUpperCase())
    .replaceAll('{RULE}', rule ? String(RULEBOOK[rule].number) : '')
    .replaceAll('{COUNT}', String(count));
  return {
    ...base, headline, headlineLine: line, robot: false,
    wall: yesterday ? wall(yesterday) : [],
    caption: yesterday ? caption(yesterday) : CAPTION.none,
    subject: name && !fined ? name : null,
  };
}

/** Yesterday's faces as they left the window, a voucher removed with someone right after them, and then whoever was sent home. */
function wall(y: Yesterday): WallEntry[] {
  const stamped = y.cases.flatMap((c): WallEntry[] => {
    const stamp = c.decision === 'accept' ? 'registered' : c.upheld ? 'refused' : 'court';
    const removed = c.removed && c.removedFace ? [{ name: c.removed, face: c.removedFace, stamp: 'removed' as const }] : [];
    return [{ name: c.name, face: c.face, stamp }, ...removed];
  });
  return [...stamped, ...y.sentHome.map((h) => ({ ...h, stamp: 'home' as const }))];
}

/** Yesterday in figures: everyone registered (by the stamp or by the court), everyone refused, anyone sent home. */
function caption(y: Yesterday): string {
  const registered = y.cases.filter((c) => c.decision === 'accept' || !c.upheld).length;
  const refused = y.cases.filter((c) => c.decision === 'challenge' && c.upheld).length;
  const figures = CAPTION.figures.replace('{day}', String(y.day)).replace('{registered}', String(registered)).replace('{refused}', String(refused));
  return y.sentHome.length > 0 ? figures + CAPTION.home.replace('{home}', String(y.sentHome.length)) : figures;
}

/** Everyone registered this week, and how, as the special edition counts them. */
export type WeekInNumbers = {
  /** Registered this week, by the clerk's stamp or by the court, in order. */
  registered: readonly { name: string; day: number; unit: boolean; by: 'stamp' | 'court' }[];
  challenged: number;
  upheld: number;
  /** The day Pat was first registered, if Pat was. */
  patDay: number | null;
  /** The day of each of Pat's visits this week, first to last. */
  patDays: readonly number[];
};

export type Special = { masthead: string; headline: string; report: string[]; small: string; caption: string };

/**
 * The Gazette's last edition, beside the letter at the end of every week that reaches six o'clock on Humanity Day:
 * the aftermath of the first hour, and the week in numbers. The price is not in it: the hall's board told it.
 */
export function writeSpecial(ending: Exclude<EndingId, 'fired'>, w: WeekInNumbers): Special {
  const fill = (line: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), line);
  const units = w.registered.filter((r) => r.unit).map((r) => fill(r.by === 'court' ? SPECIAL.unitByCourt : SPECIAL.unit, { name: r.name, day: r.day }));
  const attempt = w.patDay === null ? -1 : w.patDays.indexOf(w.patDay);
  const report = [
    fill(SPECIAL.week, { registered: w.registered.length, challenged: w.challenged, upheld: w.upheld }),
    units.length === 0 ? SPECIAL.noUnits : fill(SPECIAL.units, { units: listOf(units) }),
    ...(attempt >= 0 ? [fill(SPECIAL.pat, { day: w.patDay!, attempt: SPECIAL.attempts[attempt] })] : []),
  ];
  return {
    masthead: SPECIAL.masthead,
    headline: SPECIAL.headline,
    report,
    small: SPECIAL.small,
    caption: SPECIAL.captions[ending],
  };
}

/**
 * The most newsworthy thing that happened: a unit registered, then a fake, then a fake the court
 * registered (a unit first), then a human in court, and so on. A challenge the
 * jury dismissed registers whoever it was about; by morning the court has risen, so the paper can say
 * so, and says it of the court: the clerk who challenged was right.
 */
function story(y: Yesterday | null): { pool: keyof typeof HEADLINES; name: string; rule: RuleId | null; count: number } {
  if (!y) return { pool: 'none', name: '', rule: null, count: 0 };
  const notAPersonFirst = (a: CaseReport, b: CaseReport) => Number(b.unit) - Number(a.unit);
  const registeredFakes = y.cases.filter((c) => c.decision === 'accept' && c.broke.length > 0).sort(notAPersonFirst);
  const unit = registeredFakes.find((c) => c.unit);
  if (unit) return { pool: 'unit', name: unit.name, rule: unit.broke[0], count: 0 };
  if (registeredFakes.length > 0) return { pool: 'fake', name: registeredFakes[0].name, rule: registeredFakes[0].broke[0], count: 0 };
  const missed = y.cases.filter((c) => c.decision === 'challenge' && !c.upheld && c.broke.length > 0).sort(notAPersonFirst)[0];
  if (missed) return { pool: 'court', name: missed.name, rule: missed.broke[0], count: 0 };
  const dismissed = y.cases.filter((c) => c.decision === 'challenge' && !c.upheld);
  const human = dismissed.find((c) => c.broke.length === 0);
  if (human) return { pool: 'human', name: human.name, rule: null, count: 0 };
  if (y.sentHome.length > 0) return { pool: 'timeUp', name: '', rule: null, count: y.sentHome.length };
  return { pool: 'clean', name: '', rule: null, count: y.cases.filter((c) => c.decision === 'accept').length };
}
