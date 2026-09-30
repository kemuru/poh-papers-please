// The waiting-room music, in the manner of Brian Eno's Music for Airports: seven voices, each
// repeating one note on a loop of its own length, 18 to 31 seconds. The loops never line up, so
// the chords they make never come round in the same order, and there is no tune to get stuck in
// anyone's head. Soft bells and slow voices in a large, plain hall. On its own it sent the clerk to
// sleep, so while the window is open a soft pulse keeps time under it (pulseBetween): the same
// chord broken up and down a bar at a time, struck lightly, no tune and no drum. While it plays,
// every voice waits for its next beat and every bell for the next bar line, landing with the
// pulse's root, so the whole band keeps one time. The bells are soft: struck gently, no bright ding.
// It plays from the first click to the end of the week. Each part of the day has its own chord
// (SCENES) and the voices move to it one by one, so the music changes with the screen instead of
// stopping. The tape is not what it was: from day 3 it wobbles, then the voices drift apart, the
// odd note snags and plays twice, and by day 6 notes go missing.
import { audioContext, glide, readFlag, readItem, saveFlag, saveItem, soundChannel, volumeChanged, whiteNoise } from './sound';
import { audible, gainOf, readLevel, toggle, withLevel, type Channel } from './volume';

export type Scene = 'morning' | 'open' | 'closing' | 'court' | 'statement' | 'promoted' | 'reclassified' | 'superseded' | 'replaced' | 'fired' | 'hush';

type Kind = 'bell' | 'choir';

/** Loop lengths and start times in seconds. No two share a rhythm, so the whole never repeats. */
const VOICES: readonly { kind: Kind; every: number; offset: number; pan: number; drift: number }[] = [
  { kind: 'choir', every: 31.3, offset: 0.5, pan: 0, drift: -1 },
  { kind: 'bell', every: 17.9, offset: 3.1, pan: -0.5, drift: 0.6 },
  { kind: 'bell', every: 21.7, offset: 7.4, pan: 0.4, drift: -0.4 },
  { kind: 'choir', every: 26.3, offset: 11.8, pan: -0.25, drift: 1 },
  { kind: 'bell', every: 19.1, offset: 14.6, pan: 0.6, drift: 0.8 },
  { kind: 'bell', every: 23.3, offset: 5.2, pan: -0.6, drift: -0.9 },
  { kind: 'choir', every: 29.9, offset: 18.9, pan: 0.25, drift: 0.3 },
];

const MIDI = { Bb2: 46, D3: 50, F3: 53, A3: 57, C4: 60, D4: 62, F4: 65, G4: 67, A4: 69, C5: 72, E5: 76, F5: 77 } as const;
export type NoteName = keyof typeof MIDI;

/** What each voice sings in each part of the day, in the order of VOICES; null rests the voice. */
export const SCENES: Record<Scene, readonly (NoteName | null)[]> = {
  // Before the window opens: a few voices, waiting.
  morning: ['F3', null, 'C5', null, null, 'G4', 'A3'],
  // The window is open: F major ninth, all seven. The "now serving" chime is in this chord.
  open: ['F3', 'A4', 'C5', 'C4', 'E5', 'G4', 'A3'],
  // The last stamp is down: thinning out.
  closing: ['F3', 'A4', null, 'C4', null, null, null],
  // The court: D minor ninth, the same notes over a lower, graver bass.
  court: ['D3', 'A4', 'C5', 'F4', 'E5', 'D4', 'A3'],
  // The accounts: B-flat major ninth, a little wistful.
  statement: ['Bb2', 'A4', 'C5', 'D4', null, 'F4', null],
  // Promoted: F major, plain, with a high F on top.
  promoted: ['F3', 'A4', 'C5', 'C4', 'F5', 'G4', 'A3'],
  // Reclassified: open fifths, no third, nobody's key: equipment humming.
  reclassified: ['F3', null, 'C5', 'C4', null, 'F4', null],
  // Superseded: the window's own chord, all seven voices. Window 3 goes on, with the other Robin Hale.
  superseded: ['F3', 'A4', 'C5', 'C4', 'E5', 'G4', 'A3'],
  // Replaced: D minor, thin, with a high E that does not settle.
  replaced: ['D3', null, 'C5', 'A3', 'E5', null, null],
  // Fired: three low voices of D minor.
  fired: ['D3', null, null, 'A3', null, 'F4', null],
  // Six o'clock, the lever pulled: nothing, for the beat before the number, as before every citation all week.
  hush: [null, null, null, null, null, null, null],
};

