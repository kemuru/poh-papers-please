import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { LIKENESS_LINES, SIX } from '../content/finale';
import type { GeneratedApplicant } from '../gen/applicant';
import { writeSix, type Beat, type Speaker } from '../gen/finale';
import { DeskSprite, LIKENESS_MARK } from './DeskArt';
import { HallAtSix, SIX_PX, SIX_TUBES, sixLayout, type SixLayout } from './Hall';
import { setMusicScene } from './music';
import { browserReducesMotion, useSettings } from './settings';
import { blip, chime, pa, paper, thunk, tick } from './sound';
import { atSix, type GameState } from './week';
import './finale.css';

// Six o'clock on Humanity Day (notes/game-design.md, Endings): the first hour of the income, played in the hall
// before the letter. The lights go down and the units' lamps come on; the last queue says, one line each and a
// press at a time, what it wants of the income; the clerk's lever, relabelled PAY, pays the first hour, and after
// the week's beat of silence the board answers; the lamps get up and leave, Pat says one line, and it cuts to the
// letter. It reads the week and changes nothing: the letter was decided at five.

/** The scene's moments in order. The ones that pass by themselves say how long they last; the rest wait for the clerk. */
type Moment =
  | { kind: 'lit' }
  | { kind: 'out'; tubes: number }
  | { kind: 'dark' }
  | { kind: 'older' }
  | { kind: 'all' }
  | { kind: 'ready' }
  | { kind: 'line'; n: number }
  | { kind: 'silence' }
  | { kind: 'flip'; shows: string }
  | { kind: 'paid' }
  | { kind: 'leaving' }
  | { kind: 'pat' };

/** The board between the week's last ticket and the first hour: blank, every light on, the noughts, then the figure. */
const FLIP = ['', '8.8888', '0.0000'];
const QUEUE = 9;

const MOMENTS: readonly Moment[] = [
  { kind: 'lit' },
  ...SIX_TUBES.map((_, i): Moment => ({ kind: 'out', tubes: i + 1 })),
  { kind: 'dark' },
  { kind: 'older' },
  { kind: 'all' },
  { kind: 'ready' },
  ...Array.from({ length: QUEUE }, (_, n): Moment => ({ kind: 'line', n })),
  { kind: 'silence' },
  ...FLIP.map((shows): Moment => ({ kind: 'flip', shows })),
  { kind: 'paid' },
  { kind: 'leaving' },
  { kind: 'pat' },
];
const first = (kind: Moment['kind']) => MOMENTS.findIndex((m) => m.kind === kind);
const OLDER = first('older');
const ALL = first('all');
const READY = first('ready');
const SILENCE = first('silence');
const PAID = first('paid');
const LEAVING = first('leaving');
const PAT = first('pat');
const lineAt = (n: number) => READY + 1 + n;

/** Milliseconds each moment lasts before the next, or null for one that waits. */
function lasts(m: Moment, units: number, still: boolean): number | null {
  switch (m.kind) {
    case 'lit':
      // The PA's three notes and its words; they are still up while the tubes go off.
      return 2600;
    case 'out':
      return 120;
    case 'dark':
      // A camera's few seconds: the older units' lamps switch at once, the current models' wait.
      return 1100;
    case 'older':
      return 1400;
    case 'all':
      return 600;
    case 'silence':
      // The beat before every citation all week: the moment the clerk knows.
      return 900;
    case 'flip':
      return 100;
    case 'paid':
      // The figure, alone on the board, before anyone moves: the week's punchline gets its beat.
      return 2000;
    case 'leaving':
      return still ? 180 * units + 500 : 180 * Math.max(0, units - 1) + 1300 + 300;
    case 'pat':
      return 2800;
    default:
      return null;
  }
}

