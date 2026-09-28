# Reception of Papers, Please-likes and acclaimed deduction/inspection games (as of 2026-09-28)

Method notes (apply to all sections):
- **Steam figures** (score label, % positive, total reviews, release date, and the Metacritic number Steam shows on its store page) were pulled directly from Steam's own `appreviews` and `appdetails` endpoints on **2026-09-28**. They count all languages and purchase types. Each row links the store page; the raw endpoint pattern is `https://store.steampowered.com/appreviews/<appid>?json=1&language=all&purchase_type=all&num_per_page=0`.
- **Complaint-theme percentages are my own analysis.** I took English Steam reviews in "recent" order (up to 600 negative and 300 positive per game) and matched keywords with regular expressions. Examples: `repetit|monoton|grind|samey`; `tedious|boring|dull|chore`; `ending`; `bug|crash|glitch|broken`; `unfair|unclear|confus|arbitrar|trial and error|random|vague|guess`; `ui|interface|control|clunky|click`; `price|refund|overpriced|not worth|$`. This is a crude signal: a review can mention a word without complaining about it. Compare the negative column against the positive column, and games against each other. Don't read any single number as exact. Sample sizes are given.
- Anything taken from a Steam user review is marked **(user review, forum-tier)** and cited by recommendation ID on the game's Steam review page.

---

## 1. Papers, Please-likes: scores, praise, complaints and structure

