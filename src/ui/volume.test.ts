import { describe, expect, it } from 'vitest';
import { audible, FULL, gainOf, levelToGain, readLevel, stepDown, stepUp, toggle, withLevel } from './volume';

const dB = (gain: number) => 20 * Math.log10(gain);

describe('the volume', () => {
  it('follows loudness as it is heard: silence at 0, the mix as made at 100, 12 dB down at halfway', () => {
    expect(levelToGain(0)).toBe(0);
    expect(levelToGain(FULL)).toBe(1);
    expect(dB(levelToGain(50))).toBeCloseTo(-12.04, 2);
    expect(dB(levelToGain(10))).toBeCloseTo(-40, 6);
    for (let level = 1; level <= FULL; level++) expect(levelToGain(level)).toBeGreaterThan(levelToGain(level - 1));
    // Never louder than the mix: nothing above 100, nothing below 0.
    expect(levelToGain(150)).toBe(1);
    expect(levelToGain(-20)).toBe(0);
  });

  it('keeps the mute apart from the level: muted, a channel is silent at any level, and keeps its level', () => {
    expect(gainOf({ level: 80, muted: true })).toBe(0);
    expect(gainOf({ level: 80, muted: false })).toBe(levelToGain(80));
    expect(audible({ level: 80, muted: true })).toBe(false);
    expect(audible({ level: 0, muted: false })).toBe(false);
    expect(audible({ level: 1, muted: false })).toBe(true);
  });

  it('switches from the rail: what is heard goes quiet; what is not comes back, at the last level it was heard at', () => {
    expect(toggle({ level: 60, muted: false }, 60)).toEqual({ level: 60, muted: true });
    expect(toggle({ level: 60, muted: true }, 60)).toEqual({ level: 60, muted: false });
    // Set to 0 on the fader, the switch brings back the level before, or the whole mix if there was none.
    expect(toggle({ level: 0, muted: false }, 35)).toEqual({ level: 35, muted: false });
    expect(toggle({ level: 0, muted: true }, 35)).toEqual({ level: 35, muted: false });
    expect(toggle({ level: 0, muted: false }, 0)).toEqual({ level: FULL, muted: false });
  });

  it('brings a channel back when its fader moves, at a whole level from 0 to 100', () => {
    expect(withLevel(42)).toEqual({ level: 42, muted: false });
    expect(withLevel(42.6)).toEqual({ level: 43, muted: false });
    expect(withLevel(130)).toEqual({ level: FULL, muted: false });
    expect(withLevel(-1)).toEqual({ level: 0, muted: false });
  });

  it('steps the −/+ keys to the next multiple of 5', () => {
    expect([stepDown(63), stepUp(63)]).toEqual([60, 65]);
    expect([stepDown(60), stepUp(60)]).toEqual([55, 65]);
    expect([stepDown(0), stepUp(0)]).toEqual([0, 5]);
    expect([stepDown(FULL), stepUp(FULL)]).toEqual([95, FULL]);
    expect([stepDown(98), stepUp(98)]).toEqual([95, FULL]);
  });

  it('reads a saved level strictly, and anything else as the whole mix: nobody hears a change on upgrade', () => {
    expect(readLevel('0')).toBe(0);
    expect(readLevel('55')).toBe(55);
    expect(readLevel('100')).toBe(FULL);
    for (const junk of [null, '', '101', '-5', '5.5', ' 50', 'loud', 'NaN', '1e2']) expect(readLevel(junk), String(junk)).toBe(FULL);
  });
});
