import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BOARD, LETTER_HINTS } from '../content/board';
import { ENDINGS, HEADHUNTED } from '../content/verdicts';
import { LETTERS, type LetterId } from '../economy/endings';
import { setMusicScene } from './music';
import type { ClerkRecord } from './record';
import { SettingsPanel } from './SettingsPanel';
import './board.css';

/** The week in this browser, as the board describes it. */
export type SavedWeek = {
  /** Where it stands: "Day 3 · At the window · 2:40 left". */
  where: string;
  /** It has reached its letter: nothing is lost by starting another. */
  ended: boolean;
  seed: number;
  /** Days at the window, and the savings another week would throw away. */
  days: number;
  savings: number;
};

type Props = {
  saved: SavedWeek | null;
  /** A save was found and could not be kept. */
  setAside: boolean;
  record: ClerkRecord;
  /** Today's week: its date as the clerk reads it, and its seed. */
  today: { label: string; seed: number; date: string };
  onContinue: () => void;
  onNewWeek: () => void;
  onToday: () => void;
  onNight: () => void;
};

const fill = (line: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce((out, [key, value]) => out.replaceAll(`{${key}}`, String(value)), line);

/** The Ministry's notice board, where the game opens: the week under way, a vacancy, today's week, the night shift, and what the clerk has found. */
export function Board({ saved, setAside, record, today, onContinue, onNewWeek, onToday, onNight }: Props) {
  // Starting another week while one is under way asks first, as the menu does.
  const [asking, setAsking] = useState<'new' | 'today' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => first.current?.focus(), [asking]);
  // The board is in the hall: the morning's chord, from the first click.
  useEffect(() => setMusicScene('morning', 1), []);

  const underway = saved !== null && !saved.ended;
  const ask = (which: 'new' | 'today', go: () => void) => (underway ? setAsking(which) : go());
  const todayUnderway = underway && saved.seed === today.seed;
  const todayDone = record.today?.date === today.date ? record.today : null;
  const nightOpen = record.letters.length > 0;

  const copy = async (card: string) => {
    try {
      await navigator.clipboard.writeText(card);
      setCopied(BOARD.today.copied);
    } catch {
      setCopied(BOARD.today.uncopied);
    }
  };

  if (asking && saved) {
    return (
      <main className="board-screen">
        <article className="notice board-confirm" aria-labelledby="board-confirm-title">
          <p className="notice-head">{BOARD.kicker}</p>
          <h2 id="board-confirm-title">{BOARD.confirm.title}</h2>
          <p>{fill(BOARD.confirm.line, { days: `${saved.days} ${saved.days === 1 ? 'day' : 'days'}`, savings: saved.savings })}</p>
          <div className="menu-actions">
            <button ref={first} className="screen-button" onClick={() => setAsking(null)}>
              {BOARD.confirm.keep}
            </button>
            <button className="screen-button menu-destroy" onClick={asking === 'new' ? onNewWeek : onToday}>
              {BOARD.confirm.yes}
            </button>
          </div>
        </article>
      </main>
    );
  }

  return (
    <main className="board-screen">
      <div className="board" role="region" aria-label="Notice board">
        <header className="board-poster">
          <p className="board-kicker">{BOARD.kicker}</p>
          <h1>{BOARD.title}</h1>
          <p className="board-subtitle">{BOARD.subtitle}</p>
        </header>
        <div className="board-columns">
          <section className="board-notices" aria-label="Notices">
            {setAside && <p className="board-note">{BOARD.setAside}</p>}
            {saved && (
              <Notice head={BOARD.week.head} lines={[saved.where]} className="notice-week" testId="board-continue">
                <button ref={first} className="screen-button" onClick={onContinue}>
                  {BOARD.week.continue}
                </button>
              </Notice>
            )}
            <Notice head={BOARD.vacancy.head} lines={BOARD.vacancy.lines} className="notice-vacancy" testId="board-vacancy">
              <button ref={saved ? undefined : first} className={saved ? 'board-button' : 'screen-button'} onClick={() => ask('new', onNewWeek)}>
                {BOARD.vacancy.action}
              </button>
            </Notice>
            <Notice
              head={BOARD.today.head}
              lines={[today.label, todayDone ? fill(BOARD.today.finished, { letter: todayDone.letter, savings: todayDone.savings }) : BOARD.today.line]}
              className="notice-today"
              testId="board-today"
            >
              <button className="board-button" onClick={todayUnderway ? onContinue : () => ask('today', onToday)}>
                {todayUnderway ? BOARD.today.resume : todayDone ? BOARD.today.again : BOARD.today.action}
              </button>
              {todayDone && (
                <button className="board-button" onClick={() => void copy(todayDone.card)}>
                  {BOARD.today.copy}
                </button>
              )}
              {copied && (
                <span className="board-copied" role="status">
                  {copied}
                </span>
              )}
            </Notice>
            <Notice
              head={BOARD.night.head}
              lines={nightOpen ? [BOARD.night.line, ...(record.endless !== null ? [fill(BOARD.night.best, { count: record.endless })] : [])] : [BOARD.night.locked]}
              className={nightOpen ? 'notice-night' : 'notice-night locked'}
              testId="board-night"
            >
              {nightOpen && (
                <button className="board-button" onClick={onNight}>
                  {BOARD.night.action}
                </button>
              )}
            </Notice>
          </section>
          <section className="board-side">
            <Letters found={record.letters} />
            <Record record={record} />
            <SettingsPanel />
          </section>
        </div>
      </div>
    </main>
  );
}

