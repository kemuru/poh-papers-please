import { memo, useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { ANNOUNCEMENTS, BANNER, CLOSING, POSTERS } from '../content/hall';
import { CAST_PORTRAITS } from '../content/portraits';
import type { GeneratedApplicant } from '../gen/applicant';
import { drawPortrait, type PixelImage } from '../gen/drawPortrait';
import { LAST_DAY } from '../gen/day';
import { generatePortrait } from '../gen/portrait';
import { pixelPaths } from './PixelPortrait';
import { pa } from './sound';
import { BUCKET, card, CLOCK, FLAG, PIGEON, PIGEON_PECK, PLANTS, sheared, spriteImage, textImage, turned, WET_FLOOR, wrapWords } from './sprites';
// The hall's height on each stage, and one hall pixel: shared with the stage's scale (room.ts).
import { hallRows, PX } from './room';

// The waiting hall, seen from Window 3: the day's queue behind the railing, and a ministry that
// comes apart a little more each day. Pure decoration; nothing here is evidence.
//
// It is drawn on the portraits' grid, one hall pixel to an art pixel (two design pixels) on every
// stage, so it is as crisp as the desk and nothing in it is ever scaled. Its height is set once for
// the stage it is on and never moves with the papers: whatever the desk leaves with its tallest papers
// out, between a strip that still tells the whole story (the board, the queue under its banner, the
// clock and the PA, the posters, Window 2 and whoever waits for it) and a room with a floor and a
// ceiling. A wider stage shows more of the room at either end, never a bigger one.

/** Hall pixels every stage shows: the narrowest stage, 1240 design pixels, is exactly this wide. */
const CORE = 620;
/** The strip as drawn: the story, the queue's railing along its foot, and no floor. */
const STRIP = 52;
/** Rows past the fewest go first to headroom (the banner clear of the heads), then to the floor, then to a higher ceiling. */
const HEADROOM = 8;
const FLOOR = 28;
/** How far the ceiling, the walls and the floor run: past anything a stage shows. */
const LEFT = -200;
const RIGHT = 820;

// Heights in the room, in hall pixels. The ceiling and what hangs from it are measured from the top; the
// people, the wall's fittings and the floor from the queue's railing, which moves down as the hall grows.
/** The top of the queue's railing in the strip, three rows above its foot. */
const RAIL = 49;
/** The front of the queue, nearest the window. Everyone behind stands SPACING further right. */
const QUEUE_X = 64;
const QUEUE_Y = RAIL - 40;
const SPACING = 30;
/** Called to the window, they walk off to the left, out of the widest stage's view. */
const EXIT = -146;
/** The dado rail, and the floor behind the railing. */
const DADO = 44;
const FLOOR_Y = 59;
const WALL = '#8f9a83';
const INK = '#2d2a2e';
const WOOD = { light: '#8a7356', base: '#6d5a43', seam: '#5d4c38', dark: '#4a3c2d' };

const PIGEON_IMG = spriteImage(PIGEON);
const PECK_IMG = spriteImage(PIGEON_PECK);
const BUCKET_IMG = spriteImage(BUCKET);
const WET_FLOOR_IMG = spriteImage(WET_FLOOR);
const CLOCK_IMG = spriteImage(CLOCK);
const PLANT_IMG = { fresh: spriteImage(PLANTS.fresh), droopy: spriteImage(PLANTS.droopy), dead: spriteImage(PLANTS.dead) };
const FINE_IMG = card(textImage('FINE', INK), '#efe8d2', 2);
const FLAG_COLOURS = ['#b0433a', '#d9b44a', '#3d6e8f'];
const FLAGS = FLAG_COLOURS.map((c) => spriteImage({ rows: FLAG, palette: { f: c } }));
/** The same flags on a rope that hangs straight down: they stand out sideways. */
const SIDE_FLAGS = FLAGS.map((f) => turned(f, 'ccw'));

type Props = {
  /** The week's seed: whoever sits on the bench today depends on it. */
  seed: number;
  day: number;
  queue: GeneratedApplicant[];
  /** How many have been called to the window: they have left the queue. */
  called: number;
  /** Minutes since the Ministry opened at 09:00. */
  minutes: number;
  /** The ticket number on the board. */
  serving: number;
  /** For the PA: whether the window is open yet, how many have been stamped, and whether the day is done. */
  opened: boolean;
  decided: number;
  over: boolean;
};

export function Hall({ seed, day, queue: papers, called, minutes, serving, opened, decided, over }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const room = useRoom(ref);
  const rows = hallRows(room.width, room.height);
  // Hall pixels across the stage (one spare for an odd width), with the core in the middle on a whole hall pixel.
  const cols = Math.ceil(room.width / PX) + 1;
  const left = Math.round(CORE / 2 - room.width / (2 * PX));
  const extra = Math.max(0, rows - STRIP);
  const floor = Math.max(0, Math.min(extra - HEADROOM, FLOOR));
  /** How much lower than in the strip the railing, the people and the floor stand: the ceiling is that much higher. */
  const drop = extra - floor;
  /** The board, the banner and the PA hang from that higher ceiling on rods and strings half as long. */
  const hang = Math.floor(drop / 2);

  const rain = day === 3 || day === 6;
  // Humanity Day's last papers are the clerk's own, and the clerk is not in the queue: behind the desk.
  const queue = papers.filter((a) => a.cast !== 'clerk');
  const light = tint(minutes);
  return (
    <div ref={ref} className={`hall hall-day-${day}`}>
      <svg
        className="hall-scene"
        style={{ height: rows * PX }}
        viewBox={`${left} 0 ${cols} ${rows}`}
        preserveAspectRatio="xMinYMin slice"
        shapeRendering="crispEdges"
        role="img"
        aria-label={`The waiting hall. ${Math.max(0, queue.length - called)} waiting.`}
      >
        <defs>
          <pattern id="hall-tiles" width="40" height="12" patternUnits="userSpaceOnUse">
            <rect width="40" height="12" fill="#b3ad97" />
            <rect width="20" height="6" fill="#a7a18a" />
            <rect x="20" y="6" width="20" height="6" fill="#a7a18a" />
          </pattern>
        </defs>

        <rect x={LEFT} width={RIGHT - LEFT} height={rows} fill={WALL} />
        {Array.from({ length: 13 }, (_, i) => -160 + i * 80).map((x) => (
          <rect key={x} x={x} y={4} width={1} height={drop + DADO - 4} fill="#86917a" />
        ))}

        {/* The wall's lower half and the floor, and what hangs on the wall, all at the people's height. */}
        <g transform={`translate(0 ${drop})`}>
          <rect x={LEFT} y={DADO} width={RIGHT - LEFT} height={2} fill="#4b5446" />
          <rect x={LEFT} y={DADO + 2} width={RIGHT - LEFT} height={FLOOR_Y - DADO - 4} fill="#5d6858" />
          <rect x={LEFT} y={FLOOR_Y - 2} width={RIGHT - LEFT} height={2} fill="#3a4136" />
          <rect x={LEFT} y={FLOOR_Y} width={RIGHT - LEFT} height={FLOOR + 40} fill="url(#hall-tiles)" />
          <OutsideWindow x={-118} minutes={minutes} rain={rain} />
          <OutsideWindow x={-48} minutes={minutes} rain={rain} />
          <OutsideWindow x={690} minutes={minutes} rain={rain} />
          <Door x={626} />
          <Clock minutes={minutes} />
          <Poster x={408} text={POSTERS[day - 1][0]} />
          <WindowTwo day={day} />
          <Poster x={568} text={POSTERS[day - 1][1]} />
        </g>

        <Ceiling day={day} />
        <Board serving={serving} hang={hang} />
        <Banner day={day} hang={hang} />

        <g transform={`translate(0 ${drop})`}>
          <PlantStand day={day} />
          <Pew seed={seed} day={day} />
          <g>
            {queue
              .map((a, i) => <InLine key={i} applicant={a} slot={i - called} delay={i} />)
              .reverse()}
          </g>
          <Railing />
          {day >= 3 && <Pixels image={WET_FLOOR_IMG} x={196} y={64} />}
          {day >= 4 && <Pixels image={BUCKET_IMG} x={237} y={69} />}
          {PERCHES.slice(0, PIGEONS_BY_DAY[day - 1]).map((p, i) => (
            <Pigeon key={i} perch={p} />
          ))}
        </g>
        {day >= 5 && <FallenBanner top={BANNER_Y + hang} bottom={drop + FLOOR_Y} />}
        {day >= 4 && <Drip to={drop + 70} />}

        <rect x={LEFT} width={RIGHT - LEFT} height={rows} fill={light.color} opacity={light.opacity} className="hall-tint" />
        <PublicAddress day={day} opened={opened} decided={decided} total={papers.length} over={over} hang={hang} />
      </svg>
    </div>
  );
}

/** The shift's box below the desk rail, in design pixels: the stage's size, whatever is on the desk. */
function useRoom(ref: RefObject<HTMLElement | null>) {
  const [room, setRoom] = useState({ width: 1240, height: 780 });
  useLayoutEffect(() => {
    const shift = ref.current?.parentElement;
    if (!shift) return;
    const measure = () =>
      setRoom((r) => (r.width === shift.clientWidth && r.height === shift.clientHeight ? r : { width: shift.clientWidth, height: shift.clientHeight }));
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const watch = new ResizeObserver(measure);
    watch.observe(shift);
    return () => watch.disconnect();
  }, [ref]);
  return room;
}

const PIGEONS_BY_DAY = [0, 1, 2, 2, 3, 4, 5];
/**
 * Where the week's pigeons turn up, in order: the first at the back of the queue, on its railing (it has
 * been asked to take a number), the next on the back of the pew, then another on the railing, one on the
 * floor and one on Window 2's ledge. The walkers pace the railing or the floor; the others turn about
 * where they are.
 */
type Perch = { x: number; y: number; seconds: number; phase: number; walks: boolean };
const PERCHES: readonly Perch[] = [
  { x: 356, y: RAIL - 8, seconds: 19, phase: 0.1, walks: true },
  { x: 506, y: 21, seconds: 13, phase: 0.3, walks: false },
  { x: 200, y: RAIL - 8, seconds: 23, phase: 0.6, walks: true },
  { x: 150, y: 67, seconds: 17, phase: 0.8, walks: true },
  { x: 545, y: 38, seconds: 29, phase: 0.45, walks: false },
];

/** A pigeon: it steps a hall pixel at a time, and pecks with its own frame, not by tipping over. */
function Pigeon({ perch }: { perch: Perch }) {
  return (
    <g transform={`translate(${perch.x} ${perch.y})`}>
      <g
        className={perch.walks ? 'pigeon walking' : 'pigeon'}
        style={{ animationDuration: `${perch.seconds}s`, animationDelay: `${-perch.seconds * perch.phase}s` }}
      >
        <g className="pigeon-stand">
          <Pixels image={PIGEON_IMG} />
        </g>
        <g className="pigeon-peck">
          <Pixels image={PECK_IMG} />
        </g>
      </g>
    </g>
  );
}

/** Light through the windows: morning, noon, a long afternoon, then the evening comes in orange. */
function tint(minutes: number) {
  if (minutes < 180) return { color: '#fff4d6', opacity: 0 };
  if (minutes < 360) return { color: '#ffcf87', opacity: ((minutes - 180) / 180) * 0.1 };
  return { color: '#ff8a4a', opacity: 0.1 + ((minutes - 360) / 120) * 0.14 };
}

function sky(minutes: number, rain: boolean) {
  if (rain) return '#8d99a0';
  if (minutes < 240) return '#b8cfd8';
  if (minutes < 380) return '#d3cfb0';
  return '#d4935f';
}

const Pixels = memo(function Pixels({ image, x = 0, y = 0 }: { image: PixelImage; x?: number; y?: number }) {
  const paths = useMemo(() => pixelPaths(image), [image]);
  return (
    <g transform={`translate(${x} ${y})`}>
      {paths.map(({ color, d }) => (
        <path key={color} fill={color} d={d} />
      ))}
    </g>
  );
});

/** How long a step up the queue takes, and how long the walk off to the window takes, however far. */
const STEP_MS = 1300 / (SPACING / 2);
const WALK_OFF_MS = 1300;

/**
 * Someone in the queue. When the queue moves up they shuffle along, and once called they walk off to the
 * left, towards the window: two hall pixels a step, always from wherever they have got to, so a call that
 * comes mid-shuffle never leaves anyone between pixels.
 */
const InLine = memo(function InLine({ applicant, slot, delay }: { applicant: GeneratedApplicant; slot: number; delay: number }) {
  const image = useMemo(() => drawPortrait(applicant.photo), [applicant.photo]);
  const gone = slot < 0;
  const x = gone ? EXIT : QUEUE_X + slot * SPACING;
  const ref = useRef<SVGGElement>(null);
  const at = useRef(x);
  const walk = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || at.current === x) return;
    // Mid-walk, where the walk has got to is a whole step; otherwise, where they stood.
    const from = walk.current?.playState === 'running' ? Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).e / 2) * 2 : at.current;
    walk.current?.cancel();
    walk.current = null;
    at.current = x;
    const steps = Math.abs(x - from) / 2;
    // With motion reduced (App.tsx puts a class on the page for it), they are simply there.
    if (!steps || !el.animate || document.documentElement.classList.contains('motion-reduced')) return;
    walk.current = el.animate(
      [{ transform: `translate(${from}px, ${QUEUE_Y}px)` }, { transform: `translate(${x}px, ${QUEUE_Y}px)` }],
      { duration: gone ? WALK_OFF_MS : steps * STEP_MS, easing: `steps(${steps})` },
    );
  }, [x, gone]);
  return (
    <g ref={ref} className={gone ? 'queuer gone' : 'queuer'} style={{ transform: `translate(${x}px, ${QUEUE_Y}px)` }}>
      <g className="bob" style={{ animationDelay: `${-delay * 0.73}s` }}>
        <Pixels image={image} />
      </g>
    </g>
  );
});

