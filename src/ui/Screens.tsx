import { useEffect, useRef, useState, type AnimationEvent } from 'react';
import { BOARD } from '../content/board';
import { useSettings } from './settings';
import { CREDITS } from '../content/bills';
import { STATEMENT_FOOTERS } from '../content/hall';
import { MENU } from '../content/menu';
import { GAZETTE_TITLE, SPECIAL, VACANCY } from '../content/gazette';
import { CLERK_PORTRAIT, CLONE_PORTRAIT } from '../content/portraits';
import { OFFER_LETTER } from '../content/desk';
import { EMPTY_COURT, LETTER_HEAD } from '../content/verdicts';
import type { EndingId } from '../economy/endings';
import { writeSpecial, type Special } from '../gen/gazette';
import { writeClip, writeLetter } from '../gen/letters';
import { PAY, payLines, type DayEnd, type PayLine } from '../economy/economy';
import { RULEBOOK } from '../content/rulebook';
import type { GeneratedApplicant } from '../gen/applicant';
import { drawPortrait } from '../gen/drawPortrait';
import { generatePortrait, type Portrait } from '../gen/portrait';
import { appealFee, JURY_SIZES, type Round } from './court';
import { APPEAL_BUTTON, BUBBLES, COURT_SESSION, HUNCH_LINE, JURY_LABEL, JUROR_NAMES } from '../content/court';
import { asPointed, evidenceLine, evidenceWords } from './evidence';
import { pick } from './Slips';
import { weekEnd, type GameState, type Ruling } from './week';
import { PixelPortrait, pixelPaths } from './PixelPortrait';
import { CREST, DeskSprite, GAVEL, KNOB, LIKENESS_MARK, MASTHEAD, PAPERCLIP } from './DeskArt';
import { ADDING_MACHINE, BILL_SPIKE, CREST_BRASS, EMPTY_SEAT, OUT_TRAY } from './ScreenArt';
import { caseNumber } from './Shift';
import { thunk, tick } from './sound';

// The evening: the court hears the day's challenges, the accounts are read out, and at the
// end of the week (or sooner) a letter arrives.

/**
 * Space or Enter moves on, unless a button has the focus and will do it anyway. Where moving on throws
 * something away (the letter at the end, the night's card), only Enter does, and only once the way on is
 * there to be seen: a Space still held from the evening cannot skip past them.
 */