function Notice({ head, lines, className, testId, children }: { head: string; lines: readonly string[]; className: string; testId: string; children?: ReactNode }) {
  return (
    <article className={`board-notice ${className}`} data-testid={testId}>
      <span className="board-pin" aria-hidden="true" />
      <h2>{head}</h2>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <div className="board-notice-actions">{children}</div>
    </article>
  );
}

const TITLES: Record<LetterId, { title: string; stamp: string }> = {
  promoted: ENDINGS.promoted,
  reclassified: ENDINGS.reclassified,
  superseded: ENDINGS.superseded,
  replaced: ENDINGS.replaced,
  fired: ENDINGS.fired,
  headhunted: { title: HEADHUNTED.title, stamp: 'Likeness' },
};

/** The letters found so far, each pinned with its stamp; the rest blank but for a hint. */
function Letters({ found }: { found: readonly LetterId[] }) {
  return (
    <section className="board-letters" aria-label="Letters found" data-testid="letters">
      <h2>
        {BOARD.letters.head} <span>{fill(BOARD.letters.count, { found: found.length, all: LETTERS.length })}</span>
      </h2>
      <ul>
        {LETTERS.map((id) => {
          const has = found.includes(id);
          return (
            <li key={id} className={has ? `board-slip found slip-${id}` : 'board-slip'} data-letter={id} data-found={has}>
              {has ? (
                <>
                  <strong>{TITLES[id].title}</strong>
                  <span className="board-slip-stamp">{TITLES[id].stamp}</span>
                </>
              ) : (
                <>
                  <strong aria-label="Not found yet">?</strong>
                  <span className="board-slip-hint">{LETTER_HINTS[id]}</span>
                </>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Record({ record }: { record: ClerkRecord }) {
  const or = (v: number | string | null, unit = '') => (v === null ? BOARD.record.none : `${v}${unit}`);
  const rows = [
    [BOARD.record.weeks, String(record.weeks)],
    [BOARD.record.savings, or(record.bestSavings, ' PNK')],
    [BOARD.record.grade, or(record.bestGrade && `${record.bestGrade} Class`)],
    [BOARD.record.night, or(record.endless)],
  ];
  return (
    <section className="board-record" aria-label={BOARD.record.head} data-testid="record">
      <h2>{BOARD.record.head}</h2>
      <dl>
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