function Ceiling({ day }: { day: number }) {
  // One more flickering tube each day; from day 5, one has given up. The two at the ends are only on the widest stages.
  const tubes = [20, 170, 320, 470, 620];
  return (
    <g>
      <rect x={LEFT} width={RIGHT - LEFT} height={4} fill="#26281f" />
      {Array.from({ length: 13 }, (_, i) => -160 + i * 80).map((x) => (
        <rect key={x} x={x} width={1} height={4} fill="#1d1f18" />
      ))}
      {[-130, 770].map((x) => (
        <Tube key={x} x={x} dead={false} flicker={false} delay={0} />
      ))}
      {tubes.map((x, i) => {
        const dead = day >= 5 && i === 2;
        return <Tube key={x} x={x} dead={dead} flicker={!dead && i < day - 1 && i % 2 === day % 2} delay={i * 1.7} />;
      })}
      {day >= 4 && (
        // A ceiling tile has come down at one corner and hangs there; the leak runs off its end.
        <g>
          <rect x={226} width={18} height={4} fill="#0b0c09" />
          {Array.from({ length: 5 }, (_, i) => (
            <g key={i}>
              <rect x={226 + i * 3} y={3 + i} width={3} height={1} fill="#8f9186" />
              <rect x={226 + i * 3} y={4 + i} width={3} height={1} fill="#5f6257" />
            </g>
          ))}
        </g>
      )}
    </g>
  );
}

