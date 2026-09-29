import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ANNOUNCEMENTS, BANNER, CLOSING, POSTERS } from '../content/hall';
import { CAST_PORTRAITS } from '../content/portraits';
import type { GeneratedApplicant } from '../gen/applicant';
import { drawPortrait, type PixelImage } from '../gen/drawPortrait';
import { LAST_DAY } from '../gen/day';
import { generatePortrait } from '../gen/portrait';
import { pixelPaths } from './PixelPortrait';
import { pa } from './sound';
import { BUCKET, PIGEON, PLANTS, spriteImage, textImage, WET_FLOOR, wrapWords } from './sprites';

// The waiting hall, seen from Window 3: the day's queue behind the railing, and a ministry that
// comes apart a little more each day. Pure decoration; nothing here is evidence.

const W = 800;
/** Tall enough for the floor the pigeons walk on, and no more: the people are the point. */
const H = 112;
/** The front of the queue, nearest the window. Everyone behind stands SPACING further right. */
const QUEUE_X = 134;
const QUEUE_Y = 30;
const SPACING = 30;
const WALL = '#8f9a83';
/** How far the walls and floor carry on past the scene, in scene pixels. */
const BEYOND = 400;

const PIGEON_IMG = spriteImage(PIGEON);
const BUCKET_IMG = spriteImage(BUCKET);
const WET_FLOOR_IMG = spriteImage(WET_FLOOR);
const PLANT_IMG = { fresh: spriteImage(PLANTS.fresh), droopy: spriteImage(PLANTS.droopy), dead: spriteImage(PLANTS.dead) };

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
  const rain = day === 3 || day === 6;
  // Humanity Day's last papers are the clerk's own, and the clerk is not in the queue: behind the desk.
  const queue = papers.filter((a) => a.cast !== 'clerk');
  return (
    <div className={`hall hall-day-${day}`}>
      <svg
        className="hall-scene"
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMax meet"
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
          {/* Wide open at the sides, but nothing hangs below the floor. */}
          <clipPath id="hall-room">
            <rect x={-BEYOND} width={W + 2 * BEYOND} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#hall-room)">

        {/* The room runs on past the scene's edges, for screens where the scene is scaled down to fit. */}
        <rect x={-BEYOND} width={W + 2 * BEYOND} height={H} fill={WALL} />
        {[80, 160, 240, 320, 400, 480, 560, 640, 720].map((x) => (
          <rect key={x} x={x} y={10} width={1} height={52} fill="#86917a" />
        ))}
        <rect x={-BEYOND} y={62} width={W + 2 * BEYOND} height={2} fill="#4b5446" />
        <rect x={-BEYOND} y={64} width={W + 2 * BEYOND} height={18} fill="#5d6858" />
        <rect x={-BEYOND} y={82} width={W + 2 * BEYOND} height={3} fill="#3a4136" />
        <rect x={-BEYOND} y={85} width={W + 2 * BEYOND} height={H - 85} fill="url(#hall-tiles)" />

        <Ceiling day={day} />
        <OutsideWindow x={700} minutes={minutes} rain={rain} />
        <Door />
        <WindowTwo day={day} />
        <Banner day={day} />
        <Board serving={serving} />
        <Clock minutes={minutes} />
        <Poster x={62} text={POSTERS[day - 1][0]} />
        <Poster x={572} text={POSTERS[day - 1][1]} />
        <Pixels image={PLANT_IMG[day <= 2 ? 'fresh' : day <= 4 ? 'droopy' : 'dead']} x={106} y={70} />
        {day >= 5 && (
          <g>
            <rect x={116} y={58} width={1} height={14} fill="#6b5238" />
            <rect x={108} y={52} width={19} height={8} fill="#efe8d2" />
            <Pixels image={textImage('FINE', '#2d2a2e')} x={110} y={54} />
          </g>
        )}
        <Bench seed={seed} day={day} />

        <g>
          {queue
            .map((a, i) => <InLine key={i} applicant={a} slot={i - called} delay={i} />)
            .reverse()}
        </g>
        <Railing />

        {day >= 3 && <Pixels image={WET_FLOOR_IMG} x={262} y={91} />}
        {day >= 4 && (
          <>
            <rect className="drip" x={408} y={11} width={1} height={2} fill="#8fc0dc" />
            <Pixels image={BUCKET_IMG} x={404} y={97} />
          </>
        )}
        {PIGEON_WALKS.slice(0, PIGEONS_BY_DAY[day - 1]).map((p, i) => (
          <g key={i} transform={`translate(${p.x} ${p.y})`}>
            <g className="pigeon" style={{ animationDuration: `${p.seconds}s`, animationDelay: `${-p.seconds * p.phase}s` }}>
              <Pixels image={PIGEON_IMG} />
            </g>
          </g>
        ))}

        <rect x={-BEYOND} width={W + 2 * BEYOND} height={H} fill={tint(minutes).color} opacity={tint(minutes).opacity} className="hall-tint" />
        <PublicAddress day={day} opened={opened} decided={decided} total={papers.length} over={over} />
        </g>
      </svg>
    </div>
  );
}

