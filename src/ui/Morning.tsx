import { ENVELOPE, OFFER_LETTER } from '../content/desk';
import type { Credit } from '../economy/economy';
import { listOf } from '../gen/letters';

/** What else is on the blotter with the morning paper: Likeness's letter, its envelope, a second note from the supervisor. */
export type MorningPapers = {
  /** Day 3, until it is signed or handed in. */
  letter: boolean;
  /** Likeness's fee, the morning after the clerk stamped a unit in with the letter signed. */
  envelope: Credit | null;
  /** The supervisor's second note. */
  note: string | null;
};

// A click leaves the focus where it was, so Space still opens the window.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** Likeness Robotics' letter, on top of the paper: SIGN IT, or HAND IT IN. Left on the desk, it goes in the drawer unsigned. */
export function OfferLetter({ onSign, onHandIn }: { onSign: () => void; onHandIn: () => void }) {
  return (
    <article className="offer-letter" aria-label="Letter from Likeness Robotics" data-testid="offer-letter">
      <p className="offer-head">{OFFER_LETTER.head}</p>
      {OFFER_LETTER.lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
      <p className="offer-sign">{OFFER_LETTER.sign}</p>
      <div className="offer-actions">
        <button className="offer-button offer-sign-it" onClick={onSign} onMouseDown={keepFocus}>
          {OFFER_LETTER.signIt}
        </button>
        <button className="offer-button offer-hand-in" onClick={onHandIn} onMouseDown={keepFocus}>
          {OFFER_LETTER.handIn}
        </button>
      </div>
    </article>
  );
}

/** Likeness's envelope: its fee for yesterday's units, counted on tonight's statement. */
export function Envelope({ credit }: { credit: Credit }) {
  const fill = (line: string) => line.replace('{amount}', String(credit.count * credit.each)).replace('{names}', listOf(credit.for ?? []));
  return (
    <aside className="envelope" aria-label="Envelope from Likeness Robotics" data-testid="envelope">
      <p className="offer-head">{ENVELOPE.head}</p>
      {ENVELOPE.lines.map((line) => (
        <p key={line}>{fill(line)}</p>
      ))}
    </aside>
  );
}

/** The supervisor's second note, stuck to the morning paper. */
export function SecondNote({ text }: { text: string }) {
  return (
    <aside className="sticky second-note" aria-label="Second note from your supervisor" data-testid="second-note">
      {text}
      <span className="sticky-sign">S.</span>
    </aside>
  );
}