/** The pulse's tempo while the window is open. Chosen by ear, over busier and slower versions. */
export const PULSE_BPM = 104;
const EIGHTH = 30 / PULSE_BPM;
export const PULSE_BEAT = 2 * EIGHTH;
export const PULSE_BAR = 8 * EIGHTH;

const [F3, A3, C4, E4, G4, A4, C5] = [53, 57, 60, 64, 67, 69, 72];
/**
 * The pulse's four bars: the window's F major ninth broken up and back down, a bar at a time, the
 * root on every downbeat. The third bar reaches up to C and comes back; the fourth steps down to A
 * to lead home; then round again. A figure the ear settles into instead of following.
 */
const PULSE_BARS = [
  [F3, C4, E4, G4, A4, G4, E4, C4],
  [F3, C4, E4, G4, A4, G4, E4, C4],
  [F3, C4, E4, A4, C5, A4, E4, C4],
  [F3, C4, E4, G4, A4, G4, E4, A3],
];
/** How hard each eighth of the bar is struck: the downbeat most, beat three next, the off-beats least. */
const PULSE_TOUCH = [1, 0.55, 0.72, 0.55, 0.85, 0.55, 0.72, 0.55];

export type PulseNote = { at: number; hz: number; accent: number };

/**
 * The pulse due from `from` to `to` seconds into the music, while the window is open. `since` is
 * the bar line it started on: the four bars count from there, and it comes in over two bars.
 */
export function pulseBetween(from: number, to: number, scene: Scene, since = 0): PulseNote[] {
  if (scene !== 'open') return [];
  const notes: PulseNote[] = [];
  const first = Math.round(since / EIGHTH);
  for (let k = Math.max(first, Math.ceil(from / EIGHTH - 1e-9)); k * EIGHTH < to; k++) {
    const bar = Math.floor((k - first) / 8);
    const entrance = bar === 0 ? 0.5 : bar === 1 ? 0.75 : 1;
    const midi = PULSE_BARS[bar % PULSE_BARS.length][(k - first) % 8];
    notes.push({ at: k * EIGHTH, hz: 440 * 2 ** ((midi - 69) / 12), accent: PULSE_TOUCH[(k - first) % 8] * entrance });
  }
  return notes;
}

/** The first beat at or after `at`. */
export const onBeat = (at: number) => Math.ceil(at / PULSE_BEAT - 1e-9) * PULSE_BEAT;

/** The first bar line at or after `at`. */
const nextBar = (at: number) => Math.ceil(at / PULSE_BAR - 1e-9) * PULSE_BAR;

/**
 * When a voice's note is heard. While the window is open, the pulse sets the time: a slow voice
 * waits for the next beat, a bell for the next bar line, so it lands with the pulse's root and
 * sounds like part of the pattern. Elsewhere, when it is due.
 */
export const heardAt = (note: Pick<Note, 'at' | 'kind'>, scene: Scene) =>
  scene !== 'open' ? note.at : note.kind === 'bell' ? nextBar(note.at) : onBeat(note.at);