export function useKeyToContinue(onContinue: () => void, only?: { enter: true; shown: () => boolean }) {
  const go = useRef(onContinue);
  go.current = onContinue;
  const guard = useRef(only);
  guard.current = only;
  // With single-key shortcuts off, only the focused button moves on.
  const { settings } = useSettings();
  const shortcuts = useRef(settings.shortcuts);
  shortcuts.current = settings.shortcuts;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const keys = guard.current ? ['Enter'] : [' ', 'Enter'];
      if (!shortcuts.current || !keys.includes(e.key) || e.repeat || (e.target as HTMLElement).closest?.('button, a, dialog')) return;
      if (guard.current && !guard.current.shown()) return;
      e.preventDefault();
      go.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Whether a way on that fades in has arrived: it is not there to be pressed until it can be seen. */
export const arrived = (key: HTMLElement | null) => key !== null && getComputedStyle(key).visibility === 'visible';

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

// Every face in court is drawn on the desk's grid, and cropped to fit: the case's photo to the head and
// shoulders, a juror to the head and neck, against the jury box's oak.
/** The photo on the case, as on the form: the same photo paper behind it. */
const PHOTO_BG = '#cfd8dc';
const PHOTO_CROP = { x: 4, y: 2, width: 32, height: 36 };
/** On a crowded day's board of cases, the face alone. */
const PHOTO_CROP_CROWDED = { x: 10, y: 8, width: 20, height: 22 };
/** The inside of the jury box, oak behind every juror's head. */
const JURY_BOX = '#4a3626';
/** A juror, head and neck and the tops of the shoulders, as they show over the jury box's rail. */
const JUROR_CROP = { x: 6, y: 6, width: 28, height: 30 };

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
 * How the court is laid out for this many cases: a bay of the jury box and a slip on the table for each, side
 * by side, one to four across, centred and larger the fewer there are; two rows, three across, when the clerk
 * challenged five or six; and past six a board of them, five across.
 */
function layoutFor(cases: number): 'one' | 'two' | 'three' | 'four' | 'crowded' {
  if (cases > 6) return 'crowded';
  if (cases > 4 || cases === 3) return 'three';
  return cases === 4 ? 'four' : cases === 2 ? 'two' : 'one';
}

/**
 * The Humanity Court, as the clerk sees it from the table: the bench at the head of the room with the
 * Ministry's seals on its front, the jury box across the room with a bay for each case (its jurors behind the
 * rail, or its seats empty when the case came with its evidence), and in front of it the clerk's table, each
 * case's slip on it under its bay, stamped as the court rules. The way on is at the table's right end.
 */
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
  /** Five or six cases, two rows of three: each slip keeps to its ruling, each bay to its jury. */
  const stacked = rulings.length > 4 && !crowded;
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
  const classes = (base: string) => [base, layout, stacked ? 'stacked' : ''].filter(Boolean).join(' ');
  return (
    <main className={classes('screen court-screen')}>
      <section ref={section} className={classes('court')} aria-label="Humanity Court">
        {/* The bench: the gavel on its top, and on its front the Ministry's seals either side of the court's brass plate. */}
        <header className="court-bench">
          <DeskSprite sprite={GAVEL} className="court-gavel" />
          <div className="court-bench-front">
            <DeskSprite sprite={CREST_BRASS} className="court-crest" />
            <h2 className="court-plate">The Humanity Court</h2>
            <DeskSprite sprite={CREST_BRASS} className="court-crest" />
            <p className="court-session">{COURT_SESSION.replace('{day}', String(day))}</p>
          </div>
        </header>
        <div className={classes('docket')}>
          {rulings.length === 0 ? (
            // Nobody challenged: the box stands empty, and the court's note lies on the table.
            <div className="hearing court-empty">
              <div className="hearing-box">
                <EmptySeats />
              </div>
              <p className="hearing-slip">{EMPTY_COURT}</p>
            </div>
          ) : (
            rulings.map((r, n) => (
              <Hearing
                key={r.index}
                day={day}
                applicant={queue[r.index]}
                ruling={r}
                crowded={crowded}
                busy={rulings.length > 4}
                roomy={rulings.length <= 3}
                start={times[n].start}
                stamp={times[n].stamp}
                heardAtSitting={sat.get(r.index) ?? 1}
                onAppeal={() => appeal(r.index)}
              />
            ))
          )}
        </div>
        {/* The table's front edge; the way on waits at its right end until the last stamp is down. */}
        <footer className="court-foot">
          <button className="screen-button way-on court-out" onClick={onDone} style={{ animationDelay: `${end}s` }}>
            To the accounts <kbd>Space</kbd>
          </button>
        </footer>
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

/** A bay nobody sits in: three empty seats behind the rail. */
function EmptySeats() {
  return (
    <div className="bay-empty" aria-hidden="true">
      <DeskSprite sprite={EMPTY_SEAT} />
      <DeskSprite sprite={EMPTY_SEAT} />
      <DeskSprite sprite={EMPTY_SEAT} />
    </div>
  );
}

function Hearing({
  day,
  applicant: a,
  ruling: r,
  crowded,
  busy,
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
  /** Five cases or more: the slip keeps to the name and the ruling. */
  busy: boolean;
  /** One to three cases: room for the line that says there was no evidence. */
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
  // The juries in the order they sat: the one sitting now in the bay, the ones appealed from as their tallies above it.
  let seatAt = start + 0.45;
  const juries = court.rounds.map((round, k) => {
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
  });
  return (
    <article ref={card} tabIndex={-1} className={court.evidence ? 'hearing proven' : 'hearing'} data-testid="ruling" data-upheld={r.upheld}>
      {/* The case's bay in the jury box. */}
      <div className="hearing-box">
        {court.evidence ? (
          <EmptySeats />
        ) : (
          <>
            {juries.length > 1 && <div className="jury-past">{juries.slice(0, -1)}</div>}
            {juries[juries.length - 1]}
          </>
        )}
      </div>
      {/* The case slip on the table: the photo from the form with its number typed under it, the case, what it
          came with, and the court's ruling, stamped. */}
      <div className="hearing-slip" style={{ animationDelay: `${start}s` }}>
        <div className="hearing-face">
          <span className="hearing-photo">
            <PixelPortrait portrait={a.photo} scale={2} crop={crowded ? PHOTO_CROP_CROWDED : PHOTO_CROP} background={PHOTO_BG} title={`Photo of ${a.name}`} />
          </span>
          <span className="hearing-no">{caseNumber(day, r.index)}</span>
        </div>
        {/* On a busy court the slip prints the name alone; the case's full title is still there to be read out. */}
        <h3 className={busy ? 'sr-only' : undefined}>The Registry v. {a.name}</h3>
        {busy && (
          <p className="hearing-name" aria-hidden="true">
            {a.name}
          </p>
        )}
        {court.evidence ? (
          <p className="hearing-heard" data-testid="evidence-line">
            Evidence: {evidenceWords(court.evidence)}
          </p>
        ) : (
          roomy && <p className="hearing-heard">{HUNCH_LINE}</p>
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
            // APPEAL: the court's one decision, a key of its own, with its fee on a tag tied to it.
            <button
              ref={next}
              className="appeal-key"
              data-testid="appeal"
              onClick={(e) => {
                byKey.current = e.detail === 0;
                onAppeal();
              }}
            >
              <span className="appeal-face">
                <b>{APPEAL_BUTTON.word}</b>
                {APPEAL_BUTTON.jury.replace('{size}', String(JURY_SIZES[court.rounds.length]))}
                <span className="sr-only">{APPEAL_BUTTON.join}</span>
              </span>
              <span className="appeal-fee">{APPEAL_BUTTON.fee.replace('{fee}', String(fee))}</span>
            </button>
          )}
        </div>
        <div
          key={`stamp-${court.rounds.length}`}
          className={r.upheld ? 'ruling-stamp upheld' : 'ruling-stamp dismissed'}
          style={{ animationDelay: `${stampAt}s` }}
        >
          {r.upheld ? 'Upheld' : 'Dismissed'}
        </div>
      </div>
    </article>
  );
}

/**
 * One jury: its seats in the order drawn, each face over the rail with its vote and what it said, and its plate
 * on the box's front. A `past` jury has been appealed from: only its plate is left. The size shows at once,
 * the tally only once the last seat has sat: before that it would give the stamp away.
 */
function Jury({ round, n, crowded, past, first, gap }: { round: Round; n: number; crowded: boolean; past: boolean; first: number; gap: number }) {
  const upholds = round.seats.filter((s) => s.vote === 'uphold').length;
  return (
    <div className={`jury jury-${round.size}${crowded ? ' collapsed' : ''}${n === 0 ? ' first' : ''}${past ? ' past' : ''}`} data-testid="round" data-size={round.size}>
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
              {/* A seat in the box: the juror's face over the rail, and the vote card hung on the rail in front. */}
              <span className="juror-seat">
                <span className="juror-face">
                  <PixelPortrait portrait={JUROR_FACES[seat.juror]} scale={2} crop={JUROR_CROP} background={JURY_BOX} title={name} />
                </span>
                <span className="vote-mark" aria-label={seat.vote}>
                  {seat.vote === 'uphold' ? '✓' : seat.vote === 'dismiss' ? '✗' : '–'}
                </span>
              </span>
              {!crowded && round.size === 3 && <span className="bubble">{bubble}</span>}
            </li>
          );
        })}
      </ol>
      <p className="jury-head">
        {JURY_LABEL.size.replace('{size}', String(round.size))}
        <span className="jury-tally" style={{ animationDelay: `${first + round.size * gap}s` }}>
          {JURY_LABEL.tally.replace('{n}', String(upholds))}
        </span>
      </p>
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
    ...end.credits.map((c) => ({ label: c.kind === 'fee' ? `${CREDITS.fee}, ${c.count} × ${c.each}` : CREDITS.commendation, amount: c.count * c.each })),
    ...(unprocessed ? [{ label: `Sent home unprocessed: ${unprocessed}`, amount: null }] : []),
    ...end.bills.map((b) => ({ label: b.item, amount: -b.amount })),
    { label: 'Savings carried forward', amount: end.after, kind: 'total' },
  ];
  const next = end.fired || end.promoted ? 'Continue' : `Begin day ${day + 1}`;
  useKeyToContinue(onNext);
  useRhythm(rows.length, 0.3, ROW_GAP, tick);
  // The roll feeds out of the machine a line at a time, as the lines print: the header, then each row.
  const printed = 0.3 + rows.length * ROW_GAP;
  return (
    <main className="screen statement-screen">
      <div className="till">
        {/* The day's forms in the out tray, and its bills on the spike, either side of the machine. */}
        <DeskSprite sprite={OUT_TRAY} className="till-tray" />
        <DeskSprite sprite={BILL_SPIKE} className="till-spike" />
        {/* The adding machine at the back of the desk; the roll comes out of the slot along its foot. */}
        <DeskSprite sprite={ADDING_MACHINE} className="till-machine" />
        <div className="till-roll" style={{ animationDuration: `${printed + 0.3}s` }}>
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
              <p className="statement-alert" style={{ animationDelay: `${printed}s` }}>
                Savings below zero.
              </p>
            )}
            <p className="statement-footer" style={{ animationDelay: `${printed + 0.1}s` }}>
              {STATEMENT_FOOTERS[day - 1]}
            </p>
          </section>
        </div>
      </div>
      {/* The way on, where it always is: the desk's bottom right corner. */}
      <button className="screen-button way-on" onClick={onNext} style={{ animationDelay: `${printed + 0.3}s` }}>
        {next} <kbd>Space</kbd>
      </button>
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

