import { describe, expect, it } from 'vitest';
import { EMPTY_RECORD, readRecord, RECORD_KEY, withEndless, withWeek, writeRecord, type Finished } from './record';
import { DEFAULT_SETTINGS, readSettings, SETTINGS_KEY, writeSettings } from './settings';

// notes/game-design.md, Coming back (slice 6): the clerk's record and the settings, kept in the browser.
const memory = () => {
  const map = new Map<string, string>();
  return { getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => void map.set(k, v), removeItem: (k: string) => void map.delete(k) };
};
const week = (over: Partial<Finished> = {}): Finished => ({ id: 'a', ending: 'reclassified', headhunted: false, savings: 300, grade: 'First', ...over });

describe('the clerk’s record', () => {
  it('starts empty, and starts again, quietly, from anything it cannot read', () => {
    expect(readRecord(memory())).toEqual(EMPTY_RECORD);
    const store = memory();
    for (const raw of ['not json', '{"v":2}', '[]', 'null']) {
      store.setItem(RECORD_KEY, raw);
      expect(readRecord(store)).toEqual(EMPTY_RECORD);
    }
    expect(readRecord(null)).toEqual(EMPTY_RECORD);
  });

  it('counts a week once, however often its letter is shown again, and keeps the best of each', () => {
    let r = withWeek(EMPTY_RECORD, week());
    expect(withWeek(r, week())).toBe(r);
    r = withWeek(r, week({ id: 'b', ending: 'fired', savings: -10, grade: 'Third' }));
    r = withWeek(r, week({ id: 'c', ending: 'promoted', headhunted: true, savings: 250, grade: 'Second' }));
    expect(r).toMatchObject({ weeks: 3, letters: ['reclassified', 'fired', 'promoted', 'headhunted'], bestSavings: 300, bestGrade: 'First' });
    // A grade counts only where Humanity Day gave one.
    expect(withWeek(EMPTY_RECORD, week({ ending: 'superseded', grade: 'First' })).bestGrade).toBeNull();
  });

  it('keeps today’s week with its card, and the longest night', () => {
    const r = withWeek(EMPTY_RECORD, week({ today: { date: '2026-09-29', letter: 'Reclassified', card: 'card' } }));
    expect(r.today).toEqual({ date: '2026-09-29', letter: 'Reclassified', savings: 300, card: 'card' });
    expect(withEndless(withEndless(r, 12), 7).endless).toBe(12);
  });

  it('survives being written and read back, and a new week does not touch it', () => {
    const store = memory();
    const r = withEndless(withWeek(EMPTY_RECORD, week()), 5);
    writeRecord(store, r);
    store.setItem('poh-save', '{"v":1}');
    store.removeItem('poh-save');
    expect(readRecord(store)).toEqual(r);
  });
});

describe('the settings', () => {
  it('default to shortcuts on and full motion, and keep what the clerk chose', () => {
    const store = memory();
    expect(readSettings(store)).toEqual(DEFAULT_SETTINGS);
    writeSettings(store, { shortcuts: false, motion: 'reduced' });
    expect(readSettings(store)).toEqual({ shortcuts: false, motion: 'reduced' });
    store.setItem(SETTINGS_KEY, '{"shortcuts":"no","motion":"sideways"}');
    expect(readSettings(store)).toEqual(DEFAULT_SETTINGS);
  });
});