function Tube({ x, dead, flicker, delay }: { x: number; dead: boolean; flicker: boolean; delay: number }) {
  return (
    <g className={flicker ? 'tube flicker' : 'tube'} style={{ animationDelay: `${-delay}s` }}>
      <rect x={x - 2} y={1} width={48} height={3} fill="#3a3c33" />
      <rect x={x} y={2} width={44} height={1} fill={dead ? '#6b6e62' : '#eef5dc'} />
      {!dead && <rect x={x - 6} y={4} width={56} height={10} fill="#fbffe8" opacity={0.07} />}
    </g>
  );
}

function OutsideWindow({ x, minutes, rain }: { x: number; minutes: number; rain: boolean }) {
  return (
    <g>
      <rect x={x} y={8} width={44} height={36} fill="#3b3f36" />
      <rect x={x + 2} y={10} width={40} height={32} fill={sky(minutes, rain)} className="sky" />
      {rain &&
        [4, 12, 20, 28, 36].map((dx, i) => (
          <rect key={dx} className="rain" x={x + dx} y={10} width={1} height={4} fill="#c8d4da" style={{ animationDelay: `${-i * 0.23}s` }} />
        ))}
      <rect x={x + 21} y={10} width={2} height={32} fill="#3b3f36" />
      <rect x={x + 2} y={25} width={40} height={2} fill="#3b3f36" />
      <rect x={x - 2} y={44} width={48} height={2} fill="#4b5446" />
    </g>
  );
}

