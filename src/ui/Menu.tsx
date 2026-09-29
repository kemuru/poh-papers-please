import { useEffect, useRef } from 'react';
import { MENU } from '../content/menu';
import { DAYS } from '../gen/day';
import { SettingsPanel } from './SettingsPanel';
import { shiftOver, type GameState } from './week';

/** What the menu is showing: the break, or one of the questions before losing something. */
export type MenuView = 'paused' | 'day' | 'week' | 'back';

type Props = {
  view: MenuView;
  /** Where the week stands, e.g. "Day 3 · At the window · 2:40 left". */
  where: string;
  day: number;
  /** Days at the window this week, and the savings a new week would throw away. */
  days: number;
  savings: number;
  /** Whether anything has happened since this morning's paper. */
  dayBegun: boolean;
  /** The earlier mornings of this week that can be gone back to, and the one being asked about. */
  earlier: readonly number[];
  backDay: number | null;
  saving: boolean;
  onView: (view: MenuView) => void;
  onBack: (day: number) => void;
  onClose: () => void;
  onDayAgain: () => void;
  onBackTo: (day: number) => void;
  onNewWeek: () => void;
  onBoard: () => void;
};

/** Where the week stands, for the top of the menu and the notice board. */
export function whereNow(s: GameState, clockSeconds: number): string {
  const limit = DAYS[s.day - 1].shiftSeconds;
  const line = (() => {
    if (s.phase !== 'shift') return MENU.where[s.phase];
    if (!s.opened) return MENU.where.morning;
    if (shiftOver(s)) return MENU.where.closing;
    return limit === null ? MENU.where.open : MENU.where.left;
  })();
  const left = Math.max(0, Math.ceil((limit ?? 0) - clockSeconds));
  return line.replace('{day}', String(s.day)).replace('{left}', `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`);
}

/**
 * The clerk's break, over the whole desk: nothing can be read or stamped behind it, and the shift
 * clock stops. Escape backs out of a question, then closes the menu.
 */
export function Menu(p: Props) {
  const { view, where, day, days, savings, dayBegun, earlier, backDay, saving } = p;
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current!;
    if (!d.open) d.showModal();
    // The safe choice has the focus, so a Space pressed out of habit loses nothing.
    d.querySelector<HTMLElement>('[data-safe]')?.focus();
  }, [view]);

  const lost = backDay === null ? 0 : day - backDay + 1;
  const fill = (text: string) =>
    text
      .replaceAll('{day}', String(view === 'back' && backDay !== null ? backDay : day))
      .replace('{days}', view === 'back' ? `${lost} ${lost === 1 ? 'day' : 'days'}` : `${days} ${days === 1 ? 'day' : 'days'}`)
      .replace('{savings}', String(savings));
  const asking = view === 'day' || view === 'week' || view === 'back';
  const question = view === 'day' ? MENU.confirmDay : view === 'week' ? MENU.confirmWeek : MENU.confirmBack;
  const yes = () => (view === 'day' ? p.onDayAgain() : view === 'week' ? p.onNewWeek() : backDay !== null && p.onBackTo(backDay));

  return (
    <dialog
      ref={dialog}
      className="menu"
      aria-labelledby="menu-title"
      onCancel={(e) => {
        e.preventDefault();
        if (asking) p.onView('paused');
        else p.onClose();
      }}
      // The browser may close it on its own (a second Escape); the desk follows.
      onClose={p.onClose}
    >
      <article className="notice menu-card">
        <p className="notice-head">{MENU.head}</p>
        {asking ? (
          <>
            <h2 id="menu-title">{fill(question.title)}</h2>
            <p>{fill(question.line)}</p>
            <div className="menu-actions">
              <button className="screen-button" data-safe onClick={p.onClose}>
                {MENU.keep}
              </button>
              <button className="screen-button menu-destroy" onClick={yes}>
                {fill(question.yes)}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="menu-title">{MENU.paused.title}</h2>
            <p className="menu-where">{where}</p>
            <p>{MENU.paused.line}</p>
            <div className="menu-actions">
              <button className="screen-button" data-safe onClick={p.onClose}>
                {MENU.back}
              </button>
            </div>
            {earlier.length > 0 && (
              <div className="menu-mornings">
                <span>{MENU.backTo}</span>
                {earlier.map((d) => (
                  <button key={d} className="menu-link" onClick={() => p.onBack(d)}>
                    {MENU.backDay.replace('{day}', String(d))}
                  </button>
                ))}
              </div>
            )}
            <div className="menu-restarts">
              {dayBegun && (
                <button className="menu-link" onClick={() => p.onView('day')}>
                  {fill(MENU.dayAgain)}
                </button>
              )}
              <button className="menu-link" onClick={() => p.onView('week')}>
                {MENU.newWeek}
              </button>
              <button className="menu-link" onClick={p.onBoard}>
                {MENU.board}
              </button>
            </div>
            <SettingsPanel />
            <p className="menu-saved">{saving ? MENU.saved : MENU.unsaved}</p>
          </>
        )}
      </article>
    </dialog>
  );
}
