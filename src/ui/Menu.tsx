import { useEffect, useRef } from 'react';
import { MENU } from '../content/menu';

/** What the menu is showing: the break, the card on coming back, or one of the two questions before losing something. */
export type MenuView = 'paused' | 'resumed' | 'setAside' | 'day' | 'week';

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
  saving: boolean;
  onView: (view: MenuView) => void;
  onClose: () => void;
  onDayAgain: () => void;
  onNewWeek: () => void;
};

/**
 * The clerk's break, over the whole desk: nothing can be read or stamped behind it, and the shift
 * clock stops. Escape backs out of a question, then closes the menu.
 */
export function Menu({ view, where, day, days, savings, dayBegun, saving, onView, onClose, onDayAgain, onNewWeek }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = dialog.current!;
    if (!d.open) d.showModal();
    // The safe choice has the focus, so a Space pressed out of habit loses nothing.
    d.querySelector<HTMLElement>('[data-safe]')?.focus();
  }, [view]);

  const fill = (text: string) =>
    text.replace('{day}', String(day)).replace('{days}', `${days} ${days === 1 ? 'day' : 'days'}`).replace('{savings}', String(savings));
  const asking = view === 'day' || view === 'week';

  return (
    <dialog
      ref={dialog}
      className="menu"
      aria-labelledby="menu-title"
      onCancel={(e) => {
        e.preventDefault();
        if (asking) onView('paused');
        else onClose();
      }}
      // The browser may close it on its own (a second Escape); the desk follows.
      onClose={onClose}
    >
      <article className="notice menu-card">
        <p className="notice-head">{MENU.head}</p>
        {asking ? (
          <>
            <h2 id="menu-title">{fill(view === 'day' ? MENU.confirmDay.title : MENU.confirmWeek.title)}</h2>
            <p>{fill(view === 'day' ? MENU.confirmDay.line : MENU.confirmWeek.line)}</p>
            <div className="menu-actions">
              <button className="screen-button" data-safe onClick={onClose}>
                {MENU.keep}
              </button>
              <button className="screen-button menu-destroy" onClick={view === 'day' ? onDayAgain : onNewWeek}>
                {fill(view === 'day' ? MENU.confirmDay.yes : MENU.confirmWeek.yes)}
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 id="menu-title">{MENU[view].title}</h2>
            <p className="menu-where">{where}</p>
            <p>{MENU[view].line}</p>
            <div className="menu-actions">
              <button className="screen-button" data-safe onClick={onClose}>
                {view === 'setAside' ? MENU.begin : MENU.back}
              </button>
            </div>
            {view !== 'setAside' && (
              <div className="menu-restarts">
                {dayBegun && (
                  <button className="menu-link" onClick={() => onView('day')}>
                    {fill(MENU.dayAgain)}
                  </button>
                )}
                <button className="menu-link" onClick={() => onView('week')}>
                  {MENU.newWeek}
                </button>
              </div>
            )}
            <p className="menu-saved">{saving ? MENU.saved : MENU.unsaved}</p>
          </>
        )}
      </article>
    </dialog>
  );
}