const PIGEONS_BY_DAY = [0, 1, 2, 2, 3, 4, 5];
const PIGEON_WALKS = [
  { x: 560, y: 96, seconds: 19, phase: 0.1 },
  { x: 340, y: 101, seconds: 23, phase: 0.6 },
  { x: 700, y: 93, seconds: 13, phase: 0.3 },
  { x: 480, y: 102, seconds: 17, phase: 0.8 },
  { x: 210, y: 98, seconds: 29, phase: 0.45 },
];

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

/** Someone in the queue. Once called, they walk off to the left, towards the window. */
const InLine = memo(function InLine({ applicant, slot, delay }: { applicant: GeneratedApplicant; slot: number; delay: number }) {
  const image = useMemo(() => drawPortrait(applicant.photo), [applicant.photo]);
  const x = slot < 0 ? -60 : QUEUE_X + slot * SPACING;
  return (
    <g className={slot < 0 ? 'queuer gone' : 'queuer'} style={{ transform: `translate(${x}px, ${QUEUE_Y}px)` }}>
      <g className="bob" style={{ animationDelay: `${-delay * 0.73}s` }}>
        <Pixels image={image} />
      </g>
    </g>
  );
});

function Ceiling({ day }: { day: number }) {
  const tubes = [40, 190, 340, 490, 640];
  // One more flickering tube each day; from day 5, one has given up.
  return (
    <g>
      <rect x={-BEYOND} width={W + 2 * BEYOND} height={10} fill="#26281f" />
      {[40, 120, 200, 280, 360, 440, 520, 600, 680, 760].map((x) => (
        <rect key={x} x={x} width={1} height={10} fill="#1d1f18" />
      ))}
      {tubes.map((x, i) => {
        const dead = day >= 5 && i === 2;
        const flicker = !dead && i < day - 1 && i % 2 === (day % 2);
        return (
          <g key={x} className={flicker ? 'tube flicker' : 'tube'} style={{ animationDelay: `${-i * 1.7}s` }}>
            <rect x={x - 2} y={2} width={48} height={5} fill="#3a3c33" />
            <rect x={x} y={4} width={44} height={2} fill={dead ? '#6b6e62' : '#eef5dc'} />
            {!dead && <rect x={x - 10} y={7} width={64} height={12} fill="#fbffe8" opacity={0.07} />}
          </g>
        );
      })}
      {day >= 4 && (
        <g>
          <rect x={400} y={1} width={18} height={9} fill="#0b0c09" />
        </g>
      )}
    </g>
  );
}

function OutsideWindow({ x, minutes, rain }: { x: number; minutes: number; rain: boolean }) {
  return (
    <g>
      <rect x={x - 3} y={15} width={48} height={44} fill="#3b3f36" />
      <rect x={x} y={18} width={42} height={38} fill={sky(minutes, rain)} className="sky" />
      {rain &&
        [4, 12, 20, 28, 36].map((dx, i) => (
          <rect key={dx} className="rain" x={x + dx} y={18} width={1} height={5} fill="#c8d4da" style={{ animationDelay: `${-i * 0.23}s` }} />
        ))}
      <rect x={x + 20} y={18} width={2} height={38} fill="#3b3f36" />
      <rect x={x} y={36} width={42} height={2} fill="#3b3f36" />
      <rect x={x - 5} y={58} width={52} height={3} fill="#4b5446" />
    </g>
  );
}

