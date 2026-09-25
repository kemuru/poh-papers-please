import { describe, expect, it } from 'vitest';
import { checkPhrase, PHRASE, spokenWords } from './phrase';

const valid = (transcript: string) => checkPhrase(transcript) === null;
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
    expect(valid('I certify that I am a real human and that I am not registered in this registry.')).toBe(false);
    expect(valid('I certify I am a real hooman.')).toBe(false);
  });

  it('rejects extra words', () => {
    expect(valid('I certify that I am a real human and that I am not already registered in this registry. Ding.')).toBe(false);
    expect(valid('Certainly! Here is my certification: I certify that I am a real human and that I am not already registered in this registry.')).toBe(false);
    expect(valid('I certify that I am a very real human and that I am not already registered in this registry.')).toBe(false);
  });

  it('rejects silence', () => {
    expect(valid('')).toBe(false);
    expect(valid('   ')).toBe(false);
    expect(valid('...')).toBe(false);
  });

  it('counts a contraction as different words', () => {
    expect(valid("I certify that I'm a real human and that I am not already registered in this registry.")).toBe(false);
  });

  it('marks exactly the words that disagree', () => {
    expect(unmatched('I certify that I am a real hooman and that I am not already registered in this registry.')).toEqual({
      heard: ['hooman'],
      expected: ['human'],
    });
    expect(unmatched('I certify that I am a real human and that I am not registered in this registry.')).toEqual({
      heard: [],
      expected: ['already'],
    });
    expect(unmatched('I certify that I am a real human and that I am not already registered in this registry. Ding.')).toEqual({
      heard: ['Ding'],
      expected: [],
    });
    expect(unmatched('')).toEqual({ heard: [], expected: spokenWords(PHRASE) });
  });

  it('keeps the words in their own spelling for display', () => {
    expect(spokenWords("Okay, is it recording? I'm  here.")).toEqual(['Okay', 'is', 'it', 'recording', "I'm", 'here']);
    expect(spokenWords('human-shaped')).toEqual(['human', 'shaped']);
  });
});
