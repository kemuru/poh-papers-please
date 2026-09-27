// Rule 1: in the video, the applicant says the key words of the certification phrase, in order.
// The key words carry its meaning (I certify, I am, real human, I am not, registered, registry);
// the small words between them may be swapped or left out, and anything else said, before, after
// or in between, is not assessed. Nor are capitalization and punctuation. "I'm" is "I am".
import type { Mark } from './types';

export const PHRASE = 'I certify that I am a real human and that I am not already registered in this registry.';

const WORD = /[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu;

/** The words of a text in their own spelling. "I'm" is one word; "human-shaped" is two. */
export const spokenWords = (text: string): string[] => text.match(WORD) ?? [];

/** Words of the phrase that carry no meaning of their own: "in the registry" says the same as "in this registry". */
const SMALL_WORDS = new Set(['that', 'a', 'and', 'already', 'in', 'this']);

/** For each word of the phrase, whether it has to be said. */
export const KEY_WORDS: readonly boolean[] = spokenWords(PHRASE).map((word) => !SMALL_WORDS.has(word.toLowerCase()));

/** A heard word as the rule compares it; "I'm" is two words. */
const tokens = (word: string): string[] => {
  const key = word.toLowerCase().replace(/’/g, "'");
  return key === "i'm" ? ['i', 'am'] : [key];
};

/**
 * Null when every key word of the phrase was said, in order; otherwise both texts with the
 * evidence marked: the key words that were never said, and what was said in their place.
 */
export function checkPhrase(transcript: string): { heard: Mark[]; expected: Mark[] } | null {
  const heard = spokenWords(transcript);
  const expected = spokenWords(PHRASE);
  const keys = expected.filter((_, i) => KEY_WORDS[i]).map((word) => word.toLowerCase());
  // Each token remembers the heard word it came from.
  const said = heard.flatMap((word, i) => tokens(word).map((token) => ({ token, from: i })));
  let next = 0;
  for (const { token } of said) if (next < keys.length && token === keys[next]) next++;
  if (next === keys.length) return null;

  const place = placeOf(transcript);
  const [keyOk, saidOk] = evidence(
    keys,
    said.map((s) => s.token),
    said.map((s) => place[s.from]),
  );
  let k = 0;
  return {
    heard: heard.map((word, i) => ({ word, ok: said.every((s, t) => s.from !== i || saidOk[t]) })),
    expected: expected.map((word, i) => ({ word, ok: KEY_WORDS[i] ? keyOk[k++] : true })),
  };
}

type Place = { sentence: number; clause: number };

/** Which sentence and which clause (split by commas and dashes as well) each word of a text is in. */
function placeOf(text: string): Place[] {
  const places: Place[] = [];
  let last = 0;
  let sentence = 0;
  let clause = 0;
  for (const match of text.matchAll(WORD)) {
    const between = text.slice(last, match.index);
    if (/[.?!]/.test(between)) sentence++;
    if (/[.?!,;:—–]/.test(between)) clause++;
    places.push({ sentence, clause });
    last = match.index + match[0].length;
  }
  return places;
}

/** Key words, said in one sentence, that make an attempt at the phrase. A lone "I" in the chatter does not. */
const ATTEMPT = 2;

/**
 * The evidence for a citation. First, which of the key words were said: the most of them, in
 * order, except that reaching into another sentence has to find more than one word to be worth it
 * (so "Can I go now?" after an attempt that stopped short stays chatter, "I" or no "I").
 * Then, between two key words that were said, if key words are missing, the words said in the
 * same clauses as those two are what was said instead ("hooman" for "human"). Small words, asides
 * set off by commas and other sentences are never blamed: saying something else is not the offence.
 */
function evidence(e: string[], h: string[], place: Place[]): [boolean[], boolean[]] {
  const eOk = e.map(() => false);
  const hOk = h.map(() => true);
  const pairs = bestPairs(e, h, place);
  const perSentence = new Map<number, number>();
  for (const [, j] of pairs) perSentence.set(place[j].sentence, (perSentence.get(place[j].sentence) ?? 0) + 1);
  if (![...perSentence.values()].some((n) => n >= ATTEMPT)) return [eOk, hOk];

  for (const [i] of pairs) eOk[i] = true;
  const anchors: [number, number][] = [[-1, -1], ...pairs, [e.length, h.length]];
  for (let k = 1; k < anchors.length; k++) {
    const [i0, j0] = anchors[k - 1];
    const [i1, j1] = anchors[k];
    const missing = i1 - i0 - 1;
    if (missing === 0) continue;
    const near = (j: number) => (j0 >= 0 && place[j].clause === place[j0].clause) || (j1 < h.length && place[j].clause === place[j1].clause);
    const instead = Array.from({ length: j1 - j0 - 1 }, (_, n) => j0 + 1 + n).filter((j) => near(j) && !SMALL_WORDS.has(h[j]));
    if (instead.length > 0 && instead.length <= missing) for (const j of instead) hOk[j] = false;
  }
  return [eOk, hOk];
}

/**
 * Pairs [key word, heard word] of equal words, both in order, scored by pairs minus the
 * sentence endings between consecutive paired heard words. Ties go to fewer sentence endings.
 */
function bestPairs(e: string[], h: string[], place: Place[]): [number, number][] {
  type At = [number, number] | null;
  const s = place.map((p) => p.sentence);
  // A run's score is (pairs - breaks) * 1000 - breaks. Pairing e[i] with h[j] after a run that ended
  // at h[pj] adds 1000 - 1001 * (s[j] - s[pj]), so the best run to extend is the one with the
  // highest score + 1001 * s[pj] among those ending up and to the left: a running maximum.
  const score = e.map(() => new Array<number>(h.length).fill(-Infinity));
  const from: At[][] = e.map(() => new Array<At>(h.length).fill(null));
  const upLeft = Array.from({ length: e.length + 1 }, () => new Array<{ value: number; at: At }>(h.length + 1).fill({ value: -Infinity, at: null }));
  let top: At = null;
  for (let i = 0; i < e.length; i++) {
    for (let j = 0; j < h.length; j++) {
      if (e[i] === h[j]) {
        const before = upLeft[i][j];
        const extended = before.value + 1000 - 1001 * s[j];
        score[i][j] = before.at && extended > 1000 ? extended : 1000;
        from[i][j] = before.at && extended > 1000 ? before.at : null;
        if (!top || score[i][j] > score[top[0]][top[1]]) top = [i, j];
      }
      let best = upLeft[i][j + 1].value >= upLeft[i + 1][j].value ? upLeft[i][j + 1] : upLeft[i + 1][j];
      if (score[i][j] + 1001 * s[j] > best.value) best = { value: score[i][j] + 1001 * s[j], at: [i, j] };
      upLeft[i + 1][j + 1] = best;
    }
  }
  const pairs: [number, number][] = [];
  for (let at = top; at; at = from[at[0]][at[1]]) pairs.unshift(at);
  return pairs;
}
