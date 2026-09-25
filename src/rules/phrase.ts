// Rule 1: the video must contain exactly the certification phrase. Only the spoken
// words count: capitalization, punctuation and spacing are not assessed.
import type { Mark } from './types';

export const PHRASE = 'I certify that I am a real human and that I am not already registered in this registry.';

/** The words of a text in their own spelling. "I'm" is one word; "human-shaped" is two. */
export const spokenWords = (text: string): string[] => text.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) ?? [];

const key = (word: string) => word.toLowerCase().replace(/’/g, "'");

/** Null when the transcript says the phrase word for word; otherwise both texts with the disagreeing words marked. */
export function checkPhrase(transcript: string): { heard: Mark[]; expected: Mark[] } | null {
  const heard = spokenWords(transcript);
  const expected = spokenWords(PHRASE);
  const h = heard.map(key);
  const e = expected.map(key);
  if (h.length === e.length && h.every((word, i) => word === e[i])) return null;
  const [eOk, hOk] = align(e, h);
  return {
    heard: heard.map((word, i) => ({ word, ok: hOk[i] })),
    expected: expected.map((word, i) => ({ word, ok: eOk[i] })),
  };
}

/** Longest common subsequence: which words of each list line up with the other, in order. */
function align(a: string[], b: string[]): [boolean[], boolean[]] {
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = a[i] === b[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const aOk = a.map(() => false);
  const bOk = b.map(() => false);
  for (let i = 0, j = 0; i < a.length && j < b.length; ) {
    if (a[i] === b[j]) {
      aOk[i++] = true;
      bOk[j++] = true;
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) i++;
    else j++;
  }
  return [aOk, bOk];
}
