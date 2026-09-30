# Paper and card motion in desk and inspection games (for "Proof of Humanity: Papers, Please")

Scope: how documents and cards should arrive, move and land in a desk or inspection game, judged against this game's stepped pixel-art CSS (no easing curves, rotation or blur on pixel art), a shift clock, and 55 applicants over the week. Source ages are labelled; older sources are marked "(older)". Facts about this game come from reading the repo on 2026-09-30 and cite file paths, not URLs.

## 1. How Papers, Please and its peers bring documents and cards onto the table (who moves them, how fast, with what sound), and what Lucas Pope said

### Takeaway
In Papers, Please the game only drops the entrant's documents on the counter. Every move after that is the player's own drag, which Pope chose because click-to-place "felt a bit lifeless". The stamp lands on mouse-down with a THUNK, and Pope worked to cut dead time between applicants. Card games that move cards *for* the player (Hearthstone, Balatro, Slay the Spire) sell weight with lift, drop and a thump. They also ship speed controls, because players see those automatic animations hundreds of times.

### Cited Findings

#### Papers, Please: Lucas Pope's own words (TIGSource devlog Nov 2012 to Feb 2013, older; mobile devlog 2022)
- The desktop flow in Pope's own summary: "each traveler drops their documents on the countertop after they enter the booth. Plain and simple." Players then "drag them from the counter to the desk for reading." — [Pope, "Cramming 'Papers, Please' Onto Phones", dukope.com devlog (2022)](https://dukope.com/devlogs/papers-please/mobile/)
- 2012-11-17: "When called, one person will walk into the inspection booth and appear close-up at the bottom." — [Pope, TIGSource devlog (archived scrape)](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-11-22: "I originally intended to have the documents just be clickable on the left; after which they show up in one of 2 fixed-width columns on the right. Nice and simple. Unfortunately that felt a bit lifeless when I prototyped it. There was also the general problem of space; each document would be limited to 150 pixels wide." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-11-22: "Instead there's now full drag-n-drop across the counter and desk. ... It also feels a lot cooler IMO. Much more like actually inspecting a pile of papers and a little bit fun in it's own right." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-11-22, on keeping it pixel-exact: "I ended up scaling the root DisplayObject, snapping pixel locations while dragging, and writing custom functions to generate nearest-neighbor rotated bitmaps at half-res." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-03: "Played around with some basic animations for walking up to/away from the booth. It's just 2D fakery so I have to black the character out during the movement. Gonna try to explain that with some lights-off/lights-on effect." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-05, shutters versus a fade between entrants: "I like the hostility of the shutters. It seems a bit much here but there'll be some time between immigrants so the shutters won't be going up and down constantly. ... The simplicity of the fade also feels good though." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-10, the clock: "For in-game time, I prefer it to be realtime. ... But all the little rigamarole of clicking things and arranging documents is part of the job and should be on the clock. The faster you can do that stuff, the better you'll be." He sums it up as ">> TIME COSTS TIME <<". — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-12, stamping: "Applying the stamp on mouse release just doesn't have the satisfaction. What you want is a nice solid THUNK when pressing the mouse down, not when you let go." He then tried "a stamp 'bar' that pulls out over the desk. In this case, the stamps are immovable and you have to arrange the documents beneath them before stamping. Feels much better." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-15: "The gameplay is really about procedure and rigamarole so I wouldn't want to skip through elements like this." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2012-12-17: a questioned entrant could say "Whoops, here it is." and "put it on the counter". Also: "Each morning there'll be a stack of letters on the counter ... using the same drag+drop interface." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2013-01-19: "Instead of just returning all the docs to the counter you now have to explicitly give them back." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2013-02-06, answering a request for a hand-dragged stamp: "I think manually dragging the stamp down at the right speed would be cool at first and annoying later. I'm currently adding sound effects to the game, including a satisfying 'THUNK' for the stamp". — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2013-02-08: "Sounds definitely help the game feel more alive." His sounds came from freesound.org and soundsnap.com, "edit[ed] ... extensively in Audacity". The game stayed at 570x320 art pixels after a move to 16:9. — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- 2013-02-11: a printed warning slip that can't be thrown away: "Actually I quite like this. It's an incentive to avoid warnings ... You can always throw it onto the far left of the counter to get it mostly out of the way." In the same post: "I'll also see if I can enable calling next before the current guy completely leaves." — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Phone port (2022): "no more desk, no more drag-n-drop. I swung all the way to readability". Documents are "displayed full-size in a long, horizontal, snap-scrolling list". New documents first "float", "requiring a tap to get them onto the rack and into the carousel", which keeps "the initial 'ok fine I'll take these' activity from the original desktop version". — [dukope.com mobile devlog](https://dukope.com/devlogs/papers-please/mobile/)

#### Card games
- Hearthstone: senior UI designer Derek Sakamoto's GDC 2015 talk "Hearthstone: How to Create an Immersive User Interface" says "our game is UI". — [Game Developer](https://www.gamedeveloper.com/design/video-designing-an-immersive-user-interface-for-i-hearthstone-i-); [GDC Vault](https://gdcvault.com/play/1022036/Hearthstone-How-to-Create-an)
- Hearthstone, summoning a minion: it "mirrors the act of throwing them on a table by first having the card hover up towards the screen from its default height before dropping the creature on the playing field with a satisfying thump (bigger creatures even get a louder landing)". Also: "Dragging the pack around causes it to tilt back and forth a little, to give it a feeling of heft." — [Joe Köller, Haywire Magazine (2014, older)](https://haywiremag.com/columns/game-feels-hearthstone/)
- Hearthstone cards: "Each card has its own sound effect and voice clips, and they move around the board with real weight—casting shadows when they leap up to attack". Also, "large minions slam into the game board with impact that puts cracks in the dirt". The author credits the feel to the fact that "It's in the animations and the sound effects." — [Jason Perry, Final Boss Blues (2014, older)](https://finalbossblues.com/on-hearthstones-ui/)
- Balatro's settings: Game Speed 0.5, 1, 2 or 4 (default 1), which "Affects the speed of card animations". Screenshake runs 0–100%, default 30% on desktop and 50% on mobile. Reduced Motion "Disables the idle and triggering animations of cards, the background animation, and the animation of text". — [Balatro Wiki, Settings](https://balatrowiki.org/w/Settings)
- Balatro code: modders call a card "pop" as `juice_up(0.3, 0.3)` right after playing a sound in card-flip sequences. This comes from search results over mod repositories; I did not verify it in the game's own code. — [JellyMod source on GitHub](https://github.com/jamesthejellyfish/JellyMod/blob/main/JellyJokers.lua)
- A third-party analysis says Balatro scores Jokers one at a time, left to right, with each contribution shown, so the player sees cause and effect. It is not a developer source. — [Blake Crosley, "Balatro: Juicy Feedback"](https://blakecrosley.com/guides/design/balatro)
- Slay the Spire added Fast Mode during early access (a "February 8th" patch; the year is reportedly 2018). It "speeds up everything in regards to animations, scene transitions, etc which saves a considerable amount of time". — [speedrun.com forum](https://www.speedrun.com/slay_the_spire/forums/dg73b). Slay the Spire 2 also has a Fast Mode toggle. — [YouTube how-to](https://www.youtube.com/watch?v=0WZwnQAqEy8)
- Inscryption: at the start of each turn the player chooses to draw 1 card from the main deck or 1 Squirrel from the side deck, and must draw before playing. The player pulls every card. — [Inscryption Wiki, Cards](https://inscryption.fandom.com/wiki/Cards)

#### This game today (from the repo, for comparison)
- The applicant walks up in 7 steps over 0.7 s (40 px per 100 ms step, from +280 px): `step-up 0.7s steps(7)`. — `src/ui/desk.css` lines 437, 448–453
- Form 1 moves in `land 0.32s 0.55s steps(8) both`: 8 steps of 40 ms and 20 px each, from −160 px. It settles 0.87 s after the call. The video printout runs the same keyframes with a 0.7 s delay and settles at 1.02 s. — `src/ui/desk.css` lines 819–839
- Papers returning: `hand-back 0.4s 0.75s steps(8) both`, to `translateX(calc(-100% - 64px))`. The applicant leaves in `step-off 0.7s 0.95s steps(7)`. — `src/ui/desk.css` lines 445, 827–845
- Sound on a call: `chime()` plays at once. One `paper()` sound (a band-passed noise "hiss" at 2600 Hz) plays 650 ms later. The video printout has no sound of its own. — `src/ui/Shift.tsx` ~lines 436–439; `src/ui/sound.ts` line 179
- The stamp is applied on `pointerdown`, as Pope asked, and `thunk()` fires at that moment. — `src/ui/Desk.tsx` lines 197–201; `src/ui/Shift.tsx` ~lines 441–442
- NEXT works again as soon as the applicant is decided. The one exception is a citation, where the call waits until the slip has been seen. So the exit animations overlap the next call, which is what Pope wanted in 2013-02. — `src/ui/Shift.tsx` lines 79, 158–168

### Inferences
- There are four ways a game can bring papers or cards in:
  - **The game drops, the player drags.** Papers, Please on desktop.
  - **The game floats, the player accepts.** The Papers, Please phone port.
  - **The game deals and the player waits**, usually with a speed setting. Balatro, Slay the Spire, Hearthstone's draw.
  - **The player draws.** Inscryption.

  This game is the third kind but has no speed setting, while the game it parodies is the first kind. Pope's automatic drop is a small event. The long motions in Papers, Please are the player's own drags, and players don't wait on those.
- The NEXT lever pull is this game's "ok fine I'll take these" beat. The papers' arrival should look like a direct result of that pull: quick, with a sound on contact. It should not play as a separate little cutscene that the player watches.
- Hearthstone's hover-up, drop and thump uses only offset, shadow and sound, all of which work in stepped pixel art. This desk already has the parts: a lifted paper gets a hard `box-shadow: 8px 8px 0` (`src/ui/desk.css` lines 790–791). A "landing" could be one lifted frame with the big shadow, then a contact frame with the flat shadow and a slap sound. Hearthstone's "bigger creatures ... louder landing" suggests Form 1 (a card) and the video printout (continuous paper) should sound different.
- Likely visible defect, to check. `animation-fill-mode: both` holds the first keyframe during `animation-delay` (see §4). Nothing between the papers and the whole stage clips them. `.game` and `.stage-frame` clip at the edge of the game (`src/ui/desk.css` lines 188–201). The only other `overflow: hidden` rules are `.sr-only`, `.booth-glass` and the `.card`'s own contents (lines 157–161, 411–414, 892–897). The papers mount when the applicant is called (keyed by visit, `src/ui/Desk.tsx` lines 123, 131). So Form 1 and the video probably sit in plain sight 160 px left of their places for 0.55 s and 0.7 s, then shuffle right. That reads as a nudge, not an arrival. A frame capture about 0.3 s after a call would settle it.

### Gaps
- Not Tonight, Beholder, Contraband Police, Hypnospace Outlaw, Cultist Simulator and Solitaire: I found no sourced description of how their documents or cards arrive (who moves them, timings, sounds). The time budget ruled out per-game searches.
- Papers, Please's real frame counts and timings for the counter drop, the walk-up and the document sounds are not in the devlog. They would need a frame-by-frame capture of the game.
- Sakamoto's GDC 2015 talk is video only. No transcript gave Hearthstone's draw or play durations.
- Balatro's internal deal and stagger timings are not public. Only mod snippets turned up.

## 2. Game feel and juice for arrivals: anticipation, overshoot and settle, impact frames, stagger, sound sync, and what survives strict pixel art

### Takeaway
Across the canon, polish is short, cause-linked emphasis: a quick start, a settle, an impact that briefly freezes and shakes a pixel or two, and a sound on the contact frame. In moderation, too: in the largest study, "extreme" juice scored worse than medium or high. Everything that matters here can be done without easing curves, rotation or blur, because classic animators get easing from the spacing of frames, not from curves. This game's stamp currently plays its THUNK 100 to 120 ms before the visible contact, and its paper shake renders 9 sub-frames at fractional pixel offsets instead of 3 clean frames.

### Cited Findings

#### Frameworks
- Swink (Game Feel, 2008, older) defines game feel as "realtime control of virtual objects in a simulated space, with interactions emphasised by polish". — [Wikipedia, Game feel](https://en.wikipedia.org/wiki/Game_feel)
- Swink (2007, older): "Polish can include sprays or dustings of particles where things hit or interact, screen shake, view angle shifts, or the squash and stretch of objects colliding". On real-time control: "Control, intent, and instructions flow from me into the game as quickly as I can think. Feedback returns just as quickly." — [Swink, "Game Feel: The Secret Ingredient", Game Developer, 2007-11-23](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient)
- Pichlmair and Johansen surveyed over 200 sources and group game-feel design into three domains, each with its own practice. Physicality goes with tuning. Amplification goes with juicing, which "communicates the importance of game events". Support goes with streamlining: responding to player intentions. — [Pichlmair & Johansen, "Designing Game Feel. A Survey" (2020)](https://arxiv.org/abs/2011.09201)

#### Juice and impact
- Juicy Breakout, the demo built for "Juice it or lose it": "A juicy game feels alive and responds to everything you do / tons of cascading action and response for minimal user input". Its README cites Robert Penner's easing equations, the 12 principles of animation and Casey Muratori on interpolation. It says the demo was made "for a talk at Nordic Game Indie Night" (2012, older). — [grapefrukt/juicy-breakout README](https://github.com/grapefrukt/juicy-breakout); [talk video](https://www.youtube.com/watch?v=Fy0aCDmgnxg). Conflict: the brief places the talk at GDC Europe 2012; the README says Nordic Game Indie Night, and I found no confirmation of a GDC Europe presentation.
- Kao et al. built four versions of one action RPG with no, medium, high and extreme juiciness. Medium and high "outperform No Juiciness and Extreme Juiciness across all measures", including player experience, intrinsic motivation, play time and in-game performance. I read this in the abstract as quoted in search results; the full paper returned 403. — [Kao et al., Entertainment Computing (2020)](https://www.sciencedirect.com/science/article/pii/S1875952118300879); [Improbable Research summary](https://improbable.com/2020/06/01/the-effects-of-juiciness-in-an-action-rpg-new-study/)
- Nijman, "The art of screenshake" (INDIGO 2013, older), is a list of about 30 tricks. Among them: impact effects, hit animation, permanence, screen shake, "sleep", "more bass" and camera kick. — [talk video](https://www.youtube.com/watch?v=AJdEqssNZ-U); list as summarized by [artificials.ch](http://artificials.ch/juice-up-your-game/)
- On "sleep", notes from an attempt to reproduce the talk: pause the action "for a frame or a couple of frames", and "get into that sweet spot before players become conscious of the freeze". On shake at a scaled-down resolution: "a pixel or two goes a long way". Their shake moves the view one frame diagonally, then back to normal the next frame. — [Blue Tengu (2014, older)](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)
- Sakurai on hitstop: "When you strike the opponent, both parties momentarily freeze, emphasizing the power of impact." Stronger hits freeze longer, up to a cap. Characters in hitstop vibrate side to side (grounded) or up and down (airborne), and the vibration decreases over the freeze. — [Sakurai's Famitsu column, trans. Source Gaming (2015, older)](https://sourcegaming.info/2015/11/11/thoughts-on-hitstop-sakurais-famitsu-column-vol-490-1/)
- Apple (current): "Aim for brevity and precision in feedback animations ... when a game displays a succinct animation that's precisely tied to a successful action, players can instantly get the message without being distracted from their gameplay." — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

#### Anticipation, spacing, overshoot and settle
- The Disney principles (Johnston & Thomas, 1981, older). Anticipation "prepare[s] the audience for an action". Follow through means loose parts "continue moving after the character has stopped". Slow in and slow out: "More pictures are drawn near the beginning and end of an action". Timing is "the number of drawings or frames for a given action, which translates to the speed of the action". — [Wikipedia, Twelve basic principles of animation](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)
- Microsoft's entrance easing is "Fast Out, Slow In", `cubic-bezier(0, 0, 0, 1)`: "Even if it's preceded by a moment of unresponsiveness, the velocity of the incoming object has the effect of feeling fast and responsive." Exits use "Slow Out, Fast In", `cubic-bezier(1, 0, 1, 1)`, so "the object is trying its hardest to get out of the user's way". — [Microsoft Learn, Timing and easing (updated 2024–2026)](https://learn.microsoft.com/en-us/windows/apps/design/motion/timing-and-easing)
- NN/g: "Completely linear motion looks weird and unnatural to users". It recommends ease-out for entrances, because it "makes the animation feel responsive, but allows the eye time to focus". — [NN/g, Laubheimer (2020)](https://www.nngroup.com/articles/animation-duration/)
- Material 3 Expressive (Google I/O 2025) "introduced the motion physics system". — [Supercharge summary](https://supercharge.design/blog/material-3-expressive). The details on springs and overshoot are not verified; see Gaps.

#### Sound sync
- ITU-R BT.1359 (older, broadcast lip-sync). People detect a mismatch from about +45 ms (audio early) to −125 ms (audio late). The acceptability range is wider, about +90 to −190 ms. The thresholds come from newsreader clips. — [summary in arXiv 2212.01686](https://arxiv.org/html/2212.01686v1)
- Pope wanted the THUNK on the press itself, "not when you let go". — [TIGSource devlog, 2012-12-12](https://fguillen.github.io/PapersPleaseDevlogScrap/)

#### This game's stamp and paper timings (repo)
- On pointer-down, `thunk()` plays at t = 0.
- The ink mark (`stamp-slam 0.1s steps(1)`, from `opacity: 0`) stays invisible for 100 ms and appears at t = 100 ms.
- The stamp handle (`stamp-down 0.3s steps(3)`, with a single `40% { translate: 0 12px }` keyframe) reaches its low point at 120 ms.
- The paper shake (`.stamped { animation: thunk 0.24s 0.12s steps(3) }`) starts at 120 ms.
- Sources: `src/ui/desk.css` lines 991, 1011, 1014–1018, 2058–2066; `src/ui/Shift.tsx` ~line 442.
- MDN: an element's timing function applies per keyframe segment, "from the keyframe on which it is specified until the next keyframe". — [MDN, animation-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timing-function). So `thunk` (keyframes at 0, 33, 66 and 100%, `steps(3)`) runs `steps(3)` inside each of its three segments. That gives 9 sub-frames of about 27 ms, including offsets of 0.67 px and 1.33 px, instead of 3 frames of 80 ms. — `src/ui/desk.css` lines 847–858

### Inferences

#### What survives strict pixel art (no easing curves, no rotation, no blur)
- **Ease-out by spacing, not by curve.** Hand-key the frames with shrinking distances, holding each frame with `steps(1, jump-start)` or a per-keyframe `step-end`. Example: a 160 px entrance in 4 frames of 40 ms at −64, −20, −4 and 0 px. The distances covered are 96, 44, 16 and 4 px, all multiples of 2. That is the "more pictures near the end" principle drawn in whole art pixels, and it keeps Microsoft's "fast out" first frame.
- **One-frame overshoot, one-frame settle.** Go 2 px (1 art pixel) past the rest position, then back to 0. This is the follow-through principle, and it adds weight without rotation or squash. Use it on the card-like Form 1. The floppy printout could skip it.
- **Anticipation is the player's.** The lever pull, or the applicant's hand at the window, is the wind-up. The paper itself shouldn't wind up: a backwards pre-move would only add delay.
- **A shadow that lands.** Hearthstone lifts, then drops with a thump. The pixel version is one frame with the existing 8 px hard shadow, then the resting shadow on the contact frame. The shadow is the only thing that changes "height".
- **The impact frame comes first.** Pope's THUNK-on-press means the contact frame should be the first frame after `pointerdown`: handle down, ink visible and sound together. Then one held frame, Nijman's "sleep". Then two shake frames getting smaller, 2 px and then 0, as in Sakurai's decaying vibration. Today the sound runs 100 to 120 ms ahead of the contact, past the roughly 45 ms audio-early threshold at which people notice. Fix it by moving the visuals to t = 0, not by delaying the sound: Pope's point was that the press itself must land.
- **Make the stepped keyframes mean what they say.** With multi-keyframe animations, use `steps(1, jump-start)`, or put `animation-timing-function: step-end` on each keyframe, so each keyframe becomes exactly one frame. Otherwise `steps(n)` multiplies the frames and adds fractional offsets. `stamp-down` happens to land on 4 px steps (0, 4, 8, 12, 8, 4, 0), but `thunk` does not.
- **Give each landing its own sound on its contact frame.** Today one hiss plays at 650 ms, 220 ms before Form 1 settles and 370 ms before the video settles, and the video has no sound. Suggested: a card "slap" on Form 1's contact frame and a paper-rustle or tear on the printout's.
- **Moderation.** Kao's result argues for 2 to 3 channels per event (step motion, sound, a 1-art-pixel shake), not all channels at once. The stamp is the game's loudest moment and can carry the most. Paper arrivals should stay quiet and quick.

### Gaps
- I could not confirm Material 3 Expressive's spring specs (whether "spatial" springs overshoot, stiffness and damping values). The official pages render client-side and did not load.
- I found no primary source that recommends a "one-frame overshoot" for UI objects in pixel art. It is inferred from the follow-through principle and the Hearthstone accounts.
- I didn't retrieve the exact Juicy Breakout toggles and their timings. The README has no numbers.
- Swink's often-quoted ~100 ms threshold for feeling "real-time" is in the book, not the 2007 article I could open. NN/g independently gives ~100 ms as "feels immediate" (see §3).

## 3. Timing: how long an arrival may take in a repeated, timed task; all at once or staggered; and whether the clock should wait

### Takeaway
Platform guidance converges on about 100 to 300 ms for arrivals, about 400 ms as slow, and 500 ms as "a real drag", with shorter times for frequent actions and exits shorter than entrances. Apple adds that people shouldn't have to wait for an animation, especially a repeated one. This game makes the player wait 0.87 s for Form 1 and 1.02 s for both papers on every call, 55 times a week, 42 of them on the clock. Keep a small stagger for reading order, cut the whole arrival to about 0.4 to 0.6 s, and let the clock run: Pope put handling on the clock, but pure waiting shouldn't cost the player.

### Cited Findings

#### Duration guidance
- NN/g (2020): "the duration of most animations should be in the range of 100–500 ms". About 100 ms for simple feedback "feels immediate to users and creates the illusion of physically manipulating the object". 200–300 ms suits substantial changes like modals. "A range of 100–400 ms is appropriate, with 400ms being a very slow animation, to be used only for big movements across large screens." "At 500ms, animations start to feel like a real drag for users." Entrances run a little longer than exits: "300ms to appear, but only 200 or 250ms to disappear". And "the more frequent the animation, the more subtle and shorter you'll want it to be." — [NN/g, "Executing UX Animations: Duration and Motion Characteristics", Page Laubheimer, 2020-02-09](https://www.nngroup.com/articles/animation-duration/)
- Material Design 1 (2014–2017, older, superseded). On mobile, transitions "typically occur over 300ms". Large ones take 375 ms. Entering takes 225 ms and exiting 195 ms. "Transitions that exceed 400ms may feel too slow." Desktop "should be faster and simpler ... 150ms to 200ms". — [Material Design 1, Duration & easing](https://m1.material.io/motion/duration-easing.html)
- Material 3 duration tokens (current, in Android's source): short1–4 are 50/100/150/200 ms, medium1–4 are 250/300/350/400 ms, long1–4 are 450/500/550/600 ms, and extra-long1–4 are 700–1000 ms. — [material-components-android tokens.xml](https://github.com/material-components/material-components-android/blob/master/lib/java/com/google/android/material/motion/res/values/tokens.xml)
- Fluent 2 duration tokens (current): ultraFast 50, faster 100, fast 150, normal 200, gentle 250, slow 300, slower 400 and ultraSlow 500 ms. — [fluentui tokens, durations.ts](https://github.com/microsoft/fluentui/blob/master/packages/tokens/src/global/durations.ts). Fluent's guidance: "Keep durations short and the movement natural", and include a "no motion" setting. — [Fluent 2, Motion](https://fluent2.microsoft.design/motion)
- WinUI 3 control durations (current): Normal 250 ms, Fast 167 ms, Faster 83 ms. — [Microsoft Learn, Timing and easing](https://learn.microsoft.com/en-us/windows/apps/design/motion/timing-and-easing)
- Apple (current): "In apps, generally avoid adding motion to UI interactions that occur frequently. ... avoid making people spend extra time paying attention to unnecessary motion every time they interact with it." And: "Let people cancel motion. As much as possible, don't make people wait for an animation to complete before they can do anything, especially if they have to experience the animation more than once." — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)

#### Games on time and speed
- Pope wanted "all the little rigamarole of clicking things and arranging documents ... on the clock" (">> TIME COSTS TIME <<", 2012-12-10). He also planned "calling next before the current guy completely leaves" (2013-02-11). — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Pope's view of hand-dragging the stamp "at the right speed": "cool at first and annoying later" (2013-02-06). — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Balatro's Game Speed (0.5–4x, "Affects the speed of card animations"). — [Balatro Wiki](https://balatrowiki.org/w/Settings). Slay the Spire's Fast Mode "saves a considerable amount of time". — [speedrun.com forum](https://www.speedrun.com/slay_the_spire/forums/dg73b)

#### Stagger
- Stagger rules of thumb from web-animation tutorials:
  - Per-item delays are roughly 40–200 ms.
  - The delay should be shorter than each item's duration, about 30–70% of it, so the motions overlap.
  - Too short and the effect disappears; too long and the group feels slow.

  These come from a search summary; I did not verify which page gives which number. — [LogRocket](https://blog.logrocket.com/css-staggered-animations/); [Motion docs, stagger](https://motion.dev/docs/stagger)

#### This game's clock and cadence (repo)
- Days 2–6 have a 360 s shift clock with 7, 8, 8, 9 and 10 applicants. Days 1 and 7 have no clock (6 and 7 applicants). That makes 55 applicants in the week, 42 of them under the clock. — `src/gen/day.ts` lines 39–45
- The clock runs whenever the window is open, the shift isn't over and the menu isn't open. Arrivals don't pause it. — `src/ui/Shift.tsx` line 81

### Inferences
- **The wait is 2 to 2.5 times the guidance.** From the lever to the last paper settled takes 1.02 s, against a 400–500 ms "slow" ceiling for a frequent action. Part of the 0.55 s delay covers the applicant's walk (0.7 s), which has a story reason. But the papers don't need to wait for the whole walk. Pope's papers arrive "after they enter the booth", and his booth is a separate view, as this one is.
- **The cost in clock time is small, but players pay it often.** About 1 s × 42 clocked applicants is about 43 s of 1,800 clocked seconds (about 2.4%). Over the week the player watches papers arrive for about 56 s, in 55 separate waits. By NN/g's and Apple's frequency rule, the repetition is the real cost.
- **Suggested target (for the owner to decide).** Both papers settled within about 0.4–0.6 s of the pull:
  - Form 1 starts about 200–300 ms after the pull (roughly when the applicant reaches the window if the walk is trimmed to 5 frames of 80 ms).
  - It lands in 4 frames of 40 ms (§2 spacing).
  - The printout follows 2–3 frames (80–120 ms) later.

  This keeps a reading order (the claim first, then the evidence) at negligible cost. The current 150 ms stagger against a 320 ms move (47%) already fits the rule of thumb; the absolute times are the problem.
- **All at once versus staggered.** All at once saves only about 100 ms. It loses the reading order and stacks both sounds on one frame. Keep a short stagger.
- **Should the clock wait? No.** Shorten the arrival instead:
  - Pausing a clock for sub-second windows makes the display stutter and complicates the rule "the clock runs while the window is open".
  - A 0.4–0.6 s arrival costs about 1% of a shift.
  - If the arrival must stay near 1 s for comedy, follow Apple's "let people cancel motion": let the papers take clicks, drags and key shortcuts from their first frame. Currently only `.returning` papers get `pointer-events: none`, so this may already hold. Check it.
- **Exits.** Exits should be shorter than entrances (Material 225 vs 195 ms; NN/g 300 vs 200–250 ms) and accelerate out (Microsoft's "Slow Out, Fast In"). For example, 4 frames of 40 ms at −8, −32, −96 and then off-desk, after the existing pause. The 0.75 s pause costs nothing because NEXT isn't blocked. Check that a quick NEXT doesn't cut the old papers' hand-back mid-slide into a visible pop.
- **A speed setting** (Balatro, Slay the Spire) patches long defaults in games with hundreds of repetitions. With 55 applicants, a fast default is simpler than a new setting.

### Gaps
- I found no empirical study on how UI or animation wait time inside a timed game affects perceived fairness, stress or score. The numbers above come from UI guidance for frequent interactions, not from game research.
- I found no measured timings for Papers, Please's own drop, walk-up or shutter.
- The stagger rules of thumb come from secondary web-development tutorials, not platform guidelines. Material 1's choreography page was not retrieved.

## 4. Pixel-art animation practice: frame rates, steps versus tweening, whole pixels, and frames needed for a slide or drop

### Takeaway
Pixel art moves in whole art pixels, snapped by the engine: Pope did it while dragging, and Celeste keeps integer positions. Pixel artists get easing from the spacing of held frames. Fast moves need "ones", and holds, shakes and idles can go on "twos". This game's slide is linear, 8 even frames of 20 px at 25 fps, so it reads as a conveyor rather than a drop. The hand-back's per-frame distance depends on the paper's width and usually falls off the 2 px grid. Multi-keyframe animations with `steps(n)` quietly add sub-frames.

### Cited Findings
- On twos: "Moving characters are often shot 'on twos'. One drawing is shown for every two frames of film (which usually runs at 24 frames per second), meaning there are only 12 drawings per second." And: "when a character is required to perform a quick movement, it is usually necessary to revert to animating 'on ones', as 'twos' are too slow to convey the motion adequately." Bill Plympton works "on threes" or "on fours", holding each drawing "from 1⁄8 to 1⁄6 of a second". — [Wikipedia, Traditional animation](https://en.wikipedia.org/wiki/Traditional_animation)
- Timing is the number of frames for an action, and slow in/out means more drawings near the start and end. — [Wikipedia, Twelve basic principles](https://en.wikipedia.org/wiki/Twelve_basic_principles_of_animation)
- Celeste and TowerFall: "All collider positions, widths, and heights are integer numbers". "Since positions are represented as integers we can't move in fractions of pixels, so we only move when the rounded remainder is non-zero". Movement happens "one pixel at a time". — [Maddy Thorson, "Celeste & TowerFall Physics"](https://www.maddymakesgames.com/articles/celeste_and_towerfall_physics/index.html)
- Papers, Please renders at 2x by "scaling the root DisplayObject, snapping pixel locations while dragging", and generates "nearest-neighbor rotated bitmaps at half-res". Even its rotation stayed on the art-pixel grid (2012-11-22, older). — [TIGSource devlog](https://fguillen.github.io/PapersPleaseDevlogScrap/)
- Apple: "In most games, maintaining a consistent frame rate of 30 to 60 fps typically results in a smooth, visually appealing experience." — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- Shake at low resolution: "a pixel or two goes a long way". — [Blue Tengu (2014, older)](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)
- CSS `steps(<integer>, <step-position>)`. The default position is `end` ("the last step happens when the animation ends"). `jump-start`: "the first step happens when the animation begins". `jump-none` and `jump-both` also exist. — [MDN, steps()](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/easing-function/steps)
- A keyframe's timing function applies "from the keyframe on which it is specified until the next keyframe"; without one, the element's value is used for each segment. — [MDN, animation-timing-function](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-timing-function)
- `backwards` fill "will apply the values defined in the first relevant keyframe as soon as it is applied to the target, and retain this during the animation-delay period"; `both` does this and `forwards`. — [MDN, animation-fill-mode](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/animation-fill-mode)
- In this game:
  - `land` moves 20 px (10 art px) per 40 ms step, 25 fps "on ones", for 8 even steps with no change in spacing.
  - The walking applicant moves 40 px per 100 ms step (10 fps).
  - `hand-back` moves `(paper width + 64 px) / 8` per 50 ms step. Papers have `max-width: 680px`: at 680 px that is 93 px per step, an odd number, off the 2 px grid.
  - Sources: `src/ui/desk.css` lines 813–816, 819–845, 437, 448

### Inferences
- **How many frames a slide needs.** For a 160 px paper arrival, 3 to 5 frames on ones (33–50 ms each) read as a fast, weighty move if the spacing eases out. With 8 even frames the eye tracks a constant-speed slide. That is the "completely linear motion" NN/g calls unnatural, and in pixel art it looks like a conveyor. Fewer frames with shrinking distances look faster and heavier.
- **One frame clock.** Pick one base frame, for example 40 ms (25 fps), and keep every step a multiple of it: moves on ones (40 ms), holds and shakes on twos (80 ms). The applicant's 100 ms walk frames don't fit a 40 ms base; 80 ms (5 frames = 0.4 s) would. Mixed cadences on one screen are tolerable across different objects but look accidental in one exchange (walk, then papers).
- **Keep every intermediate position on the grid.** Use explicit pixel keyframes that are multiples of 2, not `steps()` over a percentage distance. For the hand-back, use a fixed pixel distance divisible by 2 × the step count, or clip the papers under the booth edge so they never have to travel their full width.
- **A hidden start.** Because `both` holds the `from` position during the delay, either start each paper under something (a counter lip or booth edge that clips the desk's left side), or mount or reveal it only when its first frame is due (`forwards` fill plus a React timer). The React timer also lets the arrival sound fire on the same tick as the contact frame.
- **Sub-pixel frames will likely look soft.** The 0.67 px and 1.33 px `thunk` offsets probably draw text and hard edges resampled, not crisp. This follows from Thorson's integer-position principle; I haven't looked at the browser output.

### Gaps
- Pixel-art tutors (Pedro Medeiros/Saint11, Raymond Schlitter/Slynyrd, MortMort) were not retrieved. Their tutorials are mostly images or video, so the frame advice above rests on traditional-animation sources, Thorson and Pope.
- I found no authoritative source giving a minimum frame count for a UI slide or drop to "read". The 3–5 frame range is my inference.
- I didn't test how Chrome, Firefox and Safari draw fractional `translate` values on this DOM (text, borders, `image-rendering: pixelated` images).

## 5. Reduced motion: WCAG 2.3.3, prefers-reduced-motion in games, and what should replace a slide

### Takeaway
The paper slide and the stamp shake are non-essential "motion animation" under WCAG 2.3.3, so a player must be able to turn them off. Opacity and color changes are not motion. Apple and MDN both say to replace spatial transitions with fades or cuts rather than just deleting the timing. This game honors both the OS setting and its own toggle, but it zeroes every CSS delay while its sounds run on separate JS timers. With reduced motion on, the papers therefore pop in at the call and the paper sound plays 650 ms later. Keep the order and the sync, and drop only the movement.

### Cited Findings
- WCAG 2.3.3 Animation from Interactions (Level AAA): "Motion animation triggered by interaction can be disabled, unless the animation is essential to the functionality or the information being conveyed."
  - Motion animation is the "addition of steps between conditions to create the illusion of movement or to give a sense of a smooth transition".
  - Changes of color, opacity or blur alone are not motion animation.
  - The audience is people with vestibular disorders, for whom motion can cause "distraction, dizziness, headaches and nausea".
  - Suggested techniques: C39 (`prefers-reduced-motion`), SCR40 (JavaScript) and a site-wide preference.

  — [W3C, Understanding SC 2.3.3](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)
- MDN: `prefers-reduced-motion: reduce` means the user wants an interface that "removes, reduces, or replaces motion-based animations". "Scaling or panning large objects are vestibular motion triggers". MDN's example replaces a scale pulse with an opacity "dissolve". The page lists OS switches for Windows, macOS, iOS, Android, GNOME and KDE, and Firefox's `ui.prefersReducedMotion`. — [MDN, prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- Apple: with Reduce Motion on, "ensure your app or game responds by reducing automatic and repetitive animations, including zooming, scaling, and peripheral motion". Its list includes "Tightening animation springs to reduce bounce effects", "Replacing transitions in x-, y-, and z-axes with fades to avoid motion" and "Avoiding animating into and out of blurs". — [Apple HIG, Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility). Also: "Make motion optional ... avoid using it as the only way to communicate important information." — [Apple HIG, Motion](https://developer.apple.com/design/human-interface-guidelines/motion)
- NN/g: respect users who set "reduce motion" "by removing animations". — [NN/g (2020)](https://www.nngroup.com/articles/animation-duration/)
- Fluent: "Design for and include a 'no motion' setting for your app or website as recommended by the WCAG". — [Fluent 2, Motion](https://fluent2.microsoft.design/motion)
- Xbox Accessibility Guideline 117 (2022, updated 2026) asks games to:
  - "Avoid the use of camera shake, camera bobbing effects, motion blur ... or provide an option to turn off these behaviors".
  - Avoid "repetitive side-to-side or up-and-down on-screen movement, except that which is core to game play".
  - Give players "A mechanism to entirely disable" moving content.

  Its example is Halo Infinite, where players "individually set the intensity or amount of radial blur, screen shake, full screen effects, and speed lines across a sliding scale from zero to 100%". — [Microsoft Learn, XAG 117](https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/117)
- Balatro splits the two: a Screenshake slider (default 30% on desktop) and a separate Reduced Motion toggle that "Disables the idle and triggering animations of cards, the background animation, and the animation of text". — [Balatro Wiki](https://balatrowiki.org/w/Settings)
- This game with reduced motion on:
  - It is on when either the OS media query or the in-game toggle asks for it. — `src/ui/App.tsx` lines 40–42
  - Every animation and transition gets `animation-duration: 0.001s` and `animation-delay: 0s`. — `src/ui/desk.css` lines 2523–2549
  - Sounds are scheduled in JS regardless (`later(paper, 650)`). — `src/ui/Shift.tsx` ~line 439

### Inferences
- **Replacing the slide.** Show each paper as a cut, or a two-frame opacity step (opacity is not "motion" under WCAG), at the moment it would have landed. Play its sound on that frame. Keep the delays: timing and order are not motion. The player still learns "claim first, evidence second", and the sound still matches.
- **Today's version works but is out of sync.** Zeroing all delays puts both papers and the applicant on screen at the call, and the paper sound plays 650 ms later with nothing arriving. Either keep the delays, or drive the sound from the same timeline that reveals the paper.
- **The stamp.** Drop the 2 px paper shake and the handle travel; keep the ink appearing at once and the THUNK. Ink appearing is a color change, not motion, and the THUNK carries the impact without motion, which Apple's "don't rely on motion alone" also asks for.
- **Optional.** Following Balatro and Halo, the paper and screen shake could get its own on/off or intensity setting apart from full reduced motion. It is small, since this game's shake is only 2 px (1 art pixel).
- **Moving the hidden-start fix into React** (mount or reveal papers on their landing tick; see §4) would give full and reduced motion one timeline, with only the in-between frames switched off.

### Gaps
- I found no study measuring whether short, small, stepped UI slides (160 px over 0.32 s inside a scaled game stage) trigger vestibular symptoms. WCAG, MDN and Apple speak generally about scaling, panning and large or peripheral motion.
- I found no game-specific published guidance, beyond XAG 117 and store settings examples like Balatro's and Halo's, on what should replace document or card arrivals in reduced-motion modes.
