# Volume-control interface patterns for music and effects (0 to 100) on a pixel-art desk rail

Research date: 2026-09-30. Game data come from PCGamingWiki's "Audio" tables, pulled through its API for 49 games, and from settings screenshots hosted on PCGamingWiki, which I inspected by eye. The game list was picked by hand (the brief's list, plus desk-job, Papers, Please-like and diegetic-UI games). It is not a random sample, so the counts below are indicative only.

## 1. How acclaimed indie, pixel-art, desk-job and browser games expose music and effects volume

### Takeaway
In every surveyed game whose settings screen I could inspect, volume levels live in a settings or pause screen. None puts a level control on the HUD. The genre's own reference, Papers, Please, gives "Music" and "Sound" each a pixel bar with separate "−" and "+" buttons, and has no master. Control styles split three ways: free sliders, often 0 to 100 with a number shown; coarse steppers (Celeste's "< 10 >", Keep Talking's "− 20% +"); and word presets (Obra Dinn, Mini Metro). Players complain openly when a game offers one control or none (Undertale, Deltarune).

### Cited Findings

**Settings screens inspected (PCGamingWiki screenshots)**
- **Papers, Please**: the settings screen, in the game's pixel font, has "Music" and "Sound" rows. Each is a white horizontal bar followed by two separate dotted-border buttons, "−" and "+". Other settings on the same screen are diamond toggles (Fullscreen, Nudity, Easy Mode), and "Date Format" is a −/+ stepper. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Papers_Please_-_settings.png); PCGamingWiki lists separate volume controls as "Music, Sound" — [PCGamingWiki: Papers, Please](https://www.pcgamingwiki.com/wiki/Papers,_Please)
- **Return of the Obra Dinn** (also by Lucas Pope): the pause menu has one "Audio Volume" row whose value is a word ("Maximum"), in a two-column text list next to Monitor, Output, Controls and Look Sensitivity. There are no separate volume controls, but the game mutes when the window loses focus. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Return_of_the_Obra_Dinn_-_options.png); [PCGamingWiki: Return of the Obra Dinn](https://www.pcgamingwiki.com/wiki/Return_of_the_Obra_Dinn)
- **Keep Talking and Nobody Explodes**: "Music Volume" and "Sound Effect Volume" appear on what looks like a lined paper page. Each is a black "−" button, a handwritten-style percentage ("20%", "50%") and a "+" button, so a stepper with a percent readout and no slider. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:KeepTalkingAudio.png); [PCGamingWiki: KTANE](https://www.pcgamingwiki.com/wiki/Keep_Talking_and_Nobody_Explodes)
- **Hypnospace Outlaw**: the audio settings are drawn in the style of the game's fictional operating system. PCGamingWiki notes that the advanced settings are "listed in-game as BIOS settings". "Music Volume" and "Sound Volume" sliders have a rising wedge-shaped track (a loudness ramp) and a red number above the thumb ("60", "85"). Next to them sit "Key SFX" and "Mouse SFX" checkboxes, a "Sound FX Theme" dropdown and "Autoplay page music". — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Hypnospace_Outlaw_Audio_Settings.png); [PCGamingWiki: Hypnospace Outlaw](https://www.pcgamingwiki.com/wiki/Hypnospace_Outlaw)
- **Celeste**: "Music" and "Sounds" are arrow selectors showing "< 10 >" in a controller-style list, which implies a coarse 0 to 10 scale. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Celeste_general_settings.png); [PCGamingWiki: Celeste](https://www.pcgamingwiki.com/wiki/Celeste)
- **Balatro**: Audio tab with "Master Volume", "Music Volume" and "Game Volume" (Balatro's word for effects). Each is a thick red bar with a numeric badge; the screenshot shows 50, 100 and 100. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Balatro_Audio_Settings.png); [PCGamingWiki: Balatro](https://www.pcgamingwiki.com/wiki/Balatro)
- **Signalis**: thin line sliders with a diamond thumb and a percent readout for Master, Music, SFX and Radio Volume (80% each in the screenshot). PCGamingWiki's notes list only "Music, SFX, Radio", while the screenshot also shows Master. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Signalis_Audio_Settings.png); [PCGamingWiki: Signalis](https://www.pcgamingwiki.com/wiki/Signalis)
- **Vampire Survivors**: "Sounds" and "Music" sliders with oversized square pixel thumbs and no number, plus a two-button choice for "Classic Sound Effects" ("Classic" or "Blast Processed"). — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Vampire_Survivors_Sound_Options.png)
- **Unpacking**: "Master Vol", "Music" and "Sound FX" as pixel-art sliders with a patterned track, a tall rectangular thumb and no numbers. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Unpacking_-_audio_settings.png); [PCGamingWiki: Unpacking](https://www.pcgamingwiki.com/wiki/Unpacking)
- **Hades**: thin sliders for Master, Music, SFX and Voice Volume with no numbers, plus a "Reset" button. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Hades_audio_settings.png); [PCGamingWiki: Hades](https://www.pcgamingwiki.com/wiki/Hades)
- **Loop Hero**: three short, unlabelled sliders marked only by small pixel icons, sitting in the pause-menu column between "Select save slot" and "Options menu". PCGamingWiki lists the channels as Master, Effects and Music. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Loop-hero-settings.png); [PCGamingWiki: Loop Hero](https://www.pcgamingwiki.com/wiki/Loop_Hero)
- **Disco Elysium**: five sliders with bracket-shaped ends and ring thumbs, for Environment, Voiceover, Music, UI and Weather. There is no master. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Disco_Elysium_-_in-game_audio_settings.png); [PCGamingWiki: Disco Elysium](https://www.pcgamingwiki.com/wiki/Disco_Elysium)
- **Hacknet**: "Sound Enabled" is a checkbox, and "Music Volume" is the only slider. So effects get an on/off toggle and music gets a level. — [PCGamingWiki screenshot](https://www.pcgamingwiki.com/wiki/File:Hacknet_-_in-game_general_settings.png); PCGamingWiki: "Sound (togglable only), Music" — [PCGamingWiki: Hacknet](https://www.pcgamingwiki.com/wiki/Hacknet)
- **Stardew Valley**: four sliders in the Options menu with these defaults: Music Volume 75%, Sound Volume 100%, Ambient Volume 75%, Footstep Volume 90%. "Dialogue Typing Sound" is a toggle whose loudness follows "Sound Volume". — [Stardew Valley Wiki: Options](https://stardewvalleywiki.com/Options)
- **Deltarune**: master volume only, settable "into any integer percentage between 0% and 100%", default 60%. — [Deltarune Wiki: Config](https://deltarune.fandom.com/wiki/Config); PCGamingWiki: "Master only" — [PCGamingWiki: Deltarune](https://www.pcgamingwiki.com/wiki/Deltarune)
- **Undertale**: no volume setting at all. — [PCGamingWiki: Undertale](https://www.pcgamingwiki.com/wiki/Undertale)
- **Mini Metro**: presets instead of levels. Audio can be "Silent", "Minimal" or "Full", and volume "Quiet", "Medium" or "Loud". — [PCGamingWiki: Mini Metro](https://www.pcgamingwiki.com/wiki/Mini_Metro)

**Channel sets across the 49 PCGamingWiki pages checked**
- **Two channels, no master**: Papers, Please (Music, Sound), Celeste (Music, Sounds), Hypnospace Outlaw (Music, Sound), Keep Talking (Music, Sound Effect), Night in the Woods, Orwell, Beholder and Not Tonight (music plus effects in each), Shovel Knight: Treasure Trove (BGM, SFX) and Hacknet (Sound toggle, Music). — [Papers, Please](https://www.pcgamingwiki.com/wiki/Papers,_Please); [Night in the Woods](https://www.pcgamingwiki.com/wiki/Night_in_the_Woods); [Orwell](https://www.pcgamingwiki.com/wiki/Orwell:_Keeping_an_Eye_on_You); [Beholder](https://www.pcgamingwiki.com/wiki/Beholder); [Not Tonight](https://www.pcgamingwiki.com/wiki/Not_Tonight); [Shovel Knight: Treasure Trove](https://www.pcgamingwiki.com/wiki/Shovel_Knight:_Treasure_Trove)
- **Master plus music plus effects**: Balatro, Unpacking, Loop Hero, Slay the Spire, Brotato, Hollow Knight, Cuphead, Katana Zero and Spiritfarer. — [Slay the Spire](https://www.pcgamingwiki.com/wiki/Slay_the_Spire); [Brotato](https://www.pcgamingwiki.com/wiki/Brotato); [Hollow Knight](https://www.pcgamingwiki.com/wiki/Hollow_Knight); [Cuphead](https://www.pcgamingwiki.com/wiki/Cuphead); [Katana Zero](https://www.pcgamingwiki.com/wiki/Katana_Zero); [Spiritfarer](https://www.pcgamingwiki.com/wiki/Spiritfarer)
- **More channels, with or without master**: Terraria (Sound, Music, Ambient; no master); Dead Cells (Main, Music, SFX, Ambient); A Short Hike (Master, Music, SFX, Ambience); Cult of the Lamb (Master, Music, SFX, Voice Over); Dredge (Master, Music, SFX, UI, Character voices); Hades II ("Main, Music, Ambience, SFX and Speech volume sliders"). — [Terraria](https://www.pcgamingwiki.com/wiki/Terraria); [Dead Cells](https://www.pcgamingwiki.com/wiki/Dead_Cells); [A Short Hike](https://www.pcgamingwiki.com/wiki/A_Short_Hike); [Cult of the Lamb](https://www.pcgamingwiki.com/wiki/Cult_of_the_Lamb); [Dredge](https://www.pcgamingwiki.com/wiki/Dredge); [Hades II](https://www.pcgamingwiki.com/wiki/Hades_II)
- **A separate channel for an in-world music source (radio)**: Pacific Drive has "Master, Sound Effects, Music, Dialogue, Radio Music, and Radio Dialogue". Contraband Police, a border-checkpoint desk game, has "sliders for Master, Effects, Voice, Environment, Music, Radio and Police siren". Signalis has Radio. — [Pacific Drive](https://www.pcgamingwiki.com/wiki/Pacific_Drive); [Contraband Police](https://www.pcgamingwiki.com/wiki/Contraband_Police); [Signalis](https://www.pcgamingwiki.com/wiki/Signalis)
- **No separate volume controls**: Undertale, Return of the Obra Dinn, Hotline Miami, Kentucky Route Zero, Her Story, Emily Is Away, Please, Don't Touch Anything, Iron Lung and Buckshot Roulette. My Summer Car has "No audio settings" at all. — [Hotline Miami](https://www.pcgamingwiki.com/wiki/Hotline_Miami); [Kentucky Route Zero](https://www.pcgamingwiki.com/wiki/Kentucky_Route_Zero); [Please, Don't Touch Anything](https://www.pcgamingwiki.com/wiki/Please,_Don%27t_Touch_Anything); [Iron Lung](https://www.pcgamingwiki.com/wiki/Iron_Lung); [Buckshot Roulette](https://www.pcgamingwiki.com/wiki/Buckshot_Roulette); [My Summer Car](https://www.pcgamingwiki.com/wiki/My_Summer_Car)
- PCGamingWiki confirms separate volume for Inscryption and Vampire Survivors but doesn't list the channels. Townscaper is marked "unknown". Minit's entry contradicts itself: "false", with notes reading "Master, Music". — [Inscryption](https://www.pcgamingwiki.com/wiki/Inscryption); [Townscaper](https://www.pcgamingwiki.com/wiki/Townscaper); [Minit](https://www.pcgamingwiki.com/wiki/Minit)

**What players and accessibility reviewers say**
- Undertale, 2016. The opening post: "Any way to adjust volume? Game isn't listed in Win7 audio mixer and I can't seem to find options menu". The poster found the game loud while everything else was quiet. — [Steam: Volume control please](https://steamcommunity.com/app/391540/discussions/0/412447331651791513/). Other Steam threads ask the same thing ("Volume Control?", "can you turn the sound down or off?"). — [Steam thread](https://steamcommunity.com/app/391540/discussions/0/358416640393590662/); [Steam thread](https://steamcommunity.com/app/391540/discussions/0/496879865898714429)
- Deltarune, June 2025: "Is there any way to turn down music without muting all the other sound effects and audio cues?" The poster needs to hear projectile cues in boss fights. A reply: "given there's a section of the game based around sound effects...its crazy that there aren't separate sliders". The accepted workaround was swapping music files for silent ones. — [Steam: Deltarune discussion](https://steamcommunity.com/app/1671210/discussions/0/604158579076811264/). A mod request exists for separate effects and voice volume. — [GameBanana request](https://gamebanana.com/requests/94740)
- itch.io community threads titled "Mute button?" (Autonauts), "Music volume?" and "No Turn off Music option?" show browser-game players asking for these controls. — [itch.io: Mute button?](https://itch.io/t/147371/mute-button); [itch.io: Music volume?](https://itch.io/t/612021/music-volume); [itch.io: No Turn off Music option?](https://itch.io/t/462694/no-turn-off-music-option)
- Can I Play That? records audio options as part of its accessibility write-ups. Its 2026 indie spotlight on Rollick N' Roll notes that the sound options are limited to a few volume sliders for music, sound and menu. — [Can I Play That?: Rollick N' Roll](https://caniplaythat.com/2026/04/29/indie-spotlight-rollick-n-roll/)
- Xbox Accessibility Guideline 105: "Games should provide a method for players to adjust the volume of the audio, or mute different types of audio, independently from each other". Its example is Grounded's sliders for master, effects, music, UI, dialogue and voice chat. — [Microsoft XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105)
- Game Accessibility Guidelines, "Provide separate volume controls or mutes for effects, speech and background / music": "Loss of hearing can affect certain frequencies more than others, so being able to control volume independently is essential". — [Game Accessibility Guidelines](https://gameaccessibilityguidelines.com/provide-separate-volume-controls-or-mutes-for-effects-speech-and-background-music/)

**Browser-game portals**
- Poki's requirement is about muting during ads: "Audio management: automatically mute game audio during advertisement playback". — [Poki requirements](https://sdk.poki.com/new-requirements.html)
- CrazyGames sends a `muteAudio` setting that "should take priority over your in-game audio settings. So, for example, if you also offer an 'Audio On/Off' toggle in game, be sure this doesn't enable the audio back". In other words, the portal treats an in-game on/off toggle as the typical control. — [CrazyGames SDK: Game](https://docs.crazygames.com/sdk/game/)

### Inferences
- The strongest genre precedent is Papers, Please: two channels, a pixel bar per channel, explicit −/+ buttons, and no master. It is conventional (players recognise it at once), discrete (it suits a 2px grid) and fully in the pixel language. Keep Talking shows the same stepper idea skinned as an in-world printed page.
- Lucas Pope's own path is informative. Papers, Please (2013) had two bars. Obra Dinn (2018) went down to one worded "Audio Volume" setting. A minimalist, crafted game can get away with very few audio controls, but the Undertale and Deltarune threads show that one control or none draws steady complaints. Two independent channels is the floor players expect.
- Number readouts are split: Balatro, Hypnospace, Signalis and Keep Talking show them; Hades, Unpacking, Vampire Survivors, Loop Hero and Papers, Please don't. The owner wants 0 to 100, and that only means something if the value is shown somewhere (a small tally or counter would echo the rail's savings tally). Without a readout, players only perceive the coarse position.
- Loop Hero's three icon-only mini sliders in the pause column are the closest precedent for putting levels in a small space. Even there they sit in the pause menu, not the HUD.
- Hacknet (toggle for sound, slider for music) is close to the current rail (switches), which suggests a mixed "switch on the rail, level in the menu" split already has precedent.

### Gaps
- I couldn't see Papers, Please's bar granularity (how many steps each −/+ press moves), Obra Dinn's full list of worded values, or the minimum and step of Celeste's scale. The screenshots show one state each.
- No settings screenshot or channel list for Inscryption, Townscaper or Vampire Survivors beyond the one image. Townscaper is "unknown" on PCGamingWiki.
- I didn't query Game UI Database, Interface In Game or GDC Vault (heavy JavaScript or login walls, and time). PCGamingWiki screenshots stood in for them.
- Reddit wasn't searched. Player sentiment here comes from Steam, itch.io, GameBanana and Can I Play That?.
- I found no systematic survey of how Poki or CrazyGames titles present volume (icon toggles versus sliders). The only evidence is CrazyGames' passing reference to an in-game "Audio On/Off" toggle.

## 2. Hover-expand volume controls in media players, their documented problems, and design-system guidance

### Takeaway
Hover-expand works like this: hover over the speaker icon and a slider slides out, while clicking the speaker mutes. YouTube does it, as do Chrome's and Safari's built-in players; video.js offers an inline or popover slider next to its mute button. It saves space but fails in documented ways:
- the slider collapses when the pointer crosses a gap or leaves mid-drag
- a hidden slider can be unreachable except by Tab
- a hover readout can show the wrong value
- the mouse wheel changes volume by accident
- touch screens have no hover, and iOS doesn't allow media volume to be set at all

WCAG 1.4.13 ("hoverable, dismissible, persistent") and 2.5.7 (a way to use it without dragging), plus NN/g's hover timings, set concrete rules if the pattern is used. The Apple, Microsoft and Material slider pages don't endorse hover-revealed sliders.

### Cited Findings

**How the players work**
- YouTube: "When you hover over the speaker icon, the volume slider will appear to the right". — [MakeUseOf](https://www.makeuseof.com/tag/3-ways-control-youtube-video-volume/). YouTube's shortcut list: "m" is "Mute/unmute the video", and "Up/Down arrow on the seek bar" is "Increase/Decrease volume 5%". Its note: "If you're using the new computer experience, you must click the video player before using keyboard shortcuts". — [YouTube Help: Keyboard shortcuts](https://support.google.com/youtube/answer/7631406)
- Netflix web: M mutes and unmutes; the up and down arrows change volume. — [Make Tech Easier](https://maketecheasier.com/use-keyboard-shortcuts-netflix/); [UseTheKeyboard](https://usethekeyboard.com/netflix/)
- Chrome's built-in video player shows its slider on hover: a developer copying it wrote "when you hover over the volume icon, the slider appears with a transition". — [Quasar issue #7739](https://github.com/quasarframework/quasar/issues/7739). Safari's built-in player uses a vertical slider that "expands upward from the video controls" on hover. — [wBlock issue #7](https://github.com/0xCUB3/wBlock-userscripts/issues/7)
- video.js, a common open-source player: the VolumePanel pairs a MuteToggle with a VolumeControl, and both "will be hidden if volume changes are not supported". The default is a horizontal inline slider (`inline: true`); `inline: false` makes it "appear vertically over the MuteToggle". — [video.js: Components guide](https://videojs.com/guides/components/)
- Media Chrome (Mux) documents hiding the volume range when volume is unavailable, "perhaps on an iPhone". — [Media Chrome: media-volume-range](https://www.media-chrome.org/docs/en/components/media-volume-range)
- Bluesky's 2024 volume-slider pull request copied YouTube's slide-out animation. It defaulted to 50% to avoid "blasting people's ears", used a logarithmic curve from dr-lex, and made "moving the slider... unmute[] the video", as on Twitter. The API showed it as not merged when checked. — [bluesky-social/social-app PR #5352](https://github.com/bluesky-social/social-app/pull/5352)

**Documented failure modes**
- **Collapse when the pointer leaves or while dragging**:
  - Quasar: "when you drag the thumb, @mouseleave gets triggered… the QChip should remain expanded". — [Quasar #7739](https://github.com/quasarframework/quasar/issues/7739)
  - Safari: the volume popover "immediately collapse[s]/disappear[s]" when the cursor crosses an overlapping invisible element. — [wBlock #7](https://github.com/0xCUB3/wBlock-userscripts/issues/7)
  - A September 2026 pull request (closed; merge status not checked) fixing a HUD whose "hover-revealed master-volume slider unmounted as soon as the pointer left the 'Sound · on/off' button, so it could not be adjusted with the mouse". The cause was the 10px gap between button and slider not counting as part of the hover group. — [cloudlands-fe PR #2541](https://github.com/intent-hq/cloudlands-fe/pull/2541)
- **Hidden slider unreachable by pointer**: with `opacity: 0; pointer-events: none` at rest, a slider mounted without its mute button "is invisible and unreachable by pointer; Tab is the only way in". — [playdeck issue #598](https://github.com/pedrosousa13/playdeck/issues/598). The reverse also happens: an invisible vertical slider "shows up after mouse hovering on it". — [video.js issue #5502](https://github.com/videojs/video.js/issues/5502)
- **Wrong value shown on hover**: "the volume percentage displayed is that of the hover position, not the current volume… it is impossible to see the precise volume level". — [stash issue #5654](https://github.com/stashapp/stash/issues/5654)
- **Accidental changes**: a user reports that hovering over "Spotify App Volume, Default Windows Volume, Youtube Browser Volume bar" changes volume on its own. The reply blames wheel-over-volume behaviour ("The scroll wheel adjusts the volume directly when the mouse is moved over the volume icon"). This is anecdotal and possibly a hardware fault. — [Microsoft Q&A](https://learn.microsoft.com/en-us/answers/questions/4275546/mouse-hover-over-volume-auto-scroll-bug). NN/g: "Revealing hidden content too quickly on mouseover can result in accidental activations". — [NN/g: Timing Guidelines for Exposing Hidden Content](https://www.nngroup.com/articles/timing-exposing-content/)
- **Tiny, drag-only slider** (vendor claim, likely biased): "Most desktop video players allow changing the sound by scrolling… YouTube requires users to click and drag a small slider". — [Volume Scroller blog](https://volume-scroller.zensodigital.com/blog/how-to-control-youtube-volume-with-mouse-wheel/)
- **No hover on touch**: the CSS `hover` media feature exists to detect when "the primary input mechanism cannot hover at all or cannot conveniently hover (e.g., many mobile devices emulate hovering when the user performs an inconvenient long tap)". — [MDN: hover](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover)
- **iOS**: "On iOS devices, the audio level is always under the user's physical control. The volume property is not settable in JavaScript." Apple adds that on desktop, element volume "allows the user to mute a game, for example, while still listening to music on the computer". — [Apple: Safari HTML5 Audio and Video Guide](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/Using_HTML5_Audio_Video/Device-SpecificConsiderations/Device-SpecificConsiderations.html)

**Usability and design-system guidance**
- NN/g hover timing: on click, feedback and reveal "within 0.1 seconds". For hover: "Mouse cursor enters target area: display visual feedback within 0.1 seconds. Wait 0.3–0.5 seconds" before revealing. When the pointer leaves, "there should be a slight delay before hiding the content"; otherwise you get "the diagonal problem". The best cue of intent "is that the user's mouse actually stops on the element". — [NN/g: Timing Guidelines](https://www.nngroup.com/articles/timing-exposing-content/)
- WCAG 2.2 SC 1.4.13 (Content on Hover or Focus) requires hover-revealed content to be Dismissible, Persistent and Hoverable. Hoverable means "the pointer can be moved over the additional content without the additional content disappearing". — [W3C Understanding 1.4.13](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus)
- WCAG 2.2 SC 2.5.7 (Dragging Movements): anything done by dragging must also work "by a single pointer without dragging". For a range slider, an acceptable alternative is to "click/tap anywhere on the slider track to move the thumb to that position", or a text input next to it. Keyboard arrows alone do not satisfy this. — [W3C Understanding 2.5.7](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements)
- WAI-ARIA slider pattern keys: Right/Up arrow "Increase the value of the slider by one step", Left/Down decrease, Home/End go to min/max, and Page Up/Down (optional) take larger steps. Use `aria-valuetext` when the raw number isn't friendly. — [W3C APG: Slider pattern](https://www.w3.org/WAI/ARIA/apg/patterns/slider/)
- Microsoft (Windows/Fluent) slider guidance:
  - "Use a slider when you want your users to be able to set defined, contiguous values (such as volume or brightness)"
  - "users think about setting their audio volume to low or medium—not about setting the value to 2 or 5"
  - "Don't use a slider for binary settings. Use a toggle switch instead"
  - "Give immediate feedback… the Windows volume control beeps to indicate the selected audio volume"
  - a custom volume slider "could display a speaker graphic without sound waves at the minimum end… and a speaker graphic with sound waves at the maximum end"
  - for vertical volume sliders, "always put the maximum volume setting at the top"

  — [Microsoft Learn: Sliders](https://learn.microsoft.com/en-us/windows/apps/design/controls/slider)
- Apple HIG, Sliders: "Consider supplementing a slider with a corresponding text field and stepper… a stepper provides a convenient way for people to increment in whole values". Sliders "can optionally display left and right icons that illustrate the meaning of the minimum and maximum values". On macOS, it suggests a tooltip "that displays the value of the thumb when people hold their pointer over it". The HIG also says "Don't use a slider to adjust audio volume… use a volume view". That advice is iOS-specific: the volume view controls system output volume, so it doesn't cover a game's internal mix. The watchOS slider is "a set of discrete steps" where "people can tap buttons on the sides of the slider to increase or decrease its value by a predefined amount", the same shape as Papers, Please's bar with −/+. — [Apple HIG: Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders)
- Material 3 (Android implementation docs): sliders come in a "standard" configuration (formerly "continuous") and a "stops" configuration (formerly "discrete"), with an optional value indicator and tick marks. — [Material Components: Slider.md](https://github.com/material-components/material-components-android/blob/master/docs/components/Slider.md)
- NN/g on sliders: they suit a parameter with "clear maximum and minimum values" where "the precise value is less likely to be important". Precise targeting on sliders is inherently hard (steering law), so pair a slider with a linked text field for precision. — [NN/g: Sliders, Knobs, and Matrices](https://www.nngroup.com/articles/sliders-knobs/)
- None of the Apple, Microsoft or Material slider pages I read mentions hover-revealed sliders. Hover rules come from NN/g and WCAG instead. — [Apple HIG](https://developer.apple.com/design/human-interface-guidelines/sliders); [Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/design/controls/slider); [Material](https://github.com/material-components/material-components-android/blob/master/docs/components/Slider.md)

### Inferences
- Hover-expand belongs to video chrome that already auto-hides. On a permanent 2px-grid rail it would add a hidden second function to a switch whose click already means mute. Every failure mode above applies: collapse mid-drag, a gap between switch and slider, no hover on touchscreen laptops and tablets, and keyboard reveal.
- If the owner still wants it, the evidence gives a checklist:
  - feedback within 0.1 s, then reveal after a 0.3–0.5 s dwell
  - count the revealed panel and any gap as part of the hover region
  - keep it open while a drag is in progress and during a short grace delay after the pointer leaves
  - reveal on keyboard focus too; Esc dismisses
  - click-on-track sets the value, and arrow keys step it
  - under `@media (hover: none)`, a click or tap opens it instead
- "No chrome that is not in the room" argues for a physical metaphor over a floating popover. For example, a fader drawer that slides out of the rail when the switch's side or label is clicked, instead of a slider that appears on hover.
- Since the owner wants 0 to 100, show the current value (not the value under the pointer) on the control itself while adjusting, following the stash bug. Following Windows' volume beep, play a short sample effect at the new level when the effects level changes.
- The game makes its sounds with synthesis, not media elements, so the iOS rule about media-element volume probably doesn't block in-game levels. Hover still doesn't exist on touch, though.

### Gaps
- I found no primary source (help page or design note) describing the current volume UI of SoundCloud, Spotify web, Twitch, Vimeo or Netflix web: whether it's hover-revealed, vertical or horizontal, or always visible. Only YouTube's hover reveal, Netflix's M key, and Chrome's and Safari's built-in players are sourced.
- No controlled usability study of hover-revealed volume sliders turned up. The evidence is bug reports, NN/g's general hover guidance and WCAG.
- I couldn't confirm whether YouTube reveals its slider on keyboard focus, or how it behaves mid-drag when the pointer leaves the player.
- I didn't verify whether iOS Safari applies Web Audio gain changes (the path a synthesized game would use). Apple's restriction as quoted covers media elements' `volume`.

## 3. Diegetic and skeuomorphic volume controls (knobs, dials, faders), knobs with a mouse, and discovery

### Takeaway
In-world volume controls in games are mostly the volume of an in-world music source, like a car radio, with separate global sliders still in the settings menu. Where settings themselves are made diegetic (Keep Talking, Hypnospace Outlaw), they keep conventional control semantics (steppers, sliders with numbers) and only change the skin. Rotary knobs are a poor fit for a mouse: mice have no rotation affordance. The audio-software convention is vertical (linear) drag, plus the wheel, a fine-adjust modifier and double-click to reset, and those hidden behaviours have no signifier. Research on diegetic UI finds no display type universally best.

### Cited Findings

**In-world examples**
- My Summer Car has no audio settings menu at all. — [PCGamingWiki](https://www.pcgamingwiki.com/wiki/My_Summer_Car). The in-car radio is on the dashboard. The wiki says, in paraphrase, to put the pointer on the left knob and scroll the wheel to turn it on and raise the volume; the right knob tunes. — [My Summer Car Wiki: Radio](https://my-summer-car.fandom.com/wiki/Radio)
- Discovery failure, same game, 2016: "i cant open fuel caps at all or turn the radio on. What key do i use, Mouse3 does not work." The answer: "Use the scroll function of the mouse3, not clicking function." — [Steam: How do i turn dials](https://steamcommunity.com/app/516750/discussions/2/312265589445995763/)
- Keep Talking's audio settings look like a printed paper page with −/% /+ steppers. Hypnospace Outlaw's look like part of its fictional OS, with wedge-track sliders and numeric readouts (see Q1). — [PCGamingWiki: KTANE screenshot](https://www.pcgamingwiki.com/wiki/File:KeepTalkingAudio.png); [PCGamingWiki: Hypnospace screenshot](https://www.pcgamingwiki.com/wiki/File:Hypnospace_Outlaw_Audio_Settings.png)
- Games with an in-world radio split its volume from the score in settings: Pacific Drive ("Radio Music", "Radio Dialogue"), Signalis ("Radio") and Contraband Police ("Radio", "Police siren"). — [Pacific Drive](https://www.pcgamingwiki.com/wiki/Pacific_Drive); [Signalis](https://www.pcgamingwiki.com/wiki/Signalis); [Contraband Police](https://www.pcgamingwiki.com/wiki/Contraband_Police)

**Research on diegetic interfaces**
- Fagerholt and Lorentzon's 2009 Chalmers thesis, "Beyond the HUD", defines the standard four-way split: diegetic, non-diegetic, spatial and meta. — [Semantic Scholar](https://www.semanticscholar.org/paper/Beyond-the-HUD-User-Interfaces-for-Increased-Player-Fagerholt-Lorentzon/16ee02a8839923752c6bc93f294bec67d73a586e). A secondary summary, paraphrased: diegetic UI exists inside the game world and the characters could perceive it; the four types sit on a fiction axis and a geometry axis. — [Nasty Rodent summary](https://nastyrodent.com/diegetic-and-non-diegetic-ui/)
- Peacocke, Teather, Carette, MacKenzie and McArthur (2018, *Entertainment Computing*), four experiments in first-person shooters: "no one display type – HUDs or alternatives – are universally best". Performance was best with diegetic or spatial displays for ammo and with a HUD for health. Weapons did best with "a redundant HUD icon and a diegetic/spatial display". — [York University: ec2018](https://www.yorku.ca/mack/ec2018.html)
- Peacocke et al. (2015): a diegetic "number-in-game" ammo display performed best. — [York University: GEM 2015](https://www.yorku.ca/mack/ieee_gem2015.html)

**Knobs with a mouse: conventions and evidence**
- NN/g (Page Laubheimer, 2017): mice "don't have a natural affordance for rotation". Designers add hidden vertical drag ("click and drag up or down, vertically"), but this "is not expected, and usually has no signifier, so users may never discover it". It can also "interfere with users' attempt to move the mouse in a circle". NN/g recommends a slider linked to a text field, a reset-to-default, and "a small tick… showing the location of the default value". — [NN/g: Sliders, Knobs, and Matrices](https://www.nngroup.com/articles/sliders-knobs/)
- Cubase offers three knob modes. "Circular": "Clicking and dragging in a circular motion changes the setting. Clicking anywhere along the encoder's edge immediately changes the setting". "Relative Circular" is the second. "Linear" means drag up/down or left/right. — [Steinberg: Editing – Controls](https://steinberg.help/cubase_pro/v12/en/cubase_nuendo/topics/preferences/preferences_editing_controls_r.html)
- JUCE, the main audio-plugin framework, has knob styles `Rotary` (circular), `RotaryHorizontalDrag`, `RotaryVerticalDrag` and `RotaryHorizontalVerticalDrag`, plus `absoluteDrag` versus `velocityDrag` modes and optional increment/decrement buttons. — [JUCE: Slider class](https://docs.juce.com/master/classjuce_1_1Slider.html)
- NexusUI, a web-audio UI kit, has a Dial whose `interaction` is `"radial"` (the default), `"vertical"` or `"horizontal"`. — [NexusUI dial.js](https://github.com/nexus-js/ui/blob/master/lib/interfaces/dial.js)
- KVR Audio forum, 2017, on plugin knobs:
  - a complaint about knobs reacting to both axes: "right about the time you're ready to let go of the button, the knob registers a minimal horizontal movement"
  - "Some plugins go from 0-10 in one small movement, it's very annoying"
  - requests for trackpad two-finger scrolling
  - fine-adjust modifiers (Shift/Ctrl/Alt) that differ from plugin to plugin

  — [KVR: Behaviour and fine adjustment of knobs](https://www.kvraudio.com/forum/viewtopic.php?t=478099)
- Hacker News, undated thread: "That's why you don't use circular dragging for a knob, you use vertical/horizontal drags". The reply: knobs "don't make them intuitive, they're merely familiar to people already familiar with such audio software". A defender: "a whole industry decided after 30 years of iterations that knobs that work like invisible sliders are the best controls". — [Hacker News thread](https://news.ycombinator.com/item?id=20385268)

### Inferences
- The desk rail's switches are already the right kind of in-world control for binary states. Microsoft's guidance ("Don't use a slider for binary settings. Use a toggle switch instead") and the diegetic precedents agree: switch for on/off, a linear control for level.
- A knob on the rail would look most "in the room", but it's the weakest mouse control. If used, it needs vertical drag, the wheel, click-to-step (or −/+), keyboard arrows and a visible number. Even then, expect My Summer Car-style discovery failures unless the first interaction is taught (a hint, or a cursor change).
- Pixel-grid issue (my reasoning, not sourced): a small 2px-grid knob can show only a handful of legibly different pointer angles. A linear fader of N art pixels shows N distinct positions, so 1-to-1 resolution for 0 to 100 needs about 100 art pixels (200 design pixels). A fader or notched bar in a menu or drawer, with a number readout, suits both the grid and the 0 to 100 requirement better than a rail knob.
- The Keep Talking and Hypnospace pattern (in-world skin, conventional behaviour) is the safest way to honour "no chrome that is not in the room": for example, a volume card or ledger page on the desk with two Papers, Please-style bars and −/+ keys.

### Gaps
- I found no controlled HCI study comparing circular versus vertical-drag knobs with a mouse. The evidence is NN/g's expert review, DAW and framework conventions, and forum opinion.
- I found no primary source on how players discover diegetic settings controls in 2D desk games in particular. Papers, Please's own in-world controls (the speaker button, the stamp tray) aren't covered by what I retrieved.
- Not For Broadcast (a mixing-desk game) wasn't examined; its PCGamingWiki title didn't resolve in my batch.

## 4. Where a quick mute sits relative to a volume level, and what to do with an existing M key

### Takeaway
The web and media-player convention keeps mute as a separate flag from the level: unmuting restores the previous level, and dragging the level to 0 reads as muted. M is the standard mute key in YouTube and Netflix and shows up in browser games. Games often add "mute when unfocused" as a separate option. So the rail's switches can stay as mute toggles with lamps, levels can live elsewhere, and M keeps its meaning.

### Cited Findings
- The HTML media model keeps `muted` separate from `volume`: "The HTMLMediaElement.muted property indicates whether the media element is muted." — [MDN: HTMLMediaElement.muted](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/muted)
- video.js mute button logic: if the volume is 0, clicking mute restores `lastVolume` (at least 0.1) and unmutes. Otherwise it only flips the muted flag, leaving the level alone. — [video.js source: mute-toggle.js](https://github.com/videojs/video.js/blob/main/src/js/control-bar/mute-toggle.js)
- YouTube: "m" is "Mute/unmute the video", and Up/Down changes volume by 5%. — [YouTube Help](https://support.google.com/youtube/answer/7631406). Netflix: M mutes; the arrows change volume. — [Make Tech Easier](https://maketecheasier.com/use-keyboard-shortcuts-netflix/)
- Bluesky's volume-slider pull request: "Moving the slider draws focus and unmutes the video. This is inline with other places, like Twitter." — [Bluesky PR #5352](https://github.com/bluesky-social/social-app/pull/5352)
- itch.io developers write "Mute the music with M" in a patch note, and "If you want to mute the game just press 'M'" in a reply to a player. These come from search results; I didn't open the pages. — [itch.io blog: Quick Bug-Fixes](https://itch.io/blog/884927/quick-bug-fixes); [itch.io post](https://itch.io/post/404288)
- Hacknet mixes the two: sound is a toggle only, music is a slider. — [PCGamingWiki: Hacknet](https://www.pcgamingwiki.com/wiki/Hacknet)
- WCAG 1.4.2 (Audio Control): audio that plays automatically for more than 3 seconds needs "a mechanism… to pause or stop the audio, or… to control audio volume independently from the overall system volume level". Technique G170: "Providing a control near the beginning of the web page that turns off sounds that play automatically". — [W3C Understanding 1.4.2](https://www.w3.org/WAI/WCAG22/Understanding/audio-control)
- "Mute on focus lost" is a tracked audio feature. Of the 49 PCGamingWiki pages checked, 18 list it in some form:
  - a toggle: Slay the Spire ("Mute while in background"), Brotato, Inscryption, Spiritfarer
  - always on: Loop Hero, Signalis, A Short Hike, Iron Lung
  - no mute: Papers, Please's Unity version ("Audio is not muted")

  — [Slay the Spire](https://www.pcgamingwiki.com/wiki/Slay_the_Spire); [Brotato](https://www.pcgamingwiki.com/wiki/Brotato); [Loop Hero](https://www.pcgamingwiki.com/wiki/Loop_Hero); [Papers, Please](https://www.pcgamingwiki.com/wiki/Papers,_Please)
- Portals mute from outside the game: Poki mutes during ads, and CrazyGames' `muteAudio` must override any in-game "Audio On/Off" toggle. — [Poki requirements](https://sdk.poki.com/new-requirements.html); [CrazyGames SDK](https://docs.crazygames.com/sdk/game/)
- Microsoft: "Don't use a slider for binary settings. Use a toggle switch instead". A volume slider can mark its ends with a silent speaker and a sounding speaker. — [Microsoft Learn: Sliders](https://learn.microsoft.com/en-us/windows/apps/design/controls/slider)

### Inferences
- Keep the rail's sound switch (with its M key cap) and music switch as mute toggles that don't touch the stored level. The lamp shows "audible" (switch on and level above 0). Setting a level to 0 in the level control turns the lamp off, as in YouTube, where dragging to 0 shows as muted. Turning the switch back on when the level is 0 should restore the last non-zero level (or a floor such as 10), following video.js, so the switch never looks "on" while silent.
- Moving a level control while that channel is muted should unmute it (the Bluesky/Twitter convention). Otherwise the player adjusts a level and hears nothing, which the project's "no dead clicks" rule forbids.
- M should keep its current meaning. M as "mute everything" (YouTube) versus "mute effects" (the key cap's current placement) is a design call. The sources only show M as the near-universal mute key in media players, not which channel it covers in games.
- The music switch, visible from the first screen, already works as WCAG 1.4.2's "control near the beginning" for the generative score.
- Muting when the tab or window is hidden is a common expectation (18 of 49 games). For a browser game it's cheap to add as a menu option.

### Gaps
- I found no source on how players react when a game's mute toggle and level slider disagree (for example, the level is at 60 while the switch is off). The behaviour above is inferred from media-player conventions.
- I found no survey of which key games bind to mute. In many games M is the map key, but I didn't verify specific titles.

## 5. Whether a game this small needs a master volume, and what defaults and step sizes players expect

### Takeaway
Two-channel games split roughly evenly between no master and master plus two channels. The desk-job and Papers, Please-like group (Papers, Please, Beholder, Orwell, Not Tonight, Hypnospace Outlaw, Keep Talking) has no master in every case. The exception is Contraband Police, which has seven channels. Accessibility guidelines ask for independent per-type control or mutes, not a master. Documented defaults sit below full for music (Stardew 75% music versus 100% sound; Deltarune's master at 60%; Bluesky's 50%). Everyday volume controls move in 15 to 20 steps (macOS 16, Android 15, YouTube 5%). Perceptually, a 0 to 100 control should map to decibels, not linear gain.

### Cited Findings
- Channel sets, from Q1:
  - no master: Papers, Please, Celeste, Hypnospace Outlaw, Keep Talking, Night in the Woods, Orwell, Beholder, Not Tonight, Shovel Knight, Hacknet
  - master plus two channels: Balatro, Unpacking, Loop Hero, Slay the Spire, Brotato, Hollow Knight, Cuphead, Katana Zero, Spiritfarer

  — [PCGamingWiki: Papers, Please](https://www.pcgamingwiki.com/wiki/Papers,_Please); [PCGamingWiki: Balatro](https://www.pcgamingwiki.com/wiki/Balatro); [PCGamingWiki: Beholder](https://www.pcgamingwiki.com/wiki/Beholder); [PCGamingWiki: Unpacking](https://www.pcgamingwiki.com/wiki/Unpacking)
- XAG 105 asks for independent volume or mute "of different types of audio" (music, voice-over, active effects, ambient, narration, voice chat). It doesn't require a master. — [Microsoft XAG 105](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/105)
- **Defaults**:
  - Stardew Valley: Music 75%, Sound 100%, Ambient 75%, Footstep 90%. — [Stardew Valley Wiki: Options](https://stardewvalleywiki.com/Options)
  - Deltarune: master default 60%. — [Deltarune Wiki: Config](https://deltarune.fandom.com/wiki/Config)
  - Bluesky pull request: 50%, "not maxing out the volume and blasting people's ears". — [Bluesky PR #5352](https://github.com/bluesky-social/social-app/pull/5352)
  - The screenshots show Balatro at Master 50 / Music 100 / Game 100 and Signalis at 80% on every channel, but they may not be defaults. — [Balatro screenshot](https://www.pcgamingwiki.com/wiki/File:Balatro_Audio_Settings.png); [Signalis screenshot](https://www.pcgamingwiki.com/wiki/File:Signalis_Audio_Settings.png)
- **Step sizes in everyday controls**:
  - macOS volume "changes in one of sixteen stepped increments"; Option+Shift gives "quarter-step increments, for a total of 64 steps". — [How-To Geek](https://www.howtogeek.com/265487/how-to-adjust-your-macs-volume-in-smaller-increments/)
  - Android's media stream (`STREAM_MUSIC`) defaults to 15 steps. — [AOSP AudioService.java](https://github.com/aosp-mirror/platform_frameworks_base/blob/main/services/core/java/com/android/server/audio/AudioService.java)
  - YouTube's arrow keys move 5%. — [YouTube Help](https://support.google.com/youtube/answer/7631406)
  - Celeste uses a 0 to 10 selector, and Deltarune uses integer 0 to 100 percent. — [PCGamingWiki: Celeste screenshot](https://www.pcgamingwiki.com/wiki/File:Celeste_general_settings.png); [Deltarune Wiki](https://deltarune.fandom.com/wiki/Config)
- **Perceptual mapping** (dr-lex, "Programming Volume Controls"):
  - "Volume sliders must not be linear… human perception of loudness is… logarithmic"
  - "A percentage is only acceptable if it maps to a range of dB values, for instance 0% = -60 dB and 100% = 0 dB"
  - "A sensible assumption for consumer equipment is that it will have a usable range of 60 dB"
  - a cheap approximation is "amplitude multiplication factor = x⁴"
  - "Add a linear roll-off near zero if you want to ensure perfect silence at volume setting 0"
  - discrete steps should be "between 1 dB and 3 dB… 2 dB is pretty much ideal"

  — [dr-lex: Programming Volume Controls](https://www.dr-lex.be/info-stuff/volumecontrols.html)
- A player's measurement of a linear slider (VRChat): "At %100… -3dBFS, At %50… -9dBFS, At %25… -15dBFS, at %10… -23dBFS". The report asks for logarithmic behaviour. — [VRChat feedback](https://feedback.vrchat.com/bug-reports/p/audio-sliders-are-behaving-in-a-liniar-rather-then-logarithmic-way)
- **Tick marks and snapping**: "if the slider is 200 pixels wide and has 200 snap points, you can hide the tick marks because users won't notice the snapping behavior. But if there are only 10 snap points, show tick marks." Also: "Show tick marks and a value label when users need to know the exact value". — [Microsoft Learn: Sliders](https://learn.microsoft.com/en-us/windows/apps/design/controls/slider)
- Apple suggests a stepper beside a slider for whole-value increments. NN/g suggests marking the default with a tick and giving a reset. — [Apple HIG: Sliders](https://developer.apple.com/design/human-interface-guidelines/sliders); [NN/g](https://www.nngroup.com/articles/sliders-knobs/)

### Inferences
- **No master for this game.** With two channels, a master adds a third control that just scales both. The closest genre peers leave it out. The rail's switches plus M already cover "silence everything quickly". Add a master only if more channels arrive (ambience, voice).
- **Worked numbers**, assuming dr-lex's 60 dB range mapped across 0 to 100:
  - one unit is 0.6 dB, below the roughly 1 dB that is noticeable, so 0 to 100 is finer than ears can resolve
  - a step of 5 is 3 dB (dr-lex's "OK" coarse step) and gives 20 steps, in line with macOS's 16 and Android's 15
  - a step of 10 is 6 dB, too coarse per dr-lex
  - a sensible split: store 0 to 100; drag and click-on-track give 1-unit resolution; −/+, the arrow keys and the wheel move by 5 (Page Up/Down or Shift for 10 or 20)
- **Linear gain misleads.** 50 would be only about −6 dB (20·log10 0.5), which is barely quieter, and 10 would be −20 dB. The VRChat numbers show exactly this. Use a dB curve (or x² to x⁴) with a hard zero at 0.
- **Defaults**: the evidence points to music below effects (Stardew 75/100), a cautious first-play level (Deltarune 60, Bluesky 50), and a visible default tick (NN/g). For a quiet generative score and short click effects, something like music 60–70 and effects 80–100 fits the sources. The final numbers depend on the actual mix loudness, which I didn't measure.
- **Tick marks**: a 21-position (0–100 by 5) pixel bar should show tick marks or notches (Microsoft's rule for few snap points). A 1-unit fader wide enough for 100 positions can hide them.

### Gaps
- Game loudness targets turned up only in secondary sources that disagree: Sony's ASWG-R001 is cited as −23 or −24 LUFS for console/PC and −18 for portable. I didn't read the primary PDF, so I've left them out.
- I found no player survey on the default volume people expect, or on 0–10 versus 0–100 scales. The defaults above are individual games' choices, not measured preferences.
- Whether Balatro's 50 master and Signalis's 80% levels are shipped defaults is unconfirmed; the screenshots may show user-changed values.