function Door({ x }: { x: number }) {
  const label = textImage('WAY IN', INK);
  return (
    <g>
      <Pixels image={label} x={x + Math.floor((36 - label.width) / 2)} y={7} />
      <rect x={x} y={14} width={36} height={FLOOR_Y - 14} fill="#3b3f36" />
      <rect x={x + 3} y={17} width={30} height={FLOOR_Y - 17} fill="#6a5a45" />
      <rect x={x + 6} y={20} width={24} height={14} fill="#9fb3b9" />
      <rect x={x + 6} y={40} width={24} height={2} fill="#b9bdb3" />
    </g>
  );
}

/**
 * How far each column of a lettered card drops when it hangs crooked: by letter, `drop(i)` for the i-th,
 * so a letter steps down whole and is never cut in two. Letters are four pixels apart, `pad` in.
 */
const byLetter = (pad: number, letters: number, drop: (letter: number) => number) => (x: number) =>
  drop(Math.max(0, Math.min(letters - 1, Math.floor((x - pad) / 4))));

/** Window 2 votes on leaving the Ministry (days 3 and 4), then leaves it: the real registry forked in two. */
function WindowTwo({ day }: { day: number }) {
  const x = 524;
  const sign = day >= 5 ? 'FORKED' : day >= 3 ? 'VOTING' : 'CLOSED';
  const label = textImage('WINDOW 2', INK);
  const plate = card(textImage(sign, '#9a2f2a'), '#efe8d2', 2);
  // Forked, it has come loose on one side and hangs crooked: drawn so, two letters to a step.
  const hung = day >= 5 ? sheared(plate, byLetter(2, sign.length, (i) => 2 - Math.floor((i * 3) / sign.length))) : plate;
  return (
    <g>
      <Pixels image={label} x={x + Math.floor((38 - label.width) / 2)} y={7} />
      <rect x={x} y={14} width={38} height={32} fill="#3b3f36" />
      <rect x={x + 3} y={17} width={32} height={29} fill="#7b8272" />
      {[21, 25, 29, 33, 37, 41].map((y) => (
        <rect key={y} x={x + 3} y={y} width={32} height={1} fill="#6a7162" />
      ))}
      <Pixels image={hung} x={x + Math.floor((38 - plate.width) / 2)} y={23} />
      <rect x={x - 2} y={46} width={42} height={2} fill={WOOD.dark} />
    </g>
  );
}

