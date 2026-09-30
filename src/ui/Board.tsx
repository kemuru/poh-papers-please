import { useEffect, useRef, useState, type Ref } from 'react';
import { BOARD, LETTER_HINTS } from '../content/board';
import { MENU } from '../content/menu';
import { ENDINGS, HEADHUNTED } from '../content/verdicts';
import { LETTERS, type LetterId } from '../economy/endings';
import { CREST, CREST_LIGHT, DeskSprite, LIKENESS_MARK, MOON, PADLOCK, PIN_BRASS, PIN_RED, POSTER_TITLE } from './DeskArt';
import { setMusicScene } from './music';
import type { ClerkRecord } from './record';
import { SettingsPanel, VolumeFaders } from './SettingsPanel';
import './board.css';

/** The week in this browser, as the board describes it. */
export type SavedWeek = {
  /** Where it stands, as the menu types it: "Day 3, at the window, 2:40 left". */
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

/**
 * The Ministry's notice board in the hall, where the game opens: its poster, the week under way or else the
 * vacancy, today's week, the night shift, the letters the clerk has found and the clerk's record, pinned to
 * cork, and the settings on a switch plate screwed to the frame.
 */
export function Board({ saved, setAside, record, today, onContinue, onNewWeek, onToday, onNight }: Props) {
  // Starting another week while one is under way asks first, as the menu does.
  const [asking, setAsking] = useState<'new' | 'today' | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  useEffect(() => (asking ? keep.current : first.current)?.focus(), [asking]);
  // Escape keeps the week, as the menu's own question does.
  useEffect(() => {
    if (!asking) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape' || e.repeat) return;
      e.preventDefault();
      setAsking(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [asking]);
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

  // The vacancy is the first thing to press on a first visit; once a week is under way, its Continue is.
  const vacancy = (
    <Vacancy primary={!saved} keyRef={saved ? undefined : first} onStart={() => ask('new', onNewWeek)} />
  );

  return (
    <main className="board-screen">
      <div className="board" role="region" aria-label={BOARD.regions.board} inert={asking !== null}>
        <div className="board-cork">
          <Poster />
          <section className="board-notices" aria-label={BOARD.regions.notices}>
            {/* The first notice hangs beside the poster: the week under way, or else the vacancy. */}
            {saved ? (
              // The clerk's time card for the week under way, where it stands typed on it.
              <article className="board-notice notice-week" data-testid="board-continue">
                <DeskSprite sprite={PIN_RED} className="board-pin" />
                <h2>{BOARD.week.head}</h2>
                <p className="notice-typed">{saved.where}</p>
                <div className="board-notice-actions">
                  <button ref={first} className="screen-button" onClick={onContinue}>
                    {BOARD.week.continue}
                  </button>
                </div>
              </article>
            ) : (
              vacancy
            )}
            {/* The rest along the row under the poster, each on its own stock, pinned where it was put up. */}
            <div className="board-row">
              {setAside && <p className="board-note">{BOARD.setAside}</p>}
              <TodayLeaf
                label={today.label}
                line={todayDone ? fill(BOARD.today.finished, { letter: todayDone.letter, savings: todayDone.savings }) : BOARD.today.line}
                action={todayUnderway ? BOARD.today.resume : todayDone ? BOARD.today.again : BOARD.today.action}
                onAction={todayUnderway ? onContinue : () => ask('today', onToday)}
                onCopy={todayDone ? () => void copy(todayDone.card) : null}
                copied={copied}
              />
              <div className="board-stack">
                {/* The Ministry never closes: an enamel sign screwed to the board, the moon on it, or its padlock until it opens. */}
                <article className={nightOpen ? 'board-notice notice-night' : 'board-notice notice-night locked'} data-testid="board-night">
                  <h2>
                    {BOARD.night.head}
                    <DeskSprite sprite={nightOpen ? MOON : PADLOCK} className="notice-mark" />
                  </h2>
                  {(nightOpen ? [BOARD.night.line, ...(record.endless !== null ? [fill(BOARD.night.best, { count: record.endless })] : [])] : [BOARD.night.locked]).map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {nightOpen && (
                    <div className="board-notice-actions">
                      <button className="steel-key" onClick={onNight}>
                        {BOARD.night.action}
                      </button>
                    </div>
                  )}
                </article>
                {/* The volumes, under it: the board plays the hall's music, and its rail is not here. */}
                <section className="switch-plate volume-plate" aria-label={MENU.settings.volume}>
                  <VolumeFaders compact />
                </section>
              </div>
            </div>
          </section>
          <Letters found={record.letters} />
          {/* Down the right of the board: the vacancy, while a week is under way; the record; the settings. */}
          <div className="board-side">
            {saved && vacancy}
            <Record record={record} />
            {/* The settings: two switches on a steel plate screwed to the frame. */}
            <div className="switch-plate">
              <SettingsPanel volumes={false} />
            </div>
          </div>
        </div>
      </div>
      {asking && saved && (
        // The Ministry's form for it, on a clipboard hung over the board.
        <div className="board-ask">
          <div className="menu board-clipboard">
            <article className="notice menu-card" role="dialog" aria-modal="true" aria-labelledby="board-confirm-title" aria-describedby="board-confirm-line">
              <p className="notice-head">{BOARD.window}</p>
              <h2 id="board-confirm-title">{BOARD.confirm.title}</h2>
              <p id="board-confirm-line">
                {fill(BOARD.confirm.line, { days: saved.days === 1 ? BOARD.confirm.day : fill(BOARD.confirm.days, { n: saved.days }), savings: saved.savings })}
              </p>
              <div className="menu-actions">
                <button ref={keep} className="screen-button" onClick={() => setAsking(null)}>
                  {BOARD.confirm.keep}
                </button>
                <button className="red-key" onClick={asking === 'new' ? onNewWeek : onToday}>
                  {BOARD.confirm.yes}
                </button>
              </div>
            </article>
          </div>
        </div>
      )}
    </main>
  );
}

/** The Ministry's poster: its seal and name, the title in its poster capitals, and the game's name on a banner under it. */
function Poster() {
  return (
    <header className="board-poster">
      <DeskSprite sprite={PIN_BRASS} className="board-pin pin-left" />
      <DeskSprite sprite={PIN_BRASS} className="board-pin pin-right" />
      <p className="poster-ministry">
        <DeskSprite sprite={CREST_LIGHT} />
        {BOARD.ministry}
        <DeskSprite sprite={CREST_LIGHT} />
      </p>
      <h1 className="poster-title">
        <DeskSprite sprite={POSTER_TITLE} />
        <span className="sr-only">{BOARD.title}</span>
      </h1>
      <p className="poster-stamp">{BOARD.subtitle}</p>
      <p className="poster-window">{BOARD.window}</p>
    </header>
  );
}

/** Clerk wanted: the Ministry's vacancy, printed on Form 1's stock under a double rule, the seal in its corner. */
function Vacancy({ primary, keyRef, onStart }: { primary: boolean; keyRef?: Ref<HTMLButtonElement>; onStart: () => void }) {
  return (
    <article className="board-notice notice-vacancy" data-testid="board-vacancy">
      <DeskSprite sprite={PIN_BRASS} className="board-pin" />
      <header className="notice-form-head">
        <h2>{BOARD.vacancy.head}</h2>
        <DeskSprite sprite={CREST} className="notice-crest" />
      </header>
      {BOARD.vacancy.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <div className="board-notice-actions">
        <button ref={keyRef} className={primary ? 'screen-button' : 'steel-key'} onClick={onStart}>
          {BOARD.vacancy.action}
        </button>
      </div>
    </article>
  );
}

/**
 * Today's week: a leaf torn off the Ministry's calendar, its red head, the day's number printed large with the
 * weekday and the month beside it, and the week's line under them.
 */
function TodayLeaf({
  label,
  line,
  action,
  onAction,
  onCopy,
  copied,
}: {
  label: string;
  line: string;
  action: string;
  onAction: () => void;
  onCopy: (() => void) | null;
  copied: string | null;
}) {
  // "Wednesday 30 September 2026", as the leaf prints it: the weekday, the number, the month and year.
  const [weekday, day, ...month] = label.split(' ');
  return (
    <article className="board-notice notice-today" data-testid="board-today">
      <DeskSprite sprite={PIN_RED} className="board-pin" />
      <h2>{BOARD.today.head}</h2>
      {month.length === 2 ? (
        <p className="leaf-date">
          <span className="leaf-weekday">{weekday}</span> <span className="leaf-day">{day}</span> <span className="leaf-month">{month.join(' ')}</span>
        </p>
      ) : (
        <p className="leaf-date">{label}</p>
      )}
      <p>{line}</p>
      <div className="board-notice-actions">
        <button className="steel-key" onClick={onAction}>
          {action}
        </button>
        {onCopy && (
          <button className="steel-key" onClick={onCopy}>
            {BOARD.today.copy}
          </button>
        )}
        {/* Always there, so a screen reader hears it fill. */}
        <span className="board-copied" role="status">
          {copied}
        </span>
      </div>
    </article>
  );
}

const TITLES: Record<LetterId, { title: string; stamp: string }> = {
  promoted: ENDINGS.promoted,
  reclassified: ENDINGS.reclassified,
  superseded: ENDINGS.superseded,
  replaced: ENDINGS.replaced,
  fired: ENDINGS.fired,
  headhunted: { title: HEADHUNTED.title, stamp: BOARD.likenessStamp },
};

/** The letters found so far, each pinned with its stamp; the rest blank cards but for a hint in pencil. */
function Letters({ found }: { found: readonly LetterId[] }) {
  return (
    <section className="board-letters" aria-label={BOARD.letters.head} data-testid="letters">
      <h2>
        {BOARD.letters.head} <span>{fill(BOARD.letters.count, { found: found.length, all: LETTERS.length })}</span>
      </h2>
      <ul>
        {LETTERS.map((id) => {
          const has = found.includes(id);
          return (
            <li key={id} className={has ? `board-slip found slip-${id}` : 'board-slip'} data-letter={id} data-found={has}>
              <DeskSprite sprite={has ? PIN_RED : PIN_BRASS} className="board-pin" />
              {has ? (
                <>
                  {id === 'headhunted' ? <DeskSprite sprite={LIKENESS_MARK} className="slip-seal" /> : <DeskSprite sprite={CREST} className="slip-seal" />}
                  <strong>{TITLES[id].title}</strong>
                  <span className="board-slip-stamp">{TITLES[id].stamp}</span>
                </>
              ) : (
                <>
                  <strong>
                    <span aria-hidden="true">?</span>
                    <span className="sr-only">{BOARD.letters.unfound}</span>
                  </strong>
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

/** The clerk's record: a ruled index card, what the clerk has done here typed in against each line. */
function Record({ record }: { record: ClerkRecord }) {
  const { none } = BOARD.record;
  const rows = [
    [BOARD.record.weeks, String(record.weeks)],
    [BOARD.record.savings, record.bestSavings === null ? none : fill(BOARD.record.pnk, { savings: record.bestSavings })],
    [BOARD.record.grade, record.bestGrade === null ? none : fill(BOARD.record.class, { grade: record.bestGrade })],
    [BOARD.record.night, record.endless === null ? none : fill(BOARD.record.stamped, { count: record.endless })],
  ];
  return (
    <section className="board-record" aria-label={BOARD.record.head} data-testid="record">
      <DeskSprite sprite={PIN_BRASS} className="board-pin" />
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
