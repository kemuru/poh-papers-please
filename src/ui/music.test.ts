import { describe, expect, it } from 'vitest';
import { heardAt, notesBetween, onBeat, PULSE_BAR, PULSE_BEAT, PULSE_BPM, pulseBetween, SCENES, type Note, type Scene } from './music';

const scenes = Object.keys(SCENES) as Scene[];
const HOUR = 3600;
/** How long a note sounds: a bell rings for three and a half seconds, a slow voice for twelve. */
const length = (n: Note) => (n.kind === 'bell' ? 3.5 : 12);

describe('the waiting-room music', () => {
  it('never plays the same minute twice in an hour', () => {
    const minute = (m: number) =>
      notesBetween(m * 60, (m + 1) * 60, 'open', 1)
        .map((n) => `${n.voice}@${(n.at - m * 60).toFixed(1)}`)
        .join(' ');
    const minutes = Array.from({ length: 60 }, (_, m) => minute(m));
    expect(new Set(minutes).size).toBe(60);
  });

  it('keeps each part of the day to its chord, and every voice in it sings', () => {
    for (const scene of scenes) {
      const notes = notesBetween(0, 120, scene, 1);
      const chord = SCENES[scene];
      for (const n of notes) expect(chord[n.voice], `${scene}: voice ${n.voice}`).toBe(n.name);
      const singing = new Set(notes.map((n) => n.voice));
      chord.forEach((name, v) => expect(singing.has(v), `${scene}: voice ${v}`).toBe(name !== null));
    }
  });

  it('stays soft and low: at most a note every three seconds, none above 700 Hz', () => {
    for (const scene of scenes) {
      const notes = notesBetween(0, HOUR, scene, 1);
      expect(notes.length / 60, scene).toBeLessThanOrEqual(20);
      expect(Math.max(...notes.map((n) => n.hz)), scene).toBeLessThan(700);
    }
  });

  it('never falls silent for twenty seconds, nor for fifteen while the window is open', () => {
    for (const day of [1, 7]) {
      for (const scene of scenes) {
        let heard = 20;
        let longest = 0;
        for (const n of notesBetween(20, HOUR, scene, day)) {
          longest = Math.max(longest, n.at - heard);
          heard = Math.max(heard, n.at + length(n));
        }
        expect(longest, `${scene}, day ${day}`).toBeLessThan(scene === 'open' ? 15 : 20);
      }
    }
  });

  it('wears out over the week: the voices drift from day 4, snag from day 5, go missing from day 6', () => {
    const week = [1, 2, 3, 4, 5, 6, 7].map((day) => notesBetween(0, HOUR, 'open', day));
    week.forEach((notes, i) => {
      const day = i + 1;
      expect(notes.some((n) => n.cents !== 0), `day ${day}`).toBe(day >= 4);
      expect(notes.some((n) => n.snag), `day ${day}`).toBe(day >= 5);
    });
    expect(week[5].length).toBeLessThan(week[4].length);
    expect(week[0].length).toBe(week[4].length);
  });
});

describe('the pulse under the window', () => {
  const eighth = 30 / PULSE_BPM;
  const midiOf = (hz: number) => Math.round(69 + 12 * Math.log2(hz / 440));

  it('plays only while the window is open, in steady eighths at 104 BPM', () => {
    for (const scene of scenes) expect(pulseBetween(0, 60, scene).length > 0, scene).toBe(scene === 'open');
    const minute = pulseBetween(0, 60, 'open');
    expect(minute.length).toBe(Math.ceil(60 / eighth));
    minute.slice(1).forEach((n, i) => expect(n.at - minute[i].at).toBeCloseTo(eighth));
    // Booked a piece at a time, it is the same pulse.
    expect([...pulseBetween(0, 20, 'open'), ...pulseBetween(20, 60, 'open')]).toEqual(minute);
  });

  it('goes round the window’s chord a bar at a time: the root on every downbeat, the same four bars over and over', () => {
    const notes = pulseBetween(0, HOUR, 'open');
    const bars = Array.from({ length: Math.floor(notes.length / 8) }, (_, b) => notes.slice(b * 8, b * 8 + 8).map((n) => midiOf(n.hz)));
    for (const bar of bars) expect(bar[0]).toBe(53);
    bars.slice(4).forEach((bar, b) => expect(bar).toEqual(bars[b % 4]));
    const chord = new Set([53, 57, 60, 64, 67, 69, 72].map((m) => m % 12));
    for (const n of notes) {
      expect(n.hz).toBeLessThan(700);
      expect(chord).toContain(midiOf(n.hz) % 12);
    }
  });

  it('is struck hardest on the downbeat and softest off the beat, and comes in over two bars', () => {
    const settled = pulseBetween(PULSE_BAR * 2, PULSE_BAR * 3, 'open');
    expect(settled.map((n) => n.accent)).toEqual([1, 0.55, 0.72, 0.55, 0.85, 0.55, 0.72, 0.55]);
    const start = pulseBetween(0, PULSE_BAR * 3, 'open');
    expect(start[0].accent).toBe(0.5);
    expect(start[8].accent).toBe(0.75);
    expect(start[16].accent).toBe(1);
    // Started later, on a bar line, it counts its four bars and its entrance from there.
    const late = pulseBetween(0, PULSE_BAR * 12, 'open', PULSE_BAR * 5);
    expect(late[0].at).toBeCloseTo(PULSE_BAR * 5);
    expect(late.slice(0, 8).map((n) => midiOf(n.hz))).toEqual(pulseBetween(0, PULSE_BAR, 'open').map((n) => midiOf(n.hz)));
  });

  it('while the window is open, puts every voice on a beat and every bell on a bar line, with the pulse’s root', () => {
    const onGrid = (at: number, step: number) => Math.abs(at / step - Math.round(at / step)) < 1e-9;
    for (const n of notesBetween(0, HOUR, 'open', 1)) {
      const at = heardAt(n, 'open');
      const step = n.kind === 'bell' ? PULSE_BAR : PULSE_BEAT;
      expect(at).toBeGreaterThanOrEqual(n.at - 1e-9);
      expect(at - n.at).toBeLessThan(step);
      expect(onGrid(at, step), `${n.kind} at ${n.at}`).toBe(true);
      if (n.kind === 'bell') expect(pulseBetween(at, at + 0.01, 'open')[0]?.hz).toBeCloseTo(440 * 2 ** ((53 - 69) / 12));
    }
    // Elsewhere, no pulse, and every note is heard when it is due.
    for (const n of notesBetween(0, 600, 'court', 1)) expect(heardAt(n, 'court')).toBe(n.at);
    expect(onBeat(PULSE_BEAT * 3 + 0.01)).toBeCloseTo(PULSE_BEAT * 4);
  });
});