/** The cloth of the Ministry's banner, lettered. */
const CLOTH = card(textImage(BANNER, '#f4efe0'), '#8e3a33', 2);
/** It is tied by its left corner over the front of the queue, with a line of bunting from its right corner to a second string. */
const BANNER_X = 58;
const BANNER_Y = 5;
const ROPE = 120;

/**
 * It hangs on two strings from the ceiling, `hang` long. It sags on day 3, and by day 5 it hangs from one
 * corner. Nobody has been up a ladder.
 */
function Banner({ day, hang }: { day: number; hang: number }) {
  return useMemo(() => {
    const top = BANNER_Y + hang;
    const start = BANNER_X + CLOTH.width;
    const end = start + ROPE - 1;
    const string = (x: number, length: number) => <rect x={x} y={4} width={1} height={length} fill="#3a3c33" />;
    if (day >= 5) {
      // The cloth's right corner has let go: the bunting hangs from its string, and the cloth from its other corner (FallenBanner).
      return (
        <g>
          {string(BANNER_X, top - 4)}
          {string(end, top + 30)}
          {[0, 1, 2].map((i) => (
            <Pixels key={i} image={SIDE_FLAGS[(i + 1) % 3]} x={end + 1} y={top + 4 + i * 10} />
          ))}
        </g>
      );
    }
    // From day 3 its right corner has slipped: the cloth drops a pixel a word towards it, and the rope climbs back to its string.
    const slip = day >= 3 ? 3 : 0;
    const words = BANNER.split(' ');
    const word = (letter: number) => BANNER.slice(0, letter + 1).split(' ').length - 1;
    const cloth = slip ? sheared(CLOTH, byLetter(2, BANNER.length, (i) => Math.floor((word(i) * (slip + 1)) / words.length))) : CLOTH;
    const rope = (x: number) => top + slip - Math.floor(((x - start) * (slip + 1)) / (ROPE + 1));
    const flags = Array.from({ length: ROPE / 10 - 1 }, (_, i) => start + 2 + i * 10);
    return (
      <g>
        {string(BANNER_X, top - 4)}
        {string(end, top - 4)}
        <Pixels image={cloth} x={BANNER_X} y={top} />
        {Array.from({ length: ROPE }, (_, i) => start + i).map((x) => (
          <rect key={x} x={x} y={rope(x)} width={1} height={1} fill="#3a3c33" />
        ))}
        {flags.map((x, i) => (
          <Pixels key={x} image={FLAGS[i % 3]} x={x} y={rope(x + 3) + 1} />
        ))}
      </g>
    );
  }, [day, hang]);
}

