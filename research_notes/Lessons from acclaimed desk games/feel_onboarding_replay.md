# Game feel, onboarding and session/replay design in acclaimed small games: lessons for a browser desk game

Scope note: this covers game feel ("juice"), teaching through play, reasons to return, and accessibility options, with cheap takeaways for "Proof of Humanity: Papers, Please". That game is a React/SVG desk game with a lever (Space), Accept/Challenge stamps (A/C), point-at-two-things inspect (I), citation slips, a 6-minute shift clock on days 2–6, court, accounts, a morning paper, a 7-day week and save/continue. Some sources below are secondary (fan wikis, guides, a design newsletter), and they are labelled where they appear. Several primary pages would not load (certificate errors, 402/403 responses), and those gaps are listed under each question.

## 1. Game feel and juice: what makes each action feel good in a desk/UI game, and when juice becomes noise

### Takeaway
The best-sourced guidance says feedback should be moderate and tied to meaning. Every action gets an immediate, physical-feeling response (sound, a small motion, something that stays on the desk), and the big effects are kept for important events. Balatro and Papers, Please show this in UI-driven games: the sound and weight of the core verb (stamp, card) is the product, and the payoff reveal is staged so the player watches it happen. A controlled study found that both no juice and extreme juice lowered play time and player experience compared with medium or high juice.

