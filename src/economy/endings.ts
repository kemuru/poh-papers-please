// How the week ends (notes/game-design.md, Endings): which letter, and the clerk's grade. Pure: the
// same facts about the week always give the same letter.
import { STARTING_SAVINGS } from './economy';

/** The five letters a week can end with. */
export type EndingId = 'fired' | 'replaced' | 'superseded' | 'reclassified' | 'promoted';

/** Every letter the notice board counts: the five endings, and Likeness's job letter clipped to one of them. */
export const LETTERS = ['promoted', 'reclassified', 'superseded', 'replaced', 'fired', 'headhunted'] as const;
export type LetterId = (typeof LETTERS)[number];

/** Likeness units the clerk stamps into the registry in one week that bring Replaced. */
export const REPLACED_AT = 3;

/** What the evening knows about the week, once the court has sat and the accounts are done. */
export type WeekFacts = {
  /** Savings below zero, from day 2. */
  fired: boolean;
  /** Tonight is Humanity Day's. */
  lastDay: boolean;
  /** Likeness units the clerk stamped in this week (the court's registrations are the court's). */
  unitsStamped: number;
  /** The clerk's clone, registered this week, is on file. */
  cloneOnFile: boolean;
  /** The clerk's own renewal ended registered: by their own stamp, or by a court that dismissed their challenge. */
  clerkRegistered: boolean;
};

/**
 * The letter the week ends with tonight, or null if it goes on: Fired on any evening from day 2, and
 * the rest at five on Humanity Day, in this order.
 */
export function endingTonight(f: WeekFacts): EndingId | null {
  if (f.fired) return 'fired';
  if (!f.lastDay) return null;
  if (f.unitsStamped >= REPLACED_AT) return 'replaced';
  if (f.cloneOnFile) return 'superseded';
  return f.clerkRegistered ? 'promoted' : 'reclassified';
}

/**
 * Likeness's job letter, clipped to a Humanity Day letter: the offer signed, and one or two units stamped
 * in while it was (`unitsPaid`, the ones Likeness paid for). Three stamped in all week is Replaced.
 */
export const headhunted = (ending: EndingId, signed: boolean, unitsPaid: number) =>
  signed && unitsPaid >= 1 && unitsPaid < REPLACED_AT && (ending === 'promoted' || ending === 'reclassified' || ending === 'superseded');

/** The units Likeness paid for: stamped in on or after the morning its letter was signed. */
export const unitsPaid = <U extends { day: number }>(units: readonly U[], signed: boolean, signedOn: number) =>
  signed ? units.filter((u) => u.day >= signedOn) : [];

export type Grade = 'First' | 'Second' | 'Third';

/**
 * The clerk's class, by the share of the week's stamps the rulebook agreed with at the window (the court
 * does not change it, so an appeal cannot buy one), and whether the week left them poorer than it found them.
 */
export function gradeOf(right: number, stamped: number, savings: number): Grade {
  const share = stamped === 0 ? 0 : right / stamped;
  if (share >= 0.95 && savings >= STARTING_SAVINGS) return 'First';
  return share >= 0.8 ? 'Second' : 'Third';
}