/** How loud the music and the hall's murmur are in each part of the day. */
const LEVELS: Record<Scene, { music: number; hall: number }> = {
  morning: { music: 0.8, hall: 0.6 },
  open: { music: 1, hall: 1 },
  closing: { music: 0.9, hall: 0.3 },
  court: { music: 1, hall: 0 },
  statement: { music: 0.9, hall: 0 },
  promoted: { music: 1, hall: 0 },
  reclassified: { music: 0.9, hall: 0 },
  superseded: { music: 0.9, hall: 0 },
  replaced: { music: 0.85, hall: 0 },
  fired: { music: 0.85, hall: 0 },
  hush: { music: 0, hall: 0 },
};

/** The tape, day by day, in cents: how far it wobbles, and how far the voices have drifted apart. */
const WOW = [0, 0, 4, 7, 10, 13, 17];
const DRIFT = [0, 0, 0, 4, 6, 9, 12];

export type Note = { at: number; voice: number; kind: Kind; name: NoteName; hz: number; cents: number; snag: boolean };

/** Every note due from `from` to `to` seconds into the music. */
export function notesBetween(from: number, to: number, scene: Scene, day: number): Note[] {
  const notes: Note[] = [];
  VOICES.forEach((voice, v) => {
    const name = SCENES[scene][v];
    if (name === null) return;
    const hz = 440 * 2 ** ((MIDI[name] - 69) / 12);
    for (let k = Math.max(0, Math.ceil((from - voice.offset) / voice.every)); voice.offset + k * voice.every < to; k++) {
      if (day >= 6 && (k * 5 + v) % 7 === 2) continue;
      const snag = day >= 5 && voice.kind === 'bell' && (k * 7 + v * 3) % 9 === 4;
      notes.push({ at: voice.offset + k * voice.every, voice: v, kind: voice.kind, name, hz, cents: DRIFT[day - 1] * voice.drift, snag });
    }
  });
  return notes.sort((a, b) => a.at - b.at);
}

type Player = {
  /** Moves the music to another part of the day. */
  set: (scene: Scene, day: number) => void;
  /** Books the notes due in the next `ahead` seconds (those missed while the tab slept are skipped). */
  book: (ahead: number) => void;
  stop: () => void;
};

