import { useEffect, useRef, useState, type AnimationEvent } from 'react';
import { STATEMENT_FOOTERS } from '../content/hall';
import { MENU } from '../content/menu';
import { EMPTY_COURT, ENDINGS } from '../content/verdicts';
import { PAY, payLines, type DayEnd, type PayLine } from '../economy/economy';
import { RULEBOOK } from '../content/rulebook';
import type { GeneratedApplicant } from '../gen/applicant';
import { generatePortrait } from '../gen/portrait';
import { appealFee, JURY_SIZES, type Round } from './court';
import { BUBBLES, COURT_SESSION, HUNCH_LINE, JUROR_NAMES } from '../content/court';
import { asPointed, evidenceLine, evidenceWords } from './evidence';
import { pick } from './Slips';
import type { Ruling } from './week';
import { PixelPortrait } from './PixelPortrait';
import { caseNumber } from './Shift';
import { thunk, tick } from './sound';

// The evening: the court hears the day's challenges, the accounts are read out, and at the
// end of the week (or sooner) a letter arrives.

/** Space or Enter moves on, unless a button has the focus and will do it anyway. */
function useKeyToContinue(onContinue: () => void) {
  const go = useRef(onContinue);
  go.current = onContinue;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key !== ' ' && e.key !== 'Enter') || e.repeat || (e.target as HTMLElement).closest?.('button, a, dialog')) return;
      e.preventDefault();
      go.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Plays `sound` once for each of `count` things as they appear, `gap` seconds apart. */
