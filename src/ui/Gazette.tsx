import { UNITS } from '../content/cast';
import { GAZETTE_TITLE, WALL_STAMPS, WELCOME } from '../content/gazette';
import { UNIT_FACES, UNIT_LAMPS } from '../content/portraits';
import type { Gazette, WallEntry } from '../gen/gazette';
import { PHRASE } from '../rules/phrase';
import type { Video } from '../rules/types';
import { FramePicture } from './Documents';
import { PixelPortrait } from './PixelPortrait';

/** Day 1's unit, as its video filmed it: the frame its night lamp came on in, which the day 2 paper reprints. */
const FIRST_UNIT_VIDEO: Video = { face: UNIT_FACES[0], transcript: PHRASE, blinked: true, ...(UNIT_LAMPS[0] ?? {}) };

/**
 * The morning paper's front page, on the blotter until the window opens: a headline about yesterday at
 * Window 3, a photo of it and one line of the week's news. Nothing in it costs shift time, and the day's
 * new rule is not in it: it is in the rulebook, with its reason.
 */
export function GazettePage({ gazette }: { gazette: Gazette }) {
  return (
    <article className="gazette" aria-label="The Registry Gazette" data-testid="gazette">
      <header className="gazette-mast">
        <span>Day {gazette.day}</span>
        <h2>{GAZETTE_TITLE}</h2>
        <span>{gazette.countdown}</span>
      </header>
      <h3 className="gazette-headline" data-testid="headline">
        {gazette.headline}
      </h3>
      <figure className="gazette-photo">
        {gazette.robot ? (
          <span className="gazette-still" data-testid="gazette-still">
            <FramePicture video={FIRST_UNIT_VIDEO} frame={3} title={`${UNITS[0].name}, frame 3`} />
          </span>
        ) : (
          <Wall entries={gazette.wall} subject={gazette.subject} />
        )}
        <figcaption data-testid="report">{gazette.caption}</figcaption>
      </figure>
      <p className="gazette-thread" data-testid="thread">
        {gazette.thread}
      </p>
      {gazette.small && <p className="gazette-small">{gazette.small}</p>}
    </article>
  );
}

/** Yesterday's faces, each stamped as it left the window; the one the headline is about, ringed. */
function Wall({ entries, subject }: { entries: WallEntry[]; subject: string | null }) {
  if (entries.length === 0) return null;
  return (
    <ol className="gazette-wall" data-testid="wall">
      {entries.map((e, i) => (
        <li key={`${e.name}-${i}`} className={`wall-face wall-${e.stamp}${e.name === subject ? ' ringed' : ''}`} aria-label={`${e.name}: ${WALL_STAMPS[e.stamp]}`}>
          <PixelPortrait portrait={e.face} scale={1} crop={{ x: 4, y: 2, width: 32, height: 34 }} />
          <span className="wall-stamp" aria-hidden="true">
            {WALL_STAMPS[e.stamp]}
          </span>
        </li>
      ))}
    </ol>
  );
}

/** Day 1: the supervisor's letter, where the Gazette will be from tomorrow. */
export function WelcomeLetter() {
  return (
    <article className="welcome" aria-label="Welcome letter" data-testid="welcome">
      <h2>{WELCOME.title}</h2>
      {WELCOME.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="welcome-sign">{WELCOME.signature}</p>
    </article>
  );
}