function Door() {
  return (
    <g>
      <rect x={752} y={26} width={36} height={59} fill="#3b3f36" />
      <rect x={755} y={29} width={30} height={56} fill="#6a5a45" />
      <rect x={758} y={33} width={24} height={16} fill="#9fb3b9" />
      <rect x={758} y={60} width={24} height={2} fill="#b9bdb3" />
      <Pixels image={textImage('WAY IN', '#2d2a2e')} x={759} y={18} />
    </g>
  );
}

/** Window 2 votes on leaving the Ministry (days 3 and 4), then leaves it: the real registry forked in two. */
function WindowTwo({ day }: { day: number }) {
  const sign = day >= 5 ? 'FORKED' : day >= 3 ? 'VOTING' : 'CLOSED';
  return (
    <g>
      <Pixels image={textImage('WINDOW 2', '#2d2a2e')} x={14} y={20} />
      <rect x={10} y={27} width={40} height={32} fill="#3b3f36" />
      <rect x={13} y={30} width={34} height={29} fill="#7b8272" />
      {[33, 37, 41, 45, 49, 53].map((y) => (
        <rect key={y} x={13} y={y} width={34} height={1} fill="#6a7162" />
      ))}
      <g transform={`rotate(${day >= 5 ? -6 : 0} 30 42)`}>
        <rect x={16} y={39} width={27} height={9} fill="#efe8d2" />
        <Pixels image={textImage(sign, '#9a2f2a')} x={18} y={41} />
      </g>
    </g>
  );
}

function Banner({ day }: { day: number }) {
  const label = textImage(BANNER, '#f4efe0');
  const cloth = label.width + 8;
  const left = 330;
  // It sags on day 3, and by day 5 it hangs from one corner. Nobody has been up a ladder.
  const angle = day >= 5 ? 78 : day >= 3 ? 5 : 0;
  return (
    <g transform={`rotate(${angle} ${left} 13)`}>
      <rect x={left} y={12} width={60} height={1} fill="#3a3c33" />
      {[0, 10, 20, 30, 40, 50].map((dx, i) => (
        <path key={dx} d={`M${left + dx + 1} 13h8l-4 5z`} fill={['#b0433a', '#d9b44a', '#3d6e8f'][i % 3]} />
      ))}
      <rect x={left + 60} y={11} width={cloth} height={10} fill="#8e3a33" />
      <Pixels image={label} x={left + 64} y={13} />
      <rect x={left + 60 + cloth} y={12} width={60} height={1} fill="#3a3c33" />
      {[0, 10, 20, 30, 40, 50].map((dx, i) => (
        <path key={dx} d={`M${left + 60 + cloth + dx + 1} 13h8l-4 5z`} fill={['#3d6e8f', '#b0433a', '#d9b44a'][i % 3]} />
      ))}
    </g>
  );
}

function Board({ serving }: { serving: number }) {
  const number = textImage(String(serving).padStart(3, '0'), '#ff6a3d');
  return (
    <g>
      <rect x={150} y={11} width={62} height={25} fill="#0c0d0a" />
      <rect x={152} y={13} width={58} height={21} fill="#161812" />
      <Pixels image={textImage('NOW SERVING', '#b8513a')} x={159} y={15} />
      <g transform={`translate(${181 - number.width} 22) scale(2)`}>
        <Pixels image={number} />
      </g>
    </g>
  );
}

function Clock({ minutes }: { minutes: number }) {
  const hour = (((9 + minutes / 60) % 12) / 12) * 360;
  const minute = ((minutes % 60) / 60) * 360;
  const hand = (angle: number, length: number) => ({
    x2: 262 + length * Math.sin((angle * Math.PI) / 180),
    y2: 23 - length * Math.cos((angle * Math.PI) / 180),
  });
  return (
    <g>
      <circle cx={262} cy={23} r={11} fill="#2d2a2e" />
      <circle cx={262} cy={23} r={9} fill="#efe9d6" />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x={261.5} y={14.5} width={1} height={2} fill="#2d2a2e" transform={`rotate(${a} 262 23)`} />
      ))}
      <line x1={262} y1={23} {...hand(hour, 5)} stroke="#2d2a2e" strokeWidth={1.4} shapeRendering="auto" />
      <line x1={262} y1={23} {...hand(minute, 7.5)} stroke="#2d2a2e" strokeWidth={1} shapeRendering="auto" />
    </g>
  );
}

