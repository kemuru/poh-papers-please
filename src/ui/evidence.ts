// A violation in words: what disagrees with what. Dry on purpose; the jokes are in the memos.
import { RULEBOOK } from '../content/rulebook';
import { litFrames } from '../rules/face';
import type { Item } from '../rules/inspect';
import { shortAddress } from '../rules/sign';
import type { Mark, RuleId, Video, Violation } from '../rules/types';
import type { Evidence } from './court';

export const ruleName = (rule: RuleId) => `Rule ${RULEBOOK[rule].number}: ${RULEBOOK[rule].title}`;

/** Something on the desk, as a case slip names it. */
export function itemWords(item: Item): string {
  switch (item.kind) {
    case 'frame':
      return `frame ${item.frame}`;
    case 'rule':
      return `Rule ${RULEBOOK[item.rule].number}`;
    case 'name-record':
      return `the registry's record of ${item.name}`;
    case 'face-record':
      return 'the face search';
    case 'name':
    case 'birth-year':
    case 'wallet':
      return 'the form';
    default:
      return `the ${item.kind}`;
  }
}

/**
 * What the clerk found, as the case slip and the court print it: "Rule 3, the sign against the form."
 * A thing held up against the rule itself reads "Rule 1, the transcript against the rule."
 */
export function evidenceWords(e: Evidence): string {
  const words = (item: Item) => (item.kind === 'rule' && item.rule === e.rule ? 'the rule' : itemWords(item));
  // The rule's page is named last, whichever was pointed at first.
  const [x, y] = e.items[0].kind === 'rule' ? [e.items[1], e.items[0]] : e.items;
  return `Rule ${RULEBOOK[e.rule].number}, ${words(x)} against ${words(y)}.`;
}

/** Years before year 1 are printed the way the Ministry's records office prints them; anything else as written. */
export const formatYear = (year: number | string) => (typeof year !== 'number' ? year : year < 1 ? `${-year} BC` : String(year));

/** Where someone on the registry was registered. */
export const registeredWhere = (r: { day: number; window?: string }) =>
  r.window ? `at ${r.window}` : r.day === 0 ? 'before this week' : `on day ${r.day} at Window 3`;

/**
 * The violation named in the frame the clerk pointed at, when the fault shows there too. judge() names
 * the first frame; a photo that is someone else is not the face in any frame, and a unit's lamp is lit
 * in every frame with its eyes shut.
 */
export function asPointed(v: Violation, e: Evidence | null, video: Video): Violation {
  if (!e || e.rule !== v.rule) return v;
  const pointed = e.items.flatMap((item) => (item.kind === 'frame' ? [item.frame] : []));
  if (v.rule !== 'face') return v;
  if (v.problem === 'another' && pointed.length > 0) return { ...v, frame: pointed[0] };
  if (v.problem === 'machine') {
    const frame = pointed.find((n) => litFrames(video).includes(n));
    if (frame !== undefined) return { ...v, frame };
  }
  return v;
}

/**
 * The evidence in one line, without the rule's name. The court sits after the day's registrations and
 * removals, so it puts a voucher's standing and a face on file as they were at the window; the desk,
 * as they are.
 */
export function evidenceLine(v: Violation, at: 'desk' | 'court' = 'desk'): string {
  switch (v.rule) {
    case 'phrase': {
      const said = runs(v.heard);
      const missing = runs(v.expected);
      if (v.heard.length === 0) return 'said nothing at all.';
      if (said) return `said “${said}”, not “${missing}”.`;
      const count = v.expected.filter((m) => !m.ok).length;
      return count > 4 ? `${count} of its words never said.` : `never said “${missing}”.`;
    }
    case 'face':
      if (v.problem === 'machine') return `in frame ${v.frame} the eyes are shut, and there is a light between the brows.`;
      if (v.problem === 'changes') return `the face in frame ${v.frame} is not the face in the other frames.`;
      return v.problem === 'mirrored' ? 'the photo is a mirror image of the face in the video.' : `the photo is not the face in frame ${v.frame}.`;
    case 'sign':
      if (!v.sign) return 'no sign held up.';
      if (v.sign.kind === 'qr') return 'the sign is a QR code, not the address.';
      if (v.sign.text.length !== v.wallet.length) return `the sign says ${v.sign.text}, not the address in full.`;
      return `the sign says ${shortAddress(v.sign.text)}, the form ${shortAddress(v.wallet)}: ${v.wrong.length} characters differ.`;
    case 'vouch':
      if (v.problem === 'none') return 'nobody vouched for the applicant.';
      if (v.problem === 'self') return 'the applicant vouched for themselves.';
      if (v.problem === 'unregistered') return at === 'court' ? `${v.voucher} was not registered when the applicant applied.` : `${v.voucher} is not registered.`;
      return `${v.voucher} was already vouching for ${v.vouchingFor}.`;
    case 'duplicate':
      return `the face ${at === 'court' ? 'was' : 'is'} registered already, as ${v.match.name}, ${registeredWhere(v.match)}.`;
    case 'living':
      if (v.problem === 'born') return `born ${formatYear(v.born)}.`;
      if (v.problem === 'picture') return 'every frame is the same picture, mouth and eyes included.';
      if (v.problem === 'generated') return 'a video generator’s mark is in the corner of every frame.';
      return 'no frame shows a blink.';
  }
}

/** Each run of marked words, in order: "hooman … pantry". */
function runs(marks: Mark[]) {
  const out: string[] = [];
  marks.forEach((m, k) => {
    if (m.ok) return;
    if (k > 0 && !marks[k - 1].ok) out[out.length - 1] += ` ${m.word}`;
    else out.push(m.word);
  });
  return out.join(' … ');
}