### Cited Findings
**Definitions and frameworks**
- Jonasson and Purho's talk (GDC Europe 2012) defines a "juicy" game as one with "little details, little moments of surprise and delight; it's the difference between an experience that feels flat and dull and one that feels exciting and engaging." — [Roblog summary of the talk](https://roblog.co.uk/2024/03/juicy-games/); talk on [GDC Vault](https://www.gdcvault.com/play/1016487/Juice-It-or-Lose) and [YouTube](https://www.youtube.com/watch?v=Fy0aCDmgnxg)
- The talk's description: "A juicy game feels alive and responds to everything you do tons of cascading action and response for minimal user input." Their demo is Juicy Breakout, at grapefrukt.com/f/games/juicy-breakout/. — [Are.na block quoting the talk description](https://www.are.na/block/14011363); [Limboy's Links](https://limboy.me/links/7ihzixkwzj3qu31)
- The same summary extends juice beyond games: "good copywriting has juiciness, good design does, good websites do." — [Roblog](https://roblog.co.uk/2024/03/juicy-games/)
- Steve Swink describes game feel as "The tactile sensation of manipulating a digital agent", and as "mostly subconscious, a combination of sights, sounds, and instant response to action." He splits it into six parts: Input, Response, Context, Polish, Metaphor and Rules. — [Swink, "Game Feel: The Secret Ingredient", Game Developer](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient)
- Swink on polish: "polish is time consuming but it's also vital. A little screen shake or spray of particles can make all the difference." — [Game Developer](https://www.gamedeveloper.com/design/game-feel-the-secret-ingredient)
- An academic survey (Pichlmair & Johansen) defines game feel design as "the intentional design of the affective impact of moment-to-moment interaction with games". It names three domains:
  - Physicality: "tuning the physicality of game objects creates cohesion, predictability".
  - Amplification: "juicing is the act of polishing amplification and it results in empowerment and provides clarity of feedback by communicating the importance of game events".
  - Support: "streamlining allows a game to act on the intention of the player, supporting the execution of actions in the game".
  — [arXiv 2011.09201, "Designing Game Feel. A Survey"](https://arxiv.org/abs/2011.09201)

**Vlambeer, "The Art of Screenshake" (Jan Willem Nijman, 2013)**
- The talk is a rapid list of about 30 tricks in about 25 minutes, showing what makes Nuclear Throne feel immediate. — [search summary of notes by Mary Rose Cook and others](http://notebook.maryrosecook.com/Theartofscreenshake,JanWillemNijman.html); video on [YouTube](https://www.youtube.com/watch?v=SkgkIXZ_13Y)
- Sleep (hit-pause): "Pausing the action for a frame or a couple of frames when enemies die, the player gets hit, things explode, etc." — [Blue Tengu, experiments based on the talk](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)
- Screenshake: "Rattling the screen around when something important happens is a good way to make otherwise boring reactions feel more 'physical'." — [Blue Tengu](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)
- Other tricks from the talk: gun kickback, player and enemy knockback, permanence (bodies and shell casings stay on screen), camera lead in the facing direction, and explosion smoke. — [Blue Tengu](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/); [search summaries](https://newbquest.com/tag/art-of-screenshake/)
- Blue Tengu found that context decides which tricks work. Screen shake helped their game, but knockback got in the way of precise control, so they dropped it. — [Blue Tengu](https://www.bluetengu.com/2014/12/12/art-of-screenshake-experiments/)

**Balatro (LocalThunk)**
- LocalThunk: "Creating the tactile and juicy feel of the cards/effects became my obsession and is the only reason Balatro exists today. By far the most fun part of making this game" — [LocalThunk on X](https://x.com/LocalThunk/status/1860092451660398933)
- LocalThunk on why the game doesn't show the score before you play a hand: "My personal belief is that the game is more fun when you set up your Rube Goldberg machine and watch it go before knowing whether or not the hand will win the round." — quoted in [Mark Brown, "Balatro's 'Cursed' Design Problem" (GMTK)](https://gmtk.substack.com/p/balatros-cursed-design-problem)
- Mark Brown describes the reveal after a hand is played. Numbers tick up with escalating sound effects, and each card and joker steps forward in turn to add its points. Multipliers can catch fire. Brown argues that showing the score in advance would make all of this pointless. — [GMTK](https://gmtk.substack.com/p/balatros-cursed-design-problem) (secondary: Brown's analysis)
- Balatro puts its feel under player control:
  - Game Speed 0.5/1/2/4, which "Affects the speed of card animations".
  - A Screenshake slider from 0 to 100%, defaulting to 30% on desktop and 50% on mobile.
  - A Reduced Motion toggle that "disables the idle and triggering animations of cards, the background animation, and the animation of text" as well as screenshake.
  - A CRT slider.
  — [Balatro Wiki, Settings](https://balatrowiki.org/w/Settings) (fan wiki)

**Papers, Please (Lucas Pope)**
- Game Developer's description of the game: "The pleasantly-tactile feel, from each day's opening with a coarse, clacking shutter to the definitive punch of a bright, haphazard stamp aligned over each passport." — [Game Developer, "Designing the bleak genius of Papers, Please"](https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-)
- Pope said that "A large part of the production was dictated by my lack of resources". So he worked on "the right mix of ambient and triggered sounds in the booth to make it feel natural" instead of filling the game with music. — [Game Developer, Road to the IGF: Papers, Please](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-) (paraphrase with quoted fragments)
- Pope: "I think a big part of what makes this possible is just the game's technical simplicity. If there were gobs of 3D assets or voice overs or exciting cutscenes, it'd be a lot harder to maintain these nuances." — [Game Developer](https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-)
- Pope on the mobile port: "To stamp a passport you just align it under the stamp and click." He added: "I didn't want to give up the satisfaction of stamping on press/touch." He also added a stamp-bar "pull chain, which allows me to save some screen space and helpfully indicate its availability." — [Lucas Pope, "Cramming 'Papers, Please' Onto Phones" devlog](https://dukope.com/devlogs/papers-please/mobile/)

**Mini Metro (Dinosaur Polo Club)**
- Peter Curry: they "always had a vision for a procedural soundscape generated solely by events in the game." — [Game Developer, Road to the IGF: Mini Metro](https://www.gamedeveloper.com/audio/road-to-the-igf-dinosaur-polo-club-s-i-mini-metro-i-)

**When juice becomes noise**
- Dominic Kao's study (Entertainment Computing, 2020) built four versions of the same action RPG with no, medium, high and extreme juiciness. Medium and high did better than none and extreme on every measure: player experience, intrinsic motivation, play time and performance. Summaries describe this as a "Goldilocks effect". — [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S1875952118300879); [Improbable Research](https://improbable.com/2020/06/01/the-effects-of-juiciness-in-an-action-rpg-new-study/); [ResearchGate](https://www.researchgate.net/publication/339467686_The_Effects_of_Juiciness_in_an_Action_RPG). The full text was paywalled (402/403), so these findings come from search-result abstracts and summaries.
- The Pichlmair & Johansen survey says juice should communicate "the importance of game events", which is about clarity, not decoration. — [arXiv 2011.09201](https://arxiv.org/abs/2011.09201)

### Inferences
- **Every verb needs its own sound.** Pope's "ambient and triggered sounds in the booth" is the model. Cheap version: lever clunk, stamp thunk, slip printer chatter, paper slide and shutter. Give repeated sounds (stamps) a small random pitch and volume variation so they don't get tiring. Mini Metro builds its music from game events; the same could be done by tuning the stamp and printer sounds to the key of the current day's music.
- **Anticipation, impact, follow-through on the stamp.** For anticipation, the stamp lifts for a few frames before it falls. For impact, use a Nijman-style "sleep": hold one or two frames on contact, which is the desk game's version of hit-pause. For follow-through, leave a slightly rotated ink mark ("haphazard stamp") that stays on the document.
- **Permanence.** Nijman keeps bodies and casings on screen; the desk equivalent is keeping the day's citation slips as a visible pile on the desk.
- **Do not let juice leak validity.** This is specific to this game's invariant ("Only the evidence reveals validity"). The Accept and Challenge feedback must look and sound the same whether the call was right or wrong. The verdict arrives only later, through the citation slip, as in Papers, Please where citations print after the entrant leaves.
- **Stage the reveals.** Balatro's "watch it go" reveal fits the court screen and the accounts screen. Tick up the pay lines one at a time with escalating pitch, then land the total with a thunk. Don't show the net in advance.
- **Keep big effects rare so they read as important.** Kao's Goldilocks result and the survey's "importance of game events" framing both point here. Reserve shake and hit-pause for a small set of events: a citation printing, a fine, a lost appeal, the shift ending. Normal clicks get only sound and a small motion. The deadpan comedy tone also argues for restraint.
- **Treat Balatro's settings as the menu to copy.** An animation-speed multiplier, a screenshake slider with a low default, and a Reduced Motion toggle that also follows the browser's `prefers-reduced-motion` setting are all cheap in React/CSS.

### Gaps
- The full list of about 30 "Art of Screenshake" tricks could not be retrieved: Mary Rose Cook's notes page had an expired certificate, and the other summaries were partial. The same goes for the full technique list of "Juice It or Lose It" (tweening, squash and stretch, and so on); no transcript loaded.
- The Kao study's sample size is unclear. One search summary said "119 participants on Amazon Mechanical Turk", but other coverage calls it the "largest study to date on juiciness", which casts doubt on that figure. It is unverified and should not be cited.
- Swink's latency threshold (the often-quoted ~100 ms) is not in the Game Developer article that was fetched. The book was not consulted.
- No primary source was found for Balatro's sound design (escalating pitch per chip). Only Mark Brown's description is available.
- No primary source was found on Papers, Please's desktop stamp and paper physics beyond the mobile devlog. Pope's TIGSource devlog was not fetched.
- The titles of relevant newer papers turned up but were not read: "Juicy Text: Onomatopoeia and Semantic Text Effects" ([ICMI 2024](https://dl.acm.org/doi/10.1145/3678957.3685755)) and "How does Juicy Game Feedback Motivate?" ([CHI 2024](https://dl.acm.org/doi/fullHtml/10.1145/3613904.3642656)). Both may bear on a text-heavy desk game.

## 2. Onboarding: teaching through play, the first five minutes, avoiding text walls, surfacing shortcuts

### Takeaway
The acclaimed examples teach one idea at a time through a first situation where the player can't miss it. Papers, Please's day 1 has a single rule (Arstotzkans only). Portal places its first portal so players see themselves through it. Baba Is You's first real level only asks you to break "WALL IS STOP". Tools and rules are added across days, not explained up front, and designers tune this by watching playtesters. No strong primary source was found on how to surface keyboard shortcuts; accessibility guidelines ask for remappable controls and for every part of the UI to be reachable with the same input as the gameplay.

### Cited Findings
**Papers, Please**
- On day 1 the only rule is "Arstotzkan citizens only". The player accepts or denies entrants on that basis alone, and "With a little practice it should be easy to process entrants in mere seconds by just glancing at the passport to check the color." — [StrategyWiki Day 1 and Steam guide, via search summary](https://strategywiki.org/wiki/Papers,_Please/Day_1); [Steam guide](https://steamcommunity.com/sharedfiles/filedetails/?id=2539652296) (fan guides; the StrategyWiki page itself returned 403)
- "Each subsequent day introduces progressively more complex rules, such as denying citizens of specific countries or requiring new document types." — [Wikipedia, Papers, Please](https://en.wikipedia.org/wiki/Papers,_Please)
- Pope arranged "everything to carry the game through 30 days without too many dry spots or unnecessary confusion." — [Game Developer, Road to the IGF](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)
- Pope on pacing new content: "I struggled with this for a long time. It got to the point where adding even one little encounter or rule would blow out all the scheduling for the rest of the game." — [Game Developer](https://www.gamedeveloper.com/design/designing-the-bleak-genius-of-i-papers-please-i-)

**Portal (Valve; Kim Swift)**
- Swift said that "It's absolutely critical that players quickly wrap their heads around what a portal is". Playtesters understood portals faster once they saw themselves through one, so the first portal was placed so players would always see themselves. — [Game Developer, "Still Alive: Kim Swift And Erik Wolpaw Talk Portal", via search summary](https://www.gamedeveloper.com/business/still-alive-kim-swift-and-erik-wolpaw-talk-portal); [GMTK "Valve's Secret Weapon"](https://gmtk.substack.com/p/valves-secret-weapon)
- Swift: "Probably the most important thing that we learned since coming to Valve is playtesting." A year into development, playtesters said "that was a great tutorial, I can't wait to play the actual game", but that was the actual game. — [same sources, via search summary](https://www.gamedeveloper.com/business/still-alive-kim-swift-and-erik-wolpaw-talk-portal)
- Swift: "Players are going to want to go towards the light, as opposed to the dark. That's hardwired into us as human beings". She also said: "We're smart monkeys, but base core, we're animals." — [Game Developer, "Taking advantage of a player's animal instincts"](https://www.gamedeveloper.com/design/taking-advantage-of-a-player-s-animal-instincts-with-em-portal-em-s-kim-swift)

**Baba Is You (Arvi "Hempuli" Teikari)**
- The first puzzle level asks the player to take apart "WALL IS STOP" and then build "FLAG IS WIN". Each level includes only what it needs, and Teikari aimed for every level to "at least try to incorporate some new interaction or feature of the game system." — [search summary drawing on the Wikipedia/Game Developer coverage](https://www.gamedeveloper.com/design/designing-i-baba-is-you-i-s-delightfully-innovative-rule-writing-system) (secondary; the Game Developer interview itself had no teaching quotes)

**Mini Metro**
- The developers describe their goal as "zen, chill out, puzzly experiences that are very easy to get into but are a lot deeper than you think at first." — [GameFeatured interview, via search summary](https://gamefeatured.com/interviews/dinosaur-polo-club-mini-metro)

**Accessibility guidance that bears on onboarding and controls**
- The Game Accessibility Guidelines' "Basic" tier includes:
  - "Include interactive tutorials"
  - "Allow players to progress through text prompts at their own pace"
  - "Use simple clear language"
  - "Allow the game to start without navigating multiple menu levels"
  - "Allow controls to be remapped/reconfigured"
  - "Ensure that all areas of the user interface can be accessed using the same input method as the gameplay"
  - "Provide details of accessibility features in-game"
  — [Game Accessibility Guidelines, Basic](https://gameaccessibilityguidelines.com/basic/)

### Inferences
- **Keep day 1 to one rule and the three core verbs** (lever, stamp, slip). Unlock each later tool (inspect with I, the rulebook's new pages, court) on the first day it is needed, as Papers, Please does with its growing rules.
- **Make the first use impossible to miss, Portal-style.** On the day inspect arrives, the first applicant with a clue should carry a guaranteed, clear mismatch between two items that sit close together on the desk. That way, the first press of I lights up something real. It must still follow the rulebook and the planted-violation invariant.
- **Teach through in-world paper, not modals.** Memos and rulebook pages are already the game's medium; they are this game's version of Papers, Please's rulebook and Baba's word blocks. Any on-screen prompt should wait for the player: it goes away when the player does the action, not on a timer.
- **Show shortcuts on the objects themselves.** Put a small key cap on the lever ("Space"), the stamps ("A", "C") and the inspect tool ("I"). Show them in full for the first days, then fade them to a subtle hint. Clicking and keys should work everywhere (the GAG "same input method" line). Remapping is a Basic-tier guideline and cheap to add with a keymap object.
- **Test with new players.** Swift's point is that onboarding problems only show up when someone new plays. For a new player, a Playwright-recorded first five minutes, with a note of every hesitation, is the cheap version.
- **Pace rule introductions like Pope does.** His scheduling problem is the reason to check that each day adds no more than one or two new things to hold in mind.

### Gaps
- No primary source (developer quote or talk) was found on how acclaimed small games surface keyboard shortcuts. The inference above rests on general UX practice and the GAG, not on a sourced game example.
- No primary Hempuli quotes on Baba's tutorial design were retrieved. The Baba findings above are secondary.
- No details were found on Mini Metro's actual tutorial flow; only the developers' stated "easy to get into" goal.
- It is unverified which day Papers, Please introduces inspect mode, because the fandom Timeline page returned 402.

## 3. Session length and replay: what makes a player return, and which cheap features deliver it

### Takeaway
The strongest return loops in the evidence are cheap:
- a shared daily seed that is the same for everyone (Wordle, Slay the Spire's Daily Climb, Mini Metro's daily and weekly challenges);
- a spoiler-free share artefact (Wordle's emoji grid, which a player invented);
- a way to jump back into any earlier day (Papers, Please story checkpoints);
- an endless or score mode unlocked after the story (Papers, Please's Timed, Perfection and Endurance modes).

Wardle deliberately capped the time the game asks for ("three minutes of your time a day") and felt uneasy about any push to share. Balatro's creator treats unlocks as something players may skip.

### Cited Findings
**Wordle (Josh Wardle)**
- "I just wanted a game that was just three minutes of your time a day, and that's it." — [Game Developer, Wardle GDC reflections](https://www.gamedeveloper.com/marketing/josh-wardle-reflects-on-the-the-unconventional-road-to-wordle-s-success)
- To the NYT: "It's something that encourages you to spend three minutes a day. And that's it. Like, it doesn't want any more of your time than that." — quoted by [InsideHook](https://www.insidehook.com/internet/wordle-alternative-hello-wordl) (original: New York Times, Jan 2022; not fetched)
- "It's something about the fact that it's one puzzle, and everybody is solving it." — [TechCrunch interview](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)
- On why people return: "It's this really comforting way of letting other people know that you're thinking about them. It's a shared experience." — [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)
- The share grid came from a player: "A player who's playing the game comes up with this way of sharing her results where she goes to the emoji keyboard and types out the grid on the board." He also said: "One of the early adopters in New Zealand came up with the emoji grid idea and was manually typing them out to share her results on Twitter, so I decided to integrate it." — [Game Developer](https://www.gamedeveloper.com/marketing/josh-wardle-reflects-on-the-the-unconventional-road-to-wordle-s-success); [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)
- The grid is "a way of sharing how you did in the game, but without spoiling it for others." — [Syntax.fm transcript, via search summary](https://syntax.fm/show/430/creator-of-wordle-josh-wardle/transcript)
- "When you play Wordle by yourself you go on a journey...And this emoji grid becomes a way in which you can share that story really easily with others." — [Game Developer](https://www.gamedeveloper.com/marketing/josh-wardle-reflects-on-the-the-unconventional-road-to-wordle-s-success)
- On leaving a link out of the share text: "the grid has this really beautiful, simple aesthetic and if you throw up a link there It kind of looks crappy in my opinion." And: "I felt really uncomfortable that if the game has an agenda to get you to share... Like why am I encouraging people to share? Am I encouraging them because they want to do it? Or am I encouraging because it's good for the game." — [Game Developer](https://www.gamedeveloper.com/marketing/josh-wardle-reflects-on-the-the-unconventional-road-to-wordle-s-success)
- On notifications: "Do you really want me to notify you?" And: "I think people have an appetite for things that transparently don't want anything from you." — [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)
- On how it was built: "I built it as simply as possible... It's literally just a website and some JavaScript that downloads, and once it's downloaded, it never needs to do anything again." — [TechCrunch](https://techcrunch.com/2022/01/12/josh-wardle-interview-wordle/)

**Slay the Spire (Mega Crit), Daily Climb**
- Every 24 hours the game makes a new run with a fixed character, a set Ascension level and three modifiers. The seed is the same for every player worldwide, and each Daily Climb has its own leaderboard shown on the Daily screen. — [Slay the Spire Wiki archive, Daily Climb](https://slaythespire-archive.fandom.com/wiki/Daily_Climb) (fan wiki, via search summary); [Bossdown StS2 guide](https://bossdown.com/guides/slay-the-spire-2-daily-climb-guide/)

**Mini Metro**
- The game has daily and weekly challenges with leaderboards. The developers also mentioned "mystery challenges" and the idea of player-designed challenges with custom leaderboards. — [GameFeatured interview, via search summary](https://gamefeatured.com/interviews/dinosaur-polo-club-mini-metro)

**Papers, Please**
- The game has "a scripted story mode with twenty possible endings depending on the player's actions, as well as some unlockable randomized endless-play modes." — [Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please)
- Endless mode offers three types, each with a choice of four rule sets:
  - Timed: 10 minutes to process as many entrants as possible.
  - Perfection: one penalty ends the run.
  - Endurance: the easiest type.

  It unlocks with code 62131, which is shown after ending 20 and is the same in every copy. — [Papers Please Wiki, Game modes, via search summary](https://papersplease.fandom.com/wiki/Game_modes) (fan wiki; the direct fetch returned 402)
- The story mode saves progress at the end of each day. From the Story mode screen the player can restart from any earlier day and branch to other endings without replaying from the start. — [speedrun.com guide and Steam discussion, via search summary](https://www.speedrun.com/papers_please/guides/yxb04) (secondary)

**Balatro**
- LocalThunk on a suggested option to unlock content, apparently an unlock-all option (the context is unclear from the fetch): "I personally would never click that option myself...but when it was suggested I thought – why wouldn't I add that as an option? It's simply a net positive mechanic." — [TouchArcade interview](https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/)
- On the public demo: "They were instrumental. This game really became the strategy game it is now because of the iteration I was able to do with the community over time." — [TouchArcade](https://toucharcade.com/2024/03/18/balatro-interview-mobile-port-localthunk-dlc-plans-updates-new-jokers-demo-feedback/)

### Inferences
Cheap features ranked by fit with an existing seeded, deterministic, local-only game ("same seed, same week"):
1. **Daily shift.** Derive a seed from the date, so everyone plays the same single ~6-minute shift that day, like Wordle's "three minutes". It needs no network: the date plus the existing generator is enough.
2. **Spoiler-free share text** copied to the clipboard: day or seed number, one glyph per applicant (for example ✅ correct, 🟥 wrong, 🟨 cited), plus a closing balance. Follow Wardle's lead and leave out the link, and never prompt the player to share.
3. **Day select from the save** (the Papers, Please story checkpoints). The game already saves and is deterministic, so replaying day N from its morning state is mostly UI work. It also lets a player chase another court or newspaper outcome.
4. **Endless or score mode after day 7** that reuses the generator, modelled on Papers, Please's Timed, Perfection and Endurance modes. Personal bests could be kept per mode in localStorage, as a per-viewer convenience.
5. **Unlocks.** If any are added, offer an option to unlock everything. The evidence gives no reason to gate content in a 45-minute week.

Things to avoid, going by Wardle: notifications, streak guilt and nagging to share.

### Gaps
- No primary Mega Crit statements on why the Daily Climb exists or how it affects retention were found; only wiki and guide descriptions.
- No primary Dinosaur Polo Club statements on the design or retention effect of the daily challenge were found.
- No primary Papers, Please source for the endless-mode details (fandom only, fetch blocked) or for the day-select checkpoint UI (guides only).
- No sourced data was found on whether achievements, or unlocks versus grind, affect return rates in small games. Any claim either way would be opinion.
- Wordle's streak and stats screen: no Wardle quote on it was retrieved.

## 4. Accessibility and options that acclaimed small games ship, and which ones get noticed

### Takeaway
The cheap, high-value options are:
- a game-speed or animation-speed setting;
- a screenshake slider or off switch;
- a single Reduced Motion toggle;
- a colour mode that does not rely on colour alone (Balatro's High Contrast Cards);
- separate volume controls;
- readable default text size;
- remappable keys;
- settings that are remembered.

The Game Accessibility Guidelines name remapping, text size, colourblindness and subtitle presentation as the four most common player complaints. Celeste's Assist Mode, which includes a game-speed slider, is the best-known example of an option that got wide coverage.

### Cited Findings
- **The four most common complaints.** GAG's Basic tier is "Simple considerations or design decisions that apply to most game mechanics," and "The four most commonly complained about issues are remapping, text size, colorblindness, and subtitle presentation." — [Game Accessibility Guidelines, Basic](https://gameaccessibilityguidelines.com/basic/)
- **Other Basic-tier items.** These include:
  - "Include an option to adjust the game speed"
  - "Avoid flickering images and repetitive patterns"
  - "Provide high contrast between text/UI and background"
  - "Use an easily readable default font size"
  - "Ensure no essential information is conveyed by a fixed colour alone"
  - "Ensure no essential information is conveyed by sounds alone"
  - "Provide separate volume controls/mutes for effects, speech, and music"
  - "Ensure that all settings are saved/remembered"
  - "Offer a wide choice of difficulty levels"
  — [GAG Basic](https://gameaccessibilityguidelines.com/basic/)
- **Balatro's settings.** They include:
  - Game Speed 0.5/1/2/4
  - A Screenshake slider (desktop default 30%)
  - High Contrast Cards, which "alters suit colors and face card appearance for visibility"
  - Reduced Motion, which disables card idle and trigger animations, the background animation, text animation and screenshake
  - A Play/Discard button-order option
  - A CRT slider and a bloom toggle
  - Separate Master, Music and Game volume
  — [Balatro Wiki, Settings](https://balatrowiki.org/w/Settings) (fan wiki)
- **Balatro's static background patch.** A static background option was added in a 2024 patch, following a player request on Steam for a graphics setting. — [search summary of Steam discussions](https://steamcommunity.com/app/2379780/discussions/0/4201364375109001844/?l=english&ctp=2) (secondary; patch date not confirmed)
- **Celeste Assist Mode.** It lets players adjust "game speed, stamina, the number of air dashes, even your ability to die." Matt Thorson: "From my perspective as the game's designer, Assist Mode breaks the game... But ultimately, we want to empower the player and give them a good experience, and sometimes that means letting go." It was first called "Cheat Mode", and the name changed because that label felt "judgmental". — [Vice](https://www.vice.com/en/article/celeste-difficulty-assist-mode/)
- **Celeste's preamble rewrite.** The Assist Mode text was later rewritten after talks with disabled players. It now reads "Celeste is intended to be a challenging and rewarding experience. If the default game proves inaccessible to you, we hope that you can still find that experience with Assist Mode." The change got its own press coverage. — [Vice, "The Small But Important Change"](https://www.vice.com/en/article/celeste-assist-mode-change-and-accessibility/); [Clinton Lexa (halfcoordinated) on Medium](https://halfcoordinated.medium.com/gaming-accessibility-and-language-my-full-interview-response-regarding-celestes-assist-mode-b52ee22d6821)

### Inferences
Cheap options, in order, for a browser desk game:
1. **Reduced Motion toggle.** It defaults on when the browser reports `prefers-reduced-motion: reduce`. It turns off shake, hit-pause, idle wobble and text animation, but keeps sounds and static state changes, so no action becomes a dead click.
2. **Animation speed** at 1×, 2× and 4×, as in Balatro, for stamps, paper slides and the tally tick-up.
3. **A relaxed-clock option for the 6-minute shift.** This is the desk game's version of Celeste's game-speed slider. It changes gameplay, so under this project's rules it needs sign-off before building.
4. **Text size.** Pixel-art text is a readability risk, and text size is one of the four most common complaints.
5. **Never rely on colour alone.** Stamp ink, citation slips and verdict glyphs in the share text each need a shape or word as well as a colour.
6. **Separate music and effects volume**, plus a mute.
7. **Remappable keys**, with every action also reachable by mouse or keyboard alone.
8. **Remembered settings**, persisted with the existing save.

Naming matters, as Celeste's "Cheat Mode" rename shows. Call these "Options" or "Assist" and describe them without judgement. That fits a deadpan game if the writing stays dry, and it should not joke at the player's expense.

### Gaps
- No accessibility review (for example from Can I Play That?) of Balatro, Papers, Please or Mini Metro was found. There is no sourced evidence on which specific options reviewers of those games noticed. The GAG's "most commonly complained about" list is the best available proxy.
- No sourced information was found on the accessibility options in Papers, Please or Mini Metro. Mini Metro is widely reported to have a colour-blind mode, but that was not verified here.
- The date and exact scope of Balatro's Reduced Motion and static-background additions (launch or patch) were not confirmed from patch notes.