### Takeaway
Papers, Please is still the benchmark: 97.3% positive from about 80.6k Steam reviews, Metacritic 85 on PC, 5M sold. Very few of its imitators earn both critic and player acclaim. The newer streamer-friendly ones (Contraband Police, No, I'm Not a Human, That's Not My Neighbor, Quarantine Zone) sell hugely and score well with Steam users, but critics rate them only 68–77. Their negative reviews cluster around four problems:
- thin or unrewarding endings (No, I'm Not a Human)
- bugs (Quarantine Zone, Beholder 3, Contraband Police)
- side activities that pull focus from the desk (Contraband Police, Quarantine Zone)
- "every day feels the same" with no escalation or consequences (Mind Scanners, Death and Taxes)

### Cited Findings

**Score table (Steam data retrieved 2026-09-28; Metacritic (MC) and OpenCritic (OC) as cited)**

| Game (release) | Steam label, % positive, total reviews | Critics | Source |
|---|---|---|---|
| Papers, Please (8 Aug 2013) | Overwhelmingly Positive, 97.3%, 80,626 | MC PC 85, iOS 92 | [Steam](https://store.steampowered.com/app/239030/); [Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please) |
| That's Not My Neighbor (itch.io 15 Feb 2024; Steam 11 Mar 2025) | Very Positive, 88.9%, 4,750; itch.io 4.7/5 from 1,617 ratings | No Metacritic critic reviews | [Steam](https://store.steampowered.com/app/3431040/); [itch.io](https://nachogames.itch.io/thats-not-my-neighbor); [Metacritic](https://www.metacritic.com/game/thats-not-my-neighbor/) |
| Not Tonight (17 Aug 2018) | Very Positive, 82.2%, 2,793 | MC PC 71, Switch 78 | [Steam](https://store.steampowered.com/app/733790/); [Wikipedia](https://en.wikipedia.org/wiki/Not_Tonight_(video_game)) |
| Not Tonight 2 (11 Feb 2022) | Mostly Positive, 77.1%, 485 | – | [Steam](https://store.steampowered.com/app/1600370/) |
| Contraband Police (8 Mar 2023) | Overwhelmingly Positive, 95.0%, 25,820 | MC 77 (as shown on Steam) | [Steam](https://store.steampowered.com/app/756800/) |
| Mind Scanners (20 May 2021) | Mostly Positive, 75.2%, 1,474 | No MC shown on Steam; Escapist review negative | [Steam](https://store.steampowered.com/app/1389550/) |
| Beholder (9 Nov 2016) | Very Positive, 91.6%, 31,191 | MC PC 75, iOS 80, Xbox 74, PS4 63, Switch 58 | [Steam](https://store.steampowered.com/app/475550/); [Wikipedia](https://en.wikipedia.org/wiki/Beholder_(video_game)) |
| Beholder 2 (4 Dec 2018) / Beholder 3 (3 Mar 2022) | 87.1% of 8,180 / **Mixed, 64.5%** of 2,872 | MC 76 / – | [Steam B2](https://store.steampowered.com/app/761620/); [Steam B3](https://store.steampowered.com/app/1570070/) |
| Headliner: NoviNews (23 Oct 2018) | Very Positive, 89.2%, 817 | OC top-critic average 74, **48% recommend**, 27 reviews | [Steam](https://store.steampowered.com/app/918820/); [OpenCritic](https://opencritic.com/game/7872/headliner-novinews) |
| No, I'm Not a Human (15 Sep 2025) | Very Positive, 93.3%, 31,043 | MC 76 (10 critics); MC user score 7.1 | [Steam](https://store.steampowered.com/app/3180070/); [Metacritic](https://www.metacritic.com/game/no-im-not-a-human/) |
| Quarantine Zone: The Last Check (12 Jan 2026) | Very Positive, 81.8%, 13,378 | MC 68; **OC 41% recommend** | [Steam](https://store.steampowered.com/app/3419520/); [Wikipedia](https://en.wikipedia.org/wiki/Quarantine_Zone:_The_Last_Check) |
| Death and Taxes (20 Feb 2020) | Very Positive, 85.8%, 8,578 | – | [Steam](https://store.steampowered.com/app/1166290/) |
| Not For Broadcast (25 Jan 2022) | Very Positive, 93.8%, 12,709 | MC 82 | [Steam](https://store.steampowered.com/app/1147550/) |
| Do Not Feed the Monkeys (23 Oct 2018) | Very Positive, 93.5%, 12,785 | – | [Steam](https://store.steampowered.com/app/658850/) |
| Orwell: Ignorance is Strength (22 Feb 2018; this is the sequel, not the 2016 original) | Mostly Positive, 75.8%, 1,921 | MC 74 | [Steam](https://store.steampowered.com/app/633060/) |
| Border Officer (19 Jul 2019) | **Mixed, 56.7%**, 1,376 | – | [Steam](https://store.steampowered.com/app/1057180/) |
| DEAD LETTER DEPT. (30 Jan 2025) | Overwhelmingly Positive, 95.1%, 1,863 | – | [Steam](https://store.steampowered.com/app/1627350/) |
| Home Safety Hotline (16 Jan 2024) | Very Positive, 90.9%, 2,959 | – | [Steam](https://store.steampowered.com/app/2357910/) |
| The Exit 8, an anomaly-spotting game (29 Nov 2023) | Very Positive, 93.0%, 11,649 | – | [Steam](https://store.steampowered.com/app/2653790/) |
| I'm on Observation Duty (3 Apr 2019) | Overwhelmingly Positive, 95.3%, 2,258 | – | [Steam](https://store.steampowered.com/app/1046820/) |

**Sales context**
- Papers, Please: 500k copies by March 2014, 1.8M by August 2016, 5M by its 10th anniversary in 2023 ([Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please)).
- No, I'm Not a Human: over 100k in its first week, 500k in a month, and over 1M announced on 19 Mar 2026. Its demo had been on Steam since 9 June 2025 ([VGChartz 1M](https://www.vgchartz.com/article/467356/no-im-not-a-human-sales-top-1-million-units/); [Wikipedia via search](https://en.wikipedia.org/wiki/No,_I'm_Not_a_Human)).
- Quarantine Zone sold over 500,000 copies in its first week ([Wikipedia](https://en.wikipedia.org/wiki/Quarantine_Zone:_The_Last_Check)).

**Complaint themes in negative Steam reviews (my keyword analysis; % of English negative reviews; positive-review % in brackets)**

| Game (neg n) | repetitive | tedious/boring | ending | bugs | unfair/unclear/guess | UI/controls | price/value | median playtime, negative vs positive reviewers |
|---|---|---|---|---|---|---|---|---|
| Papers, Please (600) | 9.2 [2.7] | 24.0 [1.0] | 4.7 [9.0] | 1.8 [0] | 5.8 [1.7] | 7.2 [3.3] | 4.3 | 3.1h vs 11.2h |
| That's Not My Neighbor (254) | 13.8 | 20.1 | 3.9 | 15.4 | 9.8 | 8.7 | 10.2 | 1.8h vs 6.0h |
| Not Tonight (311) | 20.6 | 27.3 | 14.1 | 14.1 | 8.7 | 10.9 | 10.3 | 5.9h vs n/a |
| Contraband Police (486) | 10.7 | 18.3 | 4.3 | 22.2 [2.0] | 7.0 | 7.8 | 14.4 | 7.3h vs 18.4h |
| Mind Scanners (169) | 20.7 | 24.9 | 10.7 | 2.4 | 22.5 | 13.0 | 15.4 | 2.5h vs 7.6h |
| Beholder (600) | 8.3 | 20.7 | 8.0 | 8.2 | 12.7 | 14.2 | 10.0 | 4.2h vs 8.6h |
| Beholder 3 (162) | 3.7 | 13.0 | 11.1 | **47.5** [20.0] | 8.6 | 8.6 | 8.6 | 10.4h vs 13.0h |
| Headliner (46) | 4.3 | 19.6 | 13.0 | 2.2 | 15.2 | 6.5 | 19.6 | 1.9h vs 7.4h |
| No, I'm Not a Human (600) | 11.7 | 19.2 | **34.0** [13.3] | 17.2 | 23.3 | 8.8 | 14.5 | 4.0h vs 8.2h |
| Quarantine Zone (600) | 15.7 | 21.2 | 5.7 | **41.7** [10.3] | 11.8 | 7.5 | 20.8 | 9.3h vs 13.3h |
| Death and Taxes (600) | 21.2 | **42.8** [4.3] | 17.2 | 2.7 | 12.3 | 9.8 | 11.3 | 2.7h vs 5.2h |
| Border Officer (125) | 4.0 | 7.2 | 2.4 | 30.4 | 2.4 | 7.2 | 11.2 | 1.6h vs 8.2h |

Source for all rows: English reviews from the Steam appreviews endpoint (`filter=recent&review_type=negative|positive`), e.g. [Papers, Please reviews](https://steamcommunity.com/app/239030/reviews/), [No, I'm Not a Human reviews](https://steamcommunity.com/app/3180070/reviews/), [Quarantine Zone reviews](https://steamcommunity.com/app/3419520/reviews/), retrieved 2026-09-28.

**Papers, Please (the benchmark)**
- Structure: a story mode with a daily bulletin of rules that get "progressively more difficult over time". Violations produce a fax citation in the booth. Daily pay is per correctly processed entrant plus bribes, minus citation penalties, and debt can end the game. There are 20 endings, and an unlockable Endless mode keeps only the processing ([Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please)).
- Pope on pacing (4 Feb 2014): "the hard part was arranging everything to carry the game through 30 days without too many dry spots or unnecessary confusion." His lore was "written as I went, usually to introduce a new mechanic or explain a character's motivation." He also said "keeping everything fictional really helped... the player's imagination handles most of the heavy lifting" ([Game Developer, Road to the IGF](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)).
- Pope on audiovisual choices: the low resolution was "dictated by my limitations, but the result is that I could create visuals and especially animations very quickly". He used ambient sound instead of full music, and muted colours to express bleakness ([Game Developer](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)).
- Pope on feedback (8 Apr 2019): "Papers, Please had this 'printer feedback' when you failed which also ended up being very important for the flow of the game" ([Adventure Gamers](https://adventuregamers.com/article/bafta-game-award-winner-lucas-pope-return-of-the-obra-dinn)).
- Main criticism is tedium. Reviewer Stephanie Bendixsen: "I was just so bored that I just struggled to go from one day to the next" ([Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please)). Tedium is also the top keyword in its negative Steam reviews (24%). One ex-government reviewer wrote that it "just feels too much like doing work" (user review, forum-tier, rec 50548041, [Steam](https://steamcommunity.com/app/239030/reviews/)). Many of the most-upvoted "negative" reviews are actually jokes in the game's voice ("You are under arrest for looking at negative reviews... Glory to Arstotzka"), a sign of how strongly the tone sticks (user reviews, forum-tier, recs 54509259, 140194291).

**That's Not My Neighbor**
- Structure: you are a 1955 apartment doorman who checks residents' documents and appearance for doppelgangers. The original is free on itch.io and a "2.0" remake costs $2.99 on Steam. Sessions average about 30 minutes, and there is a colour-blind-friendly setting ([itch.io](https://nachogames.itch.io/thats-not-my-neighbor)).
- The resident and doppelganger designs were praised as "simple yet incredibly evocative" (search excerpt from a reviewer quoted in the [Metacritic listing](https://www.metacritic.com/game/thats-not-my-neighbor/) results. I did not directly verify which outlet said it).
- Top Steam complaints (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/3431040/reviews/)):
  - The Steam remake regressed from the itch version: resident descriptions were removed ("rushed and empty", rec 190222260) and the HUD and buttons got worse (rec 191505596).
  - The campaign is "nothing more [than] just five days in a row with very little lore sprinkled in" (rec 190072130).
  - A fairness problem: characters "can now be missing hats and different paperwork", but single residents "have no roommates to verify these missing items". In other words, some tells cannot be checked on screen (rec 190140978).

**Not Tonight**
- Structure: a bouncer checks ID for age, validity, contraband and photo match. More restrictions are added over the game (nationality, clothing, guest lists, tickets). A social-credit score gates work, and a score of zero means deportation. The story runs Jan–Dec 2018 and ends in a televised hearing whose outcome depends on your choices ([Wikipedia](https://en.wikipedia.org/wiki/Not_Tonight_(video_game))).
- Critic praise: art, soundtrack and "genuinely witty characters". Criticism: "unfair gameplay aspects" and difficulty that "can be artificially difficult at times" (search summary of [Wccftech](https://wccftech.com/review/not-tonight-review-bouncer-in-brexit-britain/) and [GameLuster](https://gameluster.com/review-not-tonight-no-really-lets-not-tonight/)). Trusted Reviews: "the experience is slightly diminished by the transplant" of the Papers, Please formula ([Wikipedia](https://en.wikipedia.org/wiki/Not_Tonight_(video_game))).
- The most-upvoted negative Steam review (426 votes) says the game has no colour-blind mode even though it requires "distinguish[ing] colors on a time crunch", which made it "unplayable" (user review, forum-tier, rec 44260321).
- Other top complaints: a railroaded story where siding with the government "just ends the game with a boring text" (recs 48319457, 44276213), and "costs less than half the price of this game" compared with Papers, Please (rec 44273778) ([Steam](https://steamcommunity.com/app/733790/reviews/)).

**Contraband Police**
- Praise: the core checkpoint work is "fun and extremely addictive", and "each chapter introduces new guidelines to follow and new rules to check for" ([KeenGamer via search](https://www.keengamer.com/articles/reviews/pc-reviews/contraband-police-review-searching-for-answers/)). Criticism: the gunplay is "uninspired and clunky" ([Gaming Nexus via search](https://www.gamingnexus.com/Article/16306/Contraband-Police/)).
- Top negative Steam reviews ask the game to "focus solely on the checkpoint", because driving, chases and gunplay are mediocre (254 votes, rec 135905579; rec 137305763). There is "no real pressure to churn through new arrivals... Pay is based on perfect reviews, not numbers of processed", so you can UV-light everything (rec 145086617). One reviewer called 80% of the game "waiting" (rec 190882217) (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/756800/reviews/)).

**Mind Scanners**
- Escapist (Will Cruz, 28 May 2021): "almost every day feels the same"; the story "feels empty and lacks proper escalation"; "my decisions had no actual consequences"; "feels like an inferior version of Papers, Please" ([Escapist](https://www.escapistmagazine.com/mind-scanners-review-in-3-minutes/)). Slant Magazine was positive, calling it "engrossing" ([Slant via search](https://www.slantmagazine.com/games/mind-scanners-review/)).
- Top negative Steam reviews: choices have "effectively zero nuance", since every action is either for the government or for the resistance (319 votes, rec 95031717). Minigame instructions are "vague", and the "time and maintenance mechanics... are too intense" (rec 92329803). "The aesthetic and concept are the highlights of the game" but the core loop "isn't enough" (rec 169555812) (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/1389550/reviews/)).

**Beholder**
- GameSpot 5/10: "held back by repetition and an unexciting script". Eurogamer 8/10 praised the setting plus "the need to make difficult decisions". Critics also praised the art, the music and multiple endings. Console ports scored lower (Switch 58) ([Wikipedia](https://en.wikipedia.org/wiki/Beholder_(video_game))).
- Top negative Steam reviews (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/475550/reviews/)):
  - The game "has issues following its own rules": camera footage of a tenant cleaning a gun doesn't count as evidence of the illegal gun (rec 78088203).
  - "Every quest has a time limit" (rec 45877841).
  - Completionists must "either follow a walkthrough or be psychic" (rec 45487223).
- Beholder 3 (another studio) fell to Mixed (64.5%). "Bug" terms appear in 47.5% of its negative reviews (my analysis).

**Headliner: NoviNews**
- OpenCritic: 74 average, only 48% recommend. God is a Geek: "lack of depth means you'll get little from playing it through a second time". PlayStation Universe: "After a few repeat plays, you'll have had enough." GamingTrend: "each part of the game is hindered by something else that can make getting through it a bit tedious" ([OpenCritic](https://opencritic.com/game/7872/headliner-novinews)).
- Steam: one blind playthrough takes about 1.5 hours and the game is "intended to be replayed", but the loop doesn't reward replays (rec 83255185). Several top negatives accuse it of partisan messaging, e.g. that choosing "support the government" leads to the bad outcomes (recs 45866200, 49986203) (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/918820/reviews/)).

**No, I'm Not a Human**
- Metacritic 76 from 10 critics:
  - Adventure Game Hotspot (80): a "masterclass in suspense", but "the magic is lost when trying to unearth specific outcomes".
  - GamingTrend (68): "makes for an excellent demo" but "fails to capitalize on what's established in its opening hour".
  - Game8 (70): "testing restrictions are frustrating and its bugs are noticeable".
  - Final Weapon (80): "save system and repetition can frustrate".
  - Movies Games and Tech (60): "Good ideas don't always make good games."
  ([Metacritic](https://www.metacritic.com/game/no-im-not-a-human/))
- Top negative Steam reviews (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/3180070/reviews/)):
  - "Excellent Experience, Terrible Game... Zero Replay Value" (841 votes, rec 205102916).
  - "a glorified minesweeper game with very specific paths for weird endings", and "the final version is worse than the demo" (rec 206733281).
  - "frustratingly arbitrary mechanics... You're not really making any decisions at the door" (rec 205228179).
  - "short duration and weak endings" (rec 205458237).
  - Positive counterpoint: "The feeling you get when you're 75% sure your favourite guest is a freaky visitor is dreadful and engaging" (rec 215480685).
- "Ending" appears in 34% of its English negative reviews, versus 4.7% for Papers, Please (my analysis).

**Quarantine Zone: The Last Check**
- Metacritic 68, OpenCritic 41% recommend. Eurogamer and GameStar praised the "quickly engaging gameplay concept" that "remains motivating" as new tools and symptoms unlock. Critics also said the release version "still contained many graphical and gameplay bugs". PC Gamer gave 60/100 for underdeveloped base management. Demo features were cut, e.g. supply-cart handling reduced to interface clicks ([Wikipedia](https://en.wikipedia.org/wiki/Quarantine_Zone:_The_Last_Check)).
- Top negative Steam reviews (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/3419520/reviews/)):
  - The top review (749 votes, rec 216704795) says "please stop adding meme references and twitch streamers. Absolutely horrible for immersion... constantly sabotages itself by trying to be funny."
  - "The in-game handbook misled me". Pale-skin symptoms are shown under "blown out lighting" while pale people in the game look purple, and the contraband examples confused the reviewer (rec 219679853).
  - The endless mode is "insanely repetitive" and the campaign is "over in a blink" (rec 216791094).
  - The drone mode "gets in the way" (rec 216945171).

**Death and Taxes**
- Top negative Steam reviews (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/1166290/reviews/)):
  - "You'll be doing the same thing every in-game day" (rec 107198990).
  - "no real challenge or stress... no timer or amount of money you need to raise" (rec 67053637).
  - The daily "specifics about who should die... are never brought up again after the second week" (rec 72028732).
  - The "good" ending reads as endorsing a "fascist/eugenicist way of thinking" (rec 91725475).
- "Tedious/boring" terms appear in 42.8% of its negative reviews, the highest in this set (my analysis).

**Lucas Pope's own "fine" inspection game: Mars After Midnight (Playdate, 2024)**
- It is a door-slot inspection game. Each day you pick a support-group type, a flyer location and a snack, then crank a peephole open and check aliens against audio and visual cues. Edge and GamesRadar+ praised its "creative alien designs and inventive silliness". Siliconera said sessions "can feel a bit tedious" in extended play ([Wikipedia](https://en.wikipedia.org/wiki/Mars_After_Midnight)).

### Inferences
- Steam percentage is not acclaim. Contraband Police (95%) and No, I'm Not a Human (93%) beat Beholder and Not Tonight on Steam, but their critic scores stay in the 70s. The acclaimed tier needs high user scores, high critic scores and awards together. Among desk games, only Papers, Please has all three. Streamer-friendly, atmosphere-first games win the first hour and sales. Critics and the loudest negative reviews punish what happens after that hour: endings, replays, escalation.
- The biggest complaint about imitators is not the concept. It is how the concept is carried out after the hook:
  - No, I'm Not a Human: demo better than the full game, weak endings.
  - That's Not My Neighbor: remake regressions, a thin 5-day campaign.
  - Quarantine Zone: bugs, a tone that breaks immersion.
  - Contraband Police: side activities that dilute the desk.
  - Mind Scanners and Death and Taxes: no escalation and no consequences.
- Fairness shows up again and again, and it matches this project's "one checkable clue" invariant:
  - That's Not My Neighbor: tells that can't be verified for residents who live alone.
  - Quarantine Zone: a handbook whose example images don't match what the game shows.
  - Beholder: evidence rules that contradict what is on screen.
  - Not Tonight: colour-only tells under time pressure, with no colour-blind option.
  Players forgive hard rules. They don't forgive a clue they could not have checked.
- Pressure needs tuning in both directions. "No real pressure" (Contraband Police) and "no timer or stress" (Death and Taxes) are complaints. So are "every quest has a time limit" (Beholder) and time mechanics that are "too intense" (Mind Scanners). Papers, Please ties pressure to money per entrant, so speed is a trade-off, not a countdown.
- Negative reviewers stopped at about half to one third of the playtime of positive reviewers (e.g. That's Not My Neighbor 1.8h vs 6.0h; Papers, Please 3.1h vs 11.2h). In most of these games, the verdict forms in the first hours.

### Gaps
- No Metacritic numbers found for That's Not My Neighbor (no critic reviews), Mind Scanners, Death and Taxes or Contraband Police beyond the 77 Steam shows. PC Gamer review pages (Not Tonight, Quarantine Zone) returned only site chrome, so their texts and scores (other than PC Gamer UK 60 for Quarantine Zone, via Wikipedia) are unverified.
- Could not get a primary Game Studies citation for the widely repeated claim that Papers, Please's "intentionally repetitious gameplay, drab visual design, and plodding soundtrack" are deliberate. It appeared only in a search-engine summary.
- No design postmortems found from the That's Not My Neighbor, No, I'm Not a Human or Quarantine Zone developers.
- Bounced: Not Tonight (Q3 2026) and Airport Contraband (Oct 2026) have no reviews yet on Steam.

---

## 2. Deduction/inspection games: what makes deduction feel fair and satisfying

### Takeaway
The acclaimed deduction games prevent guessing and reward progress at the same time:
- Obra Dinn confirms fates only in sets of three.
- Golden Idol shows when "two or fewer slots are incorrect".
- The Roottrees are Dead locks entries once several are complete.

They also keep the evidence clean. Pope "didn't want to hide things from the player", and Color Gray kept only what the solution or a deliberate misdirection needs. The "fine" games (Scene Investigators, Telling Lies with users, parts of Rise of the Golden Idol) are criticised for leaps of logic with no confirmation, for strict answer formats, or for narrative that drives the puzzles instead of fair clues.

### Cited Findings

**Scores (Steam data retrieved 2026-09-28)**

| Game | Steam | Critics | Source |
|---|---|---|---|
| Return of the Obra Dinn (18 Oct 2018) | Overwhelmingly Positive, 96.7%, 35,281 | MC PC 89, Switch 86 | [Steam](https://store.steampowered.com/app/653530/); [Wikipedia](https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn) |
| Her Story (24 Jun 2015) | Very Positive, 89.3%, 10,423 | MC PC 86, iOS 91 | [Steam](https://store.steampowered.com/app/368370/); [Wikipedia](https://en.wikipedia.org/wiki/Her_Story_(video_game)) |
| The Case of the Golden Idol (13 Oct 2022) | Overwhelmingly Positive, **97.8%**, 11,012 | MC PC 84, Switch 93 | [Steam](https://store.steampowered.com/app/1677770/); [Wikipedia](https://en.wikipedia.org/wiki/The_Case_of_the_Golden_Idol) |
| The Rise of the Golden Idol (12 Nov 2024) | Very Positive, 92.6%, 4,156 | OC 85 average, 92% recommend, 27 reviews | [Steam](https://store.steampowered.com/app/2716400/); [OpenCritic](https://opencritic.com/game/17640/the-rise-of-the-golden-idol) |
| The Roottrees are Dead (15 Jan 2025) | Overwhelmingly Positive, 96.4%, 10,211 | MC 86 | [Steam](https://store.steampowered.com/app/2754380/) |
| Chants of Sennaar (5 Sep 2023) | Overwhelmingly Positive, 98.2%, 35,015 | MC 86 | [Steam](https://store.steampowered.com/app/1931770/) |
| Strange Horticulture (21 Jan 2022) | Very Positive, 94.4%, 16,170 | MC 83 | [Steam](https://store.steampowered.com/app/1574580/) |
| Duck Detective: The Secret Salami (23 May 2024) | Very Positive, 94.9%, 6,718 | – | [Steam](https://store.steampowered.com/app/2637990/) |
| Scene Investigators (24 Oct 2023) | **Mostly Positive, 75.2%**, 1,038 | MC 76 | [Steam](https://store.steampowered.com/app/1159830/) |
| Telling Lies (23 Aug 2019) | **Mixed, 63.0%**, 1,325 | MC 84 | [Steam](https://store.steampowered.com/app/762830/) |
| IMMORTALITY (30 Aug 2022) | Very Positive, 83.5%, 2,006 | MC 87 | [Steam](https://store.steampowered.com/app/1350200/) |
| Shadows of Doubt (26 Sep 2024) | Very Positive, 82.1%, 17,829 | – | [Steam](https://store.steampowered.com/app/986130/) |

**Return of the Obra Dinn**
- Confirmation in threes: "correct fates are validated only in sets of three, with the exception of the last six fates... validated in sets of two". The logbook fills in basic information automatically and can be revised ([Wikipedia](https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn)). Requiring three correct answers at once blocks brute force because the answer space is so large ([search summary; e.g. Stories in Play](https://storiesinplay.com/2020/05/11/the-return-of-the-obra-dinn/)).
- Pope on legibility: outlined geometry kept the 1-bit art readable. "Everything is perfectly defined, basically, which was fine because I wasn't making a horror game, so I didn't want to hide things from the player." The core is "filling out a matrix of features for your list of identities". Design moved from *how* people died to *who* they were, which allowed environmental logic-puzzle clues ([Game Developer](https://www.gamedeveloper.com/design/for-lucas-pope-i-return-of-the-obra-dinn-i-was-a-bunch-of-appealing-design-problems)).
- Pope on the confirmation sound (8 Apr 2019): "It's a variation on the main theme of the game... it ended up working really well." He wanted something like Papers, Please's "printer feedback" again ([Adventure Gamers](https://adventuregamers.com/article/bafta-game-award-winner-lucas-pope-return-of-the-obra-dinn)).
- Critic praise: GameSpot called the logbook a "masterpiece of interconnected design". Game Informer said the "ultimate payoff fails to complement the thoughtful gameplay". Awards include the IGF Seumas McNally Grand Prize, TGA Best Art Direction, GDCA Best Narrative, and BAFTA Artistic Achievement and Game Design ([Wikipedia](https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn)).
- Top negative Steam reviews target friction, not the logic:
  - "The first time you enter each death-memory... you are stuck there for some short fixed period" (rec 54249731).
  - "It is so, SO tedious to try to go back through memories" (rec 74357571).
  - One reviewer couldn't finish "purely [because of] the... interface" (rec 55020402).
  (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/653530/reviews/))
  In my keyword count, UI terms appear in 20.2% of its negative reviews versus 2.7% of positive ones.

**The Case of the Golden Idol / The Rise of the Golden Idol**
- Fill-in-the-blank design: "Here is a bunch of phrases, where do you think they fit?" tested better than building full sentences. On guessing: "Given the opportunity, players will optimize the fun out of a game." Validating each slot individually would have frustrated players, so they added an indicator for when "two or fewer slots are incorrect". The scrolling text keeps "a lot of grammatical and semantic context" to balance "steady progress and getting stuck until an insight strikes". Scenes moved from "lived-in spaces with loads of tangential information" to "a very minimalistic approach where we would only fill in the contents that were either necessary to the solution or create interesting misdirections". Extra puzzles such as identifying the people in a scene "greatly improved the satisfaction". Each case was playtested "at least 5-7 times", with the developers watching silently ([Game Developer](https://www.gamedeveloper.com/design/case-of-the-golden-idol)).
- Critics: Eurogamer praised the "witty, observational writing". The Guardian (5/5) praised "genuinely new and inventive forms of play". PC Gamer (89) noted "occasionally brute-forcing". RPS and Adventure Gamers (3/5) flagged forced leaps and obscure clues. It won IGF Excellence in Design 2023 ([Wikipedia](https://en.wikipedia.org/wiki/The_Case_of_the_Golden_Idol)).
- Golden Idol Steam negatives (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/1677770/reviews/)):
  - Price vs length: "extremely short for $18", about 4 hours (rec 132028533).
  - A later "Redux" UI with multiple tabs replaced the always-visible word bar (rec 176786876).
  - Later scenarios degrade into "bruteforcing your way through dozens of stupid names" (rec 179153661).
  - Price/value terms appear in 20.2% of its negative reviews (my analysis).
- Rise of the Golden Idol: GameSpot 9/10 but "a decrease in murder lowers the stakes". Game Rant 9/10 noted "steep difficulty and potential game-halting bugs" ([OpenCritic](https://opencritic.com/game/17640/the-rise-of-the-golden-idol)).
- Rise Steam negatives (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/2716400/reviews/)):
  - "Many puzzles feel forced in to serve a convoluted narrative... a narrative first mindset feels like the wrong approach" (rec 185605475).
  - "I seriously spend more time formatting my answers than figuring out the actual p[uzzle]" (rec 179767734).
  - A German localization error made a correct answer grammatically impossible (rec 178946464).

**Her Story**
- Design: a desktop police database of 271 clips from 1994 interviews that you search by keyword. Barlow chose "intimate setting, dialogue and character interaction" and embraced ambiguity instead of a definitive resolution. Awards: Polygon GOTY, TGA Best Narrative and Best Performance, IGF Grand Prize. It sold over 100,000 copies by August 2015 ([Wikipedia](https://en.wikipedia.org/wiki/Her_Story_(video_game))).
- Steam negatives (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/368370/reviews/)):
  - "not much of a game... At least 80% of the clips are completely irrelevant" (rec 54666420).
  - "I had to look up how you finished the game, because it doesn't tell you anything" (rec 45145915).
  - "passive for the player... more like a chore than a puzzle" (rec 35171716).

**Mark Brown / Game Maker's Toolkit, "What Makes a Great Detective Game?" (11 Aug 2023)**
- He sorts detective games into three types: deduction (Obra Dinn is "the ultimate example"), contradiction (Ace Attorney, L.A. Noire, i.e. spot the difference in testimony) and investigation (Shadows of Doubt).
- How a game asks for the answer (the "tester") decides whether thinking feels earned. He warns against leading questions, multiple choice and UIs that show every connection. Obra Dinn's roughly 60 identity options make brute force impossible.
- He lists six assistance tools:
  - specific, non-vague questions
  - progressive complexity
  - multiple solution paths
  - step-by-step confirmations
  - notepads and bookmarking
  - optional hints behind a small friction barrier
- These keep the "electric Eureka-style moment" ([GMTK Substack](https://gmtk.substack.com/p/what-makes-a-great-detective-game)).

**The Roottrees are Dead**
- It combines Her Story-style search with Obra Dinn-style deduction. Confirmation follows Obra Dinn: "only when several entries are fully complete does the game confirm your assumptions and locks them" ([Thinky Games review, via search](https://thinkygames.com/reviews/the-roottrees-are-dead-review/); [Wikipedia](https://en.wikipedia.org/wiki/The_Roottrees_are_Dead)).

**The "fine" contrast: Scene Investigators (Steam 75.2%, MC 76)**
- Unfair/unclear/guess terms appear in 41.3% of its negative reviews, the highest of any game I measured. Compare Golden Idol 18.6% and Obra Dinn 24.0% (my analysis).
- Reviews say "you're just supposed to make a leap of logic... with absolutely no guarantee or indication that you're correct" (rec 225496094). It "requires extremely precise answers to progress" (rec 160601995). Others cite bugs and $25 pricing (rec 148946936) (user reviews, forum-tier, [Steam](https://steamcommunity.com/app/1159830/reviews/)).

### Inferences
- The acclaimed games all use *batched confirmation*: three fates, "two or fewer wrong", or locking several entries at once. Batching does two jobs. It makes guessing too expensive, and it still delivers a distinct, rewarding "you got it" beat, with a sound tied to the game's main musical theme. Games without a confirmation beat (Scene Investigators, Her Story's missing end signal) get "no indication that you're correct" complaints.
- In the best-regarded games, the evidence is deliberately sparse and sharp: Pope's "perfectly defined" 1-bit outlines, and Golden Idol cutting "tangential information". Complaints about the acclaimed games are almost never "the clue was unfair". They are about interface friction: memory navigation, UI tabs, answer formatting, localization. For a browser desk game this means the cost of looking at evidence (opening, comparing, going back) matters as much as whether the clue is fair.
- The drop from Golden Idol (97.8%) to Rise (92.6%) happened as puzzles came to "serve a convoluted narrative". Mechanics should drive the story, not the reverse. This matches Pope writing lore "to introduce a new mechanic".
- Telling Lies (MC 84, Steam 63%) and Her Story (MC 86, Steam 89%) show that critics may reward formal ambition that ordinary players find "passive" or "not much of a game". This is speculative: I found no source that explains Telling Lies' user score.

### Gaps
- Onboarding: the sources don't document tutorial specifics in detail. Golden Idol's tutorial structure and Obra Dinn's opening scene are not covered by what I fetched, beyond Brown's point about "progressive complexity".
- The Thinky Games feature on the Golden Idol developers returned 403, so no sequel-design quotes from it.
- I found no Lucas Pope primary quote that explains *why* he chose threes (only third-party explanations). His quote covers the sound, not the rule.

---

## 3. Cross-cutting patterns: what the acclaimed ones do that the "fine" ones don't

### Takeaway
The acclaimed inspection and deduction games (Papers, Please, Obra Dinn, Golden Idol, Her Story, Roottrees) share eight habits:
1. Instant, distinctive, diegetic feedback: the citation printer, the three-fates chord.
2. Evidence that can always be checked on screen.
3. Escalation delivered through new mechanics and story, not just more volume.
4. Discipline to stay at the desk.
5. Choices whose consequences show up in endings.
6. One consistent tone.
7. A strong, cheap-to-produce audiovisual identity.
8. Very few bugs.

The "fine" games usually fail one or two of these, not the core concept.

### Cited Findings
- **Feedback:** Pope calls the failure "printer feedback" "very important for the flow of the game" and reused the idea as Obra Dinn's confirmation chord ([Adventure Gamers](https://adventuregamers.com/article/bafta-game-award-winner-lucas-pope-return-of-the-obra-dinn)). Brown lists "step-by-step confirmations for small victories" as a core support tool ([GMTK](https://gmtk.substack.com/p/what-makes-a-great-detective-game)). Golden Idol's "two or fewer incorrect" indicator exists to reward approaching the solution ([Game Developer](https://www.gamedeveloper.com/design/case-of-the-golden-idol)).
- **Clue legibility and fairness:**
  - Pope: "I didn't want to hide things from the player" ([Game Developer](https://www.gamedeveloper.com/design/for-lucas-pope-i-return-of-the-obra-dinn-i-was-a-bunch-of-appealing-design-problems)).
  - Failures: That's Not My Neighbor's unverifiable missing items (rec 190140978, [Steam](https://steamcommunity.com/app/3431040/reviews/)); Quarantine Zone's misleading handbook (rec 219679853, [Steam](https://steamcommunity.com/app/3419520/reviews/)); Beholder's evidence rule (rec 78088203, [Steam](https://steamcommunity.com/app/475550/reviews/)); Not Tonight's colour-only tells without a colour-blind mode (rec 44260321, [Steam](https://steamcommunity.com/app/733790/reviews/)). All user reviews, forum-tier.
- **Escalation with story:** Pope wrote lore "to introduce a new mechanic" and paced 30 days to avoid "dry spots or unnecessary confusion" ([Game Developer](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)). Failures: Mind Scanners "lacks proper escalation" ([Escapist](https://www.escapistmagazine.com/mind-scanners-review-in-3-minutes/)). Death and Taxes' daily instructions are "never brought up again after the second week" (rec 72028732, forum-tier). Contraband Police is praised because "each chapter introduces new guidelines" ([KeenGamer via search](https://www.keengamer.com/articles/reviews/pc-reviews/contraband-police-review-searching-for-answers/)).
- **Staying at the desk:** Contraband Police players ask it to "focus solely on the checkpoint" (rec 135905579). Quarantine Zone's drone mode "gets in the way" (rec 216945171). A top No, I'm Not a Human review complains of "a lot of side content that has nothing to do with the supposedly main theme" (rec 206733281). All forum-tier.
- **Meaningful choices and endings:**
  - Papers, Please has 20 endings ([Wikipedia](https://en.wikipedia.org/wiki/Papers,_Please)), and only 4.7% of its negative reviews mention endings. No, I'm Not a Human: 34% (my analysis).
  - Mind Scanners: "my decisions had no actual consequences" ([Escapist](https://www.escapistmagazine.com/mind-scanners-review-in-3-minutes/)).
  - Not Tonight: siding with the government "just ends the game with a boring text" (rec 44276213, forum-tier).
  - Headliner: replays lack depth ([OpenCritic](https://opencritic.com/game/7872/headliner-novinews)).
- **Tone consistency:**
  - Quarantine Zone's most-upvoted negative review (749 votes) is about meme and streamer cameos that "sabotage" its tension (rec 216704795, forum-tier).
  - Headliner's and Death and Taxes' top negatives read the satire as partisan or morally off (recs 45866200, 49986203, 91725475, forum-tier).
  - Golden Idol's "witty, observational writing" and "Hogarthian... social commentary" were praised ([Wikipedia](https://en.wikipedia.org/wiki/The_Case_of_the_Golden_Idol)).
  - Pope: "keeping everything fictional really helped" ([Game Developer](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)).
- **Audiovisual identity:**
  - Obra Dinn won TGA Best Art Direction ([Wikipedia](https://en.wikipedia.org/wiki/Return_of_the_Obra_Dinn)).
  - Papers, Please's low-res, muted palette and ambient sound came from constraints that sped up production ([Game Developer](https://www.gamedeveloper.com/design/road-to-the-igf-lucas-pope-s-i-papers-please-i-)).
  - Even detractors of No, I'm Not a Human praise its atmosphere ("Excellent Experience, Terrible Game", rec 205102916). Mind Scanners' detractors call its aesthetic "the highlights of the game" (rec 169555812). Both forum-tier.
- **Bugs and polish:** "bug" terms appear in 1.8% of Papers, Please, 1.8% of Obra Dinn and 3.9% of Golden Idol negatives. Compare 22.2% for Contraband Police, 30.4% for Border Officer, 41.7% for Quarantine Zone and 47.5% for Beholder 3 (my analysis). Critics also flag bugs in Quarantine Zone ([Wikipedia](https://en.wikipedia.org/wiki/Quarantine_Zone:_The_Last_Check)) and No, I'm Not a Human ([Metacritic](https://www.metacritic.com/game/no-im-not-a-human/)).
- **Length and value:** short games draw "short for the price" complaints when priced at $15–25:
  - Golden Idol: 20.2% of negatives mention price.
  - Headliner: 19.6%.
  - Quarantine Zone: 20.8%.
  - (my analysis; rec 132028533)
  Papers, Please's 30 days and Her Story's single sitting are both acclaimed. Length alone does not decide the verdict.
- **Regressions and demo-vs-full:** No, I'm Not a Human "final version is worse than the demo" (rec 206733281). That's Not My Neighbor's Steam remake is "a hundred steps back from the web version" (rec 190072130). Quarantine Zone dropped demo features ([Wikipedia](https://en.wikipedia.org/wiki/Quarantine_Zone:_The_Last_Check)).

### Inferences
Applying these to *Proof of Humanity: Papers, Please* (inspect mode, citations, shift clock, court, bills, newspaper, recurring characters, 7-day week, endings):

1. **Make the citation and confirmation moments distinctive and musical.** An error citation or court ruling should work like Pope's printer or the three-fates chord: instant, diegetic, and tied to the game's main theme. This is the most-cited polish lever from the acclaimed games.
2. **Audit every invalid applicant for a checkable tell.** That's Not My Neighbor's "no roommate to verify" complaint and Quarantine Zone's misleading handbook images are exactly what the project's "one checkable clue" invariant prevents. The rulebook's example art must look exactly like what appears on the desk. Don't make colour the only difference between valid and invalid; Not Tonight's top complaint is colour-blindness under a timer.
3. **Each of the 7 days should add a rule and a story beat together**, as Pope wrote lore "to introduce a new mechanic". A rule should not be introduced and then dropped (the Death and Taxes complaint). Seven days is short enough to avoid Mind Scanners' "every day feels the same" if each day changes the check.
4. **Keep court, bills and newspaper in service of the desk.** They should reflect the player's desk decisions back to them (consequence), not become separate minigames. Contraband Police's driving and Quarantine Zone's drone mode were diluting side modes. Recurring characters should come back with consequences that trace to earlier decisions, since the "no consequences" complaints hit Mind Scanners and Not Tonight.
5. **Endings are where "fine" games lose players.** No, I'm Not a Human has the worst ending signal I measured (34% of negatives). Endings should visibly add up the week's choices (who was accepted or challenged, court outcomes, bills paid). Every choice set should end in something as considered as the "good" ending, never "a boring text".
6. **Deadpan satire must stay consistent and fictional.** Quarantine Zone's meme and streamer cameos and Headliner's perceived partisanship are cautionary. Pope credits fictionality for Papers, Please's reach. For a Kleros and Proof of Humanity satire, this argues for jokes that come from the bureaucracy itself, not from references to real people or memes.
7. **Tune the shift clock to real trade-offs, not panic.** Contraband Police was criticised for too little pressure; Beholder and Mind Scanners for too much. Pay per correct applicant against citations for mistakes, as Papers, Please does, makes speed a choice.
8. **Watch friction in inspect mode.** Obra Dinn's and Rise's complaints are about navigation, answer formatting and UI tabs, not about logic. Keep evidence comparison fast and the rulebook visible, and let the player go back freely.
9. **Polish over features.** Bug complaints separate the acclaimed games (about 2–4% of negatives) from the merely fine ones (20–48%). A small, bug-free 7-day game fits the acclaimed pattern better than a longer, buggier one.
10. **The first 1–3 hours decide the verdict.** Negative reviewers' median playtime is 1.8–4h for most titles. The first day or two must already show the week's hook: escalation, the newspaper reflecting your choices, a recurring character returning.

### Gaps
- The keyword analysis finds co-occurrence, not sentiment. A human-coded sample would sharpen the percentages.
- There is no direct evidence on browser or free-to-play inspection games (e.g. the itch.io That's Not My Neighbor at 4.7/5 from 1,617 ratings is the only free data point). Price-driven complaints probably don't apply to a free browser game, but I have no source that confirms it.
- I found no dedicated critical essay on "what Papers, Please imitators get wrong". The cross-cutting patterns above are my synthesis of individual reviews.
