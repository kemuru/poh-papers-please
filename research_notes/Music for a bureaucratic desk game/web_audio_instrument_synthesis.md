# Web Audio API synthesis of acoustic-sounding instruments and percussion (no samples) for generative game music

Scope: an implementation guide for "Proof of Humanity: Papers, Please" (browser desk game). It uses plain Web Audio nodes (OscillatorNode, GainNode, BiquadFilterNode, ConvolverNode, AudioBufferSourceNode, noise buffers) and says where an AudioWorklet would be needed. The game's current music code (`/Users/kemuru/repos/poh-papers-please/src/ui/music.ts`) already has:
- a two-operator FM "bell" at a 1:1 ratio, with index `hz*1.5 → hz*0.1` over 1.4 s
- detuned triangle "choir" voices at ±7 cents
- a ConvolverNode hall built from 3.5 s of darkened, decaying noise
- a shared "wow" LFO (0.61 Hz and 0.23 Hz) wired into every oscillator's `detune`
- a lookahead scheduler that books notes 1.5 s ahead every 250 ms

All of its voice functions take `BaseAudioContext`, so they also work in an `OfflineAudioContext`.

Conventions in this file:
- Everything under "Cited Findings" has a URL.
- Everything under "Inferences" is my own synthesis, arithmetic or tuning suggestion, labelled as inference. That includes all code recipes and all numbers marked "starting point".
- "Search summary" means the fact came from a search-engine summary of the linked page(s), not from reading the page. Treat those as lower confidence.

---

## 1. Plucked strings and pizzicato (Karplus-Strong without AudioWorklet)

### Takeaway
A native `DelayNode` feedback loop can make a Karplus-Strong (KS) string, but the spec clamps a delay inside a cycle to at least one render quantum (128 frames). That caps pitch at about 345 Hz at 44.1 kHz and about 375 Hz at 48 kHz, and the exact pitch depends on the implementation. The dependable no-Worklet route is to compute KS in plain JS into an `AudioBuffer` (per note, cached) and play it with `AudioBufferSourceNode`, fixing any residual tuning with `detune`. Tone.js itself switched its pluck to an AudioWorklet to get past the 128-sample limit.

