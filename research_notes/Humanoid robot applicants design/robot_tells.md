# Robot tells: what visibly gives away a humanoid passing as human (real humanoids to 2026, and fiction)

Research date: 28 Sep 2026. Scope: tells a 40×48 px face (drawn at 2×) can show in three video frames (00:01 neutral, 00:03 speaking, 00:05 blinking) and a passport photo, fair under the game's Rule 0, and never based on human body variation. Fan-wiki claims are marked **[wiki]**. Search-summary-only claims (full page not read) are marked **[snippet]**.

Project context checked in `notes/game-design.md`. Rule 0 already reads "in every frame of the video, a human face, the same face ... Anything worn or carried does not count, for or against". Rule 6 (Living) already requires a blink. Nervous Nigel (valid) sweats. The Cardboard Cutout is caught by three identical frames, the Deepfake by ears that change between frames, and the Agent by a ✦ mark in every frame.

## 1. Real humanoids 2023–2026: what gives them away on camera?

### Takeaway
The face-bearing androids of 2024–2026 (AheadForm Origin M1, Columbia's EMO, EX-Robots, Geminoid/Erica, Ameca) already blink, glance and make micro-motions. The old tell "it never blinks" no longer holds. What still gives them away is motion that doesn't fit the face (lip sync, timing), cameras built into the eyes, and machinery wherever the skin stops (Sophia's clear skull, Ameca's deliberately grey face). The mass-market humanoids (Optimus, Figure, 1X NEO, Unitree) don't try to pass as human at all.

### Cited Findings
- **Mori (1970)**: the uncanny valley's classic example is a *prosthetic hand*: "When we realize the hand, which at first sight looked real, is in fact artificial, we experience an eerie sensation." Movement "amplif[ies] the peaks and valleys". A robot smile slowed to half speed "turns creepy". Mori recommends designers aim for "the first peak" (moderate human likeness), not full realism. The English translation is by Karl F. MacDorman and Norri Kageki (IEEE Robotics & Automation Magazine, June 2012) — [IEEE Spectrum](https://spectrum.ieee.org/the-uncanny-valley)
  - Design caution: the founding text of the field uses a human prosthesis as its example of "eerie", which is exactly the association this game must avoid.
- **Android Repliee Q2 (Ishiguro)** "can be mistaken for a human being with brief exposures, but ... an uncanny valley experience with more prolonged exposure" — [Saygin et al. 2012, PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC3324571/). "For a mesmerizing few seconds from several meters away, Repliee Q1expo was virtually indistinguishable from an ordinary woman in her 30s" — [Scientific American, "Android Science"](https://www.scientificamerican.com/article/android-science/) **[snippet]**
- **Motion mismatch is the measured giveaway.** In an fMRI study, viewers watched a human (human look, human motion), a robot (mechanical look and motion) and an android (human look, *mechanical* motion). Only the android produced distinctive responses, which the authors attribute to the mismatch between appearance and motion (predictive coding) — [Saygin et al., Social Cognitive and Affective Neuroscience 2012](https://academic.oup.com/scan/article/7/4/413/1738009); [ScienceDaily summary](https://www.sciencedaily.com/releases/2011/07/110714191539.htm)
- **Gaze as a measure.** Ishiguro's group used people's gaze aversion (breaking eye contact while thinking) to measure an android's human likeness, and people looked away from Repliee much as they do from people — [PubMed 18985174](https://pubmed.ncbi.nlm.nih.gov/18985174/); [MacDorman & Ishiguro 2006 PDF](http://www.macdorman.com/kfm/writings/pubs/MacDorman2006AndroidScience.pdf)
- **Geminoid HI-1** (Ishiguro's copy of himself) "is capable of performing breathing and blinking movements autonomously" — [ROBOTS guide](https://robotsguide.com/robots/geminoidhi1). Ishiguro's lab also studies blink *timing*: speaker and listener blinks synchronise with a delay, and human listeners synchronise with a robot speaker too (Tatsukawa et al., *Scientific Reports* 2016) **[snippet]**; lab page: [Ishiguro Lab Geminoid](https://eng.irl.sys.es.osaka-u.ac.jp/projects/geminoid)
- **AheadForm Origin M1** (head-only prototype; video posted 17 Sep 2025): up to 25 small brushless motors that "run quietly" produce blinks, twitches and glances. It has "cameras embedded in its pupils", plus built-in speakers and microphones. It is not commercially available — [Live Science](https://www.livescience.com/technology/robotics/chinese-company-develops-creepy-ultra-lifelike-robot-face-watch-it-blink-twitch-and-nod) **[snippet: the full article could not be retrieved]**; [AheadForm product page](https://www.aheadform.com/origin-m1)
- **Engineered Arts Ameca** has binocular eye-mounted cameras (tracks faces with cameras in its eyes) plus a chest camera — [Wikipedia](https://en.wikipedia.org/wiki/Ameca_(robot)). The team says it deliberately "pulled it backwards out of the uncanny valley" with a robotic, non-human look (grey face) — [Engadget](https://www.engadget.com/ameca-robot-shows-off-more-human-like-facial-expressions-093038139.html) **[snippet]**. A hands-on reviewer found its expressions convincing enough "that you wouldn't feel like you were merely talking to a clutter of cables, chips and servo motors", but "still some way to go before the 'uncanny valley' feeling is overcome" — [TechRadar](https://www.techradar.com/tech/i-saw-the-worlds-most-advanced-robot-and-its-uncanny)
- **Hanson Sophia** is shown with a transparent skull cap and her electronics exposed, "a conscious design choice to remind people it's a machine". Her Frubber (flesh-rubber) face "stops short of the crown of her head", and "screws and disks and red and white wires" are visible under a clear dome — [ROBOTS guide](https://robotsguide.com/robots/sophia); [The Rumpus](https://therumpus.net/2019/03/05/sophia-hanson-wants-to-believe/); [Frubber, Wikipedia](https://en.wikipedia.org/wiki/Frubber)
  - Real-world precedent for "machinery shows where the skin ends".
- **Columbia EMO (Hod Lipson), *Science Robotics*, Jan 2026**: 26 motors under flexible silicone skin. It learned lip motion from a mirror and from YouTube. The team reports difficulty with hard sounds like "B" and with puckered sounds like "W", so lip sync is still a live tell in 2026 — [Columbia Engineering](https://www.engineering.columbia.edu/about/news/robot-learns-lip-sync); [Science Robotics paper](https://www.science.org/doi/10.1126/scirobotics.adx3017); [ScienceDaily](https://www.sciencedaily.com/releases/2026/01/260116035308.htm)
- **University of Tokyo "living skin" face (Takeuchi lab, *Cell Reports Physical Science*, 25 Jun 2024)**: cultured skin is held on with "perforation-type anchors", gel fixed inside V-shaped holes through the robot face, inspired by skin ligaments — [U-Tokyo press release](https://www.u-tokyo.ac.jp/focus/en/press/z0508_00360.html); [ScienceDaily](https://www.sciencedaily.com/releases/2024/06/240625205041.htm)
- **EX-Robots (Dalian, China)** builds silicone-skinned humanoids with small motors in the head for expressions. Neck-length silicone masks are made separately. Each robot takes 2–4 weeks to build and costs about 1.5–2 million yuan (~$280k) — [VOA Learning English](https://learningenglish.voanews.com/a/chinese-company-develops-robots-with-facial-expressions/7654548.html) (June 2024)
  - The face is a separate mask fitted over a head, so a real seam exists somewhere (neck line, hairline).
- **1X NEO**: 1X reportedly identified uncanny-valley triggers "from the shape of the head to the way the feet move" — search result of unclear origin **[snippet]**; see [1X Technologies, Wikipedia](https://en.wikipedia.org/wiki/1X_Technologies)

### Inferences
- In 2026 a lifelike android at a registry window would blink, glance and move its lips. What gives it away is (a) cameras in the eyes, (b) lip shapes that don't match sounds, (c) timing (too regular, too slow) and (d) machinery wherever the silicone ends. Only (d) and, just barely, (a) can be drawn in a 40×48 still.
- Lip-sync and timing tells are real but cannot be checked in three stills, and they overlap with human speech and facial-movement differences. They are not usable as evidence.
- Real face robots are silicone skins over motor arrays, so a gap in the skin would show motors or boards. (updated 29 Sep 2026) The game's tell builds on (a) instead, without drawing the lens: a unit's eyes are cameras, and when its lids shut it lights a lamp between its brows that a camera sees and people don't. That lamp is the design's own; this research read no source on it.
- A "whirring servo" sound tell is outdated: AheadForm's motors "run quietly". It is also audio, and the evidence here is visual.

### Gaps
- No primary source was found on what exactly gives away Erica or Geminoid F up close (seam placement, neck, hands). This session read no hands-on reviews of them.
- Not researched (budget): Ai-Da, Clone Robotics (Protoclone), Unitree, Tesla Optimus, Figure 03 face designs. From general knowledge, Optimus, Figure and Unitree humanoids have no human face. That is unverified here, and irrelevant to passing-as-human anyway.
- No teardown source on where EX-Robots' or AheadForm's skin seams actually sit.
- The Live Science article on Origin M1 could not be fetched in full. The pupil-camera claim rests on the search snippet and the product page listing.

## 2. Fiction's visual signifiers: which are iconic, which subtle, which readable in tiny pixel art?

### Takeaway
Fiction has trained audiences to read androids by: the eyes (Blade Runner's eye shine, Humans' green eyes, the Terminator's red optic, A.I.'s unblinking David), a non-human fluid (Alien's milky "sweat"), a legal marker (Detroit's temple LED), and damage that opens the skin onto machinery (Terminator, Ex Machina's mesh, The Creator's hole through the head). The iconic tells are either marks you can remove (the LED) or looks (eye colour). (updated 29 Sep 2026) The device the game takes is the one Blade Runner's eye shine uses: a light the camera, and so the audience, sees and the people in the scene do not. It sits between the brows, not in the eyes (Q4). Battlestar Galactica shows what happens with no visual tell: paranoia, and a test nobody trusts.

### Cited Findings
- **Blade Runner (1982), eye shine.** It was produced in camera with a half-silvered glass at 45° in front of the lens and a small dimmable light behind the camera — [SlashFilm](https://www.slashfilm.com/907405/blade-runner-had-a-brilliantly-simple-solution-for-putting-the-shine-in-replicants-eyes/). Ridley Scott: "that kickback you saw from the replicants' retinas was a bit of a design flaw ... the eye doesn't only see a lot, the eye gives away a lot." Scott treats the glow as a stylistic device for the audience, not something characters see — [Alien Explorations blog](http://alienexplorations.blogspot.com/2023/07/bladerunner-glowing-eyes.html) (fan blog quoting Scott) **[snippet for the quote]**
- **Blade Runner 2049 (2017), serial number in the eye.** K removes Sapper Morton's eye, which carries his replicant serial number. Per prop-replica sources the number is visible only under UV light — [prop replica page](https://www.replicantprophunter.com/2018/03/blade-runner-2049-lapd-evidence-bag_14.html) (collector site); serial N8PSD32974 per [Off-world wiki](https://bladerunner.fandom.com/wiki/Sapper_Morton) **[wiki]**
- **Alien (1979), Ash.** Before attacking Ripley, "a bead of white sweat rolls down his head". Scott described the droplet of milk as "an alarm signal, a way of warning the audience". It is foreshadowed by Ash drinking milk and confirmed by white fluid when he is damaged — [Screen Rant](https://screenrant.com/alien-movie-ash-synthetic-android-identity-detail/); [CBR](https://www.cbr.com/alien-milk-white-android-blood-explained/); [Ash, Wikipedia](https://en.wikipedia.org/wiki/Ash_(Alien))
- **Detroit: Become Human (2018), temple LED.** Under the in-game American Androids Act, androids must show a LED on the right temple and a blue armband in public. Deviant Kara removes her LED and cuts her hair to pass as human, and "runaway deviant androids usually hide or remove it" — [Kara](https://detroit-become-human.fandom.com/wiki/Kara) and [American Androids Act](https://detroit-become-human.fandom.com/wiki/American_Androids_Act) **[wiki]**
  - In its own fiction the LED is a removable, legally required mark, closer to "worn" than to the body.
- **Westworld (HBO, 2016).** Hosts cannot harm living things. The pilot opens with a fly crawling across Dolores's eye while she doesn't react, and ends with her swatting one — [The Ringer](https://www.theringer.com/2022/06/27/westworld/westworld-season-4-premiere-flies-insects-michael-crichton); [The Original, Wikipedia](https://en.wikipedia.org/wiki/The_Original_(Westworld))
  - A behavioural tell: a host looks entirely human.
- **Ex Machina (2014), Ava.** Realistic skin only on the hands, face and ears. The rest of her body is a hexagonal mesh through which you see "glowing computer servers and grinding mechanical servos". Garland and Whitehurst (Double Negative) barred real robots as reference and drew on F1 suspension, bicycles and light aircraft — [Digital Trends](https://www.digitaltrends.com/movies/oscars-vfx-ex-machina/); [fxguide](https://www.fxguide.com/fxfeatured/ex-machina-the-making-of-ava/)
- **The Creator (2023), simulants.** Human faces with a hole right through the head. Seen from the front "she kind of looked humanoid, but then she'd turn and you'd see her profile and there was a big hole in her head" (production designer James Clyne). Rings inside the hole spin at different speeds with emotion, "like the mechanical version of a thought bubble" — [Inverse interview](https://www.inverse.com/entertainment/the-creator-production-designer-james-clyne-interview-star-wars-designs); [MPA "The Credits"](https://www.motionpictures.org/2023/09/the-creator-production-designer-james-clyne-fabricates-the-future/)
- **Humans (Channel 4/AMC, 2015–18).** Synths are distinguished by unnaturally coloured eyes (green once bonded, per the fan wiki) — [Synthetics](https://humans-on-amc.fandom.com/wiki/Synthetics) **[wiki]**. Their movement was built at a "synth school" run by choreographer Dan O'Neill. Gemma Chan: "It was about stripping back any physical tics you naturally incorporate into performance." One conscious synth, Karen Voss, passes undetected among humans — [Wikipedia](https://en.wikipedia.org/wiki/Humans_(TV_series))
- **Real Humans / Äkta människor (SVT, 2012).** Hubots have a USB-like port in the back of the neck or lower back, a power button under the left armpit, and a wall-plug cord there for recharging — [Humans on AMC wiki](https://humans-on-amc.fandom.com/wiki/Real_Humans) **[wiki]**
- **A.I. Artificial Intelligence (2001).** Haley Joel Osment chose not to blink as the android David. The few blinks that slipped through were removed in post at cost — [Cinema.com](https://www.cinema.com/news/item/4367/haley-joel-osment-stops-blinking.phtml); [Gold Derby 2026](https://www.goldderby.com/film/2026/haley-joel-osment-ai-artificial-intelligence-steven-spielberg-stanley-kubrick-ending/)
- **The Terminator (1984).** After damage the T-800 cuts out its eye, revealing the metal endoskeleton and red optic beneath the skin. The shot used a practical mechanical head — [scene clip](https://www.youtube.com/watch?v=MGx7v-aeD30); [Terminator (character concept), Wikipedia](https://en.wikipedia.org/wiki/Terminator_(character_concept)) **[snippet]**
- **Battlestar Galactica (2004).** Humanoid Cylons are "virtually indistinguishable from humans". Baltar's blood-based Cylon detector works, but he lies about Boomer's result, so the fleet believes it doesn't. The hunt for hidden Cylons produced "a climate of suspicion" — [Cylons, Wikipedia](https://en.wikipedia.org/wiki/Cylons); [Cylon detector](https://en.battlestarwiki.org/Cylon_detector) **[wiki]**

### Inferences
Readability at 40×48 (each face ≈ 80×96 screen px):

| Fiction tell | Iconic? | Subtle? | Readable at 40×48? | Fair as evidence? |
|---|---|---|---|---|
| A light only a camera sees, off the eyes (Blade Runner's eye shine is for the audience, not the characters; 2049's serial shows only under UV) (updated 29 Sep 2026) | Very, as eye shine | Yes, if it shows only in some frames | **Yes**: a white core in a violet ring, 8 to 36 px | **Yes**, if it is lit exactly in the frames with the eyes shut and never in the photo: the game's night lamp (see Q3) |
| Opened skin shows machinery (Terminator, Ex Machina) (updated 29 Sep 2026) | Very | — | — | **Not used**: nothing on camera makes the skin open |
| See-through hole in the head (The Creator) | Recent, strong | Yes, only when the head turns | Yes, if background pixels show inside the head outline | Yes, but keep it off the earlobe (gauges) |
| Temple LED (Detroit) | Very (gamers) | No, it's in every frame | Yes (2 px dot) | **No**: a sticker or earring looks the same, and in-fiction it is removable. Best used as a *valid decoy* (a human wearing one) |
| Eye glow / eye shine (Blade Runner) | Very | Yes | 1 px, barely | **No**: collides with ordinary flash red-eye and leukocoria (Q4) |
| Coloured eyes (Humans, Data) | Yes | No | Yes | **No**: a looks judgement; contacts and heterochromia |
| Serial in the eye (BR2049) | Moderate | Very | No (needs zoom) | Only with a zoom tool; ambiguous with tattoos |
| Milky sweat bead (Alien) | Cult | Yes, in one frame | Yes | **No**: collides with Nervous Nigel's sweat drops (a valid human) |
| Never blinks (A.I., Terminator) | Yes | Yes | Yes | **No**: that is Rule 6's check, and it overlaps with human conditions (Q4) |
| Ignores a fly (Westworld) | Moderate | Yes | Yes | **No**: behaviour, not machinery |
| Neck port or charging cable (Real Humans) | Low | Yes | Neck barely in frame | **No**: collides with medical tubes and lines |
| No tell at all (BSG) | — | — | — | Paranoia is the lesson: the player needs checkable evidence, not suspicion |

- Detroit's LED is a gift for a joke, not a tell. Robots trying to pass have already removed theirs, as Kara does, so the humans wearing stick-on LEDs are the ones who get challenged. This mirrors the existing Dave (raccoon head under his arm) under "Anything worn or carried does not count".
- The Creator's "front-on she looks human, then she turns and there is a hole" is exactly the owner's brief: fine at a glance, caught on close inspection of one frame.

### Gaps
- No Quantic Dream or David Cage interview was found explaining *why* the LED sits on the temple. The fandom wiki page on LED colours returned HTTP 402. Colour meanings (commonly described as blue/yellow/red for calm/processing/stress) are **unverified** here.
- Humans (TV): the claim that synth actors wore skin makeup and had their eye colour added digitally appeared only in search summaries (one from an unreliable AI encyclopedia) and is **unverified**.
- No production source was read for Westworld's host reveals beyond the fly, or for Ex Machina's Kyoko skin-peeling scene.

## 3. Which tells work as a difference between frames, and which read as fair evidence?

### Takeaway
The fairest tells change between frames and are driven by the face's own motion. (updated 29 Sep 2026) A light that comes on when the lids close is lit in the blink frame and dark in the others, and no sticker switches with the lids. Anything present in all three frames is indistinguishable from something worn, painted or medical. Anything about the eyes, the blink, the mouth interior, sweat or stillness collides with an existing rule, an existing character or a human condition.

### Cited Findings
- Motion that doesn't match a human appearance is what the brain flags. Appearance alone passes at a glance (Repliee "mistaken for a human being with brief exposures") — [Saygin et al. 2012](https://pmc.ncbi.nlm.nih.gov/articles/PMC3324571/)
  - This supports putting the evidence in a frame where the face *moves* (speaking or blinking), not in a static look.
- Real face robots are silicone skin over motor arrays (EMO: 26 motors under silicone skin; Origin M1: up to 25 motors; Sophia: 30+ motors under Frubber). The machinery sits directly under the skin that moves when speaking — [Columbia](https://www.engineering.columbia.edu/about/news/robot-learns-lip-sync); [Live Science](https://www.livescience.com/technology/robotics/chinese-company-develops-creepy-ultra-lifelike-robot-face-watch-it-blink-twitch-and-nod) **[snippet]**; [ROBOTS guide, Sophia](https://robotsguide.com/robots/sophia)
- The Creator's rings "spin at different speeds depending on what Alphie's feeling". Fiction already uses a mechanism that *changes* between moments as a readable signal — [Inverse](https://www.inverse.com/entertainment/the-creator-production-designer-james-clyne-interview-star-wars-designs)
- Real androids blink (Geminoid HI-1, Origin M1), so "doesn't blink" is fiction-era, not 2026-real — [ROBOTS guide](https://robotsguide.com/robots/geminoidhi1); [Live Science](https://www.livescience.com/technology/robotics/chinese-company-develops-creepy-ultra-lifelike-robot-face-watch-it-blink-twitch-and-nod) **[snippet]**
- Scott on the eye shine: "the eye doesn't only see a lot, the eye gives away a lot". Fiction's most iconic android tell sits in the eyes — [Alien Explorations](http://alienexplorations.blogspot.com/2023/07/bladerunner-glowing-eyes.html) **[snippet]**
  - Q4 shows why eyes are the riskiest place for a fair tell.

### Inferences
**Catalogue of candidate tells for 40×48 frames.** Recommended ones first. (updated 29 Sep 2026) The lamp's palette is reserved: a near-white core, a deep-violet ring and a lavender spill, used by no skin, hair, eye or clothing colour.

| # | Tell | Frame | Pixel recipe (40×48) | One-sentence rulebook reading | Fairness risk | Verdict |
|---|---|---|---|---|---|---|
| T1 | **Night lamp between the brows** (updated 29 Sep 2026) | Every frame with the eyes shut: 00:05, and 00:01 too on a second blink | A 2×2 white core in a deep-violet ring of 8 px on the face's mirror line, level with the brows; violet mixed into the 24 px of skin, inner brow and fringe around it. 8 px with no spill when small | "In every frame, eyes open or shut: the same human face, giving off no light." | Low: off the eyes, nose and mouth; a sticker, bindi or jewel would show with the eyes open too, and no applicant wears a point-like mark there | **Use** |
| T2 | **See-through head** (The Creator) | 00:03, with a 1–2 px head turn | 3×3 px of *background* colour inside the head outline above or behind the ear, ringed by grey | "You can see the wall through his head." | Low above the ear. **Never on the earlobe** (stretched-lobe gauges are a human body modification) | **Use**, with care on placement |
| T3 | **Lens behind the eyelid** | 00:05 | Closed lid line with 1 px cyan in the middle | "Her eyes shine through her eyelids." | High: eyeshadow and glitter on the lid are also visible only when closed. Too small | Avoid |
| T4 | **Camera lens in pupil** (Ameca, Origin M1) | all | Ring in the pupil | — | High: patterned contact lenses, ocular prostheses, cataracts. A constant look | Avoid |
| T5 | Temple LED (Detroit) | all | 2 px dot | — | High: stickers, earrings, dermal piercings, bindis and forehead jewellery look the same | **Valid decoy only** |
| T6 | Doesn't blink / half blink | 00:05 | Open eyes | — | High: that is Rule 6's check. Facial palsy, Parkinson's (Q4) | Avoid |
| T7 | White sweat bead (Alien) | one frame | 2 px drop | — | Collides with Nervous Nigel's sweat | Avoid |
| T8 | Grille, light or chip *inside the mouth* | 00:03 | Mouth interior | — | Braces, crowns and grills are metal in human mouths | Avoid |
| T9 | Too still (identical pixels outside mouth and eyes) | all | — | — | Already the Cardboard Cutout's signature; confusing | Avoid |
| T10 | Eye colour (Humans), perfect skin (silicone) | all | — | — | Looks judgement, and breaks "appearance never gives the answer" | Avoid |
| T11 | Cable or port at the neck (Real Humans) | all | — | — | Tracheostomy tubes, central lines, oxygen cannulas | Avoid |

- **Between-frame is the key discriminator.** Something in all three frames can always be a sticker, paint, jewellery or a medical device. (updated 29 Sep 2026) A light that is dark in the frames with the eyes open and lit in the frames with them shut can only be the face itself. This also follows the Deepfake's existing "something changes between frames" grammar while staying distinct from it: a Deepfake's face *becomes another face*, a robot's face *lights up when its eyes shut*.
- (updated 29 Sep 2026) **Rule 0 catches robots** with no new rule, and a plainer check line: "In every frame, eyes open or shut: the same human face, giving off no light." That parallels Gary ("a raccoon's face is in every frame").
- **Robots should blink.** If they don't, they break Rule 6 instead of, or as well as, Rule 0. That fits 2026 reality (real androids blink) and gives a dry joke: the robot's blink is perfect.
- **The passport photo should be flawless.** (updated 29 Sep 2026) A still can't show "lit only while the eyes are shut", so any tell in the photo would be a constant look. The photo is taken with the eyes open and matches the video's open-eye frames, so Rule 2 passes; that is how they pass at a glance. Fiction's eye glow in the photo is out (Q4: red-eye and leukocoria).
- (updated 29 Sep 2026) **Palette discipline makes a few pixels readable.** If the lamp's violet appears nowhere else on any face, a white point in a violet ring reads at 2×, and its spill onto the brows reads as light, not paint. No decoy wears a point-like mark between the brows (bindi, tikka, gem, sticker); anything worn there is a band, present in every frame, eyes open or shut.
- **Inspect-mode pairing:** (updated 29 Sep 2026) the player clicks a lit frame against a dark one (or against Rule 0). "In frame 3 the eyes are shut, and there is a light between the brows" is the checkable discrepancy.

### Gaps
- No user testing: (updated 29 Sep 2026) whether the lamp reads as a light, not a sticker or a glitch, at 2× for a new player is untested. It needs a Playwright screenshot pass with real sprites.
- Whether the three frames allow a head turn (T2) depends on the portrait pipeline (`src/gen/drawPortrait.ts`, not examined in this research).

## 4. Human look-alikes that must NOT count, and how to phrase the rule

### Takeaway
Everything fiction uses as an android tell has a human twin. Unblinking or half-closing eyes (facial palsy, Parkinson's), metal through the skin behind the ear (bone-anchored hearing aids), a disc on the side of the head (cochlear implant coils), glowing pupils in photos (leukocoria, red-eye), metal in the mouth (braces), odd eye colours (contacts, heterochromia). There are also worn or painted look-alikes: costumes, LED stickers, circuit face paint or tattoos, earpieces, AR glasses, phones. The rule must key on *a light of the face's own, lit exactly in the frames with the eyes shut* (updated 29 Sep 2026), and exclude anything worn, painted, carried, or unchanged across all three frames.

### Cited Findings
- **Incomplete eyelid closure (lagophthalmos)** is common in humans. Its main cause is facial nerve paralysis, up to 80% of it Bell's palsy, at 30–40 per 100,000 people a year in the US. It also follows eyelid surgery or trauma, comes with thyroid eye disease, and "an incomplete blink ... is seen in patients with Parkinson disease" — [StatPearls, NCBI](https://www.ncbi.nlm.nih.gov/books/NBK560661/?report=printable); [AAO EyeNet](https://www.aao.org/eyenet/article/lagophthalmos-evaluation-treatment)
  - "Eyes don't close fully when blinking" (suggested in the brief) is a human medical sign and **must not be a robot tell**.
- **Bone-anchored hearing aids**: a titanium implant in the skull behind the ear, with an abutment that "protrudes through the skin" and a sound processor clipped onto it — [Bone-anchored hearing aid, Wikipedia](https://en.wikipedia.org/wiki/Bone-anchored_hearing_aid); [Cleveland Clinic](https://my.clevelandclinic.org/health/treatments/14794-bone-anchored-auditory-implant)
  - Literal "metal showing through the skin" on a human head, so "metal through the skin" alone cannot be the rule.
- **Cochlear implants**: an external processor behind the ear, with a cable to a round coil "about the size of a half dollar" held to the side of the head by a magnet; off-ear processors sit above the ear — [American Academy of Audiology](https://www.audiology.org/consumers-and-patients/managing-hearing-loss/cochlear-implants/); [Mayo Clinic](https://www.mayoclinic.org/tests-procedures/cochlear-implants/multimedia/img-20482467)
- **Leukocoria**: flash photos normally give a red pupil reflex, but a white, grey or yellowish pupil in a flash photo is a sign of retinoblastoma, cataract, Coats' disease and more — [AAO](https://www.aao.org/eyenet/article/stepwise-approach-to-leukocoria); [Leukocoria, Wikipedia](https://en.wikipedia.org/wiki/Leukocoria); [Healio 2025](https://www.healio.com/news/pediatrics/20250320/qa-white-pupils-in-a-photo-can-be-a-sign-of-a-serious-condition-but-not-always)
  - Blade Runner's eye shine, drawn as a lit pupil in a photo, would mimic a medical sign.
- **Uncanny-valley research itself used a prosthetic hand as its "eerie" example** (Mori) — [IEEE Spectrum](https://spectrum.ieee.org/the-uncanny-valley)
  - The game should not inherit that framing: prosthetics and implants never count.
- **Worn or removable markers in fiction.** Detroit's LED is legally required and removable; Kara passes by taking it off — [Kara](https://detroit-become-human.fandom.com/wiki/Kara) **[wiki]**. Real Humans hubots' ports are covered by hair or clothing — [wiki](https://humans-on-amc.fandom.com/wiki/Real_Humans) **[wiki]**. Sophia's exposed skull is a deliberate design choice, not a failure to hide — [ROBOTS guide](https://robotsguide.com/robots/sophia)
- **Existing project rule (checked in `notes/game-design.md`)**: Rule 0 says "Anything worn or carried does not count, for or against", and the Dave precedent (a human with a raccoon mascot head under his arm) is valid.

### Inferences
**Human look-alikes that must never count (keep all of them valid):**
- *Worn*: robot costume or cosplay, a stick-on "temple LED" (Detroit cosplay is common), LED earrings, earpieces and headsets, AR or smart glasses, a metallic face mask pushed up on the head.
- *Painted*: circuit-board face paint, silver or chrome makeup, glitter, metallic eyeliner, circuit-board tattoos, eyelid tattoos.
- *Carried*: a phone or tablet held up showing a robot face (the phone is carried; the face behind it is still checked), a robot toy.
- *Body and medical (never a gag, never a tell)*: scars (including facelift and cleft-lip repair lines, which look like "seams"), vitiligo patches, birthmarks, piercings and dermal anchors, stretched-lobe gauges (see-through holes in the ear), bindis and forehead jewellery, braces, gold teeth and grills, hearing aids, cochlear implant coils, bone-anchored hearing aid abutments, glass or prosthetic eyes, heterochromia, coloured contacts, strabismus, facial palsy (asymmetric or incomplete blink), reduced blinking, tracheostomy tubes, nasal cannulas.

**Rulebook phrasing** (a clarifying sentence under Rule 0; the rulebook's wording is the owner's call, per AGENTS.md "Ask before changing ... the rulebook"):
- (updated 29 Sep 2026) As built, Rule 0's check reads **"In every frame, eyes open or shut: the same human face, giving off no light."** and its note **"Anything worn, painted or carried does not count, for or against: a costume robot's head is a costume, bulb and all."**
- Why this wording works:
  - "Eyes open or shut" sends the player to the blink frame without saying what is there.
  - "Giving off no light" names what a human face does not do, whatever it wears.
  - "Bulb and all" clears the one light a valid applicant carries.
  - "For or against" keeps the existing Rule 0 symmetry.
- Keep the ears out of every robot tell. Hearing aids, cochlear implants, BAHA, gauges, earrings and earpieces all live there, and the Deepfake already owns "the ears change".
- Suggested decoy cast (valid, satirical, in line with "the best jokes are the ridiculous applicant who is completely legit"): a cosplayer with a stick-on temple LED and circuit face paint in all three frames, and a nervous applicant holding up a phone that plays a robot video. Neither involves a body or medical feature.

### Gaps
- No design literature was found on writing fair "robot detection" rules in games (other than Papers, Please's general design, not researched here).
- No accessibility review or disability-community source on android tropes and prosthetics in games was found in this session. It is worth a dedicated search before shipping.
- (updated 29 Sep 2026) Whether players read the lamp as a light rather than a sticker, a bindi or a glitch at 2× scale is an empirical question for playtesting.
