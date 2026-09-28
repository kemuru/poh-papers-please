// The desk and the Humanity Court, step by step: a stamp at the window, and the hearings at five.
// Until the jury arrives (slice 4) the court rules on the facts: a challenge is upheld when the
// applicant broke any rule in force, judged against the registry as it stood at the window.
// Pure: the same registry, applicant and decision always give the same result.
import { decide, judge, rulebookForDay, type Decision, type Outcome } from '../rules/judge';
import { atWindow, register, remove } from '../rules/registry';
import type { Applicant, Registry } from '../rules/types';

/** A stamp at the window: what the rulebook says about it, and the registry after it. */
export function stamp(
  registry: Registry,
  day: number,
  applicant: Applicant,
  decision: Decision,
): { outcome: Outcome; registry: Registry } {
  const outcome = decide(decision, judge(applicant, rulebookForDay(day), registry));
  // Their vouch serves them from the moment they are seen, whatever the stamp.
  const seen = atWindow(registry, applicant);
  return { outcome, registry: decision === 'accept' ? register(seen, applicant, day) : seen };
}

export type Hearing = {
  /** Upheld: the applicant broke a rule. */
  upheld: boolean;
  /** Whoever vouched for them, removed from the registry with them. */
  removed: string | null;
};

/**
 * Five o'clock. Each challenge is heard: upheld, the applicant is refused and whoever vouched for
 * them is removed from the registry too, as in the real one; dismissed, the applicant is registered.
 */
export function hearChallenges(
  registry: Registry,
  day: number,
  challenges: readonly { applicant: Applicant; outcome: Outcome }[],
): { hearings: Hearing[]; registry: Registry } {
  let after = registry;
  const hearings = challenges.map(({ applicant, outcome }): Hearing => {
    if (!outcome.correct) {
      after = register(after, applicant, day);
      return { upheld: false, removed: null };
    }
    const voucher = after.find((r) => r.vouching === applicant.name) ?? null;
    if (voucher) after = remove(after, voucher.name);
    return { upheld: true, removed: voucher?.name ?? null };
  });
  return { hearings, registry: after };
}

/**
 * A whole shift, as the desk and the court play it: each decision stamped in queue order against
 * the registry as it stands, then the challenges heard. Decisions past the end of `decisions` are
 * applicants sent home unprocessed. Used by the balance bots and the replay test.
 */
export function playDay(
  registry: Registry,
  day: number,
  queue: readonly Applicant[],
  decisions: readonly Decision[],
): { outcomes: Outcome[]; hearings: Hearing[]; registry: Registry } {
  let now = registry;
  const outcomes = decisions.map((decision, i) => {
    const stamped = stamp(now, day, queue[i], decision);
    now = stamped.registry;
    return stamped.outcome;
  });
  const challenges = outcomes.flatMap((outcome, i) => (decisions[i] === 'challenge' ? [{ applicant: queue[i], outcome }] : []));
  const heard = hearChallenges(now, day, challenges);
  return { outcomes, hearings: heard.hearings, registry: heard.registry };
}
