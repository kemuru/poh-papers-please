/** A short, locally synthesized stamp. Audio failure must never prevent a decision. */
export function playStamp() {
  if (typeof window.AudioContext === 'undefined') return;
  try {
    const audio = new AudioContext();
    void audio.resume().then(() => {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(130, audio.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(35, audio.currentTime + 0.1);
      gain.gain.setValueAtTime(0.12, audio.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.12);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.onended = () => { void audio.close().catch(() => {}); };
      oscillator.start();
      oscillator.stop(audio.currentTime + 0.12);
    }).catch(() => { void audio.close().catch(() => {}); });
  } catch {
    // The receipt is sufficient feedback when the browser has no audio device.
  }
}