function useRhythm(count: number, delay: number, gap: number, sound: () => void) {
  useEffect(() => {
    const timers = Array.from({ length: count }, (_, n) => window.setTimeout(sound, (delay + n * gap) * 1000));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [count, delay, gap, sound]);
}

const HEARING_GAP = 0.9;
/** Seconds between jurors taking their seats: slower for the first jury, quicker for an appeal played in place. */
const SEAT_GAP = 0.22;
const APPEAL_SEAT_GAP = 0.08;

/** A face for each juror in the pool, the same all week. */
const JUROR_FACES = JUROR_NAMES.map((_, j) => generatePortrait(0x70c0 + j * 7919));

/** Where each case's hearing sits in the docket's timeline: when it prints, and when its stamp comes down. */
function timeline(rulings: readonly Ruling[]) {
  let t = 0.2;
  return rulings.map((r) => {
    const start = t;
    const seats = r.court.evidence ? 0 : r.court.rounds.reduce((sum, round) => sum + round.size, 0);
    const gap = r.court.rounds.length > 1 ? APPEAL_SEAT_GAP : SEAT_GAP;
    const stamp = start + 0.55 + seats * gap;
    t = stamp - 0.55 + HEARING_GAP;
    return { start, stamp };
  });
}

/**
 * How the docket is laid out for this many cases: two to a row; three, on a wider bench, when the
 * clerk challenged five or six; and past six a board of mugshots, five across.
 */
function layoutFor(cases: number): 'two' | 'three' | 'crowded' {
  return cases > 6 ? 'crowded' : cases > 4 ? 'three' : 'two';
}

export function Court({
  day,
  queue,
  rulings,
  onAppeal,
  onDone,
}: {
  day: number;
  queue: GeneratedApplicant[];
  rulings: Ruling[];
  onAppeal: (index: number) => void;
  onDone: () => void;
}) {
  // Laid out once, as the court sat: an appeal plays in place and moves nothing else.
  const [times] = useState(() => timeline(rulings));
  const [sat] = useState(() => new Map(rulings.map((r) => [r.index, r.court.rounds.length])));
  const silence = useStampSounds(times.map((t) => t.stamp));
  const end = times.length ? times[times.length - 1].stamp + 0.4 : 0.4;
  const layout = layoutFor(rulings.length);
  const crowded = layout === 'crowded';
  const section = useRef<HTMLElement>(null);
  // Space or Enter while the court is still sitting (a press carried over from the desk, or during
  // an appeal's jury) brings every stamp down at once; only a press after that moves on.
  useKeyToContinue(() => {
    const sitting = section.current?.getAnimations?.({ subtree: true }).filter((a) => a.playState !== 'finished') ?? [];
    if (sitting.length === 0) return onDone();
    sitting.forEach((a) => a.finish());
    silence();
    thunk();
  });
  const appeal = (index: number) => {
    thunk();
    onAppeal(index);
  };
  // Two rows of cases: a shorter heading, and an appealed case keeps only the tally of the juries before.
  const classes = (base: string) => [base, layout === 'two' ? '' : layout, rulings.length > 2 ? 'stacked' : ''].filter(Boolean).join(' ');
  return (
    <main className={classes('screen court-screen')}>
      <section ref={section} className={classes('court')} aria-label="Humanity Court">
        <header className="court-head">
          <p className="court-kicker">In the matter of the Registry</p>
          <h2>The Humanity Court</h2>
          <p>{COURT_SESSION.replace('{day}', String(day))}</p>
        </header>
        {rulings.length === 0 && <p className="court-empty">{EMPTY_COURT}</p>}
        <div className={classes('docket')}>
          {rulings.map((r, n) => (
            <Hearing
              key={r.index}
              day={day}
              applicant={queue[r.index]}
              ruling={r}
              crowded={crowded}
              roomy={layout === 'two'}
              start={times[n].start}
              stamp={times[n].stamp}
              heardAtSitting={sat.get(r.index) ?? 1}
              onAppeal={() => appeal(r.index)}
            />
          ))}
        </div>
        <button className="screen-button" onClick={onDone} style={{ animationDelay: `${end}s` }}>
          To the accounts
        </button>
      </section>
    </main>
  );
}

/** A thunk as each ruling is stamped. Returns what silences the ones still to come. */
function useStampSounds(at: readonly number[]) {
  const timers = useRef<number[]>([]);
  useEffect(() => {
    timers.current = at.map((s) => window.setTimeout(thunk, s * 1000));
    return () => timers.current.forEach((t) => window.clearTimeout(t));
    // Once, as the court sits: an appeal's stamp makes its own noise.
  }, []);
  return () => timers.current.forEach((t) => window.clearTimeout(t));
}

function Hearing({
  day,
  applicant: a,
  ruling: r,
  crowded,
  roomy,
  start,
  stamp,
  heardAtSitting,
  onAppeal,
}: {
  day: number;
  applicant: GeneratedApplicant;
  ruling: Ruling;
  crowded: boolean;
  /** Two to a row: room for the line that says there was no evidence. */
  roomy: boolean;
  start: number;
  stamp: number;
  /** Rounds already heard when the screen opened; later ones are appeals played here. */
  heardAtSitting: number;
  onAppeal: () => void;
}) {
  const { court } = r;
  const appealed = court.rounds.length > heardAtSitting;
  const lastRound = court.rounds[court.rounds.length - 1];
  // After an appeal, the stamp comes down again once the new jury has sat.
  const stampAt = appealed ? 0.35 + lastRound.size * APPEAL_SEAT_GAP : stamp;
  const fee = appealFee(court);
  let seatAt = start + 0.45;
  const card = useRef<HTMLElement>(null);
  const next = useRef<HTMLButtonElement>(null);
  /** The last APPEAL was pressed from the keyboard, not clicked. */
  const byKey = useRef(false);
  useEffect(() => {
    if (!appealed) return;
    // An appeal plays where the case is: if the new jury runs past the fold, the docket follows it.
    card.current?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    // The APPEAL pressed went with the jury it appealed: the focus stays on the case, not the page,
    // so the next Space or Enter is about this case.
    if (!document.activeElement || document.activeElement === document.body) card.current?.focus({ preventScroll: true });
  }, [appealed, court.rounds.length]);
  // Pressed from the keyboard, the APPEAL comes back under the key once the new stamp is down, if
  // there is another round: Enter again takes the case further. A click leaves the focus on the case,
  // so a Space afterwards moves on, and spends nothing.
  const stamped = (e: AnimationEvent) => {
    if (appealed && byKey.current && e.target === e.currentTarget && document.activeElement === card.current) next.current?.focus();
  };
  return (
    <article ref={card} tabIndex={-1} className={court.evidence ? 'hearing proven' : 'hearing'} data-testid="ruling" data-upheld={r.upheld} style={{ animationDelay: `${start}s` }}>
      <div className="hearing-face">
        <PixelPortrait portrait={a.photo} scale={crowded ? 1 : 1.5} background="#cfd8dc" title={`Photo of ${a.name}`} />
      </div>
      <div className="hearing-body">
        <h3>
          Case {caseNumber(day, r.index)} · The Registry v. {a.name}
        </h3>
        {court.evidence ? (
          <p className="hearing-heard" data-testid="evidence-line">
            Evidence: {evidenceWords(court.evidence)}
          </p>
        ) : (
          <>
            {roomy && <p className="hearing-heard">{HUNCH_LINE}</p>}
            {court.rounds.map((round, k) => {
              const fresh = k >= heardAtSitting;
              const first = fresh ? 0.1 : seatAt;
              if (!fresh) seatAt += round.size * (heardAtSitting > 1 ? APPEAL_SEAT_GAP : SEAT_GAP);
              return (
                <Jury
                  key={k}
                  round={round}
                  n={k}
                  crowded={crowded}
                  past={k < court.rounds.length - 1}
                  first={first}
                  gap={fresh || heardAtSitting > 1 ? APPEAL_SEAT_GAP : SEAT_GAP}
                />
              );
            })}
          </>
        )}
        <div className="hearing-outcome" key={court.rounds.length} style={{ animationDelay: `${stampAt}s` }} onAnimationEnd={stamped}>
          {r.upheld ? (
            <p className="hearing-ruling">
              <strong>Challenge upheld.</strong> Bounty: +{PAY.bounty} PNK.
            </p>
          ) : (
            <p className="hearing-ruling">
              <strong>Challenge dismissed.</strong> No rule broken; registered. Deposit: −{PAY.deposit} PNK.
            </p>
          )}
          {r.upheld &&
            court.violations.map((v) => (
              <p key={v.rule} className="hearing-evidence">
                Rule {RULEBOOK[v.rule].number}: {evidenceLine(asPointed(v, court.evidence, a.video), 'court')}
              </p>
            ))}
          {r.removed && <p className="hearing-evidence">Removed from the registry with them: {r.removed}, who vouched for them.</p>}
          {r.note && <p className="court-note">{r.note}</p>}
          {fee !== null && (
            <button
              ref={next}
              className="appeal-button"
              data-testid="appeal"
              onClick={(e) => {
                byKey.current = e.detail === 0;
                onAppeal();
              }}
            >
              Appeal · {JURY_SIZES[court.rounds.length]} jurors · {fee} PNK
            </button>
          )}
        </div>
      </div>
      <div
        key={`stamp-${court.rounds.length}`}
        className={r.upheld ? 'ruling-stamp upheld' : 'ruling-stamp dismissed'}
        style={{ animationDelay: `${stampAt}s` }}
      >
        {r.upheld ? 'Upheld' : 'Dismissed'}
      </div>
    </article>
  );
}

/**
 * One jury: its seats in the order drawn, each face with its vote and what it said. A `past` jury has
 * been appealed from; where the docket is short of room it shows only its tally. The size shows at
 * once, the tally only once the last seat has sat: before that it would give the stamp away.
 */
function Jury({ round, n, crowded, past, first, gap }: { round: Round; n: number; crowded: boolean; past: boolean; first: number; gap: number }) {
  const upholds = round.seats.filter((s) => s.vote === 'uphold').length;
  return (
    <div className={`jury jury-${round.size}${crowded ? ' collapsed' : ''}${n === 0 ? ' first' : ''}${past ? ' past' : ''}`} data-testid="round" data-size={round.size}>
      <p className="jury-head">
        {n === 0 ? `Jury of ${round.size}` : `Appeal ${n} · jury of ${round.size}`}
        <span className="jury-tally" style={{ animationDelay: `${first + round.size * gap}s` }}>
          {` · ${upholds} of ${round.size} uphold`}
        </span>
      </p>
      <ol className="jurors">
        {round.seats.map((seat, k) => {
          const bubble = pick(BUBBLES[seat.reason], seat.juror + k + n).replace('{rule}', seat.found ? String(RULEBOOK[seat.found].number) : '');
          const name = JUROR_NAMES[seat.juror];
          return (
            <li
              key={k}
              className={`juror vote-${seat.vote}`}
              data-testid="juror"
              data-vote={seat.vote}
              data-juror={seat.juror}
              title={`${name}: ${bubble}`}
              style={{ animationDelay: `${first + k * gap}s` }}
            >
              <PixelPortrait portrait={JUROR_FACES[seat.juror]} scale={crowded || round.size > 3 ? 0.6 : 0.8} background="#b0bec5" title={name} />
              {!crowded && round.size === 3 && <span className="bubble">{bubble}</span>}
              <span className="vote-mark" aria-label={seat.vote}>
                {seat.vote === 'uphold' ? '✓' : seat.vote === 'dismiss' ? '✗' : '–'}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

const ROW_GAP = 0.22;

/** The clerk's statement, typed out a line at a time, like the end of every day at every desk. */
export function Statement({ day, end, unprocessed, onNext }: { day: number; end: DayEnd; unprocessed: number; onNext: () => void }) {
  const { pay } = end;
  const label = (line: PayLine) =>
    line.kind === 'fines'
      ? `Citations: ${plural(pay.warnings, 'warning')}, ${plural(pay.fines, 'fine')}`
      : `${PAY_LABELS[line.kind]}, ${line.count} × ${Math.abs(line.each)}`;
  const rows: { label: string; amount: number | null; kind?: string }[] = [
    { label: 'Savings brought forward', amount: end.before, kind: 'balance' },
    // Registrations always show, even at nought; the rest only when something happened.
    ...payLines(pay)
      .filter((line) => line.kind === 'registrations' || line.count > 0 || (line.kind === 'fines' && pay.warnings > 0))
      .map((line) => ({ label: label(line), amount: line.amount })),
    ...(unprocessed ? [{ label: `Sent home unprocessed: ${unprocessed}`, amount: null }] : []),
    ...end.bills.map((b) => ({ label: b.item, amount: -b.amount })),
    { label: 'Savings carried forward', amount: end.after, kind: 'total' },
  ];
  const next = end.fired || end.promoted ? 'Continue' : `Begin day ${day + 1}`;
  useKeyToContinue(onNext);
  useRhythm(rows.length, 0.3, ROW_GAP, tick);
  return (
    <main className="screen statement-screen">
      <section className="statement" aria-label="Statement">
        <h2>
          Clerk's statement <span>Day {day}</span>
        </h2>
        <dl>
          {rows.map((r, n) => (
            <div key={r.label} className={`row ${r.kind ?? ''} ${r.amount !== null && r.amount < 0 ? 'minus' : ''}`} style={{ animationDelay: `${0.3 + n * ROW_GAP}s` }}>
              <dt>{r.label}</dt>
              <dd data-testid={r.kind === 'total' ? 'savings' : undefined}>{r.amount === null ? '—' : signed(r.amount, r.kind)}</dd>
            </div>
          ))}
        </dl>
        {end.fired && (
          <p className="statement-alert" style={{ animationDelay: `${0.3 + rows.length * ROW_GAP}s` }}>
            Savings below zero.
          </p>
        )}
        <p className="statement-footer" style={{ animationDelay: `${0.4 + rows.length * ROW_GAP}s` }}>
          {STATEMENT_FOOTERS[day - 1]}
        </p>
        <button className="screen-button" onClick={onNext} style={{ animationDelay: `${0.6 + rows.length * ROW_GAP}s` }}>
          {next}
        </button>
      </section>
    </main>
  );
}

const PAY_LABELS: Record<Exclude<PayLine['kind'], 'fines'>, string> = {
  registrations: 'Registrations',
  upheld: 'Challenges upheld',
  dismissed: 'Deposits forfeited',
  wonOnAppeal: 'Appeal bonus, fees refunded',
  lostAt7: 'Appeals lost, 7 jurors',
  lostAt15: 'Appeals lost, 15 jurors',
};
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const signed = (amount: number, kind?: string) => (kind ? `${amount} PNK` : amount > 0 ? `+${amount}` : String(amount));

export function Ending({ kind, day, savings, onNewWeek, onDayAgain }: { kind: 'fired' | 'promoted'; day: number; savings: number; onNewWeek: () => void; onDayAgain: () => void }) {
  const letter = ENDINGS[kind];
  return (
    <main className="screen ending-screen">
      <article className={`notice notice-${kind}`} aria-label="Notice">
        <p className="notice-head">Ministry of Humanity · Human Resources</p>
        <h2>{letter.title}</h2>
        {letter.lines.map((line) => (
          <p key={line}>{line.replace('{day}', String(day))}</p>
        ))}
        <p className="notice-savings">Final savings: {savings} PNK</p>
        <div className="notice-stamp">{kind === 'fired' ? 'Terminated' : 'Promoted'}</div>
        <div className="notice-actions">
          <button className="screen-button" onClick={onNewWeek}>
            {MENU.newWeek}
          </button>
          {kind === 'fired' && (
            <button className="menu-link" onClick={onDayAgain}>
              {MENU.dayAgain.replace('{day}', String(day))}
            </button>
          )}
        </div>
      </article>
    </main>
  );
}
