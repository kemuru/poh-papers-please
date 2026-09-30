import { UNITS } from '../content/cast';
import { GAZETTE_TITLE, WALL_STAMPS, WELCOME } from '../content/gazette';
import { UNIT_FACES, UNIT_LAMPS } from '../content/portraits';
import { drawPortrait, PORTRAIT_HEIGHT, PORTRAIT_WIDTH } from '../gen/drawPortrait';
import type { Gazette, WallEntry } from '../gen/gazette';
import { PHRASE } from '../rules/phrase';
import type { Video } from '../rules/types';
import { CREST, DeskSprite, MASTHEAD, PHOTO_RING } from './DeskArt';
import { FramePicture, frameShot } from './Documents';
import { PixelPortrait, pixelPaths } from './PixelPortrait';

/** Day 1's unit, as its video filmed it: the frame its night lamp came on in, which the day 2 paper reprints. */
const FIRST_UNIT_VIDEO: Video = { face: UNIT_FACES[0], transcript: PHRASE, blinked: true, ...(UNIT_LAMPS[0] ?? {}) };
const REPRINTED_FRAME = 3;

/**
 * The lamp's own pixels in the reprinted frame: whatever drawing it lit changes. The paper prints the frame in
 * its own muted tones, as it prints every face, and the light it is about in its colour, over them.
 */
const REPRINTED_LAMP = (() => {
  const { portrait, pose } = frameShot(FIRST_UNIT_VIDEO, REPRINTED_FRAME);
  const { lamp: _lamp, ...unlit } = portrait;
  const lit = drawPortrait(portrait, pose);
  const bare = drawPortrait(unlit, pose);
  return pixelPaths({ ...lit, pixels: lit.pixels.map((c, i) => (c !== bare.pixels[i] ? c : null)) });
})();

/** How the photo sorts yesterday's faces: everyone registered, then everyone refused and whoever went with them, then whoever the clock sent home. */
const STAMP_ORDER: readonly WallEntry['stamp'][] = ['registered', 'court', 'refused', 'removed', 'home'];

/** A face on the photo, as a press photo crops it, crown to chin: 22 by 24 portrait pixels, at one art pixel each. */
const PHOTO_CROP = { x: 9, y: 7, width: 22, height: 24 };

/**
 * The morning paper's front page, on the blotter until the window opens: a headline about yesterday at
 * Window 3, a photo of it and one line of the week's news. Nothing in it costs shift time, and the day's
 * new rule is not in it: it is in the rulebook, with its reason.
 */
export function GazettePage({ gazette }: { gazette: Gazette }) {
  return (
    <article className="front-page" aria-label="The Registry Gazette" data-testid="gazette">
      <header className="front-mast">
        <h2 className="front-title">
          <DeskSprite sprite={MASTHEAD} />
          <span className="sr-only">{GAZETTE_TITLE}</span>
        </h2>
        <p className="front-day">Day {gazette.day}</p>
        <p className="front-count">{gazette.countdown}</p>
      </header>
      <h3 className="front-headline" data-testid="headline">
        <Headline text={gazette.headline} />
      </h3>
      <figure className={gazette.robot ? 'front-photo front-reprint' : 'front-photo'}>
        {gazette.robot ? (
          // The frame the clerk saw, reprinted large in newsprint's tones, and its light in colour; the story runs round it.
          <span className="front-still" data-testid="gazette-still">
            <FramePicture video={FIRST_UNIT_VIDEO} frame={REPRINTED_FRAME} title={`${UNITS[0].name}, frame ${REPRINTED_FRAME}`} />
            <svg className="front-lamp" viewBox={`0 0 ${PORTRAIT_WIDTH} ${PORTRAIT_HEIGHT}`} shapeRendering="crispEdges" aria-hidden="true">
              {REPRINTED_LAMP.map(({ color, d }) => (
                <path key={color} fill={color} d={d} />
              ))}
            </svg>
          </span>
        ) : (
          <Wall entries={gazette.wall} subject={gazette.subject} />
        )}
        <figcaption className="front-caption" data-testid="report">
          {gazette.caption}
        </figcaption>
      </figure>
      <p className="front-thread" data-testid="thread">
        {gazette.thread}
      </p>
      {gazette.small && <p className="front-notice">{gazette.small}</p>}
    </article>
  );
}

/** A headline set so that a number never wraps away from the word it counts: "WINDOW / 3" reads as two stories. */
function Headline({ text }: { text: string }) {
  return text.split(/((?:WINDOW|RULE|DAY) \d+)/).map((part, i) => (i % 2 === 1 ? <span key={i} className="headline-keep">{part}</span> : part));
}

/**
 * Yesterday's faces, each stamped as it left the window, printed as the paper prints a line-up: a row for
 * each stamp, the stamp at its head. The one the headline is about is ringed.
 */
function Wall({ entries, subject }: { entries: WallEntry[]; subject: string | null }) {
  if (entries.length === 0) return null;
  const rows = STAMP_ORDER.map((stamp) => ({ stamp, faces: entries.filter((e) => e.stamp === stamp) })).filter((row) => row.faces.length > 0);
  return (
    <ul className="front-wall" data-testid="wall">
      {rows.map(({ stamp, faces }) => (
        <li key={stamp} className="wall-row">
          <span className="wall-stamp" aria-hidden="true">
            {WALL_STAMPS[stamp]}
          </span>
          <ul className="wall-faces">
            {faces.map((e, i) => (
              <li key={`${e.name}-${i}`} className="wall-face" aria-label={`${e.name}: ${WALL_STAMPS[e.stamp]}`}>
                <PixelPortrait portrait={e.face} scale={2} crop={PHOTO_CROP} />
                {e.name === subject && <DeskSprite sprite={PHOTO_RING} className="wall-ring" />}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  );
}

/** Day 1: the supervisor's letter, on the Ministry's letterhead, where the Gazette will be from tomorrow. */
export function WelcomeLetter() {
  return (
    <article className="letterhead welcome" aria-label="Welcome letter" data-testid="welcome">
      <header className="letterhead-top">
        <DeskSprite sprite={CREST} />
        <span className="letterhead-name">{WELCOME.head}</span>
      </header>
      <h2 className="letter-subject">{WELCOME.title}</h2>
      {WELCOME.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="letter-sign">{WELCOME.signature}</p>
    </article>
  );
}
