// The clerk's settings (slice 6), kept in this browser beside the save: single-key shortcuts on or off
// (WCAG 2.1.4: off, the desk answers only the button that has the focus), and motion full or reduced.
// A browser that asks for reduced motion always gets it; the setting reduces it for everyone else too.
import { createContext, useContext } from 'react';

export const SETTINGS_KEY = 'poh-settings';

export type Settings = { shortcuts: boolean; motion: 'full' | 'reduced' };

export const DEFAULT_SETTINGS: Settings = { shortcuts: true, motion: 'full' };

type Store = Pick<Storage, 'getItem' | 'setItem'>;

export function readSettings(store: Store | null): Settings {
  try {
    const raw = JSON.parse(store?.getItem(SETTINGS_KEY) ?? 'null') as Partial<Settings> | null;
    return {
      shortcuts: typeof raw?.shortcuts === 'boolean' ? raw.shortcuts : DEFAULT_SETTINGS.shortcuts,
      motion: raw?.motion === 'reduced' ? 'reduced' : 'full',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function writeSettings(store: Store | null, settings: Settings) {
  try {
    store?.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Refused: the settings last as long as the page.
  }
}

/** Whether the browser itself asks for reduced motion. */
export const browserReducesMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

export const SettingsContext = createContext<{ settings: Settings; change: (settings: Settings) => void }>({
  settings: DEFAULT_SETTINGS,
  change: () => {},
});

export const useSettings = () => useContext(SettingsContext);

/** Whether a key press from `e` may act as a single-key shortcut: the setting is on, and nobody is typing. */
export const shortcutsAllowed = (settings: Settings) => settings.shortcuts;