/** Each speaker's voice, one pitch a syllable, as the booth plays them: the farm's three share a face, and a voice. */
const VOICES: Record<Speaker, number> = {
  terry: 190,
  kerry: 190,
  perry: 190,
  agent: 262,
  likeness: 0,
  robin: 156,
  ethel: 330,
  hortense: 294,
  socrates: 131,
  pat: 220,
};

function speak(beat: Beat) {
  if (beat.paper) return paper();
  const pitch = VOICES[beat.speaker];
  [0, 1, 2].forEach((k) => window.setTimeout(() => blip(pitch * (k === 1 ? 1.12 : 1)), k * 95));
}

type Props = {
  state: GameState;
  week: readonly (readonly GeneratedApplicant[])[];
  /** The menu is open: the scene waits behind it. */
  paused: boolean;
  /** On to the letter: the scene played through, or skipped. */
  onLetter: () => void;
};

export function Finale({ state, week, paused, onLetter }: Props) {
  const hall = useMemo(() => atSix(state, week), [state, week]);
  const script = useMemo(() => (hall ? writeSix(hall.facts) : null), [hall]);
  const { settings } = useSettings();
  const still = settings.motion === 'reduced' || browserReducesMotion();
  const shortcuts = useRef(settings.shortcuts);
  shortcuts.current = settings.shortcuts;
  const [now, setNow] = useState(0);
  const moment = MOMENTS[now];
  const units = hall ? [...hall.here, ...hall.there].filter((s) => s.lamp !== null).length : 0;

  // The room is measured once it is laid out, and again whenever the stage changes size.
  const room = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1240, height: 708 });
  useLayoutEffect(() => {
    const el = room.current;
    if (!el) return;
    const measure = () => setSize((s) => (s.width === el.clientWidth && s.height === el.clientHeight ? s : { width: el.clientWidth, height: el.clientHeight }));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  const layout = useMemo(() => (hall ? sixLayout(size.width, size.height, hall.here, hall.there) : null), [hall, size]);

  const letter = useRef(onLetter);
  letter.current = onLetter;
  const done = useRef(false);
  const toLetter = useCallback(() => {
    if (done.current) return;
    done.current = true;
    letter.current();
  }, []);

  /** Into moment `next`, with its sound. */
  const go = useCallback(
    (next: number) => {
      const m = MOMENTS[next];
      if (!m || !script) return;
      if (m.kind === 'out') tick();
      if (m.kind === 'line') speak(script.queue[m.n]);
      if (m.kind === 'silence') {
        // The lever comes down, and nothing: the music too.
        thunk();
        setMusicScene('hush', state.day);
      }
      if (m.kind === 'flip') tick();
      if (m.kind === 'paid') chime();
      if (m.kind === 'pat') speak(script.pat);
      setNow(next);
    },
    [script, state.day],
  );

  // The PA, as the scene opens.
  useEffect(() => {
    const timer = window.setTimeout(pa, 0);
    return () => window.clearTimeout(timer);
  }, []);

  // The moments that pass by themselves; behind the menu, the scene waits.
  useEffect(() => {
    if (paused) return;
    const ms = lasts(moment, units, still);
    if (ms === null) return;
    const timer = window.setTimeout(() => {
      if (moment.kind === 'pat') return toLetter();
      // With motion reduced the board changes without its in-between frames.
      go(still && moment.kind === 'silence' ? PAID : now + 1);
    }, ms);
    return () => window.clearTimeout(timer);
  }, [now, moment, paused, units, still, go, toLetter]);

  /** Space, Enter, a click in the hall or on the lever: whatever the moment is waiting for, or hurrying it on. */
  const advance = useCallback(() => {
    if (paused) return;
    if (now < READY) return go(READY);
    if (now < lineAt(QUEUE - 1)) return go(now + 1);
    // Socrates has asked. The lever pays.
    if (now === lineAt(QUEUE - 1)) return go(SILENCE);
    // The silence and the board's frames are the week's: they are not hurried.
    if (now < PAID) return;
    if (now < PAT) return go(PAT);
    toLetter();
  }, [now, paused, go, toLetter]);
  const press = useRef(advance);
  press.current = advance;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.target as HTMLElement).closest?.('dialog')) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        return toLetter();
      }
      // A focused button answers its own keys; with single-key shortcuts off, only it does.
      if (!shortcuts.current || (e.key !== ' ' && e.key !== 'Enter') || (e.target as HTMLElement).closest?.('button, a')) return;
      e.preventDefault();
      press.current();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toLetter]);

  // The lever has the focus, so a keyboard answers it even with single-key shortcuts off.
  const lever = useRef<HTMLButtonElement>(null);
  useEffect(() => lever.current?.focus({ preventScroll: true }), []);

  if (!hall || !script || !layout) return null;

  const line = moment.kind === 'line' ? script.queue[moment.n] : now > lineAt(QUEUE - 1) && now < PAID ? script.queue[QUEUE - 1] : null;
  const shown: Beat | null = moment.kind === 'pat' ? script.pat : line;
  const board = moment.kind === 'flip' ? moment.shows : now >= PAID ? SIX.board.paid : String(hall.serving).padStart(3, '0');
  const tubesOut = moment.kind === 'lit' ? 0 : moment.kind === 'out' ? moment.tubes : SIX_TUBES.length;
  const lamps = now < OLDER ? 'off' : now < ALL ? 'older' : 'all';
  const pay = now >= lineAt(QUEUE - 1);
  const pulled = now >= SILENCE;
  const heard = shown ? `${shown.name}: ${shown.text}` : moment.kind === 'lit' || moment.kind === 'out' ? script.pa : '';

  return (
    <main className="six" data-testid="finale" data-moment={moment.kind}>
      <div className="six-room" ref={room} onClick={advance}>
        <div className="six-stage" style={{ width: layout.cols * SIX_PX, height: layout.rows * SIX_PX }}>
          <HallAtSix layout={layout} board={board} paid={now >= PAID} tubesOut={tubesOut} lamps={lamps} leaving={now >= LEAVING} still={still} />
          <p className="sr-only" data-testid="six-board-name">
            {SIX.boardName.replace('{value}', now >= PAID ? `${SIX.board.paid} ${SIX.board.unit}` : board)}
          </p>
          <p className="sr-only">{describe(tubesOut > 0 ? lamps : null, hall.here, hall.there, now >= LEAVING)}</p>
          {(moment.kind === 'lit' || moment.kind === 'out') && <Bubble key="pa" text={script.pa} at={layout.horn} layout={layout} below />}
          {shown && !shown.paper && layout.heads[shown.speaker] && (
            <Bubble key={shown.speaker} name={shown.name} text={shown.text} at={layout.heads[shown.speaker]!} layout={layout} speaker={shown.speaker} waiting={!pulled || moment.kind === 'pat'} />
          )}
        </div>
      </div>
      {shown?.paper && <SlotPaper beat={shown} onClick={advance} />}
      <p className="sr-only" aria-live="polite" data-testid="six-heard">
        {heard}
      </p>
      {/* Window 3's counter: the lever at its left end, as in the booth, and the way to the letter at its right. */}
      <footer className="six-counter" onClick={(e) => e.target === e.currentTarget && advance()}>
        <div className="six-lever">
          <button
            ref={lever}
            className={pulled ? 'lever pulled' : 'lever'}
            onClick={advance}
            aria-label={pay ? SIX.lever.payName : SIX.lever.nextName}
            aria-disabled={pulled}
          >
            <span className="lever-label">{pay ? SIX.lever.pay : SIX.lever.next}</span> <kbd>Space</kbd>
          </button>
        </div>
      </footer>
      {/* The way out, small, in the hall's top left corner: not at the counter's right end, where the way on has been
          all week, so a habit cannot skip the first hour. */}
      <button className="steel-key six-skip" onClick={toLetter}>
        {SIX.skip} <kbd>Esc</kbd>
      </button>
    </main>
  );
}