/** Builds the music on an audio context: the game's own, or an offline one to render it to a file. */
export function startPlayer(ctx: BaseAudioContext, destination: AudioNode, scene: Scene, day: number): Player {
  let now = { scene, day };
  const t0 = ctx.currentTime + 0.1;
  let booked = 0;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(1, ctx.currentTime + 3);
  master.connect(destination);

  // Every note goes through the scene's level, a gentle low-pass, and the hall.
  const level = ctx.createGain();
  level.gain.value = LEVELS[scene].music;
  const soft = ctx.createBiquadFilter();
  soft.type = 'lowpass';
  soft.frequency.value = 3200;
  const hall = ctx.createConvolver();
  hall.buffer = hallEcho(ctx);
  const dry = ctx.createGain();
  dry.gain.value = 0.95;
  const wet = ctx.createGain();
  wet.gain.value = 0.75;
  level.connect(soft);
  soft.connect(dry).connect(master);
  soft.connect(hall).connect(wet).connect(master);

  // The pulse has its own way out: in the middle, and drier than the bells, so its rhythm stays clear.
  const pulseBus = ctx.createGain();
  const pulseTone = ctx.createBiquadFilter();
  pulseTone.type = 'lowpass';
  pulseTone.frequency.value = 2800;
  const pulseSend = ctx.createGain();
  pulseSend.gain.value = 0.25;
  pulseBus.connect(pulseTone).connect(master);
  pulseTone.connect(pulseSend).connect(hall);
  /** When the pulse plays, in music time: from a bar line to a bar line (until the window closes, open-ended). */
  let pulseSpan: { since: number; until: number } | null = scene === 'open' ? { since: 0, until: Infinity } : null;
  /** Pulse notes booked, so any past the closing bar line can be taken back. */
  let pulseBooked: { at: number; oscs: OscillatorNode[] }[] = [];

  // The tape's wobble: two slow waves, shared by every note.
  const wow = ctx.createGain();
  wow.gain.value = WOW[day - 1];
  const waves = [0.61, 0.23].map((rate, i) => {
    const wave = ctx.createOscillator();
    wave.frequency.value = rate;
    const depth = ctx.createGain();
    depth.gain.value = i === 0 ? 1 : 0.5;
    wave.connect(depth).connect(wow);
    wave.start();
    return wave;
  });

  const murmur = hallMurmur(ctx, master);
  const busy = (scene: Scene, day: number) => LEVELS[scene].hall * (1 + (day - 1) * 0.1);
  murmur.level.gain.value = busy(scene, day);

  return {
    set(scene, day) {
      const t = ctx.currentTime;
      const at = t - t0;
      if (scene === 'open' && now.scene !== 'open') {
        // The window opens: the pulse starts on the next bar line.
        pulseSpan = { since: nextBar(at + 0.15), until: Infinity };
      } else if (scene !== 'open' && now.scene === 'open' && pulseSpan) {
        // The window closes: the pulse finishes its bar and stops on the bar line.
        const until = nextBar(at + 0.05);
        pulseSpan = { ...pulseSpan, until };
        for (const b of pulseBooked) if (b.at >= until - 1e-6) for (const osc of b.oscs) osc.stop(t);
      }
      now = { scene, day };
      // A hush falls at once, the hall's murmur and every bell's tail with it; anything else comes in over seconds.
      const glideTime = scene === 'hush' ? 0.03 : 1.5;
      level.gain.setTargetAtTime(LEVELS[scene].music, t, glideTime);
      murmur.level.gain.setTargetAtTime(busy(scene, day), t, glideTime);
      wow.gain.setTargetAtTime(WOW[day - 1], t, 2);
    },
    book(ahead) {
      const at = ctx.currentTime - t0;
      const from = Math.max(booked, at);
      if (at + ahead <= from) return;
      pulseBooked = pulseBooked.filter((b) => b.at > at - 2);
      if (pulseSpan) {
        for (const note of pulseBetween(from, Math.min(at + ahead, pulseSpan.until), 'open', pulseSpan.since)) {
          const oscs = pulse(ctx, pulseBus, wow, t0 + note.at, note.hz, DRIFT[now.day - 1] * 0.5, note.accent);
          pulseBooked.push({ at: note.at, oscs });
        }
        if (pulseSpan.until <= at) pulseSpan = null;
      }
      for (const note of notesBetween(from, at + ahead, now.scene, now.day)) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = VOICES[note.voice].pan;
        pan.connect(level);
        const t = t0 + heardAt(note, now.scene);
        if (note.kind === 'choir') choir(ctx, pan, wow, t, note.hz, note.cents);
        else {
          bell(ctx, pan, wow, t, note.hz, note.cents, 0.02);
          if (note.snag) bell(ctx, pan, wow, t + 0.17, note.hz, note.cents, 0.014);
        }
      }
      booked = at + ahead;
    },
    stop() {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
      master.gain.exponentialRampToValueAtTime(0.0001, t + 1.5);
      for (const source of [...waves, ...murmur.sources]) source.stop(t + 1.6);
      window.setTimeout(() => master.disconnect(), 1800);
    },
  };
}

/** The pulse: a soft, round mallet (gentle FM), struck lightly and gone within a second. */
function pulse(ctx: BaseAudioContext, out: AudioNode, wow: AudioNode, t: number, hz: number, cents: number, accent: number): OscillatorNode[] {
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const depth = ctx.createGain();
  const amp = ctx.createGain();
  for (const osc of [carrier, modulator]) {
    osc.frequency.value = hz;
    osc.detune.value = cents;
    wow.connect(osc.detune);
  }
  depth.gain.setValueAtTime(hz * 0.6, t);
  depth.gain.exponentialRampToValueAtTime(hz * 0.05, t + 0.15);
  modulator.connect(depth).connect(carrier.frequency);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.03 * accent, t + 0.01);
  amp.gain.setTargetAtTime(0, t + 0.01, 0.25);
  carrier.connect(amp).connect(out);
  for (const osc of [carrier, modulator]) {
    osc.start(t);
    osc.stop(t + 1.3);
  }
  carrier.onended = () => {
    wow.disconnect(carrier.detune);
    wow.disconnect(modulator.detune);
  };
  return [carrier, modulator];
}

