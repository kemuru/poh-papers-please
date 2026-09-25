// The stamp's thunk: a short synthesised thud, so there is no audio file to license.
let audio: AudioContext | undefined;

export function thunk() {
  try {
    audio ??= new AudioContext();
    const t = audio.currentTime;
    const tone = audio.createOscillator();
    const volume = audio.createGain();
    tone.frequency.setValueAtTime(150, t);
    tone.frequency.exponentialRampToValueAtTime(40, t + 0.12);
    volume.gain.setValueAtTime(0.5, t);
    volume.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    tone.connect(volume).connect(audio.destination);
    tone.start(t);
    tone.stop(t + 0.2);
  } catch {
    // No Web Audio: the stamp lands silently.
  }
}
