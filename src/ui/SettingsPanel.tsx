import { useEffect, useId, useRef, useSyncExternalStore, type CSSProperties } from 'react';
import { MENU } from '../content/menu';
import { musicChannel, setMusicLevel } from './music';
import { browserReducesMotion, useSettings } from './settings';
import { onVolumeChange, setSoundLevel, soundChannel } from './sound';
import { audible, FULL, stepDown, stepUp, type Channel } from './volume';

// A click leaves the focus where it was.
const keepFocus = (e: { preventDefault: () => void }) => e.preventDefault();

let volumes = { sound: soundChannel(), music: musicChannel() };
const readVolumes = () => {
  const sound = soundChannel();
  const music = musicChannel();
  if (sound !== volumes.sound || music !== volumes.music) volumes = { sound, music };
  return volumes;
};

/** Both volumes, kept current: the rail's switches and the settings' faders show the same. */
export const useVolumes = () => useSyncExternalStore(onVolumeChange, readVolumes);

/** The two volume faders. On the notice board's volume plate they are `compact`: one line each, under the night notice. */
export function VolumeFaders({ compact = false }: { compact?: boolean }) {
  const { sound, music } = useVolumes();
  return (
    <>
      <Fader name={MENU.settings.sound} short={MENU.settings.soundShort} compact={compact} channel={sound} onLevel={setSoundLevel} />
      <Fader name={MENU.settings.music} short={MENU.settings.musicShort} compact={compact} channel={music} onLevel={setMusicLevel} />
    </>
  );
}

/**
 * The settings: in the menu, a fader for each volume, then two switches, single-key shortcuts and motion. On the
 * notice board the switches are on their steel plate, and the faders on one of their own (`volumes` off).
 */
export function SettingsPanel({ volumes = true }: { volumes?: boolean }) {
  const { settings, change } = useSettings();
  const forced = browserReducesMotion();
  const reduced = forced || settings.motion === 'reduced';
  return (
    <section className="settings" aria-label={MENU.settings.head}>
      {volumes && <VolumeFaders />}
      <button
        className="settings-switch"
        role="switch"
        aria-checked={settings.shortcuts}
        onClick={() => change({ ...settings, shortcuts: !settings.shortcuts })}
        onMouseDown={keepFocus}
      >
        <span>{MENU.settings.shortcuts}</span>
        {/* The switch says on or off itself; the word is for the eye. */}
        <b aria-hidden="true">{settings.shortcuts ? MENU.settings.on : MENU.settings.off}</b>
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
        <b aria-hidden={!forced}>{forced ? MENU.settings.forced : reduced ? MENU.settings.on : MENU.settings.off}</b>
      </button>
    </section>
  );
}

/**
 * A volume fader, as Papers, Please has them: a pixel bar with a key a step either side and the level in the
 * savings tally's amber. The bar is a native range input, so it drags, takes a click on the track, and answers
 * the arrows, Page Up and Down, Home and End, for every screen reader too. While its rail switch has the channel
 * muted, it keeps its level, dimmed; moving it brings the channel back.
 */
function Fader({
  name,
  short,
  compact,
  channel,
  onLevel,
}: {
  name: string;
  short: string;
  compact: boolean;
  channel: Channel;
  onLevel: (level: number, settled: boolean) => void;
}) {
  const id = useId();
  const bar = useRef<HTMLInputElement>(null);
  // The input's own change event comes when the bar is let go, or stepped from the keyboard: the level is settled.
  useEffect(() => {
    const input = bar.current;
    if (!input) return;
    const settle = () => onLevel(Number(input.value), true);
    input.addEventListener('change', settle);
    return () => input.removeEventListener('change', settle);
  }, [onLevel]);
  const label = (text: string) => text.replace('{name}', name);
  return (
    <div className={['fader', compact && 'compact', !audible(channel) && 'off'].filter(Boolean).join(' ')}>
      <p className="fader-head">
        <label htmlFor={id}>{compact ? short : name}</label>
        <output htmlFor={id} aria-hidden="true">
          {channel.level}
        </output>
      </p>
      <p className="fader-row">
        <button className="fader-key down" aria-label={label(MENU.settings.down)} onClick={() => onLevel(stepDown(channel.level), true)} onMouseDown={keepFocus} />
        <input
          ref={bar}
          id={id}
          className="fader-bar"
          type="range"
          min={0}
          max={FULL}
          step={1}
          value={channel.level}
          aria-label={name}
          aria-valuetext={(channel.muted ? MENU.settings.levelOff : MENU.settings.level).replace('{level}', String(channel.level))}
          style={{ '--level': `${channel.level}%` } as CSSProperties}
          onChange={(e) => onLevel(Number(e.target.value), false)}
        />
        <button className="fader-key up" aria-label={label(MENU.settings.up)} onClick={() => onLevel(stepUp(channel.level), true)} onMouseDown={keepFocus} />
      </p>
    </div>
  );
}
