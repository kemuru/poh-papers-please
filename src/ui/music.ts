// The waiting-room music, in the manner of Brian Eno's Music for Airports: seven voices, each
// repeating one note on a loop of its own length, 18 to 31 seconds. The loops never line up, so
// the chords they make never come round in the same order, and there is no tune to get stuck in
// anyone's head. Soft bells and slow voices in a large, plain hall; no beat.
// It plays from the first click to the end of the week. Each part of the day has its own chord
// (SCENES) and the voices move to it one by one, so the music changes with the screen instead of
// stopping. The tape is not what it was: from day 3 it wobbles, then the voices drift apart, the
// odd note snags and plays twice, and by day 6 notes go missing.
import { audioContext, readFlag, saveFlag, whiteNoise } from './sound';

export type Scene = 'morning' | 'open' | 'closing' | 'court' | 'statement' | 'promoted' | 'fired';

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
  // Fired: three low voices of D minor.
  fired: ['D3', null, null, 'A3', null, 'F4', null],
};

/** How loud the music and the hall's murmur are in each part of the day. */
const LEVELS: Record<Scene, { music: number; hall: number }> = {
  morning: { music: 0.8, hall: 0.6 },
  open: { music: 1, hall: 1 },
  closing: { music: 0.9, hall: 0.3 },
  court: { music: 1, hall: 0 },
  statement: { music: 0.9, hall: 0 },
  promoted: { music: 1, hall: 0 },
  fired: { music: 0.85, hall: 0 },
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
      now = { scene, day };
      const t = ctx.currentTime;
      level.gain.setTargetAtTime(LEVELS[scene].music, t, 1.5);
      murmur.level.gain.setTargetAtTime(busy(scene, day), t, 1.5);
      wow.gain.setTargetAtTime(WOW[day - 1], t, 2);
    },
    book(ahead) {
      const at = ctx.currentTime - t0;
      const from = Math.max(booked, at);
      if (at + ahead <= from) return;
      for (const note of notesBetween(from, at + ahead, now.scene, now.day)) {
        const pan = ctx.createStereoPanner();
        pan.pan.value = VOICES[note.voice].pan;
        pan.connect(level);
        const t = t0 + note.at;
        if (note.kind === 'choir') choir(ctx, pan, wow, t, note.hz, note.cents);
        else {
          bell(ctx, pan, wow, t, note.hz, note.cents, 0.05);
          if (note.snag) bell(ctx, pan, wow, t + 0.17, note.hz, note.cents, 0.035);
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

/** An electric-piano bell (two-operator FM): bright when struck, mellow as it rings. */
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
  depth.gain.setValueAtTime(hz * 1.5, t);
  depth.gain.exponentialRampToValueAtTime(hz * 0.1, t + 1.4);
  modulator.connect(depth).connect(carrier.frequency);
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(volume, t + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + 5);
  carrier.connect(amp).connect(out);
  for (const osc of [carrier, modulator]) {
    osc.start(t);
    osc.stop(t + 5.1);
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
let musicMuted = readFlag('poh-music-muted');
let wanted: { scene: Scene; day: number } | null = null;
let live: { player: Player; timer: number } | null = null;
let waiting = false;

export function isMusicMuted() {
  return musicMuted;
}

export function setMusicMuted(value: boolean) {
  musicMuted = value;
  saveFlag('poh-music-muted', value);
  if (value) silence();
  else begin();
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
  if (live || musicMuted || !wanted) return;
  // Browsers let a page make sound only once the player has clicked or pressed a key.
  if (navigator.userActivation?.hasBeenActive === false) return waitForGesture();
  const ctx = audioContext();
  if (!ctx) return;
  const player = startPlayer(ctx, ctx.destination, wanted.scene, wanted.day);
  player.book(LOOKAHEAD);
  live = { player, timer: window.setInterval(() => player.book(LOOKAHEAD), 250) };
}

function silence() {
  if (!live) return;
  window.clearInterval(live.timer);
  live.player.stop();
  live = null;
}

function waitForGesture() {
  if (waiting) return;
  waiting = true;
  const go = () => {
    waiting = false;
    window.removeEventListener('pointerdown', go, true);
    window.removeEventListener('keydown', go, true);
    begin();
  };
  window.addEventListener('pointerdown', go, true);
  window.addEventListener('keydown', go, true);
}
