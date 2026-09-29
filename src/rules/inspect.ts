// Inspect mode: the clerk points at two things, and the game says whether they disagree and which
// rule the disagreement breaks. It uses the same checks as judge(), so a discrepancy found here is
// a violation judge() reports, and the other way round wherever two things on the desk show it.
import { checkDuplicate } from './duplicate';
import { frameFaces, litFrames, sameFace } from './face';
import { isLivingYear } from './living';
import { checkPhrase } from './phrase';
import { sameName } from './registry';
import { checkSign } from './sign';
import type { Applicant, Registry, RuleId, Rulebook } from './types';
import { checkVouch } from './vouch';

/** Something on the desk the clerk can point at. */
export type Item =
  | { kind: 'photo' }
  | { kind: 'frame'; frame: number }
  | { kind: 'transcript' }
  | { kind: 'sign' }
  | { kind: 'name' }
  | { kind: 'birth-year' }
  | { kind: 'wallet' }
  | { kind: 'voucher' }
  | { kind: 'rule'; rule: RuleId }
  /** What the registry said about a name the clerk looked up. */
  | { kind: 'name-record'; name: string }
  /** What the registry said about the face in the video. */
  | { kind: 'face-record' };

export type Finding = {
  rule: RuleId;
  /** False when no rule in force covers it yet: the two disagree, and the rulebook does not mind. */
  inForce: boolean;
};

export const sameItem = (a: Item, b: Item) => JSON.stringify(a) === JSON.stringify(b);

/** Whether two items disagree, and under which rule. Null when they agree or have nothing to do with each other. */
export function inspect(x: Item, y: Item, a: Applicant, rulebook: Rulebook, registry: Registry): Finding | null {
  const rule = compare(x, y, a, registry) ?? compare(y, x, a, registry);
  return rule ? { rule, inForce: rulebook.includes(rule) } : null;
}

function compare(x: Item, y: Item, a: Applicant, registry: Registry): RuleId | null {
  const frames = frameFaces(a.video);
  const lit = litFrames(a.video);
  const is = (item: Item, kind: Item['kind']) => item.kind === kind;
  const isRule = (item: Item, rule: RuleId) => item.kind === 'rule' && item.rule === rule;
  /** The face in this frame is not the face in the video, as checkHuman sees it. */
  const turns = (frame: number) => !sameFace(frames[frame - 1], a.video.face);

  // The photo against a frame: is it one face, the right way round? Unless the face in that frame
  // turns into another, or gives off a light of its own, which is the video's fault, not the photo's.
  if (x.kind === 'photo' && y.kind === 'frame') {
    if (turns(y.frame) || lit.includes(y.frame)) return 'human';
    return a.mirrored || !sameFace(a.photo, frames[y.frame - 1]) ? 'photo' : null;
  }
  // One frame against another: a real face stays the same face, gives off no light, and moves: two
  // frames exactly alike, mouth and eyes and all, are one picture held up.
  if (x.kind === 'frame' && y.kind === 'frame') {
    const lamp = lit.includes(x.frame) || lit.includes(y.frame);
    return lamp || a.video.still || !sameFace(frames[x.frame - 1], frames[y.frame - 1]) ? 'human' : null;
  }
  // A frame against Rule 0: a light of its own in it, a face that turns into another, a picture held up, or a generator's mark.
  if (x.kind === 'frame' && isRule(y, 'human')) {
    return lit.includes(x.frame) || turns(x.frame) || a.video.still || a.video.generated ? 'human' : null;
  }
  if (is(x, 'transcript') && isRule(y, 'phrase')) return checkPhrase(a.video.transcript) ? 'phrase' : null;
  if (is(x, 'sign') && is(y, 'wallet')) return checkSign(a) ? 'sign' : null;
  // Without the wallet, the rule can only see that there is no address on the sign at all.
  if (is(x, 'sign') && isRule(y, 'sign')) return !a.video.sign || a.video.sign.kind === 'qr' ? 'sign' : null;
  if (is(x, 'voucher') && is(y, 'name')) return checkVouch(a, registry)?.problem === 'self' ? 'vouch' : null;
  if (is(x, 'voucher') && isRule(y, 'vouch')) {
    const problem = checkVouch(a, registry)?.problem;
    return problem === 'none' || problem === 'self' ? 'vouch' : null;
  }
  // A record says something about the voucher only if it is the voucher's name that was looked up.
  if (is(x, 'voucher') && y.kind === 'name-record') {
    if (!a.voucher || !sameName(a.voucher, y.name)) return null;
    return checkVouch(a, registry) ? 'vouch' : null;
  }
  if (x.kind === 'face-record' && (is(y, 'photo') || is(y, 'frame') || isRule(y, 'duplicate'))) {
    return checkDuplicate(a, registry) ? 'duplicate' : null;
  }
  if (is(x, 'birth-year') && isRule(y, 'living')) return isLivingYear(a.birthYear) ? null : 'living';
  if (is(x, 'frame') && isRule(y, 'living')) return a.video.blinked ? null : 'living';
  return null;
}
