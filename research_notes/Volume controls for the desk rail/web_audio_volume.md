# Volume controls for music and sound effects in a synthesized Web Audio game (0 to 100 levels)

Researched 2026-09-30. Scope: a 0 to 100 level for sound effects and one for music, replacing the on/off switches in `src/ui/sound.ts` and `src/ui/music.ts` of "Proof of Humanity: Papers, Please". Web sources are cited inline. Facts about the game's code cite the files in this repo; the files were read in the redesign worktree and are byte-identical to the main checkout.

## 1. Mapping a 0 to 100 control to gain: which curve, what dynamic range, and what 0 must mean

### Takeaway
Store the integer level and pass it through a perceptual taper. Do not map it straight to amplitude, and do not map it straight to decibels across 80 dB. The sources agree on the shape but not on how steep it should be:
- **Loudness research (Stevens's sone scale):** about x^1.7, so half the slider sounds about half as loud.
- **Audio-taper potentiometers:** about -20 dB at mid-travel.
- **Programmers' guides:** a 60 dB exponential (dr-lex, about x^4) or a 50 dB decibel-linear map (Discord).

This game has two category sliders that sit on top of the operating-system (OS) volume, and its mix is already quiet. For that case, **gain = (level/100)^2** is the best fit, with x^3 as the steeper alternative. It gives exact silence at 0, unity at 100, about -12 dB at 50 and -40 dB at 10.

### Cited Findings
- dr-lex's "Programming Volume Controls" argues that linear volume controls are wrong. It assumes consumer equipment has a usable range of 60 dB (a 90 dB(A) maximum over a 30 dB(A) background) and recommends an exponential curve y = a·e^(b·x) with a = 1e-3 and b = 6.908 for 60 dB. — [dr-lex](https://www.dr-lex.be/info-stuff/volumecontrols.html)
- dr-lex's table gives power-law approximations: 50 dB is about x^3 (a = 3.1623e-3, b = 5.757), 60 dB is about x^4, 70 dB is about x^5. The x^4 form "starts from zero" and costs only a few multiplications. — [dr-lex](https://www.dr-lex.be/info-stuff/volumecontrols.html)
- dr-lex's options for position 0:
  - a hard cutoff, `if (x == 0) ampl = 0`;
  - a smooth linear roll-off below 10 % of travel, `if (x < .1) ampl *= x*10`;
  - a fully linear roll-off, which the author prefers for smoothness even though it makes inverse calculations harder.

  — [dr-lex](https://www.dr-lex.be/info-stuff/volumecontrols.html)
- The dr-lex article circulated on Hacker News as "> 99.9% of volume controls scale the output linearly. Wrong." This is the "volume controls are broken" line of argument. — [Hacker News](https://news.ycombinator.com/item?id=27828587)
- Discord's open-source `perceptual` library ("A smarter volume slider scale") maps a 0 to 100 % position linearly onto a decibel range, then converts to amplitude with 10^(dB/20). Its defaults are a **50 dB** range (-50 to 0 dB) and an optional **6 dB** boost range above 100 %. Its rationale: "Our hearing follows a logarithmic scale. We perceive less difference between loud sounds than we do between soft sounds." — [discord/perceptual](https://github.com/discord/perceptual)
- Loudness scale: each +10 phon is "almost exactly a doubling of the loudness in sones", with N = 2^((L_N − 40)/10). This holds for L_N > 40 phon, and "corrections are needed at lower levels, near the threshold of hearing". Loudness follows a power law of intensity with exponent 0.3 (Stevens). — [Wikipedia: Sone](https://en.wikipedia.org/wiki/Sone)
- Hardware "audio taper" potentiometers: a 10 % log taper measures 10 % of its total resistance at mid-rotation. Cheap log pots only approximate the curve with two tracks that overlap at the middle. Some guides also mention a 20 % law. (Taken from search summaries; the pages were not read in full.) — [Wikipedia: Potentiometer](https://en.wikipedia.org/wiki/Potentiometer); [Bare Knuckle Pickups: tapers explained](https://www.bareknucklepickups.co.uk/news/article/potentiometer-tapers-explained)
- **Unity:** the widely copied recipe uses a slider range of 0.0001 to 1 (not -80 to 0 dB) and passes `Mathf.Log10(value) * 20` to `AudioMixer.SetFloat`. The 0.0001 stops the slider breaking at zero. — [John Leonard French](https://johnleonardfrench.music/the-right-way-to-make-a-volume-slider-in-unity-using-logarithmic-conversion/)
- Unity's mixer runs from +20 dB down to a silent floor of -80 dB. — [cosmiclearn: Unity audio mixers](https://www.cosmiclearn.com/unity/audio-mixers.php)
- **Godot:** the standard recipe is `AudioServer.set_bus_volume_db(bus, linear_to_db(slider_value))`, reading back with `db_to_linear`. — [GDQuest volume slider](https://www.gdquest.com/tutorial/godot/audio/volume-slider/); [Shaggy Dev](https://shaggydev.com/2023/05/22/volume-sliders/)
- Godot's current docs add `set_bus_volume_linear`, which is "equivalent to calling `set_bus_volume_db()` with the result of `@GlobalScope.linear_to_db()`". The docs page does not say which version introduced it. — [Godot AudioServer](https://docs.godotengine.org/en/stable/classes/class_audioserver.html)
- **A source conflict:** a Godot tutorial snippet says "an increase of three dB doubles the volume". That contradicts the sone scale, where about +10 dB sounds twice as loud; +3 dB doubles power and +6 dB doubles amplitude. — [GDQuest (search snippet)](https://www.gdquest.com/tutorial/godot/audio/volume-slider/) vs [Wikipedia: Sone](https://en.wikipedia.org/wiki/Sone)
- **FMOD:** `Studio::VCA::setVolume` takes a **linear gain**, 0 = silent and 1 = full volume. A VCA "linearly modulate[s] the levels of the buses and VCAs which it controls". FMOD leaves the slider curve to the game. — [FMOD Studio API: VCA](https://fmod.com/docs/2.03/api/studio-api-vca.html); [FMOD VCA::setVolume](https://documentation.help/fmod-studio-api/FMOD_Studio_VCA_SetVolume.html)
- **Wwise:** the usual pattern binds a Real-Time Parameter Control (RTPC, a game parameter mapped to a mixer property) to Bus Volume on a bus, driven by a game parameter set from the options menu. — [Rondeau-Clément: master volume with Wwise and Unity](https://www.rondeau-clement.fr/blog/2018/01/06/Create-a-master-volume-control-with-Wwise-and-Unity.html)
- **Web Audio:** GainNode multiplies its input by a linear `gain` AudioParam (default 1) and has no decibel taper built in. Libraries such as Tone.js add decibel-based volume (e.g. `vol.volume.value = -20`) and a separate `mute`. — [MDN GainNode](https://developer.mozilla.org/en-US/docs/Web/API/GainNode); [Tone.js Volume](https://tonejs.github.io/docs/14.7.77/Volume)

### Inferences
- **Comparison of tapers** (dB relative to level 100; computed here from the formulas above):

  | Level | Linear amp (Unity/Godot recipe) | x^2 | x^3 | x^4 | dB-linear 40 dB | dB-linear 50 dB (Discord) | Exp 60 dB (dr-lex) | Loudness-proportional (x^1.66) |
  |---|---|---|---|---|---|---|---|---|
  | 100 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
  | 75 | -2.5 | -5.0 | -7.5 | -10.0 | -10 | -12.5 | -15 | -4.2 |
  | 50 | -6.0 | -12.0 | -18.1 | -24.1 | -20 | -25 | -30 | -10 |
  | 25 | -12.0 | -24.1 | -36.1 | -48.2 | -30 | -37.5 | -45 | -20 |
  | 10 | -20 | -40 | -60 | -80 | -36 | -45 | -54 | -33 |
  | 1 | -40 | -80 | -120 | -160 | -39.6 | -49.5 | -59.4 | -66 |
  | 0 | silent | silent | silent | silent | -40 unless forced to 0 | -50 unless forced | -60 unless forced | silent |

- **The Unity and Godot "logarithmic" recipes are linear amplitude.** 20·log10(v) converted back to gain is just v. So they put only -6 dB at mid-travel, which is the classic "nothing happens until the bottom of the slider" complaint. The opposite naive choice, a slider mapped linearly to -80..0 dB, puts mid-travel at -40 dB and makes the lower half effectively silent.
- **Two defensible criteria:**
  - *Loudness-proportional* (sone scale): amplitude ∝ x^(1/0.6) ≈ x^1.66, so each halving of position is about -10 dB.
  - *Constant decibels per step* (dr-lex, Discord): an exponential curve over 40 to 60 dB.

  dr-lex's 60 dB argument is about a device's whole usable range. A game's category slider sits on top of the OS volume, which already sets the absolute level. The slider mainly balances categories and turns the game down, so the loudness criterion and a range of about 40 dB fit it better.
- **Recommendation for this game: gain = (level/100)^2.**
  - Exact 0 at level 0 and 1.0 at level 100, with no special cases.
  - -12 dB at 50, close to "half as loud"; -40 dB at 10.
  - The mix is quiet by design: the stamp peaks near -6 dBFS and the music sits at least 10 dB under it (see section 5). Under x^2 the music stays faintly audible down to about level 5 to 10. Under x^3, roughly the bottom 15 levels would be silent in practice (level 15 = -49 dB, which puts the music peak near -65 dBFS).
  - If the owner wants finer control at the top, x^3 (about 50 dB, near the audio-taper midpoint) is the alternative. A dB-linear map would need 0 forced to silence.
- **Store the integer level (0 to 100), never the gain.** Then the curve can change later without migrating saved data. Put the taper in one pure, unit-tested function, e.g. `levelToGain(level)`, used by both buses.
- **No boost above 100.** Unity gain protects the designed peak levels. Discord's +6 dB boost exists for voice chat of unknown level, not for a mastered game mix.

### Gaps
- I found no writing by Dan Stowell on volume-slider curves. A targeted search returned only his bioacoustics work, so the notes rely on dr-lex, Discord and the sone literature instead.
- I did not consult Boris Smus's "Web Audio API" book chapter on volume and loudness. I found no statement from the Web Audio spec editors (Adenot, Wilson, Choi) recommending a particular slider curve. The spec provides linear gain only.
- Audiokinetic's official pages on Wwise RTPC curve shapes and dB-vs-linear axis scaling returned HTTP 403. A search summary said Wwise advises linear Y-axis scaling when mapping a bus volume directly to a game slider, but I could not verify it.
- I did not verify FMOD Studio's own fader law in its UI.
- I found no controlled study comparing x^2, x^3 and dB-linear tapers for game sliders. The choice is a judgment call; a quick side-by-side listen by the owner would settle it.

## 2. One volume bus per category, click-free gain changes, and coexisting with the music player's fades

### Takeaway
Create two GainNodes once per AudioContext: `sfxBus` and `musicBus`, each connected to `destination`. Route every effect voice through `sfxBus`, and pass `musicBus` as the music player's destination; `startPlayer` already accepts one.
- Set each bus's starting gain directly when the context is created.
- After that, change bus gain only with `setTargetAtTime(target, ctx.currentTime, τ)`, with τ ≈ 0.015 to 0.03 s.
- Do not use the `.value` setter, which has applied changes instantly since Chrome 66, so a drag produces zipper noise.
- Do not use ramps that need cancelling; `cancelAndHoldAtTime` is still missing in Firefox.

Keeping the user level and the player's fades on separate nodes makes them multiply, so they never fight.

### Cited Findings
- **Current code:**
  - One AudioContext is made on first use and shared with the music. It is suspended while the tab is hidden and resumed on return.
  - Every effect voice (`tone`, `hiss`) has its own GainNode with `setValueAtTime(volume, t)` then `exponentialRampToValueAtTime(0.0001, t + length)`, connected straight to `ctx.destination`.
  - `withAudio` returns early when muted.

  — [src/ui/sound.ts](/Users/kemuru/repos/poh-papers-please/src/ui/sound.ts)
- **Current code:**
  - `startPlayer(ctx, destination, scene, day)` builds a `master` GainNode that fades from 0.0001 to 1 over 3 s with `exponentialRampToValueAtTime`.
  - `stop()` runs `cancelScheduledValues(t)`, then `setValueAtTime(Math.max(master.gain.value, 0.0001), t)`, then an exponential ramp to 0.0001 over 1.5 s, and disconnects after 1.8 s.
  - Scene changes use `setTargetAtTime(..., 1.5)` on an inner `level` node.
  - `begin()` calls `startPlayer(ctx, ctx.destination, …)` and books notes every 250 ms.
  - The hall murmur (`hallMurmur`) and hall echo are built inside `startPlayer`.

  — [src/ui/music.ts](/Users/kemuru/repos/poh-papers-please/src/ui/music.ts)
- Web Audio first shipped with "dezippering": setting `.value` applied an exponential smoother with a time constant of about 10 ms. The working group removed it from the spec, so the value now changes immediately. Chrome adopted this in version 66 and recommends `setTargetAtTime()` for any smoothing. — [Chrome 66 deprecations](https://developer.chrome.com/blog/chrome-66-deprecations); [WebAudio spec issue #48](https://github.com/WebAudio/web-audio-api/issues/48)
- "Setting `value` has the same effect as calling `AudioParam.setValueAtTime` with the time returned by the `AudioContext`'s `currentTime` property." Values are stored as float32, so reading one back may not equal what was set. — [MDN AudioParam.value](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/value)
- AudioParam methods "take precedence over the above property setting". "If you're sure [timing] doesn't [matter], setting it with the `value` property is fine." — [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- `setTargetAtTime` approaches the target exponentially. The value is 63.2 % of the way there after 1τ, 86.5 % after 2τ, 95.0 % after 3τ and 99.3 % after 5τ. "If 95 % is enough … set `timeConstant` to one third of the desired duration." It can target 0, and it has been Baseline widely available since July 2015. — [MDN setTargetAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/setTargetAtTime)
- A practitioner test of click removal recommends `gain.setTargetAtTime(0, ctx.currentTime, 0.015)`: 15 ms feels immediate and removes the click. `exponentialRampToValueAtTime` needs a `setValueAtTime` start value first, cannot reach 0 (use 0.0001) and needed about 30 ms. — [alemangui: "the ugly click and the human ear"](http://alemangui.github.io/ramp-to-value)
- `linearRampToValueAtTime`: "The change starts at the time specified for the *previous* event". A ramp therefore needs an anchoring `setValueAtTime(current, now)` before it. — [MDN linearRampToValueAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/linearRampToValueAtTime)
- `cancelAndHoldAtTime()` cancels future changes but holds the value at the given time. Chrome shipped it in M57. Mozilla bug 1308431 ("Implement cancelAndHoldAtTime") is still NEW with no target milestone; its last comment was in September 2024. Apps add Firefox fallbacks. — [MDN cancelAndHoldAtTime](https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/cancelAndHoldAtTime); [Bugzilla 1308431](https://bugzilla.mozilla.org/show_bug.cgi?id=1308431); [example fallback PR](https://github.com/frostburn/xenpaper3/pull/263)
- Paul Adenot, who wrote Firefox's Web Audio implementation, on node costs:
  - In Gecko "the gain is always applied lazily … so `GainNode` with a fixed gain are essentially free".
  - In other engines "the gain is applied to the input buffer as it's received".
  - "A `GainNode` is stateless and has therefore no associated memory cost."
  - Avoiding AudioParam automation when it is not needed is more efficient.

  — [Adenot: Web Audio performance notes](https://padenot.github.io/web-audio-perf/)
- **Howler.js:** a single `masterGain` connects to `ctx.destination`. `Howler.volume(vol)` stores `_volume` and applies it with `masterGain.gain.setValueAtTime(vol, ctx.currentTime)`, which is instant with no smoothing. — [howler.core.js](https://github.com/goldfire/howler.js/blob/master/src/howler.core.js)
- **Phaser's WebAudioSoundManager** chains two nodes: `masterVolumeNode` ("controlling global volume") and `masterMuteNode` ("controlling global muting"). — [Phaser docs](https://docs.phaser.io/api-documentation/class/sound-webaudiosoundmanager)
- **Tone.js** routes everything through `Destination`, a single master output that can "set the volume and mute the entire application". — [Tone.js Destination](https://tonejs.github.io/docs/14.7.77/Destination.html)
- **Godot** uses named buses, each with its own volume and a separate mute. **FMOD** uses VCAs over buses. — [Godot AudioServer](https://docs.godotengine.org/en/stable/classes/class_audioserver.html); [FMOD VCA](https://fmod.com/docs/2.03/api/studio-api-vca.html)

### Inferences
- **Graph for this game:**
  - effect voices → `sfxBus` → destination
  - player (master fade → level → …) → `musicBus` → destination

  The change is small: `tone`/`hiss` connect to `sfxBus` instead of `ctx.destination`, and `begin()` passes `musicBus` to `startPlayer`. Two fixed-gain buses cost essentially nothing (Adenot).
- **Creation:** in `audioContext()`, create both buses and set `bus.gain.value = effectiveGain(category)` before any voice connects. Ramping from the default 1.0 would make the first sound after a reload briefly too loud.
- **Changes:** `bus.gain.setTargetAtTime(effectiveGain, ctx.currentTime, 0.02)` on every slider `input` event.
  - A new setTarget event starts from the param's current value at its start time, so successive calls chain smoothly. No `cancelScheduledValues` or `cancelAndHoldAtTime` is needed as long as nothing future is scheduled on the bus.
  - Never schedule a future "snap", such as `setValueAtTime(0, now + 0.2)` to reach exact zero. A drag back up inside that window would be overridden by the snap.
  - With τ = 20 ms the bus reaches 95 % in 60 ms and is at -87 dB relative after 10τ (0.2 s), which is inaudible.
  - A slightly longer τ, about 40 to 60 ms, softens unmuting or raising from 0.
- **Why not ramps:**
  - `linearRampToValueAtTime` needs anchoring and, mid-drag, a cancel that jumps without `cancelAndHoldAtTime`.
  - `exponentialRampToValueAtTime` cannot reach 0.
  - The `.value` setter steps, and each of the dozens of input events per second during a drag becomes a discontinuity (zipper noise).
  - Howler's instant `setValueAtTime` shows that even popular libraries leave smoothing to the app.
- **Fades vs level:** heard music = master fade(t) × musicBus level.
  - A drag during the player's 3 s fade-in or 1.5 s fade-out never touches the player's automation.
  - The player's existing "cancel, then hold with `setValueAtTime(current)`, then ramp" in `stop()` is the standard Firefox-safe replacement for `cancelAndHoldAtTime`, and it stays valid.
  - Putting the user level on `master` instead would force cancelling the fade mid-ramp. Phaser's separate volume and mute nodes follow the same principle.
- **Decision for the owner:** the hall murmur (crowd ambience) and hall echo live inside the music player, so the music slider will also silence the crowd. XAG 105 treats background/ambient effects as distinct from music (section 5). Either accept it and label the slider "Music and hall", or move the murmur to the effects side.

### Gaps
- I did not read the spec text on whether `cancelScheduledValues(t)` also cancels an *active* setTarget event that started before `t`, or how engines differ. The advice above avoids the question by never cancelling on the buses.
- I did not check Safari/WebKit support for `cancelAndHoldAtTime`.
- I did not verify how stale the `.value` getter is during automation (it updates per render quantum), which matters for the player's hold-then-ramp step. Earlier e2e and listening found no audible effect.

## 3. Mute vs zero, stopping the music player at 0, and the autoplay policy when the first touch is a slider

### Takeaway
Keep a mute boolean separate from each level, with effective gain = muted ? 0 : taper(level). Mute must remember the level, and setting a level must not silently change the mute state. The UI may deliberately unmute when the player drags a muted slider, but that should be an explicit UI choice.

When a category is silent (level 0 or muted), stop doing work:
- Effects: create no voices.
- Music: stop the generative player through the same path mute uses today, deciding on release rather than mid-drag, and restart it when the level goes back above 0.

For autoplay, AudioContext is gated by *sticky* activation. On touch screens activation arrives only at `pointerup`/`touchend`, so resume the context from the slider's `pointerdown`, `pointerup`, `keydown` and `change` handlers. The game's existing wait-for-a-gesture listener needs `pointerup` (or `click`) as well.

### Cited Findings
- **Howler:** `volume()` stores `_volume` and skips applying it while muted (`if (self._muted) { return self; }`). `mute(muted)` applies `setValueAtTime(muted ? 0 : self._volume, …)`, which restores the remembered level. — [howler.core.js](https://github.com/goldfire/howler.js/blob/master/src/howler.core.js)
- **Godot:** `set_bus_mute`/`is_bus_mute` are separate from the bus volume methods. — [Godot AudioServer](https://docs.godotengine.org/en/stable/classes/class_audioserver.html)
- **Phaser:** mute and volume are separate gain nodes. — [Phaser docs](https://docs.phaser.io/api-documentation/class/sound-webaudiosoundmanager)
- **Tone.js issue #221:** "When muting a volume node and afterwards setting the volume, mute is ignored". It was reported as a bug; the reporter proposed storing the volume and applying it only when unmuted. — [Tone.js #221](https://github.com/Tonejs/Tone.js/issues/221)
- MDN recommends `<input type="range">` for volume and a checkbox for mute. It also recommends clear labels and `role="switch"` on audio toggle buttons. — [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **Current music code:**
  - `setMusicMuted(true)` calls `silence()`, which clears the 250 ms booking interval and runs `player.stop()` (the 1.5 s fade).
  - `begin()` does nothing while muted.
  - `begin()` checks `navigator.userActivation?.hasBeenActive === false` and otherwise waits for `pointerdown`/`keydown` in the capture phase.

  — [src/ui/music.ts](/Users/kemuru/repos/poh-papers-please/src/ui/music.ts)
- `AudioContext.suspend()` halts the context's audio hardware access and reduces CPU and battery use. The game already suspends when the tab is hidden. — [MDN AudioContext.suspend](https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/suspend); [src/ui/sound.ts](/Users/kemuru/repos/poh-papers-please/src/ui/sound.ts)
- **Spec:** a user agent "may disallow this initial transition [suspended → running], and to allow it only when the AudioContext's relevant global object has sticky activation". — [W3C Web Audio API spec](https://webaudio.github.io/web-audio-api/)
- **MDN, user activation:** the activation-triggering events are:
  - `keydown`, except Esc and browser shortcuts;
  - `mousedown`;
  - `pointerdown`, **only if pointerType is "mouse"**;
  - `pointerup`, **if pointerType is not "mouse"**;
  - `touchend`.

  "Autoplay of Media and Web Audio APIs (in particular for AudioContexts)" is listed as gated by **sticky** activation. — [MDN User activation](https://developer.mozilla.org/en-US/docs/Web/Security/User_activation)
- **Chrome:** "If an AudioContext is created before the document receives a user gesture, it will be created in the 'suspended' state, and you will need to call resume() after the user gesture." Sound is allowed once "the user has interacted with the domain". — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- MDN recommends creating or resuming the context "from inside a user gesture". — [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- **Library unlock patterns:** Howler listens for `touchstart`, `touchend`, `click` and `keydown` (capture) and calls `ctx.resume()`. Phaser's `unlock()` "unlocks Web Audio API on the initial input event". — [howler.core.js](https://github.com/goldfire/howler.js/blob/master/src/howler.core.js); [Phaser docs](https://docs.phaser.io/api-documentation/class/sound-webaudiosoundmanager)
- **iOS Safari:** practitioners report that Safari puts a page holding an AudioContext into the "ambient" audio session, which obeys the hardware silent switch, so Web Audio is muted whatever the in-game sliders say. Setting `navigator.audioSession.type = 'playback'` before creating the context (Safari 16.4+) plays through the switch. Only Safari implements the Audio Session API (an Editor's Draft). (These are practitioner reports, not the spec.) — [nattog.dev](https://nattog.dev/blog/web-audio-ios-unmute); [example PR](https://github.com/itechify/clowder/pull/83)

### Inferences
- **State model per category:** `{ level: 0..100, muted: boolean }`.
  - `setLevel` never changes `muted`, and `setMuted` never changes `level`. This avoids the Tone.js #221 class of bug.
  - UI rule: a deliberate drag or keypress on a muted category's slider unmutes it, because the player's intent is to hear it. Pressing the mute toggle flips only `muted`.
  - While muted, the slider keeps showing the remembered level, dimmed.
- **Level 0 vs mute:** both mean silence, but keep them distinct. Mute is reversible to the remembered level; 0 is a level.
  - To avoid a dead click (AGENTS.md: "No dead clicks"), unmuting a category whose level is 0 should restore a default level, e.g. 100 or the last non-zero level.
- **Stopping at 0:**
  - A zero-gain bus does not stop upstream work: oscillators, filters, the convolver echo and the 250 ms JavaScript booking timer keep running.
  - So when music's effective gain is 0, call the existing `silence()`, and call `begin()` again when it becomes positive; the player's 3 s fade-in plus the bus ramp makes the return smooth.
  - To avoid stop/start churn when a drag passes through 0, stop only on release at 0 (the native `change` event) or after about 1 s at 0.
  - For effects, `withAudio` should return early when the effective gain is 0, as it already does when muted.
- **Autoplay with a slider as the first interaction:**
  1. **Mouse:** `pointerdown`/`mousedown` on the thumb activates, so `input` events during the drag come after activation.
  2. **Touch or pen:** activation comes only at `pointerup`/`touchend`, which is the end of the drag.
  3. **Keyboard:** `keydown` activates.

  So call `audioContext()` (create or resume) from the slider's `pointerdown`, `pointerup`, `keydown` and `change` handlers. Save the level to storage whether or not the context exists, and apply it to the buses whenever the context is created (see section 2).
- **A likely existing bug:** `waitForGesture()` listens only for `pointerdown` and `keydown`.
  - On a phone, the first tap's `pointerdown` (touch) comes *before* activation, so `hasBeenActive` is still false and the listener re-arms.
  - Music then starts only on the second tap.
  - Adding `pointerup` (or `click`/`touchend`, as Howler does) fixes it. Test it with a touch-emulating Playwright project.
- **iOS silent switch:** respecting the switch (the default "ambient" session) is the polite choice for a desk game. The owner should know that, with the switch on, the sliders "do nothing" on iPhone; opting into `'playback'` is a deliberate trade-off.

### Gaps
- I found no authoritative source on whether engines skip processing upstream of a zero-gain node. Adenot's notes cover only the cost of fixed-gain nodes.
- I did not verify whether WebKit counts `input` events fired during a range-slider drag as a user gesture, or whether current Safari needs transient rather than sticky activation for `resume()`.
- I found no game-UX source on whether dragging a muted slider should unmute. The rule above is an inference, backed only by the Tone.js #221 discussion of the API side.

## 4. Feedback while adjusting: sample sounds, live music, and what players expect

### Takeaway
- **Music:** keep playing and let `musicBus` follow the drag live; that is the feedback.
- **Effects:** play one short, representative effect through `sfxBus` at the new level when the slider is released or stepped by keyboard. Throttle it, play it after the bus has settled, and skip it at 0 or while muted.
- **Display:** show the number 0 to 100 next to each slider, updated on every `input` event.

The OS precedent is macOS's "Play feedback when volume is changed". In React, `onChange` on a range input fires on every `input` event, not on release.

### Cited Findings
- macOS has a "Play feedback when volume is changed" setting that plays a sound when you change the volume "so you can hear the new volume"; holding Shift reverses the setting for one press. — [Apple Mac User Guide (sound settings)](https://support.apple.com/guide/mac-help/change-the-alert-sounds-mchlp2207/mac)
- One open-source game's settings update the audio buses live while dragging, show a percentage, save on release and play a sample effect when the effects slider is released. (This is one example, not a standard.) — [solitairetower PR #130](https://github.com/mjramos86/solitairetower/pull/130)
- Xbox Accessibility Guideline 105 shows Grounded's audio menu with six separate sliders: master, effects, music, UI, dialogue and voice chat. — [XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105)
- MDN recommends a range input for volume, a checkbox for mute, "clear labels", and `role="switch"` for audio toggles. — [MDN Web Audio best practices](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Best_practices)
- React's `onChange` on an `<input>` "fires immediately when the input's value is changed by the user", which is the browser's `input` event, not the native `change` event. — [React: `<input>`](https://react.dev/reference/react-dom/components/input)
- The project rule: "Every player action gets immediate feedback. No dead clicks." — [AGENTS.md](/Users/kemuru/repos/poh-papers-please/AGENTS.md)

### Inferences
- **Effects preview:**
  - Trigger it on pointer release (`onPointerUp`, or a native `change` listener attached by ref, since React's `onChange` is the `input` event) and on keyboard steps.
  - Throttle it to at most one preview per ~200 ms, so a held arrow key or a quick track click does not rattle.
  - Schedule it at `currentTime + ~0.06 s` (≥3τ at τ = 20 ms) so its attack does not ride the bus ramp after a click-to-jump.
  - Use the loudest everyday effect, the stamp thunk (which peaks near -6 dBFS), so players set the level by the loudest sound they will hear. A gentler option is the chime.
  - Never play a preview during continuous dragging.
- **Music:** no preview. If music is stopped because it was at 0 or muted, raising the slider calls `begin()`, and the feedback is the music fading in.
  - The player's 3 s fade-in may feel slow as feedback. A shorter fade when started from the settings control would change the player's API; per AGENTS.md, ask the owner first.
  - If no scene wants music at that moment, the slider change is silent. The visible number and state must carry the feedback.
- **Mute toggles:** unmuting effects plays the preview. Unmuting music restarts the music. Both toggles change their visual state immediately.
- **Accessibility:** give each slider a label ("Sound effects volume", "Music volume") and an `aria-valuetext` such as "40 percent" or "muted".

### Gaps
- I found no authoritative game-UX research on preview timing (on release vs throttled during the drag), and no survey of what players expect. The evidence is OS precedent and small open-source examples.

## 5. Defaults, ranges and steps, hearing safety and loudness, persistence and migration from the boolean flags

### Takeaway
- **Defaults:** both sliders at 100 (unity), which reproduces today's sound exactly. The music-under-effects balance already lives in the mix. Sources show no consensus on default slider positions.
- **Range and steps:** 0 to 100 in steps of 1, with no boost. Under x^2, 5 to 10-level jumps give about 1 to 4 dB, which matches dr-lex's "2 dB ideal" step.
- **Hearing safety:** in a browser this means no boost above unity, smoothed rises, and controlled peaks. Calibrated sound dosimetry of the ITU-T H.872 kind is not feasible.
- **Migration:** keep `poh-muted` and `poh-music-muted` as the mute toggles with their current meaning, and add new level keys. Nobody hears a change on upgrade, and returning muted players stay muted.

### Cited Findings
- **Forum practice (RPG Maker):** one experienced poster keeps "sound effects 9 - 12db above music for most situations" and personally uses "40 bgm, 100 sfx". Another prefers "30% se, 60% me, 90% bgm" because sound effects felt "jarringly loud compared to bgm default". There are no universal defaults. — [RPG Maker Forums](https://forums.rpgmakerweb.com/threads/music-and-sound-volume.183414/)
- XAG 105: "Games should provide a method for players to adjust the volume of the audio, or mute different types of audio, independently from each other". It lists music, voice-over, active sound effects, background/ambient sound effects, narration and voice chat. — [XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105)
- The Game Accessibility Guidelines include "Provide separate volume controls or mutes for effects, speech and background / music". — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/provide-separate-volume-controls-or-mutes-for-effects-speech-and-background-music/)
- dr-lex on stepped volume: at least 1 dB per step (smaller is imperceptible), at most 3 dB (coarser is too coarse); "2 dB is pretty much ideal". — [dr-lex](https://www.dr-lex.be/info-stuff/volumecontrols.html)
- WAI-ARIA sliders: arrow keys change the value by one step, Home and End go to min and max, and Page Up and Page Down optionally change it by a larger step. — [WAI-ARIA APG slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- ITU-T H.872 "Safe listening for video gameplay and esports" (10/2024) is a joint WHO/ITU standard that sets requirements for "video gameplay devices and/or video gameplay software titles". According to summaries it covers:
  - sound-dose tracking (dosimetry) against a reference of 80 dBA for 40 h/week for adults, with a selectable 75 dBA for children;
  - selectable safe-listening modes;
  - warnings when the allowance is exceeded.

  — [ITU-T H.872](https://www.itu.int/rec/T-REC-H.872-202410-I/en); [WHO](https://www.who.int/publications/i/item/9789240108028); [AIHA news](https://www.aiha.org/news/250313-new-standard-sets-sound-level-guidelines-for-video-game-consoles); [HearingTracker](https://www.hearingtracker.com/news/who-itu-launch-new-global-standard-to-prevent-hearing-loss-for-video-gamers-and-esports)
- **Game loudness targets:** Sony's Audio Standards Working Group document ASWG-R001 recommends -24 LKFS for home console games and -18 LKFS for portable ones. Other platform holders reportedly aligned with it. (From a summary; the PDF was not read.) — [ASWG-R001](http://gameaudiopodcast.com/ASWG-R001.pdf); [Wikipedia: Audio normalization](https://en.wikipedia.org/wiki/Audio_normalization)
- **The game's own mix, as pinned by e2e:** "The stamp's thud peaks near -6 dBFS; the music stays at least 10 dB under it". The test asserts a music peak below -16 dBFS. — [e2e/music.spec.ts](/Users/kemuru/repos/poh-papers-please/e2e/music.spec.ts)
- **Current storage:**
  - Keys `poh-muted` and `poh-music-muted` hold `'1'`/`'0'`.
  - `readFlag` returns false if storage throws.
  - `saveFlag` swallows errors ("Private mode: the setting lasts until the page closes").

  — [src/ui/sound.ts](/Users/kemuru/repos/poh-papers-please/src/ui/sound.ts); [src/ui/music.ts](/Users/kemuru/repos/poh-papers-please/src/ui/music.ts)

### Inferences
- **Defaults: effects 100, music 100** (unity on both buses). A player who never opens the controls hears exactly what the designer mixed, and the music stays at least 10 dB under the stamp.
  - Pulling music down by default through the slider would double-count a balance the mix already has. The forum evidence shows players disagree in both directions anyway.
  - If the owner wants room to turn a category *up*, default both to 80: under x^2 that is -3.9 dB each, with the balance kept.
- **Range and granularity:**
  - Store an integer from 0 to 100 and use native `<input type="range" min=0 max=100 step=1>`.
  - Under x^2, one step is ≤0.35 dB above level 50 and about 1.8 dB at level 10.
  - A 5-level jump is 0.9 dB (100→95) to 1.8 dB (50→45).
  - A 10-level jump is 1.8 dB (100→90) to 3.9 dB (50→40).
  - So ± buttons or a larger keyboard step of 5 or 10 lands near dr-lex's 1 to 3 dB band.
- **Hearing safety for a browser game:**
  - Cap at unity; no boost.
  - Ramp rather than jump when unmuting or raising from 0 (τ 40 to 60 ms).
  - Initialize the buses at stored levels, never at 1.0.
  - Keep the per-voice peak discipline the e2e test already pins.
  - H.872-style dose tracking needs calibrated sound pressure, which a web page cannot know.
- **Loudness:** play on laptops and phones is closer to ASWG's portable case (-18 LKFS) than the console one. The game's integrated loudness has not been measured (see Gaps).
- **Persistence (no-surprise migration):**
  - Add `poh-sfx-volume` and `poh-music-volume` holding `'0'`–`'100'`.
  - Keep `poh-muted` and `poh-music-muted` as the mute toggles with *unchanged meaning*.
  - A returning player who had muted music stays muted, and the slider shows the default level, so unmuting brings normal music. Unmuted players hear no difference.
  - Parse strictly: `Number()`, `Number.isFinite`, round, clamp 0 to 100, and fall back to the default otherwise.
  - Write on release and keyboard steps, not on every `input` event, inside the same try/catch as `saveFlag`.
  - Optionally listen to the `storage` event to sync open tabs.
- **If the owner drops the mute toggles:** migrate `'1'` to level 0, remember a "last non-zero level" equal to the default so raising or unmuting restores normal sound, and treat `'0'` or absent as the default level. Write the new keys once, and ignore the old ones afterwards.

### Gaps
- I found no systematic survey of default music and effects levels in commercial games. The only data points are forum anecdotes, which conflict.
- I could read H.872's requirements only through summaries. The standard itself is a PDF that was not read, so its software-specific clauses (as opposed to device clauses) are unverified.
- The game's integrated loudness (LUFS or LKFS, per ITU-R BS.1770) has not been measured. The e2e test pins only peaks and per-second energy.
- I did not verify cross-engine behaviour for Page Up/Page Down on native range inputs.
- The citations to MDN GainNode, MDN `AudioContext.suspend`, React `<input>` and the WAI-ARIA slider pattern come from well-known documentation that I did not re-fetch in this pass.

## 6. Testing: unit-testing the mapping and routing, and observing volume in end-to-end tests without audio hardware

### Takeaway
- **Unit tests (Vitest runs in Node, with no Web Audio):** keep the taper, the saved-settings parser and migration, and the mute/level state logic as pure functions and test them there.
- **Real-audio tests:** use the pattern the project already has. Import the module into the page from the Vite dev server, render through an `OfflineAudioContext`, and measure peaks. A level of 50 under x^2 must render exactly -12.04 dB below level 100, and level 0 must render all-zero samples.
- **Routing and state in the live game:** use `addInitScript` prototype patching (already used for `createConvolver`) or a read-only `window.__audio` snapshot on the model of `window.__game`, driven by keyboard input on the sliders.

No new dependency is needed.

### Cited Findings
- **Vitest config:** it includes only `src/**/*.test.ts(x)` and sets no browser environment. — [vite.config.ts](/Users/kemuru/repos/poh-papers-please/vite.config.ts)
- **Existing unit tests:** they cover the pure music functions (notes, pulse), not audio rendering. — [src/ui/music.test.ts](/Users/kemuru/repos/poh-papers-please/src/ui/music.test.ts)
- **Existing e2e, test 1:**
  - It imports `/src/ui/music.ts` inside the page, builds `new OfflineAudioContext(2, 44100*60, 44100)` and runs `startPlayer(ctx, ctx.destination, 'open', 1)`.
  - It drives the note-booking loop deterministically with `ctx.suspend(t).then(() => { player.book(1.5); ctx.resume(); })`.
  - It asserts peak < -16 dBFS and the quietest second > -50 dB.

  — [e2e/music.spec.ts](/Users/kemuru/repos/poh-papers-please/e2e/music.spec.ts)
- **Existing e2e, test 2:** it patches `BaseAudioContext.prototype.createConvolver` via `page.addInitScript` to count music bands. — [e2e/music.spec.ts](/Users/kemuru/repos/poh-papers-please/e2e/music.spec.ts)
- Dev and test builds expose a frozen, read-only `window.__game` snapshot. — [src/ui/gameState.ts](/Users/kemuru/repos/poh-papers-please/src/ui/gameState.ts)
- An OfflineAudioContext "doesn't really render the audio but rather generates it, as fast as it can, in a buffer". — [MDN OfflineAudioContext](https://developer.mozilla.org/en-US/docs/Web/API/OfflineAudioContext)
- `standardized-audio-context-mock` mocks Web Audio classes for tests (Vitest via `vi.fn()` or Jest) "without actually rendering any audio". jsdom does not implement Web Audio. — [standardized-audio-context-mock](https://github.com/chrisguttandin/standardized-audio-context-mock); [npm](https://www.npmjs.com/package/standardized-audio-context-mock)
- `node-web-audio-api` (IRCAM) is a Node.js binding to a Rust implementation of the W3C Web Audio API, including OfflineAudioContext. — [ircam-ismm/node-web-audio-api](https://github.com/ircam-ismm/node-web-audio-api)
- **The Chrome team's Web Audio Playwright suite:**
  - It uses `ignoreDefaultArgs: ['--mute-audio']` and `args: ['--autoplay-policy=no-user-gesture-required']`, described as "necessary for Web Audio Tests".
  - It renders with a real-time `AudioContext`.
  - It captures output with an AudioWorklet "Recorder".
  - It asserts with `compareBufferData(actual, expected, threshold)` and `beCloseTo(actual, expected, threshold)` (default relative threshold 0.01).

  — [GoogleChromeLabs web-audio-samples: Playwright README](https://github.com/GoogleChromeLabs/web-audio-samples/blob/main/src/tests/playwright/README.md)
- `--autoplay-policy=no-user-gesture-required` "simulat[es] strong user engagement" for testing. — [Chrome autoplay policy](https://developer.chrome.com/blog/autoplay)
- There is an open Playwright feature request for an option to disable AudioContext autoplay restrictions. — [microsoft/playwright #33590](https://github.com/microsoft/playwright/issues/33590)

### Inferences
- **Unit tests (Node, no audio):**
  - `levelToGain(0) === 0` exactly and `levelToGain(100) === 1`.
  - The taper is strictly increasing.
  - Spot values: under x^2, `20*log10(levelToGain(50)) ≈ -12.04` and level 10 ≈ -40.
  - Settings parsing: garbage, out-of-range and missing values fall back to the defaults.
  - A migration table covering every combination of `poh-muted`/`poh-music-muted` ∈ {absent, '0', '1'} × new keys ∈ {absent, valid, invalid}.
  - Mute semantics: `setLevel` while muted stays muted; unmuting restores the level; unmuting at level 0 restores the default.
- **E2E offline render (Chromium, deterministic):**
  - Extend the existing in-page OfflineAudioContext test. Render the same 10 s of `startPlayer` into `destination` directly, then through a GainNode set to `levelToGain(50)`, and assert the peak difference is -12.04 dB ± 0.1.
  - Render at level 0 and assert every sample is 0.
  - Do the same for one effect, e.g. render `thunk` through an effects bus; this needs `sound.ts` to accept a context and destination for rendering, as `startPlayer` already does.
  - This tests the real mapping and bus arithmetic with no audio hardware.
- **E2E live routing and state:**
  - Use `page.addInitScript` to wrap `AudioNode.prototype.connect` and `AudioParam.prototype.setTargetAtTime`. Record which node every effect voice connects to (it must be the effects bus, never `destination`) and each bus's latest target.
  - Or expose a dev/test-only read-only `window.__audio` snapshot: levels, muted flags, bus targets, whether the player is running.
  - Drive the sliders by focus plus ArrowLeft/ArrowRight/Home/End, which is more deterministic than mouse drags.
  - Assert the snapshot, `localStorage` after release, persistence across `page.reload()`, the player stopping at 0 on release and restarting above 0, and exactly one preview voice created on release.
  - Seed the old keys with `addInitScript(() => localStorage.setItem('poh-music-muted','1'))` to test migration.
- **Real-time level checks:** an AnalyserNode tapped off a bus gives RMS through `getFloatTimeDomainData`. Playwright's clicks are trusted input, so the game's own "Open the window" click satisfies activation. Real-time readings are noisy, though, so use offline rendering for numbers and live checks for routing and state.
- **No new dependency:** the in-page OfflineAudioContext approach covers real rendering. `standardized-audio-context-mock` or `node-web-audio-api` would each need a one-line justification under AGENTS.md, and neither is necessary.
- **Touch activation:** the Playwright config has one Desktop Chrome project, so the touch-activation issue from section 3 is untested. A mobile-emulation project with `hasTouch` would exercise `pointerup`-based activation. Playwright's WebKit is not iOS Safari, so real-device checks are still needed for the silent switch.

### Gaps
- The Chrome team calls ignoring Playwright's default `--mute-audio` "necessary" but does not say whether `--mute-audio` affects AnalyserNode or AudioWorklet readings in a real-time context. I did not verify it.
- I did not verify how closely Playwright's touch emulation matches real iOS/Android user activation. Firefox and WebKit autoplay settings for Playwright projects (e.g. Firefox's autoplay prefs) were not researched.