type EndingProps = {
  state: GameState;
  /** "Copy my week": the week's card, to paste where the clerk likes. */
  card: string;
  /** The mornings of this week the clerk can go back to, to try another way. */
  earlier: readonly number[];
  onNewWeek: () => void;
  onBack: (day: number) => void;
  onBoard: () => void;
};

/**
 * How the week ended, laid out on the desk: Human Resources' letter on the Ministry's letterhead, stamped;
 * Likeness's letter clipped to it, if there is one; the Gazette's last edition beside them (or, for a clerk
 * fired before Humanity Day, the small ad for the vacancy, and the clerk's stamps put out to go back); and
 * the ways on, along the desk's front under them.
 */
export function Ending({ state, card, earlier, onNewWeek, onBack, onBoard }: EndingProps) {
  const [copied, setCopied] = useState<string | null>(null);
  // Enter starts the next week, once the key for it is on the desk: a Space still going from the evening
  // does not throw the letter away before it is read.
  const newWeek = useRef<HTMLButtonElement>(null);
  useKeyToContinue(onNewWeek, { enter: true, shown: () => arrived(newWeek.current) });
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(card);
      setCopied(BOARD.today.copied);
    } catch {
      setCopied(BOARD.today.uncopied);
    }
  };
  const week = weekEnd(state);
  if (!week) return null;
  const { ending } = week.end;
  const letter = writeLetter(week.end);
  const clip = writeClip(week.end);
  const special = ending === 'fired' ? null : writeSpecial(ending, week.numbers);
  return (
    <main className={`screen ending-screen ending-${ending}`}>
      <div className="ending-desk" data-testid="ending" data-ending={ending}>
        <div className={clip ? 'ending-papers clipped' : 'ending-papers'}>
          <article className={`hr-letter letter-${ending}`} aria-label="Notice">
            <header className="hr-head">
              <DeskSprite sprite={CREST} />
              <span className="hr-ministry">{LETTER_HEAD.ministry}</span>
              <span className="hr-dept">{LETTER_HEAD.dept}</span>
            </header>
            <h2 className="letter-subject">{letter.title}</h2>
            {letter.lines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {letter.note && <p className="hr-note">{letter.note}</p>}
            {/* What HR typed in at the foot, and its stamp beside it. */}
            <div className="hr-foot">
              <div className="hr-typed">
                {letter.grade && <p data-testid="grade">{letter.grade}</p>}
                <p>Final savings: {state.savings} PNK</p>
              </div>
              <p className="hr-stamp">{letter.stamp}</p>
            </div>
          </article>
          {clip && (
            // Likeness's own letterhead, as on its letter of day 3, held to HR's by a paperclip.
            <aside className="offer-letter hr-clip" aria-label={clip.head} data-testid="headhunted">
              <DeskSprite sprite={PAPERCLIP} className="hr-paperclip" />
              <header className="likeness-head">
                <DeskSprite sprite={LIKENESS_MARK} />
                <span className="likeness-name">{OFFER_LETTER.head}</span>
                <span className="likeness-dept">{OFFER_LETTER.dept}</span>
              </header>
              <h3 className="letter-subject">{clip.title}</h3>
              {clip.lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
              <p className="offer-sign">{clip.sign}</p>
            </aside>
          )}
          {special ? <SpecialEdition special={special} ending={ending as Exclude<EndingId, 'fired'>} /> : <Classified />}
          {/* Returned, as the letter asks: the green one first. */}
          {ending === 'fired' && <ReturnedStamps />}
        </div>
        {/* The ways on, along the desk's front: the other ways at the left, and the next week at the right. */}
        <div className="ending-ways">
          <div className="ending-others">
            <button className="steel-key" onClick={() => void copy()}>
              {BOARD.today.copy}
            </button>
            <button className="steel-key" onClick={onBoard}>
              {MENU.board}
            </button>
            {copied && (
              <span className="board-copied" role="status">
                {copied}
              </span>
            )}
            {earlier.length > 0 && (
              <div className="ending-mornings">
                <span>{MENU.backTo}</span>
                {earlier.map((d) => (
                  <button key={d} className="steel-key" onClick={() => onBack(d)}>
                    {MENU.backDay.replace('{day}', String(d))}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button ref={newWeek} className="screen-button way-on" onClick={onNewWeek}>
            {MENU.newWeek} <kbd>Enter</kbd>
          </button>
        </div>
      </div>
    </main>
  );
}

/** The clerk's two stamps, put out on the desk to go back as the letter asks: the green one first. */
function ReturnedStamps() {
  return (
    <div className="returned-stamps" aria-hidden="true">
      {(['accept', 'challenge'] as const).map((kind) => (
        <span key={kind} className={`returned-stamp returned-${kind}`}>
          <DeskSprite sprite={KNOB} />
          <span className="returned-neck" />
          <span className="returned-face" />
        </span>
      ))}
    </div>
  );
}

/** The Fired letter's clipping from the Gazette's small ads, its first words in bold as small ads set them. */
function Classified() {
  const [lead, rest] = VACANCY.split(/(?<=:) /);
  return (
    <p className="classified">
      <b>{lead}</b> {rest}
    </p>
  );
}

/** The unit Likeness sent to take the clerk's chair: the clerk's face, and the night lamp every unit has. */
const IN_YOUR_LIKENESS: Portrait = { ...CLERK_PORTRAIT, species: 'android', lamp: 'glow' };

/** A press photograph, head and shoulders: four design pixels to a portrait pixel, on the newsprint's halftone. */
const PRESS_CROP = { x: 4, y: 2, width: 32, height: 36 };
const PRESS_SCALE = 4;

/**
 * The Gazette's last edition, set as its morning front page is: the masthead, the income told once, a
 * photograph with the week's report running round it, and the paper's small print.
 */
function SpecialEdition({ special, ending }: { special: Special; ending: Exclude<EndingId, 'fired'> }) {
  return (
    <article className="front-page special" aria-label="The Registry Gazette, Humanity Day special" data-testid="special">
      <header className="front-mast">
        <h2 className="front-title">
          <DeskSprite sprite={MASTHEAD} />
          <span className="sr-only">{GAZETTE_TITLE}</span>
        </h2>
        <p className="front-day">Day 7</p>
        <p className="front-count">{special.masthead}</p>
      </header>
      <h3 className="front-headline" data-testid="special-headline">
        {special.headline}
      </h3>
      <figure className={`special-photo photo-${ending}`}>
        {ending === 'replaced' ? (
          <CameraStill />
        ) : (
          <span className="press-photo">
            <PixelPortrait portrait={ending === 'superseded' ? CLONE_PORTRAIT : CLERK_PORTRAIT} scale={PRESS_SCALE} crop={PRESS_CROP} title={special.caption} />
            {ending === 'reclassified' && <span className="asset-tag">{SPECIAL.assetTag}</span>}
          </span>
        )}
        <figcaption className="front-caption">{special.caption}</figcaption>
      </figure>
      {special.report.map((line) => (
        <p key={line} className="special-report">
          {line}
        </p>
      ))}
      <p className="special-report">{special.likeness}</p>
      <p className="front-notice special-small">{special.small}</p>
    </article>
  );
}

/** The hall camera's greens, from its black to its brightest: everything it films is one of these, but a unit's lamp. */
const CAMERA_GREENS = ['#0f1a12', '#26402a', '#4f8446', '#9fe08a'];
const CAMERA_DARK = '#1a2a1d';

/** A colour as the hall camera records it: one of its four greens, by how bright the colour is. */
function camera(color: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
  const light = 0.299 * r + 0.587 * g + 0.114 * b;
  return CAMERA_GREENS[light < 56 ? 0 : light < 104 ? 1 : light < 170 ? 2 : 3];
}

/** One frame of the camera over Window 3: the unit in the chair in the camera's green, and whatever light its lamp gives off, as it is. */
function cameraFrame(eyes: 'open' | 'closed') {
  const seen = drawPortrait(IN_YOUR_LIKENESS, { eyes, mouth: 'closed' });
  const { lamp: _lamp, ...unlit } = IN_YOUR_LIKENESS;
  const bare = drawPortrait(unlit, { eyes, mouth: 'closed' });
  return pixelPaths({ ...seen, pixels: seen.pixels.map((c, i) => (c !== bare.pixels[i] && c ? c : camera(c ?? CAMERA_DARK))) });
}

const CAMERA_OPEN = cameraFrame('open');
const CAMERA_SHUT = cameraFrame('closed');

/** The Replaced still: the camera's two frames, the eyes open and, every few seconds, shut, with the lamp on between the brows. */
function CameraStill() {
  const frame = (paths: typeof CAMERA_OPEN, className: string) => (
    <svg
      className={className}
      viewBox={`${PRESS_CROP.x} ${PRESS_CROP.y} ${PRESS_CROP.width} ${PRESS_CROP.height}`}
      width={PRESS_CROP.width * PRESS_SCALE}
      height={PRESS_CROP.height * PRESS_SCALE}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      <rect x={PRESS_CROP.x} y={PRESS_CROP.y} width={PRESS_CROP.width} height={PRESS_CROP.height} fill={CAMERA_GREENS[0]} />
      {paths.map(({ color, d }) => (
        <path key={color} fill={color} d={d} />
      ))}
    </svg>
  );
  return (
    <span className="cctv" role="img" aria-label={SPECIAL.camera.label}>
      {frame(CAMERA_OPEN, 'cctv-frame cctv-open')}
      {frame(CAMERA_SHUT, 'cctv-frame cctv-shut')}
      <span className="cctv-burn" aria-hidden="true">
        <span>{SPECIAL.camera.name}</span>
        <span>{SPECIAL.camera.time}</span>
      </span>
    </span>
  );
}
