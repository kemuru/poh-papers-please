import { describe, expect, it } from 'vitest';
import { notesBetween, SCENES, type Note, type Scene } from './music';

const scenes = Object.keys(SCENES) as Scene[];
const HOUR = 3600;
/** How long a note sounds: a bell rings for five seconds, a slow voice for twelve. */
const length = (n: Note) => (n.kind === 'bell' ? 5 : 12);

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