/**
 * A soft bell (two-operator FM), struck gently: it warms up for a moment instead of dinging, and
 * fades in three and a half seconds. The bright, loud version stood out of the music every few
 * seconds and irritated.
 */
function bell(ctx: BaseAudioContext, out: AudioNode, wow: AudioNode, t: number, hz: number, cents: number, volume: number) {
  const carrier = ctx.createOscillator();
  const modulator = ctx.createOscillator();
  const depth = ctx.createGain();
  const amp = ctx.createGain();
  for (const osc of [carrier, modulator]) {
    osc.frequency.value = hz;
    osc.detune.value = cents;
    wow.connect(osc.detune);
  }
  depth.gain.setValueAtTime(hz * 0.5, t);
  depth.gain.exponentialRampToValueAtTime(hz * 0.05, t + 0.8);
  modulator.connect(depth).connect(carrier.frequency);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(volume, t + 0.04);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 3.5);
  carrier.connect(amp).connect(out);
  for (const osc of [carrier, modulator]) {
    osc.start(t);
    osc.stop(t + 3.6);
  }
  carrier.onended = () => {
    wow.disconnect(carrier.detune);
    wow.disconnect(modulator.detune);
  };
}

/** A slow voice: two soft, slightly apart triangles that swell in and fade away. */
function choir(ctx: BaseAudioContext, out: AudioNode, wow: AudioNode, t: number, hz: number, cents: number) {
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.min(hz * 3, 1600);
  filter.Q.value = 0.5;
  const amp = ctx.createGain();
  amp.gain.setValueAtTime(0, t);
  amp.gain.linearRampToValueAtTime(0.022, t + 2.4);
  amp.gain.setTargetAtTime(0, t + 4, 1.5);
  filter.connect(amp).connect(out);
  for (const spread of [-7, 7]) {
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = hz;
    osc.detune.value = cents + spread;
    wow.connect(osc.detune);
    osc.connect(filter);
    osc.start(t);
    osc.stop(t + 12);
    osc.onended = () => wow.disconnect(osc.detune);
  }
}

/** A large, plain hall: noise that dies away over three and a half seconds, darkened. */
function hallEcho(ctx: BaseAudioContext) {
  const echo = whiteNoise(ctx, 3.5, 2);
  for (let c = 0; c < 2; c++) {
    const data = echo.getChannelData(c);
    let dark = 0;
    for (let i = 0; i < data.length; i++) {
      const t = i / ctx.sampleRate;
      dark += 0.3 * (data[i] - dark);
      data[i] = t < 0.012 ? 0 : dark * Math.exp(-t / 0.5);
    }
  }
  return echo;
}

/** People who have been waiting a while: two bands of noise that swell and ebb, never in step. No hiss. */
function hallMurmur(ctx: BaseAudioContext, out: AudioNode) {
  const level = ctx.createGain();
  const muffle = ctx.createBiquadFilter();
  muffle.type = 'lowpass';
  muffle.frequency.value = 1400;
  level.connect(muffle).connect(out);
  const crowd = ctx.createBufferSource();
  crowd.buffer = whiteNoise(ctx, 5.3);
  crowd.loop = true;
  const sources: AudioScheduledSourceNode[] = [crowd];
  for (const [hz, q, volume, rate] of [
    [380, 0.8, 0.012, 0.07],
    [1150, 1.3, 0.005, 0.19],
  ] as const) {
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = hz;
    band.Q.value = q;
    const swell = ctx.createGain();
    swell.gain.value = volume;
    const wave = ctx.createOscillator();
    wave.frequency.value = rate;
    const depth = ctx.createGain();
    depth.gain.value = volume * 0.5;
    wave.connect(depth).connect(swell.gain);
    crowd.connect(band).connect(swell).connect(level);
    wave.start();
    sources.push(wave);
  }
  crowd.start();
  return { level, sources };
}

