// Every sound effect in the game, synthesised with Web Audio, so there are no audio files to license.
// Quiet by design: the ministry hums, it does not shout. Every effect goes through one gain, the sound's
// bus, set by the clerk's sound volume (volume.ts); the level and the mute are remembered per browser.
// The music is in music.ts, on the same audio context, with a bus of its own.
import { audible, gainOf, readLevel, toggle, withLevel, type Channel } from './volume';

let audio: AudioContext | undefined;
let sound: Channel = { level: readLevel(readItem('poh-sfx-volume')), muted: readFlag('poh-muted') };
/** The last level the sound was heard at, for the switch to bring back after the fader was put at 0. */
let soundHeard = sound.level;
let soundBus: GainNode | undefined;

export function readItem(name: string) {
  try {
    return localStorage.getItem(name);
  } catch {
    return null;
  }
}

export function saveItem(name: string, value: string) {
  try {
    localStorage.setItem(name, value);
  } catch {
    // Private mode: the setting lasts until the page closes.
  }
}

export function readFlag(name: string) {
  return readItem(name) === '1';
}

export function saveFlag(name: string, value: boolean) {
  saveItem(name, value ? '1' : '0');
}

// The rail's switches and the settings' faders follow both volumes, wherever they were changed.
const listeners = new Set<() => void>();
export function onVolumeChange(listener: () => void) {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
export const volumeChanged = () => listeners.forEach((listener) => listener());

/** Glides a bus to a new gain in a few hundredths of a second: a fader dragged across never clicks. */
export function glide(bus: GainNode | undefined, gain: number) {
  bus?.gain.setTargetAtTime(gain, bus.context.currentTime, 0.02);
}

export const soundChannel = () => sound;

/** The rail's sound switch, and M. */
export const toggleSound = () => setSound(toggle(sound, soundHeard), true);

/** The sound volume fader. `settled` once it is let go or stepped: then the level is kept, and a stamp says how loud it is. */
export const setSoundLevel = (level: number, settled: boolean) => setSound(withLevel(level), settled);

function setSound(next: Channel, settled: boolean) {
  sound = next;
  if (next.level > 0) soundHeard = next.level;
  glide(soundBus, gainOf(sound));
  if (settled) {
    saveFlag('poh-muted', sound.muted);
    saveItem('poh-sfx-volume', String(sound.level));
    hear();
  }
  volumeChanged();
}

let heard = -Infinity;
/** The stamp at the level just set, a moment after the bus has got there; at most five times a second. */
function hear() {
  const now = performance.now();
  if (now - heard < 200) return;
  heard = now;
  withAudio((ctx, t) => stamp(ctx, t + 0.06));
}

/** The page's audio context, made on first use; null where there is no Web Audio. It sleeps while the tab is hidden. */
export function audioContext(): AudioContext | null {
  try {
    if (!audio) {
      const ctx = new AudioContext();
      document.addEventListener('visibilitychange', () => void (document.hidden ? ctx.suspend() : ctx.resume()));
      // The bus starts at the saved level, not at full: the first sound after a reload is never too loud.
      soundBus = ctx.createGain();
      soundBus.gain.value = gainOf(sound);
      soundBus.connect(ctx.destination);
      audio = ctx;
    }
    if (audio.state === 'suspended' && !document.hidden) void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

/** Runs `play` with the audio context and the current time, unless the sound cannot be heard or there is no Web Audio. */
function withAudio(play: (ctx: AudioContext, t: number) => void) {
  if (!audible(sound)) return;
  const ctx = audioContext();
  try {
    if (ctx) play(ctx, ctx.currentTime);
  } catch {
    // No Web Audio: the ministry works in silence.
  }
}

function tone(ctx: AudioContext, t: number, type: OscillatorType, from: number, to: number, volume: number, length: number) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, t);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + length);
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(gain).connect(soundBus ?? ctx.destination);
  osc.start(t);
  osc.stop(t + length);
}

