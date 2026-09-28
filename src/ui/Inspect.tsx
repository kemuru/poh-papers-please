import { createContext, useContext, type ReactNode } from 'react';
import { sameItem, type Item } from '../rules/inspect';

// Inspect mode on the desk: with it on, the things on the desk become things to point at. The
// comparison itself is src/rules/inspect.ts; this only draws the pointing.

type Inspecting = {
  on: boolean;
  /** The first of the two things picked, waiting for the second. */
  picked: Item | null;
  /** The two things of the last comparison that disagreed. */
  flagged: Item[];
  pick: (item: Item) => void;
};

export const InspectContext = createContext<Inspecting>({ on: false, picked: null, flagged: [], pick: () => {} });

/** A short name for an item, for tests and screen readers. */
export const itemKey = (item: Item) =>
  item.kind === 'frame' ? `frame-${item.frame}` : item.kind === 'rule' ? `rule-${item.rule}` : item.kind;

/** Something on the desk that can be pointed at in inspect mode. */
export function Inspectable({ item, label, className, children }: { item: Item; label: string; className?: string; children: ReactNode }) {
  const { on, picked, flagged, pick } = useContext(InspectContext);
  const state = flagged.some((f) => sameItem(f, item)) ? ' flagged' : picked && sameItem(picked, item) ? ' picked' : '';
  return (
    <span
      className={`inspectable${on ? ' on' : ''}${state}${className ? ` ${className}` : ''}`}
      data-inspect={itemKey(item)}
      role={on ? 'button' : undefined}
      tabIndex={on ? 0 : undefined}
      aria-label={on ? `Inspect ${label}` : undefined}
      aria-pressed={on ? state !== '' : undefined}
      onClick={on ? () => pick(item) : undefined}
      onKeyDown={on ? (e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(item)) : undefined}
    >
      {children}
    </span>
  );
}
