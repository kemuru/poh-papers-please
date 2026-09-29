// The morning Gazette, written from what the clerk actually did yesterday. Pure: the same day,
// the same yesterday and the same lines already printed give the same newspaper.
import { countdown, HEADLINES, LIKENESS_FINED, REPORT, RULE_NOTICES, SMALL_NOTICES, SPECIAL, THREAD } from '../content/gazette';
import type { EndingId } from '../economy/endings';
import { RULEBOOK } from '../content/rulebook';
import type { Decision } from '../rules/judge';
import type { RuleId } from '../rules/types';
import { listOf } from './letters';
import { freshLine } from './lines';

/** One case from yesterday, as the Gazette's reporter heard it. */
export type CaseReport = {
  name: string;
  /** A Likeness unit. */
  unit: boolean;
  decision: Decision;
  /** The rules they broke, judged against the registry as it stood at the window. */
  broke: RuleId[];
  /** For a challenge: whether the court upheld it, and whose vouch went with them. */
  upheld?: boolean;
  removed?: string | null;
};

export type Yesterday = { day: number; cases: CaseReport[]; unprocessed: number };

export type Gazette = {
  day: number;
  countdown: string;
  headline: string;
  /** The pool line the headline was made from: it is not printed again this run. */
  headlineLine: string;
  /** Yesterday's figures, and someone who was there. */
  report: string[];
  notice: string;
  thread: string;
  small: string;
};

/**
 * The morning paper. `handedIn`: yesterday the clerk handed Likeness's letter to the supervisor, and this
 * morning Likeness has been fined for it, which leads the paper unless a unit was registered.
 */
export function writeGazette(day: number, yesterday: Yesterday | null, shown: readonly string[], { handedIn = false } = {}): Gazette {
  const { pool, name, rule, count } = story(yesterday);
  const fined = handedIn && pool !== 'unit';
  const line = fined ? LIKENESS_FINED.headline : (freshLine(HEADLINES[pool], shown, day) ?? freshLine(HEADLINES.clean, shown, day) ?? HEADLINES.clean[0]);
  const headline = line
    .replaceAll('{NAME}', name.toUpperCase())
    .replaceAll('{RULE}', rule ? String(RULEBOOK[rule].number) : '')
    .replaceAll('{COUNT}', String(count));
  return {
    day,
    countdown: countdown(day),
    headline,
    headlineLine: line,
    report: yesterday ? report(yesterday) : [REPORT.none],
    notice: RULE_NOTICES[day] ?? '',
    thread: [handedIn ? LIKENESS_FINED.thread : '', THREAD[day] ?? ''].filter(Boolean).join(' '),
    small: SMALL_NOTICES[day] ?? '',
  };
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
  /** The clerk handed Likeness's letter in. */
  handedIn: boolean;
};

export type Special = { masthead: string; headline: string; report: string[]; likeness: string; small: string; caption: string };

/** The Gazette's last edition, beside the letter at the end of every week that reaches five o'clock on Humanity Day. */
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
    likeness: [SPECIAL.likeness, w.handedIn ? SPECIAL.apology : ''].filter(Boolean).join(' '),
    small: SPECIAL.price,
    caption: SPECIAL.captions[ending],
  };
}

/**
 * The most newsworthy thing that happened: a unit registered, then anything else that is not a person,
 * then a fake, then a fake the court registered, then a human in court, and so on. A challenge the
 * jury dismissed registers whoever it was about; by morning the court has risen, so the paper can say
 * so, and says it of the court: the clerk who challenged was right.
 */
function story(y: Yesterday | null): { pool: keyof typeof HEADLINES; name: string; rule: RuleId | null; count: number } {
  if (!y) return { pool: 'none', name: '', rule: null, count: 0 };
  const notAPersonFirst = (a: CaseReport, b: CaseReport) => Number(b.broke.includes('human')) - Number(a.broke.includes('human'));
  const registeredFakes = y.cases.filter((c) => c.decision === 'accept' && c.broke.length > 0).sort(notAPersonFirst);
  const unit = registeredFakes.find((c) => c.unit);
  if (unit) return { pool: 'unit', name: unit.name, rule: unit.broke[0], count: 0 };
  if (registeredFakes.length > 0) return { pool: 'fake', name: registeredFakes[0].name, rule: registeredFakes[0].broke[0], count: 0 };
  const missed = y.cases.filter((c) => c.decision === 'challenge' && !c.upheld && c.broke.length > 0).sort(notAPersonFirst)[0];
  if (missed) return { pool: 'court', name: missed.name, rule: missed.broke[0], count: 0 };
  const dismissed = y.cases.filter((c) => c.decision === 'challenge' && !c.upheld);
  const human = dismissed.find((c) => c.broke.length === 0);
  if (human) return { pool: 'human', name: human.name, rule: null, count: 0 };
  if (y.unprocessed > 0) return { pool: 'timeUp', name: '', rule: null, count: y.unprocessed };
  return { pool: 'clean', name: '', rule: null, count: y.cases.filter((c) => c.decision === 'accept').length };
}

function report(y: Yesterday): string[] {
  const fill = (line: string, values: Record<string, string | number>) =>
    Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), line);
  const registered = y.cases.filter((c) => c.decision === 'accept' || (c.decision === 'challenge' && !c.upheld));
  const challenged = y.cases.filter((c) => c.decision === 'challenge');
  const upheld = challenged.filter((c) => c.upheld);
  const lines = [fill(REPORT.figures, { day: y.day, registered: registered.length, challenged: challenged.length, upheld: upheld.length })];
  // Somebody by name: the last person registered, or else the last one refused.
  const welcomed = registered[registered.length - 1];
  const refused = upheld[upheld.length - 1];
  if (welcomed) lines.push(fill(REPORT.welcomed, { name: welcomed.name }));
  else if (refused) lines.push(fill(REPORT.refused, { name: refused.name }));
  const removal = upheld.find((c) => c.removed);
  if (removal) lines.push(fill(REPORT.removed, { voucher: removal.removed!, name: removal.name }));
  return lines;
}