### Cited Findings
**The spec's cycle rules**
- Spec text: "If DelayNode is part of a cycle, then the value of the delayTime attribute is clamped to a minimum of one render quantum." — [Web Audio API spec, §DelayNode delayTime](https://webaudio.github.io/web-audio-api/) (source: [index.bs](https://github.com/WebAudio/web-audio-api/blob/main/index.bs))
- A cycle can be broken at a DelayNode "because delay lines cannot be smaller than one render quantum when in a cycle". A cycle with no DelayNode is muted. — [Web Audio API spec, rendering algorithm](https://webaudio.github.io/web-audio-api/)
- MDN: "When creating a graph that has a cycle, it is mandatory to have at least one DelayNode in the cycle, or the nodes taking part in the cycle will be muted." — [MDN DelayNode](https://developer.mozilla.org/en-US/docs/Web/API/DelayNode)
- The render quantum defaults to 128 frames. The v1.1 spec adds an AudioContext `renderSizeHint` option ("default", "hardware", or an integer); the default sets the render quantum size to 128. — [Web Audio API spec, §AudioContext constructor](https://webaudio.github.io/web-audio-api/)
- `maxDelayTime` defaults to 1 s and must be above 0 and below three minutes. — [Web Audio API spec, DelayOptions](https://webaudio.github.io/web-audio-api/)
- A DelayNode in a cycle is "actively processing" only while any output sample in the current quantum has absolute value ≥ 2^-126. — [Web Audio API spec, §actively processing](https://webaudio.github.io/web-audio-api/)

**History of the 128-frame clamp**
- The clamp came from W3C bug 23037 (2013), which asked what happens when a DelayNode in a cycle has delay < 128/sampleRate.
  - Robert O'Callahan proposed clamping to 128 samples.
  - Chris Wilson: "I think clamping to a minimum of one sample block (128 samples) is fine", and said clamping should apply "ONLY in the case of a cycle".
  - The bug was closed WONTFIX on 2014-10-28 when issues moved to GitHub. — [W3C Bug 23037](https://www.w3.org/Bugs/Public/show_bug.cgi?id=23037)

**Real-world native-node KS**
- A CodePen experiment building KS from generic AudioNodes reports that "the Webkit implementation of DelayNode seems to add 128 samples to the delay time", so it had to compensate, and that the highest reachable pitch was "around E4". (Search summary. The page returned HTTP 403 to direct fetch.) — [CodePen: Karplus-Strong with Generic AudioNodes](https://codepen.io/tonywallace/pen/dvxowM)
- Conflict: that describes 128 samples being *added*, while the spec describes a *clamp* to a 128-sample minimum. Behaviour has varied by engine. Measure it; don't assume.

**What Tone.js does**
- `PluckSynth` defaults: `attackNoise: 1`, `dampening: 4000`, `resonance: 0.7`, `release: 1`.
  - It uses a pink-noise burst: `this._noise.start(time); this._noise.stop(time + delayAmount * this.attackNoise)`, where `delayAmount = 1 / freq`.
  - The burst goes into a `LowpassCombFilter` with `delayTime = 1/freq`.
  - Release ramps `resonance` (feedback) to 0 over `release` seconds. — [Tone.js PluckSynth.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/PluckSynth.ts)
- `LowpassCombFilter` is a one-pole lowpass (`dampening`, default 3000 Hz) feeding a `FeedbackCombFilter` (defaults `delayTime 0.1`, `resonance 0.5`). — [Tone.js LowpassCombFilter.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/component/filter/LowpassCombFilter.ts)
- Tone.js docs: "This comb filter is implemented with the AudioWorkletNode which allows it to have feedback delays less than the Web Audio processing block of 128 samples." — [Tone.js FeedbackCombFilter.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/component/filter/FeedbackCombFilter.ts)
- The worklet's per-sample core is `delayed = delayLine.get(delayTime*sampleRate); delayLine.push(input + delayed*feedback); return delayed`, with feedback capped at 0.9999. — [Tone.js FeedbackCombFilter.worklet.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/component/filter/FeedbackCombFilter.worklet.ts)

**The algorithm**
- Basic KS:
  - The first N outputs are random.
  - For n ≥ N, `y[n] = (y[n−N] + y[n−(N+1)])/2`.
  - The result "sounds like a string being plucked at frequency f_s/(N+1/2)", because the two-point average adds half a sample of phase delay.
  - Higher frequencies lose energy faster. — [Ben Lynn, The Karplus-Strong Algorithm](http://crypto.stanford.edu/~blynn/sound/karplusstrong.html)
- Pitch is D = Fs/F0. Fine tuning needs a fractional delay, e.g. linear interpolation `s(4.2) = 0.8·s(4) + 0.2·s(5)`. The excitation can be noise, chirps or sawtooth. — [Wikipedia: Karplus–Strong string synthesis](https://en.wikipedia.org/wiki/Karplus%E2%80%93Strong_string_synthesis)
- JOS (CCRMA): KS starts with white-noise initial conditions, "a very energetic excitation". Lowpass-filtering the noise gives "an effective dynamic level control". — [JOS, PASP: Karplus-Strong Algorithm](https://ccrma.stanford.edu/~jos/pasp/Karplus_Strong_Algorithm.html)

**Extended KS filters (JOS)**
- Pick-direction lowpass `H_p(z) = (1−p)/(1 − p z^-1)`.
- Pick-position comb `H_β(z) = 1 − z^(−⌊βN+1/2⌋)`, with β ∈ (0,1) the pick position.
- String-damping filter with `|H_d| ≤ 1`.
- String-stiffness allpass for inharmonicity.
- First-order tuning allpass `H_η(z) = (−η + z^-1)/(1 − η z^-1)`, with η ∈ [−1/11, 2/3] for tuning delays of 0.2–1.2 samples.
- Dynamic-level lowpass `H_L(z) = (1−R_L)/(1 − R_L z^-1)`, with `R_L = e^(−πLT)`. — [JOS, Extended Karplus-Strong Algorithm](https://ccrma.stanford.edu/~jos/pasp/Extended_Karplus_Strong_Algorithm.html)

### Inferences
**Pitch ceiling of the native loop (arithmetic):**
- 128/44100 = 2.902 ms, so f_max ≈ 344.5 Hz (between E4 = 329.6 Hz and F4 = 349.2 Hz). That matches the CodePen's "around E4".
- At 48 kHz: 128/48000 = 2.667 ms, so f_max = 375 Hz.
- A BiquadFilter in the loop adds frequency-dependent phase delay, which lowers pitch further and detunes it unpredictably.
- If `renderSizeHint` ever gives a larger quantum, the ceiling drops in proportion. The spec ties the clamp to "one render quantum", not to 128.
- Conclusion: the native loop is usable only for bass and low-register pizzicato (below about E4). Even then, tune it by ear or measurement.

**Native-node KS recipe (bass only, < ~300 Hz), inference:**
```
noise ABSN (length ≈ 1/f s, lowpassed) ─► sum:Gain ─► out
                                       └► DelayNode(delayTime ≈ 1/f − comp) ─► Biquad lowpass (2–4 kHz, Q 0 dB) ─► fb:Gain (0.95–0.995) ─► sum
```
- Use `comp = 0` if the engine clamps. Use `comp = 128/sampleRate` if it adds (measure).
- Release: `fb.gain.setTargetAtTime(0, tOff, 0.05)`.
- Disconnect the loop explicitly after about 1.5 × T60. Cycles keep each other referenced, and the DelayNode stays "actively processing" until the signal falls below 2^-126, so don't rely on garbage collection.

**Recommended: precompute KS in JS into an AudioBuffer (inference, based on the cited formulas).**
The cost is a few arithmetic operations per sample, so about 44k samples for a 1 s note. That is negligible in JS, but I didn't measure it here.
```ts
import { createRng } from '../gen/rng'; // project's mulberry32
// Returns buffer + the detune (cents) that corrects integer-period rounding.
export function pluck(ctx: BaseAudioContext, hz: number, seed: number, o = {
  t60: 1.2,        // seconds for fundamental to fall 60 dB (pizz: 0.4–0.8, guitar: 2–4, harpsichord: 3–6)
  bright: 3000,    // excitation lowpass "dynamic level" in Hz (JOS H_L); pizz 800–1500, harpsichord 6000+
  pick: 0.13,      // pick position β (JOS H_β); 0.5 = hollow, 0.1 = twangy
  seconds: 2,
}) {
  const fs = ctx.sampleRate;
  const N = Math.max(2, Math.floor(fs / hz - 0.5));          // f ≈ fs/(N+0.5) for the 2-point average
  const rho = Math.pow(0.001, 1 / (hz * o.t60));              // per-period loop gain giving the chosen T60
  const len = Math.ceil(o.seconds * fs);
  const buf = ctx.createBuffer(1, len, fs);
  const y = buf.getChannelData(0);
  const rng = createRng(seed);
  const R = Math.exp(-Math.PI * o.bright / fs);               // H_L one-pole
  let lp = 0, mean = 0;
  for (let i = 0; i < N; i++) { lp = (1 - R) * (rng.next() * 2 - 1) + R * lp; y[i] = lp; }
  const P = Math.max(1, Math.round(o.pick * N));               // H_β comb: x[n] − x[n−P]
  for (let i = N - 1; i >= P; i--) y[i] -= y[i - P];
  for (let i = 0; i < N; i++) mean += y[i] / N;
  for (let i = 0; i < N; i++) y[i] -= mean;                    // remove DC so the tail doesn't thump
  for (let n = N; n < len; n++) y[n] = rho * 0.5 * (y[n - N] + (n > N ? y[n - N - 1] : 0));
  let peak = 0; for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(y[i]));
  if (peak > 0) for (let i = 0; i < len; i++) y[i] /= peak;
  const detune = 1200 * Math.log2(hz / (fs / (N + 0.5)));      // apply on AudioBufferSourceNode.detune
  return { buf, detune };
}
```
- Play it with ABSN → Gain (velocity) → a shared bus. `src.detune.value = detune` gives exact tuning without a Worklet or allpass.
- Cache buffers by `(midi, variant)`. For more variety, render 2–3 seeds per pitch and pick one with the seeded RNG.
- Reusing one buffer via `playbackRate` over ±2 semitones also works. Decay time and brightness scale with it (inference).
- Why the `rho` formula: the fundamental in basic KS barely decays at low pitch. At 110 Hz, the averaging loss alone is cos(π·110/44100)^110 ≈ 0.9966 per second, so T60 runs to minutes. The loss factor ρ sets a musical T60.
  - Examples: ρ = 0.001^(1/(110·1.0)) = 0.9391 for a 1 s pizz at A2; ρ = 0.9615 at 220 Hz with T60 = 0.8 s.

**Cheaper "fake pluck" without KS (inference):**
- Sawtooth or triangle → lowpass. Start the cutoff at 6–10 × f0 and fall to 1.5–2 × f0 via `setTargetAtTime(…, t, 0.06–0.12)`.
- Amp: 2 ms attack, then `setTargetAtTime(0, t+0.002, T60/6.91)`.
- Good enough for pizzicato violins in a mix. Lacks the KS "shimmer".

**Time constant from T60 (math):** T60 = τ · ln(1000) ≈ 6.91 τ, so `timeConstant = T60 / 6.91`.

### Gaps
- Sound On Sound's Synth Secrets plucked-string article wasn't retrieved; searches returned other KS pages.
- The CodePen's exact code and compensation constant weren't readable (403).
- Current Chrome, Firefox and Safari behaviour (clamp vs. add) wasn't measured in this session.
- No benchmark found for JS KS rendering time per note on laptops.

---

## 2. Mallets: marimba, xylophone, vibraphone, celesta, glockenspiel, music box

### Takeaway
For wooden and metal bars, additive modal synthesis (one sine OscillatorNode per partial, each with its own exponential decay) follows the physics directly:
- marimba about 1 : 3.92 : 9.24 (tuned to about 1:4:10)
- xylophone about 1 : 3.00 : 6.16 (tuned to 1:3:6)
- vibraphone 1:4:10, plus a 1–12 Hz motor tremolo
- untuned glockenspiel-type bars follow the free-bar series 1 : 2.76 : 5.40 : 8.9

FM with a simple ratio can't reproduce those partial sets. It's best kept for electric-piano, celesta and bell colours, where a decaying index gives the bright strike.

### Cited Findings
**Bar partial ratios**
- An ideal uniform beam's second/first mode ratio is 2.76. Symmetric undercutting lets makers raise it to whole numbers, typically 3:1 or 4:1. — [Euphonics 3.3 Marimbas and xylophones](https://euphonics.org/3-3-marimbas-and-xylophones/)
- Measured bars:
  - xylophone 1.00 : 3.00 : 6.16 : 10.29 : 14.01 : 19.66 : 24.02
  - marimba 1.00 : 3.92 : 9.24 : 16.27 : 24.22 : 33.54 : 42.97
  - The author's synthesized examples used Q = 100. — [Euphonics 3.3](https://euphonics.org/3-3-marimbas-and-xylophones/)
- Target tunings are 1:3:6 for xylophone and 1:4:10 for marimba. Marimba bars favour the 4th and 10th partials: two octaves, and three octaves plus a major third, above the root. Fewer partials are tuned on higher notes. (Search summary.) — [Percussion Clinic Adelaide: tuning overtones in marimba bars](https://www.percussionclinic.com/art_marimbuild07.htm)
- The xylophone has a fairly prominent 3rd partial, a powerful 5th and a small spike on the 7th. (Search summary.) — [Orchestration Online: Xylophone vs Marimba spectra](https://orchestrationonline.com/orchestration-tip-harmonic-spectra-of-xylophone-vs-marimba/)

**Vibraphone**
- Aluminium bars. The lowest bar (F3) has overtones F5 and A6, i.e. 1:4:10 like the marimba.
- Quarter-wave resonators, slightly detuned by makers "to create a balance between loudness and sustain".
- Rotating discs create "a tremolo effect and a slight vibrato". Variable-speed motors "typically support rotation rates in the range of 1–12 Hz".
- A damper pedal lets notes ring or stops them. — [Wikipedia: Vibraphone](https://en.wikipedia.org/wiki/Vibraphone)

**Glockenspiel and celesta**
- Glockenspiel (free-free bar) modal ratios are 1.0 : 2.76 : 5.40 : 8.90. (Search summary.) — [CCRMA: Percussion Instruments](https://ccrma.stanford.edu/CCRMA/Courses/152/percussion.html)
- The celesta is essentially a keyboard glockenspiel: felt-covered hammers strike metal plates, for a gentler, less piercing tone. (Search summary.) — [Wikipedia: Celesta](https://en.wikipedia.org/wiki/Celesta)

**FM rules**
- The perceived note frequency is the greatest common divisor of fc and fm. — [DSP First Lab 05, FM Synthesis: Bells and Clarinets (Georgia Tech)](https://dspfirst.gatech.edu/chapters/03spect/labsLV/lab05/lab05.pdf)
- The lab's bell uses fc:fm = 1:2 (e.g. fc = 110 Hz, fm = 220 Hz), with A(t) = A0·e^(−t/τ) and I(t) = I0·e^(−t/τ):
  - case 1: I0 = 10, τ = 2 s, 6 s duration
  - case 3: τ = 12 s
  - case 4: τ = 0.3 s — [DSP First Lab 05](https://dspfirst.gatech.edu/chapters/03spect/labsLV/lab05/lab05.pdf)
- Chowning-style bell: inharmonic c:m = 1:1.4, with a fast-decaying envelope on the modulator. Wood-drum: index about 25 decaying rapidly, a broadband burst at onset followed by a near-sinusoid. (Search summary; the exact page among these wasn't confirmed.) — [UCSD: Some FM instrument examples](http://musicweb.ucsd.edu/~trsmyth/modulation/Some_FM_instrument.html); [Iowa State FM Synthesis lab](https://www.engineering.iastate.edu/~julied/classes/ee224/Labs/FMSynthesis_lab.pdf)

### Inferences
**FM sideband arithmetic (math, not sourced):**
- Components sit at |c ± k·m|.
- c:m = 1:4 gives 1, 3, 5, 7, 9… (odd harmonics), not the marimba's 1, 4, 10.
- c:m = 1:3.92 gives inharmonic 1, 2.92, 4.92, 6.84….
- So "marimba FM 1:4" is a stylisation (a woody, hollow attack), not a modal match. Use additive for believable wood.

**Additive modal mallet (inference; ratios cited above; amplitudes and T60s are starting points to tune by ear):**
```ts
const BAR = {
  marimba:    { r: [1, 3.92, 9.24],        a: [1, 0.30, 0.10],       t60: [1.4, 0.35, 0.10] }, // low notes ring longer
  xylophone:  { r: [1, 3.00, 6.16, 10.29], a: [1, 0.45, 0.25, 0.08], t60: [0.5, 0.20, 0.08, 0.04] },
  vibraphone: { r: [1, 4.0, 10.0],         a: [1, 0.20, 0.06],       t60: [5.0, 1.5, 0.4] },   // pedal down
  glock:      { r: [1, 2.76, 5.40, 8.93],  a: [1, 0.35, 0.18, 0.08], t60: [3.0, 1.0, 0.4, 0.2] },
  celesta:    { r: [1, 2.76, 5.40],        a: [1, 0.15, 0.05],       t60: [1.6, 0.4, 0.15] },  // felt: weaker uppers
};
function mallet(ctx: BaseAudioContext, out: AudioNode, t: number, hz: number, vel: number, kind: keyof typeof BAR) {
  const b = BAR[kind];
  b.r.forEach((ratio, i) => {
    const f = hz * ratio;
    if (f > ctx.sampleRate * 0.45) return;                 // skip partials above Nyquist-ish
    const o = ctx.createOscillator(); o.frequency.value = f;
    const g = ctx.createGain();
    const amp = b.a[i] * vel * (i === 0 ? 1 : vel);         // harder hit → brighter (uppers scale with vel²)
    const t60 = b.t60[i] * Math.min(1, 220 / hz) ** 0.5;    // higher notes die sooner
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(amp, t + 0.002);         // 2 ms: avoids a click, still percussive
    g.gain.setTargetAtTime(0, t + 0.002, t60 / 6.91);
    o.connect(g).connect(out);
    o.start(t); o.stop(t + 0.002 + t60 * 1.2);
  });
}
```
- **Mallet hardness:** add a 5–10 ms noise burst through a bandpass at about 3–5 × f0 (Q ≈ 1.5), with level ∝ velocity. Yarn mallets: skip the click and drop partial 3. Rubber or hard mallets (xylophone): louder click, and scale uppers with velocity squared.
- **Resonator tubes** boost the fundamental. A lowpass at about 4 × f0 on marimba voices gives the warm "tube" feel.
- **Vibraphone motor:** one shared LFO for the whole vibe bus, not per voice.
  - Sine at 3–6 Hz (the cited range is 1–12 Hz) → Gain(depth 0.25–0.45) → `vibeBus.gain`, with `vibeBus.gain.value` at 1 − depth/2.
  - Optionally the same LFO → Gain(3–5 cents) → a detune bus for the "slight vibrato".
  - Slowing the motor between days would read as deadpan fatigue.
- **Music box (inference, physics from beam theory, not verified here):** a clamped-free tine has inharmonic modes at about 1 : 6.27 : 17.5. Use sine partials [1, 6.27] with amplitudes [1, 0.15] and T60 [2.5, 0.3] s, plus a 3 ms 6–8 kHz noise tick and a slight random detune of ±3 cents per note.
- **Celesta via FM:** c:m = 1:1 like the existing `bell()`, but with a lower starting index (I ≈ 0.8 → 0.1 over 0.4 s), plus a quiet 3.5 × f0 sine partial with T60 ≈ 0.3 s for the metal "ping" (inference).
- **Toy piano (inference):** struck metal rods; the same clamped-free ratio [1, 6.27] with a louder, fast-decaying upper partial (T60 0.15 s) and a hard 2 ms click. Detune each key by a seeded ±8–15 cents for cheapness (fits the comedy).

### Gaps
- No quantitative source was found for per-partial decay times (T60 vs. mode number) of marimba, xylophone or vibraphone bars. Euphonics gives no damping data, so the table values above are tuning guesses.
- Vibraphone tremolo depth (dB) wasn't found.
- Music box and toy piano tine ratios come from general beam theory, not a fetched source.
- Chowning's original paper PDF couldn't be fetched (certificate error). The 1:1.4 bell and index-25 wood drum rest on a search summary.

---

## 3. Woodwinds: clarinet, bassoon, oboe, flute, whistling

### Takeaway
- Clarinet: odd-harmonic sources (square wave, or FM with c:m = 3:2) through a gentle lowpass.
- Oboe and bassoon: narrow pulses (PeriodicWave) and fixed formant-like bandpass colour.
- Flute and recorder: triangle or sine plus band-limited breath noise.
- All of them: a 30–80 ms attack that opens brightness with loudness, and a delayed vibrato.

Vibrato rates, formant frequencies and noise levels in the recipes below are my inferences, not sourced.

### Cited Findings
- "A closed pipe produces only odd harmonics", hence the clarinet's "distinctive 'hollow' sound" associated with square waves. An open pipe (recorder) produces all overtones, so use a sawtooth or triangle. The article gives no numeric patch values; those were deferred to a follow-up article. — [Sound On Sound, Synth Secrets: Synthesizing Wind Instruments](https://www.soundonsound.com/techniques/synthesizing-wind-instruments)
- "A square wave will synthesize woody sounds such as clarinets, while thinner-sounding pulse waves provide the reedier tones of oboes and bassoons." (Search summary of the SOS series.) — [Sound On Sound Synth Secrets series](https://www.soundonsound.com/series/synth-secrets-sound-sound)
- Brass and woodwind filter behaviour: lowpass cutoff should rise and fall with loudness. Resonance emphasises upper harmonics as volume increases. Key-tracking should make cutoff rise "more slowly" for higher pitches. — [SOS: Synthesizing Wind Instruments](https://www.soundonsound.com/techniques/synthesizing-wind-instruments)
- FM clarinet (DSP First lab):
  - The note frequency is gcd(fc, fm); e.g. fc = 600 Hz, fm = 900 Hz gives f0 = 300 Hz. The lab states the ratio as 2:3.
  - The index I(t) runs between 2 and 4, inverted: I = 4 where the normalised index envelope is 0, and I = 2 where it is 1.
  - Woodwind envelope: exponential attack, constant sustain, exponential release (example `woodwenv(0.1, 0.35, 0.05)`: attack 0.1 s, sustain 0.35 s, release 0.05 s). — [DSP First Lab 05](https://dspfirst.gatech.edu/chapters/03spect/labsLV/lab05/lab05.pdf)
- Conflict: a search summary of Chowning-derived material gives the clarinet c:m as 3:2 ("produces odd harmonics"), with index between 4 and 2. — [Iowa State FM lab](https://www.engineering.iastate.edu/~julied/classes/ee224/Labs/FMSynthesis_lab.pdf) / [UCSD FM examples](http://musicweb.ucsd.edu/~trsmyth/modulation/Some_FM_instrument.html) (search summary)

### Inferences
**Resolving the 2:3 vs 3:2 conflict (math):**
- c = 900, m = 600 (3:2) gives components |900 ± 600k| = 300, 900, 1500, 2100, 2700…, i.e. odd harmonics of 300 Hz only. That is the clarinet-like choice.
- c = 600, m = 900 (2:3) gives 300, 600, 1200, 1500, 2100, 2400… That set includes even harmonics and is missing multiples of 900. It still has f0 = 300, but it is not "odd-only".
- In Web Audio set `mod.frequency = 2·f0`, `car.frequency = 3·f0`, and `depth.gain = I · (2·f0)`. Index I = peak deviation / fm, which is how the existing `bell()` scales depth (`hz*1.5` with fm = hz means I = 1.5).

**FM clarinet (inference):**
```ts
function clarinetFM(ctx, out, t, f0, dur, vel) {
  const car = ctx.createOscillator(), mod = ctx.createOscillator(), dev = ctx.createGain(), amp = ctx.createGain();
  car.frequency.value = 3 * f0; mod.frequency.value = 2 * f0;
  const m = 2 * f0;
  dev.gain.setValueAtTime(4 * m, t);                         // I = 4 at onset (bright chiff)
  dev.gain.setTargetAtTime(2 * m * (0.7 + 0.3 * vel), t, 0.06); // settles to I ≈ 2
  amp.gain.setValueAtTime(0.0001, t);
  amp.gain.exponentialRampToValueAtTime(0.15 * vel, t + 0.06); // 60 ms reed attack
  amp.gain.setTargetAtTime(0, t + dur, 0.04);                 // ~0.05 s release
  mod.connect(dev).connect(car.frequency); car.connect(amp).connect(out);
  [car, mod].forEach(o => { o.start(t); o.stop(t + dur + 0.3); });
}
```

**Subtractive clarinet (inference):**
- `type = 'square'` → lowpass at `min(5·f0, 3500)` Hz, Q 0.7 (lowpass Q is in dB in Web Audio; see §7).
- Attack 40–70 ms. During the attack, move cutoff from 2·f0 to 5·f0 with `setTargetAtTime(…, t, 0.03)`.
- A square's harmonics fall as 1/k. Low-register clarinet is close to that. For a darker upper register, use a PeriodicWave with odd harmonics at 1/k² above the 5th.

**Oboe (inference):**
- PeriodicWave pulse with duty d ≈ 0.12. Harmonic k amplitude ∝ sin(πkd)/k (math).
- Then a peaking or bandpass boost near 1.0–1.4 kHz (Q 2–3, +6 dB).
- Attack 30–50 ms.
- Nasal, "official", useful for a stamp-happy clerk motif.

**Bassoon (inference):**
- Pulse d ≈ 0.2 through a lowpass at about 1.2 kHz, plus a peaking boost at 400–500 Hz (Q 1.5).
- Attack 50–80 ms.
- Staccato bassoon (gate 40–50% of the step) is the classic deadpan-comedy colour.

**Flute and recorder (inference):**
- Triangle (recorder) or sine plus 2nd harmonic at −12 dB (flute).
- Breath: a shared noise buffer → bandpass centred at 2 × f0, Q 1.5, at −26 dB relative, following the amp envelope.
- A 20–40 ms "chiff" noise burst at onset, 6 dB louder than the steady breath.

**Whistling (inference):**
- Sine f0 (1–2.5 kHz range) plus very quiet bandpassed noise at f0 (Q 8).
- Vibrato 5–6 Hz, ±20–35 cents.
- Portamento between notes: `frequency.setTargetAtTime(next, t, 0.03)`.
- Deadpan-comedy use: a whistled 3-note "tsk".

**Vibrato (inference; rates not sourced):**
- One LFO per voice, or a shared LFO → per-voice Gain on `detune`, like the existing `wow`.
- 4.5–6 Hz, depth 8–20 cents.
- Delayed onset: `depth.gain` at 0 until t + 0.25 s, then `linearRampToValueAtTime(depth, t + 0.6)`.

### Gaps
- No sourced numeric woodwind vibrato rates or depths, formant centre frequencies, breath-noise levels or attack times. The SOS wind article deliberately gives none, and its promised patch follow-up wasn't retrieved.
- Chowning's bassoon parameters (often quoted as c:m = 5:1) weren't verified from any fetched source.

---

## 4. Bass: upright and pizzicato bass, walking bass, tuba and oompah

### Takeaway
- **Upright/pizz bass:** use the precomputed Karplus-Strong buffer from §1. This register (E1–G3, about 41–196 Hz) is also below the native DelayNode-loop ceiling, so a live node loop is possible. The pluck should be dark (excitation lowpass about 600–1200 Hz) with a short T60 (0.4–1.2 s).
- **Tuba/oompah:** a sawtooth "brass" voice whose lowpass cutoff follows loudness, as SOS describes for brass, with short, gated notes.

### Cited Findings
- Brass instruments "produce a sawtooth wave". The lowpass cutoff should rise and fall "as the loudness of the note increases and decreases", and cutoff tracking should rise more slowly for higher pitches. — [SOS: Synthesizing Wind Instruments](https://www.soundonsound.com/techniques/synthesizing-wind-instruments)
- KS parameters and the native-loop constraint are the same as in §1. — [Web Audio API spec](https://webaudio.github.io/web-audio-api/); [Ben Lynn KS](http://crypto.stanford.edu/~blynn/sound/karplusstrong.html)
- Chowning's classic FM set includes "a generic brass instrument" alongside bell, clarinet, bassoon and violin. (Search summary; parameters not retrieved.) — [UCSD: Some FM instrument examples](http://musicweb.ucsd.edu/~trsmyth/modulation/Some_FM_instrument.html)

### Inferences
**Pizzicato/upright bass (inference):**
- `pluck(ctx, hz, seed, { t60: 0.9, bright: 900, pick: 0.2, seconds: 1.5 })`.
- Then a lowpass at 1.2 kHz, plus a "thump": a sine at f0 with a 15 ms attack and 120 ms decay at −10 dB, for the body.
- Walking bass: quarter notes with seeded velocity 0.75–1.0.
  - Ghost notes (velocity 0.3, T60 0.15 s) on a swung 8th before the beat, about 15% of the time.
  - Legato: start the next note 5–10 ms before the previous one ends, with a 30 ms release on the old one.

**Tuba/oompah (inference):**
```ts
function tuba(ctx, out, t, f0, dur, vel) {
  const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0;
  o.detune.setValueAtTime(-35, t); o.detune.setTargetAtTime(0, t, 0.03);   // lip "scoop"
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2; // Q in dB for lowpass
  lp.frequency.setValueAtTime(f0 * 1.5, t);
  lp.frequency.setTargetAtTime(f0 * (2.5 + 3 * vel), t, 0.04);           // brighter when louder (SOS)
  lp.frequency.setTargetAtTime(f0 * 1.5, t + dur, 0.05);
  const a = ctx.createGain();
  a.gain.setValueAtTime(0.0001, t); a.gain.exponentialRampToValueAtTime(0.35 * vel, t + 0.05);
  a.gain.setTargetAtTime(0, t + dur, 0.05);
  o.connect(lp).connect(a).connect(out); o.start(t); o.stop(t + dur + 0.4);
}
```
- Oompah: tuba on beats 1 and 3, root then fifth, gate about 55% of a beat. Accordion or brass chord stabs on 2 and 4, gate 35%.
- A slightly late, heavy tuba on 1 (+10 ms) reads as bureaucratic plodding.

### Gaps
- No sourced envelope or filter numbers for tuba or upright bass.
- Chowning's brass parameters (commonly c:m = 1:1 with index rising with amplitude) weren't verified in this session.

---

## 5. Keyboards: harpsichord, toy piano, electric piano, accordion/harmonium, cimbalom, balalaika tremolo

### Takeaway
- **Accordion/harmonium** is the easiest high-value "Eastern European bureaucracy" colour. Use 2–3 reed voices (sawtooth or pulse) per note, detuned by the cited musette tunings: "swing" 4 cents (≈1 Hz beating near A4), German/Italian 15 cents (≈4 Hz), French 18 cents (≈5 Hz), with one reed flat and one sharp by the same amount.
- **Harpsichord and cimbalom:** precomputed KS with a bright excitation and a pick-position comb. For cimbalom, use 2–3 detuned "strings" per course and a hammer-like excitation.
- **Balalaika/domra tremolo:** fast repeated seeded plucks.
- **Electric piano:** the game's existing 1:1 FM bell already covers it.

### Cited Findings
- Accordion tuning:
  - "Dry" tunings have small reed differences and weak beating; "wet" tunings have large ones.
  - Musette tunings: 0 Hz/0 cents (unison), 0.5 Hz/2 cents (concert), 1 Hz/4 cents (swing), 2.5 Hz/10 cents (American/Cajun/Québécois), 4 Hz/15 cents (German/Italian), 5 Hz/18 cents (French).
  - French musette is "much wetter than all other tunings" and typically has one reed set tuned flat by exactly as much as another is tuned sharp.
  - The same cents difference gives different beat rates across the range.
  - (Search summary.) — [Fort Bend Accordion Club: Tuning](https://fortbendaccordionclu.wixsite.com/accordion/tuning); [Accordionists Forum: Musette tuning](https://www.accordionists.info/threads/musette-tuning.2825/)
- The EKS pick-position comb `1 − z^(−⌊βN+1/2⌋)` and dynamic-level lowpass `R_L = e^(−πLT)` control pluck brightness and position. — [JOS Extended KS](https://ccrma.stanford.edu/~jos/pasp/Extended_Karplus_Strong_Algorithm.html)
- The game's current "electric-piano bell" is two-operator FM with modulator = carrier frequency and index decaying 1.5 → 0.1 over 1.4 s, with a 5 s amp decay. — local file `/Users/kemuru/repos/poh-papers-please/src/ui/music.ts`

### Inferences
**Beat-rate check (math):** at A4 = 440 Hz, 4 cents = 440·(2^(4/1200) − 1) ≈ 1.02 Hz, and 18 cents ≈ 4.6 Hz. The cited Hz and cents pairs are consistent with reference to about A4. If a constant beat rate across the keyboard is wanted, set the detune in Hz (`frequency.value = f ± beat/2`) rather than cents.

**Accordion voice (inference):**
```ts
function accordion(ctx, out, t, f0, dur, vel, wet = 15 /* cents; 18 = French musette */) {
  const bus = ctx.createGain(), lp = ctx.createBiquadFilter(), bellows = ctx.createGain();
  lp.type = 'lowpass'; lp.frequency.value = Math.min(f0 * 8, 4500); lp.Q.value = 0;
  [-wet, 0, +wet].forEach(c => {                       // 3-reed French-style: flat, centre, sharp
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f0; o.detune.value = c;
    o.connect(bus); o.start(t); o.stop(t + dur + 0.3);
  });
  bus.gain.value = 0.08;
  bellows.gain.setValueAtTime(0, t);
  bellows.gain.linearRampToValueAtTime(vel, t + 0.07);  // 60–120 ms reed speak / bellows
  bellows.gain.setTargetAtTime(0, t + dur, 0.06);
  bus.connect(lp).connect(bellows).connect(out);
}
```
- Chord voicing: keep the reed count at 2 for chords (−wet, +wet). Three reeds × 4 notes = 12 oscillators per chord, which adds up (see §7).
- For "bassoon reed" register colour: add an octave-down pulse (d ≈ 0.3) at −8 dB.
- A shared slow bellows LFO (0.2–0.4 Hz, ±1.5 dB on the accordion bus) sounds human. A bureaucratic harmonium drone: 2 reeds at ±2 cents ("concert"), long attack 0.3 s.

**Harpsichord (inference):**
- `pluck(…, { t60: 3–5, bright: 8000, pick: 0.08, seconds: 4 })`.
- Add a second "8-foot" buffer with seed + 1, detuned +3 cents, at −6 dB.
- On key release: a 30 ms damper "thunk" (noise → bandpass 300 Hz Q 2, −20 dB) and a 40 ms `setTargetAtTime(0, …, 0.02)` on the buffer gain.

**Cimbalom (inference):**
- 3 KS buffers per note (different seeds) at 0, +2, −3 cents: courses of multiple strings produce beating.
- Excitation: replace noise with a 1–2 ms half-sine "hammer" plus a little noise (bright ≈ 4000 Hz), pick 0.12.
- t60 5–8 s (undamped), plus a shared damper that ducks the bus at phrase ends.

**Balalaika/domra tremolo (inference):**
- Re-trigger short KS plucks (t60 0.5 s, bright 5000, pick 0.1) at 8–12 Hz.
- Velocities alternate 1.0 / 0.8 (down/up strokes), with seeded ±4 ms jitter per stroke.
- Crossfade overlapping plucks automatically (each is its own ABSN).
- Budget: 10 ABSN starts per second per voice is cheap because each is 2 nodes (inference).

**Toy piano:** see §2.

**Electric piano:** the existing `bell()` is a DX-style 1:1 FM EP. For a "tine" edge, add a third sine at 14 × f0 with T60 0.1 s at −24 dB. (Inference: DX7-style tine ratio from memory, not verified.)

### Gaps
- No acoustic measurements were found for free-reed spectra (harmonium/accordion) or cimbalom partial decays.
- No sourced balalaika tremolo rate.
- The DX7 E.Piano operator ratios weren't verified.

---

## 6. Percussion: brushed snare, woodblock, rim click, soft kick, hi-hat, triangle, typewriter keys and bell, rubber-stamp thud, clock tick

### Takeaway
Three building blocks cover everything:
1. **Pitched-sine drum** with a downward pitch sweep (kick, stamp thud).
2. **Filtered noise** from one cached noise buffer played at random offsets (snare, brushes, hats, paper, typewriter clack).
3. **Ringing resonators:** an impulse into a high-Q bandpass, or a few sines at inharmonic ratios (woodblock, claves, clock tick, triangle, bells).

Published recipes supply exact starting numbers for the TR-808 hi-hat (6 squares at 40 Hz × [2, 3, 4.16, 5.43, 6.79, 8.21], bandpass 10 kHz, highpass 7 kHz), the cowbell (587 and 845 Hz, bandpass 2.64 kHz), the snare (drum-head modes near 180 and 330 Hz plus band-limited noise), Tone.js MetalSynth ratios, and MembraneSynth sweeps.

### Cited Findings
**Hi-hat (808-style)**
- Joe Sullivan, "Synthesizing Hi-Hats with Web Audio", following Gordon Reid's SOS 808 analysis: "six square wave oscillators feed into a bandpass filter, which feeds into a highpass filter, which goes through a volume envelope."
  - Code: `fundamental = 40`, `ratios = [2, 3, 4.16, 5.43, 6.79, 8.21]`, `osc.type = "square"`, `bandpass.frequency.value = 10000`, `highpass.frequency.value = 7000`.
  - Envelope: `setValueAtTime(0.00001, when)`, `exponentialRampToValueAtTime(1, when+0.02)`, `→ 0.3 at when+0.03`, `→ 0.00001 at when+0.3`. A shorter variant decays by `when+0.1`.
  - "we don't actually synthesize the fundamental." — [joesul.li: Synthesizing Hi-Hats with Web Audio](http://joesul.li/van/synthesizing-hi-hats/)

**Metal (Tone.js MetalSynth)**
- Defaults: attack 0.001, decay 1.4, release 0.2, harmonicity 5.1, modulationIndex 32, resonance 4000 (highpass floor), octaves 1.5.
- Six FM oscillators at ratios `[1.0, 1.483, 1.932, 2.546, 2.63, 3.897]` through a highpass (Q 0) whose cutoff the envelope sweeps from `resonance` up to a maximum set by `octaves` (7000 Hz upper limit). — [Tone.js MetalSynth.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/MetalSynth.ts)

**Membrane (Tone.js MembraneSynth)**
- Defaults: sine, pitchDecay 0.05 s, octaves 8, envelope attack 0.001 / decay 0.4 / sustain 0.01 / release 1.4, exponential attack curve.
- The code sets `maxNote = hertz * Math.pow(2, this.octaves)`, then `exponentialRampToValueAtTime(hertz, t + pitchDecay)`.
- The docstring says "starts at note * .octaves". The code actually uses 2^octaves. — [Tone.js MembraneSynth.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/instrument/MembraneSynth.ts)

**Snare**
- Drum-head (0,1)-type modes near 180 Hz and 330 Hz (two sine oscillators) plus noise.
- The TR-909 snare runs noise through "a low-pass filter" then "a high-pass filter that removes the low frequencies… leaving a narrow band of noise".
- On a mono synth the snare is noise at full level with no resonance and short decay and release.
- No brush recipe is given. — [SOS: Practical Snare Drum Synthesis](https://www.soundonsound.com/techniques/practical-snare-drum-synthesis)

**Cowbell and claves**
- 808-style cowbell: "a pair of tones with fundamental pitches of approximately 587Hz and 845Hz. With a frequency ratio of 1:1.44", bandpass centre 2.64 kHz (24 dB/oct preferred over 12).
- Two-stage envelope with "abrupt level decay at the initial trailing edge to emphasise attack", then a longer tail.
- Claves come from "a Bridged-T oscillator kicked by a trigger and allowed to decay"; on a synth, a single triangle oscillator with a very short decay gives "a nice, woody click". — [SOS: Synthesizing Cowbells & Claves](https://www.soundonsound.com/techniques/synthesizing-cowbells-claves)
- The 808 service manual lists the cowbell oscillators as 540 Hz and 800 Hz. That conflicts with SOS's 587/845 Hz. (Search summary.) — [Wikipedia: Roland TR-808](https://en.wikipedia.org/wiki/Roland_TR-808)
- Clave: sine or filtered triangle with 150–250 ms amp decay, starting around E6, anywhere in 1.5–3.5 kHz. (Search summary; exact page not confirmed.) — [MusicRadar: recreate classic analogue drum sounds](https://www.musicradar.com/how-to/how-to-recreate-classic-analogue-drum-sounds-in-your-daw-and-with-hardware)

**Web Audio background**
- BiquadFilter uses linear Q for bandpass (`α_Q = sin ω0/(2Q)`) but dB-valued Q for lowpass and highpass (`α_QdB = sin ω0/(2·10^(Q/20))`). — [Web Audio API spec, §BiquadFilterNode filter formulas](https://webaudio.github.io/web-audio-api/)
- Biquad filters are "relatively cheap (five multiplication and four additions per sample)". — [Paul Adenot, Web Audio API performance and debugging notes](https://padenot.github.io/web-audio-perf/)

### Inferences
**Shared noise (inference):**
- Create one 2 s stereo white-noise buffer once (the game already has `whiteNoise()`).
- Each hit: `src.start(t, rng.next() * 1.8, dur)`. The random offset stops repeated hits sounding identical, with no allocation per hit. That matches Adenot's "reusing arrays" advice.

**Ringing-resonator math:**
- A 2-pole bandpass rings with amplitude ∝ e^(−π f0 t / Q), so τ = Q/(π f0) and T60 ≈ 6.91·Q/(π f0).
- Worked values: 900 Hz with Q 30 gives T60 ≈ 73 ms (woodblock). 2.5 kHz with Q 120 gives T60 ≈ 106 ms (claves). 3.2 kHz with Q 25 gives T60 ≈ 17 ms (tick).
- Excite with a 2–4-sample impulse `AudioBuffer`, or a 1 ms noise burst.
- The RBJ bandpass has 0 dB peak gain, so an impulse comes out quiet: follow with Gain 4–20.

**Recipes (all inference, starting points):**

| Sound | Recipe |
|---|---|
| **Soft kick** | Sine; `frequency` 2^1.5·f → f (f = 50–60 Hz) via `exponentialRampToValueAtTime` over 60–80 ms (much gentler than Tone's 8-octave default); amp 1 ms attack, `setTargetAtTime(0, t, 0.08)`; add a lowpassed-noise (400 Hz) 10 ms "felt" layer at −18 dB. |
| **Brushed snare (sweep)** | Noise → bandpass 3.5 kHz, Q 0.8 → highpass 1.2 kHz (12 dB) → gain rising over 60–120 ms (linear) then `setTargetAtTime(0, …, 0.08)`; level −20 dB. Bandpass centre sweeps 2.5 → 4.5 kHz during the stroke for the circular motion. |
| **Brushed snare (tap)** | 12 ms noise burst → bandpass 2.2 kHz Q 0.7, plus sines 180 Hz and 330 Hz (SOS modes) at −14 dB with τ = 0.03 s. Alternate tap velocities 1.0/0.7 with swing. |
| **Rim click / sidestick** | Impulse → bandpass 1.7 kHz Q 18 (T60 ≈ 23 ms) + bandpass 480 Hz Q 8 at −6 dB + 3 ms noise → highpass 4 kHz at −10 dB. |
| **Woodblock** | Impulse → two bandpasses: f and 2.3·f (f = 700–1200 Hz; ratio is a guess at a hollow-block mode), Q 30 and 20, gains 1 and 0.4; overall gain ×10. Pair a high and a low block a fourth apart for "tick-tock" bureaucracy. |
| **Claves** | Triangle or sine at 2.2–2.6 kHz (SOS/MusicRadar), amp τ 25–35 ms; or impulse → bandpass Q 120. |
| **Closed hi-hat** | Joe Sullivan's 808 recipe with decay → 0.00001 at t + 0.05–0.08. Cheaper variant: noise → bandpass 10 kHz Q 1 → highpass 7 kHz, same envelope (3 nodes instead of 9). |
| **Triangle (instrument)** | Additive sines at f × [1, 2.76, 5.40, 8.93] (free bar) or MetalSynth ratios [1, 1.483, 1.932, 2.546, 2.63, 3.897] with f ≈ 1.2–1.8 kHz; amplitudes [1, 0.6, 0.5, 0.3]; T60 2.5–4 s; each partial detuned by seeded ±0.3% for shimmer; 2 ms 8 kHz noise tick. |
| **Typewriter key** | (1) 2–3 ms noise → highpass 3 kHz (the key). (2) Impulse → bandpass 1.8 kHz Q 8 and 4.5 kHz Q 5 (type-bar slap, T60 ≈ 10–20 ms). (3) 25 ms noise → lowpass 250 Hz at −8 dB (platen thud). Seeded ±15% pitch on (2) and ±3 dB level per key; rate 6–10 keys/s with bursty gaps. |
| **Carriage return + bell** | Ratchet: 10–14 clicks (impulse → bandpass 2.5 kHz Q 10) spaced 25–35 ms, accelerating; slide noise (bandpass 800 Hz Q 1, 300 ms); then the "ding": FM c:m = 1:1.4 (Chowning bell ratio), carrier ≈ 2.1 kHz, index 3 → 0.3 over 0.25 s, amp T60 1.2 s. Or the SOS cowbell pair scaled ×3.5 (≈2.05 and 2.96 kHz) → bandpass 5 kHz. |
| **Rubber-stamp thud** | Sine 120 → 45 Hz exponential over 45 ms, amp τ 0.03 s; 20 ms noise → lowpass 350 Hz; "ink slap" 8 ms noise → bandpass 1.5 kHz Q 1 at −12 dB; optional lift "tack" 120 ms later (impulse → bandpass 900 Hz Q 6). Good as a music-bed downbeat that matches the game's actual stamp. |
| **Clock tick** | Impulse → bandpass 3.2 kHz Q 25 (tick) alternating with 2.6 kHz Q 25 (tock), gain ×15, plus a 1 ms 6 kHz click; lock to the tempo grid (60 BPM ticks = 1 Hz) or deliberately *not* locked for anxiety. |

- **Snare body from noise without a live oscillator:** a single noise ABSN → two parallel bandpasses at 180 Hz and 330 Hz (Q 6) gives drum-head colour with 3 nodes.

### Gaps
- No acoustic measurements were found for typewriters, rubber stamps, clock escapements or brushes on snare. Those recipes are designed by ear and must be tuned by listening.
- The 808 cowbell frequency discrepancy (540/800 vs 587/845 Hz) is unresolved; either works musically.
- The woodblock's second-mode ratio (2.3) is a guess.

---

## 7. Mixing many simultaneous voices in Web Audio

### Takeaway
- Use fire-and-forget voices: create nodes per note, `start`/`stop` them, and let the engine release finished subgraphs.
- Keep expensive nodes (ConvolverNode, compressor, any HRTF panner) as single shared buses.
- Envelope every start and stop so nothing clicks. The spec makes exponential ramps to or from 0 impossible, so use `setTargetAtTime` or 0.0001 floors.
- Cap polyphony per instrument.
- The DynamicsCompressorNode defaults (−24 dB threshold, ratio 12, knee 30) are aggressive for a master bus; soften them.
- Previews can be rendered with `OfflineAudioContext`, which renders faster than real time. The game's voice functions already take `BaseAudioContext`.

### Cited Findings
**Node lifetime and garbage collection**
- "The Web Audio API takes a fire-and-forget approach to audio source scheduling. That is, source nodes are created for each note during the lifetime of the AudioContext, and never explicitly removed from the graph." — [Web Audio API spec, §Lack of Introspection or Serialization Primitives](https://webaudio.github.io/web-audio-api/)
- "When the note has finished playing, the context will automatically release the reference to the AudioBufferSourceNode, which in turn will release references to any nodes it is connected to… The nodes will automatically get disconnected from the graph and will be deleted when they have no more references. Nodes in the graph which are long-lived and shared between dynamic voices can be managed explicitly." — [Web Audio API spec, §Dynamic Lifetime](https://webaudio.github.io/web-audio-api/)
- An AudioScheduledSourceNode is actively processing only while playing. `start()` throws `InvalidStateError` if the node's `[[source started]]` slot is already true, so each source plays once. — [Web Audio API spec, §AudioScheduledSourceNode](https://webaudio.github.io/web-audio-api/)
- Nodes that still hold output, e.g. a DelayNode tail, are "kept around (not collected) until it has finished reading and has output all of its internal buffer." — [Adenot, web-audio-perf](https://padenot.github.io/web-audio-perf/)

**Relative node costs (Adenot)**
- OscillatorNode: after setup, "linear interpolation between multiple wave tables".
- Biquad: cheap (5 multiplications and 4 additions per sample).
- ConvolverNode: "Very expensive", scaling with impulse duration, since "multiple FFT are computed for each block".
- HRTF PannerNode: "Very expensive". Equal-power panner: "Rather cheap".
- DynamicsCompressor: "Not too expensive", uses a peak-detecting look-ahead.
- AudioBufferSourceNode: resampling cost varies (linear in Blink/WebKit; costlier, higher quality in Gecko).
- a-rate params are computed per sample and k-rate once per 128-frame block. "It is even more efficient to not use AudioParam if not necessary." — [Adenot, web-audio-perf](https://padenot.github.io/web-audio-perf/)

**Compressor**
- `DynamicsCompressorOptions` defaults: attack 0.003, knee 30, ratio 12, release 0.25, threshold −24. — [Web Audio API spec, DynamicsCompressorOptions IDL](https://webaudio.github.io/web-audio-api/); [MDN DynamicsCompressorNode()](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode/DynamicsCompressorNode)
- Attack is the time to reduce gain by 10 dB; release is the time to increase it by 10 dB. The node's channelCountMode is "clamped-max" with channelCount 2. — [MDN DynamicsCompressorNode](https://developer.mozilla.org/en-US/docs/Web/API/DynamicsCompressorNode)

**Avoiding clicks**
- `setTargetAtTime` follows `v(t) = V1 + (V0 − V1)·e^(−(t−T0)/τ)`. The time constant is the time to reach 1 − 1/e ≈ 63.2%, and τ = 0 jumps immediately. — [Web Audio API spec, setTargetAtTime](https://webaudio.github.io/web-audio-api/)
- MDN table: 1τ = 63.2%, 2τ = 86.5%, 3τ = 95.0%, 4τ = 98.2%, 5τ = 99.3%. "Getting 95% toward the target value may already be enough; in that case, you could set timeConstant to one third of the desired duration." — [MDN AudioParam.setTargetAtTime()](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime)
- exponentialRampToValueAtTime: "If V0 and V1 have opposite signs or if V0 is zero, then v(t) = V0… This also implies an exponential ramp to 0 is not possible. A good approximation can be achieved using setTargetAtTime() with an appropriately chosen time constant." — [Web Audio API spec, exponentialRampToValueAtTime](https://webaudio.github.io/web-audio-api/)
- "If your website or application requires timing and scheduling, it's best to stick with the AudioParam methods for setting values." Create or resume the context inside a user gesture; a context created outside one starts `suspended`. — [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)

**Convolver and offline rendering**
- ConvolverNode `normalize` (default `true`) scales the impulse response by equal-power normalisation *when the buffer attribute is set*, "to achieve a more uniform output level". — [Web Audio API spec, §ConvolverNode normalize](https://webaudio.github.io/web-audio-api/)
- `OfflineAudioContext` renders "(potentially) faster than real-time" and doesn't output to the device. Precomputing heavy processing ahead of playback ("asset freezing") is recommended. — [Web Audio API spec, §OfflineAudioContext](https://webaudio.github.io/web-audio-api/); [Adenot, web-audio-perf](https://padenot.github.io/web-audio-perf/)

### Inferences
**Topology (inference):**
```
voices (per note: osc/ABSN → filter → env Gain) ─► instrument bus Gain (+ optional StereoPanner) ─►┐
                                                                                                  ├─► music bus ─► soft lowpass ─► dry ┐
shared: 1 ConvolverNode hall (already exists), 1 wow LFO, 1 vibe tremolo LFO, 1 noise buffer      └─► hall send ─► Convolver ─► wet ┴─► master Gain ─► DynamicsCompressor ─► destination
```
- Keep exactly one ConvolverNode. The current 3.5 s IR is fine; cost scales with IR length.
- If adding per-instrument reverb amounts, use per-instrument send Gains into the one hall.
- Never use HRTF panning. `StereoPannerNode` or equal-power is enough (spread instruments ±0.2–0.5).

**The shared-LFO gotcha (inference from the spec lifetime rules):**
- A long-lived, playing node (the `wow` LFO) connected *into* a voice's `detune` gives the voice an active input, which can keep that voice's subgraph alive.
- The existing code correctly calls `wow.disconnect(osc.detune)` in `onended`. Keep that pattern for every shared modulator: tremolo, vibrato, bellows.

**Envelope rules (inference, from the spec math):**
- Start from 0.0001 with `exponentialRampToValueAtTime`, or from 0 with `linearRampToValueAtTime` over ≥ 2 ms.
- Release with `setTargetAtTime(0, tOff, τ)` and call `stop(tOff + 6τ)`. At 6τ the level is e^(−6) ≈ 0.25%, about −52 dB. For very loud voices use 7τ, about −61 dB.
- Always anchor with `setValueAtTime` at the ramp's start time. Ramps begin from the previous automation event, not from "now".
- **Voice stealing:** on the stolen voice, call `gain.cancelScheduledValues(t)` then `gain.setTargetAtTime(0, t, 0.005)` (≈30 ms fade), and start the new voice at t + 0.005. `cancelAndHoldAtTime` exists in the spec but check browser support first (not verified here).

**Polyphony budget (inference; no measured source):**
- Rough node counts per voice: additive mallet 7–10, FM voice 4–5, accordion note 5–6, KS pluck 2–3, hi-hat 9 (808) or 3 (noise), resonator percussion 3–5.
- Cap each instrument, e.g. mallets 12, accordion 4 chords, plucks 16, percussion 16. Steal the oldest or quietest voice.
- Keep total live oscillators under about 150–200 on laptops, then verify with Chrome's `chrome://tracing` or the WebAudio devtools panel.
- The 1.5 s lookahead means a whole 1.5 s of voices exists in the graph at once. Nodes are created in advance, and scheduled-but-not-started sources cost memory but little DSP.

**Gain staging (inference):**
- Aim the sum of voices at about −12 dBFS peak on the master before compression. Per-voice gains around 0.05–0.2 (the existing `choir` uses 0.022) suit 10–20 simultaneous voices.
- Soften the compressor for a "glue" master: threshold −14 to −10 dB, ratio 3–4, knee 6–10 dB, attack 0.005–0.02 s, release 0.2–0.35 s.
- The spec defaults (−24/12:1/30 dB knee) squash quiet deadpan material and pump with percussion.
- Alternative: skip the master compressor entirely. Use careful per-instrument gains plus a single brick-wall safety: compressor with threshold −3, ratio 20, knee 0, attack 0.001.

**Convolver normalisation:** the game's IR is synthesised noise with `normalize` true (default), so the wet level is auto-scaled. To hand-tune IR loudness or build darker variants per scene, set `hall.normalize = false` *before* assigning `hall.buffer` (the spec applies normalisation at buffer-set time).

**Offline preview to WAV (inference; standard RIFF/PCM layout, not sourced here):**
```ts
async function renderPreview(seconds: number, scene: Scene, day: number): Promise<Blob> {
  const sr = 44100, ctx = new OfflineAudioContext(2, Math.ceil(sr * seconds), sr);
  const player = startPlayer(ctx, ctx.destination, scene, day); // existing fn takes BaseAudioContext
  player.book(seconds);                                           // book everything at once; no setInterval offline
  const buf = await ctx.startRendering();
  return wav16(buf);
}
function wav16(b: AudioBuffer): Blob {
  const ch = b.numberOfChannels, n = b.length, bytes = n * ch * 2, v = new DataView(new ArrayBuffer(44 + bytes));
  const s = (o: number, t: string) => [...t].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  s(0, 'RIFF'); v.setUint32(4, 36 + bytes, true); s(8, 'WAVE'); s(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, ch, true);
  v.setUint32(24, b.sampleRate, true); v.setUint32(28, b.sampleRate * ch * 2, true);
  v.setUint16(32, ch * 2, true); v.setUint16(34, 16, true); s(36, 'data'); v.setUint32(40, bytes, true);
  const data = [...Array(ch)].map((_, c) => b.getChannelData(c));
  for (let i = 0, o = 44; i < n; i++) for (let c = 0; c < ch; c++, o += 2)
    v.setInt16(o, Math.max(-1, Math.min(1, data[c][i])) * 0x7fff, true);
  return new Blob([v], { type: 'audio/wav' });
}
```
- This also enables automated checks, e.g. in Playwright: render a seed offline and assert RMS/peak bounds, silence at the end, and no NaNs. Same seed means the same buffer (see §8).
- Any `Math.random` in voice code (e.g. noise generation) breaks bit-exact comparison. Use the seeded RNG for noise too.

### Gaps
- No measured laptop CPU numbers (voices or nodes per % CPU) were found. The polyphony figures above are guesses to verify with profiling.
- DynamicsCompressor look-ahead latency in milliseconds wasn't retrieved.
- `cancelAndHoldAtTime` cross-browser support (notably Firefox) wasn't verified.
- `StereoPannerNode` cost wasn't in the fetched Adenot excerpt.

---

## 8. Generative scheduling: lookahead, tempo changes, swing, humanisation, seeded randomness

### Takeaway
- Keep the "two clocks" pattern: a coarse JS timer books notes on the sample-accurate `AudioContext` clock. Wilson's defaults are 25 ms / 100 ms; the game uses 250 ms / 1.5 s, which is more robust to stalls but slower to react.
- Derive each note time from the *current* tempo when it's booked. Swing and humanisation are pure offsets added to the booked time.
- Timing jitter should stay below perceptual thresholds for "tight" parts (JND about 6 ms) and be correlated, not white.
- Seed the RNG per bar from (day, scene, bar index), so the music is identical live and offline regardless of timer jitter.

### Cited Findings
**A Tale of Two Clocks (Chris Wilson)**
- setTimeout/setInterval "can easily be skewed by tens of milliseconds or more by layout, rendering, garbage collection". Web Audio events still fire exactly when scheduled even if the main thread stalls.
- Pattern: a timer "that fires once every so often, and sets up Web Audio scheduling in the future for individual notes":
  `while (nextNoteTime < audioContext.currentTime + scheduleAheadTime) { scheduleNote(current16thNote, nextNoteTime); nextNote(); }`
- Suggested start: "100ms of 'lookahead' time, with intervals set to 25ms". The tradeoff is that "tempo changes, etc., will take a tenth of a second to take effect."
- `nextNote()` uses `secondsPerBeat = 60.0 / tempo; nextNoteTime += 0.25 * secondsPerBeat;`, so it "picks up the CURRENT tempo value".
- Visuals should use a third clock, requestAnimationFrame, reading `audioContext.currentTime`. — [Chris Wilson, A Tale of Two Clocks (web.dev)](https://web.dev/articles/audio-scheduling)

**Swing (Tone.js Transport)**
- `swing` is 0–1 ("1 equal to the note + half the subdivision"), `swingSubdivision` defaults to "8n", PPQ defaults to 192.
- In `_processTick`, for ticks off the downbeat and off the subdivision pair boundary:
  `progress = (ticks % (swingTicks*2)) / (swingTicks*2); amount = Math.sin(progress*Math.PI) * swingAmount; tickTime += Ticks((swingTicks*2)/3).toSeconds() * amount`.
- Tempo can be ramped with `bpm.rampTo(120, 10)`. — [Tone.js Transport.ts](https://github.com/Tonejs/Tone.js/blob/dev/Tone/core/clock/Transport.ts)

**Human timing research**
- Microtiming deviations range "from a few to several tens of milliseconds" and often show long-range (1/f-like) correlations. Timing fluctuations with long-range temporal correlations are preferred by listeners in humanised computer music. (Search summary.) — [PLOS One: Correlated microtiming deviations in jazz and rock music](https://journals.plos.org/plosone/article?id=10.1371%2Fjournal.pone.0186361)
- Friberg & Sundberg (1995): the JND for timing deviations in an isochronous sequence is about 6 ms for inter-onset intervals under 240 ms. (Search summary.) — [Frontiers in Psychology: Rhythmic Density Affects Listeners' Emotional Response to Microtiming](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2017.01709/full)
- Rasch (1988), string trio: the lead violin tends to lead by 5–10 ms, the viola lags another 5–10 ms, and per-instrument SD is about 35 ms. (Search summary.) — [CNMAT: Microtiming Studies](https://cnmat.berkeley.edu/content/6-microtiming-studies)

**Project constraints**
- The project's PRNG is mulberry32 (`createRng(seed)` with `next()`, `int(min,max)`, `pick(items)`). The architecture rules say randomness goes only through `src/gen/rng.ts`. — local files `/Users/kemuru/repos/poh-papers-please/src/gen/rng.ts`, `/Users/kemuru/repos/poh-papers-please/AGENTS.md`
- The current music scheduler uses `LOOKAHEAD = 1.5` s and `setInterval(() => player.book(LOOKAHEAD), 250)`. — local file `/Users/kemuru/repos/poh-papers-please/src/ui/music.ts`

### Inferences
**Lookahead choice for this game (inference):**
- 1.5 s / 250 ms tolerates long main-thread stalls, and probably the ~1 s timer throttling browsers apply to background tabs (not verified here).
- The cost: scene, tempo or mute changes take up to 1.5 s to be heard.
- Mitigation: on a scene change, (a) ramp the old scene's bus gain down (`setTargetAtTime(0, now, 0.15)`), (b) start a new player/bus whose first booking begins at `now + 0.1`. Old voices are left to die under their muted bus (fire-and-forget).
- Or keep the long window for sustained pads, and book percussion and melody with a shorter window (0.2 s every 50 ms) via a second scheduler lane.

**Tempo changes mid-play (inference):** keep `nextNoteTime` as an accumulator and add `stepBeats * 60 / bpmAt(nextNoteTime)` per step, as Wilson does. A tempo ramp is then just `bpmAt(t)` interpolating. Never recompute past booked times. Already-booked notes (up to 1.5 s) keep the old tempo, so apply the new tempo from the next *bar* boundary to avoid a lurch.

**Swing (math on the cited formula):**
- In Tone.js, with 8th-note swing, the offbeat 8th (progress 0.5, sin = 1) moves by `swing × (1/3 beat)`.
- `swing = 0.5` puts the offbeat at 0.5 + 0.1667 = 0.667 of the beat, i.e. triplet swing. `swing = 1` puts it at 0.833.
- Simple equivalent: `offbeatTime = beatStart + beatDur * (0.5 + s/3)`, with s ∈ [0, 1].
- Light "shuffle" for a lounge or waiting-room feel: s ≈ 0.25–0.35 (offbeat at 0.58–0.62).

**Humanisation (inference, informed by the thresholds above):**
- **Timing jitter:** not white noise. Use a slowly wandering offset per player, e.g. `drift = 0.9*drift + 0.1*gauss()*σ` updated per note, plus a small white part.
  - Suggested σ: bass and drums ≈ 3–5 ms (below the ~6 ms JND, feels "tight").
  - Lead or melody ≈ 8–15 ms, with a constant 5–10 ms *lead* for melody, and pads −10 ms (Rasch's ensemble ordering).
  - The deadpan "clerk band": a deliberately late tuba (+15–25 ms) is a comic character choice.
- **Clamp:** never book earlier than `ctx.currentTime + 0.005`. Apply jitter to the note-on time only, not to the grid accumulator, so errors don't accumulate.
- **Velocity:** ×(1 ± 0.1) seeded, plus accents (beat 1 ×1.15, offbeats ×0.85). Map velocity to brightness as well as gain (index, cutoff or partial amplitudes); pure gain changes sound mechanical.
- **Timbre drift:** per-note seeded detune ±2–4 cents on "acoustic" voices, stacking with the existing `wow`. KS seed per note varies the pluck.

**Seeding for reproducibility (inference):**
```ts
const barRng = (day: number, scene: number, bar: number) =>
  createRng(((day * 73856093) ^ (scene * 19349663) ^ (bar * 83492791)) >>> 0);
```
- Create an RNG per bar (and per lane: `bar*4 + lane`) at booking time.
- The content of bar k then doesn't depend on how many timer callbacks ran or when, so live playback, offline preview and tests all match. Per-lane streams also keep adding a hi-hat lane from reshuffling the melody.
- Draw all random decisions for a bar at the moment its first note is booked. Don't draw lazily inside per-note scheduling, which can split across timer ticks.

**Visual sync (from Wilson):** any on-screen metronome, clock hand or "typing" animation that follows the music should read `ctx.currentTime` (minus `ctx.outputLatency` where available) inside requestAnimationFrame. It should never count setInterval ticks.

### Gaps
- Background-tab timer throttling behaviour, and whether running the scheduler timer in a Web Worker avoids it, weren't sourced. The Wilson summary retrieved didn't cover the Worker variant.
- The human-timing figures (6 ms JND, Rasch's 35 ms SD, long-range correlation preference) come from search summaries of review pages, not the original papers. The PLOS One paper's authors weren't checked.
- The JOS tuning-allpass formula in §1 was rebuilt from a garbled fetch excerpt into the standard form (−η + z^-1)/(1 − η z^-1). Check it against the page before relying on the η range.
- No source was found on optimal swing ratios for specific genres (e.g. musette waltz, oompah). The values above are musical judgement.