// ------------------------------------------------------------ in the game

/** Notes are booked this far ahead, so a quarter-second tick keeps up even on a busy page. */
const LOOKAHEAD = 1.5;
let music: Channel = { level: readLevel(readItem('poh-music-volume')), muted: readFlag('poh-music-muted') };
/** The last level the music was heard at, for the switch to bring back after the fader was put at 0. */
let musicHeard = music.level;
/** The music's own gain, set by the clerk's music volume (volume.ts); the player's fades are on its own master, under it. */
let musicBus: GainNode | undefined;
let wanted: { scene: Scene; day: number } | null = null;
let live: { player: Player; timer: number } | null = null;
let waiting = false;

export const musicChannel = () => music;

/** The rail's music switch. */
export const toggleMusic = () => setMusic(toggle(music, musicHeard), true);

/** The music volume fader: the music follows it as it moves. `settled` once it is let go or stepped: then the level is kept. */
export const setMusicLevel = (level: number, settled: boolean) => setMusic(withLevel(level), settled);

function setMusic(next: Channel, settled: boolean) {
  music = next;
  if (next.level > 0) musicHeard = next.level;
  glide(musicBus, gainOf(music));
  if (audible(music)) begin();
  // Silence stops the score as well as its sound, but only once the fader is let go: a drag through 0 does
  // not stop it and start it again.
  else if (settled) silence();
  if (settled) {
    saveFlag('poh-music-muted', music.muted);
    saveItem('poh-music-volume', String(music.level));
  }
  volumeChanged();
}

function musicOut(ctx: AudioContext) {
  if (musicBus?.context !== ctx) {
    musicBus = ctx.createGain();
    musicBus.gain.value = gainOf(music);
    musicBus.connect(ctx.destination);
  }
  return musicBus;
}

declare global {
  interface Window {
    /** Dev and test builds only: both volumes as the clerk set them, and the gain each bus is heading for. */
    __audio?: () => Record<'sound' | 'music', Channel & { gain: number }>;
  }
}
if ((import.meta.env.DEV || import.meta.env.MODE === 'test') && typeof window !== 'undefined') {
  window.__audio = () => ({
    sound: { ...soundChannel(), gain: gainOf(soundChannel()) },
    music: { ...music, gain: gainOf(music) },
  });
}

/** The music for this part of the day. If none is playing yet, it starts at the first click or key. */
export function setMusicScene(scene: Scene, day: number) {
  wanted = { scene, day };
  if (live) live.player.set(scene, day);
  else begin();
}

export function stopMusic() {
  wanted = null;
  silence();
}

function begin() {
  if (live || !audible(music) || !wanted) return;
  // Browsers let a page make sound only once the player has clicked or pressed a key.
  if (navigator.userActivation?.hasBeenActive === false) return waitForGesture();
  const ctx = audioContext();
  if (!ctx) return;
  const player = startPlayer(ctx, musicOut(ctx), wanted.scene, wanted.day);
  player.book(LOOKAHEAD);
  live = { player, timer: window.setInterval(() => player.book(LOOKAHEAD), 250) };
}

function silence() {
  if (!live) return;
  window.clearInterval(live.timer);
  live.player.stop();
  live = null;
}

// A finger lets the page make sound only when it lifts, a mouse when it presses: so pointerup as well,
// or a phone's first tap would go unheard and the music wait for a second.
const GESTURES = ['pointerdown', 'pointerup', 'keydown'] as const;

function waitForGesture() {
  if (waiting) return;
  waiting = true;
  const go = () => {
    waiting = false;
    for (const gesture of GESTURES) window.removeEventListener(gesture, go, true);
    begin();
  };
  for (const gesture of GESTURES) window.addEventListener(gesture, go, true);
}