function Poster({ x, text }: { x: number; text: string }) {
  const lines = wrapWords(text, 9).slice(0, 4);
  return (
    <g>
      <rect x={x} y={22} width={44} height={36} fill="#e7dfc6" />
      <rect x={x} y={22} width={44} height={4} fill="#b0433a" />
      <rect x={x + 44} y={23} width={1} height={36} fill="#6d7661" />
      {lines.map((line, i) => {
        const img = textImage(line, '#2d2a2e');
        return <Pixels key={i} image={img} x={x + Math.floor((44 - img.width) / 2)} y={30 + i * 7} />;
      })}
    </g>
  );
}

/** Someone waiting for Window 2, which has other plans; on Humanity Day, Pat, registered at last, waiting for five o'clock. */
function Bench({ seed, day }: { seed: number; day: number }) {
  const sitter = useMemo(() => drawPortrait(day === LAST_DAY ? CAST_PORTRAITS.pat : generatePortrait(Math.imul(seed, 97) + day)), [seed, day]);
  // A pew with a solid back, like the queue's railing: whoever sits on it shows from the chin up.
  return (
    <g>
      <Pixels image={sitter} x={628} y={35} />
      <rect x={604} y={67} width={88} height={3} fill="#8a7356" />
      <rect x={604} y={70} width={88} height={15} fill="#6d5a43" />
      {[614, 626, 638, 650, 662, 674, 686].map((x) => (
        <rect key={x} x={x} y={70} width={1} height={15} fill="#5d4c38" />
      ))}
    </g>
  );
}

function Railing() {
  return (
    <g>
      <rect x={122} y={73} width={4} height={18} fill="#4a3c2d" />
      <rect x={124} y={74} width={440} height={3} fill="#8a7356" />
      <rect x={124} y={77} width={440} height={12} fill="#6d5a43" />
      {Array.from({ length: 44 }, (_, i) => (
        <rect key={i} x={128 + i * 10} y={77} width={1} height={12} fill="#5d4c38" />
      ))}
      <rect x={562} y={73} width={4} height={18} fill="#4a3c2d" />
    </g>
  );
}

/** How long the PA's words hang in the hall after an announcement. */
const ANNOUNCEMENT_MS = 9000;
/** The loudspeaker, on the ceiling between the clock and the banner. */
const SPEAKER = { x: 290, y: 1 };
/** Characters that fit one line of the PA's bubble. */
const BUBBLE_LINE = 62;

/**
 * The hall's PA: a loudspeaker on the ceiling. It reads each of the day's announcements once, at a quiet
 * moment (the first as the window opens, the rest spread over the day's stamps), and its words hang in
 * a bubble while it speaks. Otherwise it says nothing, and nothing funny sits on screen all shift.
 */
function PublicAddress({ day, opened, decided, total, over }: { day: number; opened: boolean; decided: number; total: number; over: boolean }) {
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
  const rows = text ? Math.ceil(text.length / BUBBLE_LINE) : 0;
  const { x, y } = SPEAKER;
  return (
    <g className="pa" role="status" aria-label="Announcements" aria-live="polite">
      {/* A horn loudspeaker on a bracket, facing the queue. */}
      <rect x={x + 3} y={y} width={1} height={3} fill="#3a3c33" />
      <path d={`M${x} ${y + 3}h7v2h3v5h-3v2h-7z`} fill="#6f7466" />
      <path d={`M${x + 10} ${y + 4}h2v7h-2z`} fill="#2d2f29" />
      {text && (
        <g key={text} className="pa-bubble">
          <path d={`M${x + 12} ${y + 7}l6 -2v4z`} fill="#1d1f1a" />
          <rect x={x + 17} y={y + 2} width={230} height={rows * 7 + 5} fill="#1d1f1a" />
          <rect x={x + 18} y={y + 3} width={228} height={rows * 7 + 3} fill="#f1ead5" />
          <foreignObject x={x + 20} y={y + 3.5} width={225} height={rows * 7 + 2}>
            <p className="pa-text">{text}</p>
          </foreignObject>
        </g>
      )}
    </g>
  );
}
