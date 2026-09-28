// A violation in words: what disagrees with what. Dry on purpose; the jokes are in the memos.
import { RULEBOOK } from '../content/rulebook';
import { shortAddress } from '../rules/sign';
import type { Mark, RuleId, Violation } from '../rules/types';

export const ruleName = (rule: RuleId) => `Rule ${RULEBOOK[rule].number}: ${RULEBOOK[rule].title}`;

/** Years before year 1 are printed the way the Ministry's records office prints them; anything else as written. */
export const formatYear = (year: number | string) => (typeof year !== 'number' ? year : year < 1 ? `${-year} BC` : String(year));

/** Where someone on the registry was registered. */
export const registeredWhere = (r: { day: number; window?: string }) =>
  r.window ? `at ${r.window}` : r.day === 0 ? 'before this week' : `on day ${r.day} at Window 3`;

/** The evidence in one line, without the rule's name. */
export function evidenceLine(v: Violation): string {
  switch (v.rule) {
    case 'human':
      if (v.problem === 'machine') return `in frame ${v.frame} the skin at the ${v.where} is open, and there is machinery behind it.`;
      if (v.problem === 'changes') return `the face in frame ${v.frame} is not the face in the other frames.`;
      if (v.problem === 'picture') return 'every frame is the same picture, mouth and eyes included.';
      return 'a video generator’s mark is in the corner of every frame.';
    case 'phrase': {
      const said = runs(v.heard);
      const missing = runs(v.expected);
      if (v.heard.length === 0) return 'said nothing at all.';
      if (said) return `said “${said}”, not “${missing}”.`;
      const count = v.expected.filter((m) => !m.ok).length;
      return count > 4 ? `${count} of its words never said.` : `never said “${missing}”.`;
    }
    case 'photo':
      return v.mirrored ? 'the photo is a mirror image of the face in the video.' : `the photo is not the face in frame ${v.frame}.`;
    case 'sign':
      if (!v.sign) return 'no sign held up.';
      if (v.sign.kind === 'qr') return 'the sign is a QR code, not the address.';
      if (v.sign.text.length !== v.wallet.length) return `the sign says ${v.sign.text}, not the address in full.`;
      return `the sign says ${shortAddress(v.sign.text)}, the form ${shortAddress(v.wallet)}: ${v.wrong.length} characters differ.`;
    case 'vouch':
      if (v.problem === 'none') return 'nobody vouched for the applicant.';
      if (v.problem === 'self') return 'the applicant vouched for themselves.';
      if (v.problem === 'unregistered') return `${v.voucher} is not registered.`;
      return `${v.voucher} was already vouching for ${v.vouchingFor}.`;
    case 'duplicate':
      return `the face is registered already, as ${v.match.name}, ${registeredWhere(v.match)}.`;
    case 'living':
      return v.problem === 'born' ? `born ${formatYear(v.born)}.` : 'no frame shows a blink.';
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