/** White noise from a fixed sequence (no Math.random needed for hiss); each channel its own. */
export function whiteNoise(ctx: BaseAudioContext, seconds: number, channels = 1) {
  const buffer = ctx.createBuffer(channels, Math.round(ctx.sampleRate * seconds), ctx.sampleRate);
  let x = 12345;
  for (let c = 0; c < channels; c++) {
    const data = buffer.getChannelData(c);
    for (let i = 0; i < data.length; i++) {
      x = (Math.imul(x, 1103515245) + 12345) >>> 0;
      data[i] = x / 2147483648 - 1;
    }
  }
  return buffer;
}

let noiseBuffer: AudioBuffer | undefined;
/** A second of white noise, made once. */
function noise(ctx: AudioContext) {
  noiseBuffer ??= whiteNoise(ctx, 1);
  return noiseBuffer;
}

function hiss(ctx: AudioContext, t: number, filter: BiquadFilterType, frequency: number, volume: number, length: number) {
  const src = ctx.createBufferSource();
  const band = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  src.buffer = noise(ctx);
  band.type = filter;
  band.frequency.value = frequency;
  gain.gain.setValueAtTime(volume, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + length);
  src.connect(band).connect(gain).connect(soundBus ?? ctx.destination);
  src.start(t, (t * 7) % 0.5);
  src.stop(t + length);
}

/** The stamp: a short thud. The loudest sound on the desk, so it is the one the fader plays to say how loud. */
function stamp(ctx: AudioContext, t: number) {
  tone(ctx, t, 'sine', 150, 40, 0.5, 0.2);
  hiss(ctx, t, 'lowpass', 900, 0.25, 0.08);
}
export const thunk = () => withAudio(stamp);

/** "Now serving": the two-note chime of every waiting room. */
export const chime = () =>
  withAudio((ctx, t) => {
    tone(ctx, t, 'sine', 659, 659, 0.12, 0.5);
    tone(ctx, t + 0.22, 'sine', 523, 523, 0.12, 0.7);
  });

/** The hall's PA clearing its throat: three rising notes, from the chord the music is in. They
 * start as the board's letters do (hall.css), after the shutter has had its say. */
export const pa = () =>
  withAudio((ctx, t) => {
    [523, 659, 784].forEach((hz, i) => tone(ctx, t + 0.8 + i * 0.24, 'sine', hz, hz, 0.07, 0.9));
  });

/** Paper sliding across the desk. */
export const paper = () => withAudio((ctx, t) => hiss(ctx, t, 'bandpass', 2600, 0.12, 0.18));

/** The printout coming down on the blotter: continuous paper, a lighter and crisper crackle than a card's, in two parts. */
export const rustle = () =>
  withAudio((ctx, t) => {
    hiss(ctx, t, 'bandpass', 3400, 0.07, 0.06);
    hiss(ctx, t + 0.05, 'bandpass', 4300, 0.05, 0.08);
  });

/** The dot-matrix printer: a burst of clicks. */
export const printer = () =>
  withAudio((ctx, t) => {
    for (let i = 0; i < 14; i++) hiss(ctx, t + i * 0.035, 'highpass', 3000, 0.06, 0.02);
  });

/** One syllable of an applicant's voice. */
export const blip = (pitch: number) => withAudio((ctx, t) => tone(ctx, t, 'square', pitch, pitch * 0.94, 0.025, 0.05));

/** End of shift: the bell. */
export const closing = () =>
  withAudio((ctx, t) => {
    tone(ctx, t, 'triangle', 880, 880, 0.15, 1.2);
    tone(ctx, t, 'sine', 1320, 1320, 0.05, 0.9);
  });

/** The shutter: a rattle of slats, rising or falling, and a clunk when it gets there. */
export const shutter = (up: boolean) =>
  withAudio((ctx, t) => {
    for (let i = 0; i < 11; i++) hiss(ctx, t + i * 0.045, 'bandpass', up ? 700 + i * 110 : 1900 - i * 110, 0.11, 0.045);
    tone(ctx, t + 0.52, 'sine', up ? 130 : 95, 45, 0.35, 0.2);
    hiss(ctx, t + 0.52, 'lowpass', 500, 0.2, 0.08);
  });

/** The clock, in the last minute of the shift. */
export const tick = () => withAudio((ctx, t) => hiss(ctx, t, 'highpass', 5000, 0.05, 0.015));