/** From day 5 the cloth hangs straight down from its left corner (its string ends at `top`) to the floor, lettered down its length. */
function FallenBanner({ top, bottom }: { top: number; bottom: number }) {
  const cloth = useMemo(() => turned(CLOTH, 'cw'), []);
  const length = Math.min(cloth.height, bottom - top);
  const shown = useMemo(() => ({ ...cloth, height: length, pixels: cloth.pixels.slice(0, length * cloth.width) }), [cloth, length]);
  return <Pixels image={shown} x={BANNER_X} y={top} />;
}

function Board({ serving, hang }: { serving: number; hang: number }) {
  const x = 2;
  const y = 5 + hang;
  const width = 54;
  const label = textImage('NOW SERVING', '#b8513a');
  const number = textImage(String(serving).padStart(3, '0'), '#ff6a3d');
  return (
    <g>
      <rect x={x + 8} y={4} width={1} height={hang + 1} fill="#3a3c33" />
      <rect x={x + width - 9} y={4} width={1} height={hang + 1} fill="#3a3c33" />
      <rect x={x} y={y} width={width} height={25} fill="#0c0d0a" />
      <rect x={x + 2} y={y + 2} width={width - 4} height={21} fill="#161812" />
      <Pixels image={label} x={x + Math.floor((width - label.width) / 2)} y={y + 4} />
      <g transform={`translate(${x + Math.floor((width - 2 * number.width) / 2)} ${y + 11}) scale(2)`}>
        <Pixels image={number} />
      </g>
    </g>
  );
}

