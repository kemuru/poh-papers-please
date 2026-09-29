import { MENU } from '../content/menu';
import { browserReducesMotion, useSettings } from './settings';

// A click leaves the focus where it was.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

/** The two settings, as switches: single-key shortcuts, and motion. On the notice board and in the menu. */
export function SettingsPanel() {
  const { settings, change } = useSettings();
  const forced = browserReducesMotion();
  const reduced = forced || settings.motion === 'reduced';
  return (
    <section className="settings" aria-label="Settings">
      <button
        className="settings-switch"
        role="switch"
        aria-checked={settings.shortcuts}
        onClick={() => change({ ...settings, shortcuts: !settings.shortcuts })}
        onMouseDown={keepFocus}
      >
        <span>{MENU.settings.shortcuts}</span>
        <b>{settings.shortcuts ? MENU.settings.on : MENU.settings.off}</b>
      </button>
      <button
        className="settings-switch settings-motion"
        role="switch"
        aria-checked={reduced}
        disabled={forced}
        onClick={() => change({ ...settings, motion: settings.motion === 'reduced' ? 'full' : 'reduced' })}
        onMouseDown={keepFocus}
      >
        <span>{MENU.settings.motion}</span>
        <b>{forced ? MENU.settings.forced : reduced ? MENU.settings.reduced : MENU.settings.full}</b>
      </button>
    </section>
  );
}
