import { describe, expect, it } from 'vitest';
import { ASIDES, NOISE, PHRASE_MISTAKES } from '../content/applicants';
import { checkPhrase, KEY_WORDS, PHRASE, spokenWords } from './phrase';

const valid = (transcript: string) => checkPhrase(transcript) === null;
const keyWords = spokenWords(PHRASE).filter((_, i) => KEY_WORDS[i]);
/** The words each side has that the other does not. */
const unmatched = (transcript: string) => {
  const marks = checkPhrase(transcript);
  if (!marks) throw new Error(`expected "${transcript}" to be invalid`);
  const off = (list: { word: string; ok: boolean }[]) => list.filter((m) => !m.ok).map((m) => m.word);
  return { heard: off(marks.heard), expected: off(marks.expected) };
};

describe('the day 1 phrase rule', () => {
  it('accepts the exact phrase', () => {
    expect(valid('I certify that I am a real human and that I am not already registered in this registry.')).toBe(true);
    expect(valid(PHRASE)).toBe(true);
  });

  it('ignores capitalization, punctuation and spacing', () => {
    expect(valid('i certify that i am a real human, and that i am not already registered in this registry')).toBe(true);
    expect(valid('  I CERTIFY that I am a real human... and that I am not already registered in this registry!  ')).toBe(true);
    expect(valid('I certify that I am a real human\nand that I am not already registered in this registry.')).toBe(true);
  });

  it('rejects a typo', () => {
    expect(valid('I certify that I am a real hooman and that I am not already registered in this registry.')).toBe(false);
    expect(valid('I certify that I am a real human and that I am not already registered in this registery.')).toBe(false);
  });

  it('rejects missing words', () => {
    expect(valid('I certify that I am a real human.')).toBe(false);
    expect(valid('I certify that I am a real human and that I am already registered in this registry.')).toBe(false);
    expect(valid('I certify I am a real hooman.')).toBe(false);
  });

  it('forgives the small words: swapped or left out, the meaning is the same', () => {
    expect(KEY_WORDS.filter(Boolean)).toHaveLength(11);
    expect(keyWords.join(' ')).toBe('I certify I am real human I am not registered registry');
    expect(valid('I certify that I am a real human and that I am not already registered in the registry.')).toBe(true);
    expect(valid('I certify that I am a real human and that I am not yet registered in this registry.')).toBe(true);
    expect(valid('I certify I am real human, I am not registered, registry.')).toBe(true);
  });

  it('accepts anything said before or after the phrase', () => {
    expect(valid('I certify that I am a real human and that I am not already registered in this registry. Ding.')).toBe(true);
    expect(valid('Certainly! Here is my certification: I certify that I am a real human and that I am not already registered in this registry.')).toBe(true);
    expect(valid('Okay, is it on? I certify that I am a real human and that I am not already registered in this registry. Probably.')).toBe(true);
    expect(valid('I certify, sorry. I certify that I am a real human and that I am not already registered in this registry.')).toBe(true);
  });

  it('accepts anything said in between the words of the phrase, as long as every word is said', () => {
    expect(valid('I certify that I am a very real human and that I am not already registered in this registry.')).toBe(true);
    expect(valid('I certify that I am a real human and, um, that I am not already registered in this registry.')).toBe(true);
    expect(valid('I hereby certify that I am a real human and that I am not already registered in this registry.')).toBe(true);
    expect(valid('I certify that I am a real human. Ding. And that I am not already registered in this registry. Ding.')).toBe(true);
  });

  it('needs the key words in the order of the phrase', () => {
    expect(valid('I certify that I am a human real and that I am not already registered in this registry.')).toBe(false);
  });

  it('rejects silence', () => {
    expect(valid('')).toBe(false);
    expect(valid('   ')).toBe(false);
    expect(valid('...')).toBe(false);
  });

  it('reads "I\'m" as "I am"', () => {
    expect(valid("I certify that I'm a real human and that I'm not already registered in this registry.")).toBe(true);
  });

  it('marks exactly the words that disagree', () => {
    expect(unmatched('I certify that I am a real hooman and that I am not already registered in this registry.')).toEqual({
      heard: ['hooman'],
      expected: ['human'],
    });
    expect(unmatched('I certify that I am a real human and that I am already registered in this registry.')).toEqual({
      heard: [],
      expected: ['not'],
    });
    expect(unmatched('I certify that I am a real human and that I am not already registered in this ministry.')).toEqual({
      heard: ['ministry'],
      expected: ['registry'],
    });
    expect(unmatched('We certify that we are a real human and that we are not already registered in this registry.')).toEqual({
      heard: ['We', 'we', 'are', 'we', 'are'],
      expected: ['I', 'I', 'am', 'I', 'am'],
    });
    expect(unmatched('')).toEqual({ heard: [], expected: keyWords });
  });

  it('marks a wrong last word as wrong, not as chatter after a shorter attempt', () => {
    expect(unmatched('I certify that I am a real human and that I am not already registered in this pantry.')).toEqual({
      heard: ['pantry'],
      expected: ['registry'],
    });
  });

  it('does not mark what was said around the attempt', () => {
    expect(unmatched('Right. I certify that I am a real hooman and that I am not already registered in this registry. Bye.')).toEqual({
      heard: ['hooman'],
      expected: ['human'],
    });
    expect(
      unmatched('I certify that I am a real hooman. Sorry, excuse me. And that I am not already registered in this registry.'),
    ).toEqual({ heard: ['hooman'], expected: ['human'] });
  });

  it('never blames an aside for a missing word', () => {
    expect(unmatched('I certify that I am a real, um, hooman and that I am not already registered in this registry.')).toEqual({
      heard: ['hooman'],
      expected: ['human'],
    });
    expect(unmatched('I certify that I am a real human and that I am, sorry, one moment, already registered in this registry.')).toEqual({
      heard: [],
      expected: ['not'],
    });
  });

  it('treats a stretch of chatter that shares a word with the phrase as chatter', () => {
    expect(unmatched('I certify that I am a real human and that I am not already. Can I go now?')).toEqual({
      heard: [],
      expected: ['registered', 'registry'],
    });
    expect(unmatched('I certify that I am a real human. Can I go now?').heard).toEqual([]);
    expect(unmatched('Hello. Hi. Real human. Not registered.').heard).toEqual([]);
  });

  it('marks nothing heard when not one word of the phrase was said', () => {
    expect(unmatched('Okay, is it on? Hello? Is it on?')).toEqual({ heard: [], expected: keyWords });
  });

  it('counts a false start as the start of the attempt when what follows is wrong', () => {
    expect(unmatched('I certify, sorry. I am a real human and I am not already registered.')).toEqual({
      heard: [],
      expected: ['registry'],
    });
  });

  it('never marks the chatter around any line the generator can plant, and marks the line as if said alone', () => {
    const before = [...new Set(Object.values(NOISE).flatMap((n) => n.before))];
    const after = [...new Set(Object.values(NOISE).flatMap((n) => n.after))];
    for (const line of Object.values(PHRASE_MISTAKES).flat().filter(Boolean)) {
      const alone = checkPhrase(line)!;
      for (const [b, a] of [...before.map((b) => [b, ''] as const), ...after.map((a) => ['', a] as const)]) {
        const said = [b, line, a].filter(Boolean).join(' ');
        const { heard, expected } = checkPhrase(said)!;
        const skip = spokenWords(b).length;
        expect(heard.slice(skip, skip + alone.heard.length), said).toEqual(alone.heard);
        expect([...heard.slice(0, skip), ...heard.slice(skip + alone.heard.length)].every((m) => m.ok), said).toBe(true);
        expect(expected, said).toEqual(alone.expected);
      }
    }
  });

  it('never marks an aside, wherever in a planted line it is said', () => {
    for (const line of Object.values(PHRASE_MISTAKES).flat().filter(Boolean)) {
      const words = line.split(' ');
      for (const aside of ASIDES) {
        for (let at = 1; at < words.length; at++) {
          const said = [...words.slice(0, at - 1), `${words[at - 1].replace(/,$/, '')},`, `${aside},`, ...words.slice(at)].join(' ');
          const { heard } = checkPhrase(said)!;
          const asideWords = new Set(spokenWords(aside));
          for (const m of heard) if (asideWords.has(m.word) && !spokenWords(line).includes(m.word)) expect(m.ok, said).toBe(true);
        }
      }
    }
  });

  it('keeps the words in their own spelling for display', () => {
    expect(spokenWords("Okay, is it recording? I'm  here.")).toEqual(['Okay', 'is', 'it', 'recording', "I'm", 'here']);
    expect(spokenWords('human-shaped')).toEqual(['human', 'shaped']);
  });
});