/** A straight line of whole pixels from a to b. */
function line(a: { x: number; y: number }, b: { x: number; y: number }) {
  const points: { x: number; y: number }[] = [];
  const [dx, dy] = [Math.abs(b.x - a.x), -Math.abs(b.y - a.y)];
  const [sx, sy] = [a.x < b.x ? 1 : -1, a.y < b.y ? 1 : -1];
  let { x, y } = a;
  let err = dx + dy;
  for (;;) {
    points.push({ x, y });
    if (x === b.x && y === b.y) return points;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

/** On the wall by the end of the queue, under the PA's horn. Its hands are drawn in pixels, by the minute. */
function Clock({ minutes }: { minutes: number }) {
  const at = { x: 384, y: 15 };
  const centre = { x: at.x + 9, y: at.y + 9 };
  const hand = (turn: number, length: number) =>
    line(centre, { x: centre.x + Math.round(length * Math.sin(turn * 2 * Math.PI)), y: centre.y - Math.round(length * Math.cos(turn * 2 * Math.PI)) });
  const hands = [...hand(((9 + minutes / 60) % 12) / 12, 4), ...hand((Math.floor(minutes) % 60) / 60, 6)];
  return (
    <g>
      <Pixels image={CLOCK_IMG} x={at.x} y={at.y} />
      <path d={hands.map(({ x, y }) => `M${x} ${y}h1v1h-1z`).join('')} fill={INK} />
    </g>
  );
}

function Poster({ x, text }: { x: number; text: string }) {
  const lines = wrapWords(text, 9).slice(0, 4);
  const y = 8;
  return (
    <g>
      <rect x={x} y={y} width={44} height={34} fill="#e7dfc6" />
      <rect x={x} y={y} width={44} height={4} fill="#b0433a" />
      <rect x={x + 44} y={y + 1} width={1} height={34} fill="#6d7661" />
      {lines.map((line, i) => {
        const img = textImage(line, INK);
        return <Pixels key={i} image={img} x={x + Math.floor((44 - img.width) / 2)} y={y + 7 + i * 7} />;
      })}
    </g>
  );
}

/** The Ministry plant, on a stand under the board, by how the week is going; from day 5 a card on the stand says it is fine. */
function PlantStand({ day }: { day: number }) {
  const x = 12;
  // The stand's top, a little above the railing's, so the plant and its card are whole on the shortest strip.
  const top = RAIL - 4;
  return (
    <g>
      <Pixels image={PLANT_IMG[day <= 2 ? 'fresh' : day <= 4 ? 'droopy' : 'dead']} x={x + 4} y={top - 15} />
      {day >= 5 && <Pixels image={FINE_IMG} x={x + 20} y={top - FINE_IMG.height} />}
      <rect x={x} y={top} width={42} height={2} fill={WOOD.light} />
      <rect x={x + 2} y={top + 2} width={2} height={18} fill={WOOD.dark} />
      <rect x={x + 38} y={top + 2} width={2} height={18} fill={WOOD.dark} />
    </g>
  );
}

/**
 * A waiting-room pew by Window 2, and whoever waits on it for Window 2, which has other plans; on
 * Humanity Day, Pat, registered at last, waiting for five o'clock. Its back is boards with the wall
 * showing between them, as a bench's is and a counter's is not; they sit in front of it, on its seat,
 * with an empty place beside them and its legs on the floor.
 */
function Pew({ seed, day }: { seed: number; day: number }) {
  const sitter = useMemo(() => drawPortrait(day === LAST_DAY ? CAST_PORTRAITS.pat : generatePortrait(Math.imul(seed, 97) + day)), [seed, day]);
  const x = 456;
  const width = 64;
  const seat = 55;
  return (
    <g>
      {/* The back: a top rail and two boards between its end posts. */}
      {[x, x + width - 3].map((px) => (
        <rect key={px} x={px} y={28} width={3} height={seat - 28} fill={WOOD.dark} />
      ))}
      <rect x={x + 3} y={29} width={width - 6} height={3} fill={WOOD.light} />
      <rect x={x + 3} y={32} width={width - 6} height={1} fill={WOOD.seam} />
      {[37, 45].map((y) => (
        <g key={y}>
          <rect x={x + 3} y={y} width={width - 6} height={4} fill={WOOD.base} />
          <rect x={x + 3} y={y + 4} width={width - 6} height={1} fill={WOOD.seam} />
        </g>
      ))}
      <Pixels image={sitter} x={x + 4} y={QUEUE_Y + 6} />
      {/* The seat in front of them, its edge, and four legs. */}
      <rect x={x - 1} y={seat} width={width + 2} height={2} fill={WOOD.light} />
      <rect x={x - 1} y={seat + 2} width={width + 2} height={2} fill={WOOD.dark} />
      {[x + 1, x + 21, x + width - 23, x + width - 3].map((lx) => (
        <rect key={lx} x={lx} y={seat + 4} width={2} height={7} fill={WOOD.dark} />
      ))}
    </g>
  );
}

function Railing() {
  return (
    <g>
      <rect x={58} y={RAIL - 2} width={4} height={19} fill={WOOD.dark} />
      <rect x={60} y={RAIL} width={318} height={3} fill={WOOD.light} />
      <rect x={60} y={RAIL + 3} width={318} height={11} fill={WOOD.base} />
      {Array.from({ length: 31 }, (_, i) => (
        <rect key={i} x={68 + i * 10} y={RAIL + 3} width={1} height={11} fill={WOOD.seam} />
      ))}
      <rect x={376} y={RAIL - 2} width={4} height={19} fill={WOOD.dark} />
    </g>
  );
}

/** The leak, off the end of the fallen tile and down into the bucket, a hall pixel at a time. */
function Drip({ to }: { to: number }) {
  const fall = to - 10;
  return (
    <rect
      className="drip"
      x={240}
      y={10}
      width={1}
      height={2}
      fill="#8fc0dc"
      style={{ '--fall': `${fall}px`, animationTimingFunction: `steps(${fall})` } as CSSProperties}
    />
  );
}

/** How long the PA's words hang in the hall after an announcement. */
const ANNOUNCEMENT_MS = 9000;
/** The loudspeaker, on a bracket from the ceiling over the clock at the end of the queue, facing up the queue. */
const SPEAKER = { x: 386, y: 5 };
/** Characters that fit one line of the PA's bubble, in the hall's own lettering. */
const BUBBLE_LINE = 52;
const PA_INK = '#1d1f1a';

/**
 * The hall's PA: a loudspeaker on the ceiling. It reads each of the day's announcements once, at a quiet
 * moment (the first as the window opens, the rest spread over the day's stamps), and its words hang in
 * a bubble while it speaks, in the hall's own lettering, as the posters are. Otherwise it says nothing,
 * and nothing funny sits on screen all shift.
 */
function PublicAddress({ day, opened, decided, total, over, hang }: { day: number; opened: boolean; decided: number; total: number; over: boolean; hang: number }) {
  const lines = ANNOUNCEMENTS[day - 1];
  // The last announcement due: number k waits for the k-th share of the day's stamps.
  const due = opened ? lines.reduce((last, _, k) => (decided >= Math.round((k * total) / lines.length) ? k : last), 0) : -1;
  const [showing, setShowing] = useState<number | null>(null);
  const read = useRef(-1);
  useEffect(() => {
    if (showing !== null || over || read.current >= due) return;
    read.current += 1;
    setShowing(read.current);
    pa();
  }, [due, showing, over]);
  useEffect(() => {
    if (showing === null) return;
    const timer = window.setTimeout(() => setShowing(null), ANNOUNCEMENT_MS);
    return () => window.clearTimeout(timer);
  }, [showing]);
  // Humanity Day at five: one chime, and the PA says the income is open.
  useEffect(() => {
    if (over && day === LAST_DAY) pa();
  }, [over, day]);
  const text = over ? (day === LAST_DAY ? CLOSING.open : CLOSING.closed) : showing !== null ? lines[showing] : null;
  const rows = useMemo(() => (text ? wrapWords(text, BUBBLE_LINE).map((line) => textImage(line, PA_INK)) : []), [text]);
  const width = Math.max(0, ...rows.map((r) => r.width)) + 6;
  const height = rows.length * 7 + 4;
  const x = SPEAKER.x;
  const y = SPEAKER.y + hang;
  // The bubble's right edge, just short of the horn's mouth.
  const edge = x - 4;
  return (
    <g className="pa" role="status" aria-label="Announcements" aria-live="polite">
      {/* A horn loudspeaker on a bracket, its mouth towards the queue. */}
      <rect x={x + 9} y={4} width={1} height={hang + 1} fill="#3a3c33" />
      <rect x={x + 5} y={y} width={7} height={9} fill="#6f7466" />
      <rect x={x + 2} y={y + 2} width={3} height={5} fill="#6f7466" />
      <rect x={x} y={y + 1} width={2} height={7} fill="#2d2f29" />
      {text && (
        <g key={text} className="pa-bubble">
          <rect x={edge} y={y + 3} width={2} height={3} fill={PA_INK} />
          <rect x={edge + 2} y={y + 4} width={2} height={1} fill={PA_INK} />
          <rect x={edge - width - 2} y={y - 1} width={width + 2} height={height + 2} fill={PA_INK} />
          <rect x={edge - width - 1} y={y} width={width} height={height} fill="#f1ead5" />
          {rows.map((image, i) => (
            <Pixels key={i} image={image} x={edge - width + 2} y={y + 2 + i * 7} />
          ))}
          <text className="sr-only">{text}</text>
        </g>
      )}
    </g>
  );
}