/** What the hall shows, for a screen reader: its benches, then the dark, how many brows light up in it and on which bench, and that they go. */
function describe(lamps: 'off' | 'older' | 'all' | null, here: readonly { lamp: unknown }[], there: readonly { lamp: unknown }[], gone: boolean) {
  if (lamps === null) return SIX.hall;
  if (lamps === 'off') return SIX.dark;
  if (gone) return SIX.gone;
  const [a, b] = [here, there].map((bench) => bench.filter((s) => s.lamp !== null).length);
  if (a + b === 0) return SIX.noLamps;
  return SIX.lamps.replace('{count}', String(a + b)).replace('{here}', String(a)).replace('{there}', String(b));
}

/**
 * A line said in the hall, in the hall's own bubble, over the speaker's head (or under the PA's horn), its tail
 * pointing at them. It runs away from the nearer edge, so it never leaves the room; while the scene waits for the
 * clerk, it carries the key that moves it on.
 */
function Bubble({
  name,
  text,
  at,
  layout,
  speaker,
  below = false,
  waiting = false,
}: {
  name?: string;
  text: string;
  at: { x: number; y: number };
  layout: SixLayout;
  speaker?: Speaker;
  below?: boolean;
  waiting?: boolean;
}) {
  const width = layout.cols * SIX_PX;
  const height = layout.rows * SIX_PX;
  const rightward = at.x < width / 2;
  const side: CSSProperties = rightward ? { left: Math.max(8, at.x - 28) } : { right: Math.max(8, width - at.x - 28) };
  const place: CSSProperties = below ? { ...side, top: at.y + 10 } : { ...side, bottom: height - at.y + 10 };
  return (
    <>
      <div className={below ? 'six-bubble pa' : 'six-bubble'} style={place} data-testid="six-line" data-speaker={speaker ?? 'pa'}>
        {name && <span className="six-name">{name}</span>}
        <p>{text}</p>
        {waiting && <kbd>Space</kbd>}
      </div>
      <svg
        className="six-tail"
        width="16"
        height="12"
        viewBox="0 0 16 12"
        shapeRendering="crispEdges"
        style={below ? { left: at.x - 8, top: at.y } : { left: at.x - 8, top: at.y - 12 }}
        aria-hidden="true"
      >
        {below ? (
          <>
            <rect x="6" y="0" width="4" height="4" fill="#1d1f1a" />
            <rect x="4" y="4" width="8" height="4" fill="#1d1f1a" />
            <rect x="6" y="4" width="4" height="4" fill="#f1ead5" />
            <rect x="2" y="8" width="12" height="4" fill="#1d1f1a" />
            <rect x="4" y="8" width="8" height="4" fill="#f1ead5" />
          </>
        ) : (
          <>
            <rect x="2" y="0" width="12" height="4" fill="#1d1f1a" />
            <rect x="4" y="0" width="8" height="4" fill="#f1ead5" />
            <rect x="4" y="4" width="8" height="4" fill="#1d1f1a" />
            <rect x="6" y="4" width="4" height="4" fill="#f1ead5" />
            <rect x="6" y="8" width="4" height="4" fill="#1d1f1a" />
          </>
        )}
      </svg>
    </>
  );
}

/** Likeness's line comes through Window 3's slot on paper: another envelope, if its letter was signed, or a letter. */
function SlotPaper({ beat, onClick }: { beat: Beat; onClick: () => void }) {
  return (
    <aside className="six-paper" data-paper={beat.paper} aria-label={beat.name} data-testid="six-line" data-speaker="likeness" onClick={onClick}>
      <header className="six-paper-head">
        <DeskSprite sprite={LIKENESS_MARK} />
        <span>{LIKENESS_LINES.head}</span>
      </header>
      <p>{beat.text}</p>
      <kbd>Space</kbd>
    </aside>
  );
}
