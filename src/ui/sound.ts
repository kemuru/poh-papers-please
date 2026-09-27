// Every sound effect in the game, synthesised with Web Audio, so there are no audio files to license.
// Quiet by design: the ministry hums, it does not shout. Muting is remembered per browser.
// The music is in music.ts, on the same audio context.
let audio: AudioContext | undefined;
let muted = readFlag('poh-muted');

export function readFlag(name: string) {
  try {
    return localStorage.getItem(name) === '1';
  } catch {
    return false;
  }
}

export function saveFlag(name: string, value: boolean) {
  try {
    localStorage.setItem(name, value ? '1' : '0');
  } catch {
    // Private mode: the setting lasts until the page closes.
  }
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  saveFlag('poh-muted', value);
}

/** The page's audio context, made on first use; null where there is no Web Audio. It sleeps while the tab is hidden. */
export function audioContext(): AudioContext | null {
  try {
    if (!audio) {
      const ctx = new AudioContext();
      document.addEventListener('visibilitychange', () => void (document.hidden ? ctx.suspend() : ctx.resume()));
      audio = ctx;
    }
    if (audio.state === 'suspended' && !document.hidden) void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

/** Runs `play` with the audio context and the current time, unless muted or there is no Web Audio. */
function withAudio(play: (ctx: AudioContext, t: number) => void) {
  if (muted) return;
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
  osc.connect(gain).connect(ctx.destination);
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
  src.connect(band).connect(gain).connect(ctx.destination);
  src.start(t, (t * 7) % 0.5);
  src.stop(t + length);
}

/** The stamp: a short thud. */
export const thunk = () =>
  withAudio((ctx, t) => {
    tone(ctx, t, 'sine', 150, 40, 0.5, 0.2);
    hiss(ctx, t, 'lowpass', 900, 0.25, 0.08);
  });

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
